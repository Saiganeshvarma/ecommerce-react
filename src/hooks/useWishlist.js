import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { wishlistAPI } from '../api/wishlist'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'

export const useWishlist = () => {
  const { isAuthenticated } = useAuthStore()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const res = await wishlistAPI.getWishlist()
      return res.data.data.wishlist
    },
    enabled: isAuthenticated,
    staleTime: 60000,
  })

  const addMutation = useMutation({
    mutationFn: (productId) => wishlistAPI.addItem(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
      toast.success('Added to wishlist')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  })

  const removeMutation = useMutation({
    mutationFn: (productId) => wishlistAPI.removeItem(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
      toast.success('Removed from wishlist')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  })

  const isInWishlist = (productId) => {
    return data?.products?.some((p) => p._id === productId) || false
  }

  const toggle = (productId) => {
    if (isInWishlist(productId)) {
      removeMutation.mutate(productId)
    } else {
      addMutation.mutate(productId)
    }
  }

  return {
    wishlist: data,
    isLoading,
    isInWishlist,
    toggle,
    addItem: addMutation.mutate,
    removeItem: removeMutation.mutate,
  }
}
