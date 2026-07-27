import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-surface-300"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 text-surface-400 pointer-events-none">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full rounded-xl bg-surface-800 border border-surface-600',
              'text-surface-100 placeholder:text-surface-500',
              'h-10 px-3 text-sm',
              'transition-all duration-200',
              'focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
              'hover:border-surface-500',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              leftIcon && 'pl-9',
              rightIcon && 'pr-9',
              error && 'border-neon-red focus:border-neon-red focus:ring-neon-red/20',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 text-surface-400">
              {rightIcon}
            </span>
          )}
        </div>
        {error && <p className="text-xs text-neon-red">{error}</p>}
        {hint && !error && <p className="text-xs text-surface-500">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export { Input };
