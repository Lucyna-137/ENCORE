'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { X, LinkSimple, MagnifyingGlass, Sparkle, CalendarBlank, MapPin, Clock, UserCircle, Ticket, Warning, UserCirclePlus, PencilSimple, type Icon } from '@phosphor-icons/react'
import * as ty from '@/components/encore/typographyStyles'
import type { GrapeLive, GrapeArtist, LiveTypeGrape, TicketStatus } from '@/lib/grape/types'

// ─── 解析レスポンス型 ────────────────────────────────────────────────────────
interface ExtractedEvent {
  title: string | null
  date: string | null
  openingTime: string | null
  startTime: string | null
  endTime: string | null
  venue: string | null
  artists: string[] | null
  price: number | null
  liveType: string | null
  memo: string | null
  ticketUrl: string | null
  saleStartDate: string | null
  saleStartTime: string | null
  sourceUrl: string
  coverImage?: string | null
  images?: string[] | null
}

type Stage = 'input' | 'loading' | 'preview' | 'error'

interface URLImportSheetProps {
  onClose: () => void
  /** 現在登録されているアーティスト一覧（未登録の出演者検出用） */
  artists: GrapeArtist[]
  /** 新規アーティスト登録用のコールバック */
  onAddArtist: (artist: GrapeArtist) => void
  /** 確認後に呼ばれ、QuickEventSheet をプリロードデータで開く側が担当 */
  onImport: (prefill: Partial<GrapeLive>) => void
}

