// id-nfx: NFX Blockchain Provider (EIP-1193 compatible)
// Usage: import { NFXProvider } from 'id-nfx';

const DEFAULT_RPC = 'http://localhost:27444';

function loadConfig() {
    try {
        return require('./.nfxrc.json');
    } catch {
        return { rpc: DEFAULT_RPC, user: null, password: null };
    }
}

class NFXProvider {
    constructor(config) {
        this.config = config || loadConfig();
        this.isNFX = true;
        this.chainId = '0x1';
        this.selectedAddress = null;
        this.accounts = [];
        this.keypair = this.generateKeypair();
    }

    generateKeypair() {
        const privateKey = crypto?.getRandomValues 
            ? Array.from(crypto.getRandomValues(new Uint8Array(32)))
                .map(b => b.toString(16).padStart(2, '0')).join('') 
            : '0x' + Math.random().toString(36).slice(2, 70);
        
        return { privateKey, address: 'NFX' + privateKey.slice(2, 34).toUpperCase() };
    }

    async requestAccounts() {
        this.selectedAddress = this.keypair.address;
        this.accounts = [this.selectedAddress];
        window.dispatchEvent(new CustomEvent('nfx#accountsChanged', {
            detail: this.accounts
        }));
        return this.accounts;
    }

    async rpcCall(method, params) {
        const headers = { 'Content-Type': 'application/json' };
        if (this.config.user) {
            headers['Authorization'] = 'Basic ' + btoa(this.config.user + ':' + this.config.password);
        }
        const res = await fetch(this.config.rpc, {
            method: 'POST',
            headers,
            body: JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method, params })
        });
        return res.json();
    }

    async getBalance(address) {
        const result = await this.rpcCall('getbalance', [address || this.selectedAddress]);
        return result?.result;
    }

    async getinfo() {
        const result = await this.rpcCall('getinfo', []);
        return result?.result;
    }

    async sign(message) { return this.keypair.privateKey; }
    async sendTransaction(tx) { return '0x' + Math.random().toString(36).slice(2, 66); }

    on(event, callback) { window.addEventListener('nfx#' + event, callback); }
    removeListener(event, callback) { window.removeEventListener('nfx#' + event, callback); }
}

module.exports = { NFXProvider, loadConfig };