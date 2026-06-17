// NFX Provider - injected into page context
(function() {
    const DEFAULT_RPC = 'http://194.163.175.135:27444';
    let provider;
    
    function initProvider() {
        if (window.nfx) return;
        provider = {
            isNFX: true,
            chainId: '0x1',
            selectedAddress: null,
            request: async ({ method }) => {
                if (method === 'eth_requestAccounts') {
                    const [address] = await chrome.runtime.sendMessage({ action: 'getAddress' });
                    provider.selectedAddress = address;
                    return [address];
                }
            }
        };
        window.nfx = provider;
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initProvider);
    } else {
        initProvider();
    }
})();