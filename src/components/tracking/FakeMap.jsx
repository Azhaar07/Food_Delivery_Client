import { motion } from 'framer-motion'

const toMapPoint = (location, bounds) => {
  const { minLat, maxLat, minLng, maxLng } = bounds
  const latSpan = maxLat - minLat || 0.01
  const lngSpan = maxLng - minLng || 0.01
  return {
    x: ((location.lng - minLng) / lngSpan) * 100,
    y: 100 - ((location.lat - minLat) / latSpan) * 100,
  }
}

export const FakeMap = ({ current, start, end, progress }) => {
  const bounds = {
    minLat: Math.min(start.lat, end.lat) - 0.01,
    maxLat: Math.max(start.lat, end.lat) + 0.01,
    minLng: Math.min(start.lng, end.lng) - 0.01,
    maxLng: Math.max(start.lng, end.lng) + 0.01,
  }
  const startPoint = toMapPoint(start, bounds)
  const endPoint = toMapPoint(end, bounds)
  const currentPoint = toMapPoint(current, bounds)

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0f151b] p-5 shadow-lift">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,90,95,0.12),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.04),transparent_60%)]" />
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:48px_48px]" />

      <div className="relative h-[320px] w-full overflow-hidden rounded-[22px] border border-white/6 bg-[#0a0f13]">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="route" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,90,95,0.2)" />
              <stop offset="100%" stopColor="rgba(255,181,176,0.85)" />
            </linearGradient>
          </defs>
          <path
            d={`M ${startPoint.x} ${startPoint.y} C ${startPoint.x + 18} ${startPoint.y - 10}, ${endPoint.x - 18} ${endPoint.y + 8}, ${endPoint.x} ${endPoint.y}`}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
          <motion.path
            d={`M ${startPoint.x} ${startPoint.y} C ${startPoint.x + 18} ${startPoint.y - 10}, ${endPoint.x - 18} ${endPoint.y + 8}, ${endPoint.x} ${endPoint.y}`}
            fill="none"
            stroke="url(#route)"
            strokeWidth="2.2"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: Math.max(progress / 100, 0.04) }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </svg>

        <div
          className="absolute flex h-4 w-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent shadow-[0_0_0_10px_rgba(255,90,95,0.12)]"
          style={{ left: `${startPoint.x}%`, top: `${startPoint.y}%` }}
        />
        <div
          className="absolute flex h-4 w-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accentSoft shadow-[0_0_0_10px_rgba(255,181,176,0.12)]"
          style={{ left: `${endPoint.x}%`, top: `${endPoint.y}%` }}
        />
        <motion.div
          animate={{ left: `${currentPoint.x}%`, top: `${currentPoint.y}%` }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-[0_0_0_12px_rgba(255,255,255,0.08)]"
        >
          <motion.div
            animate={{ scale: [1, 1.25, 1] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            className="h-3 w-3 rounded-full bg-accent"
          />
        </motion.div>

        <div className="absolute bottom-4 left-4 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-xs text-slate-300 backdrop-blur">
          Live simulation route
        </div>
      </div>
    </div>
  )
}
