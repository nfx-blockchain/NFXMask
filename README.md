# NFXMask

Browser wallet estilo MetaMask para NFXBlockchain.

## Features
- Wallet HD (mnemonic)
- Tokens NFX-20
- NFTs NFX-721  
- Island Land holdings
- Staking dashboard
- RPC connection

## Install (Chrome/Brave/Edge)

1. `cd NFXMask`
2. Load unpacked em `chrome://extensions`
3. Select pasta `NFXMask/`

## Usage

Clique no ícone NFXMask para:
- Conectar wallet
- Ver balance NFX
- Listar tokens/NFTs/islands

## RPC Configuration

Configure em `.nfxrc.json`:
```json
{
  "rpc": "http://192.168.131.9:27444",
  "user": "test",
  "password": "test123"
}
```