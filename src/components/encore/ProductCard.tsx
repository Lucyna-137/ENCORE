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
      className="overflow-hidden cursor-pointer transition-all duration-200 ease-out shadow-[0_2px_8px_rgba(0,0,0,0.07)] hover:-translate-y-[3px] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] active:scale-[0.98]"
      style={{
        background: '#EDEAE4',
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
              fontWeight: 600,
              padding: '3px 10px',
              color: '#1B3C2D',
              fontFamily: '"Helvetica Neue", Arial, sans-serif',
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
            <span style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>{title}</span>
            <span style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>{price}</span>
          </div>
        )}
      </div>

      <div style={{ padding: '14px 16px 16px' }}>
        {variant === 'like' && (
          <div style={{ fontSize: 15, fontWeight: 600, color: '#1B3C2D', marginBottom: 6 }}>
            {title}
          </div>
        )}
        <div style={{ fontSize: 13, color: '#6B6B6B', lineHeight: 1.55, marginBottom: 8 }}>
          {description}
        </div>
        {variant === 'overlay' ? (
          <button
            onClick={handleLike}
            style={{
              display: 'inline',
              fontSize: 14,
              color: '#C08A4A',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              padding: 0,
              fontFamily: '"Hiragino Sans", "Yu Gothic", "Noto Sans JP", sans-serif',
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
                color: '#C08A4A',
                cursor: 'pointer',
                background: 'none',
                border: 'none',
                padding: 0,
                fontFamily: '"Hiragino Sans", "Yu Gothic", "Noto Sans JP", sans-serif',
              }}
            >
              このままカートに入れる
            </button>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#1B3C2D' }}>{price}</span>
          </div>
        )}
      </div>
    </div>
  )
}
