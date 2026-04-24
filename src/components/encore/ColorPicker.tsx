'use client'

import React, { useState } from 'react'
import { Check } from '@phosphor-icons/react'
import * as ty from './typographyStyles'

// null = "規定の色"（カスタム色なし）
export type ColorValue = string | null

interface ColorPickerProps {
  label?: string
  colors?: string[]
  /** null = 規定の色（デフォルト） */
  value?: ColorValue
  /** null = 規定の色（デフォルト）; 未指定時は null（規定）が初期選択 */
  defaultValue?: ColorValue
  onChange?: (color: ColorValue) => void
  /** 規定の色スウォッチを先頭に表示するか（デフォルト: true） */
  showDefault?: boolean
}

const DEFAULT_COLORS = [
  // Row 1: ウォーム系
  '#D94848', // トマトレッド
  '#E88888', // サーモンピンク
  '#58B870', // ミディアムグリーン
  '#E8C040', // ゴールデンイエロー
  '#2D7050', // フォレストグリーン
  '#3AA878', // エメラルドティール
  // Row 2: クール系
  '#C0A0E0', // ラベンダー
  '#6870CC', // コーンフラワーパープル
  '#2C2C78', // ダークネイビー
  '#88A0D8', // スレートブルー
  '#4878C0', // コーンフラワーブルー
  '#303888', // ロイヤルブルー
]

/** 規定の色スウォッチの視覚的な背景色（実際には color = undefined として扱う） */
export const DEFAULT_EVENT_COLOR_VISUAL = '#E9E8E4'

// スクワークルのSVGパス（k=0.65の超楕円近似）
const squirclePath = (s: number) => {
  const r = s / 2
  const k = r * 0.72
  return `M ${s} ${r} C ${s} ${r + k} ${r + k} ${s} ${r} ${s} C ${r - k} ${s} 0 ${r + k} 0 ${r} C 0 ${r - k} ${r - k} 0 ${r} 0 C ${r + k} 0 ${s} ${r - k} ${s} ${r} Z`
}

export default function ColorPicker({
  label,
  colors = DEFAULT_COLORS,
  value,
  defaultValue,
  onChange,
  showDefault = true,
}: ColorPickerProps) {
  // controlled優先、なければ uncontrolled（初期値 null = 規定の色）
  const [internalSelected, setInternalSelected] = useState<ColorValue>(
    defaultValue !== undefined ? defaultValue : null
  )
  const selected = value !== undefined ? value : internalSelected

  const pick = (c: ColorValue) => {
    if (value === undefined) setInternalSelected(c)
    onChange?.(c)
  }

  const renderSwatch = (colorVal: ColorValue, bg: string, key: string) => {
    const isSelected = selected === colorVal
    const isDefault = colorVal === null
    return (
      <div
        key={key}
        style={{ position: 'relative', width: 36, height: 36, flexShrink: 0 }}
      >
        {/* 選択リング */}
        {isSelected && (
          <>
            <div style={{
              position: 'absolute', inset: -3,
              background: isDefault ? 'var(--color-encore-border)' : bg,
              clipPath: `path("${squirclePath(42)}")`,
            }} />
            <div style={{
              position: 'absolute', inset: -1,
              background: 'var(--color-encore-bg)',
              clipPath: `path("${squirclePath(38)}")`,
            }} />
          </>
        )}
        <button
          onClick={() => pick(colorVal)}
          style={{
            position: 'absolute', inset: 0,
            background: bg,
            border: 'none',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            clipPath: `path("${squirclePath(36)}")`,
            transition: 'transform 0.15s',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          {isSelected && isDefault && (
            <Check size={16} weight="bold" color="var(--color-encore-text-muted)" />
          )}
          {isSelected && !isDefault && (
            <Check size={16} weight="bold" color="white" />
          )}
          {/* 未選択の規定スウォッチ: "規定" のラベルを内側に表示 */}
          {!isSelected && isDefault && (
            <span style={{
              fontSize: 8, fontWeight: 700,
              color: 'var(--color-encore-text-muted)',
              fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
              lineHeight: 1, textAlign: 'center',
              pointerEvents: 'none',
            }}>
              規定
            </span>
          )}
        </button>
      </div>
    )
  }

  return (
    <div>
      {label && (
        <div style={{ ...ty.bodySM, marginBottom: 10 }}>
          {label}
        </div>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {showDefault && renderSwatch(null, DEFAULT_EVENT_COLOR_VISUAL, '__default__')}
        {colors.map((c) => renderSwatch(c, c, c))}
      </div>
    </div>
  )
}
