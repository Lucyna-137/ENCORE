'use client'

/**
 * SetlistEditorSheet — セットリスト編集画面（Phase 1 Day 2-3 · 手動入力）
 *
 * 機能:
 *   - 曲・MC・ENCORE 区切りを追加 / 削除
 *   - **ドラッグで並び替え**（Pointer Events 自前実装、モック準拠）
 *     - ≡（DotsSixVertical）ハンドルを掴んで上下にドラッグ
 *     - ドラッグ中: translateY + rotate(-0.8deg) + shadow + white bg + borderRadius 10
 *     - スロット跨ぎ: Math.round(dy / avgRowHeight) で検出 → splice で配列再配置
 *   - 曲名・MC メモはインライン <input> で編集
 *   - 「うろ覚えで記録する」トグル
 *   - 保存 → useSetlistStore.saveSetlist()
 *   - 破棄（isDirty 時は確認）
 *
 * スコープ外（Day 3 以降）:
 *   - OCR 取り込み（画像から自動抽出）
 *   - 対バン時のアーティストセグメント
 *   - アートワーク自動マッチ（iTunes Search API）— 現状はプレースホルダ
 */

import React, { useEffect, useRef, useState, useCallback } from 'react'
import {
  X, Plus, Trash, MusicNotes, Microphone, DotsSixVertical,
} from '@phosphor-icons/react'
import * as ty from '@/components/encore/typographyStyles'
import type { GrapeLive, SetlistItem } from '@/lib/grape/types'
import { useSetlistStore } from '@/lib/grape/useSetlistStore'
import { normalizeSong } from '@/lib/grape/normalizeSong'
import { useGrapeToast } from '@/lib/grape/useGrapeToast'

interface SetlistEditorSheetProps {
  live: GrapeLive
  isOpen: boolean
  onClose: () => void
  /** 保存完了時（トースト表示等に使う）*/
  onSaved?: () => void
}

// ─── Drag state ─────────────────────────────────────────────────────────
type DragState = {
  /** 掴んだ瞬間の items 上の index */
  originalIndex: number
  /** 現在の items 上の index（swap で更新される） */
  currentIndex: number
  /** pointerdown 時のクライアント Y 座標 */
  startY: number
  /** 現在のクライアント Y 座標 */
  pointerY: number
  /** 行の平均高さ（slot 判定用） */
  avgH: number
  /** ドラッグ中のポインタ ID */
  pointerId: number
}

// squircle path（アートワークプレースホルダ用、k=0.65）
function squirclePath(s: number) {
  const r = s / 2
  const k = r * 0.65
  return `M ${s} ${r} C ${s} ${r + k} ${r + k} ${s} ${r} ${s} C ${r - k} ${s} 0 ${r + k} 0 ${r} C 0 ${r - k} ${r - k} 0 ${r} 0 C ${r + k} 0 ${s} ${r - k} ${s} ${r} Z`
}

