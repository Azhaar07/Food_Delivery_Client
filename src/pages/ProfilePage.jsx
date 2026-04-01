import { useEffect, useState } from 'react'
import { Clock3, PackageCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { PageTransition } from '@/components/ui/PageTransition'
import { useOrders } from '@/context/OrdersContext'
import { formatDateTime, formatCurrency, getStatusLabel, getStatusTone } from '@/utils/format'

export const ProfilePage = () => {
  const { orders, fetchOrders, loading } = useOrders()
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false

    const loadOrders = async () => {
      try {
        await fetchOrders()
      } catch (err) {
        if (!ignore) {
          setError(err.message)
        }
      }
    }

    loadOrders()

    return () => {
      ignore = true
    }
  }, [fetchOrders])

  return (
    <PageTransition className="space-y-6 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-4xl text-white">Order history</h1>
          <p className="mt-2 text-sm leading-7 text-slate-300">
            Review past orders, inspect status changes, and jump back into tracking when a delivery is still active.
          </p>
        </div>
        <Link to="/">
          <Button variant="secondary">Discover more restaurants</Button>
        </Link>
      </div>

      {error && <div className="rounded-[24px] border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>}

      {loading ? (
        <div className="rounded-[28px] border border-white/[0.08] bg-white/[0.04] p-6 text-sm text-slate-300">Loading your orders...</div>
      ) : orders.length === 0 ? (
        <div className="glass-panel p-8 text-center">
          <PackageCheck className="mx-auto h-10 w-10 text-accent" />
          <h2 className="mt-4 font-display text-3xl text-white">No orders yet</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Place your first order to unlock the full tracking experience.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-[30px] border border-white/[0.08] bg-white/[0.04] p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusTone(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-300">
                      #{order.order_code}
                    </span>
                  </div>
                  <div>
                    <h2 className="font-display text-2xl text-white">{order.restaurant.name}</h2>
                    <p className="mt-2 text-sm text-slate-400">
                      Ordered on {formatDateTime(order.created_at)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-300">
                    <span className="inline-flex items-center gap-2">
                      <Clock3 className="h-4 w-4 text-accent" />
                      {order.tracking.remaining_minutes > 0
                        ? `${order.tracking.remaining_minutes} mins remaining`
                        : 'Delivery closed'}
                    </span>
                    <span>{formatCurrency(order.total)}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {order.status !== 'DELIVERED' && (
                    <Link to={`/tracking/${order.id}`}>
                      <Button>Open tracking</Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageTransition>
  )
}
