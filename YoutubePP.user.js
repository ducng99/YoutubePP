// ==UserScript==
// @name         Youtube++
// @namespace    maxhyt.youtubepp
// @version      1.3.3
// @description  Add small features to Youtube
// @author       Maxhyt
// @license      AGPL-3.0
// @homepage     https://github.com/ducng99/YoutubePP
// @match        https://www.youtube.com/*
// @icon         https://icons.duckduckgo.com/ip2/youtube.com.ico
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // BEGIN - PATCH LINKS

    setInterval(PatchLinks, 500);

    function PatchLinks() {
        const link = document.body.querySelector('a[href^="https://www.youtube.com/redirect"]');

        if (link) {
            link.href = decodeURIComponent(new URL(link.href).searchParams.get('q'));
        }
    }

    // END - PATCH LINKS

    // BEGIN - DOWNLOAD POSTS' PHOTO

    setInterval(() => {
        const posts = [...document.body.querySelectorAll('ytd-backstage-post-thread-renderer #post')];

        posts.forEach(post => {
            const imgContainers = [...post.__shady_native_querySelectorAll('#image-container')];

            imgContainers.forEach(imgContainer => {
                const imgElement = imgContainer?.__shady_native_querySelector('#img');

                if (imgContainer && !imgContainer.__shady_native_querySelector('.ytpp_download') && imgElement?.src) {
                    const iconContainer = imgContainer.__shady_native_querySelector('#image-icon-container');
                    iconContainer.__shady_native_removeAttribute('hidden');
                    iconContainer.style.background = 'transparent';
                    iconContainer.style.right = '25px';
                    iconContainer.style.cursor = 'pointer';

                    iconContainer.__shady_native_querySelector('yt-icon').__shady_native_innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="style-scope yt-icon ytpp_download bi bi-cloud-arrow-down-fill" viewBox="0 0 16 16">
  <path d="M8 2a5.53 5.53 0 0 0-3.594 1.342c-.766.66-1.321 1.52-1.464 2.383C1.266 6.095 0 7.555 0 9.318 0 11.366 1.708 13 3.781 13h8.906C14.502 13 16 11.57 16 9.773c0-1.636-1.242-2.969-2.834-3.194C12.923 3.999 10.69 2 8 2zm2.354 6.854-2 2a.5.5 0 0 1-.708 0l-2-2a.5.5 0 1 1 .708-.708L7.5 9.293V5.5a.5.5 0 0 1 1 0v3.793l1.146-1.147a.5.5 0 0 1 .708.708z"/>
</svg>`;

                    iconContainer.__shady_native_addEventListener('click', DownloadPostsPhoto);
                    iconContainer.imgSrc = imgElement.src;
                }
            });
        });
    }, 1000);

    function DownloadPostsPhoto(event) {
        event.preventDefault();
        event.stopPropagation();

        let imgSrc = event.currentTarget.imgSrc;
        if (imgSrc) {
            console.log(imgSrc);
            let src = imgSrc.replace(/=s\d{3,4}.*-nd-v1/, '=s9999-nd-v0');

            window.open(src, '_blank');
        }
        else {
            alert('Link not found!');
        }
    }

    // END - DOWNLOAD POSTS' PHOTO

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