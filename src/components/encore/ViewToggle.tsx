'use client'

import React, { useState, useRef, useEffect } from 'react'
import * as ty from './typographyStyles'

interface ViewToggleOption {
  value: string
  label: string
  icon: React.ReactNode
}

interface ViewToggleProps {
  options: ViewToggleOption[]
  defaultValue?: string
  onChange?: (value: string) => void
}

export default function ViewToggle({ options, defaultValue, onChange }: ViewToggleProps) {
  const [active, setActive] = useState(defaultValue ?? options[0]?.value)
  const activeIndex = options.findIndex(o => o.value === active)
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [indicator, setIndicator] = useState({ left: 3, width: 0 })

  useEffect(() => {
    const btn = buttonRefs.current[activeIndex]
    if (btn) {
      setIndicator({ left: btn.offsetLeft, width: btn.offsetWidth })
    }
  }, [active, activeIndex])

  const handleSelect = (value: string) => {
    setActive(value)
    onChange?.(value)
  }

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        background: 'var(--color-encore-bg-section)',
        borderRadius: 999,
        padding: 3,
      }}
    >
      {/* スライディングインジケーター */}
      <div
        style={{
          position: 'absolute',
          top: 3,
          bottom: 3,
          left: indicator.left,
          width: indicator.width,
          borderRadius: 999,
          background: 'var(--color-encore-green)',
          transition: 'left 0.22s cubic-bezier(0.4, 0, 0.2, 1), width 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: 'none',
        }}
      />
      {/* ボタン */}
      {options.map((opt, i) => {
        const isActive = active === opt.value
        return (
          <button
            key={opt.value}
            ref={el => { buttonRefs.current[i] = el }}
            onClick={() => handleSelect(opt.value)}
            style={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              height: 28,
              padding: '0 12px',
              borderRadius: 999,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
              ...ty.caption,
              fontWeight: 700,
              color: isActive ? 'var(--color-encore-white)' : 'var(--color-encore-text-sub)',
              transition: 'color 0.22s',
              whiteSpace: 'nowrap',
            }}
          >
            {React.cloneElement(opt.icon as React.ReactElement<{ color?: string }>, {
              color: isActive ? 'var(--color-encore-white)' : 'var(--color-encore-text-sub)',
            })}
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
