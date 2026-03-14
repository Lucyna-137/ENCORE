'use client'

import React, { useState } from 'react'
import * as ty from './typographyStyles'

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
            <span style={{ ...ty.sectionSM, color: 'var(--color-encore-white)' }}>{title}</span>
            <span style={{ ...ty.price, color: 'var(--color-encore-white)' }}>{price}</span>
          </div>
        )}
      </div>

      <div style={{ padding: '14px 16px 16px' }}>
        {variant === 'like' && (
          <div style={{ ...ty.section, marginBottom: 6 }}>
            {title}
          </div>
        )}
        <div style={{ ...ty.sub, lineHeight: 1.55, marginBottom: 8 }}>
          {description}
        </div>
        {variant === 'overlay' ? (
          <button
            onClick={handleLike}
            style={{
              ...ty.link,
              display: 'inline',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              padding: 0,
            }}
          >
            これスキ！
          </button>
        ) : (
          <div className="flex justify-between items-center mt-2">
            <button
              onClick={handleLike}
              style={{
                ...ty.link,
                display: 'inline',
                cursor: 'pointer',
                background: 'none',
                border: 'none',
                padding: 0,
              }}
            >
              このままカートに入れる
            </button>
            <span style={ty.price}>{price}</span>
          </div>
        )}
      </div>
    </div>
  )
}