export default function SetlistEditorSheet({ live, isOpen, onClose, onSaved }: SetlistEditorSheetProps) {
  const { getSetlist, saveSetlist, ready } = useSetlistStore()

  // ─── ローカル編集 state ───────────────────────────────────────────────
  const [items, setItems] = useState<SetlistItem[]>([])
  const { show: showToast } = useGrapeToast()
  const [approximate, setApproximate] = useState(false)
  const [initialSnapshot, setInitialSnapshot] = useState<string>('')
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false)
  const [dragState, setDragState] = useState<DragState | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // ─── Sheet オープン時に store から読み込む ──────────────────────────
  useEffect(() => {
    if (!isOpen || !ready) return
    const existing = getSetlist(live.id)
    const loadedItems = existing?.items ?? []
    const loadedApprox = existing?.approximate ?? false
    setItems(loadedItems)
    setApproximate(loadedApprox)
    setInitialSnapshot(JSON.stringify({ items: loadedItems, approximate: loadedApprox }))
  }, [isOpen, ready, live.id, getSetlist])

  const currentSnapshot = JSON.stringify({ items, approximate })
  const isDirty = currentSnapshot !== initialSnapshot

  // ─── アイテム操作 ─────────────────────────────────────────────────────
  const addSong = () => {
    setItems(prev => [...prev, { kind: 'song', title: '', titleNormalized: '' }])
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    })
  }

  const addMC = () => {
    setItems(prev => [...prev, { kind: 'mc' }])
  }

  const addEncoreDivider = () => {
    const hasEncore = items.some(i => i.kind === 'divider' && i.label === 'ENCORE')
    const label = hasEncore ? 'DOUBLE ENCORE' : 'ENCORE'
    setItems(prev => [...prev, { kind: 'divider', label }])
  }

  const removeItem = (index: number) => {
    const item = items[index]
    const prevItems = items
    setItems(prev => prev.filter((_, i) => i !== index))
    // UNDO トースト: 種別ごとのラベル
    const label = item?.kind === 'song' && item.title ? `「${item.title}」`
      : item?.kind === 'mc' ? 'MC'
      : item?.kind === 'divider' ? `「${item.label}」区切り`
      : 'アイテム'
    showToast(`${label}を削除しました`, {
      action: {
        label: '元に戻す',
        onClick: () => setItems(prevItems),
      },
    })
  }

  const editSongTitle = (index: number, title: string) => {
    setItems(prev => prev.map((item, i) => {
      if (i !== index || item.kind !== 'song') return item
      return { ...item, title, titleNormalized: normalizeSong(title) }
    }))
  }

  const editMCNote = (index: number, note: string) => {
    setItems(prev => prev.map((item, i) => {
      if (i !== index || item.kind !== 'mc') return item
      return { ...item, note: note || undefined }
    }))
  }

  // ─── ドラッグ並び替え ───────────────────────────────────────────────
  const handleDragStart = useCallback((e: React.PointerEvent, index: number) => {
    if (!listRef.current) return
    e.preventDefault()
    e.stopPropagation()

    // ハンドル要素がポインタキャプチャを取得
    const handle = e.currentTarget as HTMLElement
    handle.setPointerCapture(e.pointerId)

    // 全行の高さを measure → 平均高さを slot 判定閾値に使う
    const rows = listRef.current.querySelectorAll<HTMLElement>('[data-sortable-row="true"]')
    let totalH = 0
    rows.forEach(r => { totalH += r.getBoundingClientRect().height })
    const avgH = rows.length > 0 ? totalH / rows.length : 48

    setDragState({
      originalIndex: index,
      currentIndex: index,
      startY: e.clientY,
      pointerY: e.clientY,
      avgH,
      pointerId: e.pointerId,
    })
  }, [])

  const handleDragMove = useCallback((e: React.PointerEvent) => {
    if (!dragState || e.pointerId !== dragState.pointerId) return

    const pointerY = e.clientY
    const dy = pointerY - dragState.startY
    const slotsMoved = Math.round(dy / dragState.avgH)
    const itemsLen = items.length
    const newIndex = Math.max(0, Math.min(itemsLen - 1, dragState.originalIndex + slotsMoved))

    if (newIndex !== dragState.currentIndex) {
      // items を並び替え: currentIndex の要素を newIndex へ移動
      setItems(prev => {
        const next = [...prev]
        const [moved] = next.splice(dragState.currentIndex, 1)
        next.splice(newIndex, 0, moved)
        return next
      })
      setDragState(ds => ds ? { ...ds, currentIndex: newIndex, pointerY } : null)
    } else {
      setDragState(ds => ds ? { ...ds, pointerY } : null)
    }
  }, [dragState, items.length])

  const handleDragEnd = useCallback((e: React.PointerEvent) => {
    if (!dragState || e.pointerId !== dragState.pointerId) return
    const handle = e.currentTarget as HTMLElement
    try { handle.releasePointerCapture(e.pointerId) } catch {}
    setDragState(null)
  }, [dragState])

  // ─── 保存 ─────────────────────────────────────────────────────────────
  const handleSave = () => {
    const cleaned = items.filter(i => i.kind !== 'song' || i.title.trim().length > 0)
    saveSetlist(live.id, cleaned, { approximate })
    onSaved?.()
    onClose()
  }

  const handleClose = () => {
    if (isDirty) {
      setShowDiscardConfirm(true)
    } else {
      onClose()
    }
  }

  const handleDiscard = () => {
    setShowDiscardConfirm(false)
    onClose()
  }

  // ─── 曲番号計算 ───────────────────────────────────────────────────────
  let songCounter = 0
  const numberedItems = items.map(item => {
    if (item.kind === 'song') {
      songCounter += 1
      return { item, songNumber: songCounter }
    }
    return { item, songNumber: null as number | null }
  })

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        background: 'var(--color-encore-bg)',
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* ── ヘッダー（iOS status bar / ノッチ safe area 対応）── */}
      <div style={{
        /* env() は Web 環境で 0 を返すためフォールバックが発動しない。
           max() で「44px（iOS 時刻領域相当）か env() の大きい方」+ 8px を確保。
           iOS Capacitor 時は env() が実機値（最大 59px 等）を返すため自動で適切な余白に。*/
        paddingTop: 'calc(max(env(safe-area-inset-top), 44px) + 8px)',
        paddingLeft: 16,
        paddingRight: 16,
        paddingBottom: 14,
        borderBottom: '1px solid var(--color-encore-border-light)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <button
            onClick={handleClose}
            aria-label="閉じる"
            style={{
              width: 32, height: 32, borderRadius: 999,
              background: 'var(--color-encore-bg-section)',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <X size={15} weight="bold" color="var(--color-encore-green)" />
          </button>
          <button
            onClick={handleSave}
            disabled={!isDirty}
            style={{
              padding: '8px 18px',
              borderRadius: 999,
              background: isDirty ? 'var(--color-encore-green)' : 'var(--color-encore-border)',
              color: 'white',
              border: 'none',
              cursor: isDirty ? 'pointer' : 'default',
              fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
              fontSize: 14, fontWeight: 700,
              WebkitTapHighlightColor: 'transparent',
              opacity: isDirty ? 1 : 0.6,
            }}
          >
            保存
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 9 }}>
          <span style={{ ...ty.title, fontSize: 22, letterSpacing: '-0.01em' }}>Setlist</span>
          <span style={{ ...ty.bodySM, color: 'var(--color-encore-text-sub)' }}>
            セットリスト
          </span>
        </div>
        <div style={{
          ...ty.caption,
          color: 'var(--color-encore-text-muted)',
          marginTop: 2,
          letterSpacing: '0.02em',
        }}>
          {formatDateShort(live.date)} · {live.venue}
        </div>
      </div>

      {/* ── スクロールエリア（行リスト）────────────────── */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto' }}>
        {items.length === 0 ? (
          <EmptyHint onAddSong={addSong} />
        ) : (
          <div ref={listRef} style={{ padding: '4px 0 12px' }}>
            {numberedItems.map(({ item, songNumber }, index) => {
              const isDragging = dragState?.currentIndex === index
              const translateY = isDragging && dragState
                ? (dragState.pointerY - dragState.startY) - (dragState.currentIndex - dragState.originalIndex) * dragState.avgH
                : 0
              return (
                <Row
                  key={index}
                  item={item}
                  index={index}
                  songNumber={songNumber}
                  isDragging={!!isDragging}
                  translateY={translateY}
                  onRemove={() => removeItem(index)}
                  onEditSongTitle={(title) => editSongTitle(index, title)}
                  onEditMCNote={(note) => editMCNote(index, note)}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragMove={handleDragMove}
                  onDragEnd={handleDragEnd}
                />
              )
            })}
          </div>
        )}

        {/* ── アクション: 追加ボタン群 ───────────────── */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 8,
          padding: '4px 16px 16px',
        }}>
          <ActionButton icon={<Plus size={14} weight="bold" />} label="曲を追加" onClick={addSong} primary />
          <div style={{ display: 'flex', gap: 8 }}>
            <ActionButton icon={<Microphone size={13} weight="regular" />} label="MC" onClick={addMC} />
            <ActionButton icon={<Plus size={12} weight="bold" />} label="ENCORE 区切り" onClick={addEncoreDivider} />
          </div>
        </div>

        {/* ── うろ覚えトグル ───────────────────────────── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 16px',
          margin: '4px 16px 16px',
          borderRadius: 8,
          background: 'var(--color-encore-bg-section)',
        }}>
          <div>
            <div style={{ ...ty.bodySM, fontWeight: 700 }}>
              うろ覚えで記録する
            </div>
            <div style={{ ...ty.caption, color: 'var(--color-encore-text-muted)', marginTop: 2 }}>
              曲順が不完全でも OK
            </div>
          </div>
          <Toggle checked={approximate} onChange={setApproximate} />
        </div>
      </div>

      {/* ── 破棄確認ダイアログ ───────────────────────── */}
      {showDiscardConfirm && (
        <DiscardConfirm
          onKeep={() => setShowDiscardConfirm(false)}
          onDiscard={handleDiscard}
        />
      )}
    </div>
  )
}

