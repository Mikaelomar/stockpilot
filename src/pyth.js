import { HermesClient } from "@pythnetwork/hermes-client";

const HERMES_URL = "https://pyth.dourolabs.app/hermes";

const FEEDS = {
  BTCUSD: "e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
  ETHUSD: "ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
};

const client = new HermesClient(HERMES_URL, {
  accessToken: process.env.PYTH_API_KEY,
});

export async function getPythMarkets() {
  if (!process.env.PYTH_API_KEY) {
    throw new Error("PYTH_API_KEY is not configured");
  }

  const ids = Object.values(FEEDS);
  const response = await client.getLatestPriceUpdates(ids);

  return (response.parsed ?? []).map((feed) => {
    const p = feed.price;

    return {
      id: feed.id,
      price: Number(p.price) * 10 ** p.expo,
      confidence: Number(p.conf) * 10 ** p.expo,
      publishTime: p.publish_time,
    };
  });
}
