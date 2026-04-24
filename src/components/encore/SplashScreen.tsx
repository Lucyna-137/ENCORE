import React from 'react'

export default function SplashScreen() {
  return (
    <div
      className="flex flex-col items-center justify-center"
      style={{
        background: 'var(--color-encore-green)',
        gap: 18,
        padding: '60px 20px 80px',
      }}
    >
      <div
        className="flex items-center justify-center"
        style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          border: '2px solid rgba(255,255,255,0.75)',
        }}
      >
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <path d="M20 8 C20 8 13 13 13 20.5 C13 25 15.5 28.5 18 30" stroke="rgba(255,255,255,0.85)" strokeWidth="2" strokeLinecap="round"/>
          <path d="M20 8 C20 8 27 13 27 20.5 C27 25 24.5 28.5 22 30" stroke="rgba(255,255,255,0.85)" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="20" cy="31" r="2.5" fill="rgba(255,255,255,0.85)"/>
        </svg>
      </div>
      <div
        style={{
          fontFamily: 'var(--font-google-sans), sans-serif',
          fontSize: 16,
          fontWeight: 700,
          letterSpacing: '0.18em',
          textTransform: 'uppercase' as const,
          color: 'rgba(255,255,255,0.9)',
        }}
      >
        ENCORE
      </div>
    </div>
  )
}
