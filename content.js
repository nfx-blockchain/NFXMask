// NFX Provider Injection Script
// Injeta window.nfx para conexão de dApps

(function() {
    if (window.nfx) return; // Already injected

    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('nfx-provider.js');
    script.onload = () => script.remove();
    (document.head || document.documentElement).appendChild(script);
})();

// Listen for connection requests
window.addEventListener('nfx#connect', (event) => {
    chrome.runtime.sendMessage({ action: 'connect', data: event.detail });
});