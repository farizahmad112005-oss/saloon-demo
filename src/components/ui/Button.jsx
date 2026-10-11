import { motion } from 'framer-motion';

const variants = {
  primary:
    'bg-gold text-black hover:brightness-110 shadow-[0_10px_28px_rgba(197,160,89,0.28)]',
  secondary:
    'bg-nude text-burgundy border border-white/12 hover:border-gold/40 hover:bg-[#242424]',
  ghost: 'bg-transparent text-burgundy hover:bg-nude',
  gold: 'bg-gold text-black hover:brightness-105 shadow-[0_10px_24px_rgba(197,160,89,0.28)]',
};

const base =
  'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium tracking-wide transition';

export default function Button({
  children,
  variant = 'primary',
  className = '',
  as: Comp = 'button',
  ...props
}) {
  const classes = `${base} ${variants[variant]} ${className}`;
  if (Comp === 'button') {
    return (
      <motion.button
        type={props.type || 'button'}
        whileHover={props.disabled ? undefined : { y: -1 }}
        whileTap={props.disabled ? undefined : { scale: 0.98 }}
        className={`${classes}${props.disabled ? ' cursor-not-allowed opacity-60' : ''}`}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
  return (
    <Comp className={classes} {...props}>
      {children}
    </Comp>
  );
}
