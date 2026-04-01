import { useEffect, useEffectEvent, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { foodApi } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { PageTransition } from '@/components/ui/PageTransition'
import { useOrders } from '@/context/OrdersContext'
import { formatCurrency, getStatusLabel } from '@/utils/format'

const defaultForm = {
  id: null,
  restaurant: '',
  name: '',
  description: '',
  category: '',
  price: '',
  image_url: '',
  is_vegetarian: false,
  is_available: true,
  spice_level: 'Medium',
}

export const AdminDashboardPage = () => {
  const { fetchAdminOrders, fetchAnalytics, fetchAdminFoodItems, saveFoodItem, deleteFoodItem } = useOrders()
  const [analytics, setAnalytics] = useState(null)
  const [orders, setOrders] = useState([])
  const [foodItems, setFoodItems] = useState([])
  const [restaurants, setRestaurants] = useState([])
  const [form, setForm] = useState(defaultForm)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadDashboard = useEffectEvent(async () => {
    try {
      const [{ data: restaurantList }, analyticsData, ordersData, foodItemsData] = await Promise.all([
        foodApi.restaurants(),
        fetchAnalytics(),
        fetchAdminOrders(),
        fetchAdminFoodItems(),
      ])
      setRestaurants(restaurantList)
      setAnalytics(analyticsData)
      setOrders(ordersData)
      setFoodItems(foodItemsData)
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  })

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      await saveFoodItem({
        ...form,
        restaurant: Number(form.restaurant),
        price: Number(form.price),
      })
      setForm(defaultForm)
      await loadDashboard()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleEdit = (item) => {
    setForm({
      id: item.id,
      restaurant: item.restaurant,
      name: item.name,
      description: item.description,
      category: item.category,
      price: item.price,
      image_url: item.image_url,
      is_vegetarian: item.is_vegetarian,
      is_available: item.is_available,
      spice_level: item.spice_level,
    })
  }

  const handleDelete = async (id) => {
    await deleteFoodItem(id)
    await loadDashboard()
  }

  return (
    <PageTransition className="space-y-6 pb-12">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-4xl text-white">Admin intelligence</h1>
          <p className="mt-2 text-sm leading-7 text-slate-300">
            Track operational throughput, manage menu inventory, and inspect how the ETA system is behaving across orders.
          </p>
        </div>
        <Button variant="secondary" onClick={() => setForm(defaultForm)}>
          Reset item form
        </Button>
      </div>

      {error && <div className="rounded-[24px] border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>}

      {loading || !analytics ? (
        <div className="glass-panel p-6 text-sm text-slate-300">Waking up analytics and operations data...</div>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ['Total orders', analytics.total_orders],
              ['Average delivery', `${analytics.average_delivery_minutes} mins`],
              ['Delay frequency', `${analytics.delay_frequency}%`],
              ['Delayed orders', analytics.delayed_orders],
            ].map(([label, value]) => (
              <div key={label} className="rounded-[28px] border border-white/[0.08] bg-white/[0.04] p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">{label}</p>
                <p className="mt-4 font-display text-4xl text-white">{value}</p>
              </div>
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="glass-panel p-6">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Orders per hour</p>
              <div className="mt-6 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.peak_hours}>
                    <defs>
                      <linearGradient id="peakFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ff5a5f" stopOpacity={0.45} />
                        <stop offset="100%" stopColor="#ff5a5f" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                    <XAxis dataKey="hour" stroke="#98aab5" />
                    <YAxis stroke="#98aab5" />
                    <Tooltip />
                    <Area type="monotone" dataKey="total" stroke="#ff5a5f" fill="url(#peakFill)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-panel p-6">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Status distribution</p>
              <div className="mt-6 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.status_breakdown}>
                    <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                    <XAxis dataKey="status" stroke="#98aab5" tickFormatter={getStatusLabel} />
                    <YAxis stroke="#98aab5" />
                    <Tooltip />
                    <Bar dataKey="total" fill="#ffb5b0" radius={[12, 12, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <form onSubmit={handleSubmit} className="glass-panel space-y-4 p-6">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Menu control</p>
                <h2 className="mt-2 font-display text-3xl text-white">
                  {form.id ? 'Edit food item' : 'Create food item'}
                </h2>
              </div>
              <select
                className="input-base"
                value={form.restaurant}
                onChange={(event) => setForm((current) => ({ ...current, restaurant: event.target.value }))}
                required
              >
                <option value="">Select restaurant</option>
                {restaurants.map((restaurant) => (
                  <option key={restaurant.id} value={restaurant.id}>
                    {restaurant.name}
                  </option>
                ))}
              </select>
              <input
                className="input-base"
                placeholder="Item name"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                required
              />
              <textarea
                rows="3"
                className="input-base resize-none"
                placeholder="Description"
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                required
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  className="input-base"
                  placeholder="Category"
                  value={form.category}
                  onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                  required
                />
                <input
                  className="input-base"
                  placeholder="Price"
                  type="number"
                  min="1"
                  value={form.price}
                  onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
                  required
                />
              </div>
              <input
                className="input-base"
                placeholder="Image URL"
                value={form.image_url}
                onChange={(event) => setForm((current) => ({ ...current, image_url: event.target.value }))}
                required
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex items-center gap-3 rounded-[20px] border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={form.is_vegetarian}
                    onChange={(event) => setForm((current) => ({ ...current, is_vegetarian: event.target.checked }))}
                  />
                  Vegetarian
                </label>
                <label className="flex items-center gap-3 rounded-[20px] border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={form.is_available}
                    onChange={(event) => setForm((current) => ({ ...current, is_available: event.target.checked }))}
                  />
                  Available
                </label>
              </div>
              <Button type="submit" className="w-full justify-center">
                {form.id ? 'Update item' : 'Create item'}
              </Button>
            </form>

            <div className="glass-panel p-6">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Food item inventory</p>
              <div className="mt-5 space-y-3">
                {foodItems.map((item) => (
                  <div key={item.id} className="flex flex-col gap-3 rounded-[24px] border border-white/[0.08] bg-white/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                      <p className="mt-1 text-sm text-slate-400">
                        {item.category} · {formatCurrency(item.price)}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="secondary" className="px-4 py-2.5" onClick={() => handleEdit(item)}>
                        Edit
                      </Button>
                      <Button variant="secondary" className="px-4 py-2.5 text-rose-200" onClick={() => handleDelete(item.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="glass-panel p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Live order board</p>
            <div className="mt-5 overflow-x-auto subtle-scrollbar">
              <table className="min-w-full text-left text-sm text-slate-300">
                <thead>
                  <tr className="border-b border-white/[0.08] text-xs uppercase tracking-[0.24em] text-slate-500">
                    <th className="px-3 py-3">Order</th>
                    <th className="px-3 py-3">Restaurant</th>
                    <th className="px-3 py-3">Customer</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-white/6 last:border-none">
                      <td className="px-3 py-4">#{order.order_code}</td>
                      <td className="px-3 py-4">{order.restaurant.name}</td>
                      <td className="px-3 py-4">{order.customer_name}</td>
                      <td className="px-3 py-4">{getStatusLabel(order.status)}</td>
                      <td className="px-3 py-4">{formatCurrency(order.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </PageTransition>
  )
}
