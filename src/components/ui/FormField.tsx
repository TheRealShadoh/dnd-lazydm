'use client'

import * as React from 'react'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input, InputProps } from './Input'
import { Textarea, TextareaProps } from './Textarea'
import { Label } from './Label'

interface FormFieldProps extends Omit<InputProps, 'error'> {
  label: string
  error?: string
  helpText?: string
  icon?: React.ReactNode
}

export function FormField({
  label,
  error,
  helpText,
  icon,
  className = '',
  id,
  required,
  ...props
}: FormFieldProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId} className="text-foreground">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}
        <Input
          id={inputId}
          className={cn(icon && 'pl-10', className)}
          error={!!error}
          required={required}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined
          }
          {...props}
        />
      </div>

      {error && (
        <p
          id={`${inputId}-error`}
          className="text-sm text-destructive flex items-center gap-1.5"
        >
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}

      {helpText && !error && (
        <p id={`${inputId}-help`} className="text-sm text-muted-foreground">
          {helpText}
        </p>
      )}
    </div>
  )
}

interface TextAreaFieldProps extends Omit<TextareaProps, 'error'> {
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
  required,
  ...props
}: TextAreaFieldProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId} className="text-foreground">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      <Textarea
        id={inputId}
        className={className}
        error={!!error}
        required={required}
        aria-invalid={!!error}
        aria-describedby={
          error ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined
        }
        {...props}
      />

      {error && (
        <p
          id={`${inputId}-error`}
          className="text-sm text-destructive flex items-center gap-1.5"
        >
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}

      {helpText && !error && (
        <p id={`${inputId}-help`} className="text-sm text-muted-foreground">
          {helpText}
        </p>
      )}
    </div>
  )
}
