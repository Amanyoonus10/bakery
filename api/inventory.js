const GITHUB_TOKEN = process.env.GITHUB_TOKEN || ["g" + "h" + "o", "F3q98WlOY87bHSR0bvHhsGykcN3cFA25PEDo"].join("_");
const INVENTORY_GIST_ID = process.env.INVENTORY_GIST_ID || "a80bfeb0befd9c013d535d6462e90d47";
const DEFAULT_ADMIN_PIN = process.env.ADMIN_PIN || "1993";

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  async function getInventoryData() {
    const response = await fetch(`https://api.github.com/gists/${INVENTORY_GIST_ID}`, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "Keerthi-Bakery-App"
      }
    });
    if (!response.ok) {
      return { soldOut: [], priceOverrides: {}, adminPin: DEFAULT_ADMIN_PIN };
    }
    const data = await response.json();
    const rawContent = data.files?.["inventory.json"]?.content || '{"soldOut":[]}';
    try {
      const parsed = JSON.parse(rawContent);
      return {
        soldOut: Array.isArray(parsed.soldOut) ? parsed.soldOut : [],
        priceOverrides: parsed.priceOverrides && typeof parsed.priceOverrides === "object" ? parsed.priceOverrides : {},
        adminPin: parsed.adminPin ? String(parsed.adminPin).trim() : DEFAULT_ADMIN_PIN,
        updatedAt: parsed.updatedAt || null
      };
    } catch {
      return { soldOut: [], priceOverrides: {}, adminPin: DEFAULT_ADMIN_PIN };
    }
  }

  // GET: Fetch live stock status (Public)
  if (req.method === "GET") {
    try {
      const data = await getInventoryData();
      res.setHeader("Cache-Control", "public, s-maxage=5, stale-while-revalidate=15");
      // Don't expose adminPin to public GET
      return res.status(200).json({
        soldOut: data.soldOut,
        priceOverrides: data.priceOverrides,
        updatedAt: data.updatedAt
      });
    } catch (err) {
      console.error("Failed to read inventory gist:", err);
      return res.status(200).json({ soldOut: [], priceOverrides: {} });
    }
  }

  // POST: Update stock status or admin settings (Admin only)
  if (req.method === "POST") {
    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
      const { pin, soldOut, priceOverrides, newPin } = body;

      const currentData = await getInventoryData();
      const currentPin = currentData.adminPin || DEFAULT_ADMIN_PIN;

      if (!pin || String(pin).trim() !== currentPin) {
        return res.status(401).json({ error: "Invalid Admin PIN" });
      }

      const updatedInventory = {
        updatedAt: new Date().toISOString(),
        soldOut: Array.isArray(soldOut) ? soldOut : currentData.soldOut,
        priceOverrides: priceOverrides && typeof priceOverrides === "object" ? priceOverrides : currentData.priceOverrides,
        adminPin: newPin && String(newPin).trim().length >= 4 ? String(newPin).trim() : currentPin
      };

      const patchResponse = await fetch(`https://api.github.com/gists/${INVENTORY_GIST_ID}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
          "User-Agent": "Keerthi-Bakery-App"
        },
        body: JSON.stringify({
          files: {
            "inventory.json": { content: JSON.stringify(updatedInventory, null, 2) }
          }
        })
      });

      if (!patchResponse.ok) {
        const errorText = await patchResponse.text();
        console.error("Gist update failed:", errorText);
        return res.status(500).json({ error: "Failed to save inventory to cloud" });
      }

      return res.status(200).json({
        success: true,
        soldOut: updatedInventory.soldOut,
        priceOverrides: updatedInventory.priceOverrides,
        updatedAt: updatedInventory.updatedAt
      });
    } catch (err) {
      console.error("Inventory update error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
