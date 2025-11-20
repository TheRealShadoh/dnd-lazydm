'use client'

import { ReactNode, ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'font-semibold rounded-lg transition-colors duration-200 inline-flex items-center justify-center gap-2'

  const variantStyles = {
    primary: 'bg-purple-500 hover:bg-purple-600 text-white disabled:bg-gray-700 disabled:cursor-not-allowed',
    secondary: 'bg-gray-800 hover:bg-gray-700 text-white disabled:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50',
    danger: 'bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-700 disabled:cursor-not-allowed',
    ghost: 'bg-transparent hover:bg-gray-800 text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed',
  }

  const sizeStyles = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3',
    lg: 'px-6 py-4 text-lg',
  }

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
      )}
      {children}
    </button>
  )
}
