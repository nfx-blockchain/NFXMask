// Background service worker
chrome.runtime.onInstalled.addListener(() => {
    console.log('NFX Wallet installed');
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'connect') {
        // Handle connection
        sendResponse({ connected: true });
    }
});