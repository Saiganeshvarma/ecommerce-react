import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MapPin, Plus, CreditCard, CheckCircle, Tag, X } from 'lucide-react'
import { addressesAPI } from '../api/addresses'
import { ordersAPI } from '../api/orders'
import { couponsAPI } from '../api/coupons'
import { useCart } from '../hooks/useCart'
import useCartStore from '../store/cartStore'
import useAuthStore from '../store/authStore'
import Spinner from '../components/common/Spinner'
import toast from 'react-hot-toast'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const { cart } = useCart()
  const { clearCart } = useCartStore()
  const { user } = useAuthStore()
  const [selectedAddress, setSelectedAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('razorpay')
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [newAddress, setNewAddress] = useState({ fullName: '', mobile: '', houseNo: '', street: '', city: '', state: '', country: 'India', pincode: '' })
  const [addingAddress, setAddingAddress] = useState(false)

  // Coupon state — pre-populated from CartPage if user applied there
  const [appliedCoupon, setAppliedCoupon] = useState(location.state?.appliedCoupon || null)
  const [couponInput, setCouponInput] = useState('')
  const [couponError, setCouponError] = useState('')

  const applyMutation = useMutation({
    mutationFn: (code) => couponsAPI.apply(code),
    onSuccess: (res) => {
      setAppliedCoupon(res.data.data)
      setCouponError('')
      setCouponInput('')
      toast.success(`Coupon "${res.data.data.coupon}" applied!`)
    },
    onError: (err) => {
      setCouponError(err.response?.data?.message || 'Invalid coupon code')
      setAppliedCoupon(null)
    },
  })

  const handleApplyCoupon = () => {
    if (!couponInput.trim()) return
    setCouponError('')
    applyMutation.mutate(couponInput.trim())
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponInput('')
    setCouponError('')
    toast.success('Coupon removed')
  }

  const { data: addresses, refetch: refetchAddresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const res = await addressesAPI.getAll()
      return res.data.data.addresses
    },
  })

  useEffect(() => {
    if (addresses?.length > 0 && !selectedAddress) {
      const def = addresses.find((a) => a.isDefault) || addresses[0]
      setSelectedAddress(def._id)
    }
  }, [addresses])

  const items = cart?.products || []
  const subtotal = items.reduce((acc, item) => acc + (item.product?.discountPrice || item.product?.price || 0) * item.quantity, 0)
  const deliveryFee = appliedCoupon ? appliedCoupon.shipping : (subtotal >= 499 ? 0 : 49)
  const discount = appliedCoupon ? appliedCoupon.discount : 0
  const tax = appliedCoupon ? appliedCoupon.tax : 0
  const total = appliedCoupon ? appliedCoupon.grandTotal : (subtotal + deliveryFee)

  // Clears cart in both local store and react-query cache
  const handleCartClear = () => {
    clearCart()
    queryClient.invalidateQueries({ queryKey: ['cart'] })
  }

  const orderMutation = useMutation({
    mutationFn: (data) => ordersAPI.create(data),
    onSuccess: (res) => {
      const { order, razorpay } = res.data.data
      if (paymentMethod === 'cod') {
        handleCartClear()
        toast.success('Order placed successfully!')
        navigate(`/orders/${order._id}`)
      } else {
        initiateRazorpay(razorpay, order)
      }
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to place order'),
  })

  const initiateRazorpay = (razorpayData, order) => {
    if (!window.Razorpay) {
      toast.error('Razorpay not loaded. Please refresh and try again.')
      return
    }

    // Get selected address details for prefill
    const addr = addresses?.find((a) => a._id === selectedAddress)

    const options = {
      key: razorpayData.key,
      amount: razorpayData.amount,
      currency: razorpayData.currency,
      order_id: razorpayData.orderId,
      name: 'ShopZone',
      description: `Order #${order._id.slice(-8).toUpperCase()}`,
      image: '/favicon.svg',
      prefill: {
        name: addr?.fullName || user?.name || '',
        email: user?.email || '',
        contact: addr?.mobile || user?.phone || '',
      },
      notes: {
        order_id: order._id,
        address: addr ? `${addr.houseNo}, ${addr.street}, ${addr.city}` : '',
      },
      theme: { color: '#2563eb' },
      modal: {
        // User closed the payment modal without completing payment
        ondismiss: () => {
          toast.error('Payment cancelled. Your order is saved — you can retry from Orders.')
          navigate(`/orders/${order._id}`)
        },
      },
      handler: async (response) => {
        try {
          await ordersAPI.verifyPayment({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            orderId: order._id,
          })
          handleCartClear()
          toast.success('Payment successful! Order placed.')
          navigate(`/orders/${order._id}`)
        } catch {
          toast.error('Payment verification failed. Please contact support.')
          navigate(`/orders/${order._id}`)
        }
      },
    }

    const rzp = new window.Razorpay(options)

    // Handle payment failures inside the modal (e.g. card declined)
    rzp.on('payment.failed', (response) => {
      toast.error(`Payment failed: ${response.error.description}`)
    })

    rzp.open()
  }

  const handlePlaceOrder = () => {
    if (!selectedAddress) { toast.error('Please select a delivery address'); return }
    const payload = {
      addressId: selectedAddress,
      paymentMethod,
      ...(appliedCoupon && { couponCode: appliedCoupon.coupon }),
    }
    orderMutation.mutate(payload)
  }

  const handleAddAddress = async (e) => {
    e.preventDefault()
    setAddingAddress(true)
    try {
      await addressesAPI.create(newAddress)
      await refetchAddresses()
      setShowAddressForm(false)
      setNewAddress({ fullName: '', mobile: '', houseNo: '', street: '', city: '', state: '', country: 'India', pincode: '' })
      toast.success('Address added')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add address')
    } finally {
      setAddingAddress(false)
    }
  }

  if (!cart) return <Spinner center />

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <h1 className="page-title">Checkout</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(280px, 340px)', gap: '1.5rem', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Delivery Address */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={18} color="var(--primary)" /> Delivery Address
              </h2>
              <button className="btn btn-outline btn-sm" onClick={() => setShowAddressForm(!showAddressForm)}>
                <Plus size={15} /> {showAddressForm ? 'Cancel' : 'New Address'}
              </button>
            </div>

            {showAddressForm && (
              <form onSubmit={handleAddAddress} style={{ marginBottom: '1.25rem', padding: '1rem', background: 'var(--gray-50)', borderRadius: 'var(--radius)' }}>
                <div className="grid grid-2">
                  {[
                    { field: 'fullName', label: 'Full Name', placeholder: 'John Doe' },
                    { field: 'mobile', label: 'Mobile', placeholder: '9876543210', pattern: '^[6-9][0-9]{9}$', title: 'Enter a valid 10-digit mobile number starting with 6-9', maxLength: 10, inputMode: 'numeric' },
                    { field: 'houseNo', label: 'House/Flat No', placeholder: '12A' },
                    { field: 'street', label: 'Street', placeholder: 'MG Road' },
                    { field: 'city', label: 'City', placeholder: 'Bangalore' },
                    { field: 'state', label: 'State', placeholder: 'Karnataka' },
                    { field: 'pincode', label: 'Pincode', placeholder: '560001', pattern: '^[0-9]{6}$', title: 'Enter a valid 6-digit pincode', maxLength: 6, inputMode: 'numeric' },
                  ].map(({ field, label, placeholder, pattern, title, maxLength, inputMode }) => (
                    <div className="form-group" key={field} style={{ margin: 0 }}>
                      <label className="form-label">{label}</label>
                      <input
                        className="form-input"
                        placeholder={placeholder}
                        value={newAddress[field]}
                        onChange={(e) => setNewAddress({ ...newAddress, [field]: e.target.value })}
                        required
                        pattern={pattern || undefined}
                        title={title || undefined}
                        maxLength={maxLength || undefined}
                        inputMode={inputMode || undefined}
                      />
                    </div>
                  ))}
                </div>
                <button type="submit" className="btn btn-primary" style={{ marginTop: '0.75rem' }} disabled={addingAddress}>
                  {addingAddress ? <span className="spinner spinner-sm" /> : null}
                  Save Address
                </button>
              </form>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {addresses?.map((addr) => (
                <label key={addr._id} style={{
                  display: 'flex', gap: '0.875rem', padding: '0.875rem 1rem',
                  border: `2px solid ${selectedAddress === addr._id ? 'var(--primary)' : 'var(--gray-200)'}`,
                  borderRadius: 'var(--radius)', cursor: 'pointer',
                  background: selectedAddress === addr._id ? 'var(--primary-light)' : 'white',
                }}>
                  <input type="radio" name="address" value={addr._id} checked={selectedAddress === addr._id}
                    onChange={() => setSelectedAddress(addr._id)} style={{ marginTop: '0.2rem', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{addr.fullName} — {addr.mobile}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--gray-600)', marginTop: '0.2rem' }}>
                      {addr.houseNo}, {addr.street}, {addr.city}, {addr.state} — {addr.pincode}
                    </div>
                    {addr.isDefault && <span className="badge badge-primary" style={{ marginTop: '0.375rem' }}>Default</span>}
                  </div>
                </label>
              ))}
              {addresses?.length === 0 && (
                <p style={{ color: 'var(--gray-400)', fontSize: '0.875rem' }}>No addresses saved. Add one above.</p>
              )}
            </div>
          </div>

          {/* Payment Method */}
          <div className="card">
            <h2 style={{ fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CreditCard size={18} color="var(--primary)" /> Payment Method
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { value: 'razorpay', label: 'Online Payment', desc: 'UPI, Cards, Net Banking via Razorpay', icon: '💳' },
                { value: 'cod', label: 'Cash on Delivery', desc: 'Pay when your order arrives', icon: '💵' },
              ].map(({ value, label, desc, icon }) => (
                <label key={value} style={{
                  display: 'flex', gap: '0.875rem', padding: '0.875rem 1rem', cursor: 'pointer',
                  border: `2px solid ${paymentMethod === value ? 'var(--primary)' : 'var(--gray-200)'}`,
                  borderRadius: 'var(--radius)',
                  background: paymentMethod === value ? 'var(--primary-light)' : 'white',
                }}>
                  <input type="radio" name="payment" value={value} checked={paymentMethod === value}
                    onChange={() => setPaymentMethod(value)} style={{ flexShrink: 0, marginTop: '0.2rem' }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{icon} {label}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginTop: '0.1rem' }}>{desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="card" style={{ position: 'sticky', top: 80 }}>
          <h2 style={{ fontWeight: 700, marginBottom: '1rem' }}>Order Summary</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 200, overflowY: 'auto', marginBottom: '1rem' }}>
            {items.map((item) => (
              <div key={item._id} style={{ display: 'flex', gap: '0.625rem', fontSize: '0.82rem' }}>
                <img src={item.product?.images?.[0]?.url} alt="" style={{ width: 36, height: 36, borderRadius: 4, objectFit: 'cover', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>{item.product?.title}</div>
                  <div style={{ color: 'var(--gray-500)' }}>x{item.quantity}</div>
                </div>
                <div style={{ fontWeight: 600 }}>₹{((item.product?.discountPrice || item.product?.price) * item.quantity).toLocaleString()}</div>
              </div>
            ))}
          </div>
          <hr className="divider" />

          {/* Coupon Section */}
          <div style={{ margin: '0.875rem 0' }}>
            {!appliedCoupon ? (
              <div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Tag size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                    <input
                      className="form-input"
                      placeholder="Coupon code"
                      value={couponInput}
                      onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError('') }}
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                      style={{ paddingLeft: 28, fontSize: '0.8rem', textTransform: 'uppercase' }}
                    />
                  </div>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={handleApplyCoupon}
                    disabled={applyMutation.isPending || !couponInput.trim()}
                  >
                    {applyMutation.isPending ? <span className="spinner spinner-sm" /> : 'Apply'}
                  </button>
                </div>
                {couponError && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.3rem' }}>{couponError}</p>}
              </div>
            ) : (
              <div style={{ background: '#dcfce7', borderRadius: 'var(--radius)', padding: '0.5rem 0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Tag size={12} /> {appliedCoupon.coupon}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--success)' }}>{appliedCoupon.couponTitle}</div>
                </div>
                <button className="btn btn-ghost btn-sm" style={{ padding: '0.2rem', color: 'var(--gray-400)' }} onClick={handleRemoveCoupon}>
                  <X size={14} />
                </button>
              </div>
            )}
          </div>

          <hr className="divider" style={{ margin: '0.375rem 0 0.625rem' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--gray-600)' }}>Subtotal</span>
              <span>₹{subtotal.toLocaleString()}</span>
            </div>
            {appliedCoupon && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)' }}>
                <span>
                  Discount ({appliedCoupon.discountType === 'percentage'
                    ? `${appliedCoupon.discountValue}%`
                    : `₹${appliedCoupon.discountValue}`})
                </span>
                <span>-₹{discount.toLocaleString()}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--gray-600)' }}>Delivery</span>
              <span style={{ color: deliveryFee === 0 ? 'var(--success)' : undefined }}>
                {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
              </span>
            </div>
            {appliedCoupon && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--gray-600)' }}>Tax (18% GST)</span>
                <span>₹{tax.toLocaleString()}</span>
              </div>
            )}
            <hr className="divider" style={{ margin: '0.375rem 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem' }}>
              <span>Total</span>
              <span>₹{total.toLocaleString()}</span>
            </div>
          </div>
          <button
            className="btn btn-primary btn-full btn-lg"
            onClick={handlePlaceOrder}
            disabled={orderMutation.isPending || !selectedAddress}
          >
            {orderMutation.isPending ? <span className="spinner spinner-sm" /> : <CheckCircle size={18} />}
            {orderMutation.isPending ? 'Placing Order...' : `Place Order — ₹${total.toLocaleString()}`}
          </button>
          <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)', textAlign: 'center', marginTop: '0.75rem' }}>
            🔒 Secured by Razorpay & SSL
          </p>
        </div>
      </div>
    </div>
  )
}
