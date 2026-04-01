import { motion } from 'framer-motion'

const variants = {
  primary:
    'bg-accent text-white shadow-[0_14px_40px_rgba(255,90,95,0.28)] hover:bg-[#ff7377]',
  secondary:
    'border border-white/10 bg-white/5 text-white hover:border-white/20 hover:bg-white/10',
  ghost:
    'border border-transparent bg-transparent text-slate-300 hover:text-white',
}

export const Button = ({
  children,
  className = '',
  variant = 'primary',
  type = 'button',
  ...props
}) => (
  <motion.button
    type={type}
    whileTap={{ scale: 0.98 }}
    whileHover={{ y: -2 }}
    className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition ${variants[variant]} ${className}`}
    {...props}
  >
    {children}
  </motion.button>
)
