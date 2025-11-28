'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        // Fantasy primary - gradient with glow
        primary:
          'bg-gradient-to-b from-primary to-primary-dark text-primary-foreground border border-primary-light/20 shadow-fantasy hover:shadow-glow hover:brightness-110',
        // Secondary - subtle
        secondary:
          'bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80',
        // Danger/Destructive
        danger:
          'bg-gradient-to-b from-destructive to-red-700 text-destructive-foreground border border-red-400/20 shadow-fantasy hover:brightness-110',
        destructive:
          'bg-gradient-to-b from-destructive to-red-700 text-destructive-foreground border border-red-400/20 shadow-fantasy hover:brightness-110',
        // Ghost
        ghost:
          'text-muted-foreground hover:bg-muted hover:text-foreground',
        // Link style
        link:
          'text-primary underline-offset-4 hover:underline',
        // Outline
        outline:
          'border-2 border-border bg-transparent text-foreground hover:bg-muted hover:border-primary/50',
        // Gold accent button
        gold:
          'bg-gradient-to-b from-amber-500 to-amber-600 text-black font-bold border border-amber-400/50 shadow-gold-glow hover:brightness-110',
        // Success
        success:
          'bg-gradient-to-b from-success to-green-700 text-success-foreground border border-green-400/20 shadow-fantasy hover:brightness-110',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        xl: 'h-14 px-8 text-lg',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
        'icon-lg': 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading = false, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
