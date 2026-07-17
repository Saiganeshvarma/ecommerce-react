import { create } from 'zustand'

const useCartStore = create((set) => ({
  cart: null,
  itemCount: 0,

  setCart: (cart) => {
    const itemCount = cart?.products?.reduce((acc, item) => acc + item.quantity, 0) || 0
    set({ cart, itemCount })
  },

  clearCart: () => set({ cart: null, itemCount: 0 }),
}))

export default useCartStore
