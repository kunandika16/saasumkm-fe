import { describe, it, expect, beforeEach } from "vitest";
import { useCartStore } from "@/stores/cart-store";

describe("Cart Store", () => {
  beforeEach(() => {
    // Reset store state before each test
    useCartStore.setState({ items: [] });
  });

  describe("addItem", () => {
    it("should add a new item with quantity 1", () => {
      useCartStore.getState().addItem({
        menuItemId: "item-1",
        name: "Nasi Goreng",
        price: 25000,
        imageUrl: null,
      });

      const items = useCartStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0]).toEqual({
        menuItemId: "item-1",
        name: "Nasi Goreng",
        price: 25000,
        quantity: 1,
        imageUrl: null,
        isAvailable: true,
      });
    });

    it("should increment quantity when adding existing item", () => {
      const store = useCartStore.getState();
      store.addItem({
        menuItemId: "item-1",
        name: "Nasi Goreng",
        price: 25000,
        imageUrl: null,
      });
      store.addItem({
        menuItemId: "item-1",
        name: "Nasi Goreng",
        price: 25000,
        imageUrl: null,
      });

      const items = useCartStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0].quantity).toBe(2);
    });

    it("should not exceed max quantity of 99", () => {
      // Set an item with quantity 99
      useCartStore.setState({
        items: [
          {
            menuItemId: "item-1",
            name: "Nasi Goreng",
            price: 25000,
            quantity: 99,
            imageUrl: null,
            isAvailable: true,
          },
        ],
      });

      useCartStore.getState().addItem({
        menuItemId: "item-1",
        name: "Nasi Goreng",
        price: 25000,
        imageUrl: null,
      });

      const items = useCartStore.getState().items;
      expect(items[0].quantity).toBe(99);
    });

    it("should add multiple different items", () => {
      const store = useCartStore.getState();
      store.addItem({
        menuItemId: "item-1",
        name: "Nasi Goreng",
        price: 25000,
        imageUrl: null,
      });
      store.addItem({
        menuItemId: "item-2",
        name: "Es Teh",
        price: 5000,
        imageUrl: "/tea.jpg",
      });

      const items = useCartStore.getState().items;
      expect(items).toHaveLength(2);
      expect(items[0].menuItemId).toBe("item-1");
      expect(items[1].menuItemId).toBe("item-2");
    });
  });

  describe("updateQuantity", () => {
    beforeEach(() => {
      useCartStore.setState({
        items: [
          {
            menuItemId: "item-1",
            name: "Nasi Goreng",
            price: 25000,
            quantity: 5,
            imageUrl: null,
            isAvailable: true,
          },
        ],
      });
    });

    it("should update quantity to specified value", () => {
      useCartStore.getState().updateQuantity("item-1", 10);
      expect(useCartStore.getState().items[0].quantity).toBe(10);
    });

    it("should clamp quantity to minimum of 1", () => {
      useCartStore.getState().updateQuantity("item-1", 1);
      expect(useCartStore.getState().items[0].quantity).toBe(1);
    });

    it("should clamp quantity to maximum of 99", () => {
      useCartStore.getState().updateQuantity("item-1", 150);
      expect(useCartStore.getState().items[0].quantity).toBe(99);
    });

    it("should remove item when quantity is less than 1", () => {
      useCartStore.getState().updateQuantity("item-1", 0);
      expect(useCartStore.getState().items).toHaveLength(0);
    });

    it("should remove item when quantity is negative", () => {
      useCartStore.getState().updateQuantity("item-1", -5);
      expect(useCartStore.getState().items).toHaveLength(0);
    });
  });

  describe("removeItem", () => {
    it("should remove an item from the cart", () => {
      useCartStore.setState({
        items: [
          {
            menuItemId: "item-1",
            name: "Nasi Goreng",
            price: 25000,
            quantity: 2,
            imageUrl: null,
            isAvailable: true,
          },
          {
            menuItemId: "item-2",
            name: "Es Teh",
            price: 5000,
            quantity: 1,
            imageUrl: null,
            isAvailable: true,
          },
        ],
      });

      useCartStore.getState().removeItem("item-1");

      const items = useCartStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0].menuItemId).toBe("item-2");
    });

    it("should do nothing when removing non-existent item", () => {
      useCartStore.setState({
        items: [
          {
            menuItemId: "item-1",
            name: "Nasi Goreng",
            price: 25000,
            quantity: 2,
            imageUrl: null,
            isAvailable: true,
          },
        ],
      });

      useCartStore.getState().removeItem("non-existent");
      expect(useCartStore.getState().items).toHaveLength(1);
    });
  });

  describe("clearCart", () => {
    it("should remove all items from the cart", () => {
      useCartStore.setState({
        items: [
          {
            menuItemId: "item-1",
            name: "Nasi Goreng",
            price: 25000,
            quantity: 2,
            imageUrl: null,
            isAvailable: true,
          },
          {
            menuItemId: "item-2",
            name: "Es Teh",
            price: 5000,
            quantity: 1,
            imageUrl: null,
            isAvailable: true,
          },
        ],
      });

      useCartStore.getState().clearCart();
      expect(useCartStore.getState().items).toHaveLength(0);
    });
  });

  describe("getTotal", () => {
    it("should calculate total for available items only", () => {
      useCartStore.setState({
        items: [
          {
            menuItemId: "item-1",
            name: "Nasi Goreng",
            price: 25000,
            quantity: 2,
            imageUrl: null,
            isAvailable: true,
          },
          {
            menuItemId: "item-2",
            name: "Es Teh",
            price: 5000,
            quantity: 3,
            imageUrl: null,
            isAvailable: true,
          },
        ],
      });

      // 25000 * 2 + 5000 * 3 = 50000 + 15000 = 65000
      expect(useCartStore.getState().getTotal()).toBe(65000);
    });

    it("should exclude unavailable items from total", () => {
      useCartStore.setState({
        items: [
          {
            menuItemId: "item-1",
            name: "Nasi Goreng",
            price: 25000,
            quantity: 2,
            imageUrl: null,
            isAvailable: true,
          },
          {
            menuItemId: "item-2",
            name: "Unavailable Item",
            price: 50000,
            quantity: 1,
            imageUrl: null,
            isAvailable: false,
          },
        ],
      });

      // Only available items: 25000 * 2 = 50000
      expect(useCartStore.getState().getTotal()).toBe(50000);
    });

    it("should return 0 for empty cart", () => {
      expect(useCartStore.getState().getTotal()).toBe(0);
    });

    it("should return 0 when all items are unavailable", () => {
      useCartStore.setState({
        items: [
          {
            menuItemId: "item-1",
            name: "Unavailable",
            price: 25000,
            quantity: 2,
            imageUrl: null,
            isAvailable: false,
          },
        ],
      });

      expect(useCartStore.getState().getTotal()).toBe(0);
    });
  });

  describe("hasUnavailableItems", () => {
    it("should return false when all items are available", () => {
      useCartStore.setState({
        items: [
          {
            menuItemId: "item-1",
            name: "Nasi Goreng",
            price: 25000,
            quantity: 1,
            imageUrl: null,
            isAvailable: true,
          },
        ],
      });

      expect(useCartStore.getState().hasUnavailableItems()).toBe(false);
    });

    it("should return true when some items are unavailable", () => {
      useCartStore.setState({
        items: [
          {
            menuItemId: "item-1",
            name: "Nasi Goreng",
            price: 25000,
            quantity: 1,
            imageUrl: null,
            isAvailable: true,
          },
          {
            menuItemId: "item-2",
            name: "Unavailable",
            price: 10000,
            quantity: 1,
            imageUrl: null,
            isAvailable: false,
          },
        ],
      });

      expect(useCartStore.getState().hasUnavailableItems()).toBe(true);
    });

    it("should return false for empty cart", () => {
      expect(useCartStore.getState().hasUnavailableItems()).toBe(false);
    });
  });
});
