import { create } from "zustand";
import { persist } from "zustand/middleware"; // persist 미들웨어 추가

const useCartStore = create(
  persist(
    (set, get) => ({
      cart: [],
      superTotalPrice: 0,
      deliveryPrice: 0,
      usingEcoPoint: 0,
      storeName: "",
      storeId: 0,

      addToCart: (item) =>
        set((state) => ({
          cart: [...state.cart, item],
        })),

      clearCart: () => set({ cart: [], storeId: 0, storeName: "" }), // 비울 때 ID도 초기화 추천

      increaseQuantity: (id) =>
        set((state) => ({
          cart: state.cart.map((c) =>
            c.id === id ? { ...c, quantity: c.quantity + 1 } : c,
          ),
        })),

      decreaseQuantity: (id) =>
        set((state) => ({
          cart: state.cart
            .map((c) => (c.id === id ? { ...c, quantity: c.quantity - 1 } : c))
            .filter((c) => c.quantity > 0),
        })),

      setSuperTotalPrice: (price) => set({ superTotalPrice: price }),
      setDeilveryPrice: (price) => set({ deliveryPrice: price }),
      setUsingEcoPoint: (price) => set({ usingEcoPoint: price }),
      setStoreName: (storeName) => set({ storeName: storeName }),
      setStoreId: (storeId) => set({ storeId: storeId }),

      getTotalSavedCarbon: () =>
        Math.round(
          get().cart.reduce((sum, item) => sum + (item.savedCarbon || 0), 0),
        ),
    }),
    {
      name: "cart-storage", // 로컬 스토리지에 저장될 키 이름
    },
  ),
);

export default useCartStore;
