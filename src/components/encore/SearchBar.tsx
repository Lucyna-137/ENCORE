'use client'

import React from 'react'
import { MagnifyingGlass } from '@phosphor-icons/react'

interface SearchBarProps {
  placeholder?: string
}

export default function SearchBar({ placeholder = 'アーティスト・ライブ名を検索' }: SearchBarProps) {
  return (
    <div
      className="flex items-center gap-2 transition-shadow duration-200 focus-within:[box-shadow:0_0_0_2px_var(--color-encore-green)]"
      style={{
        background: 'var(--color-encore-bg-section)',
        borderRadius: 999,
        padding: '0 16px',
        height: 42,
        margin: '12px 20px',
      }}
    >
      <span style={{ color: 'var(--color-encore-text-muted)', flexShrink: 0, display: 'flex' }}>
        <MagnifyingGlass size={18} weight="light" />
      </span>
      <input
        type="text"
        placeholder={placeholder}
        className="flex-1 outline-none"
        style={{
          background: 'transparent',
          border: 'none',
          fontSize: 14,
          color: 'var(--color-encore-green)',
          fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
        }}
      />
    </div>
  )
}
