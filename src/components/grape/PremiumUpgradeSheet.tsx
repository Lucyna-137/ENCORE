'use client'

import React from 'react'
import { Crown, X, UsersThree, ChartLineUp, Sparkle } from '@phosphor-icons/react'

// ─── Premium 特典リスト ──────────────────────────────────────────────────────
export const PREMIUM_FEATURES = [
  {
    icon: UsersThree,
    label: 'アーティスト無制限登録',
    desc: '好きなアーティストを何組でも登録できます',
  },
  {
    icon: Sparkle,
    label: 'URL/画像からイベント自動取り込み',
    desc: '公式サイトやチケットページのURLを貼るだけで、日時・会場・出演者を自動入力',
  },
  {
    icon: ChartLineUp,
    label: '詳細レポート・統計機能',
    desc: 'ライブ参加履歴をグラフで深く振り返れます',
  },
]

// ─── ダークパープル背景用カラー定数 ────────────────────────────────────────
const PUR = {
  bg:        '#1C0F42',
  card:      'rgba(255,255,255,0.08)',
  divider:   'rgba(255,255,255,0.09)',
  iconBg:    'rgba(245,200,80,0.16)',
  title:     '#FFFFFF',
  sub:       'rgba(255,255,255,0.58)',
  muted:     'rgba(255,255,255,0.32)',
  gold:      '#F5C850',
  btnBg:     'rgba(245,200,80,0.22)',
}

export default function PremiumUpgradeSheet({ onClose }: { onClose: () => void }) {
  return (
    /* フルカバー — スクロール可能なシート
       borderRadiusは親PhoneFrameの overflow:hidden による clipping に任せる */
    <div style={{
      position: 'absolute', inset: 0,
      background: PUR.bg,
      zIndex: 900,
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>

      {/* ── トップバー ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px 0',
        flexShrink: 0,
      }}>
        {/* × 閉じる */}
        <button
          onClick={onClose}
          style={{
            width: 32, height: 32, borderRadius: 999,
            background: 'rgba(255,255,255,0.12)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <X size={15} weight="bold" color="rgba(255,255,255,0.85)" />
        </button>

        {/* 購入を復元 */}
        <button
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
            fontSize: 12, fontWeight: 400,
            color: PUR.sub,
            padding: '6px 0',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          購入を復元
        </button>
      </div>

      {/* ── スクロールコンテンツ ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 0' }}>

        {/* クラウンアイコン */}
        <div style={{
          display: 'flex', justifyContent: 'center', marginBottom: 16,
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: PUR.iconBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Crown size={32} weight="fill" color={PUR.gold} />
          </div>
        </div>

        {/* タイトル・タグライン */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            fontFamily: 'var(--font-google-sans), sans-serif',
            fontSize: 22, fontWeight: 700,
            color: PUR.title,
            marginBottom: 6,
          }}>
            GRAPE Premium
          </div>
          <div style={{
            fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
            fontSize: 13, fontWeight: 400, lineHeight: 1.65,
            color: PUR.sub,
          }}>
            好きなアーティストと、もっと深く。<br />
            制限なしで全機能にアクセスしよう。
          </div>
        </div>

        {/* 機能リスト */}
        <div style={{
          background: PUR.card,
          borderRadius: 10, padding: '4px 16px',
          marginBottom: 20,
        }}>
          {PREMIUM_FEATURES.map(({ icon: Icon, label, desc }, i) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '12px 0',
              borderBottom: i < PREMIUM_FEATURES.length - 1
                ? `1px solid ${PUR.divider}`
                : 'none',
            }}>
              {/* アイコン */}
              <div style={{
                width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                background: PUR.iconBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={16} weight="regular" color={PUR.gold} />
              </div>
              {/* テキスト */}
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                  fontSize: 13, fontWeight: 700,
                  color: PUR.title,
                  marginBottom: 2,
                }}>{label}</div>
                <div style={{
                  fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                  fontSize: 11, fontWeight: 400,
                  color: PUR.sub,
                  lineHeight: 1.5,
                }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* 価格カード */}
        <div style={{
          background: PUR.card,
          borderRadius: 12, padding: '16px 18px',
          marginBottom: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
              fontSize: 13, fontWeight: 700,
              color: PUR.title,
              marginBottom: 3,
            }}>買い切り</div>
            <div style={{
              fontFamily: 'var(--font-google-sans), sans-serif',
              fontSize: 11, fontWeight: 400,
              color: PUR.sub,
            }}>リリース記念価格 · サブスクなし · 税込</div>
          </div>
          {/* 価格（打ち消し＋現在価格） */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
            <span style={{
              fontFamily: 'var(--font-google-sans), sans-serif',
              fontSize: 12, fontWeight: 400,
              color: PUR.muted,
              textDecoration: 'line-through',
            }}>¥980</span>
            <span style={{
              fontFamily: 'var(--font-google-sans), sans-serif',
              fontSize: 24, fontWeight: 700,
              color: PUR.gold,
            }}>¥480</span>
          </div>
        </div>

        {/* アップグレードボタン（準備中） */}
        <button
          disabled
          style={{
            width: '100%', padding: '15px 0', borderRadius: 12,
            background: PUR.btnBg,
            border: 'none', cursor: 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            marginBottom: 14,
          }}
        >
          <Crown size={15} weight="fill" color={PUR.gold} />
          <span style={{
            fontFamily: 'var(--font-google-sans), sans-serif',
            fontSize: 14, fontWeight: 700,
            color: PUR.gold,
          }}>
            アップグレード（準備中）
          </span>
        </button>

        {/* 利用規約・プライバシーポリシー */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 4,
          paddingBottom: 32,
        }}>
          <a href="/terms" style={{
            fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
            fontSize: 11, fontWeight: 400,
            color: PUR.muted, textDecoration: 'none',
          }}>利用規約</a>
          <span style={{ fontSize: 11, color: PUR.muted }}>·</span>
          <a href="/privacy" style={{
            fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
            fontSize: 11, fontWeight: 400,
            color: PUR.muted, textDecoration: 'none',
          }}>プライバシーポリシー</a>
        </div>

      </div>
    </div>
  )
}