export default function URLImportSheet({ onClose, onImport, artists, onAddArtist }: URLImportSheetProps) {
  const [stage, setStage] = useState<Stage>('input')
  const [url, setUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ExtractedEvent | null>(null)
  /** 未登録アーティストのうち、新規登録する/しない のチェック状態 */
  const [toRegister, setToRegister] = useState<Record<string, boolean>>({})

  // ─── 読み込み中の経過時間ベースのスピナーメッセージ ─────────────────
  const [loadingMessage, setLoadingMessage] = useState<string>('ページを読み込み中…')
  const loadingTimersRef = useRef<number[]>([])

  useEffect(() => {
    if (stage === 'loading') {
      // リセット
      setLoadingMessage('ページを読み込み中…')
      const timers = [
        window.setTimeout(() => setLoadingMessage('イベント情報を抽出中…'), 1500),
        window.setTimeout(() => setLoadingMessage('もう少しお待ちください…'), 5000),
        window.setTimeout(() => setLoadingMessage('公式サイトが重いようです…'), 10000),
      ]
      loadingTimersRef.current = timers
      return () => {
        timers.forEach(clearTimeout)
      }
    }
  }, [stage])

  // ─── 未登録アーティスト検出 ─────────────────────────────────────
  const unregisteredArtists = useMemo(() => {
    if (!result?.artists) return []
    // 登録済みの name / id（lowercase比較）
    const registeredSet = new Set(
      artists.flatMap(a => [a.name.toLowerCase(), a.id.toLowerCase()])
    )
    return result.artists.filter(name => !registeredSet.has(name.toLowerCase()))
  }, [result, artists])

  // 初期表示ではすべてチェック無し（ユーザが明示的に選択する）
  const initializeCheckboxes = (names: string[]) => {
    const init: Record<string, boolean> = {}
    names.forEach(n => { init[n] = false })
    setToRegister(init)
  }

  // すべて選択の状態
  const allChecked = unregisteredArtists.length > 0
    && unregisteredArtists.every(n => toRegister[n])
  const someChecked = unregisteredArtists.some(n => toRegister[n])

  const toggleAll = () => {
    const newValue = !allChecked
    setToRegister(prev => {
      const next = { ...prev }
      unregisteredArtists.forEach(n => { next[n] = newValue })
      return next
    })
  }

  const handleParse = async () => {
    if (!url.trim() || !/^https?:\/\//.test(url.trim())) {
      setError('https:// から始まる有効なURLを入力してください')
      setStage('error')
      return
    }

    setStage('loading')
    setError(null)

    try {
      const res = await fetch('/api/event-from-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? '解析に失敗しました')
        setStage('error')
        return
      }

      const event = data.event as ExtractedEvent
      setResult(event)
      // 未登録アーティストをチェック初期化
      if (event.artists) {
        const registeredSet = new Set(
          artists.flatMap(a => [a.name.toLowerCase(), a.id.toLowerCase()])
        )
        const unregistered = event.artists.filter(n => !registeredSet.has(n.toLowerCase()))
        initializeCheckboxes(unregistered)
      }
      setStage('preview')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ネットワークエラー')
      setStage('error')
    }
  }

  const handleConfirm = () => {
    if (!result) return

    // 未登録アーティストのうちチェックされたものを登録
    unregisteredArtists.forEach(name => {
      if (toRegister[name]) {
        const id = name.toLowerCase().replace(/\s+/g, '-')
        onAddArtist({ id, name })
      }
    })

    // ExtractedEvent → Partial<GrapeLive> に変換
    const liveType: LiveTypeGrape | undefined =
      ['ワンマン', '対バン', 'フェス', '配信', '舞台・公演', 'メディア出演', 'リリースイベント'].includes(
        result.liveType ?? ''
      )
        ? (result.liveType as LiveTypeGrape)
        : undefined

    // ── チケットURL: 解析抽出 > 元URL（常に何か入れておく） ──
    const ticketUrl = result.ticketUrl ?? result.sourceUrl

    // ── 販売開始日が未来ならticketStatusを before-sale に ──
    let ticketStatus: TicketStatus | undefined = undefined
    if (result.saleStartDate) {
      const timePart = result.saleStartTime ?? '00:00'
      const saleStart = new Date(`${result.saleStartDate}T${timePart}:00`)
      if (!Number.isNaN(saleStart.getTime()) && saleStart > new Date()) {
        ticketStatus = 'before-sale'
      }
    }

    const prefill: Partial<GrapeLive> = {
      title: result.title ?? '',
      date: result.date ?? '',
      openingTime: result.openingTime ?? undefined,
      startTime: result.startTime ?? '',
      endTime: result.endTime ?? undefined,
      venue: result.venue ?? '',
      artist: result.artists?.[0] ?? undefined,
      artists: result.artists && result.artists.length > 0 ? result.artists : undefined,
      liveType,
      attendanceStatus: 'candidate',
      ticketStatus,
      ticketUrl,
      saleStartDate: result.saleStartDate ?? undefined,
      saleStartTime: result.saleStartTime ?? undefined,
      price: result.price ?? undefined,
      memo: result.memo ?? undefined,
      coverImage: result.coverImage ?? undefined,
      images: result.images && result.images.length > 0 ? result.images : undefined,
    }

    onImport(prefill)
  }

  const GOLD = '#C08A4A'
  const PUR_GOLD = '#F5C850'

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'var(--color-encore-bg)',
      zIndex: 200,
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* ── ヘッダー ── */}
      <div style={{
        padding: '14px 20px 16px',
        flexShrink: 0,
        borderBottom: '1px solid var(--color-encore-border-light)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 999,
              background: 'var(--color-encore-bg-section)',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <X size={14} weight="bold" color="var(--color-encore-green)" />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sparkle size={13} weight="fill" color={GOLD} />
            <span style={{
              fontFamily: 'var(--font-google-sans), sans-serif',
              fontSize: 10, fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              color: GOLD,
            }}>PREMIUM</span>
          </div>
        </div>
        <div style={{
          fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
          fontSize: 22, fontWeight: 700,
          color: 'var(--color-encore-green)', lineHeight: 1.2,
        }}>
          URLから取り込む
        </div>
        <div style={{
          ...ty.body, color: 'var(--color-encore-text-sub)',
          marginTop: 4,
        }}>
          公式サイト・チケット販売ページ・告知ページのURLを貼り付け
        </div>
      </div>

      {/* ── コンテンツ ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>

        {/* URL入力 */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ ...ty.caption, display: 'block', marginBottom: 6, color: 'var(--color-encore-text-muted)' }}>
            イベントページのURL
          </label>
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
              pointerEvents: 'none', color: 'var(--color-encore-text-muted)',
            }}>
              <LinkSimple size={16} weight="regular" />
            </div>
            <input
              type="url"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setError(null) }}
              placeholder="https://x.com/... または https://..."
              disabled={stage === 'loading'}
              style={{
                width: '100%',
                padding: '12px 12px 12px 38px',
                fontSize: 14,
                fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                color: 'var(--color-encore-green)',
                background: 'var(--color-encore-bg-section)',
                border: '1px solid var(--color-encore-border-light)',
                borderRadius: 8,
                outline: 'none',
                WebkitTapHighlightColor: 'transparent',
              }}
            />
          </div>
        </div>

        {/* 解析ボタン */}
        <button
          onClick={handleParse}
          disabled={stage === 'loading' || !url.trim()}
          style={{
            width: '100%', padding: '12px 0', borderRadius: 10,
            background: stage === 'loading' || !url.trim()
              ? 'var(--color-encore-bg-section)'
              : 'var(--color-encore-green)',
            color: stage === 'loading' || !url.trim()
              ? 'var(--color-encore-text-muted)'
              : '#fff',
            border: 'none',
            fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
            fontSize: 14, fontWeight: 700,
            cursor: stage === 'loading' || !url.trim() ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            WebkitTapHighlightColor: 'transparent',
            marginBottom: 16,
          }}
        >
          {stage === 'loading' ? (
            <>
              <Spinner />
              <span>{loadingMessage}</span>
            </>
          ) : (
            <>
              <MagnifyingGlass size={15} weight="bold" />
              <span>イベント情報を取得</span>
            </>
          )}
        </button>

        {/* エラー */}
        {stage === 'error' && error && (
          <>
            <div style={{
              padding: '12px 14px', borderRadius: 8,
              background: 'rgba(192, 57, 43, 0.08)',
              border: '1px solid rgba(192, 57, 43, 0.3)',
              display: 'flex', alignItems: 'flex-start', gap: 10,
              marginBottom: 12,
            }}>
              <Warning size={16} weight="fill" color="var(--color-encore-error)" style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{
                ...ty.bodySM, color: 'var(--color-encore-error)', lineHeight: 1.55,
              }}>
                {error}
              </div>
            </div>
            <div style={{
              ...ty.bodySM,
              color: 'var(--color-encore-text-sub)',
              textAlign: 'center',
              margin: '4px 0 12px',
              lineHeight: 1.6,
            }}>
              公式サイトが混み合っているか、このページは自動取り込みに対応していない可能性があります。
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              <button
                onClick={() => {
                  // URLだけ保存して手動入力へ
                  onImport({
                    sourceUrl: url,
                    ticketUrl: url,
                    attendanceStatus: 'candidate',
                  } as Partial<GrapeLive>)
                }}
                style={{
                  width: '100%', padding: '12px 0', borderRadius: 10,
                  background: 'var(--color-encore-bg-section)',
                  color: 'var(--color-encore-green)',
                  border: 'none',
                  fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                  fontSize: 13, fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <PencilSimple size={14} weight="regular" />
                URLだけ保存して手動で入力
              </button>
              <button
                onClick={() => { setStage('input'); setError(null) }}
                style={{
                  width: '100%', padding: '10px 0',
                  background: 'none', border: 'none',
                  color: 'var(--color-encore-text-sub)',
                  fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                  fontSize: 12,
                  cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                もう一度試す
              </button>
            </div>
          </>
        )}

        {/* プレビュー */}
        {stage === 'preview' && result && (
          <>
            <div style={{
              ...ty.caption, color: 'var(--color-encore-text-muted)',
              marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <Sparkle size={11} weight="fill" color={GOLD} />
              解析結果（確認して編集できます）
            </div>

            {/* 情報不足時の警告バナー（主要3項目以上 null の時） */}
            {(() => {
              const missing = [
                !result.title, !result.date, !result.venue,
                !result.artists || result.artists.length === 0,
                !result.startTime,
              ].filter(Boolean).length
              if (missing < 3) return null
              return (
                <div style={{
                  padding: '10px 12px', borderRadius: 8,
                  background: 'rgba(192, 138, 74, 0.10)',
                  border: '1px solid rgba(192, 138, 74, 0.28)',
                  display: 'flex', alignItems: 'flex-start', gap: 8,
                  marginBottom: 12,
                }}>
                  <Warning size={14} weight="fill" color="var(--color-encore-amber)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div style={{
                    ...ty.bodySM,
                    color: 'var(--color-encore-green)',
                    lineHeight: 1.55,
                  }}>
                    情報が少ないようです。次の画面で手動入力も併用してください。
                  </div>
                </div>
              )
            })()}

            {/* カバー画像プレビュー */}
            {result.coverImage && (
              <div style={{
                width: '100%', aspectRatio: '16 / 9',
                borderRadius: 10, overflow: 'hidden',
                background: 'var(--color-encore-bg-section)',
                marginBottom: 10,
              }}>
                <img
                  src={result.coverImage}
                  alt="イベント画像"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
            )}

            {/* 追加画像（X複数投稿対応） */}
            {result.images && result.images.length > 0 && (
              <div style={{ display: 'flex', gap: 6, marginBottom: 14, overflowX: 'auto' }}>
                {result.images.map((img, i) => (
                  <div key={i} style={{
                    flexShrink: 0,
                    width: 72, height: 72,
                    borderRadius: 8, overflow: 'hidden',
                    background: 'var(--color-encore-bg-section)',
                  }}>
                    <img
                      src={img}
                      alt={`追加画像${i + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* 取得項目リスト */}
            <div style={{
              background: 'var(--color-encore-bg-section)',
              borderRadius: 10, padding: '4px 14px',
              marginBottom: 20,
            }}>
              <PreviewRow icon={Ticket} label="イベント名" value={result.title} />
              <PreviewRow icon={CalendarBlank} label="日付" value={result.date} />
              <PreviewRow icon={Clock} label="時間"
                value={
                  [result.openingTime && `開場 ${result.openingTime}`, result.startTime && `開演 ${result.startTime}`, result.endTime && `終演 ${result.endTime}`]
                    .filter(Boolean)
                    .join(' / ') || null
                }
              />
              <PreviewRow icon={MapPin} label="会場" value={result.venue} />
              <PreviewRow
                icon={UserCircle}
                label="出演"
                value={result.artists && result.artists.length > 0 ? result.artists.join(' / ') : null}
              />
              {result.liveType && <PreviewRow icon={Sparkle} label="種別" value={result.liveType} />}
              {result.price !== null && result.price !== undefined && (
                <PreviewRow icon={Ticket} label="料金" value={`¥${result.price.toLocaleString()}`} />
              )}
              {(result.saleStartDate || result.saleStartTime) && (
                <PreviewRow
                  icon={CalendarBlank}
                  label="チケット販売開始"
                  value={[result.saleStartDate, result.saleStartTime].filter(Boolean).join(' ') || null}
                />
              )}
              {result.ticketUrl && (
                <PreviewRow icon={LinkSimple} label="チケット購入" value={result.ticketUrl} />
              )}
            </div>

            {/* 未登録アーティスト登録セクション */}
            {unregisteredArtists.length > 0 && (
              <div style={{
                background: 'rgba(192, 138, 74, 0.08)',
                border: '1px solid rgba(192, 138, 74, 0.24)',
                borderRadius: 10,
                padding: '14px 16px',
                marginBottom: 20,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <UserCirclePlus size={16} weight="regular" color="var(--color-encore-amber)" />
                  <span style={{
                    ...ty.section,
                    color: 'var(--color-encore-green)',
                    fontSize: 13,
                  }}>
                    未登録のアーティスト{unregisteredArtists.length}組
                  </span>
                </div>
                <div style={{
                  ...ty.bodySM,
                  color: 'var(--color-encore-text-sub)',
                  marginBottom: 10,
                  lineHeight: 1.5,
                }}>
                  チェックを入れると、今後の推し活管理のためにアーティストとして一緒に登録します。
                </div>

                {/* すべて選択 */}
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 0',
                  cursor: 'pointer',
                  borderBottom: '1px solid rgba(192, 138, 74, 0.24)',
                  marginBottom: 2,
                  WebkitTapHighlightColor: 'transparent',
                }}>
                  <input
                    type="checkbox"
                    checked={allChecked}
                    ref={(el) => {
                      if (el) el.indeterminate = !allChecked && someChecked
                    }}
                    onChange={toggleAll}
                    style={{
                      width: 18, height: 18,
                      accentColor: 'var(--color-encore-amber)',
                      cursor: 'pointer',
                    }}
                  />
                  <span style={{
                    ...ty.bodySM,
                    color: 'var(--color-encore-text-sub)',
                    fontWeight: 700,
                  }}>
                    すべて選択
                  </span>
                </label>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {unregisteredArtists.map(name => (
                    <label
                      key={name}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '8px 0',
                        cursor: 'pointer',
                        WebkitTapHighlightColor: 'transparent',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={toRegister[name] ?? false}
                        onChange={(e) => {
                          setToRegister(prev => ({ ...prev, [name]: e.target.checked }))
                        }}
                        style={{
                          width: 18, height: 18,
                          accentColor: 'var(--color-encore-amber)',
                          cursor: 'pointer',
                        }}
                      />
                      <span style={{
                        ...ty.body,
                        color: 'var(--color-encore-green)',
                        fontWeight: 700,
                      }}>
                        {name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* 確認ボタン */}
            <button
              onClick={handleConfirm}
              style={{
                width: '100%', padding: '13px 0', borderRadius: 10,
                background: 'var(--color-encore-green)',
                color: '#fff', border: 'none',
                fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                fontSize: 14, fontWeight: 700,
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              この内容で詳細を編集
            </button>
            <div style={{
              ...ty.caption, color: 'var(--color-encore-text-muted)',
              textAlign: 'center', marginTop: 8,
            }}>
              次の画面で修正・保存できます
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── サブコンポーネント ─────────────────────────────────────────────────
function PreviewRow({
  icon: IconComp,
  label,
  value,
}: {
  icon: Icon
  label: string
  value: string | null | undefined
}) {
  const hasValue = value !== null && value !== undefined && value !== ''
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 10,
      padding: '10px 0',
      borderBottom: '1px solid var(--color-encore-border-light)',
    }}>
      <IconComp size={14} weight="regular" color="var(--color-encore-text-muted)" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ ...ty.caption, color: 'var(--color-encore-text-muted)', marginBottom: 2 }}>
          {label}
        </div>
        <div style={{
          ...ty.body,
          color: hasValue ? 'var(--color-encore-green)' : 'var(--color-encore-text-muted)',
          fontStyle: hasValue ? 'normal' : 'italic',
          wordBreak: 'break-word',
        }}>
          {hasValue ? value : '— 取得できず（手動入力できます）'}
        </div>
      </div>
    </div>
  )
}

function Spinner() {
  return (
    <span style={{
      width: 14, height: 14,
      border: '2px solid rgba(255,255,255,0.3)',
      borderTopColor: '#fff',
      borderRadius: '50%',
      animation: 'grape-spin 0.8s linear infinite',
      display: 'inline-block',
    }} />
  )
}
