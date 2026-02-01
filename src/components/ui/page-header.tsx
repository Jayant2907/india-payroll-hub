import * as React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  badge?: React.ReactNode;
  compact?: boolean;
}

const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ className, title, description, icon, actions, badge, compact, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative overflow-hidden rounded-2xl glass-card transition-all duration-300',
          compact ? 'p-3 md:p-4' : 'p-6 md:p-8',
          className
        )}
        {...props}
      >
        {/* Background gradient decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-50" />
          {!compact && <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-chart-2/10 rounded-full blur-3xl opacity-50" />}
        </div>

        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            {icon && (
              <div className={cn(
                "flex shrink-0 items-center justify-center rounded-xl bg-primary/20 shadow-lg shadow-primary/10 transition-all",
                compact ? "h-10 w-10" : "h-14 w-14"
              )}>
                {React.cloneElement(icon as React.ReactElement, {
                  className: cn((icon as React.ReactElement).props.className, compact ? "h-5 w-5" : "h-7 w-7")
                })}
              </div>
            )}
            <div className="space-y-0.5">
              <div className="flex items-center gap-3">
                <h1 className={cn(
                  "font-bold tracking-tight text-foreground transition-all",
                  compact ? "text-xl md:text-2xl" : "text-2xl md:text-3xl"
                )}>
                  {title}
                </h1>
                {badge}
              </div>
              {description && (
                <p className={cn(
                  "text-muted-foreground transition-all",
                  compact ? "text-xs md:text-sm" : "text-sm md:text-base"
                )}>
                  {description}
                </p>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex shrink-0 items-center gap-3">
              {actions}
            </div>
          )}
        </div>
      </div>
    );
  }
);
PageHeader.displayName = 'PageHeader';

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  animate?: boolean;
}

const PageContainer = React.forwardRef<HTMLDivElement, PageContainerProps>(
  ({ className, animate = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'space-y-6',
          animate && 'animate-in fade-in slide-in-from-bottom-4 duration-500',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
PageContainer.displayName = 'PageContainer';

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, icon, title, description, action, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center py-16 text-center',
          className
        )}
        {...props}
      >
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted/50">
          <div className="text-muted-foreground/50">{icon}</div>
        </div>
        <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="mb-6 max-w-sm text-sm text-muted-foreground">
            {description}
          </p>
        )}
        {action}
      </div>
    );
  }
);
EmptyState.displayName = 'EmptyState';

interface StatsCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  iconColor?: string;
  trend?: 'up' | 'down';
  trendValue?: string;
}

const StatsCard = React.forwardRef<HTMLDivElement, StatsCardProps>(
  ({ className, title, value, subtitle, icon, iconColor = 'bg-primary/20 text-primary', trend, trendValue, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5, scale: 1.02 }}
        className={cn(
          'glass-card-hover p-6 group cursor-default transition-all',
          className
        )}
        {...props}
      >
        <div className="flex items-start justify-between">
          <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:rotate-12', iconColor)}>
            {icon}
          </div>
          {trend && trendValue && (
            <div className={cn(
              'flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
              trend === 'up' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
            )}>
              <span>{trend === 'up' ? '↑' : '↓'}</span>
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div className="mt-3 space-y-0.5">
          <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">{title}</p>
          <motion.p
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-xl font-bold tracking-tight text-foreground md:text-2xl"
          >
            {value}
          </motion.p>
          {subtitle && (
            <p className="text-[10px] text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </motion.div>
    );
  }
);
StatsCard.displayName = 'StatsCard';

interface StepIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  steps: string[];
  currentStep: number;
}

const StepIndicator = React.forwardRef<HTMLDivElement, StepIndicatorProps>(
  ({ className, steps, currentStep, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-center gap-2 overflow-x-auto pb-2', className)}
        {...props}
      >
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <div
              key={step}
              className={cn(
                'flex items-center gap-2 rounded-xl px-4 py-2.5 transition-all duration-300 shrink-0',
                isActive && 'bg-primary text-primary-foreground shadow-lg shadow-primary/25',
                isCompleted && 'bg-primary/20 text-primary',
                !isActive && !isCompleted && 'bg-muted/50 text-muted-foreground'
              )}
            >
              <span className={cn(
                'flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition-all',
                isActive && 'bg-primary-foreground/20',
                isCompleted && 'bg-primary text-primary-foreground',
                !isActive && !isCompleted && 'bg-muted'
              )}>
                {isCompleted ? '✓' : index + 1}
              </span>
              <span className="text-sm font-medium whitespace-nowrap">{step}</span>
            </div>
          );
        })}
      </div>
    );
  }
);
StepIndicator.displayName = 'StepIndicator';

export { PageHeader, PageContainer, EmptyState, StatsCard, StepIndicator };
