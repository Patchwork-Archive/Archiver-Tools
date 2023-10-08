// ==UserScript==
// @name         YouTube Archiver
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Archive videos from YouTube
// @match        https://www.youtube.com/watch?v=*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';

    const API_URL = 'https://archive.pinapelz.moe';
    const X_AUTH_KEY = 'X-AUTHENTICATION';

    function getVideoId() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('v');
    }

    function showMessage(msg, isArchiveButton = false) {
        const msgDiv = document.createElement('div');
        msgDiv.style.position = 'fixed';
        msgDiv.style.bottom = '10px';
        msgDiv.style.left = '10px';
        msgDiv.style.padding = '12px';
        msgDiv.style.background = 'rgba(28,28,28,0.95)'; // Dark background
        msgDiv.style.color = '#e1e1e1'; // Light text
        msgDiv.style.borderRadius = '8px';
        msgDiv.style.boxShadow = '0px 0px 10px rgba(255,255,255,0.1)';
        msgDiv.style.zIndex = '9999';
        msgDiv.style.fontSize = '14px';
        msgDiv.id = 'archiveMessage';
        msgDiv.style.lineHeight = '1.4';
        msgDiv.innerHTML = msg;
        msgDiv.style.display = 'flex';
        msgDiv.style.alignItems = 'center';

        if (isArchiveButton) {
            const archiveBtn = document.createElement('button');
            archiveBtn.innerHTML = 'Archive';
            archiveBtn.style.marginLeft = '10px';
            archiveBtn.style.padding = '6px 12px';
            archiveBtn.style.borderRadius = '6px';
            archiveBtn.style.border = 'none';
            archiveBtn.style.cursor = 'pointer';
            archiveBtn.style.background = '#007BFF';
            archiveBtn.style.color = '#FFF';
            archiveBtn.style.fontSize = '14px';
            archiveBtn.style.lineHeight = '1';
            archiveBtn.style.transition = 'background 0.3s';
            archiveBtn.onmouseover = function() {
                this.style.background = '#0056b3';
            };
            archiveBtn.onmouseout = function() {
                this.style.background = '#007BFF';
            };
            archiveBtn.onclick = archiveVideo;
            msgDiv.appendChild(archiveBtn);
        }

        document.body.appendChild(msgDiv);
    }

    function archiveVideo() {
        const authToken = localStorage.getItem(X_AUTH_KEY);
        if (!authToken) {
            const newToken = prompt('Please provide your X-AUTHENTICATION token:');
            localStorage.setItem(X_AUTH_KEY, newToken);
        }

        const videoUrl = window.location.href;

        GM_xmlhttpRequest({
            method: 'POST',
            url: `${API_URL}/api/worker/queue`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-AUTHENTICATION': authToken || newToken
            },
            data: `url=${videoUrl}`,
            onload: function(response) {
                if (response.status === 200) {
                    showMessage('Video successfully added to the archive queue.');
                    setTimeout(hideMessage, 3000);
                } else {
                    showMessage('Failed to queue the video. Please try again.');
                }
            }
        });
    }

    function checkVideoStatus(videoId) {
        GM_xmlhttpRequest({
            method: 'GET',
            url: `${API_URL}/api/video/${videoId}`,
            onload: function(response) {
                const data = JSON.parse(response.responseText);
                if (data.error) {
                    showMessage('This video is not archived!', true);
                } else {
                    showMessage('This video is already archived.');
                }
            }
        });
    }

    function hideMessage() {
        const existingMessage = document.querySelector('#archiveMessage');
        if (existingMessage) {
            existingMessage.remove();
        }
    }

    checkVideoStatus(getVideoId());

})();
