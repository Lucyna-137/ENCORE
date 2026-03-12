'use client'

import React, { useState } from 'react'
import { Check } from '@phosphor-icons/react'

interface ColorPickerProps {
  label?: string
  colors?: string[]
  defaultValue?: string
  onChange?: (color: string) => void
}

const DEFAULT_COLORS = [
  'var(--color-encore-green)',
  'var(--color-encore-amber)',
  '#0EA5E9',
  '#7C3AED',
  '#EC4899',
  '#10B981',
  '#F59E0B',
  '#DC2626',
]

export default function ColorPicker({ label, colors = DEFAULT_COLORS, defaultValue, onChange }: ColorPickerProps) {
  const [selected, setSelected] = useState(defaultValue ?? colors[0])

  const pick = (c: string) => {
    setSelected(c)
    onChange?.(c)
  }

  return (
    <div>
      {label && (
        <div style={{ fontSize: 11, color: 'var(--color-encore-text-muted)', marginBottom: 10, fontFamily: 'var(--font-google-sans), sans-serif', fontWeight: 700, letterSpacing: '0.04em' }}>
          {label}
        </div>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {colors.map((c) => {
          const isSelected = c === selected
          return (
            <button
              key={c}
              onClick={() => pick(c)}
              style={{
                width: 40,
                height: 40,
                borderRadius: 999,
                background: c,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isSelected ? `0 0 0 3px var(--color-encore-bg), 0 0 0 5px ${c}` : 'none',
                transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                transition: 'transform 0.15s, box-shadow 0.15s',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {isSelected && <Check size={18} weight="bold" color="white" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
