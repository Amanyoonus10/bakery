const STORAGE_KEY = "keerthi_bakery_wishlist_v1";

class WishlistStore {
  constructor() {
    this.items = [];
    this.load();
  }

  load() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        this.items = JSON.parse(data);
      }
    } catch (e) {
      console.error("Failed to load wishlist from storage", e);
      this.items = [];
    }
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
    } catch (e) {
      console.error("Failed to save wishlist to storage", e);
    }
    window.dispatchEvent(new CustomEvent("wishlist:updated", {
      detail: {
        items: this.items,
        count: this.items.length
      }
    }));
  }

  getItems() {
    return [...this.items];
  }

  getCount() {
    return this.items.length;
  }

  hasItem(productId) {
    if (!productId) return false;
    return this.items.some(item => item.productId === productId);
  }

  addItem(item) {
    if (!item || !item.productId) return false;
    if (this.hasItem(item.productId)) return false;

    this.items.push({
      productId: item.productId,
      productName: item.productName || "Keerthi Snack",
      unitPrice: parseInt(item.unitPrice) || 89,
      productImage: item.productImage || "/images/card_banana_chips_clean.jpg",
      dateAdded: Date.now()
    });
    this.save();
    return true;
  }

  removeItem(productId) {
    if (!productId) return false;
    const initialLength = this.items.length;
    this.items = this.items.filter(item => item.productId !== productId);
    if (this.items.length !== initialLength) {
      this.save();
      return true;
    }
    return false;
  }

  toggleItem(item) {
    if (!item || !item.productId) return false;
    if (this.hasItem(item.productId)) {
      this.removeItem(item.productId);
      return false; // now removed
    } else {
      this.addItem(item);
      return true; // now added
    }
  }

  clear() {
    this.items = [];
    this.save();
  }
}

export const wishlist = new WishlistStore();
