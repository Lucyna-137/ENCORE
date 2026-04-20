'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from '@phosphor-icons/react'

/**
 * Settings > 利用規約
 * ワンソース維持のため /terms?embed=1 を iframe で読み込む。
 * 電話フレームなし・最小限ヘッダーのみ。
 */
export default function SettingsTermsPage() {
  const router = useRouter()

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--color-encore-bg)',
    }}>
      {/* 最小限ヘッダー（戻るボタンのみ） */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '12px 16px',
        borderBottom: '1px solid var(--color-encore-border-light)',
        background: 'var(--color-encore-bg)',
        flexShrink: 0,
      }}>
        <button
          onClick={() => router.back()}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 6,
            margin: '-6px 0',
            display: 'flex',
            alignItems: 'center',
            color: 'var(--color-encore-green)',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <ArrowLeft size={20} weight="regular" />
        </button>
      </div>

      {/* /terms をそのまま embed 表示 */}
      <iframe
        src="/terms?embed=1"
        style={{
          flex: 1,
          width: '100%',
          border: 'none',
          minHeight: 'calc(100vh - 53px)',
        }}
        title="利用規約"
      />
    </div>
  )
}
