import { AnimatePresence, motion } from 'framer-motion'
import {
  CheckCircle2,
  CreditCard,
  Gift,
  MapPin,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  TicketPercent,
  Wallet,
} from 'lucide-react'
import { startTransition, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { PageTransition } from '@/components/ui/PageTransition'
import { useCart } from '@/context/CartContext'
import { useOrders } from '@/context/OrdersContext'
import { formatCurrency } from '@/utils/format'
import { calculateDiscounts, PAYMENT_METHODS } from '@/utils/pricing'

const paymentLabelMap = Object.fromEntries(PAYMENT_METHODS.map((method) => [method.id, method.label]))

export const PaymentPage = () => {
  const navigate = useNavigate()
  const { cart, subtotal, deliveryFee, setPaymentDraft, clearCart } = useCart()
  const { placeOrder, loading } = useOrders()
  const [payment, setPayment] = useState(cart.paymentDraft)
  const [error, setError] = useState('')
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [successOrder, setSuccessOrder] = useState(null)
  const hasCheckoutData = Boolean(cart.items.length && cart.restaurant && cart.checkoutDraft.delivery_address)

  const previewDiscounts = calculateDiscounts(subtotal, payment.coupon_code, payment.gift_card_code)
  const previewPayableTotal = Math.max(0, subtotal + deliveryFee - previewDiscounts.totalDiscount)

  useEffect(() => {
    if (!successOrder) return undefined

    const timeoutId = window.setTimeout(() => {
      clearCart()
      startTransition(() => navigate(`/tracking/${successOrder.id}`))
    }, 2800)

    return () => window.clearTimeout(timeoutId)
  }, [clearCart, navigate, successOrder])

  const handlePaymentChange = (payload) => {
    const next = { ...payment, ...payload }
    setPayment(next)
    setPaymentDraft(next)
  }

  const openConfirmation = (event) => {
    event.preventDefault()
    setError('')
    setShowConfirmModal(true)
  }

  const handleConfirmOrder = async () => {
    setError('')

    try {
      const order = await placeOrder({
        restaurant_id: cart.restaurant.id,
        ...cart.checkoutDraft,
        payment_method: payment.method,
        coupon_code: payment.coupon_code,
        gift_card_code: payment.gift_card_code,
        items: cart.items.map((item) => ({
          food_item_id: item.id,
          quantity: item.quantity,
        })),
      })
      setShowConfirmModal(false)
      setSuccessOrder(order)
    } catch (err) {
      setShowConfirmModal(false)
      setError(err.message)
    }
  }

  if (!hasCheckoutData && !successOrder) {
    return (
      <PageTransition className="glass-panel mx-auto max-w-2xl p-8 text-center">
        <h1 className="font-display text-4xl text-white">Payment needs a checkout first.</h1>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          Add delivery details first, then come back here to simulate payment and place the order.
        </p>
        <Button className="mt-6" onClick={() => navigate('/checkout')}>
          Go to checkout
        </Button>
      </PageTransition>
    )
  }

  return (
    <>
      <PageTransition className="grid gap-6 pb-12 xl:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={openConfirmation} className="space-y-5 rounded-[30px] border border-white/[0.08] bg-white/[0.04] p-6">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Payment</p>
            <h1 className="mt-3 font-display text-4xl text-white">Choose a dummy payment method</h1>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              This is a demo payment screen with realistic options. Try coupon codes `SAVE10`, `FREEMEAL`, or `REDGLOW`, and gift cards `GIFT200` or `WELCOME100`.
            </p>
          </div>

          <div className="grid gap-3">
            {PAYMENT_METHODS.map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => handlePaymentChange({ method: method.id })}
                className={`rounded-[24px] border p-4 text-left transition ${
                  payment.method === method.id
                    ? 'border-accent/40 bg-accent/10'
                    : 'border-white/[0.08] bg-white/[0.03] hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-white">{method.label}</p>
                    <p className="mt-1 text-sm text-slate-400">{method.hint}</p>
                  </div>
                  <div className={`h-4 w-4 rounded-full border ${payment.method === method.id ? 'border-accent bg-accent' : 'border-white/30'}`} />
                </div>
              </button>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="inline-flex items-center gap-2 text-sm text-slate-300">
                <TicketPercent className="h-4 w-4 text-accent" />
                Coupon code
              </span>
              <input
                className="input-base"
                placeholder="Enter coupon code"
                value={payment.coupon_code}
                onChange={(event) => handlePaymentChange({ coupon_code: event.target.value })}
              />
            </label>
            <label className="space-y-2">
              <span className="inline-flex items-center gap-2 text-sm text-slate-300">
                <Gift className="h-4 w-4 text-accent" />
                Gift card
              </span>
              <input
                className="input-base"
                placeholder="Enter gift card code"
                value={payment.gift_card_code}
                onChange={(event) => handlePaymentChange({ gift_card_code: event.target.value })}
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="inline-flex items-center gap-2 text-sm text-slate-300">
                <CreditCard className="h-4 w-4 text-accent" />
                Card / UPI reference
              </span>
              <input className="input-base" placeholder="4111 1111 1111 1111 / yourupi@bank" />
            </label>
            <label className="space-y-2">
              <span className="inline-flex items-center gap-2 text-sm text-slate-300">
                <Wallet className="h-4 w-4 text-accent" />
                Name on payment
              </span>
              <input className="input-base" placeholder="Demo Customer" />
            </label>
          </div>

          {error && <div className="rounded-2xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>}

          <Button type="submit" className="w-full justify-center" disabled={loading}>
            Confirm order
          </Button>
        </form>

        <aside className="glass-panel h-fit space-y-5 p-6">
          <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.04] p-5">
            <div className="flex items-center gap-2 text-slate-300">
              <ShieldCheck className="h-4 w-4 text-accentSoft" />
              <span className="text-xs uppercase tracking-[0.24em]">Secure demo checkout</span>
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              Payment options are simulated for presentation. No real transaction data is stored.
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Final summary</p>
            <h2 className="mt-3 font-display text-3xl text-white">{cart.restaurant.name}</h2>
            <p className="mt-2 text-sm text-slate-400">{cart.checkoutDraft.delivery_address}</p>
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
            <div className="flex justify-between">
              <span>Coupon savings</span>
              <span>-{formatCurrency(previewDiscounts.couponAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Gift card applied</span>
              <span>-{formatCurrency(previewDiscounts.giftCardAmount)}</span>
            </div>
            <div className="flex justify-between border-t border-white/[0.08] pt-3 text-base font-semibold text-white">
              <span>Payable now</span>
              <span>{formatCurrency(previewPayableTotal)}</span>
            </div>
          </div>

          <Button variant="secondary" className="w-full justify-center" onClick={() => navigate('/checkout')}>
            Back to delivery details
          </Button>
        </aside>
      </PageTransition>

      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
            onClick={() => !loading && setShowConfirmModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 28, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
              className="relative w-full max-w-2xl overflow-hidden rounded-[32px] border border-white/[0.08] bg-[#101317] p-6 shadow-[0_40px_120px_rgba(0,0,0,0.45)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,90,95,0.16),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent)]" />
              <div className="relative">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-accent">Final confirmation</p>
                    <h2 className="mt-3 font-display text-4xl text-white">Review before placing the order</h2>
                    <p className="mt-3 text-sm leading-7 text-slate-300">
                      You are about to place a demo order with live tracking enabled immediately after confirmation.
                    </p>
                  </div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-white shadow-[0_16px_40px_rgba(255,90,95,0.3)]">
                    <ReceiptText className="h-6 w-6" />
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.04] p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Payment method</p>
                    <p className="mt-2 text-lg font-semibold text-white">{paymentLabelMap[payment.method]}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      {payment.coupon_code ? `Coupon ${payment.coupon_code.toUpperCase()} applied` : 'No coupon added'}
                    </p>
                  </div>
                  <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.04] p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Delivery to</p>
                    <div className="mt-2 flex items-start gap-2 text-slate-300">
                      <MapPin className="mt-0.5 h-4 w-4 text-accent" />
                      <p className="leading-6">{cart.checkoutDraft.delivery_address}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-[24px] border border-white/[0.08] bg-white/[0.04] p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Order details</p>
                  <div className="mt-4 space-y-3">
                    {cart.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm text-slate-300">
                        <span>
                          {item.quantity} x {item.name}
                        </span>
                        <span>{formatCurrency(Number(item.price) * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 border-t border-white/[0.08] pt-4 text-sm text-slate-300">
                    <div className="flex justify-between">
                      <span>Payable total</span>
                      <span className="font-semibold text-white">{formatCurrency(previewPayableTotal)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap justify-end gap-3">
                  <Button variant="secondary" onClick={() => setShowConfirmModal(false)} disabled={loading}>
                    Edit order
                  </Button>
                  <Button onClick={handleConfirmOrder} disabled={loading}>
                    {loading ? 'Placing order...' : 'Place order now'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {successOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.86 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex aspect-square w-full max-w-[24rem] items-center justify-center overflow-hidden rounded-full border border-white/[0.08] bg-[#0f1317] p-6 text-center shadow-[0_40px_120px_rgba(0,0,0,0.5)]"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,90,95,0.24),transparent_34%),radial-gradient(circle_at_bottom,rgba(255,181,176,0.16),transparent_34%)]" />
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute left-1/2 top-16 h-36 w-36 -translate-x-1/2 rounded-full bg-accent/10 blur-3xl"
              />
              {Array.from({ length: 12 }).map((_, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 0, x: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    y: [-8, -60 - index * 2],
                    x: [0, (index % 2 === 0 ? -1 : 1) * (18 + index * 2)],
                    rotate: [0, index % 2 === 0 ? -22 : 22],
                  }}
                  transition={{
                    duration: 1.6,
                    repeat: Infinity,
                    delay: index * 0.08,
                    ease: 'easeOut',
                  }}
                  className="absolute left-1/2 top-24 h-2.5 w-2.5 rounded-full bg-accent"
                />
              ))}
              <div className="absolute inset-4">
                <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                  <circle cx="50" cy="50" r="47" className="fill-none stroke-white/10" strokeWidth="1.8" />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="47"
                    className="fill-none stroke-accent"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeDasharray="295.31"
                    initial={{ strokeDashoffset: 295.31 }}
                    animate={{ strokeDashoffset: 0 }}
                    transition={{ duration: 2.2, ease: 'easeInOut' }}
                  />
                </svg>
              </div>

              <div className="relative flex max-w-[15rem] flex-col items-center">
                <motion.div
                  initial={{ scale: 0.78, rotate: -10 }}
                  animate={{ scale: [0.78, 1.06, 1], rotate: [0, 6, 0] }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                  className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-accent/30 bg-accent/10 text-accent shadow-[0_20px_60px_rgba(255,90,95,0.28)]"
                >
                  <CheckCircle2 className="h-12 w-12" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.16, duration: 0.32 }}
                  className="mt-6"
                >
                  <div className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-accent">
                    <Sparkles className="h-3.5 w-3.5" />
                    Order successful
                  </div>
                  <h2 className="mt-4 font-display text-3xl text-white">Order placed</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    #{successOrder.order_code} is confirmed for {successOrder.restaurant.name}.
                  </p>
                  <p className="mt-2 text-sm text-slate-400">Opening live tracking as soon as this animation completes.</p>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
