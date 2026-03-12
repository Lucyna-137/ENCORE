'use client'

import React, { useState } from 'react'

interface ToggleProps {
  label: string
  defaultChecked?: boolean
  onChange?: (checked: boolean) => void
}

export default function Toggle({ label, defaultChecked = true, onChange }: ToggleProps) {
  const [checked, setChecked] = useState(defaultChecked)

  const handleClick = () => {
    const next = !checked
    setChecked(next)
    onChange?.(next)
  }

  return (
    <div
      onClick={handleClick}
      className="flex items-center justify-between cursor-pointer transition-colors duration-100 active:bg-encore-bg-section select-none"
      style={{
        padding: '15px 20px',
        background: 'var(--color-encore-bg)',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <span style={{ fontSize: 15, color: 'var(--color-encore-green)', pointerEvents: 'none' }}>{label}</span>
      <div
        className="relative flex-shrink-0 transition-colors duration-[250ms]"
        style={{
          width: 48,
          height: 28,
          borderRadius: 14,
          background: checked ? 'var(--color-encore-green)' : 'var(--color-encore-border)',
          pointerEvents: 'none',
        }}
      >
        <div
          className="absolute encore-toggle-knob"
          style={{
            width: 24,
            height: 24,
            background: 'var(--color-encore-white)',
            borderRadius: '50%',
            top: 2,
            left: checked ? 22 : 2,
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          }}
        />
      </div>
    </div>
  )
}
