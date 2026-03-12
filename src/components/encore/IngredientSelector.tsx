'use client'

import React, { useState } from 'react'

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
        <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4, color: 'var(--color-encore-green)' }}>{title}</div>
        {description && (
          <div style={{ fontSize: 13, color: 'var(--color-encore-text-sub)' }}>{description}</div>
        )}
      </div>
      <div
        className="flex flex-wrap"
        style={{ gap: 14, padding: '16px 20px 16px' }}
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
              <div
                className="relative flex items-center justify-center"
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 20,
                  background: isSelected ? 'var(--color-encore-bg)' : 'var(--color-encore-bg-section)',
                  border: `2.5px solid ${isSelected ? 'var(--color-encore-green)' : 'transparent'}`,
                  fontSize: 30,
                  transition: 'border-color 0.2s, background 0.2s',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}
              >
                {item.emoji}
                {isSelected && (
                  <div
                    className="encore-badge-pop absolute flex items-center justify-center"
                    style={{
                      top: -6,
                      right: -6,
                      width: 22,
                      height: 22,
                      background: 'var(--color-encore-green)',
                      borderRadius: '50%',
                      color: 'var(--color-encore-white)',
                      fontSize: 11,
                      fontWeight: 700,
                      fontFamily: 'var(--font-google-sans), sans-serif',
                    }}
                  >
                    ✓
                  </div>
                )}
              </div>
              <div style={{ fontSize: 12, textAlign: 'center', color: 'var(--color-encore-green)', lineHeight: 1.3 }}>
                {item.name}
              </div>
              {item.price && (
                <div style={{ fontSize: 11, color: 'var(--color-encore-text-sub)' }}>{item.price}</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
