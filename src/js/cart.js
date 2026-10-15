import { PRODUCTS, ADDONS } from "../data/products.js";

const STORAGE_KEY = "keerthi_bakery_cart_v1";

class CartManager {
  constructor() {
    this.items = [];
    this.appliedCoupon = null;
    this.specialInstruction = "";
    this.deliverySlot = {
      date: new Date().toISOString().split("T")[0],
      time: "2-Hour Express (Now)"
    };
    this.deliveryPincode = "673001";
    this.deliveryCity = "Calicut (Kozhikode)";
    this.load();
  }

  load() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        // Cleanse any legacy cake test items from previous sessions to keep snacks focus
        this.items = (parsed.items || []).filter(item => 
          !item.productId?.toLowerCase().includes("cake") && 
          !item.productId?.toLowerCase().includes("truffle") && 
          !item.name?.toLowerCase().includes("cake")
        );
        this.appliedCoupon = parsed.appliedCoupon || null;
        this.specialInstruction = parsed.specialInstruction || "";
        this.deliverySlot = parsed.deliverySlot || this.deliverySlot;
        this.deliveryPincode = parsed.deliveryPincode || "673001";
        this.deliveryCity = parsed.deliveryCity || "Calicut (Kozhikode)";
      }
    } catch (e) {
      console.error("Failed to load cart from storage", e);
      this.items = [];
    }
  }

  save() {
    try {
      const state = {
        items: this.items,
        appliedCoupon: this.appliedCoupon,
        specialInstruction: this.specialInstruction,
        deliverySlot: this.deliverySlot,
        deliveryPincode: this.deliveryPincode,
        deliveryCity: this.deliveryCity
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Failed to save cart to storage", e);
    }
    window.dispatchEvent(new CustomEvent("cart:updated", { detail: this.getSummary() }));
  }

  addItem({
    productId,
    weight = "1.0 KG",
    shape = "Round",
    isEggless = false,
    messageOnCake = "",
    customDetails = null,
    quantity = 1,
    unitPrice = null,
    productName = null,
    productImage = null
  }) {
    const product = PRODUCTS.find(p => p.id === productId);
    const name = productName || (product ? product.name : "Custom Cake");
    const image = productImage || (product ? product.image : "/images/hero_cake_banner.jpg");

    // Calculate item unit price if not explicitly provided
    let calculatedUnitPrice = unitPrice;
    if (calculatedUnitPrice === null && product) {
      const variant = product.variants.find(v => v.weight === weight) || product.variants[0];
      calculatedUnitPrice = variant.price;
      if (isEggless && product.egglessAvailable) {
        calculatedUnitPrice += (product.egglessExtra || 50);
      }
      if (shape && product.shapes) {
        const shapeObj = product.shapes.find(s => s.name === shape);
        if (shapeObj) {
          calculatedUnitPrice += shapeObj.priceExtra;
        }
      }
    }

    // Unique cart item key based on variant configuration
    const itemKey = `${productId}_${weight}_${shape}_${isEggless ? "eggless" : "regular"}_${encodeURIComponent(messageOnCake || "")}`;

    const existingIndex = this.items.findIndex(item => item.itemKey === itemKey);
    if (existingIndex > -1) {
      this.items[existingIndex].quantity += quantity;
    } else {
      this.items.push({
        itemKey,
        productId,
        name,
        image,
        weight,
        shape,
        isEggless,
        messageOnCake: messageOnCake ? messageOnCake.trim() : "",
        customDetails,
        unitPrice: calculatedUnitPrice || 650,
        quantity: Math.max(1, quantity)
      });
    }

    this.save();
    return true;
  }

  addAddon(addonId) {
    const addon = ADDONS.find(a => a.id === addonId);
    if (!addon) return;

    const itemKey = `addon_${addon.id}`;
    const existing = this.items.find(i => i.itemKey === itemKey);
    if (existing) {
      existing.quantity += 1;
    } else {
      let addonImg = "/images/malabar_savouries.jpg";
      if (addon.id.includes("tapioca")) addonImg = "/images/malabar_savouries.jpg";
      else if (addon.id.includes("upperi")) addonImg = "/images/kerala_plum_cake.jpg";
      else if (addon.id.includes("rusk") || addon.id.includes("murukku")) addonImg = "/images/artisan_bread_cookies.jpg";

      this.items.push({
        itemKey,
        productId: addon.id,
        name: addon.name,
        image: addonImg,
        weight: "100g Pouch",
        shape: null,
        isEggless: true,
        messageOnCake: "",
        unitPrice: addon.price,
        quantity: 1,
        isAddon: true
      });
    }
    this.save();
  }

  updateQuantity(itemKey, delta) {
    const idx = this.items.findIndex(i => i.itemKey === itemKey);
    if (idx === -1) return;

    const newQty = this.items[idx].quantity + delta;
    if (newQty <= 0) {
      this.items.splice(idx, 1);
    } else {
      this.items[idx].quantity = newQty;
    }
    this.save();
  }

  removeItem(itemKey) {
    this.items = this.items.filter(i => i.itemKey !== itemKey);
    this.save();
  }

  clear() {
    this.items = [];
    this.appliedCoupon = null;
    this.specialInstruction = "";
    this.save();
  }

  applyCoupon(code) {
    const cleanCode = (code || "").trim().toUpperCase();
    if (cleanCode === "PEEKAY100") {
      const subtotal = this.getSubtotal();
      if (subtotal < 499) {
        return { success: false, message: "Min order of ₹499 required for PEEKAY100" };
      }
      this.appliedCoupon = { code: "PEEKAY100", type: "flat", value: 100, label: "Peekay Welcome Flat ₹100 Off" };
      this.save();
      return { success: true, message: "Coupon applied! ₹100 discount saved." };
    }
    if (cleanCode === "KEERTHI10" || cleanCode === "SWEET10") {
      this.appliedCoupon = { code: cleanCode, type: "percentage", value: 10, maxDiscount: 200, label: "10% Keerthi Heritage Discount" };
      this.save();
      return { success: true, message: "10% discount applied successfully!" };
    }
    if (cleanCode === "FREEDEL") {
      this.appliedCoupon = { code: "FREEDEL", type: "free_delivery", value: 49, label: "Free Express Delivery" };
      this.save();
      return { success: true, message: "Free Delivery applied!" };
    }
    return { success: false, message: "Invalid promo code. Try PEEKAY100 or KEERTHI10" };
  }

  removeCoupon() {
    this.appliedCoupon = null;
    this.save();
  }

  setSpecialInstruction(text) {
    this.specialInstruction = text;
    this.save();
  }

  setDeliverySlot(date, time) {
    this.deliverySlot = { date, time };
    this.save();
  }

  setLocation(city, pincode) {
    this.deliveryCity = city;
    this.deliveryPincode = pincode;
    this.save();
  }

  getItemCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  getSubtotal() {
    return this.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  }

  getDiscount() {
    if (!this.appliedCoupon) return 0;
    const subtotal = this.getSubtotal();
    if (this.appliedCoupon.type === "flat") {
      return Math.min(subtotal, this.appliedCoupon.value);
    }
    if (this.appliedCoupon.type === "percentage") {
      const calc = (subtotal * this.appliedCoupon.value) / 100;
      return Math.min(calc, this.appliedCoupon.maxDiscount || 9999);
    }
    if (this.appliedCoupon.type === "free_delivery") {
      return 49;
    }
    return 0;
  }

  getDeliveryFee() {
    const subtotal = this.getSubtotal();
    if (subtotal === 0) return 0;
    if (this.appliedCoupon && this.appliedCoupon.type === "free_delivery") return 0;
    if (subtotal >= 499) return 0; // Free delivery over ₹499
    return 49;
  }

  getPackagingFee() {
    return 0; // Complimentary Aroma-Lock packaging
  }

  getGrandTotal() {
    const subtotal = this.getSubtotal();
    if (subtotal === 0) return 0;
    const total = subtotal + this.getDeliveryFee() + this.getPackagingFee() - this.getDiscount();
    return Math.max(0, Math.round(total));
  }

  getFreeShippingThreshold() {
    const subtotal = this.getSubtotal();
    const target = 499;
    const progress = Math.min(100, Math.round((subtotal / target) * 100));
    const remaining = Math.max(0, target - subtotal);
    return { target, current: subtotal, progress, remaining, qualified: subtotal >= target };
  }

  getSummary() {
    return {
      items: this.items,
      count: this.getItemCount(),
      subtotal: this.getSubtotal(),
      discount: this.getDiscount(),
      deliveryFee: this.getDeliveryFee(),
      packagingFee: this.getPackagingFee(),
      grandTotal: this.getGrandTotal(),
      appliedCoupon: this.appliedCoupon,
      freeShipping: this.getFreeShippingThreshold(),
      deliverySlot: this.deliverySlot,
      deliveryCity: this.deliveryCity,
      deliveryPincode: this.deliveryPincode,
      specialInstruction: this.specialInstruction
    };
  }
}

export const cart = new CartManager();
