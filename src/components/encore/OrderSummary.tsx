import React from 'react'
import Button from './Button'
import { CaretRight } from '@phosphor-icons/react'

const JA = 'var(--font-google-sans), var(--font-noto-jp), sans-serif'
const EN = 'var(--font-google-sans), sans-serif'

const squirclePath = (s: number) => {
  const r = s / 2
  const k = r * 0.72
  return `M ${s} ${r} C ${s} ${r + k} ${r + k} ${s} ${r} ${s} C ${r - k} ${s} 0 ${r + k} 0 ${r} C 0 ${r - k} ${r - k} 0 ${r} 0 C ${r + k} 0 ${s} ${r - k} ${s} ${r} Z`
}

interface OrderItem {
  image?: string
  name: string
  detail: string
  qty: number
  price: string
}

interface OrderSummaryProps {
  items?: OrderItem[]
  total?: string
}

const ChevronRight = () => (
  <CaretRight size={14} weight="light" color="var(--color-encore-green)" />
)

const defaultItems: OrderItem[] = [
  {
    image: '/Artistimg/01.jpg',
    name: 'RADWIMPS LIVE 2026 東京',
    detail: 'S席・1枚 | Zepp Tokyo・3月20日(金)',
    qty: 1,
    price: '¥8,800',
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
            }}
          >
            {/* アバター（squircle） */}
            <div style={{ width: 56, height: 56, flexShrink: 0, clipPath: `path("${squirclePath(56)}")`, background: 'var(--color-encore-bg-section)', overflow: 'hidden' }}>
              {item.image && <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
            </div>
            <div className="flex-1">
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, color: 'var(--color-encore-green)', fontFamily: JA }}>{item.name}</div>
              <div style={{ fontSize: 12, color: 'var(--color-encore-text-sub)', lineHeight: 1.5, fontFamily: JA }}>{item.detail}</div>
              <div className="flex gap-3 mt-1.5">
                <button style={{ fontSize: 13, color: 'var(--color-encore-amber)', cursor: 'pointer', background: 'none', border: 'none', padding: 0, fontFamily: JA }}>
                  座席を変更する
                </button>
                <button style={{ fontSize: 13, color: 'var(--color-encore-amber)', cursor: 'pointer', background: 'none', border: 'none', padding: 0, fontFamily: JA }}>
                  削除
                </button>
              </div>
            </div>
          </div>
          <div
            style={{
              background: 'var(--color-encore-bg-section)',
              padding: '14px 20px',
              fontSize: 12,
              fontWeight: 400,
              lineHeight: 1.75,
              color: 'var(--color-encore-green)',
              fontFamily: JA,
            }}
          >
            座席: S席・3列14番<br/>
            入場: 17:30より<br/>
            特典: ロゴステッカー付き
          </div>
        </div>
      ))}
      <div
        className="flex items-center cursor-pointer"
        style={{ padding: '15px 20px', background: 'var(--color-encore-bg)', gap: 14 }}
      >
        <div className="flex-1" style={{ fontSize: 13, color: 'var(--color-encore-green)', fontFamily: JA }}>メモを追加する</div>
        <ChevronRight />
      </div>
      <div
        className="flex justify-between items-center"
        style={{
          background: 'var(--color-encore-bg-section)',
          padding: '14px 20px',
        }}
      >
        <span style={{ fontSize: 12, color: 'var(--color-encore-text-sub)', fontFamily: JA }}>合計</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-encore-green)', fontFamily: EN }}>{total}</span>
      </div>
      <div style={{ padding: '12px 20px 24px' }}>
        <Button variant="primary">購入を確定する</Button>
      </div>
    </div>
  )
}
