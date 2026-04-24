'use client'

import React from 'react'
import Button from './Button'
import { CaretRight } from '@phosphor-icons/react'
import * as ty from './typographyStyles'

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
    image: '/grape/artist/soloA_ssw.png',
    name: 'AOI 1st ONE MAN LIVE『NOCTURNE』',
    detail: 'S席・1枚 | CAVE Shibuya・5月10日(日)',
    qty: 1,
    price: '¥3,500',
  },
]

export default function OrderSummary({ items = defaultItems, total = '¥3,500' }: OrderSummaryProps) {
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
              <div style={{ ...ty.section, fontSize: 18, marginBottom: 4 }}>{item.name}</div>
              <div style={{ ...ty.sub, lineHeight: 1.5 }}>{item.detail}</div>
              <div className="flex gap-3 mt-1.5">
                <button style={{ ...ty.link, cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}>
                  座席を変更する
                </button>
                <button style={{ ...ty.link, cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}>
                  削除
                </button>
              </div>
            </div>
          </div>
          <div
            style={{
              ...ty.bodySM,
              background: 'var(--color-encore-bg-section)',
              padding: '14px 20px',
              lineHeight: 1.75,
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
        <div className="flex-1" style={{ ...ty.body }}>メモを追加する</div>
        <ChevronRight />
      </div>
      <div
        className="flex justify-between items-center"
        style={{
          background: 'var(--color-encore-bg-section)',
          padding: '14px 20px',
        }}
      >
        <span style={{ ...ty.sub }}>合計</span>
        <span style={{ ...ty.price }}>{total}</span>
      </div>
      <div style={{ padding: '12px 20px 24px' }}>
        <Button variant="primary">購入を確定する</Button>
      </div>
    </div>
  )
}
