'use client'

import React, { useEffect, useRef, useState } from 'react'
import Button from '@/components/encore/Button'
import NavHeader, { StatusBar } from '@/components/encore/NavHeader'
import TabBar from '@/components/encore/TabBar'
import HorizontalTabs from '@/components/encore/HorizontalTabs'
import ListRow from '@/components/encore/ListRow'
import InputField from '@/components/encore/InputField'
import ProductCard from '@/components/encore/ProductCard'
import IngredientSelector from '@/components/encore/IngredientSelector'
import SegmentedControl from '@/components/encore/SegmentedControl'
import SearchBar from '@/components/encore/SearchBar'
import StoreCard from '@/components/encore/StoreCard'
import OrderSummary from '@/components/encore/OrderSummary'
import EmptyState from '@/components/encore/EmptyState'
import Badge from '@/components/encore/Badge'
import RankProgress from '@/components/encore/RankProgress'
import BottomSheet from '@/components/encore/BottomSheet'
import Notification from '@/components/encore/Notification'
import Toggle from '@/components/encore/Toggle'
import CreditCard from '@/components/encore/CreditCard'
import QuantityStepper from '@/components/encore/QuantityStepper'
import TooltipBubble from '@/components/encore/TooltipBubble'
import SplashScreen from '@/components/encore/SplashScreen'
import ColorPalette from '@/components/encore/ColorPalette'
import Typography from '@/components/encore/Typography'
import Calendar, { ReservationCalendar, WeekStrip } from '@/components/encore/Calendar'

const sections = [
  { id: 's00', num: '00', label: 'Splash Screen' },
  { id: 's01', num: '01', label: 'Color Palette' },
  { id: 's02', num: '02', label: 'Typography' },
  { id: 's03', num: '03', label: 'Buttons' },
  { id: 's04', num: '04', label: 'Nav Header' },
  { id: 's05', num: '05', label: 'Tab Bar' },
  { id: 's06', num: '06', label: 'Horizontal Tabs' },
  { id: 's07', num: '07', label: 'List Rows' },
  { id: 's08', num: '08', label: 'Input Fields' },
  { id: 's09', num: '09', label: 'Product Cards' },
  { id: 's10', num: '10', label: 'Ingredient Selector' },
  { id: 's11', num: '11', label: 'Segmented Control' },
  { id: 's12', num: '12', label: 'Search Bar' },
  { id: 's13', num: '13', label: 'Store Card' },
  { id: 's14', num: '14', label: 'Order Summary' },
  { id: 's15', num: '15', label: 'Empty State' },
  { id: 's16', num: '16', label: 'Badges & Tags' },
  { id: 's17', num: '17', label: 'Rank Progress' },
  { id: 's18', num: '18', label: 'Bottom Sheet' },
  { id: 's19', num: '19', label: 'Notification' },
  { id: 's20', num: '20', label: 'Toggle Switch' },
  { id: 's21', num: '21', label: 'Credit Card' },
  { id: 's22', num: '22', label: 'Qty Stepper' },
  { id: 's23', num: '23', label: 'Tooltip Bubble' },
  { id: 's24', num: '24', label: 'Calendar' },
]

function SectionBlock({
  id,
  num,
  title,
  children,
}: {
  id: string
  num: string
  title: string
  children: React.ReactNode
}) {
  return (
    <div id={id} style={{ marginBottom: 80, scrollMarginTop: 32 }}>
      <div style={{ fontFamily: '"Helvetica Neue", Arial, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#AEAAA3', marginBottom: 4 }}>
        {num}
      </div>
      <div style={{ fontFamily: '"Helvetica Neue", Arial, sans-serif', fontSize: 22, fontWeight: 800, color: '#1B3C2D', marginBottom: 28, paddingBottom: 16, borderBottom: '1px solid #D8D4CD' }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: 'inline-block',
      fontFamily: '"Helvetica Neue", Arial, sans-serif',
      fontSize: 9,
      fontWeight: 700,
      letterSpacing: '0.1em',
      textTransform: 'uppercase' as const,
      color: '#AEAAA3',
      background: '#E8E5DF',
      borderRadius: 999,
      padding: '3px 10px',
      marginBottom: 6,
    }}>
      {children}
    </div>
  )
}

