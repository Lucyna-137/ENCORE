'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import FigmaColorPicker, { hexToRgb, rgbToHex } from './FigmaColorPicker'

// ─── Token definitions ───────────────────────────────────────────────────────

interface PaletteDef {
  key: string
  name: string
  cssVar: string
  defaultHex: string
  defaultAlpha: number  // 1.0 for solid, fractional for rgba tokens
  outlined?: boolean
}

const PALETTE_DEFS: PaletteDef[] = [
  { key: 'bg',           name: 'Background',   cssVar: '--color-encore-bg',           defaultHex: '#FAF8F4', defaultAlpha: 1 },
  { key: 'bg-section',   name: 'Section BG',   cssVar: '--color-encore-bg-section',   defaultHex: '#E9E8E4', defaultAlpha: 1 },
  { key: 'green',        name: 'Green',        cssVar: '--color-encore-green',        defaultHex: '#1A3A2D', defaultAlpha: 1 },
  { key: 'green-muted',  name: 'Green Muted',  cssVar: '--color-encore-green-muted',  defaultHex: '#8BA898', defaultAlpha: 1 },
  { key: 'amber',        name: 'Amber',        cssVar: '--color-encore-amber',        defaultHex: '#C08A4A', defaultAlpha: 1 },
  { key: 'text-sub',     name: 'Text Sub',     cssVar: '--color-encore-text-sub',     defaultHex: '#1A3A2D', defaultAlpha: 0.55 },
  { key: 'text-muted',   name: 'Text Muted',   cssVar: '--color-encore-text-muted',   defaultHex: '#1A3A2D', defaultAlpha: 0.35 },
  { key: 'border',       name: 'Border',       cssVar: '--color-encore-border',       defaultHex: '#BAC2BB', defaultAlpha: 1 },
  { key: 'border-light', name: 'Border Light', cssVar: '--color-encore-border-light', defaultHex: '#E4E2DD', defaultAlpha: 1, outlined: true },
  { key: 'white',        name: 'White',        cssVar: '--color-encore-white',        defaultHex: '#FFFFFF', defaultAlpha: 1, outlined: true },
]

const LS_KEY = 'encore-palette-v2'
const SCHEMES_LS_KEY = 'encore-palette-schemes-v1'

interface TokenValue { hex: string; alpha: number }
type PaletteState = Record<string, TokenValue>

interface ColorScheme {
  id: string
  name: string
  colors: PaletteState
}

// ─── Preset Schemes (built-in, cannot be deleted) ─────────────────────────

