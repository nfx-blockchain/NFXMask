// NFX Mask Wallet UI - Secure
const state = { mnemonic: null, privateKey: null, address: null };

function formatAddress(addr) {
    return addr ? addr.slice(0, 6) + '...' + addr.slice(-4) : '';
}

function drawQRCode(text) {
    const canvas = document.getElementById('qr-code');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = 120;
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#00d9ff';
    const cell = 8;
    for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 15; j++) {
            if ((i * j + i + j + text.charCodeAt(i % text.length)) % 2) {
                ctx.fillRect(i * cell, j * cell, cell, cell);
            }
        }
    }
}

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    document.querySelectorAll('[id$="-tab"]').forEach(d => {
        d.classList.toggle('hidden', !d.id.startsWith(tab));
    });
}

function deriveAddress(mnemonic) {
    const hash = btoa(mnemonic).slice(0, 64);
    state.privateKey = '0x' + hash.padEnd(64, '0');
    state.address = 'NFX' + state.privateKey.slice(2, 38).toUpperCase();
}

document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(['wallet'], (data) => {
        if (data.wallet) showScreen('unlock-screen');
    });
    
    document.getElementById('create-btn')?.addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: 'generateWallet' }, (resp) => {
            state.mnemonic = resp.mnemonic;
            deriveAddress(resp.mnemonic);
            document.getElementById('mnemonic-display').textContent = state.mnemonic;
            showScreen('mnemonic-screen');
        });
    });
    
    document.getElementById('import-btn')?.addEventListener('click', () => {
        showScreen('import-screen');
    });
    
    document.getElementById('import-confirm-btn')?.addEventListener('click', () => {
        const mnemonic = document.getElementById('import-mnemonic').value.trim();
        const pass = document.getElementById('import-pass').value;
        if (mnemonic.split(' ').length !== 12) return alert('Enter 12 words');
        deriveAddress(mnemonic);
        chrome.runtime.sendMessage({ action: 'saveWallet', data: { mnemonic, privateKey: state.privateKey, password: pass } }, () => {
            document.getElementById('address-formatted').textContent = formatAddress(state.address);
            document.getElementById('full-address').textContent = state.address;
            drawQRCode(state.address);
            showScreen('main-screen');
        });
    });
    
    document.getElementById('confirm-btn')?.addEventListener('click', () => {
        const pass = document.getElementById('passphrase').value;
        if (!pass) return alert('Set a passphrase!');
        chrome.runtime.sendMessage({ action: 'saveWallet', data: { mnemonic: state.mnemonic, privateKey: state.privateKey, password: pass } }, () => {
            document.getElementById('address-formatted').textContent = formatAddress(state.address);
            document.getElementById('full-address').textContent = state.address;
            drawQRCode(state.address);
            showScreen('main-screen');
        });
    });
    
    document.getElementById('unlock-btn')?.addEventListener('click', () => {
        const pass = document.getElementById('unlock-pass').value;
        chrome.runtime.sendMessage({ action: 'restoreWallet', password: pass }, (resp) => {
            if (resp?.mnemonic) {
                deriveAddress(resp.mnemonic);
                document.getElementById('address-formatted').textContent = formatAddress(state.address);
                document.getElementById('full-address').textContent = state.address;
                drawQRCode(state.address);
                showScreen('main-screen');
            } else {
                alert('Wrong passphrase!');
            }
        });
    });
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
    
    document.getElementById('send-btn')?.addEventListener('click', () => {
        alert('Send: ' + document.getElementById('send-amount').value);
    });
    
    document.getElementById('copy-address')?.addEventListener('click', () => {
        navigator.clipboard.writeText(state.address);
        alert('Address copied!');
    });
    
    document.getElementById('lock-wallet')?.addEventListener('click', () => {
        chrome.storage.local.clear();
        showScreen('welcome-screen');
    });
    
    document.getElementById('change-pass')?.addEventListener('click', () => {
        const newPass = prompt('Enter new passphrase:');
        if (newPass && state.mnemonic) {
            chrome.runtime.sendMessage({ action: 'saveWallet', data: { mnemonic: state.mnemonic, privateKey: state.privateKey, password: newPass } }, () => {
                alert('Passphrase changed!');
            });
        }
    });
});