'use client'

import React, { useState, useRef, useEffect } from 'react'
import { CaretDown, Check } from '@phosphor-icons/react'
import * as ty from './typographyStyles'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  label?: string
  options: SelectOption[]
  value?: string
  placeholder?: string
  onChange?: (value: string) => void
}

export default function Select({ label, options, value, placeholder = '選択してください', onChange }: SelectProps) {
  const [open, setOpen]     = useState(false)
  const [current, setCurrent] = useState(value ?? '')
  const ref = useRef<HTMLDivElement>(null)

  const selected = options.find(o => o.value === current)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const select = (val: string) => {
    setCurrent(val)
    onChange?.(val)
    setOpen(false)
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {label && (
        <div style={{ ...ty.bodySM, marginBottom: 6 }}>
          {label}
        </div>
      )}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%',
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 14px',
          background: 'var(--color-encore-bg-section)',
          borderRadius: 3,
          border: 'none',
          cursor: 'pointer',
          ...(selected ? ty.body : ty.bodySM),
          color: selected ? 'var(--color-encore-green)' : 'var(--color-encore-text-sub)',
          transition: 'border-color 0.15s',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selected ? selected.label : placeholder}
        </span>
        <span style={{ color: 'var(--color-encore-green)', marginLeft: 8, flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', display: 'flex' }}>
          <CaretDown size={16} weight="light" />
        </span>
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          right: 0,
          background: 'var(--color-encore-bg)',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
          overflow: 'hidden',
          zIndex: 50,
        }}>
          {options.map((opt, i) => (
            <button
              key={opt.value}
              onClick={() => select(opt.value)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                background: current === opt.value ? 'var(--color-encore-bg-section)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                ...ty.bodySM,
                color: current === opt.value ? 'var(--color-encore-green)' : 'var(--color-encore-text-sub)',
                fontWeight: current === opt.value ? 700 : 400,
                textAlign: 'left',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {opt.label}
              {current === opt.value && <Check size={16} weight="light" color="var(--color-encore-green)" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
