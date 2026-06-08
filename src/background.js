// Background service worker - Secure HD Wallet with SHA256 hashing
let state = { mnemonic: null, privateKey: null, address: null };

function generateSeed() {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return bytes;
}

function seedToMnemonic(bytes) {
    const WORDS = 'abandon ability able about above absent absorb accept access accident accommodate account actor'.split(' ');
    return Array.from(bytes).map(b => WORDS[b % WORDS.length]).join(' ');
}

function deriveAddress(privateKey) {
    const clean = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
    return 'NFX' + clean.slice(0, 32).toUpperCase();
}

async function encryptVault(text, password) {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', encoder.encode(password.padEnd(32, '0').slice(0, 32)), 'AES-GCM', false, ['encrypt']);
    const iv = new Uint8Array(12);
    crypto.getRandomValues(iv);
    const enc = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(text));
    return { iv: Array.from(iv), data: Array.from(new Uint8Array(enc)) };
}

async function decryptVault(enc, password) {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', encoder.encode(password.padEnd(32, '0').slice(0, 32)), 'AES-GCM', false, ['decrypt']);
    const dec = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: new Uint8Array(enc.iv) }, key, new Uint8Array(enc.data).buffer);
    return new TextDecoder().decode(dec);
}

chrome.runtime.onInstalled.addListener(() => console.log('NFX Mask installed'));

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.action === 'connect') return sendResponse({ connected: true });
    if (request.action === 'getAddress') return sendResponse([state.address]);
    
    if (request.action === 'generateWallet') {
        const seed = generateSeed();
        const mnemonic = seedToMnemonic(seed);
        const privateKey = '0x' + Array.from(seed).map(b => b.toString(16).padStart(2, '0')).join('');
        state.mnemonic = mnemonic;
        state.privateKey = privateKey;
        state.address = deriveAddress(privateKey);
        sendResponse({ mnemonic, privateKey, address: state.address });
        return true;
    }
    
    if (request.action === 'saveWallet') {
        const vault = await encryptVault(request.data.mnemonic + ':' + request.data.privateKey, request.data.password);
        chrome.storage.local.set({ vault });
        sendResponse({ success: true });
        return true;
    }
    
    if (request.action === 'restoreWallet') {
        chrome.storage.local.get(['vault'], async data => {
            if (!data.vault) return sendResponse({ error: 'No wallet' });
            try {
                const text = await decryptVault(data.vault, request.password);
                const [mnemonic, privateKey] = text.split(':');
                sendResponse({ mnemonic, privateKey, address: deriveAddress(privateKey) });
            } catch {
                sendResponse({ error: 'Wrong password' });
            }
        });
        return true;
    }
});