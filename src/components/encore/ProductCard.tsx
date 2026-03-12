'use client'

import React, { useState } from 'react'

interface ProductCardProps {
  variant?: 'overlay' | 'like'
  title: string
  description: string
  price: string
  badge?: string
  emoji?: string
  onLike?: () => void
}

export default function ProductCard({
  variant = 'like',
  title,
  description,
  price,
  badge,
  emoji = '🥗',
  onLike,
}: ProductCardProps) {
  const [liked, setLiked] = useState(false)

  const handleLike = () => {
    setLiked(!liked)
    onLike?.()
  }

  return (
    <div
      className="overflow-hidden cursor-pointer transition-all duration-200 ease-out shadow-[var(--shadow-card)] hover:-translate-y-[3px] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] active:scale-[0.98]"
      style={{
        background: 'var(--color-encore-bg-card)',
        borderRadius: 16,
      }}
    >
      <div className="relative">
        <div
          className="w-full flex items-center justify-center"
          style={{
            height: 180,
            background: variant === 'overlay'
              ? 'linear-gradient(135deg, #C8D4C0, #A8BC9C)'
              : 'linear-gradient(135deg, #D4CCBC, #BAB0A0)',
            fontSize: 52,
          }}
        >
          {emoji}
        </div>

        {badge && (
          <div
            className="absolute top-2.5 right-2.5"
            style={{
              background: 'rgba(255,255,255,0.88)',
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 700,
              padding: '3px 10px',
              color: 'var(--color-encore-green)',
              fontFamily: 'var(--font-google-sans), sans-serif',
            }}
          >
            {badge}
          </div>
        )}

        {variant === 'overlay' && (
          <div
            className="absolute bottom-0 left-0 right-0 flex justify-between items-end"
            style={{
              padding: '12px 16px',
              background: 'linear-gradient(to top, rgba(0,0,0,0.52) 0%, transparent 100%)',
            }}
          >
            <span style={{ color: 'var(--color-encore-white)', fontSize: 14, fontWeight: 700 }}>{title}</span>
            <span style={{ color: 'var(--color-encore-white)', fontSize: 14, fontWeight: 700 }}>{price}</span>
          </div>
        )}
      </div>

      <div style={{ padding: '14px 16px 16px' }}>
        {variant === 'like' && (
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-encore-green)', marginBottom: 6 }}>
            {title}
          </div>
        )}
        <div style={{ fontSize: 13, color: 'var(--color-encore-text-sub)', lineHeight: 1.55, marginBottom: 8 }}>
          {description}
        </div>
        {variant === 'overlay' ? (
          <button
            onClick={handleLike}
            style={{
              display: 'inline',
              fontSize: 14,
              color: 'var(--color-encore-amber)',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              padding: 0,
              fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
            }}
          >
            これスキ！
          </button>
        ) : (
          <div className="flex justify-between items-center mt-2">
            <button
              onClick={handleLike}
              style={{
                display: 'inline',
                fontSize: 14,
                color: 'var(--color-encore-amber)',
                cursor: 'pointer',
                background: 'none',
                border: 'none',
                padding: 0,
                fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
              }}
            >
              このままカートに入れる
            </button>
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-encore-green)' }}>{price}</span>
          </div>
        )}
      </div>
    </div>
  )
}
