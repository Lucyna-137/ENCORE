'use client'

import React, { useState } from 'react'
import * as ty from './typographyStyles'

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
      <span style={{ ...ty.body, fontSize: 15, pointerEvents: 'none' }}>{label}</span>
      <div
        className="relative flex-shrink-0 transition-colors duration-[250ms]"
        style={{
          width: 60,
          height: 28,
          borderRadius: 999,
          background: checked ? 'var(--color-encore-green)' : '#D1D1D6',
          pointerEvents: 'none',
        }}
      >
        <div
          className="absolute encore-toggle-knob"
          style={{
            width: 33,
            height: 24,
            background: 'var(--color-encore-white)',
            borderRadius: 999,
            top: 2,
            left: checked ? 25 : 2,
            boxShadow: '0 2px 6px rgba(0,0,0,0.18), 0 0.5px 2px rgba(0,0,0,0.08)',
          }}
        />
      </div>
    </div>
  )
}
