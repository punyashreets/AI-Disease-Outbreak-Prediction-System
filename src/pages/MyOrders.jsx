import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../services/api'
import {
  ShoppingCart, LocalShipping, CheckCircle, Timer, Inventory,
  ExpandMore, ExpandLess, Download, LocationOn, Receipt
} from '@mui/icons-material'

const ORDER_STEPS = [
  { label: 'Order Received', icon: Receipt, color: 'bg-blue-500' },
  { label: 'Preparing Food', icon: Inventory, color: 'bg-amber-500' },
  { label: 'Packed', icon: CheckCircle, color: 'bg-purple-500' },
  { label: 'Out For Delivery', icon: LocalShipping, color: 'bg-cyan-500' },
  { label: 'Delivered', icon: CheckCircle, color: 'bg-emerald-500' },
]

export default function MyOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState(null)

  const fetchOrders = async () => {
    try {
      const res = await api.get('/api/food/orders')
      setOrders(res.data.orders || [])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchOrders() }, [])

  const getStepIndex = (status) => ORDER_STEPS.findIndex(s => s.label === status)

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
              <ShoppingCart className="text-blue-400" fontSize="large" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-800 dark:text-white">My Orders</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Track your healthy food orders</p>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 rounded-2xl bg-gray-200 dark:bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingCart className="text-6xl text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-xl font-bold text-gray-800 dark:text-white mb-2">No orders yet</p>
            <p className="text-gray-500 dark:text-gray-400">Start ordering healthy food from our catalog</p>
          </div>
        ) : (
          <motion.div initial="hidden" animate="show" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
            className="space-y-4">
            {orders.map((order, idx) => {
              const isExpanded = expandedOrder === order.id
              const stepIdx = getStepIndex(order.status)
              const isCancelled = order.status === 'Cancelled'

              return (
                <motion.div key={order.id} variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                  className="rounded-2xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#1E293B]/80 backdrop-blur-xl overflow-hidden">
                  {/* Order Header */}
                  <div className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02] transition"
                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        isCancelled ? 'bg-red-500/10' : stepIdx >= 4 ? 'bg-emerald-500/10' : 'bg-blue-500/10'
                      }`}>
                        {isCancelled ? <span className="text-red-500 text-xl">✕</span> : <LocalShipping className={stepIdx >= 4 ? 'text-emerald-500' : 'text-blue-500'} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold text-gray-800 dark:text-white">{order.order_number}</h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            isCancelled ? 'bg-red-500/10 text-red-500' :
                            stepIdx >= 4 ? 'bg-emerald-500/10 text-emerald-500' :
                            'bg-blue-500/10 text-blue-500'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          {' • '}{order.items?.length || 0} items • ₹{order.grand_total}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-black text-emerald-500 hidden sm:block">₹{order.grand_total}</span>
                      {isExpanded ? <ExpandLess className="text-gray-400" /> : <ExpandMore className="text-gray-400" />}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden">
                        <div className="px-5 pb-5 space-y-5 border-t border-gray-200 dark:border-white/[0.06] pt-5">
                          {/* Order Tracking Timeline */}
                          {!isCancelled && (
                            <div>
                              <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">Order Tracking</h4>
                              <div className="flex items-center justify-between relative">
                                {/* Progress Line */}
                                <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 dark:bg-white/10" />
                                <div className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                                  style={{ width: `${(stepIdx / (ORDER_STEPS.length - 1)) * 100}%` }} />
                                
                                {ORDER_STEPS.map((step, i) => (
                                  <div key={i} className="relative flex flex-col items-center z-10">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                      i <= stepIdx
                                        ? `${step.color} text-white shadow-lg`
                                        : 'bg-gray-200 dark:bg-white/10 text-gray-400'
                                    }`}>
                                      <step.icon style={{ fontSize: 18 }} />
                                    </div>
                                    <span className={`text-[10px] font-semibold mt-2 text-center max-w-[70px] ${
                                      i <= stepIdx ? 'text-gray-800 dark:text-white' : 'text-gray-400'
                                    }`}>{step.label}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Order Items */}
                          <div>
                            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Order Items</h4>
                            <div className="space-y-2">
                              {order.items?.map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03]">
                                  <div className="flex items-center gap-3">
                                    <span className="text-2xl">{item.image}</span>
                                    <div>
                                      <p className="font-semibold text-gray-800 dark:text-white text-sm">{item.food_name}</p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">Qty: {item.quantity} × ₹{item.price}</p>
                                    </div>
                                  </div>
                                  <span className="font-bold text-gray-800 dark:text-white">₹{item.subtotal}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Price Breakdown */}
                          <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/[0.03] space-y-2 text-sm">
                            <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>Subtotal</span><span>₹{order.grand_total - 40 - Math.round((order.grand_total - 40) * 0.05 / 1.05)}</span></div>
                            <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>Delivery Fee</span><span>₹40</span></div>
                            <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>Tax (5%)</span><span>₹{Math.round((order.grand_total - 40) * 0.05 / 1.05)}</span></div>
                            <div className="flex justify-between font-black text-gray-800 dark:text-white pt-2 border-t border-gray-200 dark:border-white/10">
                              <span>Grand Total</span><span className="text-emerald-500">₹{order.grand_total}</span>
                            </div>
                          </div>

                          {/* Delivery Address */}
                          {order.delivery_address && (
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 dark:bg-white/[0.03]">
                              <LocationOn className="text-gray-400 mt-0.5" style={{ fontSize: 20 }} />
                              <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Delivery Address</p>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                  {order.delivery_address.address}, {order.delivery_address.city}, {order.delivery_address.district}, {order.delivery_address.state} - {order.delivery_address.pincode}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </div>
    </Layout>
  )
}
