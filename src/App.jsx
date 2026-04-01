import { Suspense, lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { AuthProvider } from '@/context/AuthContext'
import { CartProvider } from '@/context/CartContext'
import { OrdersProvider } from '@/context/OrdersContext'
import { useThemeMode } from '@/hooks/useThemeMode'

const HomePage = lazy(() => import('@/pages/HomePage').then((module) => ({ default: module.HomePage })))
const RestaurantPage = lazy(() => import('@/pages/RestaurantPage').then((module) => ({ default: module.RestaurantPage })))
const CartPage = lazy(() => import('@/pages/CartPage').then((module) => ({ default: module.CartPage })))
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage').then((module) => ({ default: module.CheckoutPage })))
const PaymentPage = lazy(() => import('@/pages/PaymentPage').then((module) => ({ default: module.PaymentPage })))
const TrackingPage = lazy(() => import('@/pages/TrackingPage').then((module) => ({ default: module.TrackingPage })))
const ProfilePage = lazy(() => import('@/pages/ProfilePage').then((module) => ({ default: module.ProfilePage })))
const AdminDashboardPage = lazy(() => import('@/pages/AdminDashboardPage').then((module) => ({ default: module.AdminDashboardPage })))
const LoginPage = lazy(() => import('@/pages/LoginPage').then((module) => ({ default: module.LoginPage })))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })))

const PageFallback = () => (
  <div className="glass-panel p-6 text-sm text-slate-300">Loading FoodFlow...</div>
)

const AppRoutes = () => {
  const { theme, toggleTheme } = useThemeMode()

  return (
    <BrowserRouter>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<AppLayout theme={theme} onToggleTheme={toggleTheme} />}>
            <Route index element={<HomePage />} />
            <Route path="restaurants/:id" element={<RestaurantPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route
              path="checkout"
              element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="payment"
              element={
                <ProtectedRoute>
                  <PaymentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="tracking/:id"
              element={
                <ProtectedRoute>
                  <TrackingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route path="login" element={<LoginPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

const App = () => (
  <AuthProvider>
    <CartProvider>
      <OrdersProvider>
        <AppRoutes />
      </OrdersProvider>
    </CartProvider>
  </AuthProvider>
)

export default App