const PRESET_SCHEMES: ColorScheme[] = [
  {
    // Scheme 1: Grape — Grapeアプリ連想の紫ベース
    id: 'preset-grape',
    name: 'Grape',
    colors: {
      'bg':           { hex: '#F5F3FB', alpha: 1 },
      'bg-section':   { hex: '#EDE9F5', alpha: 1 },
      'green':        { hex: '#3D1A78', alpha: 1 },
      'green-muted':  { hex: '#9878CC', alpha: 1 },
      'amber':        { hex: '#C04890', alpha: 1 },
      'text-sub':     { hex: '#3D1A78', alpha: 0.55 },
      'text-muted':   { hex: '#3D1A78', alpha: 0.35 },
      'border':       { hex: '#C0B2D8', alpha: 1 },
      'border-light': { hex: '#E0DAF0', alpha: 1 },
      'white':        { hex: '#FFFFFF', alpha: 1 },
    },
  },
  {
    // Scheme 2: BlueBerry — クールネイビー×ゴールド
    id: 'preset-slate',
    name: 'BlueBerry',
    colors: {
      'bg':           { hex: '#F3F4F7', alpha: 1 },
      'bg-section':   { hex: '#E8EAEE', alpha: 1 },
      'green':        { hex: '#1A2840', alpha: 1 },
      'green-muted':  { hex: '#7888A8', alpha: 1 },
      'amber':        { hex: '#C8901A', alpha: 1 },
      'text-sub':     { hex: '#1A2840', alpha: 0.55 },
      'text-muted':   { hex: '#1A2840', alpha: 0.35 },
      'border':       { hex: '#B8C0D0', alpha: 1 },
      'border-light': { hex: '#DCDEE8', alpha: 1 },
      'white':        { hex: '#FFFFFF', alpha: 1 },
    },
  },
  {
    // Scheme 3: Ocean — 深海ティールベース
    id: 'preset-ocean',
    name: 'Ocean',
    colors: {
      'bg':           { hex: '#F0F8F8', alpha: 1 },
      'bg-section':   { hex: '#E0EEEE', alpha: 1 },
      'green':        { hex: '#0E3D40', alpha: 1 },
      'green-muted':  { hex: '#5A9898', alpha: 1 },
      'amber':        { hex: '#D07840', alpha: 1 },
      'text-sub':     { hex: '#0E3D40', alpha: 0.55 },
      'text-muted':   { hex: '#0E3D40', alpha: 0.35 },
      'border':       { hex: '#A0C4C4', alpha: 1 },
      'border-light': { hex: '#D4E8E8', alpha: 1 },
      'white':        { hex: '#FFFFFF', alpha: 1 },
    },
  },
  {
    // Scheme 4: Moss — アースグリーンベース（デフォルト配色）
    id: 'preset-moss',
    name: 'Moss',
    colors: {
      'bg':           { hex: '#FAF8F4', alpha: 1 },
      'bg-section':   { hex: '#E9E8E4', alpha: 1 },
      'green':        { hex: '#1A3A2D', alpha: 1 },
      'green-muted':  { hex: '#8BA898', alpha: 1 },
      'amber':        { hex: '#C08A4A', alpha: 1 },
      'text-sub':     { hex: '#1A3A2D', alpha: 0.55 },
      'text-muted':   { hex: '#1A3A2D', alpha: 0.35 },
      'border':       { hex: '#BAC2BB', alpha: 1 },
      'border-light': { hex: '#E4E2DD', alpha: 1 },
      'white':        { hex: '#FFFFFF', alpha: 1 },
    },
  },
]

// ─── Utilities ───────────────────────────────────────────────────────────────

function getDefaults(): PaletteState {
  return Object.fromEntries(
    PALETTE_DEFS.map(d => [d.key, { hex: d.defaultHex, alpha: d.defaultAlpha }])
  )
}

function applyToDom(def: PaletteDef, { hex, alpha }: TokenValue) {
  const rgb = hexToRgb(hex)
  if (!rgb) return
  const value = alpha < 1
    ? `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})`
    : hex
  document.documentElement.style.setProperty(def.cssVar, value)
}

function getSwatchBg(def: PaletteDef, { hex, alpha }: TokenValue): string {
  if (alpha < 1) {
    const rgb = hexToRgb(hex)
    if (rgb) return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})`
  }
  return hex
}

function getDisplayCode(def: PaletteDef, { hex, alpha }: TokenValue): string {
  if (alpha < 1) {
    const rgb = hexToRgb(hex)
    if (rgb) return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${+alpha.toFixed(2)})`
  }
  return hex.toUpperCase()
}

function colorsMatch(a: PaletteState, b: PaletteState): boolean {
  return PALETTE_DEFS.every(d => {
    const av = a[d.key], bv = b[d.key]
    if (!av || !bv) return false
    return av.hex === bv.hex && av.alpha === bv.alpha
  })
}

function getSchemeDisplayColors(scheme: ColorScheme) {
  const bg = scheme.colors['bg']?.hex ?? '#F2F0EB'
  const green = scheme.colors['green']
  const amber = scheme.colors['amber']
  const greenColor = green
    ? (green.alpha < 1
        ? `rgba(${(hexToRgb(green.hex) ?? [0,0,0]).join(',')},${green.alpha})`
        : green.hex)
    : '#1B3C2D'
  const amberColor = amber
    ? (amber.alpha < 1
        ? `rgba(${(hexToRgb(amber.hex) ?? [0,0,0]).join(',')},${amber.alpha})`
        : amber.hex)
    : '#C08A4A'
  return { bg, greenColor, amberColor }
}

// ─── Exported scheme helpers ─────────────────────────────────────────────────

export { PRESET_SCHEMES }

