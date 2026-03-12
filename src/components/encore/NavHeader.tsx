'use client'

import React from 'react'
import { ArrowLeft, X } from '@phosphor-icons/react'

interface NavHeaderProps {
  title: string
  titleEn?: boolean
  variant?: 'back' | 'close' | 'title-only'
  onBack?: () => void
  showStatusBar?: boolean
}

function StatusBar({ dark = false }: { dark?: boolean }) {
  return (
    <div
      className="flex justify-between items-center px-6 pt-4 pb-2"
      style={{ background: dark ? 'var(--color-encore-green)' : 'var(--color-encore-bg)' }}
    >
      <span
        style={{
          fontFamily: 'var(--font-google-sans), sans-serif',
          fontSize: 15,
          fontWeight: 700,
          color: dark ? 'var(--color-encore-white)' : 'var(--color-encore-green)',
          letterSpacing: '-0.03em',
        }}
      >
        19:17
      </span>
      <div className="flex items-center gap-1" style={{ color: dark ? 'var(--color-encore-white)' : 'var(--color-encore-green)' }}>
        <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor">
          <rect x="0" y="6" width="3" height="5" rx="0.5"/>
          <rect x="4.5" y="4" width="3" height="7" rx="0.5"/>
          <rect x="9" y="1.5" width="3" height="9.5" rx="0.5"/>
          <rect x="13.5" y="0" width="3" height="11" rx="0.5" opacity="0.3"/>
        </svg>
        <svg width="25" height="12" viewBox="0 0 25 12" fill="currentColor">
          <rect x="0.5" y="0.5" width="21" height="11" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1"/>
          <rect x="2" y="2" width="16" height="8" rx="1.5"/>
          <rect x="22.5" y="3.5" width="2" height="5" rx="1" opacity="0.45"/>
        </svg>
      </div>
    </div>
  )
}

export { StatusBar }

export default function NavHeader({
  title,
  titleEn = false,
  variant = 'title-only',
  onBack,
  showStatusBar = false,
}: NavHeaderProps) {
  return (
    <div>
      {showStatusBar && <StatusBar />}
      <div
        className="flex items-center justify-center relative"
        style={{
          height: 52,
          background: 'var(--color-encore-bg)',
          borderBottom: '1px solid var(--color-encore-border-light)',
        }}
      >
        {(variant === 'back') && (
          <button
            onClick={onBack}
            className="absolute left-[14px] top-1/2 -translate-y-1/2 flex items-center p-2 bg-transparent border-none cursor-pointer transition-opacity duration-150 active:opacity-50"
            style={{ color: 'var(--color-encore-green)', WebkitTapHighlightColor: 'transparent' }}
          >
            <ArrowLeft size={22} weight="light" />
          </button>
        )}
        {(variant === 'close') && (
          <button
            onClick={onBack}
            className="absolute left-[14px] top-1/2 -translate-y-1/2 flex items-center p-2 bg-transparent border-none cursor-pointer transition-opacity duration-150 active:opacity-50"
            style={{ color: 'var(--color-encore-green)', WebkitTapHighlightColor: 'transparent' }}
          >
            <X size={20} weight="light" />
          </button>
        )}
        <span
          style={
            titleEn
              ? {
                  fontFamily: 'var(--font-google-sans), sans-serif',
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase' as const,
                  color: 'var(--color-encore-green)',
                  paddingLeft: variant !== 'title-only' ? 52 : 0,
                  paddingRight: variant !== 'title-only' ? 52 : 0,
                }
              : {
                  fontSize: 15,
                  fontWeight: 700,
                  color: 'var(--color-encore-green)',
                  letterSpacing: '0.01em',
                  paddingLeft: variant !== 'title-only' ? 52 : 0,
                  paddingRight: variant !== 'title-only' ? 52 : 0,
                }
          }
        >
          {title}
        </span>
      </div>
    </div>
  )
}
