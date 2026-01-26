import * as React from 'react';
import { cn } from '@/lib/utils';

interface BentoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  glow?: 'primary' | 'success' | 'warning' | 'danger' | 'none';
}

const BentoCard = React.forwardRef<HTMLDivElement, BentoCardProps>(
  ({ className, size = 'md', hover = false, glow = 'none', children, ...props }, ref) => {
    const sizeClasses = {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-6 md:col-span-2',
      xl: 'p-6 md:col-span-2 md:row-span-2',
    };

    const glowClasses = {
      primary: 'glow-primary',
      success: 'glow-success',
      warning: 'glow-warning',
      danger: 'glow-danger',
      none: '',
    };

    return (
      <div
        ref={ref}
        className={cn(
          hover ? 'glass-card-hover' : 'glass-card',
          sizeClasses[size],
          glowClasses[glow],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
BentoCard.displayName = 'BentoCard';

interface BentoGridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4;
}

const BentoGrid = React.forwardRef<HTMLDivElement, BentoGridProps>(
  ({ className, cols = 3, children, ...props }, ref) => {
    const colClasses = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    };

    return (
      <div
        ref={ref}
        className={cn('grid gap-4', colClasses[cols], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
BentoGrid.displayName = 'BentoGrid';

interface BentoCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const BentoCardHeader = React.forwardRef<HTMLDivElement, BentoCardHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('mb-4 flex items-center justify-between', className)} {...props}>
      {children}
    </div>
  )
);
BentoCardHeader.displayName = 'BentoCardHeader';

interface BentoCardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

const BentoCardTitle = React.forwardRef<HTMLHeadingElement, BentoCardTitleProps>(
  ({ className, children, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-lg font-semibold text-foreground', className)} {...props}>
      {children}
    </h3>
  )
);
BentoCardTitle.displayName = 'BentoCardTitle';

interface BentoCardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const BentoCardDescription = React.forwardRef<HTMLParagraphElement, BentoCardDescriptionProps>(
  ({ className, children, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props}>
      {children}
    </p>
  )
);
BentoCardDescription.displayName = 'BentoCardDescription';

interface BentoCardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const BentoCardContent = React.forwardRef<HTMLDivElement, BentoCardContentProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('', className)} {...props}>
      {children}
    </div>
  )
);
BentoCardContent.displayName = 'BentoCardContent';

interface BentoCardValueProps extends React.HTMLAttributes<HTMLDivElement> {
  trend?: 'up' | 'down' | 'neutral';
}

const BentoCardValue = React.forwardRef<HTMLDivElement, BentoCardValueProps>(
  ({ className, trend, children, ...props }, ref) => {
    const trendColors = {
      up: 'text-emerald-400',
      down: 'text-rose-400',
      neutral: 'text-foreground',
    };

    return (
      <div
        ref={ref}
        className={cn('text-3xl font-bold', trend ? trendColors[trend] : 'text-foreground', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
BentoCardValue.displayName = 'BentoCardValue';

export {
  BentoCard,
  BentoGrid,
  BentoCardHeader,
  BentoCardTitle,
  BentoCardDescription,
  BentoCardContent,
  BentoCardValue,
};
