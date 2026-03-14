'use client'

import React from 'react'
import { Ticket, MapPin, Clock, Buildings } from '@phosphor-icons/react'
import * as ty from './typographyStyles'
import HorizontalTabs from './HorizontalTabs'
import Button from './Button'

export default function StoreCard() {
  return (
    <div style={{ background: 'var(--color-encore-bg)', borderRadius: 8, overflow: 'hidden' }}>
      <HorizontalTabs
        tabs={[
          <span key="ticket" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <Ticket size={13} weight="light" />チケット
          </span>,
          <span key="venue" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <MapPin size={13} weight="light" />会場情報
          </span>,
        ]}
        defaultActive={0}
      />
      <div style={{ padding: '16px 20px' }}>
        <div
          style={{
            width: '100%',
            height: 130,
            borderRadius: 8,
            marginBottom: 14,
            overflow: 'hidden',
          }}
        >
          <img src="/Houseimg/unnamed.webp" alt="Zepp Haneda" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>

        <div style={{ ...ty.section, marginBottom: 6 }}>
          Zepp Haneda
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 16 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, ...ty.sub }}>
            <Clock size={12} weight="light" color="var(--color-encore-green)" />
            OPEN 17:00 / START 18:00
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, ...ty.sub }}>
            <Buildings size={12} weight="light" color="var(--color-encore-green)" />
            収容人数: 2,500名
          </span>
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          {['詳細を見る', 'チケット購入', '抽選に申込む'].map((label) => (
            <div key={label} style={{ flex: 1, minWidth: 0 }}>
              <Button variant="sm-ghost" className="w-full whitespace-nowrap">{label}</Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