// ─── 行コンポーネント ──────────────────────────────────────────────────────

function Row({
  item, index, songNumber,
  isDragging, translateY,
  onRemove,
  onEditSongTitle, onEditMCNote,
  onDragStart, onDragMove, onDragEnd,
}: {
  item: SetlistItem
  index: number
  songNumber: number | null
  isDragging: boolean
  translateY: number
  onRemove: () => void
  onEditSongTitle: (title: string) => void
  onEditMCNote: (note: string) => void
  onDragStart: (e: React.PointerEvent) => void
  onDragMove: (e: React.PointerEvent) => void
  onDragEnd: (e: React.PointerEvent) => void
}) {
  // ドラッグ中の共通スタイル
  const dragStyle: React.CSSProperties = isDragging
    ? {
        background: 'var(--color-encore-white)',
        borderRadius: 10,
        boxShadow: '0 10px 28px rgba(26,58,45,0.18), 0 0 0 1px rgba(26,58,45,0.05)',
        transform: `translateY(${translateY}px) rotate(-0.8deg)`,
        zIndex: 10,
        position: 'relative' as const,
      }
    : {
        transition: 'transform 160ms ease, background 160ms ease',
      }

  if (item.kind === 'divider') {
    return (
      <div
        data-sortable-row="true"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 12px 10px 16px',
          ...dragStyle,
        }}
      >
        <DotLeader />
        <span style={{
          fontFamily: 'var(--font-google-sans), sans-serif',
          fontSize: 12, fontWeight: 700,
          color: 'var(--color-encore-amber)',
          letterSpacing: '0.24em',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}>
          {item.label}
        </span>
        <DotLeader />
        <RowActions
          isDragging={isDragging}
          onRemove={onRemove}
          onDragStart={onDragStart}
          onDragMove={onDragMove}
          onDragEnd={onDragEnd}
        />
      </div>
    )
  }

  if (item.kind === 'mc') {
    return (
      <div
        data-sortable-row="true"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 12px 8px 16px',
          ...dragStyle,
        }}
      >
        <span style={{
          fontFamily: 'var(--font-google-sans), sans-serif',
          fontSize: 12, fontWeight: 700,
          color: 'var(--color-encore-text-sub)',
          letterSpacing: '0.2em',
          flexShrink: 0,
          width: 24,
          textAlign: 'center',
        }}>
          MC
        </span>
        <input
          type="text"
          value={item.note ?? ''}
          onChange={(e) => onEditMCNote(e.target.value)}
          placeholder="MC のメモ（任意）"
          className="grape-setlist-input"
          style={{
            flex: 1,
            padding: '8px 10px',
            border: '1px solid transparent',
            borderRadius: 6,
            background: 'transparent',
            fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
            fontSize: 12,
            color: 'var(--color-encore-green)',
            outline: 'none',
          }}
        />
        <RowActions
          isDragging={isDragging}
          onRemove={onRemove}
          onDragStart={onDragStart}
          onDragMove={onDragMove}
          onDragEnd={onDragEnd}
        />
      </div>
    )
  }

  // song
  return (
    <div
      data-sortable-row="true"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '8px 12px 8px 16px',
        ...dragStyle,
      }}
    >
      {/* 曲番号（タビュラー・大きめ） */}
      <div
        style={{
          width: 22,
          flexShrink: 0,
          textAlign: 'right',
          fontFamily: 'var(--font-google-sans), sans-serif',
          fontSize: 18,
          fontWeight: 700,
          color: 'var(--color-encore-green)',
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '-0.02em',
          lineHeight: 1,
        }}
      >
        {songNumber}
      </div>

      {/* アートワークプレースホルダ（Phase 4 で実アートワークに差替） */}
      <div
        style={{
          width: 44, height: 44,
          clipPath: `path("${squirclePath(44)}")`,
          background: 'var(--color-encore-bg-section)',
          flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--color-encore-text-muted)',
        }}
      >
        <MusicNotes size={18} weight="regular" />
      </div>

      {/* タイトル入力（クリック/フォーカスでテキストフィールド化） */}
      <input
        type="text"
        value={item.title}
        onChange={(e) => onEditSongTitle(e.target.value)}
        placeholder="曲名を入力"
        autoFocus={item.title === ''}
        className="grape-setlist-input"
        style={{
          flex: 1,
          padding: '8px 10px',
          border: '1px solid transparent',
          borderRadius: 6,
          background: 'transparent',
          fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
          fontSize: 14, fontWeight: 700,
          color: 'var(--color-encore-green)',
          outline: 'none',
          minWidth: 0,
          cursor: 'text',
        }}
        onFocus={(e) => e.target.select()}
      />

      <RowActions
        isDragging={isDragging}
        onRemove={onRemove}
        onDragStart={onDragStart}
        onDragMove={onDragMove}
        onDragEnd={onDragEnd}
      />
    </div>
  )
}

