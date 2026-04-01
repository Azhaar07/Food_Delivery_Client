import { AnimatePresence, motion } from 'framer-motion'
import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { ArrowRight, Clock3, Search, SlidersHorizontal, Star, X } from 'lucide-react'
import { Link } from 'react-router-dom'

import { foodApi } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { CardSkeleton } from '@/components/ui/CardSkeleton'
import { PageTransition } from '@/components/ui/PageTransition'
import { formatCurrency } from '@/utils/format'

export const HomePage = () => {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeCuisine, setActiveCuisine] = useState('All')
  const [sortBy, setSortBy] = useState('featured')
  const [showFilters, setShowFilters] = useState(false)
  const deferredSearch = useDeferredValue(search)

  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        const { data } = await foodApi.restaurants()
        setRestaurants(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadRestaurants()
  }, [])

  const categories = useMemo(
    () => ['All', ...new Set(restaurants.flatMap((restaurant) => restaurant.categories))],
    [restaurants],
  )
  const cuisines = useMemo(
    () => ['All', ...new Set(restaurants.map((restaurant) => restaurant.cuisine))],
    [restaurants],
  )

  const filteredRestaurants = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase()
    const next = restaurants.filter((restaurant) => {
      const haystack = [
        restaurant.name,
        restaurant.cuisine,
        restaurant.description,
        restaurant.address,
        ...(restaurant.categories || []),
      ]
        .join(' ')
        .toLowerCase()
      const matchesSearch = !query || haystack.includes(query)
      const matchesCategory = activeCategory === 'All' || restaurant.categories.includes(activeCategory)
      const matchesCuisine = activeCuisine === 'All' || restaurant.cuisine === activeCuisine
      return matchesSearch && matchesCategory && matchesCuisine
    })

    return next.sort((left, right) => {
      if (sortBy === 'delivery') {
        return Number(left.delivery_fee) - Number(right.delivery_fee)
      }
      if (sortBy === 'prep') {
        return left.prep_time_minutes - right.prep_time_minutes
      }
      if (sortBy === 'rating') {
        return Number(right.rating) - Number(left.rating)
      }
      return Number(right.is_featured) - Number(left.is_featured)
    })
  }, [activeCategory, activeCuisine, deferredSearch, restaurants, sortBy])

  const activeFilterCount =
    (activeCategory !== 'All' ? 1 : 0) +
    (activeCuisine !== 'All' ? 1 : 0) +
    (sortBy !== 'featured' ? 1 : 0)

  return (
    <PageTransition className="space-y-8 pb-6">
      <section className="glass-panel overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(255,90,95,0.18),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.05),transparent_40%)] px-6 py-8 sm:px-8 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <span className="inline-flex rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-accent">
              Real-time confidence delivery
            </span>
            <div className="space-y-4">
              <h1 className="max-w-3xl font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Global flavours, cleaner discovery, and delivery tracking that actually feels trustworthy.
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Search across cuisines, countries, and categories, place an order in minutes, and show reviewers multiple live delivery states without touching real GPS.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/profile">
                <Button>
                  View live demo orders
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#restaurants">
                <Button variant="secondary">Explore restaurants</Button>
              </a>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {[
              { label: 'Global kitchens', value: `${restaurants.length || 9}+`, note: 'Carefully seeded cuisines from multiple countries' },
              { label: 'Live tracking', value: '5 sec', note: 'Polling cadence for active delivery simulation' },
              { label: 'Ready orders', value: '4 states', note: 'Seeded demo orders across active delivery phases' },
            ].map((metric) => (
              <div key={metric.label} className="rounded-[26px] border border-white/[0.08] bg-black/20 p-5 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{metric.label}</p>
                <p className="mt-3 font-display text-4xl text-white">{metric.value}</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">{metric.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="restaurants" className="space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="section-title">Discover by country, cuisine, and mood</h2>
            <p className="section-copy">
              Every listing is cleanly categorized so reviewers can quickly filter from Indian comfort food to sushi, tacos, mezze, pasta, grills, and more.
            </p>
          </div>
          <div className="grid w-full gap-3 xl:max-w-4xl xl:grid-cols-[1.4fr_auto]">
            <label className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="input-base pl-11"
                placeholder="Search restaurants, cuisines, countries, categories, or areas"
              />
            </label>
            <button
              type="button"
              onClick={() => setShowFilters(true)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-5 py-3 text-sm font-medium text-slate-300 transition hover:border-accent/35 hover:text-white"
            >
              <SlidersHorizontal className="h-4 w-4 text-accent" />
              Quick filters
              {activeFilterCount > 0 && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
              onClick={() => setShowFilters(false)}
            >
              <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 24, scale: 0.98 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="w-full max-w-3xl rounded-[30px] border border-white/[0.08] bg-[#0f1317] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.45)] light:bg-white"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Quick filters</p>
                    <h3 className="mt-2 font-display text-3xl text-white">Refine restaurant discovery</h3>
                    <p className="mt-2 text-sm text-slate-400">Choose a cuisine, category, and sort style without crowding the page.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowFilters(false)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-slate-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-300">Cuisine</span>
                    <select className="input-base" value={activeCuisine} onChange={(event) => setActiveCuisine(event.target.value)}>
                      {cuisines.map((cuisine) => (
                        <option key={cuisine} value={cuisine}>
                          {cuisine === 'All' ? 'All cuisines' : cuisine}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-300">Sort by</span>
                    <select className="input-base" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                      <option value="featured">Featured</option>
                      <option value="rating">Highest rated</option>
                      <option value="prep">Quickest prep</option>
                      <option value="delivery">Lowest delivery fee</option>
                    </select>
                  </label>
                </div>

                <div className="mt-6">
                  <p className="text-sm font-medium text-slate-300">Category</p>
                  <div className="mt-3 flex flex-wrap gap-2">
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

                <div className="mt-6 flex flex-wrap justify-between gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setActiveCategory('All')
                      setActiveCuisine('All')
                      setSortBy('featured')
                    }}
                  >
                    Reset filters
                  </Button>
                  <Button onClick={() => setShowFilters(false)}>Apply filters</Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && <div className="rounded-3xl border border-rose-500/25 bg-rose-500/10 px-5 py-4 text-sm text-rose-200">{error}</div>}

        {!loading && (
          <div className="flex items-center justify-between gap-3 rounded-[24px] border border-white/[0.08] bg-white/[0.04] px-5 py-4 text-sm text-slate-300">
            <span>{filteredRestaurants.length} restaurants match your filters</span>
            <span className="text-slate-400">
              Search query: {deferredSearch ? `"${deferredSearch}"` : 'All'}
            </span>
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, index) => <CardSkeleton key={index} className="h-[380px]" />)
            : filteredRestaurants.map((restaurant) => (
                <motion.article
                  key={restaurant.id}
                  whileHover={{ y: -6 }}
                  className="overflow-hidden rounded-[30px] border border-white/[0.08] bg-white/[0.04] shadow-glow"
                >
                  <div className="relative h-52 overflow-hidden">
                    <img src={restaurant.image_url} alt={restaurant.name} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                      {restaurant.categories.slice(0, 4).map((category) => (
                        <span key={category} className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-white">
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-display text-2xl text-white">{restaurant.name}</h3>
                        <p className="mt-1 text-sm text-slate-400">{restaurant.cuisine}</p>
                      </div>
                      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-right">
                        <div className="flex items-center gap-1 text-sm font-semibold text-white">
                          <Star className="h-4 w-4 fill-accent text-accent" />
                          {restaurant.rating}
                        </div>
                        <p className="mt-1 text-xs text-slate-400">{restaurant.menu_count} items</p>
                      </div>
                    </div>
                    <p className="text-sm leading-7 text-slate-300">{restaurant.description}</p>
                    <div className="rounded-[22px] border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-slate-400">
                      {restaurant.address}
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.08] pt-4 text-sm text-slate-400">
                      <span className="inline-flex items-center gap-2">
                        <Clock3 className="h-4 w-4 text-accent" />
                        {restaurant.prep_time_minutes} min prep
                      </span>
                      <span>{formatCurrency(restaurant.delivery_fee)} delivery</span>
                    </div>
                    <Link to={`/restaurants/${restaurant.id}`}>
                      <Button className="w-full justify-center">
                        View menu
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </motion.article>
              ))}
        </div>

        {!loading && filteredRestaurants.length === 0 && (
          <div className="glass-panel p-8 text-center">
            <h3 className="font-display text-3xl text-white">No kitchens matched that search.</h3>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Try a country like `Italy`, a cuisine like `Thai`, or a vibe like `Grill`, `Sushi`, or `Street Food`.
            </p>
          </div>
        )}
      </section>
    </PageTransition>
  )
}
