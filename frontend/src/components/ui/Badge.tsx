import { type HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'live';
type BadgeSize = 'sm' | 'md';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  pulse?: boolean;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-surface-700 text-surface-200 border-surface-600',
  success: 'bg-neon-lime/10 text-neon-lime border-neon-lime/30',
  warning: 'bg-neon-orange/10 text-neon-orange border-neon-orange/30',
  danger: 'bg-neon-red/10 text-neon-red border-neon-red/30',
  info: 'bg-neon-blue/10 text-neon-blue border-neon-blue/30',
  purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  live: 'bg-surface-800 text-neon-lime border-neon-lime/40 font-mono uppercase tracking-[0.2em] text-[10px] glow-lime',
};

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-surface-400',
  success: 'bg-neon-lime',
  warning: 'bg-neon-orange',
  danger: 'bg-neon-red',
  info: 'bg-neon-blue',
  purple: 'bg-purple-400',
  live: 'bg-neon-lime',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'h-5 px-2 text-[10px] gap-1',
  md: 'h-6 px-2.5 text-xs gap-1.5',
};

export function Badge({
  className,
  variant = 'default',
  size = 'md',
  pulse = false,
  dot = false,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-full border',
        'transition-all duration-200',
        variantStyles[variant],
        sizeStyles[size],
        variant === 'live' && 'badge-live',
        className
      )}
      {...props}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5">
          {pulse && (
            <span
              className={cn(
                'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                dotColors[variant]
              )}
            />
          )}
          <span className={cn('relative inline-flex rounded-full h-1.5 w-1.5', dotColors[variant])} />
        </span>
      )}
      {children}
    </span>
  );
}
