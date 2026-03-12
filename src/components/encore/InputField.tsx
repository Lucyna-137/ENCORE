'use client'

import React, { useState } from 'react'

interface InputFieldProps {
  label: string
  placeholder?: string
  type?: string
  icon?: React.ReactNode
  defaultValue?: string
  maxLength?: number
  showCounter?: boolean
}

export default function InputField({
  label,
  placeholder,
  type = 'text',
  icon,
  defaultValue = '',
  maxLength,
  showCounter = false,
}: InputFieldProps) {
  const [value, setValue] = useState(defaultValue)

  return (
    <div
      className="flex items-end gap-3 mb-6"
      style={{
        paddingTop: 4,
        borderBottom: '1.5px solid var(--color-encore-green)',
        transition: 'border-color 0.2s',
      }}
    >
      {icon && (
        <div
          className="flex-shrink-0 pb-1.5"
          style={{ fontSize: 16, color: 'var(--color-encore-green)', opacity: 0.6 }}
        >
          {icon}
        </div>
      )}
      <div className="flex-1">
        <span
          className="block mb-0.5"
          style={{ fontSize: 11, color: 'var(--color-encore-text-muted)' }}
        >
          {label}
        </span>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          maxLength={maxLength}
          onChange={(e) => setValue(e.target.value)}
          className="w-full outline-none"
          style={{
            background: 'transparent',
            border: 'none',
            padding: '4px 0 6px',
            fontSize: 15,
            fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
            color: 'var(--color-encore-green)',
            lineHeight: 1.4,
          }}
        />
        {showCounter && maxLength && (
          <div style={{ textAlign: 'right', fontSize: 11, color: 'var(--color-encore-text-muted)', marginTop: 4 }}>
            {value.length}/{maxLength}
          </div>
        )}
      </div>
    </div>
  )
}
