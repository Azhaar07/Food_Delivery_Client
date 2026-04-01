import { Minus, Plus, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { PageTransition } from '@/components/ui/PageTransition'
import { useCart } from '@/context/CartContext'
import { formatCurrency } from '@/utils/format'

export const CartPage = () => {
  const { cart, subtotal, deliveryFee, total, updateQuantity, removeItem, clearCart } = useCart()

  if (!cart.items.length) {
    return (
      <PageTransition className="glass-panel mx-auto max-w-3xl p-8 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] bg-white/[0.04]">
          <ShoppingBag className="h-8 w-8 text-accent" />
        </div>
        <h1 className="mt-6 font-display text-4xl text-white">Your cart is quiet.</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-300">
          Pick a restaurant, add a few signature dishes, and FoodFlow will take you straight into the tracking experience.
        </p>
        <Link to="/" className="mt-6 inline-flex">
          <Button>Browse restaurants</Button>
        </Link>
      </PageTransition>
    )
  }

  return (
    <PageTransition className="grid gap-6 pb-12 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="space-y-4">
        <div>
          <h1 className="font-display text-4xl text-white">Cart review</h1>
          <p className="mt-2 text-sm text-slate-400">
            Ordering from {cart.restaurant?.name}. Quantities update instantly and persist locally.
          </p>
        </div>

        {cart.items.map((item) => (
          <div key={item.id} className="grid gap-4 rounded-[28px] border border-white/[0.08] bg-white/[0.04] p-5 sm:grid-cols-[96px_1fr_auto] sm:items-center">
            <img src={item.image_url} alt={item.name} className="h-24 w-24 rounded-[22px] object-cover" />
            <div className="space-y-2">
              <h2 className="font-display text-2xl text-white">{item.name}</h2>
              <p className="text-sm text-slate-400">{item.category}</p>
              <p className="text-sm text-slate-300">{formatCurrency(item.price)} each</p>
            </div>
            <div className="flex flex-col items-end gap-3">
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] p-1">
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.04] text-slate-200"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="min-w-8 text-center text-sm font-semibold text-white">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.04] text-slate-200"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <button type="button" onClick={() => removeItem(item.id)} className="text-sm text-rose-300">
                Remove
              </button>
            </div>
          </div>
        ))}
      </section>

      <aside className="glass-panel h-fit space-y-5 p-6">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Order summary</p>
          <h2 className="mt-3 font-display text-3xl text-white">{cart.restaurant?.name}</h2>
        </div>
        <div className="space-y-3 rounded-[24px] border border-white/[0.08] bg-white/[0.04] p-4 text-sm text-slate-300">
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Delivery fee</span>
            <span>{formatCurrency(deliveryFee)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-white/[0.08] pt-3 text-base font-semibold text-white">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
        <Link to="/checkout" className="block">
          <Button className="w-full justify-center">Continue to checkout</Button>
        </Link>
        <Button variant="secondary" className="w-full justify-center" onClick={clearCart}>
          Clear cart
        </Button>
      </aside>
    </PageTransition>
  )
}