/** スキーム ID ('default' | 'preset-grape' | 'preset-ocean' | 'preset-slate') を適用 */
export function loadPaletteScheme(schemeId: string | 'default') {
  if (schemeId === 'default') {
    // デフォルト: localStorage を削除 → インラインスタイルも削除 → CSS に委ねる
    try { localStorage.removeItem(LS_KEY) } catch {}
    PALETTE_DEFS.forEach(def => {
      document.documentElement.style.removeProperty(def.cssVar)
    })
    window.dispatchEvent(new Event('encore-palette-update'))
    return
  }
  const scheme = PRESET_SCHEMES.find(s => s.id === schemeId)
  if (!scheme) return
  const next = { ...scheme.colors }
  PALETTE_DEFS.forEach(def => {
    const val = next[def.key] ?? { hex: def.defaultHex, alpha: def.defaultAlpha }
    applyToDom(def, val)
  })
  try { localStorage.setItem(LS_KEY, JSON.stringify(next)) } catch {}
  window.dispatchEvent(new Event('encore-palette-update'))
}

/** アプリ起動時にパレットをDOMへ適用。未設定の場合はGrapeをデフォルト適用 */
export function initPalette() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) {
      loadPaletteScheme('preset-grape')
      return
    }
    const saved = JSON.parse(raw) as Record<string, TokenValue>
    const merged: PaletteState = { ...getDefaults(), ...saved }
    PALETTE_DEFS.forEach(def => applyToDom(def, merged[def.key]))
  } catch {
    loadPaletteScheme('preset-grape')
  }
}

/** 現在適用中のスキーム ID を返す（一致なし = 'custom'） */
export function getCurrentPaletteSchemeId(): string {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return 'preset-grape'
    const saved = JSON.parse(raw) as PaletteState
    for (const s of PRESET_SCHEMES) {
      if (colorsMatch(saved, s.colors)) return s.id
    }
    return 'custom'
  } catch { return 'preset-grape' }
}

/**
 * useSyncExternalStore 向け購読関数。
 * encore-palette-update イベントが発火するたびに callback を呼ぶ。
 */
export function subscribeToSchemeId(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {}
  window.addEventListener('encore-palette-update', callback)
  return () => window.removeEventListener('encore-palette-update', callback)
}

// ─── PaletteResetButton (exported) ──────────────────────────────────────────