// ─── 行末トレイリング: 削除 + ドラッグハンドル（全行共通、X 座標揃え）─
function RowActions({
  isDragging, onRemove, onDragStart, onDragMove, onDragEnd,
}: {
  isDragging: boolean
  onRemove: () => void
  onDragStart: (e: React.PointerEvent) => void
  onDragMove: (e: React.PointerEvent) => void
  onDragEnd: (e: React.PointerEvent) => void
}) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      flexShrink: 0,
      marginLeft: 4,
    }}>
      {!isDragging && <DeleteBtn onClick={onRemove} />}
      <DragHandle onPointerDown={onDragStart} onPointerMove={onDragMove} onPointerUp={onDragEnd} onPointerCancel={onDragEnd} />
    </div>
  )
}

// ─── ドラッグハンドル ────────────────────────────────────────────────────
function DragHandle(props: {
  onPointerDown: (e: React.PointerEvent) => void
  onPointerMove: (e: React.PointerEvent) => void
  onPointerUp: (e: React.PointerEvent) => void
  onPointerCancel: (e: React.PointerEvent) => void
}) {
  return (
    <div
      {...props}
      aria-label="ドラッグで並び替え"
      style={{
        flexShrink: 0,
        padding: 4,
        cursor: 'grab',
        touchAction: 'none',
        color: 'var(--color-encore-text-muted)',
        display: 'flex', alignItems: 'center',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <DotsSixVertical size={18} weight="bold" />
    </div>
  )
}

// ─── 削除ボタン ─────────────────────────────────────────────────────────
function DeleteBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="削除"
      style={{
        width: 28, height: 28,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 999,
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        color: 'var(--color-encore-error)',
        flexShrink: 0,
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <Trash size={14} weight="regular" />
    </button>
  )
}

// ─── 追加ボタン ──────────────────────────────────────────────────────────

function ActionButton({
  icon, label, onClick, primary,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  primary?: boolean
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 6, padding: '10px 14px',
        borderRadius: 999,
        background: primary ? 'var(--color-encore-green)' : 'transparent',
        border: primary ? 'none' : '1px solid var(--color-encore-border)',
        color: primary ? 'white' : 'var(--color-encore-green)',
        fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
        fontSize: 14, fontWeight: 700,
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {icon}
      {label}
    </button>
  )
}

// ─── Empty hint ──────────────────────────────────────────────────────────

function EmptyHint({ onAddSong }: { onAddSong: () => void }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
      padding: '40px 24px 28px',
    }}>
      <MusicNotes size={34} weight="regular" color="var(--color-encore-text-muted)" />
      <div style={{
        ...ty.bodySM,
        color: 'var(--color-encore-text-sub)',
        textAlign: 'center',
      }}>
        1 曲目から記録しましょう
      </div>
    </div>
  )
}

