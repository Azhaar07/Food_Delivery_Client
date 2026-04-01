import { createContext, useCallback, useContext, useMemo, useState } from 'react'

import { adminApi, ordersApi } from '@/api/client'

const OrdersContext = createContext(null)

export const OrdersProvider = ({ children }) => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)

  const run = useCallback(async (task) => {
    setLoading(true)
    try {
      return await task()
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchOrders = useCallback(
    () =>
      run(async () => {
        const { data } = await ordersApi.listMine()
        setOrders(data)
        return data
      }),
    [run],
  )

  const placeOrder = useCallback(
    (payload) =>
      run(async () => {
        const { data } = await ordersApi.create(payload)
        setOrders((current) => [data, ...current])
        return data
      }),
    [run],
  )

  const getOrder = useCallback(async (id) => {
    const { data } = await ordersApi.detail(id)
    return data
  }, [])

  const getTracking = useCallback(async (id) => {
    const { data } = await ordersApi.tracking(id)
    return data
  }, [])

  const fetchAdminOrders = useCallback(async () => {
    const { data } = await adminApi.orders()
    return data
  }, [])

  const fetchAnalytics = useCallback(async () => {
    const { data } = await adminApi.analytics()
    return data
  }, [])

  const fetchAdminFoodItems = useCallback(async () => {
    const { data } = await adminApi.foodItems()
    return data
  }, [])

  const saveFoodItem = useCallback(async (payload) => {
    const request = payload.id
      ? adminApi.updateFoodItem(payload.id, payload)
      : adminApi.createFoodItem(payload)
    const { data } = await request
    return data
  }, [])

  const deleteFoodItem = useCallback(async (id) => {
    await adminApi.deleteFoodItem(id)
  }, [])

  const value = useMemo(
    () => ({
      orders,
      loading,
      fetchOrders,
      placeOrder,
      getOrder,
      getTracking,
      fetchAdminOrders,
      fetchAnalytics,
      fetchAdminFoodItems,
      saveFoodItem,
      deleteFoodItem,
    }),
    [
      orders,
      loading,
      fetchOrders,
      placeOrder,
      getOrder,
      getTracking,
      fetchAdminOrders,
      fetchAnalytics,
      fetchAdminFoodItems,
      saveFoodItem,
      deleteFoodItem,
    ],
  )

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>
}

export const useOrders = () => {
  const context = useContext(OrdersContext)
  if (!context) {
    throw new Error('useOrders must be used inside OrdersProvider.')
  }
  return context
}
