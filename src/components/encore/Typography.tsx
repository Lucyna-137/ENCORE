'use client'

import React, { useState } from 'react'

const EN = 'var(--font-google-sans), sans-serif'
const JA = 'var(--font-google-sans), var(--font-noto-jp), sans-serif'
const labelStyle = { fontFamily: 'monospace', fontSize: 12, color: 'var(--color-encore-text-muted)', flexShrink: 0, lineHeight: 1.5 } as const

function CopyLabel({ text, cls }: { text: string; cls: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(cls)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <div style={{ width: 170, flexShrink: 0 }}>
      <div style={labelStyle}>{text}</div>
      <button
        onClick={handleCopy}
        style={{
          fontFamily: 'monospace',
          fontSize: 11,
          color: copied ? 'var(--color-encore-amber)' : 'var(--color-encore-green)',
          opacity: copied ? 1 : 0.45,
          marginTop: 2,
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          transition: 'color 0.15s, opacity 0.15s',
        }}
      >
        {copied ? 'copied!' : cls}
      </button>
    </div>
  )
}

export default function Typography() {
  return (
    <div style={{ background: 'var(--color-encore-bg)', borderRadius: 8, padding: 28 }}>
      <div className="flex flex-col" style={{ gap: 20 }}>
        <div className="flex items-center" style={{ gap: 20 }}>
          <CopyLabel text="Display —32px 900" cls="ty.display" />
          <div style={{ fontFamily: EN, fontSize: 32, fontWeight: 700, color: 'var(--color-encore-green)', letterSpacing: '-0.01em' }}>HELLO!</div>
        </div>
        <div className="flex items-center" style={{ gap: 20 }}>
          <CopyLabel text="Title —24px 800" cls="ty.title" />
          <div style={{ fontFamily: EN, fontSize: 24, fontWeight: 700, color: 'var(--color-encore-green)' }}>REWARDS</div>
        </div>
        <div className="flex items-center" style={{ gap: 20 }}>
          <CopyLabel text="Heading —18px 700" cls="ty.heading" />
          <div style={{ fontFamily: JA, fontSize: 18, fontWeight: 700, color: 'var(--color-encore-green)' }}>こんにちは、ユーザーさん！</div>
        </div>
        <div className="flex items-center" style={{ gap: 20 }}>
          <CopyLabel text="Section —15px 700" cls="ty.section" />
          <div style={{ fontFamily: JA, fontSize: 15, fontWeight: 700, color: 'var(--color-encore-green)' }}>ライブ履歴</div>
        </div>
        <div className="flex items-center" style={{ gap: 20 }}>
          <CopyLabel text="Section SM —14px 700" cls="ty.sectionSM" />
          <div style={{ fontFamily: JA, fontSize: 14, fontWeight: 700, color: 'var(--color-encore-green)' }}>ライブ履歴</div>
        </div>
        <div className="flex items-center" style={{ gap: 20 }}>
          <CopyLabel text="Body —13px 400" cls="ty.body" />
          <div style={{ fontFamily: JA, fontSize: 13, color: 'var(--color-encore-green)', lineHeight: 1.6 }}>AOI ONE MAN LIVE 2026</div>
        </div>
        <div className="flex items-center" style={{ gap: 20 }}>
          <CopyLabel text="Body SM —12px 400" cls="ty.bodySM" />
          <div style={{ fontFamily: JA, fontSize: 12, color: 'var(--color-encore-green)', lineHeight: 1.6 }}>AOI ONE MAN LIVE 2026</div>
        </div>
        <div className="flex items-center" style={{ gap: 20 }}>
          <CopyLabel text="Sub —12px 400" cls="ty.sub" />
          <div style={{ fontFamily: JA, fontSize: 12, color: 'rgba(27,60,45,0.55)', lineHeight: 1.55 }}>Zepp Haneda・2026年4月12日(土)</div>
        </div>
        <div className="flex items-center" style={{ gap: 20 }}>
          <CopyLabel text="Price —15px 700" cls="ty.price" />
          <div style={{ fontFamily: EN, fontSize: 15, fontWeight: 700, color: 'var(--color-encore-green)' }}>¥1,295</div>
        </div>
        <div className="flex items-center" style={{ gap: 20 }}>
          <CopyLabel text="Link —13px 400 Amber" cls="ty.link" />
          <button style={{ color: 'var(--color-encore-amber)', fontSize: 13, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 2, background: 'none', border: 'none', fontFamily: JA, padding: 0 }}>
            これスキ！
          </button>
        </div>
        <div className="flex items-center" style={{ gap: 20 }}>
          <CopyLabel text="Caption —11px 400" cls="ty.caption" />
          <div style={{ fontFamily: EN, fontSize: 11, color: 'var(--color-encore-green)' }}>Zepp Haneda・Open 18:00</div>
        </div>
        <div className="flex items-center" style={{ gap: 20 }}>
          <CopyLabel text="Caption Muted — 11px 400" cls="ty.captionMuted" />
          <div style={{ fontFamily: EN, fontSize: 11, color: 'rgba(27,60,45,0.35)' }}>powered by ENCORE PLATFORM</div>
        </div>
      </div>
    </div>
  )
}
