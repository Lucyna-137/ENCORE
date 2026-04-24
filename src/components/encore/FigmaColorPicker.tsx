'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'

// ─── Color math ────────────────────────────────────────────────────────────

function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const i = Math.floor(h / 60) % 6
  const f = h / 60 - Math.floor(h / 60)
  const p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s)
  const m: [number, number, number][] = [
    [v,t,p],[q,v,p],[p,v,t],[p,q,v],[t,p,v],[v,p,q],
  ]
  return m[i].map(x => Math.round(x * 255)) as [number, number, number]
}

function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r,g,b), min = Math.min(r,g,b)
  const v = max, s = max === 0 ? 0 : (max - min) / max
  let h = 0
  if (max !== min) {
    const d = max - min
    switch (max) {
      case r: h = ((g - b) / d % 6) * 60; break
      case g: h = ((b - r) / d + 2) * 60; break
      case b: h = ((r - g) / d + 4) * 60; break
    }
    if (h < 0) h += 360
  }
  return [h, s, v]
}

export function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.replace('#','').match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i)
  if (!m) return null
  return [parseInt(m[1],16), parseInt(m[2],16), parseInt(m[3],16)]
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r,g,b].map(x => Math.max(0,Math.min(255,Math.round(x))).toString(16).padStart(2,'0')).join('')
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r,g,b), min = Math.min(r,g,b)
  const l = (max + min) / 2
  if (max === min) return [0, 0, Math.round(l * 100)]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  switch (max) {
    case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
    case g: h = ((b - r) / d + 2) / 6; break
    case b: h = ((r - g) / d + 4) / 6; break
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100; l /= 100
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
  }
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)]
}

// ─── Dark theme ─────────────────────────────────────────────────────────────

const T = {
  bg:       '#2C2C2C',
  inputBg:  '#3A3A3A',
  border:   'rgba(255,255,255,0.1)',
  text:     'rgba(255,255,255,0.85)',
  textDim:  'rgba(255,255,255,0.4)',
  hover:    'rgba(255,255,255,0.07)',
}

// ─── Types ───────────────────────────────────────────────────────────────────

type Format = 'hex' | 'rgb' | 'hsl'

interface FormatInputs {
  hex: string
  r: string
  g: string
  b: string
  hh: string
  hs: string
  hl: string
}

// ─── Component ──────────────────────────────────────────────────────────────

interface Props {
  value: string   // hex e.g. "#1B3C2D"
  alpha: number   // 0–1
  onChange: (hex: string, alpha: number) => void
}

