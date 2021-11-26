// ==UserScript==
// @name         Youtube++
// @namespace    maxhyt.youtubepp
// @version      1.1.0
// @description  Add small features to Youtube
// @author       Maxhyt
// @match        https://www.youtube.com/*
// @icon         https://icons.duckduckgo.com/ip2/youtube.com.ico
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    setInterval(PatchLinks, 5000);

    function PatchLinks() {
        let links = document.body.querySelectorAll('a.yt-simple-endpoint.yt-formatted-string');
        let regex = new RegExp(/https:\/\/www\.youtube\.com\/redirect.*q=(.*)/);

        links = [...links].map(l => new Promise(resolve => {
            let matches = regex.exec(l.href);
            if (matches) {
                l.href = decodeURIComponent(matches[1]);
            }

            resolve();
        }));

        Promise.all(links);
    }

    let likeCount = -1;
    let dislikeCount = -1;

    window.addEventListener('yt-page-data-updated', UpdateCounter);

    UpdateCounter();
    function UpdateCounter() {
        const data = document.querySelector("ytd-app")?.data;
        if (data) {
            likeCount = parseInt(data.response.contents.twoColumnWatchNextResults.results.results.contents[0].videoPrimaryInfoRenderer.videoActions.menuRenderer.topLevelButtons[0].toggleButtonRenderer.accessibility.label.replace(/\D/g, ''));

            const r = data.playerResponse.videoDetails.averageRating;
            dislikeCount = Math.round(likeCount * (5 - r) / (r - 1));
            ShowDislikes();
        }
    }

    function ShowDislikes() {
        const likeText = document.body.querySelectorAll('a.yt-simple-endpoint > yt-formatted-string.ytd-toggle-button-renderer')[0];
        const dislikeText = document.body.querySelectorAll('a.yt-simple-endpoint > yt-formatted-string.ytd-toggle-button-renderer')[1];
        const dislikeTextDefault = dislikeText?.innerHTML ?? "Dislike";

        const likeBarContainer = document.body.querySelector('ytd-sentiment-bar-renderer');

        if (likeCount > -1 && dislikeCount > -1) {
            dislikeText.innerHTML = formatNumber(dislikeCount);
            likeBarContainer.removeAttribute('hidden');

            const likeBarWidth = likeText.parentNode.parentNode.getBoundingClientRect().width + dislikeText.parentNode.parentNode.getBoundingClientRect().width + 8;
            likeBarContainer.style.width = `${likeBarWidth}px`;

            if (likeBarContainer) {
                const likePerc = Math.floor(likeCount / (likeCount + dislikeCount) * 100);

                likeBarContainer.querySelector('#like-bar').style.width = `${likePerc}%`;
                const tooltip = likeBarContainer.querySelector('#tooltip');
                tooltip.innerHTML = `${likeCount.toLocaleString()} / ${dislikeCount.toLocaleString()}`;

                likeBarContainer.querySelector('#container').addEventListener('mouseover', () => {
                    tooltip.classList.remove('hidden');
                });
                likeBarContainer.querySelector('#container').addEventListener('mouseleave', () => {
                    tooltip.classList.add('hidden');
                });
            }
        }
        else {
            dislikeText.innerHTML = dislikeTextDefault;
        }
    }

    function formatNumber(num) {
        if (num >= 1000000000) {
            let tmp = Math.floor(num / 100000000) / 10;
            return `${tmp}B`;
        }
        else if (num >= 1000000) {
            let tmp = Math.floor(num / 100000) / 10;
            return `${tmp}M`;
        }
        else if (num >= 1000) {
            let tmp = Math.floor(num / 1000);
            return `${tmp}K`;
        }
        else {
            return num;
        }
    }
})();
