'use client'

import React, { useState } from 'react'

interface SegmentedOption {
  label: string
  icon?: React.ReactNode
}

interface SegmentedControlProps {
  options: SegmentedOption[]
  defaultSelected?: number
  onChange?: (index: number) => void
}

export default function SegmentedControl({
  options,
  defaultSelected = 0,
  onChange,
}: SegmentedControlProps) {
  const [selected, setSelected] = useState(defaultSelected)

  const handleClick = (i: number) => {
    setSelected(i)
    onChange?.(i)
  }

  return (
    <div className="flex gap-2" style={{ padding: '16px 20px' }}>
      {options.map((opt, i) => (
        <button
          key={i}
          onClick={() => handleClick(i)}
          className="flex-1 flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-200"
          style={{
            height: 46,
            border: selected === i
              ? '1px solid var(--color-encore-green)'
              : '1.5px solid var(--color-encore-border-light)',
            borderRadius: 999,
            background: selected === i ? 'rgba(26,58,45,0.04)' : 'transparent',
            fontSize: 12,
            fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
            color: selected === i ? 'var(--color-encore-green)' : 'var(--color-encore-text-sub)',
            fontWeight: 400,
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          {opt.icon && (
            <span style={{ display: 'flex', flexShrink: 0 }}>{opt.icon}</span>
          )}
          {opt.label}
        </button>
      ))}
    </div>
  )
}
