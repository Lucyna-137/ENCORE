import React from 'react'

interface CreditCardProps {
  cardNumber?: string
  expDisplay?: string
}

export default function CreditCard({ cardNumber = '', expDisplay = '月/年' }: CreditCardProps) {
  const digits = cardNumber.replace(/\D/g, '').padEnd(16, '·')
  const formatted = `${digits.slice(0, 4)} ${digits.slice(4, 8)} ${digits.slice(8, 12)} ${digits.slice(12, 16)}`

  return (
    <div
      className="relative overflow-hidden flex flex-col justify-between"
      style={{
        background: 'var(--color-encore-green)',
        borderRadius: 18,
        padding: '24px 24px 22px',
        color: 'var(--color-encore-white)',
        minHeight: 200,
        boxShadow: '0 8px 32px rgba(27,60,45,0.35)',
      }}
    >
      <div className="absolute" style={{ top: -70, right: -70, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
      <div className="absolute" style={{ bottom: -80, left: -50, width: 260, height: 260, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
      {/* Top row */}
      <div className="relative flex justify-between items-start">
        <div>
          <div style={{ fontFamily: 'var(--font-google-sans), sans-serif', fontSize: 11, opacity: 0.6, marginBottom: 5 }}>Card Number</div>
          <div style={{ fontFamily: 'var(--font-google-sans), sans-serif', fontSize: 20, fontWeight: 700, letterSpacing: '0.08em' }}>{formatted}</div>
        </div>
        <div className="flex">
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#EB001B', opacity: 0.92 }} />
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#F79E1B', opacity: 0.92, marginLeft: -12 }} />
        </div>
      </div>
      {/* Bottom */}
      <div className="relative flex justify-end items-end">
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-google-sans), sans-serif', fontSize: 11, opacity: 0.6, marginBottom: 2 }}>EXP Date</div>
          <div style={{ fontFamily: 'var(--font-google-sans), sans-serif', fontSize: 15, fontWeight: 700 }}>{expDisplay}</div>
        </div>
      </div>
    </div>
  )
}
