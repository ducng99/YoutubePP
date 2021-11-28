// ==UserScript==
// @name         Youtube++
// @namespace    maxhyt.youtubepp
// @version      1.1.3
// @description  Add small features to Youtube
// @author       Maxhyt
// @license      AGPL-3.0
// @homepage     https://github.com/ducng99/YoutubePP/
// @match        https://www.youtube.com/*
// @icon         https://icons.duckduckgo.com/ip2/youtube.com.ico
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    setInterval(PatchLinks, 500);
    let ytLinkRegex = new RegExp(/\/redirect.*q=(.*)/);

    function PatchLinks() {
        const link = document.body.querySelector('a[href^="https://www.youtube.com/redirect"]');

        if (link) {
            const matches = ytLinkRegex.exec(link.href);
            if (matches) {
                link.href = decodeURIComponent(matches[1]);
            }
        }
    }
    
    let isLoaded = false;
    let likeText, dislikeText;
    let dislikeTextDefault = '';
    let likeBarContainer, tooltip;

    window.addEventListener('yt-page-data-updated', UpdateCounter);
    
    (async () => {
        await WaitElementsLoaded("a.yt-simple-endpoint > yt-formatted-string.ytd-toggle-button-renderer");
        
        isLoaded = true;
        
        likeBarContainer = document.body.querySelector('ytd-sentiment-bar-renderer');
        tooltip = likeBarContainer.querySelector('#tooltip');

        likeBarContainer.querySelector('#container').addEventListener('mouseover', () => {
            tooltip.classList.remove('hidden');
        });
        likeBarContainer.querySelector('#container').addEventListener('mouseleave', () => {
            tooltip.classList.add('hidden');
        });
        
        const buttons = document.body.querySelectorAll('a.yt-simple-endpoint > yt-formatted-string.ytd-toggle-button-renderer');
        likeText = buttons[0];
        dislikeText = buttons[1];
        dislikeTextDefault = dislikeText.innerHTML;
    })();

    async function UpdateCounter() {
        while (!isLoaded) {
            await Sleep(100);
        }
        
        const data = document.querySelector("ytd-app")?.data;
        const contents = data?.response.contents.twoColumnWatchNextResults?.results.results.contents;
        
        if (data && contents) {
            let videoInfo;
            
            for (const content of contents) {
                if (content.videoPrimaryInfoRenderer) {
                    videoInfo = content.videoPrimaryInfoRenderer;
                    break;
                }
            }
            
            const likeCount = parseInt(videoInfo?.videoActions.menuRenderer.topLevelButtons[0].toggleButtonRenderer.accessibility.label.replace(/\D/g, ''));

            if (likeCount >= 0) {
                const r = data.playerResponse.videoDetails.averageRating;
                const dislikeCount = Math.round(likeCount * (5 - r) / (r - 1));
                
                ShowDislikes(likeCount, dislikeCount);
                return;
            }
        }
        
        dislikeText.innerHTML = dislikeTextDefault;
    }

    function ShowDislikes(likeCount, dislikeCount) {
        dislikeText.innerHTML = formatNumber(dislikeCount);

        if (likeBarContainer) {
            const likeBarWidth = likeText.parentNode.parentNode.getBoundingClientRect().width + dislikeText.parentNode.parentNode.getBoundingClientRect().width + 8;
            likeBarContainer.style.width = `${likeBarWidth}px`;
            likeBarContainer.removeAttribute('hidden');
            
            const likePerc = Math.floor(likeCount / (likeCount + dislikeCount) * 100);

            likeBarContainer.querySelector('#like-bar').style.width = `${likePerc}%`;
            tooltip.innerHTML = `${likeCount.toLocaleString()} / ${dislikeCount.toLocaleString()}`;
        }
    }

    function formatNumber(num) {
        if (num >= 1e9) {
            const tmp = num >= 1e10 ? Math.floor(num / 1e9) : (Math.floor(num / 1e8) / 10);
            return `${tmp.toLocaleString()}B`;
        }
        if (num >= 1e6) {
            const tmp = num >= 1e7 ? Math.floor(num / 1e6) : (Math.floor(num / 1e5) / 10);
            return `${tmp.toLocaleString()}M`;
        }
        if (num >= 1e3) {
            const tmp = num >= 1e4 ? Math.floor(num / 1e3) : (Math.floor(num / 1e2) / 10);
            return `${tmp.toLocaleString()}K`;
        }
        
        return num;
    }
    
    function WaitElementsLoaded(...elementsQueries) {
        return Promise.all(elementsQueries.map(ele => {
            return new Promise(async resolve => {
                while (!document.querySelector(ele)) {
                    await Sleep(100);
                }
                
                resolve();
            });
        }));
    }
    
    function Sleep(timeout) {
        return new Promise(resolve => {
            setTimeout(() => resolve(), timeout);
        });
    }
})();
