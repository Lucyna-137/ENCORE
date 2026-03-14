'use client'

import React, { useState, useRef } from 'react'
import { MagnifyingGlass, Clock } from '@phosphor-icons/react'
import * as ty from './typographyStyles'

interface SearchBarProps {
  placeholder?: string
  suggestions?: string[]
}

export default function SearchBar({
  placeholder = 'アーティスト・ライブ名を検索',
  suggestions = [],
}: SearchBarProps) {
  const [value, setValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = suggestions.filter(s =>
    value.length > 0 && s.toLowerCase().includes(value.toLowerCase())
  )
  const showSuggestions = isFocused && filtered.length > 0

  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'var(--color-encore-bg-section)',
          borderRadius: 999,
          padding: '0 16px',
          height: 42,
          margin: '12px 20px',
          border: isFocused ? '1px solid var(--color-encore-green)' : '1px solid transparent',
          transition: 'border-color 0.15s',
        }}
      >
        <span style={{ color: 'var(--color-encore-green)', flexShrink: 0, display: 'flex' }}>
          <MagnifyingGlass size={18} weight="light" />
        </span>
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={e => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 150)}
          className="flex-1 outline-none"
          style={{
            ...ty.body,
            background: 'transparent',
            border: 'none',
          }}
        />
      </div>

      {showSuggestions && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% - 4px)',
          left: 20,
          right: 20,
          background: 'var(--color-encore-bg)',
          borderRadius: 4,
          boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
          overflow: 'hidden',
          zIndex: 50,
        }}>
          {filtered.map((s, i) => (
            <button
              key={i}
              onMouseDown={() => {
                setValue(s)
                setIsFocused(false)
                inputRef.current?.blur()
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '11px 16px',
                background: 'transparent',
                border: 'none',
                borderTop: i > 0 ? '1px solid var(--color-encore-border-light)' : 'none',
                cursor: 'pointer',
                ...ty.bodySM,
                color: 'var(--color-encore-text-sub)',
                textAlign: 'left',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <Clock size={13} weight="light" color="var(--color-encore-text-muted)" />
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
