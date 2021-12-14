// ==UserScript==
// @name         Youtube++
// @namespace    maxhyt.youtubepp
// @version      1.2
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
})();
