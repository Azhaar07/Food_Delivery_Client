import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { PageTransition } from '@/components/ui/PageTransition'
import { useAuth } from '@/context/AuthContext'

const initialState = {
  first_name: '',
  last_name: '',
  email: '',
  password: '',
}

export const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.redirectTo || '/'
  const { login, register, loading } = useAuth()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState(initialState)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    try {
      if (mode === 'login') {
        await login({ email: form.email, password: form.password })
      } else {
        await register(form)
      }
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <PageTransition className="grid gap-6 pb-12 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="glass-panel flex flex-col justify-between gap-6 p-8">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-accent">Secure checkout access</p>
          <h1 className="mt-4 font-display text-5xl text-white">Sign in to track with confidence.</h1>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            Login unlocks order history, checkout, and the premium ETA tracking flow. Demo account: `demo@foodflow.dev` / `DemoPass123!`
          </p>
        </div>
        <div className="rounded-[28px] border border-white/[0.08] bg-white/[0.04] p-5">
          <p className="text-sm text-slate-300">Admin dashboard demo</p>
          <p className="mt-2 text-sm text-slate-400">`admin@foodflow.dev` / `AdminPass123!`</p>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="rounded-[30px] border border-white/[0.08] bg-white/[0.04] p-6 sm:p-8">
        <div className="flex rounded-full border border-white/10 bg-white/[0.03] p-1">
          {[
            ['login', 'Sign in'],
            ['register', 'Create account'],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value)}
              className={`flex-1 rounded-full px-4 py-3 text-sm transition ${
                mode === value ? 'bg-accent text-slate-950' : 'text-slate-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          {mode === 'register' && (
            <>
              <input
                className="input-base"
                placeholder="First name"
                value={form.first_name}
                onChange={(event) => setForm((current) => ({ ...current, first_name: event.target.value }))}
                required
              />
              <input
                className="input-base"
                placeholder="Last name"
                value={form.last_name}
                onChange={(event) => setForm((current) => ({ ...current, last_name: event.target.value }))}
              />
            </>
          )}
          <input
            className="input-base"
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            required
          />
          <input
            className="input-base"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            required
          />
        </div>

        {error && <div className="mt-4 rounded-2xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>}

        <Button type="submit" className="mt-6 w-full justify-center" disabled={loading}>
          {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
        </Button>
      </form>
    </PageTransition>
  )
}
