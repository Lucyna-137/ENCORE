'use client'

import React, { useState } from 'react'
import * as ty from './typographyStyles'

const squirclePath = (s: number) => {
  const r = s / 2
  const k = r * 0.72
  return `M ${s} ${r} C ${s} ${r + k} ${r + k} ${s} ${r} ${s} C ${r - k} ${s} 0 ${r + k} 0 ${r} C 0 ${r - k} ${r - k} 0 ${r} 0 C ${r + k} 0 ${s} ${r - k} ${s} ${r} Z`
}

interface Ingredient {
  id: string
  name: string
  emoji: string
  price?: string
}

interface IngredientSelectorProps {
  title: string
  description?: string
  ingredients: Ingredient[]
}

export default function IngredientSelector({
  title,
  description,
  ingredients,
}: IngredientSelectorProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set([ingredients[0]?.id]))

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <div>
      <div style={{ padding: '20px 20px 8px' }}>
        <div style={{ ...ty.section, marginBottom: 4 }}>{title}</div>
        {description && (
          <div style={{ ...ty.body, color: 'var(--color-encore-text-sub)' }}>{description}</div>
        )}
      </div>
      <div
        className="flex flex-wrap justify-center"
        style={{ gap: 30, padding: '16px 20px 16px' }}
      >
        {ingredients.map((item) => {
          const isSelected = selected.has(item.id)
          return (
            <div
              key={item.id}
              onClick={() => toggle(item.id)}
              className="flex flex-col items-center cursor-pointer select-none transition-transform duration-150 active:scale-[0.92]"
              style={{ gap: 8, width: 80, WebkitTapHighlightColor: 'transparent' }}
            >
              {/* squircle タイル：選択時は緑ラッパー + 白インナー */}
              <div className="relative" style={{ width: 84, height: 84, flexShrink: 0 }}>
                {/* 選択時の緑枠ラッパー */}
                <div style={{
                  position: 'absolute', inset: 0,
                  clipPath: `path("${squirclePath(84)}")`,
                  background: isSelected ? 'var(--color-encore-green)' : 'transparent',
                  transition: 'background 0.2s',
                }} />
                {/* インナータイル（2px border = inset 2px） */}
                <div
                  className="absolute flex items-center justify-center"
                  style={{
                    inset: isSelected ? 2 : 0,
                    clipPath: `path("${squirclePath(isSelected ? 80 : 84)}")`,
                    background: 'var(--color-encore-bg-section)',
                    fontSize: 30,
                    transition: 'inset 0.2s, background 0.2s',
                  }}
                >
                  {item.emoji}
                </div>
                {isSelected && (
                  <div
                    className="encore-badge-pop absolute flex items-center justify-center"
                    style={{
                      top: -2,
                      right: -2,
                      width: 20,
                      height: 20,
                      background: 'var(--color-encore-green)',
                      borderRadius: '50%',
                      color: 'var(--color-encore-white)',
                      fontSize: 10,
                      fontWeight: 700,
                      fontFamily: 'var(--font-google-sans), sans-serif',
                    }}
                  >
                    ✓
                  </div>
                )}
              </div>
              <div style={{ ...ty.bodySM, textAlign: 'center', lineHeight: 1.3 }}>
                {item.name}
              </div>
              {item.price && (
                <div style={ty.captionMuted}>{item.price}</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
