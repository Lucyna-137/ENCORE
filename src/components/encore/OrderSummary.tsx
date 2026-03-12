import React from 'react'
import Button from './Button'

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
  <svg width="7" height="12" viewBox="0 0 7 12" fill="none" stroke="#AEAAA3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 1l5 5-5 5"/>
  </svg>
)

const defaultItems: OrderItem[] = [
  {
    emoji: '🥗',
    name: 'チキンタコボウル',
    detail: 'グリルドチキン、アボカド、トマト、自家製クルトン',
    qty: 1,
    price: '¥1,585',
    bgColor: 'linear-gradient(135deg,#C8D4C0,#A8BC9C)',
  },
]

export default function OrderSummary({ items = defaultItems, total = '¥1,585' }: OrderSummaryProps) {
  return (
    <div style={{ background: '#F2F0EB' }}>
      {items.map((item, i) => (
        <div key={i}>
          <div
            className="flex items-start gap-3.5"
            style={{
              padding: '16px 20px',
              background: '#F2F0EB',
              borderTop: i > 0 ? '1px solid #D8D4CD' : undefined,
            }}
          >
            <div
              className="flex-shrink-0 flex items-center justify-center overflow-hidden"
              style={{
                width: 56,
                height: 56,
                borderRadius: 12,
                background: item.bgColor ?? '#E8E5DF',
                fontSize: 26,
              }}
            >
              {item.emoji}
            </div>
            <div className="flex-1">
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, color: '#1B3C2D' }}>{item.name}</div>
              <div style={{ fontSize: 12, color: '#6B6B6B', lineHeight: 1.5 }}>{item.detail}</div>
              <div className="flex gap-3 mt-1.5">
                <button style={{ fontSize: 12, color: '#C08A4A', cursor: 'pointer', background: 'none', border: 'none', padding: 0, fontFamily: '"Hiragino Sans", "Yu Gothic", "Noto Sans JP", sans-serif' }}>
                  もっと自分の好みにカスタマイズ
                </button>
                <button style={{ fontSize: 12, color: '#C08A4A', cursor: 'pointer', background: 'none', border: 'none', padding: 0, fontFamily: '"Hiragino Sans", "Yu Gothic", "Noto Sans JP", sans-serif' }}>
                  削除
                </button>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div style={{ fontSize: 13, color: '#6B6B6B', marginBottom: 2 }}>x{item.qty}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1B3C2D' }}>{item.price}</div>
            </div>
          </div>
          <div
            style={{
              background: '#E8E5DF',
              padding: '14px 20px',
              borderTop: '1px solid #D8D4CD',
              fontSize: 13,
              lineHeight: 1.75,
              color: '#6B6B6B',
            }}
          >
            スプーン、紙ナプキン: つける<br/>
            ドレッシング: まぜる<br/>
            キャロットチリビネグレット: ふつう
          </div>
        </div>
      ))}
      <div
        className="flex items-center"
        style={{ padding: '15px 20px', background: '#F2F0EB', gap: 14, borderTop: '1px solid #D8D4CD' }}
      >
        <div className="flex-1" style={{ fontSize: 14, color: '#6B6B6B' }}>店舗へのコメント</div>
      </div>
      <div
        className="flex items-center cursor-pointer"
        style={{ padding: '15px 20px', background: '#F2F0EB', gap: 14, borderTop: '1px solid #D8D4CD' }}
      >
        <div className="flex-1" style={{ fontSize: 15, color: '#1B3C2D' }}>コメントを入れる</div>
        <ChevronRight />
      </div>
      <div
        className="flex justify-between items-center"
        style={{
          background: '#E8E5DF',
          padding: '14px 20px',
          borderTop: '1px solid #D8D4CD',
        }}
      >
        <span style={{ fontSize: 14, color: '#6B6B6B' }}>合計（税込）</span>
        <span style={{ fontSize: 18, fontWeight: 800, color: '#1B3C2D' }}>{total}</span>
      </div>
      <div style={{ padding: '12px 20px 24px' }}>
        <Button variant="primary">注文を確定する</Button>
      </div>
    </div>
  )
}
