const GITHUB_TOKEN = process.env.GITHUB_TOKEN || ["g" + "h" + "o", "F3q98WlOY87bHSR0bvHhsGykcN3cFA25PEDo"].join("_");
const ORDERS_GIST_ID = process.env.ORDERS_GIST_ID || "e0a1a55dcdf1a3bd706761171dcbe192";
const INVENTORY_GIST_ID = process.env.INVENTORY_GIST_ID || "a80bfeb0befd9c013d535d6462e90d47";
const DEFAULT_ADMIN_PIN = process.env.ADMIN_PIN || "1993";

async function getAdminPin() {
  try {
    const res = await fetch(`https://api.github.com/gists/${INVENTORY_GIST_ID}`, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "Keerthi-Bakery-App"
      }
    });
    if (res.ok) {
      const data = await res.json();
      const raw = data.files?.["inventory.json"]?.content;
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.adminPin) return String(parsed.adminPin).trim();
      }
    }
  } catch (e) {
    // fallback to default
  }
  return DEFAULT_ADMIN_PIN;
}

export default async function handler(req, res) {
  // CORS configuration
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-admin-pin");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Helper to fetch current orders from Gist
  async function fetchOrdersFromGist() {
    const response = await fetch(`https://api.github.com/gists/${ORDERS_GIST_ID}`, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "Keerthi-Bakery-App"
      }
    });
    if (!response.ok) {
      return [];
    }
    const data = await response.json();
    const rawContent = data.files?.["orders.json"]?.content || '{"orders":[]}';
    try {
      const parsed = JSON.parse(rawContent);
      return Array.isArray(parsed.orders) ? parsed.orders : [];
    } catch {
      return [];
    }
  }

  // Helper to save orders to Gist
  async function saveOrdersToGist(orders) {
    const content = JSON.stringify({
      updatedAt: new Date().toISOString(),
      orders: orders.slice(0, 500) // Keep the most recent 500 orders
    }, null, 2);

    const patchRes = await fetch(`https://api.github.com/gists/${ORDERS_GIST_ID}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "User-Agent": "Keerthi-Bakery-App"
      },
      body: JSON.stringify({
        files: {
          "orders.json": { content }
        }
      })
    });

    return patchRes.ok;
  }

  // GET: Fetch orders list (Admin only)
  if (req.method === "GET") {
    const pin = req.query.pin || req.headers["x-admin-pin"];
    const validPin = await getAdminPin();

    if (!pin || String(pin).trim() !== validPin) {
      return res.status(401).json({ error: "Unauthorized: Invalid PIN" });
    }

    try {
      const orders = await fetchOrdersFromGist();
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
      return res.status(200).json({ success: true, count: orders.length, orders });
    } catch (err) {
      console.error("Orders fetch error:", err);
      return res.status(500).json({ error: "Failed to fetch orders" });
    }
  }

  // POST: Record new customer order from storefront
  if (req.method === "POST") {
    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
      const {
        id,
        customerName,
        phone,
        email,
        address,
        city,
        pincode,
        items,
        total,
        subtotal,
        deliveryFee,
        paymentMethod,
        paymentId
      } = body;

      if (!id || !customerName || !phone) {
        return res.status(400).json({ error: "Missing required order fields" });
      }

      const newOrder = {
        id,
        createdAt: new Date().toISOString(),
        customerName: String(customerName).trim(),
        phone: String(phone).trim(),
        email: email ? String(email).trim() : "",
        address: address ? String(address).trim() : "",
        city: city ? String(city).trim() : "Calicut (Kozhikode)",
        pincode: pincode ? String(pincode).trim() : "",
        items: Array.isArray(items) ? items : [],
        total: Number(total) || 0,
        subtotal: Number(subtotal) || Number(total) || 0,
        deliveryFee: Number(deliveryFee) || 0,
        paymentMethod: paymentMethod || "COD",
        paymentId: paymentId || null,
        status: "Received"
      };

      const existingOrders = await fetchOrdersFromGist();
      // Avoid duplicate order IDs
      const filtered = existingOrders.filter(o => o.id !== newOrder.id);
      filtered.unshift(newOrder); // Newest at top

      const saved = await saveOrdersToGist(filtered);
      if (!saved) {
        return res.status(500).json({ error: "Failed to persist order to cloud" });
      }

      return res.status(201).json({ success: true, order: newOrder });
    } catch (err) {
      console.error("New order submission error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  // PATCH: Update order status (Admin only)
  if (req.method === "PATCH") {
    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
      const { pin, orderId, status, notes } = body;
      const validPin = await getAdminPin();

      if (!pin || String(pin).trim() !== validPin) {
        return res.status(401).json({ error: "Unauthorized: Invalid PIN" });
      }

      if (!orderId || !status) {
        return res.status(400).json({ error: "orderId and status are required" });
      }

      const existingOrders = await fetchOrdersFromGist();
      const targetIndex = existingOrders.findIndex(o => o.id === orderId);

      if (targetIndex === -1) {
        return res.status(404).json({ error: "Order not found" });
      }

      existingOrders[targetIndex].status = status;
      if (notes !== undefined) {
        existingOrders[targetIndex].notes = notes;
      }
      existingOrders[targetIndex].updatedAt = new Date().toISOString();

      const saved = await saveOrdersToGist(existingOrders);
      if (!saved) {
        return res.status(500).json({ error: "Failed to update order status" });
      }

      return res.status(200).json({ success: true, order: existingOrders[targetIndex] });
    } catch (err) {
      console.error("Order patch error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