export function PaletteResetButton() {
  const [modified, setModified] = useState(false)

  useEffect(() => {
    const check = () => {
      try {
        const raw = localStorage.getItem(LS_KEY)
        if (!raw) { setModified(false); return }
        const saved = JSON.parse(raw) as Record<string, { hex: string; alpha: number }>
        const isM = PALETTE_DEFS.some(d => {
          const v = saved[d.key]
          return v && (v.hex !== d.defaultHex || v.alpha !== d.defaultAlpha)
        })
        setModified(isM)
      } catch { setModified(false) }
    }
    check()
    window.addEventListener('encore-palette-update', check)
    return () => window.removeEventListener('encore-palette-update', check)
  }, [])

  const reset = () => {
    localStorage.removeItem(LS_KEY)
    PALETTE_DEFS.forEach(def => applyToDom(def, { hex: def.defaultHex, alpha: def.defaultAlpha }))
    window.dispatchEvent(new Event('encore-palette-update'))
  }

  if (!modified) return null
  return (
    <button
      onClick={reset}
      style={{
        padding: '4px 14px',
        borderRadius: 999,
        border: '1px solid var(--color-encore-border)',
        background: 'transparent',
        color: 'var(--color-encore-text-sub)',
        fontFamily: 'var(--font-google-sans), sans-serif',
        fontSize: 12, fontWeight: 700,
        cursor: 'pointer',
      }}
    >
      Reset all
    </button>
  )
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ColorPalette() {
  const [colors, setColors] = useState<PaletteState>(getDefaults)
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const [popoverPos, setPopoverPos] = useState({ x: 0, y: 0 })
  const popoverRef = useRef<HTMLDivElement>(null)

  // Schemes state
  const [schemes, setSchemes] = useState<ColorScheme[]>([])
  const [savingName, setSavingName] = useState('')
  const [showSaveInput, setShowSaveInput] = useState(false)
  const saveInputRef = useRef<HTMLInputElement>(null)

  // Load from localStorage and apply to DOM
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) {
        const saved = JSON.parse(raw) as Record<string, TokenValue>
        const merged: PaletteState = { ...getDefaults(), ...saved }
        setColors(merged)
        PALETTE_DEFS.forEach(def => applyToDom(def, merged[def.key]))
      }
    } catch {}
  }, [])

  // Load schemes from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SCHEMES_LS_KEY)
      if (raw) {
        const saved = JSON.parse(raw) as ColorScheme[]
        setSchemes(saved)
      }
    } catch {}
  }, [])

  // Listen for external palette resets
  useEffect(() => {
    const handler = () => {
      try {
        const raw = localStorage.getItem(LS_KEY)
        if (!raw) {
          setColors(getDefaults())
        }
      } catch {}
    }
    window.addEventListener('encore-palette-update', handler)
    return () => window.removeEventListener('encore-palette-update', handler)
  }, [])

  // Close popover on outside click
  useEffect(() => {
    if (!activeKey) return
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setActiveKey(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [activeKey])

  // Focus save input when shown
  useEffect(() => {
    if (showSaveInput && saveInputRef.current) {
      saveInputRef.current.focus()
    }
  }, [showSaveInput])

  const handleChange = useCallback((key: string, hex: string, alpha: number) => {
    const def = PALETTE_DEFS.find(d => d.key === key)
    if (!def) return
    const val: TokenValue = { hex, alpha }
    setColors(prev => {
      const next = { ...prev, [key]: val }
      try { localStorage.setItem(LS_KEY, JSON.stringify(next)) } catch {}
      return next
    })
    applyToDom(def, val)
    window.dispatchEvent(new Event('encore-palette-update'))
  }, [])

  const openPopover = (key: string, el: HTMLElement) => {
    const rect = el.getBoundingClientRect()
    const pw = 244, ph = 320
    let x = rect.left
    let y = rect.bottom + 10
    if (x + pw > window.innerWidth  - 8) x = window.innerWidth  - pw - 8
    if (y + ph > window.innerHeight - 8) y = rect.top - ph - 10
    setPopoverPos({ x, y })
    setActiveKey(key)
  }

  const resetToken = (key: string) => {
    const def = PALETTE_DEFS.find(d => d.key === key)
    if (!def) return
    handleChange(key, def.defaultHex, def.defaultAlpha)
  }

  const activeDef = activeKey ? PALETTE_DEFS.find(d => d.key === activeKey) : null

  // ── Schemes logic ──────────────────────────────────────────────────────

  const saveSchemes = (next: ColorScheme[]) => {
    setSchemes(next)
    try { localStorage.setItem(SCHEMES_LS_KEY, JSON.stringify(next)) } catch {}
  }

  const saveCurrentScheme = () => {
    const name = savingName.trim() || `Scheme ${schemes.length + 1}`
    const newScheme: ColorScheme = {
      id: `scheme-${Date.now()}`,
      name,
      colors: { ...colors },
    }
    saveSchemes([...schemes, newScheme])
    setSavingName('')
    setShowSaveInput(false)
    // 現在のカラーを確定し、全ページへ反映
    try { localStorage.setItem(LS_KEY, JSON.stringify(colors)) } catch {}
    window.dispatchEvent(new Event('encore-palette-update'))
  }

  const deleteScheme = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    saveSchemes(schemes.filter(s => s.id !== id))
  }

  const loadScheme = (scheme: ColorScheme | 'default') => {
    const next = scheme === 'default' ? getDefaults() : { ...scheme.colors }
    setColors(next)
    PALETTE_DEFS.forEach(def => {
      const val = next[def.key] ?? { hex: def.defaultHex, alpha: def.defaultAlpha }
      applyToDom(def, val)
    })
    try { localStorage.setItem(LS_KEY, JSON.stringify(next)) } catch {}
    window.dispatchEvent(new Event('encore-palette-update'))
  }


  return (
    <>
      {/* ── Swatches grid ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap" style={{ gap: 16 }}>
        {PALETTE_DEFS.map(def => {
          const tv = colors[def.key]
          const isActive  = activeKey === def.key
          const modified  = tv.hex !== def.defaultHex || tv.alpha !== def.defaultAlpha

          return (
            <div key={def.key} className="flex flex-col items-center" style={{ gap: 7, width: 88 }}>
              <div
                role="button"
                tabIndex={0}
                onClick={e => openPopover(def.key, e.currentTarget as HTMLElement)}
                onKeyDown={e => e.key === 'Enter' && openPopover(def.key, e.currentTarget as HTMLElement)}
                style={{
                  width: 88, height: 60,
                  borderRadius: 8,
                  background: getSwatchBg(def, tv),
                  boxShadow: isActive
                    ? 'inset 0 0 0 2.5px var(--color-encore-green)'
                    : def.outlined
                    ? 'inset 0 0 0 1px var(--color-encore-border)'
                    : 'inset 0 0 0 1px rgba(0,0,0,0.08)',
                  cursor: 'pointer',
                  transform: isActive ? 'scale(0.94)' : 'scale(1)',
                  transition: 'transform 0.12s ease, box-shadow 0.12s ease',
                  outline: 'none',
                  position: 'relative',
                }}
              >
                {modified && (
                  <div style={{
                    position: 'absolute', top: 6, right: 6,
                    width: 7, height: 7,
                    borderRadius: 999,
                    background: 'var(--color-encore-amber)',
                    boxShadow: '0 0 0 1.5px var(--color-encore-bg)',
                  }} />
                )}
              </div>

              <div style={{
                fontFamily: 'var(--font-google-sans), sans-serif',
                fontSize: 10, fontWeight: 700,
                color: 'var(--color-encore-text-sub)',
                textAlign: 'center', lineHeight: 1.3,
              }}>
                {def.name}
              </div>

              <div style={{
                fontFamily: 'monospace', fontSize: 10,
                color: 'var(--color-encore-text-muted)',
                textAlign: 'center',
              }}>
                {getDisplayCode(def, tv)}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Color Schemes ─────────────────────────────────────────────── */}
      <div style={{ marginTop: 28 }}>
        {/* Header row */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 10,
        }}>
          <div style={{
            fontFamily: 'var(--font-google-sans), sans-serif',
            fontSize: 12, fontWeight: 700,
            color: 'var(--color-encore-text-sub)',
          }}>
            Schemes
          </div>

          {showSaveInput ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                ref={saveInputRef}
                type="text"
                value={savingName}
                onChange={e => setSavingName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') saveCurrentScheme()
                  if (e.key === 'Escape') { setShowSaveInput(false); setSavingName('') }
                }}
                placeholder={`Scheme ${schemes.length + 1}`}
                style={{
                  padding: '4px 8px',
                  borderRadius: 6,
                  border: '1px solid var(--color-encore-border)',
                  background: 'transparent',
                  color: 'var(--color-encore-green)',
                  fontFamily: 'var(--font-google-sans), sans-serif',
                  fontSize: 12,
                  outline: 'none',
                  width: 120,
                }}
              />
              <button
                onClick={saveCurrentScheme}
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  border: 'none',
                  background: 'var(--color-encore-green)',
                  color: '#fff',
                  fontFamily: 'var(--font-google-sans), sans-serif',
                  fontSize: 12, fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Save
              </button>
              <button
                onClick={() => { setShowSaveInput(false); setSavingName('') }}
                style={{
                  padding: '4px 8px',
                  borderRadius: 6,
                  border: '1px solid var(--color-encore-border)',
                  background: 'transparent',
                  color: 'var(--color-encore-text-sub)',
                  fontFamily: 'var(--font-google-sans), sans-serif',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowSaveInput(true)}
              style={{
                padding: '4px 12px',
                borderRadius: 999,
                border: '1px solid var(--color-encore-border)',
                background: 'transparent',
                color: 'var(--color-encore-text-sub)',
                fontFamily: 'var(--font-google-sans), sans-serif',
                fontSize: 12, fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              + Save
            </button>
          )}
        </div>

        {/* Scheme pills row (horizontally scrollable) */}
        <div style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          paddingBottom: 4,
        }}>
          {/* Preset scheme pills (built-in, no delete) */}
          {PRESET_SCHEMES.map(scheme => {
            const loaded = colorsMatch(colors, scheme.colors)
            const { bg, greenColor, amberColor } = getSchemeDisplayColors(scheme)
            return (
              <div
                key={scheme.id}
                onClick={() => loadScheme(scheme)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 10px',
                  borderRadius: 999,
                  border: '1px solid var(--color-encore-border)',
                  background: loaded ? 'var(--color-encore-green)' : 'var(--color-encore-bg-section)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {[bg, greenColor, amberColor].map((c, i) => (
                  <div key={i} style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: c,
                    border: loaded ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(0,0,0,0.1)',
                    flexShrink: 0,
                  }} />
                ))}
                <span style={{
                  fontFamily: 'var(--font-google-sans), sans-serif',
                  fontSize: 12, fontWeight: 700,
                  color: loaded ? '#fff' : 'var(--color-encore-text-sub)',
                }}>
                  {scheme.name}
                </span>
              </div>
            )
          })}

          {/* User-saved scheme pills */}
          {schemes.map(scheme => {
            const loaded = colorsMatch(colors, scheme.colors)
            const { bg, greenColor, amberColor } = getSchemeDisplayColors(scheme)
            return (
              <div
                key={scheme.id}
                onClick={() => loadScheme(scheme)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 10px',
                  borderRadius: 999,
                  border: '1px solid var(--color-encore-border)',
                  background: loaded ? 'var(--color-encore-green)' : 'var(--color-encore-bg-section)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {[bg, greenColor, amberColor].map((c, i) => (
                  <div key={i} style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: c,
                    border: loaded ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(0,0,0,0.1)',
                    flexShrink: 0,
                  }} />
                ))}
                <span style={{
                  fontFamily: 'var(--font-google-sans), sans-serif',
                  fontSize: 12, fontWeight: 700,
                  color: loaded ? '#fff' : 'var(--color-encore-text-sub)',
                }}>
                  {scheme.name}
                </span>
                <button
                  onClick={e => deleteScheme(scheme.id, e)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '0 0 0 2px',
                    cursor: 'pointer',
                    color: loaded ? 'rgba(255,255,255,0.6)' : 'var(--color-encore-text-muted)',
                    fontSize: 13,
                    lineHeight: 1,
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  ×
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Color picker popover (dark) ────────────────────────────────── */}
      {activeKey && activeDef && (
        <div
          ref={popoverRef}
          style={{
            position: 'fixed',
            left: popoverPos.x,
            top:  popoverPos.y,
            zIndex: 9999,
            width: 244,
            background: '#2C2C2C',
            borderRadius: 8,
            boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 12px 0',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              {/* Preview dot */}
              <div style={{
                width: 16, height: 16,
                borderRadius: 999,
                background: getSwatchBg(activeDef, colors[activeKey]),
                boxShadow: '0 0 0 1px rgba(255,255,255,0.15)',
                flexShrink: 0,
              }} />
              <span style={{
                fontFamily: 'var(--font-google-sans), sans-serif',
                fontSize: 12, fontWeight: 700,
                color: 'rgba(255,255,255,0.85)',
              }}>
                {activeDef.name}
              </span>
            </div>

            <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
              {(colors[activeKey].hex !== activeDef.defaultHex || colors[activeKey].alpha !== activeDef.defaultAlpha) && (
                <button
                  onClick={() => resetToken(activeKey)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: 5,
                    border: '1px solid rgba(255,255,255,0.12)',
                    background: 'transparent',
                    color: 'rgba(255,255,255,0.5)',
                    fontFamily: 'var(--font-google-sans), sans-serif',
                    fontSize: 11, fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Reset
                </button>
              )}
              <button
                onClick={() => setActiveKey(null)}
                style={{
                  width: 22, height: 22,
                  borderRadius: 999,
                  border: 'none',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: 14, lineHeight: 1,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: 0,
                }}
              >
                ×
              </button>
            </div>
          </div>

          <div style={{ height: 8 }} />

          {/* FigmaColorPicker */}
          <FigmaColorPicker
            value={colors[activeKey].hex}
            alpha={colors[activeKey].alpha}
            onChange={(hex, alpha) => handleChange(activeKey, hex, alpha)}
          />
        </div>
      )}
    </>
  )
}
