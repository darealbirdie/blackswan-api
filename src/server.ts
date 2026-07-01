import express from "express";
import cors from "cors";
import serverless from "serverless-http";
import { BlackSwanClient, Network } from "blackswan-sdk";

const app = express();
app.use(cors());
app.use(express.json());

function serializeBigInts(obj: any): any {
  return JSON.parse(JSON.stringify(obj, (k, v) => typeof v === "bigint" ? v.toString() : v));
}

const defaultNetwork = (process.env.NETWORK as Network) || "amoy";
const defaultRpcUrl = process.env.RPC_URL || "https://polygon-amoy.g.alchemy.com/v2/YOUR_API_KEY";

const rpcUrls: Record<Network, string> = {
  amoy: process.env.AMOY_RPC_URL || defaultRpcUrl,
  sepolia: process.env.SEPOLIA_RPC_URL || defaultRpcUrl,
  polygon: process.env.POLYGON_RPC_URL || defaultRpcUrl,
  mainnet: process.env.MAINNET_RPC_URL || defaultRpcUrl
};

function getClientForNetwork(network: Network): BlackSwanClient {
  const rpcUrl = rpcUrls[network];
  return new BlackSwanClient({ network, rpcUrl });
}

app.get("/health", (_req, res) => {
  res.json({ status: "ok", defaultNetwork, supportedNetworks: ["amoy", "sepolia", "polygon", "mainnet"] });
});

app.get("/v1/credit/:wallet", async (req, res) => {
  try {
    const network = (req.query.network as Network) || defaultNetwork;
    const client = getClientForNetwork(network);
    const dashboard = await client.getCreditDashboard(req.params.wallet);
    res.json(serializeBigInts(dashboard));
  } catch (error: any) {
    console.error("Error fetching credit dashboard:", error);
    res.status(500).json({ error: error.message || String(error) });
  }
});

app.get("/v1/apr/:wallet", async (req, res) => {
  try {
    const network = (req.query.network as Network) || defaultNetwork;
    const client = getClientForNetwork(network);
    const apr = await client.getCurrentApr(req.params.wallet);
    res.json({ apr });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/v1/tier/:wallet", async (req, res) => {
  try {
    const network = (req.query.network as Network) || defaultNetwork;
    const client = getClientForNetwork(network);
    const tier = await client.getTrustTier(req.params.wallet);
    res.json({ tier });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/v1/history/:wallet", async (req, res) => {
  try {
    const network = (req.query.network as Network) || defaultNetwork;
    const client = getClientForNetwork(network);
    const history = await client.getCreditHistory(req.params.wallet);
    res.json(serializeBigInts(history));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/v1/reputation/:wallet", async (req, res) => {
  try {
    const network = (req.query.network as Network) || defaultNetwork;
    const client = getClientForNetwork(network);
    const reputation = await client.getReputation(req.params.wallet);
    res.json(serializeBigInts(reputation));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const port = process.env.PORT || 3001;

if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log(`API running on port ${port}`);
  });
}

module.exports = serverless(app);