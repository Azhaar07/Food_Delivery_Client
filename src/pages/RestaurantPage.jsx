import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Leaf, Plus, Search, Sparkles } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'

import { foodApi } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { CardSkeleton } from '@/components/ui/CardSkeleton'
import { PageTransition } from '@/components/ui/PageTransition'
import { useCart } from '@/context/CartContext'
import { formatCurrency } from '@/utils/format'

export const RestaurantPage = () => {
  const { id } = useParams()
  const { addItem, cart } = useCart()
  const [restaurant, setRestaurant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const loadRestaurant = async () => {
      try {
        const { data } = await foodApi.restaurantMenu(id)
        setRestaurant(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadRestaurant()
  }, [id])

  const categories = useMemo(
    () => (restaurant ? ['All', ...new Set(restaurant.menu_items.map((item) => item.category))] : ['All']),
    [restaurant],
  )

  const filteredMenu = useMemo(() => {
    if (!restaurant) return []
    const query = search.trim().toLowerCase()
    return restaurant.menu_items.filter((item) => {
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory
      const matchesSearch =
        !query ||
        [item.name, item.category, item.description]
          .join(' ')
          .toLowerCase()
          .includes(query)
      return matchesCategory && matchesSearch
    })
  }, [activeCategory, restaurant, search])

  const groupedMenu = useMemo(() => {
    return filteredMenu.reduce((groups, item) => {
      groups[item.category] = groups[item.category] || []
      groups[item.category].push(item)
      return groups
    }, {})
  }, [filteredMenu])

  if (loading) {
    return (
      <PageTransition className="grid gap-6">
        <CardSkeleton className="h-[280px]" />
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <CardSkeleton key={index} className="h-[220px]" />
          ))}
        </div>
      </PageTransition>
    )
  }

  if (error || !restaurant) {
    return (
      <PageTransition className="rounded-[30px] border border-rose-500/25 bg-rose-500/10 p-6 text-rose-100">
        {error || 'Restaurant not found.'}
      </PageTransition>
    )
  }

  const activeRestaurantMismatch = cart.restaurant && cart.restaurant.id !== restaurant.id

  return (
    <PageTransition className="space-y-8 pb-8">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white">
        <ArrowLeft className="h-4 w-4" />
        Back to discovery
      </Link>

      <section className="overflow-hidden rounded-[34px] border border-white/[0.08] bg-white/[0.04]">
        <div className="relative h-[320px] overflow-hidden">
          <img src={restaurant.banner_url || restaurant.image_url} alt={restaurant.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
            <div className="max-w-3xl space-y-4">
              <div className="flex flex-wrap gap-2">
                {[restaurant.cuisine, ...restaurant.categories.slice(0, 3)].map((tag) => (
                  <span key={tag} className="inline-flex rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-accent">
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="font-display text-4xl text-white sm:text-5xl">{restaurant.name}</h1>
              <p className="max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">{restaurant.description}</p>
              <div className="flex flex-wrap gap-3 text-sm text-slate-200">
                <span className="rounded-full border border-white/10 bg-black/25 px-4 py-2">
                  {restaurant.prep_time_minutes} min prep
                </span>
                <span className="rounded-full border border-white/10 bg-black/25 px-4 py-2">
                  {formatCurrency(restaurant.delivery_fee)} delivery
                </span>
                <span className="rounded-full border border-white/10 bg-black/25 px-4 py-2">
                  {restaurant.menu_items.length} dishes
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {activeRestaurantMismatch && (
        <div className="rounded-[26px] border border-amber-500/25 bg-amber-500/10 px-5 py-4 text-sm text-amber-100">
          Your cart already contains dishes from another restaurant. Adding from this menu will start a fresh cart for {restaurant.name}.
        </div>
      )}

      <section className="space-y-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="section-title">Menu, neatly organized</h2>
            <p className="section-copy">Search dishes by name, filter by section, and browse every category in grouped blocks for faster demos.</p>
          </div>
          <div className="grid w-full gap-3 xl:max-w-3xl xl:grid-cols-[1.3fr_1fr]">
            <label className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="input-base pl-11"
                placeholder="Search dishes, categories, or ingredients"
              />
            </label>
            <div className="flex gap-2 overflow-auto subtle-scrollbar">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-full px-4 py-3 text-sm transition ${
                    activeCategory === category
                      ? 'bg-accent text-white'
                      : 'border border-white/10 bg-white/[0.04] text-slate-300 hover:border-accent/35'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.04] px-5 py-4 text-sm text-slate-300">
          Showing {filteredMenu.length} menu items across {Object.keys(groupedMenu).length || 0} categories
        </div>

        <div className="space-y-8">
          {Object.entries(groupedMenu).map(([category, items]) => (
            <section key={category} className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-display text-3xl text-white">{category}</h3>
                  <p className="mt-1 text-sm text-slate-400">{items.length} dishes in this section</p>
                </div>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                {items.map((item) => (
                  <motion.article
                    key={item.id}
                    whileHover={{ y: -6 }}
                    className="grid gap-4 rounded-[30px] border border-white/[0.08] bg-white/[0.04] p-5 sm:grid-cols-[1fr_124px]"
                  >
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
                          {item.category}
                        </span>
                        {item.is_vegetarian && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">
                            <Leaf className="h-3.5 w-3.5" />
                            Vegetarian
                          </span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-display text-2xl text-white">{item.name}</h4>
                        <p className="mt-2 text-sm leading-7 text-slate-300">{item.description}</p>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-lg font-semibold text-accent">{formatCurrency(item.price)}</p>
                        <Button className="px-4 py-2.5" onClick={() => addItem(restaurant, item)}>
                          <Plus className="h-4 w-4" />
                          Add to cart
                        </Button>
                      </div>
                    </div>
                    <div className="overflow-hidden rounded-[24px] border border-white/[0.08] bg-white/[0.04]">
                      <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                    </div>
                  </motion.article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>

      <div className="glass-panel flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Fast lane checkout</p>
          <p className="mt-2 text-lg font-semibold text-white">
            {cart.items.length > 0 ? `${cart.items.length} items ready to checkout.` : 'Build your order to start delivery tracking.'}
          </p>
        </div>
        <Link to="/cart">
          <Button variant={cart.items.length > 0 ? 'primary' : 'secondary'}>
            <Sparkles className="h-4 w-4" />
            Review cart
          </Button>
        </Link>
      </div>
    </PageTransition>
  )
}
