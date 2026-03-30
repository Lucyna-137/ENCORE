'use client'

/**
 * PaletteProvider
 * ルートレイアウトに配置するクライアントコンポーネント。
 * 全ページのマウント時に localStorage からパレットを読み込んで CSS 変数に適用し、
 * encore-palette-update イベントを受けて再適用する。
 */

import { useEffect } from 'react'

// ColorPalette.tsx と同一の定義（import すると循環しうるため複製）
const PALETTE_DEFS = [
  { key: 'bg',           cssVar: '--color-encore-bg',           defaultHex: '#FAF8F4', defaultAlpha: 1 },
  { key: 'bg-section',   cssVar: '--color-encore-bg-section',   defaultHex: '#E9E8E4', defaultAlpha: 1 },
  { key: 'green',        cssVar: '--color-encore-green',        defaultHex: '#1A3A2D', defaultAlpha: 1 },
  { key: 'green-muted',  cssVar: '--color-encore-green-muted',  defaultHex: '#8BA898', defaultAlpha: 1 },
  { key: 'amber',        cssVar: '--color-encore-amber',        defaultHex: '#C08A4A', defaultAlpha: 1 },
  { key: 'text-sub',     cssVar: '--color-encore-text-sub',     defaultHex: '#1A3A2D', defaultAlpha: 0.55 },
  { key: 'text-muted',   cssVar: '--color-encore-text-muted',   defaultHex: '#1A3A2D', defaultAlpha: 0.35 },
  { key: 'border',       cssVar: '--color-encore-border',       defaultHex: '#BAC2BB', defaultAlpha: 1 },
  { key: 'border-light', cssVar: '--color-encore-border-light', defaultHex: '#E4E2DD', defaultAlpha: 1 },
  { key: 'white',        cssVar: '--color-encore-white',        defaultHex: '#FFFFFF', defaultAlpha: 1 },
] as const

const LS_KEY = 'encore-palette-v2'

function hexToRgb(hex: string): [number, number, number] | null {
  const h = hex.replace('#', '')
  if (h.length !== 6) return null
  const n = parseInt(h, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function applyPaletteFromStorage() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) {
      // カスタムパレットなし → インラインスタイルを全削除し CSS 変数（dark mode 含む）に委ねる
      for (const def of PALETTE_DEFS) {
        document.documentElement.style.removeProperty(def.cssVar)
      }
      return
    }
    const saved = JSON.parse(raw) as Record<string, { hex: string; alpha: number }>
    for (const def of PALETTE_DEFS) {
      const val = saved[def.key]
      if (!val) {
        document.documentElement.style.removeProperty(def.cssVar)
        continue
      }
      const rgb = hexToRgb(val.hex)
      if (!rgb) continue
      const value = val.alpha < 1
        ? `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${val.alpha})`
        : val.hex
      document.documentElement.style.setProperty(def.cssVar, value)
    }
  } catch { /* 無視 */ }
}

export default function PaletteProvider() {
  useEffect(() => {
    // マウント時に適用（ページ遷移・リロード後も確実に反映）
    applyPaletteFromStorage()

    // ColorPalette コンポーネントからのイベントで再適用
    const handler = () => applyPaletteFromStorage()
    window.addEventListener('encore-palette-update', handler)
    return () => window.removeEventListener('encore-palette-update', handler)
  }, [])

  return null
}
