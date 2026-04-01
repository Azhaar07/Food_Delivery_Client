import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { PageTransition } from '@/components/ui/PageTransition'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { formatCurrency } from '@/utils/format'

export const CheckoutPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { cart, subtotal, deliveryFee, total, setCheckoutDraft } = useCart()
  const [error, setError] = useState('')
  const [form, setForm] = useState(cart.checkoutDraft)

  useEffect(() => {
    setForm((current) => ({
      ...current,
      customer_name: current.customer_name || user?.full_name || '',
    }))
  }, [user])

  if (!cart.items.length || !cart.restaurant) {
    return (
      <PageTransition className="glass-panel mx-auto max-w-2xl p-8 text-center">
        <h1 className="font-display text-4xl text-white">Checkout starts with a cart.</h1>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          Add a few dishes from a restaurant and come right back. Your delivery tracker will launch immediately after you place the order.
        </p>
        <Button className="mt-6" onClick={() => navigate('/')}>
          Back to restaurants
        </Button>
      </PageTransition>
    )
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    try {
      setCheckoutDraft(form)
      navigate('/payment')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <PageTransition className="grid gap-6 pb-12 lg:grid-cols-[1.1fr_0.9fr]">
      <form onSubmit={handleSubmit} className="space-y-5 rounded-[30px] border border-white/[0.08] bg-white/[0.04] p-6">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Delivery details</p>
          <h1 className="mt-3 font-display text-4xl text-white">Finish the order</h1>
          <p className="mt-2 text-sm leading-7 text-slate-300">
            Add your delivery details here, then continue to the dummy payment step with coupons, gift cards, and multiple payment methods.
          </p>
        </div>

        {error && <div className="rounded-2xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>}

        <div className="space-y-4">
          <input
            className="input-base"
            placeholder="Full name"
            value={form.customer_name}
            onChange={(event) => setForm((current) => ({ ...current, customer_name: event.target.value }))}
            required
          />
          <input
            className="input-base"
            placeholder="Phone number"
            value={form.customer_phone}
            onChange={(event) => setForm((current) => ({ ...current, customer_phone: event.target.value }))}
            required
          />
          <textarea
            rows="4"
            className="input-base resize-none"
            placeholder="Delivery address"
            value={form.delivery_address}
            onChange={(event) => setForm((current) => ({ ...current, delivery_address: event.target.value }))}
            required
          />
        </div>

        <Button type="submit" className="w-full justify-center">
          Continue to payment
        </Button>
      </form>

      <aside className="glass-panel h-fit space-y-5 p-6">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Order preview</p>
          <h2 className="mt-3 font-display text-3xl text-white">{cart.restaurant.name}</h2>
        </div>
        <div className="space-y-3">
          {cart.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-[22px] border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-slate-300">
              <span>
                {item.quantity} x {item.name}
              </span>
              <span>{formatCurrency(Number(item.price) * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="space-y-3 rounded-[24px] border border-white/[0.08] bg-white/[0.04] p-4 text-sm text-slate-300">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery fee</span>
            <span>{formatCurrency(deliveryFee)}</span>
          </div>
          <div className="flex justify-between border-t border-white/[0.08] pt-3 text-base font-semibold text-white">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </aside>
    </PageTransition>
  )
}
