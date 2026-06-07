class NFXWallet {
    constructor() {
        this.address = null;
        this.balance = '0';
        this.tokens = [];
        this.nfts = [];
        this.islands = [];
    }

    async connect() {
        // Generate demo address for offline testing
        this.address = 'NFX' + Math.random().toString(36).slice(2, 38).toUpperCase();
        this.balance = (Math.random() * 1000).toFixed(2);
        
        // Demo data - works offline
        this.tokens = [
            { symbol: 'NFX', balance: '100.00', contract: '0x000...' },
            { symbol: 'USDT', balance: '50.00', contract: '0x123...' }
        ];
        
        this.nfts = [
            { name: 'Island #1', id: '1', image: 'nft1.png' },
            { name: 'NFToken A', id: '100', image: 'nft2.png' }
        ];
        
        this.islands = [
            { id: '1', score: 1250, lots: 8 },
            { id: '2', score: 890, lots: 4 }
        ];
        
        this.updateUI();
    }

    updateUI() {
        const addrEl = document.getElementById('address');
        const balEl = document.getElementById('balance');
        
        if (addrEl) addrEl.textContent = this.address || 'Not connected';
        if (balEl) balEl.textContent = this.balance + ' NFX';
        
        // Render tokens
        const tokensEl = document.getElementById('tokens-list');
        if (tokensEl) {
            tokensEl.innerHTML = this.tokens.map(t => 
                `<div class="token">${t.symbol}: ${t.balance}</div>`
            ).join('');
        }
        
        // Render NFTs
        const nftsEl = document.getElementById('nfts-list');
        if (nftsEl) {
            nftsEl.innerHTML = this.nfts.map(n => 
                `<div class="nft">${n.name} (#${n.id})</div>`
            ).join('');
        }
        
        // Render islands
        const islandsEl = document.getElementById('islands-list');
        if (islandsEl) {
            islandsEl.innerHTML = this.islands.map(i => 
                `<div class="island">Island ${i.id} - Score: ${i.score} - Lots: ${i.lots}</div>`
            ).join('');
        }
    }
}

const wallet = new NFXWallet();
wallet.connect();