import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cartAPI } from '../api/cart'
import useCartStore from '../store/cartStore'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'

export const useCart = () => {
  const { isAuthenticated } = useAuthStore()
  const { setCart } = useCartStore()
  const queryClient = useQueryClient()

  // Normalize the cart response — handle both res.data.data.cart and res.data.cart shapes
  const extractCart = (res) =>
    res?.data?.data?.cart ?? res?.data?.cart ?? null

  const { data, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const res = await cartAPI.getCart()
      const cart = extractCart(res)
      setCart(cart)
      return cart
    },
    enabled: isAuthenticated,
    staleTime: 30000,
  })

  const addMutation = useMutation({
    mutationFn: ({ productId, quantity }) => cartAPI.addItem(productId, quantity),
    onSuccess: (res) => {
      const cart = extractCart(res)
      setCart(cart)
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      toast.success('Added to cart')
    },
    onError: (err) => {
      console.error('Add to cart error:', err.response ?? err)
      toast.error(err.response?.data?.message || 'Failed to add to cart')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ productId, quantity }) => cartAPI.updateItem(productId, quantity),
    onSuccess: (res) => {
      const cart = extractCart(res)
      setCart(cart)
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
    onError: (err) => {
      console.error('Update cart error:', err.response ?? err)
      toast.error(err.response?.data?.message || 'Failed to update cart')
    },
  })

  const removeMutation = useMutation({
    mutationFn: (productId) => cartAPI.removeItem(productId),
    onSuccess: (res) => {
      const cart = extractCart(res)
      setCart(cart)
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      toast.success('Removed from cart')
    },
    onError: (err) => {
      console.error('Remove from cart error:', err.response ?? err)
      toast.error(err.response?.data?.message || 'Failed to remove item')
    },
  })

  const clearMutation = useMutation({
    mutationFn: () => cartAPI.clearCart(),
    onSuccess: () => {
      setCart(null)
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })

  return {
    cart: data,
    isLoading,
    addItem: addMutation.mutate,
    updateItem: updateMutation.mutate,
    removeItem: removeMutation.mutate,
    clearCart: clearMutation.mutate,
    isAdding: addMutation.isPending,
  }
}