// ─── ドットリーダー（区切り用）──────────────────────────────────────────

function DotLeader() {
  return (
    <span
      aria-hidden
      style={{
        flex: 1,
        height: 6,
        backgroundImage: 'radial-gradient(circle, rgba(192,138,74,0.5) 0.7px, transparent 1px)',
        backgroundSize: '6px 6px',
        backgroundRepeat: 'repeat-x',
        backgroundPosition: 'center',
      }}
    />
  )
}

// ─── Toggle ──────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      aria-label="うろ覚えトグル"
      aria-pressed={checked}
      style={{
        width: 44, height: 26,
        borderRadius: 999,
        background: checked ? 'var(--color-encore-green)' : 'var(--color-encore-border)',
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background 160ms ease',
        WebkitTapHighlightColor: 'transparent',
        flexShrink: 0,
      }}
    >
      <span style={{
        position: 'absolute',
        top: 3, left: checked ? 21 : 3,
        width: 20, height: 20, borderRadius: '50%',
        background: 'white',
        transition: 'left 160ms ease',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </button>
  )
}

// ─── 破棄確認ダイアログ（QuickEventSheet ConfirmDiscardDialog と統一）──
// ボトムシート + 縦並びピル（destructive 操作の重みを出す iOS Action Sheet 風）

