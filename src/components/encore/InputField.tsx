'use client'

import React, { useState } from 'react'
import * as ty from './typographyStyles'

interface InputFieldProps {
  label: string
  placeholder?: string
  type?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  icon?: React.ReactNode
  defaultValue?: string
  value?: string
  onChange?: (value: string) => void
  maxLength?: number
  showCounter?: boolean
  style?: React.CSSProperties
  inputStyle?: React.CSSProperties
}

export default function InputField({
  label,
  placeholder,
  type = 'text',
  inputMode,
  icon,
  defaultValue = '',
  value: controlledValue,
  onChange,
  maxLength,
  showCounter = false,
  style,
  inputStyle,
}: InputFieldProps) {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : internalValue

  const setValue = (v: string) => {
    if (!isControlled) setInternalValue(v)
    onChange?.(v)
  }
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div className="mb-6" style={style}>
      <div
        className="flex items-end gap-3"
        style={{
          paddingTop: 4,
          position: 'relative',
          borderBottom: '1.5px solid var(--color-encore-border-light)',
          transition: 'border-color 0.2s',
        }}
      >
        {icon && (
          <div
            className="flex-shrink-0 pb-1.5"
            style={{
              fontSize: 16,
              color: 'var(--color-encore-green)',
              opacity: 1,
              transition: 'opacity 0.2s',
            }}
          >
            {icon}
          </div>
        )}
        <div className="flex-1">
          {label && (
            <span
              className="block mb-0.5"
              style={{
                ...ty.caption,
                color: isFocused ? 'var(--color-encore-green)' : 'var(--color-encore-text-muted)',
                transition: 'color 0.2s',
              }}
            >
              {label}
            </span>
          )}
          <input
            type={type}
            inputMode={inputMode}
            placeholder={placeholder}
            value={value}
            maxLength={maxLength}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="w-full outline-none"
            style={{
              ...ty.body,
              fontSize: 16,
              background: 'transparent',
              border: 'none',
              padding: '4px 0 6px',
              lineHeight: 1.4,
              ...inputStyle,
            }}
          />
        </div>

        {/* フォーカスアニメーションライン */}
        <div
          style={{
            position: 'absolute',
            bottom: -1,
            left: 0,
            right: 0,
            height: 1,
            background: 'var(--color-encore-green)',
            transform: isFocused ? 'scaleX(1)' : 'scaleX(0)',
            transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            transformOrigin: 'left',
          }}
        />
      </div>
      {showCounter && maxLength && (
        <div style={{ ...ty.captionMuted, textAlign: 'right', marginTop: 4 }}>
          {value.length}/{maxLength}
        </div>
      )}
    </div>
  )
}
