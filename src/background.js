// Background service worker
chrome.runtime.onInstalled.addListener(() => {
    console.log('NFX Mask installed');
});

function generateMnemonic() {
    const words = ['abandon','ability','able','about','above','absent','absorb','accept','access','account','accident','accommodate'];
    const arr = new Uint32Array(12);
    for (let i = 0; i < 12; i++) arr[i] = Math.floor(Math.random() * 12);
    return Array.from(arr).map(i => words[i]).join(' ');
}

function generatePrivateKey() {
    const hex = Math.random().toString(16).replace('0.', '').padEnd(64, '0').slice(0, 64);
    return '0x' + hex;
}

async function storeWallet(data) {
    chrome.storage.local.set({ 
        wallet: btoa(data.mnemonic + ':' + data.privateKey), 
        pass: data.password 
    });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'connect') sendResponse({ connected: true });
    if (request.action === 'generateWallet') {
        sendResponse({ mnemonic: generateMnemonic(), privateKey: generatePrivateKey() });
    }
    if (request.action === 'saveWallet') {
        storeWallet(request.data);
        sendResponse({ success: true });
    }
    if (request.action === 'restoreWallet') {
        chrome.storage.local.get(['wallet', 'pass'], (data) => {
            if (data.wallet) {
                const decoded = atob(data.wallet);
                const [mnemonic, privateKey] = decoded.split(':');
                sendResponse({ mnemonic, privateKey });
            }
        });
        return true;
    }
});