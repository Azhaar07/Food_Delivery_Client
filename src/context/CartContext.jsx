import { createContext, useContext, useEffect, useMemo, useState } from 'react'

import { calculateDiscounts } from '@/utils/pricing'

const CART_KEY = 'foodflow.cart'
const CartContext = createContext(null)

const defaultCheckoutDraft = {
  customer_name: '',
  customer_phone: '',
  delivery_address: '',
}

const defaultPaymentDraft = {
  method: 'card',
  coupon_code: '',
  gift_card_code: '',
}

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const stored = localStorage.getItem(CART_KEY)
    if (!stored) {
      return { restaurant: null, items: [], checkoutDraft: defaultCheckoutDraft, paymentDraft: defaultPaymentDraft }
    }

    const parsed = JSON.parse(stored)
    return {
      restaurant: parsed.restaurant || null,
      items: parsed.items || [],
      checkoutDraft: { ...defaultCheckoutDraft, ...(parsed.checkoutDraft || {}) },
      paymentDraft: { ...defaultPaymentDraft, ...(parsed.paymentDraft || {}) },
    }
  })

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart))
  }, [cart])

  const addItem = (restaurant, foodItem) => {
    setCart((current) => {
      const switchingRestaurant = current.restaurant?.id && current.restaurant.id !== restaurant.id
      const nextRestaurant = current.restaurant?.id === restaurant.id ? current.restaurant : restaurant
      const nextItems = switchingRestaurant ? [] : [...current.items]

      const existing = nextItems.find((item) => item.id === foodItem.id)
      if (existing) {
        existing.quantity += 1
      } else {
        nextItems.push({ ...foodItem, quantity: 1 })
      }

      return {
        ...current,
        restaurant: nextRestaurant,
        items: nextItems,
        checkoutDraft: switchingRestaurant ? defaultCheckoutDraft : current.checkoutDraft,
        paymentDraft: switchingRestaurant ? defaultPaymentDraft : current.paymentDraft,
      }
    })
  }

  const updateQuantity = (id, quantity) => {
    setCart((current) => ({
      ...current,
      items: current.items
        .map((item) => (item.id === id ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0),
    }))
  }

  const clearCart = () =>
    setCart({
      restaurant: null,
      items: [],
      checkoutDraft: defaultCheckoutDraft,
      paymentDraft: defaultPaymentDraft,
    })

  const value = useMemo(() => {
    const subtotal = cart.items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)
    const deliveryFee = cart.restaurant ? Number(cart.restaurant.delivery_fee) : 0
    const discounts = calculateDiscounts(
      subtotal,
      cart.paymentDraft?.coupon_code,
      cart.paymentDraft?.gift_card_code,
    )
    return {
      cart,
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      payableTotal: Math.max(0, subtotal + deliveryFee - discounts.totalDiscount),
      itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
      discounts,
      addItem,
      updateQuantity,
      removeItem: (id) => updateQuantity(id, 0),
      setCheckoutDraft: (payload) =>
        setCart((current) => ({
          ...current,
          checkoutDraft: { ...current.checkoutDraft, ...payload },
        })),
      setPaymentDraft: (payload) =>
        setCart((current) => ({
          ...current,
          paymentDraft: { ...current.paymentDraft, ...payload },
        })),
      clearCart,
    }
  }, [cart])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used inside CartProvider.')
  }
  return context
}
