const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');

const app = express();
app.use(cors());
app.use(express.json());

function serializeBigInts(obj) {
  return JSON.parse(JSON.stringify(obj, (k, v) => typeof v === 'bigint' ? v.toString() : v));
}

const SBT_ABI = [
  "function balanceOf(address user) view returns (uint256)",
  "function userTokenId(address) view returns (uint256)",
  "function hasSoul(address user) view returns (bool)",
  "function tokenOf(address user) view returns (uint256)",
  "function getCreditDashboard(address user) view returns (uint256 trustRatio, uint256 currentApr, uint256 totalBorrowedUsd, uint256 totalRepaidUsd, uint256 principalRepaidUsd, uint256 interestRepaidUsd, uint256 successfulLoans, uint256 defaults, uint8 tier)",
  "function getCreditDashboardByTokenId(uint256 tokenId) view returns (address user, uint256 trustRatio, uint256 currentApr, uint256 totalBorrowedUsd, uint256 totalRepaidUsd, uint256 principalRepaidUsd, uint256 interestRepaidUsd, uint256 successfulLoans, uint256 defaults, uint8 tier)",
  "function getCreditHistory(address user) view returns (uint256 loansTaken, uint256 totalBorrowed, uint256, uint256 totalRepaid, uint256)",
  "function getReputation(address user) view returns (uint256 repaidVolume, uint256 successfulLoans, uint256 defaults, uint256 loansTaken, uint8 tier, uint256 trustRatio)",
  "function getReputationByTokenId(uint256 tokenId) view returns (address user, uint256 repaidVolume, uint256 successfulLoans, uint256 defaults, uint256 loansTaken, uint8 tier, uint256 trustRatio)",
  "function getTrustRatio(address user) view returns (uint256)",
  "function getTrustTier(address user) view returns (string)",
  "function getCurrentRisk(address user) view returns (uint256)"
];

const CONTRACT_ADDRESSES = {
  amoy: "0x4bdF83dA3f6cce61dfDDAce51c92E696f8e00171",
  sepolia: "0xc7432A7973a2c58feBA0B194bbbbf22947946BBc"
};

const RPC_URLS = {
  amoy: process.env.AMOY_RPC_URL || "https://polygon-amoy.g.alchemy.com/v2/demo",
  sepolia: process.env.SEPOLIA_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/demo"
};

const defaultNetwork = process.env.NETWORK || "amoy";

function tierFromScore(score) {
  if (score >= 9000) return "AAA";
  if (score >= 8000) return "AA";
  if (score >= 7000) return "A";
  if (score >= 6000) return "BBB";
  if (score >= 5000) return "BB";
  return "B";
}

function getContractForNetwork(network) {
  const rpcUrl = RPC_URLS[network];
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const address = CONTRACT_ADDRESSES[network];
  if (!address) throw new Error(`Unsupported network: ${network}`);
  return new ethers.Contract(address, SBT_ABI, provider);
}

app.get("/health", (_req, res) => {
  res.json({ status: "ok", defaultNetwork, supportedNetworks: ["amoy", "sepolia"] });
});

app.get("/v1/credit/:wallet", async (req, res) => {
  try {
    const network = req.query.network || defaultNetwork;
    const contract = getContractForNetwork(network);
    const [trustRatio, currentApr, totalBorrowedUsd, totalRepaidUsd, principalRepaidUsd, interestRepaidUsd, successfulLoans, defaults, tier] = await contract.getCreditDashboard(req.params.wallet);
    res.json({
      trustRatio: Number(trustRatio),
      trustTierScore: tierFromScore(Number(trustRatio)),
      tier: Number(tier),
      currentApr: Number(currentApr),
      totalBorrowedUsd: String(totalBorrowedUsd),
      totalRepaidUsd: String(totalRepaidUsd),
      principalRepaidUsd: String(principalRepaidUsd),
      interestRepaidUsd: String(interestRepaidUsd),
      interestRepaidUsdFormatted: `$${String(interestRepaidUsd)}`,
      successfulLoans: Number(successfulLoans),
      defaults: Number(defaults),
      totalBorrowedUsdFormatted: `$${String(totalBorrowedUsd)}`,
      totalRepaidUsdFormatted: `$${String(totalRepaidUsd)}`
    });
  } catch (error) {
    console.error("Error fetching credit dashboard:", error);
    res.status(500).json({ error: String(error) });
  }
});

app.get("/v1/apr/:wallet", async (req, res) => {
  try {
    const network = req.query.network || defaultNetwork;
    const contract = getContractForNetwork(network);
    const apr = await contract.getCurrentRisk(req.params.wallet);
    res.json({ apr: Number(apr) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/v1/tier/:wallet", async (req, res) => {
  try {
    const network = req.query.network || defaultNetwork;
    const contract = getContractForNetwork(network);
    const trustRatio = await contract.getTrustRatio(req.params.wallet);
    res.json({ tier: tierFromScore(Number(trustRatio)) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/v1/history/:wallet", async (req, res) => {
  try {
    const network = req.query.network || defaultNetwork;
    const contract = getContractForNetwork(network);
    const [loansTaken, totalBorrowed, _unused1, totalRepaid, _unused2] = await contract.getCreditHistory(req.params.wallet);
    res.json({
      loansTaken: Number(loansTaken),
      totalBorrowed: String(totalBorrowed),
      totalRepaid: String(totalRepaid),
      totalBorrowedFormatted: `$${Number(totalBorrowed) / 1e18}`,
      totalRepaidFormatted: `$${Number(totalRepaid) / 1e18}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/v1/reputation/:wallet", async (req, res) => {
  try {
    const network = req.query.network || defaultNetwork;
    const contract = getContractForNetwork(network);
    const [repaidVolume, successfulLoans, defaults, loansTaken, tier, trustRatio] = await contract.getReputation(req.params.wallet);
    res.json({
      repaidVolume: String(repaidVolume),
      repaidVolumeFormatted: `$${Number(repaidVolume) / 1e18}`,
      successfulLoans: Number(successfulLoans),
      defaults: Number(defaults),
      loansTaken: Number(loansTaken),
      tier: Number(tier),
      trustTierScore: tierFromScore(Number(trustRatio)),
      trustRatio: Number(trustRatio)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/v1/soul/:wallet", async (req, res) => {
  try {
    const network = req.query.network || defaultNetwork;
    const contract = getContractForNetwork(network);
    const hasSoul = await contract.hasSoul(req.params.wallet);
    const tokenId = await contract.tokenOf(req.params.wallet);
    res.json({ hasSoul, tokenId: Number(tokenId) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`🚀 BlackSwan API running on port ${port}`);
});