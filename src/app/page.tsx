'use client'

import React, { useEffect, useRef, useState } from 'react'
import { CreditCard as CreditCardIcon, User, Tag, Clock, Question, Envelope, Cake, Buildings, DotsThreeOutline, Info } from '@phosphor-icons/react'
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
import ColorPalette, { PaletteResetButton } from '@/components/encore/ColorPalette'
import Typography from '@/components/encore/Typography'
import Calendar, { ReservationCalendar, WeekStrip } from '@/components/encore/Calendar'
import LiveCard from '@/components/encore/LiveCard'
import ArtistCard, { ArtistAvatar } from '@/components/encore/ArtistCard'
import FAB from '@/components/encore/FAB'
import { LiveStatusBadge, LiveTypeBadge } from '@/components/encore/StatusBadge'
import Select from '@/components/encore/Select'
import BarChart from '@/components/encore/BarChart'
import ColorPicker from '@/components/encore/ColorPicker'

const categories = [
  {
    label: 'Foundation',
    items: [
      { id: 's00', num: '00', label: 'Splash Screen' },
      { id: 's01', num: '01', label: 'Color Palette' },
      { id: 's02', num: '02', label: 'Typography' },
    ],
  },
  {
    label: 'Navigation',
    items: [
      { id: 's04', num: '03', label: 'Nav Header' },
      { id: 's05', num: '04', label: 'Tab Bar' },
      { id: 's06', num: '05', label: 'Horizontal Tabs' },
    ],
  },
  {
    label: 'Controls',
    items: [
      { id: 's03', num: '06', label: 'Buttons' },
      { id: 's27', num: '07', label: 'FAB' },
      { id: 's08', num: '08', label: 'Input Fields' },
      { id: 's29', num: '09', label: 'Select' },
      { id: 's11', num: '10', label: 'Segmented Control' },
      { id: 's12', num: '11', label: 'Search Bar' },
      { id: 's20', num: '12', label: 'Toggle Switch' },
      { id: 's22', num: '13', label: 'Qty Stepper' },
      { id: 's31', num: '14', label: 'Color Picker' },
    ],
  },
  {
    label: 'Content',
    items: [
      { id: 's25', num: '15', label: 'Live Card' },
      { id: 's09', num: '16', label: 'Product Cards' },
      { id: 's26', num: '17', label: 'Artist Card' },
      { id: 's07', num: '18', label: 'List Rows' },
      { id: 's10', num: '19', label: 'Ingredient Selector' },
      { id: 's13', num: '20', label: 'Store Card' },
      { id: 's14', num: '21', label: 'Order Summary' },
    ],
  },
  {
    label: 'Feedback',
    items: [
      { id: 's15', num: '22', label: 'Empty State' },
      { id: 's16', num: '23', label: 'Badges & Tags' },
      { id: 's28', num: '24', label: 'Status Badge' },
      { id: 's18', num: '25', label: 'Bottom Sheet' },
      { id: 's19', num: '26', label: 'Notification' },
      { id: 's23', num: '27', label: 'Tooltip Bubble' },
    ],
  },
  {
    label: 'Data Display',
    items: [
      { id: 's17', num: '28', label: 'Rank Progress' },
      { id: 's21', num: '29', label: 'Credit Card' },
      { id: 's24', num: '30', label: 'Calendar' },
      { id: 's30', num: '31', label: 'Bar Chart' },
    ],
  },
]

const sections = categories.flatMap((c) => c.items)

function SectionBlock({
  id,
  num,
  title,
  children,
  action,
}: {
  id: string
  num: string
  title: string
  children: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div id={id} style={{ marginBottom: 80, scrollMarginTop: 32 }}>
      <div style={{ fontFamily: 'var(--font-google-sans), sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-encore-text-muted)', marginBottom: 4 }}>
        {num}
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontFamily: 'var(--font-google-sans), sans-serif', fontSize: 22, fontWeight: 700,
        color: 'var(--color-encore-green)', marginBottom: 28, paddingBottom: 16,
        borderBottom: '1px solid var(--color-encore-border)',
      }}>
        <span>{title}</span>
        {action && <div style={{ fontSize: 14 }}>{action}</div>}
      </div>
      {children}
    </div>
  )
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: 'inline-block',
      fontFamily: 'var(--font-google-sans), sans-serif',
      fontSize: 9,
      fontWeight: 700,
      letterSpacing: '0.1em',
      textTransform: 'uppercase' as const,
      color: 'var(--color-encore-text-muted)',
      borderRadius: 999,
      padding: '3px 0',
      marginTop: 14,
      marginBottom: -2,
    }}>
      {children}
    </div>
  )
}

function PhoneFrame({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <div style={{
      width: 375,
      background: dark ? 'var(--color-encore-green)' : 'var(--color-encore-bg)',
      borderRadius: 50,
      overflow: 'hidden',
      boxShadow: 'var(--shadow-phone)',
      flexShrink: 0,
    }}>
      {children}
    </div>
  )
}