export default function FigmaColorPicker({ value, alpha, onChange }: Props) {
  const [hue, setHue] = useState(0)
  const [sat, setSat] = useState(0)
  const [val, setVal] = useState(1)
  const [a, setA]     = useState(alpha)
  const [alphaInput, setAlphaInput] = useState('')
  const [format, setFormat] = useState<Format>('hex')
  const [fi, setFi] = useState<FormatInputs>({ hex: '', r: '', g: '', b: '', hh: '', hs: '', hl: '' })

  const gradRef  = useRef<HTMLDivElement>(null)
  const hueRef   = useRef<HTMLDivElement>(null)
  const alphaRef = useRef<HTMLDivElement>(null)
  const dragging = useRef<'grad'|'hue'|'alpha'|null>(null)

  // Sync all format inputs from current rgb values
  const syncFormatInputs = useCallback((r: number, g: number, b: number) => {
    const hex = rgbToHex(r, g, b).replace('#', '').toUpperCase()
    const [hh, hs, hl] = rgbToHsl(r, g, b)
    setFi({
      hex,
      r: String(r),
      g: String(g),
      b: String(b),
      hh: String(hh),
      hs: String(hs),
      hl: String(hl),
    })
  }, [])

  // Init / sync from props
  useEffect(() => {
    const rgb = hexToRgb(value) ?? [27,60,45]
    const [h,s,v] = rgbToHsv(...rgb)
    setHue(h); setSat(s); setVal(v)
    syncFormatInputs(rgb[0], rgb[1], rgb[2])
  }, [value, syncFormatInputs])

  useEffect(() => {
    setA(alpha)
    setAlphaInput(String(Math.round(alpha * 100)))
  }, [alpha])

  const emit = useCallback((h: number, s: number, v: number, a: number) => {
    const [r,g,b] = hsvToRgb(h,s,v)
    const hex = rgbToHex(r,g,b)
    syncFormatInputs(r, g, b)
    onChange(hex, a)
  }, [onChange, syncFormatInputs])

  // ── Drag handlers ────────────────────────────────────────────────────────

  const handleGrad = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (!gradRef.current) return
    const rect = gradRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top)  / rect.height))
    setSat(x); setVal(1-y)
    emit(hue, x, 1-y, a)
  }, [hue, a, emit])

  const handleHue = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (!hueRef.current) return
    const rect = hueRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    setHue(x * 360)
    emit(x * 360, sat, val, a)
  }, [sat, val, a, emit])

  const handleAlpha = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (!alphaRef.current) return
    const rect = alphaRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    setA(x)
    setAlphaInput(String(Math.round(x * 100)))
    const [r,g,b] = hsvToRgb(hue, sat, val)
    onChange(rgbToHex(r,g,b), x)
  }, [hue, sat, val, onChange])

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (dragging.current === 'grad')  handleGrad(e)
      if (dragging.current === 'hue')   handleHue(e)
      if (dragging.current === 'alpha') handleAlpha(e)
    }
    const up = () => { dragging.current = null }
    document.addEventListener('mousemove', move)
    document.addEventListener('mouseup',   up)
    return () => {
      document.removeEventListener('mousemove', move)
      document.removeEventListener('mouseup',   up)
    }
  }, [handleGrad, handleHue, handleAlpha])

  // ── EyeDropper ──────────────────────────────────────────────────────────

  const pickEyedrop = async () => {
    if (!('EyeDropper' in window)) return
    try {
      const ed = new (window as any).EyeDropper()
      const { sRGBHex } = await ed.open()
      const rgb = hexToRgb(sRGBHex)
      if (!rgb) return
      const [h,s,v] = rgbToHsv(...rgb)
      setHue(h); setSat(s); setVal(v)
      syncFormatInputs(rgb[0], rgb[1], rgb[2])
      onChange(sRGBHex, a)
    } catch {}
  }

  // ── Derived ─────────────────────────────────────────────────────────────

  const hueColor = `hsl(${hue},100%,50%)`
  const [r,g,b]  = hsvToRgb(hue, sat, val)
  const curHex   = rgbToHex(r,g,b)

  // ── Input shared style ──────────────────────────────────────────────────

  const inputStyle: React.CSSProperties = {
    padding: '4px 4px',
    borderRadius: 5,
    border: `1px solid ${T.border}`,
    background: T.inputBg,
    color: T.text,
    fontFamily: 'monospace',
    fontSize: 12,
    outline: 'none',
    textAlign: 'center',
    width: 36,
    flexShrink: 0,
  }

  // ── Format pill ─────────────────────────────────────────────────────────

  const cycleFormat = () => setFormat(f => f === 'hex' ? 'rgb' : f === 'rgb' ? 'hsl' : 'hex')

  const formatLabel = format === 'hex' ? 'Hex' : format === 'rgb' ? 'RGB' : 'HSL'

  // ── RGB input handlers ──────────────────────────────────────────────────

  const handleRgbChannel = (channel: 'r' | 'g' | 'b', raw: string) => {
    const digits = raw.replace(/[^0-9]/g, '').slice(0, 3)
    setFi(prev => ({ ...prev, [channel]: digits }))
    const n = parseInt(digits || '0', 10)
    if (digits === '' || n < 0 || n > 255) return
    const nr = channel === 'r' ? n : parseInt(fi.r || '0', 10)
    const ng = channel === 'g' ? n : parseInt(fi.g || '0', 10)
    const nb = channel === 'b' ? n : parseInt(fi.b || '0', 10)
    const cr = Math.max(0, Math.min(255, nr))
    const cg = Math.max(0, Math.min(255, ng))
    const cb = Math.max(0, Math.min(255, nb))
    const [h,s,v] = rgbToHsv(cr, cg, cb)
    setHue(h); setSat(s); setVal(v)
    const hex = rgbToHex(cr, cg, cb)
    const [hh, hs, hl] = rgbToHsl(cr, cg, cb)
    setFi(prev => ({
      ...prev,
      [channel]: digits,
      hex: hex.replace('#', '').toUpperCase(),
      hh: String(hh), hs: String(hs), hl: String(hl),
    }))
    onChange(hex, a)
  }

  // ── HSL input handlers ──────────────────────────────────────────────────

  const handleHslChannel = (channel: 'hh' | 'hs' | 'hl', raw: string) => {
    const digits = raw.replace(/[^0-9]/g, '').slice(0, 3)
    setFi(prev => ({ ...prev, [channel]: digits }))
    const n = parseInt(digits || '0', 10)
    const maxVal = channel === 'hh' ? 360 : 100
    if (digits === '' || n < 0 || n > maxVal) return
    const nh = channel === 'hh' ? n : parseInt(fi.hh || '0', 10)
    const ns = channel === 'hs' ? n : parseInt(fi.hs || '0', 10)
    const nl = channel === 'hl' ? n : parseInt(fi.hl || '0', 10)
    const [cr, cg, cb] = hslToRgb(nh, ns, nl)
    const [h,s,v] = rgbToHsv(cr, cg, cb)
    setHue(h); setSat(s); setVal(v)
    const hex = rgbToHex(cr, cg, cb)
    setFi(prev => ({
      ...prev,
      [channel]: digits,
      hex: hex.replace('#', '').toUpperCase(),
      r: String(cr), g: String(cg), b: String(cb),
    }))
    onChange(hex, a)
  }

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div style={{ background: T.bg, userSelect: 'none' }}>

      {/* ── Gradient square ─────────────────────────────────────────── */}
      <div style={{ position: 'relative', height: 168, flexShrink: 0 }}>
        {/* gradient layers */}
        <div
          ref={gradRef}
          onMouseDown={e => { dragging.current = 'grad'; handleGrad(e) }}
          style={{ position: 'absolute', inset: 0, background: hueColor, cursor: 'crosshair' }}
        >
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #fff, transparent)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, #000)' }} />
        </div>

        {/* cursor — outside clip so it never gets cut */}
        <div style={{
          position: 'absolute',
          left:  `${sat * 100}%`,
          top:   `${(1 - val) * 100}%`,
          transform: 'translate(-50%,-50%)',
          width: 12, height: 12,
          borderRadius: '50%',
          border: '2px solid #fff',
          boxShadow: '0 0 0 1px rgba(0,0,0,0.5)',
          pointerEvents: 'none',
          zIndex: 1,
        }} />
      </div>

      {/* ── Controls ────────────────────────────────────────────────── */}
      <div style={{ padding: '10px 12px 13px', display: 'flex', flexDirection: 'column', gap: 9 }}>

        {/* Eyedropper + sliders row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>

          {/* Eyedropper button */}
          <button
            onClick={pickEyedrop}
            title="スポイト"
            style={{
              width: 26, height: 26,
              borderRadius: 6,
              border: `1px solid ${T.border}`,
              background: T.inputBg,
              color: T.textDim,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, padding: 0,
              transition: 'background 0.1s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = T.hover)}
            onMouseLeave={e => (e.currentTarget.style.background = T.inputBg)}
          >
            {/* Eyedropper icon */}
            <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
              <path d="M13.36 1.34a2.5 2.5 0 0 0-3.54 0L8.56 2.6l-.7-.7a1 1 0 0 0-1.42 1.41l.7.71L2.5 9.16a1 1 0 0 0-.29.7V12.5a1 1 0 0 0 1 1H5.6a1 1 0 0 0 .7-.29l4.64-4.64.7.7a1 1 0 1 0 1.42-1.41l-.7-.7 1.24-1.24a2.5 2.5 0 0 0 0-3.54zM5.18 12.5H3.21v-1.97l4.35-4.35 1.97 1.97-4.35 4.35z"/>
            </svg>
          </button>

          {/* Hue + Alpha stacked */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>

            {/* Hue slider */}
            <div style={{ position: 'relative', height: 10 }}>
              <div
                ref={hueRef}
                onMouseDown={e => { dragging.current = 'hue'; handleHue(e) }}
                style={{
                  position: 'absolute', inset: 0,
                  borderRadius: 999,
                  background: 'linear-gradient(to right,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)',
                  cursor: 'pointer',
                }}
              />
              {/* handle */}
              <div style={{
                position: 'absolute',
                left: `${(hue / 360) * 100}%`,
                top: '50%',
                transform: 'translate(-50%,-50%)',
                width: 14, height: 14,
                borderRadius: '50%',
                background: hueColor,
                border: '2px solid #fff',
                boxShadow: '0 1px 4px rgba(0,0,0,0.6)',
                pointerEvents: 'none',
              }} />
            </div>

            {/* Alpha slider */}
            <div style={{ position: 'relative', height: 10 }}>
              {/* checkerboard */}
              <div style={{
                position: 'absolute', inset: 0,
                borderRadius: 999,
                backgroundImage: 'repeating-conic-gradient(#555 0% 25%, #333 0% 50%)',
                backgroundSize: '8px 8px',
              }} />
              {/* color gradient */}
              <div
                ref={alphaRef}
                onMouseDown={e => { dragging.current = 'alpha'; handleAlpha(e) }}
                style={{
                  position: 'absolute', inset: 0,
                  borderRadius: 999,
                  background: `linear-gradient(to right, transparent, ${curHex})`,
                  cursor: 'pointer',
                }}
              />
              {/* handle */}
              <div style={{
                position: 'absolute',
                left: `${a * 100}%`,
                top: '50%',
                transform: 'translate(-50%,-50%)',
                width: 14, height: 14,
                borderRadius: '50%',
                background: `rgba(${r},${g},${b},${a})`,
                border: '2px solid #fff',
                boxShadow: '0 1px 4px rgba(0,0,0,0.6)',
                pointerEvents: 'none',
              }} />
            </div>
          </div>
        </div>

        {/* ── Inputs row ────────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 5, alignItems: 'flex-start' }}>

          {/* Format pill (clickable) */}
          <div
            onClick={cycleFormat}
            style={{
              display: 'flex', alignItems: 'center', gap: 3,
              padding: '4px 6px',
              borderRadius: 5,
              background: T.inputBg,
              border: `1px solid ${T.border}`,
              color: T.textDim,
              fontFamily: 'var(--font-google-sans), sans-serif',
              fontSize: 10, fontWeight: 700,
              flexShrink: 0,
              cursor: 'pointer',
              userSelect: 'none',
              marginTop: 1,
            }}
          >
            {formatLabel}
            <svg width="6" height="4" viewBox="0 0 6 4" fill="none">
              <path d="M0.5 0.5L3 3L5.5 0.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {/* Format-specific inputs */}
          {format === 'hex' && (
            <input
              type="text"
              value={fi.hex}
              onChange={e => {
                const v = e.target.value.toUpperCase().replace(/[^0-9A-F]/g,'').slice(0,6)
                setFi(prev => ({ ...prev, hex: v }))
                if (v.length === 6) {
                  const hex = '#' + v
                  const rgb = hexToRgb(hex)
                  if (rgb) {
                    const [h,s,vv] = rgbToHsv(...rgb)
                    setHue(h); setSat(s); setVal(vv)
                    const [hh, hs, hl] = rgbToHsl(rgb[0], rgb[1], rgb[2])
                    setFi(prev => ({
                      ...prev,
                      hex: v,
                      r: String(rgb[0]), g: String(rgb[1]), b: String(rgb[2]),
                      hh: String(hh), hs: String(hs), hl: String(hl),
                    }))
                    onChange(hex, a)
                  }
                }
              }}
              spellCheck={false}
              style={{
                flex: 1, minWidth: 0,
                padding: '4px 6px',
                borderRadius: 5,
                border: `1px solid ${T.border}`,
                background: T.inputBg,
                color: T.text,
                fontFamily: 'monospace',
                fontSize: 12,
                outline: 'none',
              }}
            />
          )}

          {format === 'rgb' && (
            <div style={{ flex: 1, display: 'flex', gap: 3 }}>
              {(['r','g','b'] as const).map(ch => (
                <div key={ch} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <input
                    type="text"
                    value={fi[ch]}
                    onChange={e => handleRgbChannel(ch, e.target.value)}
                    style={inputStyle}
                  />
                  <span style={{ color: T.textDim, fontFamily: 'var(--font-google-sans), sans-serif', fontSize: 10, fontWeight: 700 }}>
                    {ch.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}

          {format === 'hsl' && (
            <div style={{ flex: 1, display: 'flex', gap: 3 }}>
              {(['hh','hs','hl'] as const).map(ch => (
                <div key={ch} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <input
                    type="text"
                    value={fi[ch]}
                    onChange={e => handleHslChannel(ch, e.target.value)}
                    style={inputStyle}
                  />
                  <span style={{ color: T.textDim, fontFamily: 'var(--font-google-sans), sans-serif', fontSize: 10, fontWeight: 700 }}>
                    {ch === 'hh' ? 'H' : ch === 'hs' ? 'S' : 'L'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Alpha % input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
            <input
              type="text"
              value={alphaInput}
              onChange={e => {
                const v = e.target.value.replace(/[^0-9]/g,'').slice(0,3)
                setAlphaInput(v)
                const n = Math.max(0, Math.min(100, parseInt(v||'0', 10)))
                const newA = n / 100
                setA(newA)
                const [r,g,b] = hsvToRgb(hue, sat, val)
                onChange(rgbToHex(r,g,b), newA)
              }}
              style={{
                width: 30,
                padding: '4px 4px',
                borderRadius: 5,
                border: `1px solid ${T.border}`,
                background: T.inputBg,
                color: T.text,
                fontFamily: 'monospace',
                fontSize: 12,
                outline: 'none',
                textAlign: 'right',
              }}
            />
            <span style={{
              color: T.textDim,
              fontFamily: 'var(--font-google-sans), sans-serif',
              fontSize: 10, fontWeight: 700,
            }}>%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
