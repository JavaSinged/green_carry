import { DeliveryDining } from "@mui/icons-material";
import { useState } from "react";
import { create } from "zustand";

const useCartStore = create((set) => ({
  cart: [], // 장바구니에 담긴 아이템 배열
  superTotalPrice: 0, // 최종 결제 금액
  deliveryPrice: 0,
  // 장바구니에 아이템 추가하는 함수
  addToCart: (item) =>
    set((state) => ({
      cart: [...state.cart, item],
    })),

  // 장바구니 비우기 (결제 완료 후 등에 사용)
  clearCart: () => set({ cart: [] }),

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
}));

export default useCartStore;