function PhoneFrame({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <div style={{
      width: 375,
      background: dark ? '#1B3C2D' : '#F2F0EB',
      borderRadius: 50,
      overflow: 'hidden',
      boxShadow: '0 28px 80px rgba(0,0,0,0.28), 0 0 0 2px #1a1a1a',
      flexShrink: 0,
    }}>
      {children}
    </div>
  )
}

const paymentIcon = (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <rect x="1" y="4" width="16" height="11" rx="2"/>
    <path d="M1 8h16"/>
  </svg>
)
const profileIcon = (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="9" cy="6" r="3.5"/>
    <path d="M2 16c0-3.3 3-6 7-6s7 2.7 7 6"/>
  </svg>
)
const promoIcon = (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <rect x="2" y="6" width="14" height="10" rx="2"/>
    <path d="M6 6V5a3 3 0 016 0v1"/>
    <path d="M9 11v2"/>
  </svg>
)
const historyIcon = (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="9" cy="9" r="7"/>
    <path d="M9 5v5l3 2"/>
  </svg>
)
const helpIcon = (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="9" cy="9" r="7"/>
    <path d="M9 13v-1M9 7a2 2 0 011.5 3.3L9 11.5"/>
  </svg>
)
const nicknameIcon = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="8" cy="5.5" r="3"/>
    <path d="M1.5 14c0-3 3-5 6.5-5s6.5 2 6.5 5"/>
  </svg>
)
const emailIcon = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <rect x="1" y="3" width="14" height="10" rx="2"/>
    <path d="M1 5.5l7 4.5 7-4.5"/>
  </svg>
)
const birthdayIcon = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <rect x="2" y="6" width="12" height="9" rx="2"/>
    <path d="M5 6V5a3 3 0 016 0v1"/>
    <circle cx="8" cy="10.5" r="1" fill="currentColor" stroke="none"/>
  </svg>
)

const sampleIngredients1 = [
  { id: 'romaine', name: 'ロメインレタスとワイルドライス', emoji: '🌿' },
  { id: 'spinach', name: 'ほうれん草とワイルドライス', emoji: '🥬' },
  { id: 'rice', name: 'ワイルドライス', emoji: '🍚' },
]
const sampleIngredients2 = [
  { id: 'tomato', name: 'トマト', emoji: '🍅', price: '¥145' },
  { id: 'crouton', name: '自家製クルトン', emoji: '🥐', price: '¥145' },
  { id: 'onion', name: 'レッドオニオン', emoji: '🧅', price: '¥145' },
  { id: 'avocado', name: 'アボカド', emoji: '🥑', price: '¥145' },
]

const rankNodes = [
  { num: 1, name: 'FRIEND', emoji: '🤝', active: true },
  { num: 3, name: 'GOOD FRIEND', active: false },
  { num: 10, name: 'BEST FRIEND', active: false },
  { num: 20, name: 'ARCHITECT', active: false },
]

