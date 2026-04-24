import type React from 'react'

const EN = 'var(--font-google-sans), sans-serif'
const JA = 'var(--font-google-sans), var(--font-noto-jp), sans-serif'

export const display: React.CSSProperties = {
  fontFamily: EN,
  fontSize: 32,
  fontWeight: 700,
  color: 'var(--color-encore-green)',
  letterSpacing: '-0.01em',
}

export const title: React.CSSProperties = {
  fontFamily: EN,
  fontSize: 24,
  fontWeight: 700,
  color: 'var(--color-encore-green)',
}

export const heading: React.CSSProperties = {
  fontFamily: JA,
  fontSize: 18,
  fontWeight: 700,
  color: 'var(--color-encore-green)',
}

export const section: React.CSSProperties = {
  fontFamily: JA,
  fontSize: 16,
  fontWeight: 700,
  color: 'var(--color-encore-green)',
}

export const sectionSM: React.CSSProperties = {
  fontFamily: JA,
  fontSize: 14,
  fontWeight: 700,
  color: 'var(--color-encore-green)',
}

export const body: React.CSSProperties = {
  fontFamily: JA,
  fontSize: 14,
  fontWeight: 400,
  color: 'var(--color-encore-green)',
}

export const bodySM: React.CSSProperties = {
  fontFamily: JA,
  fontSize: 12,
  fontWeight: 400,
  color: 'var(--color-encore-green)',
}

export const caption: React.CSSProperties = {
  fontFamily: 'var(--font-google-sans), sans-serif',
  fontSize: 12,
  fontWeight: 400,
  color: 'var(--color-encore-green)',
}

export const captionMuted: React.CSSProperties = {
  fontFamily: EN,
  fontSize: 12,
  fontWeight: 400,
  color: 'var(--color-encore-text-muted)',
}

export const price: React.CSSProperties = {
  fontFamily: EN,
  fontSize: 16,
  fontWeight: 700,
  color: 'var(--color-encore-green)',
}

export const link: React.CSSProperties = {
  fontFamily: JA,
  fontSize: 14,
  fontWeight: 400,
  color: 'var(--color-encore-amber)',
}

export const sub: React.CSSProperties = {
  fontFamily: JA,
  fontSize: 12,
  fontWeight: 400,
  color: 'var(--color-encore-text-sub)',
}
