'use client'

import React from 'react'

interface SearchBarProps {
  placeholder?: string
}

export default function SearchBar({ placeholder = '探したい店舗のキーワードを入力' }: SearchBarProps) {
  return (
    <div
      className="flex items-center gap-2 transition-shadow duration-200 focus-within:[box-shadow:0_0_0_2px_#1B3C2D]"
      style={{
        background: '#E8E5DF',
        borderRadius: 999,
        padding: '0 16px',
        height: 42,
        margin: '12px 20px',
      }}
    >
      <span style={{ fontSize: 15, color: '#AEAAA3', flexShrink: 0 }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="7" cy="7" r="5"/>
          <path d="M12 12l2.5 2.5"/>
        </svg>
      </span>
      <input
        type="text"
        placeholder={placeholder}
        className="flex-1 outline-none"
        style={{
          background: 'transparent',
          border: 'none',
          fontSize: 14,
          color: '#1B3C2D',
          fontFamily: '"Hiragino Sans", "Yu Gothic", "Noto Sans JP", sans-serif',
        }}
      />
    </div>
  )
}