function DiscardConfirm({ onKeep, onDiscard }: { onKeep: () => void; onDiscard: () => void }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 600,
      display: 'flex', alignItems: 'flex-end',
      background: 'rgba(0,0,0,0.45)',
    }}>
      <div style={{
        width: '100%',
        background: 'var(--color-encore-bg)',
        borderRadius: '24px 24px 0 0',
        padding: '28px 20px 40px',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        <div style={{ textAlign: 'center', marginBottom: 4 }}>
          <span style={{ ...ty.heading, fontSize: 16, display: 'block' }}>
            編集内容を破棄しますか？
          </span>
          <span style={{ ...ty.bodySM, color: 'var(--color-encore-text-sub)', display: 'block', marginTop: 6 }}>
            加えた変更はすべて失われます
          </span>
        </div>
        <button
          onClick={onDiscard}
          style={{
            height: 46, borderRadius: 999, border: 'none',
            background: '#FF3B30', color: '#fff',
            cursor: 'pointer',
            fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
            fontSize: 14, fontWeight: 700,
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          破棄する
        </button>
        <button
          onClick={onKeep}
          style={{
            height: 46, borderRadius: 999,
            border: '1.5px solid var(--color-encore-green)',
            background: 'transparent',
            cursor: 'pointer',
            fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
            fontSize: 14, fontWeight: 700,
            color: 'var(--color-encore-green)',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          編集を続ける
        </button>
      </div>
    </div>
  )
}

// ─── date format helper ──────────────────────────────────────────────────

function formatDateShort(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const dow = ['日', '月', '火', '水', '木', '金', '土'][new Date(y, m - 1, d).getDay()]
  return `${m}月${d}日（${dow}）`
}
