import { AnimatePresence, motion } from 'framer-motion'
import { Moon, ShoppingBag, Sparkles, SunMedium } from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'

import { SiteFooter } from '@/components/layout/SiteFooter'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'

export const AppLayout = ({ theme, onToggleTheme }) => {
  const { isAuthenticated, isAdmin, logout, user } = useAuth()
  const { itemCount } = useCart()
  const location = useLocation()
  const navItems = [
    { label: 'Discover', to: '/' },
    { label: isAuthenticated ? 'Orders' : 'Sign in', to: isAuthenticated ? '/profile' : '/login' },
    ...(isAdmin ? [{ label: 'Admin', to: '/admin' }] : []),
  ]

  return (
    <div className="app-grid min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="glass-panel sticky top-4 z-30 mb-6 flex items-center justify-between gap-4 px-5 py-4">
          <NavLink to="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-white shadow-[0_10px_35px_rgba(255,90,95,0.35)]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className={`font-display text-lg font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                FoodFlow
              </p>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Confident delivery</p>
            </div>
          </NavLink>

          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `rounded-full px-4 py-2 text-sm transition ${
                      isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleTheme}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10"
            >
              {theme === 'dark' ? <SunMedium className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <NavLink to="/cart" className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10">
              <ShoppingBag className="h-4 w-4" />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
                  {itemCount}
                </span>
              )}
            </NavLink>
            {isAuthenticated ? (
              <div className="hidden items-center gap-2 sm:flex">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-right">
                  <p className="text-sm font-semibold text-white">{user?.full_name}</p>
                  <p className="text-xs text-slate-400">{isAdmin ? 'Ops dashboard enabled' : 'Ready to order'}</p>
                </div>
                <Button variant="secondary" className="px-4 py-2.5" onClick={logout}>
                  Sign out
                </Button>
              </div>
            ) : (
              <NavLink to="/login">
                <Button className="px-5 py-2.5">Sign in</Button>
              </NavLink>
            )}
          </div>
        </header>

        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname}>
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
        <SiteFooter />
      </div>
    </div>
  )
}
