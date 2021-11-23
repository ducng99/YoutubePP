// ==UserScript==
// @name         Youtube++
// @namespace    maxhyt.youtubepp
// @version      1.0.0.1
// @description  Add small features to Youtube
// @author       Maxhyt
// @match        https://www.youtube.com/*
// @icon         https://icons.duckduckgo.com/ip2/youtube.com.ico
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    
    setInterval(PatchLinks, 5000);
    setInterval(ShowDislikes, 2000);

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
    
    let lastVidID = '';
    
    async function ShowDislikes() {
        let match = /\/watch\?v=([a-zA-Z0-9-_]+)/.exec(window.location.href);
        let dislikeText = document.body.querySelectorAll('a.yt-simple-endpoint > yt-formatted-string.ytd-toggle-button-renderer')[1];
            
        let likeBarContainer = document.body.querySelector('ytd-sentiment-bar-renderer');
        likeBarContainer.removeAttribute('hidden');
        
        if (match && match[1] && lastVidID !== match[1]) {
            lastVidID = match[1];
            
            let res = await (await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${match[1]}&key=<GOOGLE_API_KEY>&part=statistics`)).json();
            let likeCount = parseInt(res.items[0].statistics.likeCount);
            let dislikeCount = parseInt(res.items[0].statistics.dislikeCount);
            dislikeText.innerHTML = formatNumber(dislikeCount);
            
            if (likeBarContainer) {
                let likePerc = Math.floor(likeCount / (likeCount + dislikeCount) * 100);
                
                likeBarContainer.querySelector('#like-bar').style.width = `${likePerc}%`;
                let tooltip = likeBarContainer.querySelector('#tooltip');
                tooltip.innerHTML = `${likeCount.toLocaleString("en-US")} / ${dislikeCount.toLocaleString("en-US")}`;
                
                likeBarContainer.querySelector('#container').addEventListener('mouseover', () => {
                    tooltip.classList.remove('hidden');
                });
                likeBarContainer.querySelector('#container').addEventListener('mouseleave', () => {
                    tooltip.classList.add('hidden');
                });
            }            
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
