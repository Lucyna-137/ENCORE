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
      className="overflow-hidden cursor-pointer transition-all duration-200 ease-out hover:-translate-y-[3px] active:scale-[0.98]"
      style={{
        background: 'var(--color-encore-bg-card)',
        borderRadius: 8,
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

        {variant === 'overlay' && (
          <div
            className="absolute bottom-0 left-0 right-0 flex justify-between items-end"
            style={{
              padding: '12px 16px',
              background: 'linear-gradient(to top, rgba(0,0,0,0.52) 0%, transparent 100%)',
            }}
          >
            <span style={{ color: 'var(--color-encore-white)', fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif' }}>{title}</span>
            <span style={{ color: 'var(--color-encore-white)', fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-google-sans), sans-serif' }}>{price}</span>
          </div>
        )}
      </div>

      <div style={{ padding: '14px 16px 16px' }}>
        {variant === 'like' && (
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-encore-green)', marginBottom: 6, fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif' }}>
            {title}
          </div>
        )}
        <div style={{ fontSize: 12, color: 'var(--color-encore-text-sub)', lineHeight: 1.55, marginBottom: 8, fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif' }}>
          {description}
        </div>
        {variant === 'overlay' ? (
          <button
            onClick={handleLike}
            style={{
              display: 'inline',
              fontSize: 13,
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
                fontSize: 13,
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
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-encore-green)', fontFamily: 'var(--font-google-sans), sans-serif' }}>{price}</span>
          </div>
        )}
      </div>
    </div>
  )
}
