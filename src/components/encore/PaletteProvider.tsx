'use client'

/**
 * PaletteProvider
 * ルートレイアウトに配置するクライアントコンポーネント。
 * 全ページのマウント時に localStorage からパレットを読み込んで CSS 変数に適用し、
 * encore-palette-update イベントを受けて再適用する。
 */

import { useEffect } from 'react'

// ColorPalette.tsx と同一の定義（import すると循環しうるため複製）
// defaultHex / defaultAlpha は未保存時のフォールバック = Grape カラー
const PALETTE_DEFS = [
  { key: 'bg',           cssVar: '--color-encore-bg',           defaultHex: '#F5F3FB', defaultAlpha: 1    },
  { key: 'bg-section',   cssVar: '--color-encore-bg-section',   defaultHex: '#EDE9F5', defaultAlpha: 1    },
  { key: 'green',        cssVar: '--color-encore-green',        defaultHex: '#3D1A78', defaultAlpha: 1    },
  { key: 'green-muted',  cssVar: '--color-encore-green-muted',  defaultHex: '#9878CC', defaultAlpha: 1    },
  { key: 'amber',        cssVar: '--color-encore-amber',        defaultHex: '#C04890', defaultAlpha: 1    },
  { key: 'text-sub',     cssVar: '--color-encore-text-sub',     defaultHex: '#3D1A78', defaultAlpha: 0.55 },
  { key: 'text-muted',   cssVar: '--color-encore-text-muted',   defaultHex: '#3D1A78', defaultAlpha: 0.35 },
  { key: 'border',       cssVar: '--color-encore-border',       defaultHex: '#C0B2D8', defaultAlpha: 1    },
  { key: 'border-light', cssVar: '--color-encore-border-light', defaultHex: '#E0DAF0', defaultAlpha: 1    },
  { key: 'white',        cssVar: '--color-encore-white',        defaultHex: '#FFFFFF', defaultAlpha: 1    },
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
    // 未保存時は Grape をデフォルトとして適用（CSS デフォルトの Moss が見えるのを防ぐ）
    const saved = raw ? JSON.parse(raw) as Record<string, { hex: string; alpha: number }> : null
    for (const def of PALETTE_DEFS) {
      const val = saved?.[def.key] ?? { hex: def.defaultHex, alpha: def.defaultAlpha }
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
