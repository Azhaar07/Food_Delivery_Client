const COUPON_VALUES = {
  SAVE10: { type: 'percent', value: 0.1, label: '10% off food subtotal' },
  FREEMEAL: { type: 'flat', value: 150, label: 'Flat Rs.150 off' },
  REDGLOW: { type: 'flat', value: 100, label: 'Flat Rs.100 off' },
}

const GIFT_CARD_VALUES = {
  GIFT200: 200,
  WELCOME100: 100,
}

export const calculateDiscounts = (subtotal, couponCode = '', giftCardCode = '') => {
  const normalizedCoupon = couponCode.trim().toUpperCase()
  const normalizedGiftCard = giftCardCode.trim().toUpperCase()
  let couponAmount = 0
  let giftCardAmount = 0

  if (COUPON_VALUES[normalizedCoupon]) {
    const coupon = COUPON_VALUES[normalizedCoupon]
    couponAmount = coupon.type === 'percent' ? subtotal * coupon.value : coupon.value
  }

  if (GIFT_CARD_VALUES[normalizedGiftCard]) {
    giftCardAmount = GIFT_CARD_VALUES[normalizedGiftCard]
  }

  const totalDiscount = Math.min(subtotal, couponAmount + giftCardAmount)

  return {
    couponAmount: Math.round(couponAmount),
    giftCardAmount: Math.round(giftCardAmount),
    totalDiscount: Math.round(totalDiscount),
    normalizedCoupon,
    normalizedGiftCard,
    couponLabel: COUPON_VALUES[normalizedCoupon]?.label || '',
  }
}

export const PAYMENT_METHODS = [
  { id: 'card', label: 'Credit / Debit Card', hint: 'Visa, Mastercard, RuPay' },
  { id: 'paypal', label: 'PayPal', hint: 'Fast guest checkout flow' },
  { id: 'netbanking', label: 'Internet Banking', hint: 'Major Indian banks' },
  { id: 'upi', label: 'UPI', hint: 'Any UPI ID or QR simulation' },
  { id: 'wallet', label: 'Wallet', hint: 'Paytm, PhonePe Wallet, Amazon Pay' },
  { id: 'applepay', label: 'Apple Pay', hint: 'Quick one-tap payment simulation' },
]
