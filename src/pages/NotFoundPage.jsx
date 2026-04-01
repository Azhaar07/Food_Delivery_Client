import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { PageTransition } from '@/components/ui/PageTransition'

export const NotFoundPage = () => (
  <PageTransition className="glass-panel mx-auto max-w-3xl p-10 text-center">
    <p className="text-xs uppercase tracking-[0.28em] text-accent">404</p>
    <h1 className="mt-4 font-display text-5xl text-white">This route fell off the delivery map.</h1>
    <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-300">
      Head back to discovery and we’ll get you back to the good part: great food and transparent delivery tracking.
    </p>
    <Link to="/" className="mt-6 inline-flex">
      <Button>Back home</Button>
    </Link>
  </PageTransition>
)
