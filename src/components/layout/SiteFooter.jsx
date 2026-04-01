import { ChevronDown, MapPin, Search, ShieldCheck, Sparkles, Truck } from 'lucide-react'
import { useState } from 'react'

const foodCities = [
  'Bangalore',
  'Gurgaon',
  'Hyderabad',
  'Delhi',
  'Mumbai',
  'Pune',
  'Kolkata',
  'Chennai',
  'Ahmedabad',
  'Chandigarh',
  'Jaipur',
  'Kochi',
]

const footerGroups = [
  {
    title: 'Company',
    links: ['About FoodFlow', 'FoodFlow for Business', 'Careers', 'Team', 'FoodFlow One'],
  },
  {
    title: 'Contact',
    links: ['Help & Support', 'Partner with us', 'Ride with us'],
  },
  {
    title: 'Legal',
    links: ['Terms & Conditions', 'Cookie Policy', 'Privacy Policy'],
  },
  {
    title: 'Life at FoodFlow',
    links: ['Explore with FoodFlow', 'FoodFlow News', 'Snackables'],
  },
]

const renderCityCards = (cities, prefix, expanded, onToggle) => {
  const visible = expanded ? cities : cities.slice(0, 11)

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {visible.map((city) => (
        <button
          key={city}
          type="button"
          className="rounded-[22px] border border-white/[0.08] bg-white/[0.04] px-5 py-5 text-left text-sm font-medium text-slate-300 transition hover:-translate-y-1 hover:border-accent/35 hover:text-white"
        >
          {prefix} in {city}
        </button>
      ))}
      <button
        type="button"
        onClick={onToggle}
        className="inline-flex items-center justify-center gap-2 rounded-[22px] border border-accent/25 bg-accent/10 px-5 py-5 text-sm font-semibold text-accent transition hover:bg-accent hover:text-white"
      >
        {expanded ? 'Show Less' : 'Show More'}
        <ChevronDown className={`h-4 w-4 transition ${expanded ? 'rotate-180' : ''}`} />
      </button>
    </div>
  )
}

export const SiteFooter = () => {
  const [showMoreFoodCities, setShowMoreFoodCities] = useState(false)

  return (
    <footer className="mt-12 space-y-10 border-t border-white/[0.08] pt-10">
      <section>
        <h2 className="section-title">Cities with food delivery</h2>
        <div className="mt-5">
          {renderCityCards(
            foodCities,
            'Order food online',
            showMoreFoodCities,
            () => setShowMoreFoodCities((current) => !current),
          )}
        </div>
      </section>

      <section className="grid gap-8 rounded-[34px] border border-white/[0.08] bg-white/[0.04] p-8 lg:grid-cols-[1.1fr_2fr]">
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-white shadow-[0_12px_36px_rgba(255,90,95,0.28)]">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <p className="font-display text-3xl font-semibold text-white">FoodFlow</p>
              <p className="text-sm text-slate-400">Premium delivery with live confidence tracking</p>
            </div>
          </div>
          <p className="text-sm text-slate-400">© 2026 FoodFlow Studio</p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-5">
          {footerGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-lg font-semibold text-white">{group.title}</h3>
              <div className="mt-4 space-y-3 text-sm text-slate-400">
                {group.links.map((link) => (
                  <p key={link}>{link}</p>
                ))}
              </div>
            </div>
          ))}
          <div>
            <h3 className="text-lg font-semibold text-white">Available in</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-400">
              {foodCities.slice(0, 6).map((city) => (
                <p key={city}>{city}</p>
              ))}
            </div>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-sm text-slate-300">
              685+ cities
              <ChevronDown className="h-4 w-4" />
            </div>
            <div className="mt-6 flex items-center gap-4 text-slate-400">
              {[Sparkles, Search, Truck, ShieldCheck].map((Icon, index) => (
                <span key={index} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04]">
                  <Icon className="h-4 w-4" />
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </footer>
  )
}
