import { useEffect, useEffectEvent, useState } from 'react'
import { AlertTriangle, Clock3, ShieldCheck, Store, TimerReset, Truck } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'

import { FakeMap } from '@/components/tracking/FakeMap'
import { Button } from '@/components/ui/Button'
import { PageTransition } from '@/components/ui/PageTransition'
import { useOrders } from '@/context/OrdersContext'
import { formatCurrency, getStatusLabel, trackingSteps } from '@/utils/format'

export const TrackingPage = () => {
  const { id } = useParams()
  const { getOrder, getTracking } = useOrders()
  const [tracking, setTracking] = useState(null)
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const syncTracking = useEffectEvent(async (includeOrder = false) => {
    try {
      const [trackingData, orderData] = await Promise.all([
        getTracking(id),
        includeOrder || !order ? getOrder(id) : Promise.resolve(order),
      ])
      setTracking(trackingData)
      setOrder(orderData)
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  })

  useEffect(() => {
    let isCancelled = false

    const boot = async () => {
      if (!isCancelled) {
        await syncTracking(true)
      }
    }

    boot()
    const intervalId = window.setInterval(() => {
      if (!isCancelled) {
        syncTracking(false)
      }
    }, 5000)

    return () => {
      isCancelled = true
      window.clearInterval(intervalId)
    }
  }, [id, syncTracking])

  if (loading) {
    return (
      <PageTransition className="glass-panel p-8 text-center text-slate-300">
        Syncing your delivery tracker...
      </PageTransition>
    )
  }

  if (error || !tracking || !order) {
    return (
      <PageTransition className="rounded-[30px] border border-rose-500/25 bg-rose-500/10 p-6 text-rose-100">
        {error || 'Tracking is unavailable right now.'}
      </PageTransition>
    )
  }

  const currentStep = trackingSteps.indexOf(tracking.status)

  return (
    <PageTransition className="space-y-6 pb-12">
      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="glass-panel overflow-hidden p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
              <span className="inline-flex rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-accent">
                Order tracking
              </span>
              <div>
                <h1 className="font-display text-4xl text-white sm:text-5xl">{tracking.eta_label}</h1>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  {tracking.restaurant_name} is moving through a backend-driven simulation with status updates every 5 seconds.
                </p>
              </div>
            </div>
            <div className="rounded-[28px] border border-white/[0.08] bg-white/[0.04] px-5 py-4 text-right">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Confidence</p>
              <p className="mt-2 font-display text-4xl text-white">{tracking.confidence_score}%</p>
              <p className="mt-2 text-sm text-slate-400">On-time likelihood</p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.04] p-4">
              <Store className="h-5 w-5 text-accent" />
              <p className="mt-4 text-xs uppercase tracking-[0.24em] text-slate-400">Restaurant</p>
              <p className="mt-2 text-lg font-semibold text-white">{tracking.restaurant_name}</p>
            </div>
            <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.04] p-4">
              <Clock3 className="h-5 w-5 text-accent" />
              <p className="mt-4 text-xs uppercase tracking-[0.24em] text-slate-400">Order ID</p>
              <p className="mt-2 text-lg font-semibold text-white">#{tracking.order_code}</p>
            </div>
            <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.04] p-4">
              <ShieldCheck className="h-5 w-5 text-accentSoft" />
              <p className="mt-4 text-xs uppercase tracking-[0.24em] text-slate-400">Current status</p>
              <p className="mt-2 text-lg font-semibold text-white">{getStatusLabel(tracking.status)}</p>
            </div>
          </div>
        </div>

        <aside className="glass-panel space-y-4 p-6">
          <div className="flex items-center gap-2 text-slate-400">
            <TimerReset className="h-4 w-4 text-accent" />
            <span className="text-xs uppercase tracking-[0.24em]">Order summary</span>
          </div>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-[22px] border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-slate-300">
                <span>
                  {item.quantity} x {item.name_snapshot}
                </span>
                <span>{formatCurrency(item.line_total)}</span>
              </div>
            ))}
          </div>
          <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.04] p-4 text-sm text-slate-300">
            <div className="flex justify-between">
              <span>Total paid</span>
              <span className="font-semibold text-white">{formatCurrency(order.total)}</span>
            </div>
            <div className="mt-3 border-t border-white/[0.08] pt-3">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Delivery address</p>
              <p className="mt-2 leading-6 text-slate-300">{order.delivery_address}</p>
            </div>
          </div>
        </aside>
      </section>

      <FakeMap
        current={tracking.current_location}
        start={tracking.start_location}
        end={tracking.end_location}
        progress={tracking.route_progress}
      />

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-panel p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Current phase</p>
              <h2 className="mt-2 font-display text-3xl text-white">{getStatusLabel(tracking.status)}</h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-300">
              <Truck className="h-4 w-4 text-accent" />
              {tracking.progress_percentage}% complete
            </div>
          </div>

          <div className="mt-6 h-3 rounded-full bg-white/[0.05]">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-accent via-[#ff7a7f] to-accentSoft"
              animate={{ width: `${Math.max(tracking.progress_percentage, 4)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-4">
            {trackingSteps.map((step, index) => {
              const complete = currentStep >= index
              return (
                <div
                  key={step}
                  className={`rounded-[22px] border px-4 py-4 transition ${
                    complete
                      ? 'border-accent/30 bg-accent/10 text-white'
                      : 'border-white/[0.08] bg-white/[0.03] text-slate-500'
                  }`}
                >
                  <p className="text-xs uppercase tracking-[0.22em]">{index + 1}</p>
                  <p className="mt-3 text-sm font-semibold">{getStatusLabel(step)}</p>
                </div>
              )
            })}
          </div>
        </div>

        <div className="glass-panel p-6">
          <div className="flex items-center gap-2 text-slate-400">
            <AlertTriangle className={`h-4 w-4 ${tracking.delay_visible ? 'text-danger' : 'text-accentSoft'}`} />
            <span className="text-xs uppercase tracking-[0.24em]">Delivery insight</span>
          </div>
          {tracking.delay_visible ? (
            <div className="mt-4 rounded-[24px] border border-danger/25 bg-danger/10 p-5 text-sm leading-7 text-rose-100">
              {tracking.delay_reason}. The ETA and confidence meter were adjusted to keep the prediction trustworthy.
            </div>
          ) : (
            <div className="mt-4 rounded-[24px] border border-emerald-500/20 bg-emerald-500/10 p-5 text-sm leading-7 text-emerald-100">
              Your delivery is moving inside the expected time window. We’ll surface delay context here only when the model detects it.
            </div>
          )}
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/profile">
              <Button variant="secondary">Back to orders</Button>
            </Link>
            <Link to="/">
              <Button>Order again</Button>
            </Link>
          </div>
        </div>
      </section>
    </PageTransition>
  )
}