const paymentIcon  = <CreditCardIcon size={20} weight="light" />
const profileIcon  = <User           size={20} weight="light" />
const promoIcon    = <Tag            size={20} weight="light" />
const historyIcon  = <Clock          size={20} weight="light" />
const helpIcon     = <Question       size={20} weight="light" />
const nicknameIcon = <User           size={18} weight="light" />
const emailIcon    = <Envelope       size={18} weight="light" />
const birthdayIcon = <Cake           size={18} weight="light" />

const sampleIngredients1 = [
  { id: 'ballad', name: 'バラード', emoji: '🎵' },
  { id: 'rock', name: 'ロック', emoji: '🎸' },
  { id: 'acoustic', name: 'アコースティック', emoji: '🎹' },
]
const sampleIngredients2 = [
  { id: 'encore', name: 'アンコール', emoji: '🔥', price: '＋1曲' },
  { id: 'mc', name: 'MCあり', emoji: '🎤', price: '＋MC' },
  { id: 'new', name: '新曲初披露', emoji: '✨', price: '初演' },
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
          width: 256,
          background: 'var(--color-encore-green)',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ padding: '28px 18px 18px', flexShrink: 0 }}>
          <div style={{ fontFamily: 'var(--font-google-sans), sans-serif', fontSize: 17, fontWeight: 700, color: 'var(--color-encore-white)', letterSpacing: '0.14em' }}>
            ENCORE
          </div>
          <div style={{ fontFamily: 'var(--font-google-sans), sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: 'var(--color-encore-green-muted)', marginTop: 3 }}>
            UI Component Kit
          </div>
        </div>
        <div style={{ overflowY: 'auto', flex: 1, paddingBottom: 24 }}>
          {categories.map(({ label: catLabel, items }) => (
            <div key={catLabel}>
              <div style={{
                padding: '14px 18px 4px',
                fontFamily: 'var(--font-google-sans), sans-serif',
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase' as const,
                color: 'var(--color-encore-green-muted)',
              }}>
                {catLabel}
              </div>
              {items.map(({ id, num, label }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '5px 18px',
                    textDecoration: 'none',
                    color: activeSection === id ? 'var(--color-encore-white)' : 'rgba(255,255,255,0.5)',
                    fontFamily: 'var(--font-google-sans), sans-serif',
                    fontSize: 12,
                    fontWeight: 400,
                    transition: 'all 0.15s',
                    borderLeft: `3px solid ${activeSection === id ? 'var(--color-encore-amber)' : 'transparent'}`,
                    background: activeSection === id ? 'rgba(255,255,255,0.1)' : 'transparent',
                  }}
                >
                  <span style={{ fontFamily: 'monospace', fontSize: 9, color: 'var(--color-encore-amber)', fontWeight: 700, minWidth: 14 }}>
                    {num}
                  </span>
                  {label}
                </a>
              ))}
            </div>
          ))}
        </div>
      </nav>

      {/* Main */}
      <main style={{ marginLeft: 256, padding: '52px 44px 100px' }}>
        {/* Page header */}
        <div style={{ marginBottom: 60 }}>
          <div style={{ fontFamily: 'var(--font-google-sans), sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: 'var(--color-encore-amber)', marginBottom: 8 }}>
            Component Library
          </div>
          <div style={{ fontFamily: 'var(--font-google-sans), sans-serif', fontSize: 34, fontWeight: 700, color: 'var(--color-encore-green)', letterSpacing: '-0.01em', marginBottom: 8 }}>
            ENCORE UI Kit
          </div>
          <p style={{ fontSize: 13, color: 'var(--color-encore-text-sub)', lineHeight: 1.65 }}>
            ENCOREアプリのデザイントークンとUIコンポーネント一覧。
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
        <SectionBlock id="s01" num="01" title="Color Palette" action={<PaletteResetButton />}>
          <ColorPalette />
        </SectionBlock>

        {/* S02 Typography */}
        <SectionBlock id="s02" num="02" title="Typography">
          <Typography />
        </SectionBlock>

        {/* S04 Nav Header */}
        <SectionBlock id="s04" num="03" title="Navigation Header">
          <div className="flex flex-col gap-3" style={{ maxWidth: 375 }}>
            <Chip>Back Arrow</Chip>
            <div style={{ background: 'var(--color-encore-bg)', borderRadius: 8, overflow: 'hidden' }}>
              <StatusBar />
              <NavHeader title="RADWIMPS LIVE 2026" variant="back" />
            </div>
            <Chip>Close (Modal)</Chip>
            <div style={{ background: 'var(--color-encore-bg)', borderRadius: 8, overflow: 'hidden' }}>
              <NavHeader title="クレジット・デビットカードを登録" variant="close" />
            </div>
            <Chip>Title Only (EN uppercase)</Chip>
            <div style={{ background: 'var(--color-encore-bg)', borderRadius: 8, overflow: 'hidden' }}>
              <NavHeader title="HISTORY" variant="title-only" titleEn />
            </div>
          </div>
        </SectionBlock>

        {/* S05 Tab Bar */}
        <SectionBlock id="s05" num="04" title="Bottom Tab Bar">
          <div style={{ background: 'var(--color-encore-bg)', borderRadius: 8, overflow: 'hidden', maxWidth: 375 }}>
            <TabBar />
          </div>
        </SectionBlock>

        {/* S06 Horizontal Tabs */}
        <SectionBlock id="s06" num="05" title="Horizontal Tabs">
          <div className="flex flex-col gap-3" style={{ maxWidth: 375 }}>
            <Chip>2 tabs</Chip>
            <div style={{ background: 'var(--color-encore-bg)', borderRadius: 8, overflow: 'hidden' }}>
              <HorizontalTabs tabs={['参加済み', '参加予定']} defaultActive={1}>
                <div style={{ padding: 24, fontSize: 12, color: 'var(--color-encore-text-muted)', textAlign: 'center' }}>コンテンツエリア</div>
              </HorizontalTabs>
            </div>
            <Chip>4 tabs (scrollable)</Chip>
            <div style={{ background: 'var(--color-encore-bg)', borderRadius: 8, overflow: 'hidden' }}>
              <HorizontalTabs tabs={['セトリ', 'グッズ', 'フォト', 'メモ']}>
                <div style={{ padding: 24, fontSize: 12, color: 'var(--color-encore-text-muted)', textAlign: 'center' }}>コンテンツエリア</div>
              </HorizontalTabs>
            </div>
          </div>
        </SectionBlock>

        {/* S03 Buttons */}
        <SectionBlock id="s03" num="06" title="Buttons">
          <div className="flex flex-wrap gap-5 items-start">
            <div className="flex flex-col gap-3" style={{ flex: 1, minWidth: 240 }}>
              <Chip>Primary</Chip>
              <div style={{ background: 'var(--color-encore-bg)', borderRadius: 8, padding: 20 }}>
                <Button variant="primary">この内容で次へ</Button>
              </div>
              <Chip>Secondary / Outline</Chip>
              <div style={{ background: 'var(--color-encore-bg)', borderRadius: 8, padding: 20 }}>
                <Button variant="secondary">変更する</Button>
              </div>
              <Chip>Ghost</Chip>
              <div style={{ background: 'var(--color-encore-bg)', borderRadius: 8, padding: 20 }}>
                <Button variant="ghost">START AN ORDER</Button>
              </div>
            </div>
            <div className="flex flex-col gap-3" style={{ flex: 1, minWidth: 240 }}>
              <Chip>Disabled</Chip>
              <div style={{ background: 'var(--color-encore-bg)', borderRadius: 8, padding: 20 }}>
                <Button variant="disabled" disabled>OK</Button>
              </div>
              <Chip>Medium Buttons</Chip>
              <div style={{ background: 'var(--color-encore-bg)', borderRadius: 8, padding: '32px 20px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Button variant="sm-primary">詳細を見る</Button>
                <Button variant="sm-ghost">チケット購入</Button>
                <Button variant="sm-secondary">抽選に申込む</Button>
              </div>
              <Chip>Small Buttons</Chip>
              <div style={{ background: 'var(--color-encore-bg)', borderRadius: 8, padding: '41px 20px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Button variant="xs-primary">詳細</Button>
                <Button variant="xs-ghost">購入</Button>
                <Button variant="xs-secondary">抽選</Button>
              </div>
              <Chip>Button Stack</Chip>
              <div style={{ background: 'var(--color-encore-bg)', borderRadius: 8, padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Button variant="primary">チケットを購入</Button>
                <Button variant="secondary">変更する</Button>
              </div>
            </div>
          </div>
        </SectionBlock>

        {/* S27 FAB */}
        <SectionBlock id="s27" num="07" title="FAB">
          <div className="flex flex-wrap gap-5 items-start">
            <div>
              <Chip>Round</Chip>
              <div style={{ background: 'var(--color-encore-bg)', borderRadius: 8, padding: '28px 32px', marginTop: 6 }}>
                <FAB variant="default" />
              </div>
            </div>
            <div>
              <Chip>Extended</Chip>
              <div style={{ background: 'var(--color-encore-bg)', borderRadius: 8, padding: '28px 32px', marginTop: 6 }}>
                <FAB variant="extended" label="ライブを追加" />
              </div>
            </div>
          </div>
        </SectionBlock>

        {/* S08 Input Fields */}
        <SectionBlock id="s08" num="08" title="Input Fields">
          <div className="flex flex-wrap gap-5 items-start">
            <div style={{ flex: 1, minWidth: 280, maxWidth: 375 }}>
              <Chip>Profile Edit — with icons</Chip>
              <div style={{ background: 'var(--color-encore-bg)', borderRadius: 8, padding: '24px 20px', marginTop: 6 }}>
                <div style={{ fontSize: 13, color: '#1A3A2D', marginBottom: 20 }}>あなたのことを教えてください</div>
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
              <div style={{ background: 'var(--color-encore-bg)', borderRadius: 8, padding: '24px 20px', marginTop: 6 }}>
                <div style={{ fontSize: 13, fontWeight: 400, marginBottom: 16, color: 'var(--color-encore-green)' }}>何という名前で呼びますか？</div>
                <InputField label="ニックネーム" placeholder="ui pocket" defaultValue="ui pocket" icon={nicknameIcon} maxLength={20} showCounter />
              </div>
            </div>
          </div>
        </SectionBlock>

        {/* S29 Select */}
        <SectionBlock id="s29" num="09" title="Select">
          <div className="flex flex-wrap gap-5 items-start">
            <div style={{ flex: 1, minWidth: 280, maxWidth: 375 }}>
              <Chip>ライブタイプ選択</Chip>
              <div style={{ background: 'var(--color-encore-bg)', borderRadius: 8, padding: '20px', marginTop: 6 }}>
                <Select label="ライブタイプ" options={[
                  { value: 'wanman', label: 'ワンマン' },
                  { value: 'taiban', label: '対バン' },
                  { value: 'fes', label: 'フェス' },
                  { value: 'haishin', label: '配信' },
                  { value: 'stage', label: '舞台・公演' },
                  { value: 'media', label: 'メディア出演' },
                  { value: 'release', label: 'リリースイベント' },
                ]} />
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 280, maxWidth: 375 }}>
              <Chip>会場選択</Chip>
              <div style={{ background: 'var(--color-encore-bg)', borderRadius: 8, padding: '20px', marginTop: 6 }}>
                <Select label="会場" placeholder="会場を選択" options={[
                  { value: 'zepp_tokyo', label: 'Zepp Tokyo' },
                  { value: 'www', label: '渋谷WWW X' },
                  { value: 'makuhari', label: '幕張メッセ' },
                  { value: 'budokan', label: '日本武道館' },
                  { value: 'dome', label: '東京ドーム' },
                ]} />
              </div>
            </div>
          </div>
        </SectionBlock>

        {/* S11 Segmented Control */}
        <SectionBlock id="s11" num="10" title="Segmented Control">
          <div style={{ background: 'var(--color-encore-bg)', borderRadius: 8, overflow: 'hidden', maxWidth: 375 }}>
            <div style={{ padding: '16px 20px 4px', fontSize: 13, fontWeight: 400, color: 'var(--color-encore-green)' }}>このカードは何用ですか？</div>
            <SegmentedControl options={[
              { label: '個人用', icon: <User size={14} weight="light" /> },
              { label: 'ビジネス用', icon: <Buildings size={14} weight="light" /> },
              { label: 'その他', icon: <DotsThreeOutline size={14} weight="light" /> },
            ]} />
          </div>
        </SectionBlock>

        {/* S12 Search Bar */}
        <SectionBlock id="s12" num="11" title="Search Bar">
          <div style={{ background: 'var(--color-encore-bg)', borderRadius: 8, maxWidth: 375, padding: '8px 0' }}>
            <SearchBar suggestions={[
              'RADWIMPS LIVE TOUR 2026',
              'Vaundy ONE MAN TOUR',
              '優里 LIVE 2026',
              'King Gnu ARENA TOUR',
              'あいみょん ACOUSTIC LIVE',
              'back number TOUR',
              'Creepy Nuts LIVE',
            ]} />
          </div>
        </SectionBlock>

        {/* S20 Toggle */}
        <SectionBlock id="s20" num="12" title="Toggle Switch">
          <div style={{ background: 'var(--color-encore-bg)', borderRadius: 8, overflow: 'hidden', maxWidth: 375 }}>
            <div style={{ background: 'var(--color-encore-bg-section)', padding: '10px 20px', fontSize: 13, fontWeight: 400, color: 'var(--color-encore-text-sub)' }}>通知設定</div>
            <Toggle label="プッシュ通知" defaultChecked={true} />
            <div style={{ height: 1, background: 'var(--color-encore-border-light)', margin: '0 20px' }} />
            <Toggle label="メール通知" defaultChecked={false} />
            <div style={{ height: 1, background: 'var(--color-encore-border-light)', margin: '0 20px' }} />
            <Toggle label="SMS通知" defaultChecked={false} />
          </div>
        </SectionBlock>

        {/* S22 Qty Stepper */}
        <SectionBlock id="s22" num="13" title="Qty Stepper">
          <div style={{ background: 'var(--color-encore-bg)', borderRadius: 8, padding: '24px 20px', maxWidth: 375 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {([
                { name: 'アリーナ席', price: '¥12,000', defaultValue: 0 },
                { name: 'スタンド席', price: '¥8,800', defaultValue: 1 },
                { name: 'SS席', price: '¥15,000', defaultValue: 0 },
              ] as { name: string; price: string; defaultValue: number }[]).map((item, i, arr) => (
                <React.Fragment key={item.name}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 400, color: 'var(--color-encore-green)' }}>{item.name}</div>
                      <div style={{ fontSize: 13, color: 'var(--color-encore-text-sub)' }}>{item.price}</div>
                    </div>
                    <QuantityStepper defaultValue={item.defaultValue} min={0} />
                  </div>
                  {i < arr.length - 1 && <div style={{ height: 1, background: 'var(--color-encore-border-light)' }} />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </SectionBlock>

        {/* S31 Color Picker */}
        <SectionBlock id="s31" num="14" title="Color Picker">
          <div style={{ background: 'var(--color-encore-bg)', borderRadius: 8, padding: '24px 20px', maxWidth: 375 }}>
            <ColorPicker label="識別カラー" />
          </div>
        </SectionBlock>

        {/* S25 Live Card */}
        <SectionBlock id="s25" num="15" title="Live Card">
          <div className="flex flex-col gap-3" style={{ maxWidth: 375 }}>
            <Chip>ワンマン / 予定</Chip>
            <LiveCard date="2026-05-15" liveType="ワンマン" liveStatus="予定" name="somei TOUR 2026 -BLISS-" artist="somei" venue="Zepp Tokyo" time="Open 18:00 / Start 19:00" flyerImage="/liveimg/01.jpeg" flyerImagePosition="top" artistImage="/Artistimg/01.jpg" />
            <Chip>対バン / 抽選中</Chip>
            <LiveCard date="2026-04-03" liveType="対バン" liveStatus="抽選中" name="春の対バンナイト vol.7" artist="シユイ / 優利香 / yama" venue="渋谷WWW X" flyerImage="/liveimg/02.jpg" artistImage="/Artistimg/02.jpg" />
            <Chip>フェス / 当選</Chip>
            <LiveCard date="2026-08-11" liveType="フェス" liveStatus="当選" name="SUMMER SONIC 2026" artist="Ado / スーパー登山部 ほか" venue="幕張メッセ" time="Start 10:00" flyerImage="/liveimg/03.jpeg.webp" flyerImagePosition="top" artistImages={['/Artistimg/01.jpg', '/Artistimg/02.jpg', '/Artistimg/03.jpg', '/Artistimg/04.jpg']} />
            <Chip>配信 / 終了</Chip>
            <LiveCard date="2026-03-01" liveType="配信" liveStatus="終了" name="yama online live 2026" artist="yama" flyerImage="/liveimg/04.jpeg" flyerImagePosition="top" artistImage="/Artistimg/04.jpg" />
          </div>
        </SectionBlock>

        {/* S09 Product Cards */}
        <SectionBlock id="s09" num="16" title="Product Cards">
          <div className="flex flex-wrap gap-5 items-start">
            <div style={{ flex: 1, minWidth: 240, maxWidth: 320 }}>
              <Chip>Overlay Style</Chip>
              <div style={{ marginTop: 6 }}>
                <ProductCard
                  variant="overlay"
                  title="RADWIMPS LIVE 2026"
                  description="Zepp Tokyo・2026年3月20日(金)・18:00〜"
                  price="¥8,800"
                  badge="S席"
                  emoji="🎸"
                />
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 240, maxWidth: 320 }}>
              <Chip>Like Card</Chip>
              <div style={{ marginTop: 6 }}>
                <ProductCard
                  variant="like"
                  title="優里 ONE MAN TOUR"
                  description="東京ガーデンシアター・2026年4月5日(日)・17:00〜"
                  price="¥7,700"
                  emoji="🎤"
                />
              </div>
            </div>
          </div>
        </SectionBlock>

        {/* S26 Artist Card */}
        <SectionBlock id="s26" num="17" title="Artist Card">
          <div className="flex flex-wrap gap-5 items-start">
            <div style={{ flex: 1, minWidth: 280, maxWidth: 375 }}>
              <Chip>Artist Card</Chip>
              <div className="flex flex-col gap-2" style={{ marginTop: 6 }}>
                <ArtistCard name="somei" color="var(--color-encore-green)" image="/Artistimg/01.jpg" liveCount={8} nextLiveDate="5/15" />
                <ArtistCard name="シユイ" color="var(--color-encore-amber)" image="/Artistimg/02.jpg" liveCount={5} nextLiveDate="4/3" />
                <ArtistCard name="Ado" color="#7C3AED" image="/Artistimg/03.jpg" liveCount={2} />
                <ArtistCard name="yama" color="#0EA5E9" image="/Artistimg/04.jpg" liveCount={3} nextLiveDate="6/20" />
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 280 }}>
              <Chip>Artist Avatar — サイズバリアント</Chip>
              <div style={{ background: 'var(--color-encore-bg)', borderRadius: 8, padding: '24px 20px', marginTop: 6, display: 'flex', alignItems: 'center', gap: 20 }}>
                <ArtistAvatar name="somei" color="var(--color-encore-green)" size="sm" />
                <ArtistAvatar name="somei" color="var(--color-encore-green)" size="md" />
                <ArtistAvatar name="somei" color="var(--color-encore-green)" size="lg" />
              </div>
            </div>
          </div>
        </SectionBlock>

        {/* S07 List Rows */}
        <SectionBlock id="s07" num="18" title="List Rows">
          <div style={{ background: 'var(--color-encore-bg)', borderRadius: 8, overflow: 'hidden', maxWidth: 375 }}>
            <div style={{ background: 'var(--color-encore-bg-section)', padding: '10px 20px', fontSize: 13, fontWeight: 400, color: 'var(--color-encore-text-sub)' }}>アカウント</div>
            <ListRow icon={paymentIcon} label="お支払い" showChevron />
            <div style={{ borderTop: '1px solid var(--color-encore-border-light)' }}>
              <ListRow icon={profileIcon} label="プロフィール" showChevron />
            </div>
            <div style={{ borderTop: '1px solid var(--color-encore-border-light)' }}>
              <ListRow icon={promoIcon} label="プロモーション" showChevron />
            </div>
            <div style={{ background: 'var(--color-encore-bg-section)', padding: '10px 20px', fontSize: 13, fontWeight: 400, color: 'var(--color-encore-text-sub)' }}>サポート</div>
            <ListRow icon={historyIcon} label="設定" showChevron />
            <div style={{ borderTop: '1px solid var(--color-encore-border-light)' }}>
              <ListRow icon={helpIcon} label="ヘルプ" showChevron />
            </div>
          </div>
        </SectionBlock>

        {/* S10 Ingredient Selector */}
        <SectionBlock id="s10" num="19" title="Ingredient Selector">
          <div style={{ background: 'var(--color-encore-bg)', borderRadius: 8, overflow: 'hidden', maxWidth: 375 }}>
            <IngredientSelector title="ジャンル" description="ライブのジャンルを選択" ingredients={sampleIngredients1} />
            <IngredientSelector title="セトリメモ" description="印象に残った曲を記録しよう" ingredients={sampleIngredients2} />
            <div style={{ padding: '12px 20px 20px' }}>
              <Button variant="primary">この内容で次へ</Button>
            </div>
          </div>
        </SectionBlock>

        {/* S13 Store Card */}
        <SectionBlock id="s13" num="20" title="Store Card">
          <div style={{ maxWidth: 375 }}>
            <StoreCard />
          </div>
        </SectionBlock>

        {/* S14 Order Summary */}
        <SectionBlock id="s14" num="21" title="Order Summary">
          <div style={{ maxWidth: 375 }}>
            <div style={{ borderRadius: 8, overflow: 'hidden' }}>
              <StatusBar />
              <NavHeader title="ライブ詳細" variant="back" />
              <OrderSummary />
            </div>
          </div>
        </SectionBlock>

        {/* S15 Empty State */}
        <SectionBlock id="s15" num="22" title="Empty State">
          <div style={{ background: 'var(--color-encore-bg)', borderRadius: 8, overflow: 'hidden', maxWidth: 375 }}>
            <NavHeader title="HISTORY" titleEn variant="title-only" />
            <HorizontalTabs tabs={['参加済み', '参加予定']} defaultActive={1} />
            <EmptyState message="参加予定のライブはありません。" subMessage="気になるライブをチェックしてみよう！" />
            <TabBar />
          </div>
        </SectionBlock>

        {/* S16 Badges */}
        <SectionBlock id="s16" num="23" title="Badges & Tags">
          <div style={{ background: 'var(--color-encore-bg)', borderRadius: 8, padding: 28, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
            <Badge variant="green">FRIEND</Badge>
            <Badge variant="amber">NEW</Badge>
            <Badge variant="muted">受付終了</Badge>
            <Badge variant="outline">S席</Badge>
            <Badge variant="light-green">ARCHITECT</Badge>
          </div>
        </SectionBlock>

        {/* S28 Status Badge */}
        <SectionBlock id="s28" num="24" title="Status Badge">
          <div className="flex flex-col gap-5">
            <div>
              <Chip>Live Type</Chip>
              <div style={{ background: 'var(--color-encore-bg)', borderRadius: 8, padding: '20px 24px', marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {(['ワンマン', '対バン', 'フェス', '配信', '舞台・公演', 'メディア出演', 'リリースイベント'] as const).map(t => <LiveTypeBadge key={t} type={t} />)}
              </div>
            </div>
            <div>
              <Chip>Live Status</Chip>
              <div style={{ background: 'var(--color-encore-bg)', borderRadius: 8, padding: '20px 24px', marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {(['抽選中', '当選', '落選'] as const).map(s => <LiveStatusBadge key={s} status={s} />)}
              </div>
            </div>
          </div>
        </SectionBlock>

        {/* S18 Bottom Sheet */}
        <SectionBlock id="s18" num="25" title="Bottom Sheet">
          <div style={{ maxWidth: 375 }}>
            <Button variant="sm-secondary" onClick={() => setSheetOpen(true)}>▲ ボトムシートを開く</Button>
            <div style={{ marginTop: 16, background: 'rgba(0,0,0,0.35)', borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>背景コンテンツ</div>
              <div style={{ background: 'var(--color-encore-bg)', borderRadius: '24px 24px 0 0', padding: '0 20px 28px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0 24px' }}>
                  <div style={{ width: 36, height: 4, background: 'var(--color-encore-border)', borderRadius: 999 }} />
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, textAlign: 'center', marginBottom: 4, color: 'var(--color-encore-green)', fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif' }}>前回のライブ</div>
                <div style={{ fontSize: 12, color: 'var(--color-encore-text-sub)', textAlign: 'center', marginBottom: 24, fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif' }}>2026.3.1 | Zepp Tokyo</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <Button variant="primary">チケットを購入</Button>
                  <Button variant="secondary">変更する</Button>
                </div>
              </div>
            </div>
          </div>
          <BottomSheet
            isOpen={sheetOpen}
            onClose={() => setSheetOpen(false)}
            title="前回のライブ"
            subtitle="2026.3.1 | Zepp Tokyo"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Button variant="primary" onClick={() => setSheetOpen(false)}>チケットを購入</Button>
              <Button variant="secondary" onClick={() => setSheetOpen(false)}>変更する</Button>
            </div>
          </BottomSheet>
        </SectionBlock>

        {/* S19 Notification */}
        <SectionBlock id="s19" num="26" title="Notification Banner">
          <div style={{ maxWidth: 375, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span style={{ display: 'inline-block', fontFamily: 'var(--font-google-sans), sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-encore-text-muted)', padding: '3px 0' }}>Dismissible</span>
            <div style={{ background: 'var(--color-encore-bg)', borderRadius: 8, overflow: 'hidden' }}>
              <Notification key={notifKey} message="ログインが完了しました。さぁ、ライブ記録をはじめましょう！" icon={<Info size={18} weight="light" color="var(--color-encore-white)" />} />
              <div style={{ padding: '16px 20px', fontSize: 13, color: 'var(--color-encore-text-muted)' }}>ページコンテンツ</div>
            </div>
            <div style={{ alignSelf: 'flex-start' }}>
              <Button variant="sm-ghost" onClick={() => setNotifKey(k => k + 1)}>↺ リセット</Button>
            </div>
          </div>
        </SectionBlock>

        {/* S23 Tooltip Bubble */}
        <SectionBlock id="s23" num="27" title="Tooltip / Callout Bubble">
          <div style={{ background: 'var(--color-encore-bg)', borderRadius: 8, padding: '32px 20px', maxWidth: 375, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <TooltipBubble variant="tail-top">あと2曲セトリを追加できます</TooltipBubble>
            <TooltipBubble variant="chat-left">次のライブはいつですか？</TooltipBubble>
            <TooltipBubble variant="chat-right">いつもありがとうございます！</TooltipBubble>
          </div>
        </SectionBlock>

        {/* S17 Rank Progress */}
        <SectionBlock id="s17" num="28" title="Rank Progress">
          <div style={{ background: 'var(--color-encore-bg)', borderRadius: 8, overflow: 'hidden', maxWidth: 375 }}>
            <div style={{ textAlign: 'center', padding: '24px 20px 8px' }}>
              <div style={{ fontSize: 12, color: 'var(--color-encore-text-sub)' }}>あなたのランクは</div>
              <div style={{ fontFamily: 'var(--font-google-sans), sans-serif', fontSize: 32, fontWeight: 700, color: 'var(--color-encore-green)', margin: '6px 0' }}>FRIEND</div>
              <div style={{ fontSize: 12, color: 'var(--color-encore-text-sub)' }}>次のランクまであと2回！</div>
            </div>
            <RankProgress nodes={rankNodes} />
          </div>
        </SectionBlock>

        {/* S21 Credit Card */}
        <SectionBlock id="s21" num="29" title="Credit Card UI">
          <div style={{ background: 'var(--color-encore-bg)', borderRadius: 8, overflow: 'hidden', maxWidth: 375 }}>
            <NavHeader title="カードを登録" variant="close" />
            <div style={{ padding: 20 }}>
              <CreditCard
                cardNumber={ccNumber}
                expDisplay={ccMonth && ccYear ? `${ccMonth}/${ccYear}` : '月/年'}
              />
            </div>
            <div style={{ background: 'var(--color-encore-bg-section)', padding: '14px 20px', fontSize: 13, fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif', color: 'var(--color-encore-text-sub)' }}>
              クレジット・デビットカードの情報を入力してください
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ fontSize: 12, color: 'var(--color-encore-text-muted)', marginBottom: 10, fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif' }}>利用可能なカードブランド</div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
                {([{ label: 'AMEX', color: 'var(--color-encore-text-sub)' }, { label: 'DINERS', color: 'var(--color-encore-text-sub)' }, { label: 'DISCOVER', color: 'var(--color-encore-text-sub)' }, { label: 'JCB', color: '#0e4c96' }, { label: 'MC', color: '#eb001b' }, { label: 'VISA', color: '#1a1f71' }] as {label: string, color: string}[]).map(({ label, color }) => (
                  <div key={label} style={{ border: '1px solid var(--color-encore-border-light)', borderRadius: 6, padding: '4px 8px', fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-google-sans), sans-serif', color }}>{label}</div>
                ))}
              </div>
              {/* Card number input */}
              <InputField
                label="クレジットカード番号"
                placeholder="0000 0000 0000 0000"
                inputMode="numeric"
                value={ccNumber}
                maxLength={19}
                onChange={(v) => setCcNumber(v.replace(/\D/g, ''))}
              />
              {/* MM / YY inputs */}
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <InputField
                    label="月"
                    placeholder="MM"
                    inputMode="numeric"
                    value={ccMonth}
                    maxLength={2}
                    onChange={(v) => setCcMonth(v.replace(/\D/g, ''))}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <InputField
                    label="年"
                    placeholder="YY"
                    inputMode="numeric"
                    value={ccYear}
                    maxLength={2}
                    onChange={(v) => setCcYear(v.replace(/\D/g, ''))}
                  />
                </div>
              </div>
              <Button variant="primary">登録する</Button>
            </div>
          </div>
        </SectionBlock>

        {/* S24 Calendar */}
        <SectionBlock id="s24" num="30" title="Calendar">
          <div className="flex flex-wrap gap-5 items-start">
            <div style={{ flex: 1, minWidth: 320, maxWidth: 375 }}>
              <Chip>Month Calendar — ライブ記録つき</Chip>
              <div style={{ background: 'var(--color-encore-bg)', borderRadius: 8, overflow: 'hidden', marginTop: 6 }}>
                <Calendar />
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 320, maxWidth: 375 }}>
              <Chip>Reservation Picker — 時間スロットつき</Chip>
              <div style={{ background: 'var(--color-encore-bg)', borderRadius: 8, overflow: 'hidden', marginTop: 6 }}>
                <ReservationCalendar />
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 320, maxWidth: 375 }}>
              <Chip>Week Strip — コンパクト横スクロール</Chip>
              <div style={{ background: 'var(--color-encore-bg)', borderRadius: 8, overflow: 'hidden', marginTop: 6 }}>
                <WeekStrip />
              </div>
            </div>
          </div>
        </SectionBlock>

        {/* S30 Bar Chart */}
        <SectionBlock id="s30" num="31" title="Bar Chart">
          <div className="flex flex-wrap gap-5 items-start">
            <div style={{ flex: 1, minWidth: 280 }}>
              <Chip>Horizontal — アーティスト別</Chip>
              <div style={{ background: 'var(--color-encore-bg)', borderRadius: 8, padding: '24px 20px', marginTop: 6 }}>
                <BarChart orientation="horizontal" unit="回" data={[
                  { label: 'somei', value: 8, color: 'var(--color-encore-green)' },
                  { label: 'シユイ', value: 5, color: 'var(--color-encore-amber)' },
                  { label: '優利香', value: 4, color: '#0EA5E9' },
                  { label: 'Ado', value: 2, color: '#7C3AED' },
                ]} />
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 280 }}>
              <Chip>Vertical — 月別推移</Chip>
              <div style={{ background: 'var(--color-encore-bg)', borderRadius: 8, padding: '24px 20px', marginTop: 6 }}>
                <BarChart orientation="vertical" data={[
                  { label: '1月', value: 0 },
                  { label: '2月', value: 2 },
                  { label: '3月', value: 5 },
                  { label: '4月', value: 3 },
                  { label: '5月', value: 1 },
                  { label: '6月', value: 4 },
                ]} />
              </div>
            </div>
          </div>
        </SectionBlock>

      </main>
    </div>
  )
}
