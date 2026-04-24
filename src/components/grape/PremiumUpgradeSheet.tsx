'use client'

import React from 'react'
import { Crown, X, UsersThree, ChartLineUp, Sparkle, Check, MusicNotes } from '@phosphor-icons/react'
import { useIsPremium } from '@/lib/grape/premium'
import { useGrapeToast } from '@/lib/grape/useGrapeToast'

// ─── Premium 特典リスト（LP コピーと統一）──────────────────────────────────
export const PREMIUM_FEATURES = [
  {
    icon: UsersThree,
    label: 'アーティスト無制限登録',
    desc: '何人推しても、Grape はすべて受け止める。',
  },
  {
    icon: Sparkle,
    label: 'URL / 画像からイベント自動取り込み',
    desc: '公式サイトやチケット販売URLを貼るだけ。AI がイベント情報を一瞬で埋める。',
  },
  {
    icon: MusicNotes,
    label: 'セットリスト記録',
    desc: 'あのライブで聴いた曲を、そのまま残す。うろ覚えでも OK。',
  },
  {
    icon: ChartLineUp,
    label: 'より高度な振り返りレポート機能',
    desc: 'アーティスト別・月別・累計。推し活の全貌を、すべての角度から。',
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
  const isPremium = useIsPremium()
  const { show: showToast } = useGrapeToast()

  // 「購入を復元」押下時のハンドラ。
  // 実際のストア課金連携（RevenueCat）は Capacitor 移行後に実装。
  // 現状はプレースホルダとして、トーストで「復元処理を試みた」ことを示す。
  const handleRestore = () => {
    // 既に Premium の場合: 確認トースト
    // Free の場合: 復元対象なしトースト
    if (isPremium) {
      showToast('Premium は既にご利用中です')
    } else {
      showToast('復元可能な購入が見つかりませんでした')
    }
  }

  return (
    /* フルカバー — スクロール可能なシート
       borderRadiusは親PhoneFrameの overflow:hidden による clipping に任せる */
    <div style={{
      position: 'fixed', inset: 0,
      background: PUR.bg,
      zIndex: 900,
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>

      {/* ── トップバー ──
          iOS PWA のノッチ/Dynamic Island に X と「購入を復元」が
          潜るのを防ぐため、safe-area-inset-top を加算。
          デスクトップ（env=0）では従来の 14px が維持される */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: 'calc(env(safe-area-inset-top) + 14px) 16px 0',
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

        {/* クラウンアイコン（Premium 時は ACTIVE バッジ付き）*/}
        <div style={{
          display: 'flex', justifyContent: 'center', marginBottom: 16,
          position: 'relative',
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: PUR.iconBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
          }}>
            <Crown size={32} weight="fill" color={PUR.gold} />
            {isPremium && (
              <div style={{
                position: 'absolute',
                bottom: -6, right: -10,
                background: PUR.gold,
                color: PUR.bg,
                fontFamily: 'var(--font-google-sans), sans-serif',
                fontSize: 10, fontWeight: 700,
                letterSpacing: '0.14em',
                padding: '2px 7px',
                borderRadius: 999,
                boxShadow: '0 4px 12px rgba(245,200,80,0.45)',
              }}>
                ACTIVE
              </div>
            )}
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
            {isPremium ? (
              <>Grape Premium<br />ご利用中</>
            ) : (
              'Grape Premium'
            )}
          </div>
          <div style={{
            fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
            fontSize: 14, fontWeight: 400, lineHeight: 1.65,
            color: PUR.sub,
          }}>
            {isPremium ? (
              <>すべての機能が、ご利用いただけます。</>
            ) : (
              <>好きなアーティストと、もっと深く。<br />制限なしで全機能にアクセスしよう。</>
            )}
          </div>
        </div>

        {/* 機能リスト（Premium 時はチェック ✓ マーク） */}
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
                {isPremium ? (
                  <Check size={17} weight="bold" color={PUR.gold} />
                ) : (
                  <Icon size={16} weight="regular" color={PUR.gold} />
                )}
              </div>
              {/* テキスト */}
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                  fontSize: 14, fontWeight: 700,
                  color: PUR.title,
                  marginBottom: 2,
                }}>{label}</div>
                <div style={{
                  fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                  fontSize: 10, fontWeight: 400,
                  color: PUR.sub,
                  lineHeight: 1.55,
                }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Premium: 感謝メッセージ ────────────── */}
        {isPremium && (
          <div style={{
            textAlign: 'center',
            padding: '16px 8px 8px',
            marginBottom: 14,
          }}>
            <div style={{
              fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
              fontSize: 12, fontWeight: 400, lineHeight: 1.8,
              color: PUR.sub,
            }}>
              いつも Grape をご利用いただき、<br />
              ありがとうございます。
            </div>
          </div>
        )}

        {/* ── Free: 価格カード + アップグレードボタン ───────────── */}
        {!isPremium && (
          <>
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
                  fontSize: 14, fontWeight: 700,
                  color: PUR.title,
                  marginBottom: 3,
                }}>買い切り</div>
                <div style={{
                  fontFamily: 'var(--font-google-sans), sans-serif',
                  fontSize: 12, fontWeight: 400,
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
          </>
        )}

        <div style={{ paddingBottom: 32 }} />

      </div>
    </div>
  )
}
