'use client'

import React, { useState, useEffect } from 'react'

/**
 * 複数アーティスト画像をフェードイン/アウトでループ切り替えするコンポーネント
 * WeekView / DayView の小さいイベントブロック向け（円形クリップ）
 */
export default function CyclingArtistImage({
  images,
  alt,
  size,
  borderRadius = '50%',
  intervalMs = 2400,
}: {
  images: string[]
  alt: string
  size: number
  borderRadius?: string | number
  intervalMs?: number
}) {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (images.length <= 1) return
    const id = setInterval(() => setActiveIndex(i => (i + 1) % images.length), intervalMs)
    return () => clearInterval(id)
  }, [images.length, intervalMs])

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        borderRadius,
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {images.map((img, i) => (
        <img
          key={img}
          src={img}
          alt={alt}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            display: 'block',
            opacity: i === activeIndex ? 1 : 0,
            transition: 'opacity 0.9s ease',
          }}
        />
      ))}
    </div>
  )
}
