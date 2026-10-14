import { useState, useEffect, useMemo } from 'react'
import Layout from '../components/Layout'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import {
  Search, ShoppingCart, Add, Remove, Delete, Close, ArrowBack,
  CheckCircle, LocalShipping, FilterList, SortByAlpha, TrendingUp,
  RestaurantMenu, HealthAndSafety, Star, AttachMoney
} from '@mui/icons-material'

const CATEGORIES = ['All', 'Soups', 'Healthy Meals', 'Fruits', 'Juices', 'Herbal Drinks', 'Recovery Foods']

export default function HealthFood() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [foods, setFoods] = useState([])
  const [cart, setCart] = useState({ items: [], subtotal: 0, delivery_fee: 0, tax: 0, grand_total: 0, item_count: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState('popular')
  const [cartOpen, setCartOpen] = useState(false)
  const [checkout, setCheckout] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(null)
  const [checkoutForm, setCheckoutForm] = useState({
    name: user?.full_name || '', mobile: '', email: user?.email || '',
    address: '', city: user?.city || '', district: user?.district || '',
    state: user?.state || '', pincode: '', payment_method: 'COD'
  })

  const fetchFoods = async () => {
    try {
      const res = await api.get('/api/food/foods', { params: { category, search, sort } })
      setFoods(res.data.foods || [])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const fetchCart = async () => {
    try {
      const res = await api.get('/api/food/cart')
      setCart(res.data)
    } catch (err) { console.error(err) }
  }

  useEffect(() => { fetchFoods(); fetchCart() }, [])
  useEffect(() => { fetchFoods() }, [category, sort])

  const addToCart = async (food) => {
    try {
      await api.post('/api/food/cart/add', { food_id: food.id, quantity: 1 })
      fetchCart()
      setCartOpen(true)
    } catch (err) { console.error(err) }
  }

  const updateQty = async (food_id, quantity) => {
    try {
      await api.post('/api/food/cart/update', { food_id, quantity })
      fetchCart()
    } catch (err) { console.error(err) }
  }

  const removeFromCart = async (food_id) => {
    try {
      await api.post('/api/food/cart/remove', { food_id })
      fetchCart()
    } catch (err) { console.error(err) }
  }

  const placeOrder = async (e) => {
    e.preventDefault()
    try {
      const res = await api.post('/api/food/order/create', {
        payment_method: checkoutForm.payment_method,
        delivery_address: {
          address: checkoutForm.address, city: checkoutForm.city,
          district: checkoutForm.district, state: checkoutForm.state, pincode: checkoutForm.pincode
        },
        customer_info: { name: checkoutForm.name, mobile: checkoutForm.mobile, email: checkoutForm.email }
      })
      setOrderPlaced(res.data)
      setCheckout(false)
      fetchCart()
    } catch (err) { console.error(err) }
  }

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30">
                <RestaurantMenu className="text-emerald-400" fontSize="large" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-800 dark:text-white">Health Food Store</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Disease-specific nutrition & healthy food delivery</p>
              </div>
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold shadow-lg shadow-blue-500/25">
              <ShoppingCart /> Cart
              {cart.item_count > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                  {cart.item_count}
                </span>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Search & Filter */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="relative md:col-span-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search healthy foods..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition" />
          </div>
          <select value={sort} onChange={e => setSort(e.target.value)}
            className="px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-800 text-gray-800 dark:text-white outline-none">
            <option value="popular">Most Popular</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
          </select>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                category === cat
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                  : 'bg-white dark:bg-white/5 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/10 hover:border-emerald-500/50'
              }`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Food Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-gray-200 dark:bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {foods.map((food, idx) => (
                <motion.div key={food.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: idx * 0.03 }}
                  whileHover={{ y: -5 }}
                  className="group relative rounded-2xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#1E293B]/80 backdrop-blur-xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 transition-all">
                  {/* Image area */}
                  <div className="h-36 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 flex items-center justify-center relative">
                    <span className="text-6xl">{food.image}</span>
                    {food.popular && (
                      <span className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/20 text-amber-500 text-xs font-bold">
                        <Star style={{ fontSize: 12 }} /> Popular
                      </span>
                    )}
                    <span className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-white/80 dark:bg-slate-900/80 text-xs font-semibold text-gray-600 dark:text-gray-300">
                      {food.category}
                    </span>
                  </div>
                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 dark:text-white mb-1">{food.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{food.description}</p>
                    {/* Health Benefits */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {food.health_benefits?.slice(0, 2).map((b, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-medium">{b}</span>
                      ))}
                    </div>
                    {/* Price + Add */}
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-black text-emerald-500">₹{food.price}</span>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={() => addToCart(food)}
                        className="flex items-center gap-1 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold shadow-lg shadow-emerald-500/20">
                        <Add style={{ fontSize: 16 }} /> Add
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {foods.length === 0 && !loading && (
          <div className="text-center py-20 text-gray-400">
            <RestaurantMenu className="text-6xl mb-4 opacity-30" />
            <p className="text-lg font-semibold">No foods found</p>
            <p className="text-sm">Try a different search or category</p>
          </div>
        )}

        {/* Cart Sidebar */}
        <AnimatePresence>
          {cartOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={() => setCartOpen(false)} />
              <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 h-full w-full max-w-md z-50 bg-white dark:bg-[#0F172A] border-l border-gray-200 dark:border-white/[0.08] flex flex-col shadow-2xl">
                {/* Cart Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/[0.08]">
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="text-blue-500" />
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Your Cart</h2>
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-xs font-bold">{cart.item_count || 0}</span>
                  </div>
                  <button onClick={() => setCartOpen(false)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5">
                    <Close className="text-gray-400" />
                  </button>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {cart.items?.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                      <ShoppingCart className="text-5xl mb-3 opacity-30" />
                      <p className="font-semibold">Your cart is empty</p>
                      <p className="text-sm">Add healthy foods to get started</p>
                    </div>
                  ) : cart.items?.map(item => (
                    <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                      <span className="text-3xl">{item.image}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 dark:text-white text-sm truncate">{item.name}</p>
                        <p className="text-emerald-500 font-bold text-sm">₹{item.price}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQty(item.food_id, item.quantity - 1)}
                          className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-white/10 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-white/20 transition">
                          <Remove style={{ fontSize: 14 }} className="text-gray-600 dark:text-gray-300" />
                        </button>
                        <span className="text-sm font-bold text-gray-800 dark:text-white w-5 text-center">{item.quantity}</span>
                        <button onClick={() => updateQty(item.food_id, item.quantity + 1)}
                          className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-white/10 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-white/20 transition">
                          <Add style={{ fontSize: 14 }} className="text-gray-600 dark:text-gray-300" />
                        </button>
                      </div>
                      <button onClick={() => removeFromCart(item.food_id)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition">
                        <Delete style={{ fontSize: 16 }} className="text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Cart Summary */}
                {cart.items?.length > 0 && (
                  <div className="p-6 border-t border-gray-200 dark:border-white/[0.08] space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>Subtotal</span><span>₹{cart.subtotal}</span>
                      </div>
                      <div className="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>Delivery Fee</span><span>₹{cart.delivery_fee}</span>
                      </div>
                      <div className="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>Tax (5%)</span><span>₹{cart.tax}</span>
                      </div>
                      <div className="flex justify-between text-lg font-black text-gray-800 dark:text-white pt-2 border-t border-gray-200 dark:border-white/10">
                        <span>Grand Total</span><span className="text-emerald-500">₹{cart.grand_total}</span>
                      </div>
                    </div>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => { setCartOpen(false); setCheckout(true) }}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold shadow-lg shadow-emerald-500/25">
                      Proceed to Checkout
                    </motion.button>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Checkout Modal */}
        <AnimatePresence>
          {checkout && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl border border-gray-200 dark:border-white/[0.08]">
                <div className="p-6 border-b border-gray-200 dark:border-white/[0.08] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setCheckout(false)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5">
                      <ArrowBack className="text-gray-400" />
                    </button>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Checkout</h2>
                  </div>
                </div>
                <form onSubmit={placeOrder} className="p-6 space-y-6">
                  {/* Customer Info */}
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Customer Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input required placeholder="Full Name" value={checkoutForm.name} onChange={e => setCheckoutForm({...checkoutForm, name: e.target.value})}
                        className="px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/50" />
                      <input required placeholder="Mobile Number" value={checkoutForm.mobile} onChange={e => setCheckoutForm({...checkoutForm, mobile: e.target.value})}
                        className="px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/50" />
                      <input required type="email" placeholder="Email" value={checkoutForm.email} onChange={e => setCheckoutForm({...checkoutForm, email: e.target.value})}
                        className="px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/50" />
                    </div>
                  </div>
                  {/* Delivery Address */}
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Delivery Address</h3>
                    <div className="space-y-3">
                      <textarea required placeholder="Full Address" rows={2} value={checkoutForm.address} onChange={e => setCheckoutForm({...checkoutForm, address: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none" />
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <input required placeholder="City" value={checkoutForm.city} onChange={e => setCheckoutForm({...checkoutForm, city: e.target.value})}
                          className="px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/50" />
                        <input required placeholder="District" value={checkoutForm.district} onChange={e => setCheckoutForm({...checkoutForm, district: e.target.value})}
                          className="px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/50" />
                        <input required placeholder="State" value={checkoutForm.state} onChange={e => setCheckoutForm({...checkoutForm, state: e.target.value})}
                          className="px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/50" />
                        <input required placeholder="Pincode" value={checkoutForm.pincode} onChange={e => setCheckoutForm({...checkoutForm, pincode: e.target.value})}
                          className="px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/50" />
                      </div>
                    </div>
                  </div>
                  {/* Payment */}
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Payment Method</h3>
                    <div className="flex gap-3">
                      {['COD', 'Online (Demo)'].map(pm => (
                        <button key={pm} type="button" onClick={() => setCheckoutForm({...checkoutForm, payment_method: pm === 'COD' ? 'COD' : 'Online'})}
                          className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
                            (pm === 'COD' ? checkoutForm.payment_method === 'COD' : checkoutForm.payment_method === 'Online')
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                              : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/10'
                          }`}>
                          {pm}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Order Summary */}
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06]">
                    <h3 className="font-bold text-gray-800 dark:text-white mb-3">Order Summary</h3>
                    {cart.items?.map(item => (
                      <div key={item.id} className="flex justify-between text-sm text-gray-600 dark:text-gray-400 py-1">
                        <span>{item.image} {item.name} x{item.quantity}</span>
                        <span>₹{item.subtotal}</span>
                      </div>
                    ))}
                    <div className="border-t border-gray-200 dark:border-white/10 mt-3 pt-3 flex justify-between font-black text-gray-800 dark:text-white">
                      <span>Grand Total</span><span className="text-emerald-500">₹{cart.grand_total}</span>
                    </div>
                  </div>
                  <motion.button type="submit" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-lg shadow-lg shadow-emerald-500/25">
                    Place Order - ₹{cart.grand_total}
                  </motion.button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Order Placed Modal */}
        <AnimatePresence>
          {orderPlaced && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-sm bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl border border-gray-200 dark:border-white/[0.08] p-8 text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
                  className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <CheckCircle className="text-white" fontSize="large" />
                </motion.div>
                <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-2">Order Placed!</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-4">Your healthy food is being prepared</p>
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-6">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Order ID</p>
                  <p className="text-2xl font-black text-emerald-500">{orderPlaced.order_id}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Status: Order Received</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => { setOrderPlaced(null); navigate('/my-orders') }}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold">
                    Track Order
                  </button>
                  <button onClick={() => setOrderPlaced(null)}
                    className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-800 dark:text-white font-semibold">
                    Continue Shopping
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  )
}
