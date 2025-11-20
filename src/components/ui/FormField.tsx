'use client'

import { ReactNode, InputHTMLAttributes } from 'react'

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  helpText?: string
  icon?: ReactNode
}

export function FormField({
  label,
  error,
  helpText,
  icon,
  className = '',
  id,
  ...props
}: FormFieldProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="block text-sm font-semibold text-gray-300">
        {label}
        {props.required && <span className="text-red-400 ml-1">*</span>}
      </label>

      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={`
            w-full px-4 py-3 ${icon ? 'pl-10' : ''}
            bg-gray-800 border-2 rounded-lg text-white
            transition-colors duration-200
            focus:outline-none
            ${error
              ? 'border-red-500 focus:border-red-400'
              : 'border-gray-700 focus:border-purple-500'
            }
            ${className}
          `}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined}
          {...props}
        />
      </div>

      {error && (
        <p id={`${inputId}-error`} className="text-sm text-red-400 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}

      {helpText && !error && (
        <p id={`${inputId}-help`} className="text-sm text-gray-500">
          {helpText}
        </p>
      )}
    </div>
  )
}

interface TextAreaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
  helpText?: string
}

export function TextAreaField({
  label,
  error,
  helpText,
  className = '',
  id,
  ...props
}: TextAreaFieldProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="block text-sm font-semibold text-gray-300">
        {label}
        {props.required && <span className="text-red-400 ml-1">*</span>}
      </label>

      <textarea
        id={inputId}
        className={`
          w-full px-4 py-3
          bg-gray-800 border-2 rounded-lg text-white
          transition-colors duration-200
          focus:outline-none
          ${error
            ? 'border-red-500 focus:border-red-400'
            : 'border-gray-700 focus:border-purple-500'
          }
          ${className}
        `}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined}
        {...props}
      />

      {error && (
        <p id={`${inputId}-error`} className="text-sm text-red-400 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}

      {helpText && !error && (
        <p id={`${inputId}-help`} className="text-sm text-gray-500">
          {helpText}
        </p>
      )}
    </div>
  )
}
