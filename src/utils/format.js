export const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))

export const formatDateTime = (value) =>
  new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))

export const getStatusLabel = (status) =>
  (
    {
      PLACED: 'Order placed',
      PREPARING: 'Preparing now',
      OUT_FOR_DELIVERY: 'Out for delivery',
      DELIVERED: 'Delivered',
    }[status] || status
  )

export const getStatusTone = (status) =>
  (
    {
      PLACED: 'bg-white/10 text-slate-200',
      PREPARING: 'bg-amber-500/15 text-amber-200',
      OUT_FOR_DELIVERY: 'bg-emerald-500/15 text-emerald-200',
      DELIVERED: 'bg-accentSoft/20 text-accentSoft',
    }[status] || 'bg-white/10 text-slate-200'
  )

export const trackingSteps = ['PLACED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED']
