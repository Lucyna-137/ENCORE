'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from '@phosphor-icons/react'

/**
 * Settings > プライバシーポリシー
 * ワンソース維持のため /privacy?embed=1 を iframe で読み込む。
 * 電話フレームなし・最小限ヘッダーのみ。
 */
export default function SettingsPrivacyPage() {
  const router = useRouter()

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--color-encore-bg)',
      // iPhone ノッチ / Dynamic Island 下に戻るボタンが隠れるのを防ぐ
      paddingTop: 'env(safe-area-inset-top)',
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

      {/* /privacy をそのまま embed 表示 */}
      <iframe
        src="/privacy/index.html?embed=1"
        style={{
          flex: 1,
          width: '100%',
          border: 'none',
          minHeight: 'calc(100vh - 53px)',
        }}
        title="プライバシーポリシー"
      />
    </div>
  )
}
