/**
 * Shopify Checkout Integration for Keerthi Bakery
 * Store: tk7uwk-d8.myshopify.com
 */

import shopifyMapping from "../data/shopify_mapping.js";

export const SHOPIFY_DOMAIN = "tk7uwk-d8.myshopify.com";
export const DEFAULT_VARIANT_ID = "50103692558595"; // Banana Chips (Signature Snack)

/**
 * Get the Shopify Variant ID for a given product ID or cart item
 */
export function getShopifyVariantId(item) {
  const productId = typeof item === "string" ? item : (item.productId || item.id);
  if (shopifyMapping[productId] && shopifyMapping[productId].shopify_variant_id) {
    return String(shopifyMapping[productId].shopify_variant_id);
  }
  return DEFAULT_VARIANT_ID;
}

/**
 * Builds a direct Shopify Cart Permalink URL for one or more items
 * Format: https://{store}.myshopify.com/cart/{variant_id}:{quantity},...
 */
export function buildCartPermalink(items, options = {}) {
  if (!items || items.length === 0) return null;

  // Aggregate quantities by Shopify variant ID
  const variantQuantities = {};
  items.forEach(item => {
    const variantId = getShopifyVariantId(item);
    const qty = parseInt(item.quantity, 10) || 1;
    variantQuantities[variantId] = (variantQuantities[variantId] || 0) + qty;
  });

  // Construct variant:qty path list
  const pathParts = Object.entries(variantQuantities).map(([vid, qty]) => `${vid}:${qty}`);
  const cartPath = pathParts.join(",");

  const url = new URL(`https://${SHOPIFY_DOMAIN}/cart/${cartPath}`);

  // Pre-fill customer address and contact info if provided
  if (options.email) {
    url.searchParams.set("checkout[email]", options.email);
  }
  if (options.name) {
    const nameParts = options.name.trim().split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";
    if (firstName) url.searchParams.set("checkout[shipping_address][first_name]", firstName);
    if (lastName) url.searchParams.set("checkout[shipping_address][last_name]", lastName);
  }
  if (options.phone) {
    url.searchParams.set("checkout[shipping_address][phone]", options.phone);
  }
  if (options.address) {
    url.searchParams.set("checkout[shipping_address][address1]", options.address);
  }
  if (options.city) {
    url.searchParams.set("checkout[shipping_address][city]", options.city);
  }
  if (options.pincode) {
    url.searchParams.set("checkout[shipping_address][zip]", options.pincode);
  }
  url.searchParams.set("checkout[shipping_address][country]", "India");

  // Discount code (coupon)
  if (options.discountCode) {
    url.searchParams.set("discount", options.discountCode);
  }

  // Tracking channel
  url.searchParams.set("channel", "keerthi_storefront");

  return url.toString();
}

/**
 * Redirect customer directly to Shopify's secure checkout
 */
export function redirectToShopifyCheckout(items, options = {}) {
  const checkoutUrl = buildCartPermalink(items, options);
  if (!checkoutUrl) return false;

  // Show a smooth feedback animation
  const overlay = document.createElement("div");
  overlay.id = "shopify-redirect-overlay";
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.88);
    backdrop-filter: blur(8px);
    z-index: 999999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    animation: fadeIn 0.25s ease-out;
  `;
  overlay.innerHTML = `
    <div style="background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 20px; padding: 36px 48px; text-align: center; max-width: 440px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
      <div style="display: inline-block; width: 56px; height: 56px; border: 4px solid rgba(226, 184, 127, 0.2); border-top-color: #e2b87f; border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 20px;"></div>
      <h3 style="font-size: 20px; font-weight: 700; color: #fff; margin: 0 0 8px 0;">Transferring to Secure Checkout...</h3>
      <p style="font-size: 14px; color: #cbd5e1; margin: 0 0 16px 0; line-height: 1.5;">Opening official Shopify Gateway for Keerthi Bakery (Pee Kay Group).</p>
      <div style="display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 12px; color: #e2b87f; background: rgba(226, 184, 127, 0.12); padding: 8px 16px; border-radius: 999px;">
        <span>🔒 256-Bit SSL Encrypted</span>
        <span>•</span>
        <span>⚡ UPI & Cards</span>
      </div>
    </div>
    <style>
      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    </style>
  `;
  document.body.appendChild(overlay);

  setTimeout(() => {
    window.location.href = checkoutUrl;
  }, 600);

  return true;
}
