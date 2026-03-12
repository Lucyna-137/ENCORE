import React from 'react'
import Button from './Button'
import { CaretRight } from '@phosphor-icons/react'

interface OrderItem {
  emoji: string
  name: string
  detail: string
  qty: number
  price: string
  bgColor?: string
}

interface OrderSummaryProps {
  items?: OrderItem[]
  total?: string
}

const ChevronRight = () => (
  <CaretRight size={14} weight="light" color="var(--color-encore-text-muted)" />
)

const defaultItems: OrderItem[] = [
  {
    emoji: '🎸',
    name: 'RADWIMPS LIVE 2026 東京',
    detail: 'S席・1枚 | Zepp Tokyo・3月20日(金)',
    qty: 1,
    price: '¥8,800',
    bgColor: 'linear-gradient(135deg,#C8D4C0,#A8BC9C)',
  },
]

export default function OrderSummary({ items = defaultItems, total = '¥8,800' }: OrderSummaryProps) {
  return (
    <div style={{ background: 'var(--color-encore-bg)' }}>
      {items.map((item, i) => (
        <div key={i}>
          <div
            className="flex items-start gap-3.5"
            style={{
              padding: '16px 20px',
              background: 'var(--color-encore-bg)',
              borderTop: i > 0 ? '1px solid var(--color-encore-border-light)' : undefined,
            }}
          >
            <div
              className="flex-shrink-0 flex items-center justify-center overflow-hidden"
              style={{
                width: 56,
                height: 56,
                borderRadius: 12,
                background: item.bgColor ?? 'var(--color-encore-bg-section)',
                fontSize: 26,
              }}
            >
              {item.emoji}
            </div>
            <div className="flex-1">
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, color: 'var(--color-encore-green)' }}>{item.name}</div>
              <div style={{ fontSize: 12, color: 'var(--color-encore-text-sub)', lineHeight: 1.5 }}>{item.detail}</div>
              <div className="flex gap-3 mt-1.5">
                <button style={{ fontSize: 12, color: 'var(--color-encore-amber)', cursor: 'pointer', background: 'none', border: 'none', padding: 0, fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif' }}>
                  座席を変更する
                </button>
                <button style={{ fontSize: 12, color: 'var(--color-encore-amber)', cursor: 'pointer', background: 'none', border: 'none', padding: 0, fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif' }}>
                  削除
                </button>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div style={{ fontSize: 13, color: 'var(--color-encore-text-sub)', marginBottom: 2 }}>x{item.qty}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-encore-green)' }}>{item.price}</div>
            </div>
          </div>
          <div
            style={{
              background: 'var(--color-encore-bg-section)',
              padding: '14px 20px',
              borderTop: '1px solid var(--color-encore-border-light)',
              fontSize: 13,
              lineHeight: 1.75,
              color: 'var(--color-encore-text-sub)',
            }}
          >
            座席: S席・3列14番<br/>
            入場: 17:30より<br/>
            特典: ロゴステッカー付き
          </div>
        </div>
      ))}
      <div
        className="flex items-center"
        style={{ padding: '15px 20px', background: 'var(--color-encore-bg)', gap: 14, borderTop: '1px solid var(--color-encore-border-light)' }}
      >
        <div className="flex-1" style={{ fontSize: 14, color: 'var(--color-encore-text-sub)' }}>会場へのメモ</div>
      </div>
      <div
        className="flex items-center cursor-pointer"
        style={{ padding: '15px 20px', background: 'var(--color-encore-bg)', gap: 14, borderTop: '1px solid var(--color-encore-border-light)' }}
      >
        <div className="flex-1" style={{ fontSize: 15, color: 'var(--color-encore-green)' }}>メモを追加する</div>
        <ChevronRight />
      </div>
      <div
        className="flex justify-between items-center"
        style={{
          background: 'var(--color-encore-bg-section)',
          padding: '14px 20px',
          borderTop: '1px solid var(--color-encore-border-light)',
        }}
      >
        <span style={{ fontSize: 14, color: 'var(--color-encore-text-sub)' }}>合計</span>
        <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-encore-green)' }}>{total}</span>
      </div>
      <div style={{ padding: '12px 20px 24px' }}>
        <Button variant="primary">購入を確定する</Button>
      </div>
    </div>
  )
}
