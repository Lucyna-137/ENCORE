'use client'

import React, { useState } from 'react'
import { Check } from '@phosphor-icons/react'
import * as ty from './typographyStyles'

interface ColorPickerProps {
  label?: string
  colors?: string[]
  defaultValue?: string
  onChange?: (color: string) => void
}

const DEFAULT_COLORS = [
  'var(--color-encore-green)',
  'var(--color-encore-amber)',
  '#0EA5E9',
  '#7C3AED',
  '#EC4899',
  '#10B981',
  '#F59E0B',
  '#DC2626',
  '#F97316',
  '#06B6D4',
  '#8B5CF6',
  '#84CC16',
  '#14B8A6',
  '#6366F1',
  '#FB7185',
  '#A78BFA',
  'linear-gradient(135deg, #f093fb, #f5576c)',
  'linear-gradient(135deg, #4facfe, #00f2fe)',
  'linear-gradient(135deg, #43e97b, #38f9d7)',
  'linear-gradient(135deg, #fa709a, #fee140)',
  'linear-gradient(135deg, #a18cd1, #fbc2eb)',
  'linear-gradient(135deg, #fda085, #f6d365)',
  'linear-gradient(135deg, #667eea, #764ba2)',
  'linear-gradient(135deg, #ff9a9e, #fecfef)',
]

// スクワークルのSVGパス（k=0.65の超楕円近似）
const squirclePath = (s: number) => {
  const r = s / 2
  const k = r * 0.72
  return `M ${s} ${r} C ${s} ${r + k} ${r + k} ${s} ${r} ${s} C ${r - k} ${s} 0 ${r + k} 0 ${r} C 0 ${r - k} ${r - k} 0 ${r} 0 C ${r + k} 0 ${s} ${r - k} ${s} ${r} Z`
}

export default function ColorPicker({ label, colors = DEFAULT_COLORS, defaultValue, onChange }: ColorPickerProps) {
  const [selected, setSelected] = useState(defaultValue ?? colors[0])

  const pick = (c: string) => {
    setSelected(c)
    onChange?.(c)
  }

  return (
    <div>
      {label && (
        <div style={{ ...ty.bodySM, marginBottom: 10 }}>
          {label}
        </div>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {colors.map((c) => {
          const isSelected = c === selected
          return (
            <div
              key={c}
              style={{
                position: 'relative',
                width: 36,
                height: 36,
                flexShrink: 0,
              }}
            >
              {/* 選択リング */}
              {isSelected && (
                <>
                  <div style={{
                    position: 'absolute',
                    inset: -3,
                    background: c,
                    clipPath: `path("${squirclePath(42)}")`,
                  }} />
                  <div style={{
                    position: 'absolute',
                    inset: -1,
                    background: 'var(--color-encore-bg)',
                    clipPath: `path("${squirclePath(38)}")`,
                  }} />
                </>
              )}
              <button
                onClick={() => pick(c)}
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: c,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  clipPath: `path("${squirclePath(36)}")`,
                  transition: 'transform 0.15s',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                {isSelected && <Check size={16} weight="bold" color="white" />}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
