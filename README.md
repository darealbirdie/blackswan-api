# BlackSwan API

REST API for BlackSwan Protocol - Credit data endpoints for Amoy and Sepolia networks.

## Endpoints

```bash
# Health check
curl https://api.blackswanfinance.xyz/health

# Credit dashboard (default: Amoy)
curl https://api.blackswanfinance.xyz/v1/credit/0x4EEA76237a91880B1c8B7a1c740610fFC0306EE4

# Credit dashboard (Sepolia)
curl "https://api.blackswanfinance.xyz/v1/credit/0x4EEA76237a91880B1c8B7a1c740610fFC0306EE4?network=sepolia"

# APR only
curl https://api.blackswanfinance.xyz/v1/apr/0x4EEA76237a91880B1c8B7a1c740610fFC0306EE4

# Trust tier
curl https://api.blackswanfinance.xyz/v1/tier/0x4EEA76237a91880B1c8B7a1c740610fFC0306EE4

# Loan history
curl https://api.blackswanfinance.xyz/v1/history/0x4EEA76237a91880B1c8B7a1c740610fFC0306EE4

# Reputation
curl https://api.blackswanfinance.xyz/v1/reputation/0x4EEA76237a91880B1c8B7a1c740610fFC0306EE4
```

## Response Format

### `/v1/credit/:wallet`
```json
{
  "trustRatio": 7700,
  "trustTierScore": "C",
  "currentApr": 142,
  "totalBorrowedUsd": "99",
  "totalRepaidUsd": "99",
  "successfulLoans": 1,
  "defaults": 0
}
```

## Environment Variables

- `AMOY_RPC_URL` - Polygon Amoy RPC URL
- `SEPOLIA_RPC_URL` - Ethereum Sepolia RPC URL
- `NETWORK` - Default network (amoy/sepolia)

## Development

```bash
npm install
npm run dev
```

Server runs on `http://localhost:3001`