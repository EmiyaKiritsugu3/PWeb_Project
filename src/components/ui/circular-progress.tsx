import * as React from 'react';
import { cn } from '@/lib/utils';

interface CircularProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  strokeWidth?: number;
  showValue?: boolean;
  label?: string;
  gradient?: 'cyan' | 'gold' | 'rose';
}

const CircularProgress = React.forwardRef<HTMLDivElement, CircularProgressProps>(
  (
    {
      className,
      value,
      size = 'md',
      strokeWidth = 8,
      showValue = false,
      label,
      gradient = 'cyan',
      ...props
    },
    ref
  ) => {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    const sizes = {
      sm: 'w-16 h-16 text-xs',
      md: 'w-32 h-32 text-sm',
      lg: 'w-48 h-48 text-lg',
    };

    const gradients = {
      cyan: {
        stroke: 'url(#cyan-gradient)',
        from: '#22d3ee',
        to: '#2563eb',
      },
      gold: {
        stroke: 'url(#gold-gradient)',
        from: '#fbbf24',
        to: '#d97706',
      },
      rose: {
        stroke: 'url(#rose-gradient)',
        from: '#fb7185',
        to: '#e11d48',
      },
    };

    return (
      <div
        ref={ref}
        className={cn('relative flex items-center justify-center', sizes[size], className)}
        {...props}
      >
        <svg className="w-full h-full transform -rotate-90">
          <defs>
            <linearGradient id="cyan-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
            <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id="rose-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fb7185" />
              <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>
          </defs>
          {/* Background circle */}
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-muted/20"
          />
          {/* Progress circle */}
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke={gradients[gradient].stroke}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out animate-circular-progress"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center">
          {showValue && <span className="font-bold headline tracking-tighter">{value}%</span>}
          {label && (
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
              {label}
            </span>
          )}
        </div>
      </div>
    );
  }
);

CircularProgress.displayName = 'CircularProgress';

export { CircularProgress };
