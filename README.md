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

# Soul check (has SBT)
curl https://api.blackswanfinance.xyz/v1/soul/0x4EEA76237a91880B1c8B7a1c740610fFC0306EE4
```

## Response Format

### `/v1/credit/:wallet`
```json
{
  "trustRatio": 7700,
  "trustTierScore": "A",
  "tier": 0,
  "currentApr": 142,
  "totalBorrowedUsd": "99",
  "totalRepaidUsd": "99",
  "principalRepaidUsd": "99",
  "interestRepaidUsd": "0",
  "interestRepaidUsdFormatted": "$0",
  "successfulLoans": 1,
  "defaults": 0,
  "totalBorrowedUsdFormatted": "$99",
  "totalRepaidUsdFormatted": "$99"
}
```

### `/v1/reputation/:wallet`
```json
{
  "repaidVolume": "74978253998840000000",
  "repaidVolumeFormatted": "$74.98",
  "successfulLoans": 1,
  "defaults": 0,
  "loansTaken": 1,
  "tier": 0,
  "trustTierScore": "A",
  "trustRatio": 7700
}
```

## Trust Tier Mapping

| Score | Tier |
|-------|------|
| >= 9000 | AAA |
| >= 8000 | AA |
| >= 7000 | A |
| >= 6000 | BBB |
| >= 5000 | BB |
| < 5000 | B |

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