export default function Page() {
  const [activeSection, setActiveSection] = useState('s00')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [notifKey, setNotifKey] = useState(0)
  const [ccNumber, setCcNumber] = useState('')
  const [ccMonth, setCcMonth] = useState('')
  const [ccYear, setCcYear] = useState('')
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map())

  useEffect(() => {
    const observers: IntersectionObserver[] = []
    sections.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id)
        },
        { rootMargin: '-30% 0px -60% 0px' }
      )
      obs.observe(el)
      observers.push(obs)
      sectionRefs.current.set(id, el)
    })
    return () => observers.forEach((o) => o.disconnect())
  }, [])

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <nav
        className="encore-sidebar"
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          height: '100vh',
          width: 200,
          background: '#1B3C2D',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ padding: '28px 18px 18px', borderBottom: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
          <div style={{ fontFamily: '"Helvetica Neue", Arial, sans-serif', fontSize: 17, fontWeight: 900, color: '#fff', letterSpacing: '0.14em' }}>
            ENCORE
          </div>
          <div style={{ fontFamily: '"Helvetica Neue", Arial, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: '#8BA898', marginTop: 3 }}>
            UI Component Kit
          </div>
        </div>
        {sections.map(({ id, num, label }) => (
          <a
            key={id}
            href={`#${id}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 18px',
              textDecoration: 'none',
              color: activeSection === id ? '#fff' : 'rgba(255,255,255,0.5)',
              fontFamily: '"Helvetica Neue", Arial, sans-serif',
              fontSize: 10.5,
              fontWeight: 500,
              transition: 'all 0.15s',
              borderLeft: `3px solid ${activeSection === id ? '#C08A4A' : 'transparent'}`,
              background: activeSection === id ? 'rgba(255,255,255,0.1)' : 'transparent',
            }}
          >
            <span style={{ fontFamily: 'monospace', fontSize: 9, color: '#C08A4A', fontWeight: 700, minWidth: 14 }}>
              {num}
            </span>
            {label}
          </a>
        ))}
      </nav>

      {/* Main */}
      <main style={{ marginLeft: 200, padding: '52px 44px 100px' }}>
        {/* Page header */}
        <div style={{ marginBottom: 60 }}>
          <div style={{ fontFamily: '"Helvetica Neue", Arial, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: '#C08A4A', marginBottom: 8 }}>
            Component Library
          </div>
          <div style={{ fontFamily: '"Helvetica Neue", Arial, sans-serif', fontSize: 34, fontWeight: 900, color: '#1B3C2D', letterSpacing: '-0.01em', marginBottom: 8 }}>
            ENCORE UI Kit
          </div>
          <p style={{ fontSize: 13, color: '#6B6B6B', lineHeight: 1.65 }}>
            ENCOREアプリのデザイントークンとUIコンポーネント一覧。<br/>
            Background <code>#F2F0EB</code> · Green <code>#1B3C2D</code> · Amber <code>#C08A4A</code>
          </p>
        </div>

        {/* S00 Splash */}
        <SectionBlock id="s00" num="00" title="Splash Screen">
          <PhoneFrame dark>
            <StatusBar dark />
            <SplashScreen />
          </PhoneFrame>
        </SectionBlock>

        {/* S01 Color Palette */}
        <SectionBlock id="s01" num="01" title="Color Palette">
          <ColorPalette />
        </SectionBlock>

        {/* S02 Typography */}
        <SectionBlock id="s02" num="02" title="Typography">
          <Typography />
        </SectionBlock>

        {/* S03 Buttons */}
        <SectionBlock id="s03" num="03" title="Buttons">
          <div className="flex flex-wrap gap-5 items-start">
            <div className="flex flex-col gap-3" style={{ flex: 1, minWidth: 240 }}>
              <Chip>Primary</Chip>
              <div style={{ background: '#F2F0EB', borderRadius: 16, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
                <Button variant="primary">この内容で次へ</Button>
              </div>
              <Chip>Secondary / Outline</Chip>
              <div style={{ background: '#F2F0EB', borderRadius: 16, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
                <Button variant="secondary">変更する</Button>
              </div>
              <Chip>Ghost</Chip>
              <div style={{ background: '#F2F0EB', borderRadius: 16, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
                <Button variant="ghost">START AN ORDER</Button>
              </div>
            </div>
            <div className="flex flex-col gap-3" style={{ flex: 1, minWidth: 240 }}>
              <Chip>Disabled</Chip>
              <div style={{ background: '#F2F0EB', borderRadius: 16, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
                <Button variant="disabled" disabled>OK</Button>
              </div>
              <Chip>Small Buttons</Chip>
              <div style={{ background: '#F2F0EB', borderRadius: 16, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Button variant="sm-primary">店舗で食べる</Button>
                <Button variant="sm-ghost">持ち帰る</Button>
                <Button variant="sm-secondary">予約する</Button>
              </div>
              <Chip>Button Stack</Chip>
              <div style={{ background: '#F2F0EB', borderRadius: 16, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Button variant="primary">このまま注文</Button>
                <Button variant="secondary">変更する</Button>
              </div>
            </div>
          </div>
        </SectionBlock>

        {/* S04 Nav Header */}
        <SectionBlock id="s04" num="04" title="Navigation Header">
          <div className="flex flex-col gap-3" style={{ maxWidth: 375 }}>
            <Chip>Back Arrow</Chip>
            <div style={{ background: '#F2F0EB', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
              <StatusBar />
              <NavHeader title="チキンタコボウル" variant="back" />
            </div>
            <Chip>Close (Modal)</Chip>
            <div style={{ background: '#F2F0EB', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
              <NavHeader title="クレジット・デビットカードを登録" variant="close" />
            </div>
            <Chip>Title Only (EN uppercase)</Chip>
            <div style={{ background: '#F2F0EB', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
              <NavHeader title="HISTORY" variant="title-only" titleEn />
            </div>
          </div>
        </SectionBlock>

        {/* S05 Tab Bar */}
        <SectionBlock id="s05" num="05" title="Bottom Tab Bar">
          <div style={{ background: '#F2F0EB', borderRadius: 16, overflow: 'hidden', maxWidth: 375, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
            <TabBar />
          </div>
        </SectionBlock>

        {/* S06 Horizontal Tabs */}
        <SectionBlock id="s06" num="06" title="Horizontal Tabs">
          <div className="flex flex-col gap-3" style={{ maxWidth: 375 }}>
            <Chip>2 tabs</Chip>
            <div style={{ background: '#F2F0EB', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
              <HorizontalTabs tabs={['以前の注文', '注文中のもの']} defaultActive={1}>
                <div style={{ padding: 24, fontSize: 13, color: '#AEAAA3', textAlign: 'center' }}>コンテンツエリア</div>
              </HorizontalTabs>
            </div>
            <Chip>4 tabs (scrollable)</Chip>
            <div style={{ background: '#F2F0EB', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
              <HorizontalTabs tabs={['ベース', 'トッピング', 'ドレッシング', 'コンディメンツ']}>
                <div style={{ padding: 24, fontSize: 13, color: '#AEAAA3', textAlign: 'center' }}>コンテンツエリア</div>
              </HorizontalTabs>
            </div>
          </div>
        </SectionBlock>

        {/* S07 List Rows */}
        <SectionBlock id="s07" num="07" title="List Rows">
          <div style={{ background: '#F2F0EB', borderRadius: 16, overflow: 'hidden', maxWidth: 375, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
            <div style={{ background: '#E8E5DF', padding: '10px 20px', fontSize: 13, fontWeight: 500, color: '#6B6B6B' }}>アカウント</div>
            <ListRow icon={paymentIcon} label="お支払い" showChevron />
            <div style={{ borderTop: '1px solid #D8D4CD' }}>
              <ListRow icon={profileIcon} label="プロフィール" showChevron />
            </div>
            <div style={{ borderTop: '1px solid #D8D4CD' }}>
              <ListRow icon={promoIcon} label="プロモーション" showChevron />
            </div>
            <div style={{ background: '#E8E5DF', padding: '10px 20px', fontSize: 13, fontWeight: 500, color: '#6B6B6B', borderTop: '1px solid #D8D4CD' }}>サポート</div>
            <ListRow icon={historyIcon} label="設定" showChevron />
            <div style={{ borderTop: '1px solid #D8D4CD' }}>
              <ListRow icon={helpIcon} label="ヘルプ" showChevron />
            </div>
          </div>
        </SectionBlock>

        {/* S08 Input Fields */}
        <SectionBlock id="s08" num="08" title="Input Fields">
          <div className="flex flex-wrap gap-5 items-start">
            <div style={{ flex: 1, minWidth: 280, maxWidth: 375 }}>
              <Chip>Profile Edit — with icons</Chip>
              <div style={{ background: '#F2F0EB', borderRadius: 16, padding: '24px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', marginTop: 6 }}>
                <div style={{ fontSize: 14, color: '#6B6B6B', marginBottom: 20 }}>あなたのことを教えてください</div>
                <InputField label="ニックネーム" placeholder="ui pocket" defaultValue="ui pocket" icon={nicknameIcon} />
                <InputField label="メールアドレス" placeholder="メールアドレス" type="email" icon={emailIcon} />
                <InputField label="誕生日（入力しておくと良い事が…?）" placeholder="誕生日" icon={birthdayIcon} />
                <div style={{ marginTop: 8 }}>
                  <Button variant="primary">この内容で登録する</Button>
                </div>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 280, maxWidth: 375 }}>
              <Chip>Text with counter</Chip>
              <div style={{ background: '#F2F0EB', borderRadius: 16, padding: '24px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', marginTop: 6 }}>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: '#1B3C2D' }}>何という名前で呼びますか？</div>
                <InputField label="" placeholder="お好きなニックネームを入力" maxLength={20} showCounter />
              </div>
            </div>
          </div>
        </SectionBlock>

        {/* S09 Product Cards */}
        <SectionBlock id="s09" num="09" title="Product Cards">
          <div className="flex flex-wrap gap-5 items-start">
            <div style={{ flex: 1, minWidth: 240, maxWidth: 320 }}>
              <Chip>Overlay Style</Chip>
              <div style={{ marginTop: 6 }}>
                <ProductCard
                  variant="overlay"
                  title="チキンタコボウル"
                  description="グリルドチキン、アボカド、トマト、自家製クルトン、ロメインレタスとワイルドライス"
                  price="¥ 1,295"
                  badge="132 kcal"
                  emoji="🥗"
                />
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 240, maxWidth: 320 }}>
              <Chip>Like Card</Chip>
              <div style={{ marginTop: 6 }}>
                <ProductCard
                  variant="like"
                  title="クラシック・チキンシーザー"
                  description="ロメインレタス、パルメザンチーズ、追加ロメインレタス、グリルドチキン、トマト"
                  price="¥1,295"
                  emoji="🥙"
                />
              </div>
            </div>
          </div>
        </SectionBlock>

        {/* S10 Ingredient Selector */}
        <SectionBlock id="s10" num="10" title="Ingredient Selector">
          <div style={{ background: '#F2F0EB', borderRadius: 16, overflow: 'hidden', maxWidth: 375, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
            <IngredientSelector title="ベース" description="ベースを変更できます" ingredients={sampleIngredients1} />
            <IngredientSelector title="トッピング" description="4つまでは料金に含まれます" ingredients={sampleIngredients2} />
            <div style={{ padding: '12px 20px 16px', background: '#E8E5DF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #D8D4CD' }}>
              <div style={{ fontSize: 14 }}>チキンタコボウル</div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>¥1,295</div>
            </div>
            <div style={{ padding: '12px 20px 20px' }}>
              <Button variant="primary">この内容で次へ</Button>
            </div>
          </div>
        </SectionBlock>

        {/* S11 Segmented Control */}
        <SectionBlock id="s11" num="11" title="Segmented Control">
          <div style={{ background: '#F2F0EB', borderRadius: 16, overflow: 'hidden', maxWidth: 375, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
            <div style={{ padding: '16px 20px 4px', fontSize: 15, fontWeight: 600, color: '#1B3C2D' }}>このカードは何用ですか？</div>
            <SegmentedControl options={['👤 個人用', '🏢 ビジネス用', '🚪 その他']} />
          </div>
        </SectionBlock>

        {/* S12 Search Bar */}
        <SectionBlock id="s12" num="12" title="Search Bar">
          <div style={{ background: '#F2F0EB', borderRadius: 16, overflow: 'hidden', maxWidth: 375, padding: '8px 0', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
            <SearchBar />
          </div>
        </SectionBlock>

        {/* S13 Store Card */}
        <SectionBlock id="s13" num="13" title="Store Card">
          <div style={{ maxWidth: 375 }}>
            <StoreCard />
          </div>
        </SectionBlock>

        {/* S14 Order Summary */}
        <SectionBlock id="s14" num="14" title="Order Summary">
          <div style={{ maxWidth: 375 }}>
            <div style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
              <StatusBar />
              <NavHeader title="注文内容の確認" variant="back" />
              <OrderSummary />
            </div>
          </div>
        </SectionBlock>

        {/* S15 Empty State */}
        <SectionBlock id="s15" num="15" title="Empty State">
          <div style={{ background: '#F2F0EB', borderRadius: 16, overflow: 'hidden', maxWidth: 375, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
            <NavHeader title="HISTORY" titleEn variant="title-only" />
            <HorizontalTabs tabs={['以前の注文', '注文中のもの']} defaultActive={1} />
            <EmptyState message="いま注文中の商品はないようです。" subMessage="そろそろおなか空いてきませんか？" />
            <TabBar />
          </div>
        </SectionBlock>

        {/* S16 Badges */}
        <SectionBlock id="s16" num="16" title="Badges & Tags">
          <div style={{ background: '#F2F0EB', borderRadius: 16, padding: 28, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
            <Badge variant="green">FRIEND</Badge>
            <Badge variant="green">BEST FRIEND</Badge>
            <Badge variant="amber">NEW</Badge>
            <Badge variant="muted">欠品中</Badge>
            <Badge variant="outline">132 kcal</Badge>
            <Badge variant="muted">¥145</Badge>
            <Badge variant="light-green">ARCHITECT</Badge>
          </div>
        </SectionBlock>

        {/* S17 Rank Progress */}
        <SectionBlock id="s17" num="17" title="Rank Progress">
          <div style={{ background: '#F2F0EB', borderRadius: 16, overflow: 'hidden', maxWidth: 375, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
            <div style={{ textAlign: 'center', padding: '24px 20px 8px' }}>
              <div style={{ fontSize: 12, color: '#6B6B6B' }}>あなたのランクは</div>
              <div style={{ fontFamily: '"Helvetica Neue", Arial, sans-serif', fontSize: 30, fontWeight: 900, color: '#1B3C2D', letterSpacing: '0.04em', margin: '6px 0' }}>FRIEND</div>
              <div style={{ fontSize: 12, color: '#6B6B6B' }}>次のランクまであと2回！</div>
            </div>
            <RankProgress nodes={rankNodes} />
          </div>
        </SectionBlock>

        {/* S18 Bottom Sheet */}
        <SectionBlock id="s18" num="18" title="Bottom Sheet">
          <div style={{ maxWidth: 375 }}>
            <Button variant="sm-secondary" onClick={() => setSheetOpen(true)}>▲ ボトムシートを開く</Button>
            <div style={{ marginTop: 16, background: 'rgba(0,0,0,0.35)', borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>背景コンテンツ</div>
              <div style={{ background: '#F2F0EB', borderRadius: '24px 24px 0 0', padding: '0 20px 28px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0 24px' }}>
                  <div style={{ width: 36, height: 4, background: '#D8D4CD', borderRadius: 999 }} />
                </div>
                <div style={{ fontSize: 17, fontWeight: 700, textAlign: 'center', marginBottom: 4, color: '#1B3C2D' }}>前回の注文</div>
                <div style={{ fontSize: 13, color: '#6B6B6B', textAlign: 'center', marginBottom: 24 }}>予約 | 持ち帰る | 丸の内店</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <Button variant="primary">このまま注文</Button>
                  <Button variant="secondary">変更する</Button>
                </div>
              </div>
            </div>
          </div>
          <BottomSheet
            isOpen={sheetOpen}
            onClose={() => setSheetOpen(false)}
            title="前回の注文"
            subtitle="予約 | 持ち帰る | 丸の内店"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Button variant="primary" onClick={() => setSheetOpen(false)}>このまま注文</Button>
              <Button variant="secondary" onClick={() => setSheetOpen(false)}>変更する</Button>
            </div>
          </BottomSheet>
        </SectionBlock>

        {/* S19 Notification */}
        <SectionBlock id="s19" num="19" title="Notification Banner">
          <div style={{ maxWidth: 375, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span style={{ display: 'inline-block', fontFamily: '"Helvetica Neue", Arial, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#AEAAA3', background: '#E8E5DF', borderRadius: 999, padding: '3px 10px' }}>Dismissible</span>
            <div style={{ background: '#F2F0EB', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
              <Notification key={notifKey} message="ログインが完了しました。さぁ、素敵なサラダライフをはじめましょう！" icon="ℹ️" />
              <div style={{ padding: '16px 20px', fontSize: 13, color: '#AEAAA3' }}>ページコンテンツ</div>
            </div>
            <div style={{ alignSelf: 'flex-start' }}>
              <Button variant="sm-ghost" onClick={() => setNotifKey(k => k + 1)}>↺ リセット</Button>
            </div>
          </div>
        </SectionBlock>

        {/* S20 Toggle */}
        <SectionBlock id="s20" num="20" title="Toggle Switch">
          <div style={{ background: '#F2F0EB', borderRadius: 16, overflow: 'hidden', maxWidth: 375, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
            <div style={{ background: '#E8E5DF', padding: '10px 20px', fontSize: 13, fontWeight: 500, color: '#6B6B6B' }}>通知設定</div>
            <Toggle label="プッシュ通知" defaultChecked={true} />
            <div style={{ height: 1, background: '#D8D4CD', margin: '0 20px' }} />
            <Toggle label="メール通知" defaultChecked={false} />
            <div style={{ height: 1, background: '#D8D4CD', margin: '0 20px' }} />
            <Toggle label="SMS通知" defaultChecked={false} />
          </div>
        </SectionBlock>

        {/* S21 Credit Card */}
        <SectionBlock id="s21" num="21" title="Credit Card UI">
          <div style={{ background: '#F2F0EB', borderRadius: 16, overflow: 'hidden', maxWidth: 375, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
            <NavHeader title="カードを登録" variant="close" />
            <div style={{ padding: 20 }}>
              <CreditCard
                cardNumber={ccNumber}
                expDisplay={ccMonth && ccYear ? `${ccMonth}/${ccYear}` : '月/年'}
              />
            </div>
            <div style={{ background: '#E8E5DF', padding: '14px 20px', fontSize: 14, color: '#6B6B6B' }}>
              クレジット・デビットカードの情報を入力してください
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ fontSize: 12, color: '#AEAAA3', marginBottom: 10 }}>利用可能なカードブランド</div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
                {([{ label: 'AMEX', color: '#6B6B6B' }, { label: 'DINERS', color: '#6B6B6B' }, { label: 'DISCOVER', color: '#6B6B6B' }, { label: 'JCB', color: '#0e4c96' }, { label: 'MC', color: '#eb001b' }, { label: 'VISA', color: '#1a1f71' }] as {label: string, color: string}[]).map(({ label, color }) => (
                  <div key={label} style={{ border: '1px solid #D8D4CD', borderRadius: 6, padding: '4px 8px', fontSize: 10, fontWeight: 700, fontFamily: '"Helvetica Neue", Arial, sans-serif', color }}>{label}</div>
                ))}
              </div>
              {/* Card number input */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, paddingTop: 4, marginBottom: 24, borderBottom: '1.5px solid #D8D4CD' }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 11, color: '#AEAAA3', marginBottom: 2, display: 'block' }}>クレジットカード番号</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0000 0000 0000 0000"
                    value={ccNumber}
                    maxLength={19}
                    onChange={(e) => setCcNumber(e.target.value.replace(/\D/g, ''))}
                    style={{ width: '100%', background: 'transparent', border: 'none', padding: '4px 0 6px', fontSize: 15, fontFamily: '"Helvetica Neue", Arial, sans-serif', color: '#1B3C2D', outline: 'none', lineHeight: 1.4 }}
                  />
                </div>
              </div>
              {/* MM / YY inputs */}
              <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: 12, paddingTop: 4, borderBottom: '1.5px solid #D8D4CD' }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 11, color: '#AEAAA3', marginBottom: 2, display: 'block' }}>月</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="MM"
                      value={ccMonth}
                      maxLength={2}
                      onChange={(e) => setCcMonth(e.target.value.replace(/\D/g, ''))}
                      style={{ width: '100%', background: 'transparent', border: 'none', padding: '4px 0 6px', fontSize: 15, fontFamily: '"Helvetica Neue", Arial, sans-serif', color: '#1B3C2D', outline: 'none', lineHeight: 1.4 }}
                    />
                  </div>
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: 12, paddingTop: 4, borderBottom: '1.5px solid #D8D4CD' }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 11, color: '#AEAAA3', marginBottom: 2, display: 'block' }}>年</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="YY"
                      value={ccYear}
                      maxLength={2}
                      onChange={(e) => setCcYear(e.target.value.replace(/\D/g, ''))}
                      style={{ width: '100%', background: 'transparent', border: 'none', padding: '4px 0 6px', fontSize: 15, fontFamily: '"Helvetica Neue", Arial, sans-serif', color: '#1B3C2D', outline: 'none', lineHeight: 1.4 }}
                    />
                  </div>
                </div>
              </div>
              <Button variant="primary">登録する</Button>
            </div>
          </div>
        </SectionBlock>

        {/* S22 Qty Stepper */}
        <SectionBlock id="s22" num="22" title="Qty Stepper">
          <div style={{ background: '#F2F0EB', borderRadius: 16, padding: '24px 20px', maxWidth: 375, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {([
                { name: 'ソルト', price: '¥0', defaultValue: 0 },
                { name: 'ブラックペッパー', price: '¥0', defaultValue: 1 },
                { name: 'ホットソース', price: '¥0', defaultValue: 0 },
              ] as { name: string; price: string; defaultValue: number }[]).map((item, i, arr) => (
                <React.Fragment key={item.name}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: '#1B3C2D' }}>{item.name}</div>
                      <div style={{ fontSize: 13, color: '#6B6B6B' }}>{item.price}</div>
                    </div>
                    <QuantityStepper defaultValue={item.defaultValue} min={0} />
                  </div>
                  {i < arr.length - 1 && <div style={{ height: 1, background: '#D8D4CD' }} />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </SectionBlock>

        {/* S23 Tooltip Bubble */}
        <SectionBlock id="s23" num="23" title="Tooltip / Callout Bubble">
          <div style={{ background: '#F2F0EB', borderRadius: 16, padding: '32px 20px', maxWidth: 375, display: 'flex', flexDirection: 'column', gap: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
            <TooltipBubble variant="tail-top">あと2個コンディメンツ追加できますよ</TooltipBubble>
            <TooltipBubble variant="chat-left">今日はサラダの気分ですか？</TooltipBubble>
            <TooltipBubble variant="chat-right">いつもありがとうございます！</TooltipBubble>
          </div>
        </SectionBlock>

        {/* S24 Calendar */}
        <SectionBlock id="s24" num="24" title="Calendar">
          <div className="flex flex-wrap gap-5 items-start">
            <div style={{ flex: 1, minWidth: 320, maxWidth: 375 }}>
              <Chip>Month Calendar — 注文履歴つき</Chip>
              <div style={{ background: '#F2F0EB', borderRadius: 16, overflow: 'hidden', marginTop: 6, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
                <Calendar />
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 320, maxWidth: 375 }}>
              <Chip>Reservation Picker — 時間スロットつき</Chip>
              <div style={{ background: '#F2F0EB', borderRadius: 16, overflow: 'hidden', marginTop: 6, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
                <ReservationCalendar />
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 320, maxWidth: 375 }}>
              <Chip>Week Strip — コンパクト横スクロール</Chip>
              <div style={{ background: '#F2F0EB', borderRadius: 16, overflow: 'hidden', marginTop: 6, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
                <WeekStrip />
              </div>
            </div>
          </div>
        </SectionBlock>
      </main>
    </div>
  )
}
