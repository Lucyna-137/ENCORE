'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

// ─── 型 ──────────────────────────────────────────────────────────────────────
type Lang = 'ja' | 'en'

// ─── コンテンツ ───────────────────────────────────────────────────────────────
const CONTENT = {
  ja: {
    lang:        'ja',
    title:       'プライバシーポリシー',
    updated:     '最終更新日：2026年4月20日',
    company:     'KARABINA LLC',
    email:       'info@karabina-jp.com',
    sections: [
      {
        heading: 'はじめに',
        body: 'Grapeアプリ（以下「本アプリ」）は、KARABINA LLCが提供するライブ・イベント管理アプリです。本プライバシーポリシーは、本アプリをご利用いただく際の情報の取り扱いについて説明します。',
      },
      {
        heading: '収集する情報',
        body: '本アプリが収集・保存する情報は以下のとおりです。\n\n・あなたが入力したイベント情報（タイトル、日時、会場、アーティスト名、チケット情報など）\n・アーティスト情報（名前、誕生日、テーマカラーなど）\n・アプリの設定情報（カラーテーマ、カレンダー表示設定など）\n\nこれらの情報はすべて、お使いのデバイス内にのみ保存されます。',
      },
      {
        heading: '情報の利用目的',
        body: '収集した情報は、本アプリの機能（イベント管理、チケット状況の追跡、統計表示など）を提供するためにのみ使用します。情報を第三者へ提供したり、マーケティング目的で利用したりすることはありません。',
      },
      {
        heading: 'サーバーへのデータ送信について',
        body: '現バージョンの本アプリは、入力されたデータをサーバーへ送信しません。すべてのデータはお使いのデバイス上にローカルに保存され、インターネット経由で外部に送信されることはありません。\n\n将来のバージョンでは、クラウドバックアップ機能が追加される可能性があります。その際は、本ポリシーを更新し、事前にアプリ内でご案内します。',
      },
      {
        heading: '第三者サービスについて',
        body: '本アプリは以下の第三者サービスを利用しています。各サービスには独自のプライバシーポリシーが適用されます。\n\n・Apple App Store（Apple Inc.）\n・Google Play ストア（Google LLC）\n・Google フォーム（Google LLC）— お問い合わせフォームに使用しています。フォームに入力・送信された情報はGoogleのサーバーに保存され、Googleのプライバシーポリシー（https://policies.google.com/privacy）が適用されます。',
      },
      {
        heading: 'データの削除',
        body: 'アプリをアンインストールすることで、デバイスに保存されたすべてのデータが削除されます。',
      },
      {
        heading: 'お子様のプライバシー',
        body: '本アプリは13歳未満の方を対象としておりません。13歳未満の方から意図的に情報を収集することはありません。',
      },
      {
        heading: 'プライバシーポリシーの変更',
        body: '本ポリシーは必要に応じて更新される場合があります。変更があった場合は、本ページに最新版を掲載し、アプリ内でお知らせします。',
      },
      {
        heading: 'お問い合わせ',
        body: 'プライバシーに関するお問い合わせは、以下までご連絡ください。',
        contact: true,
      },
    ],
  },
  en: {
    lang:        'en',
    title:       'Privacy Policy',
    updated:     'Last Updated: April 20, 2026',
    company:     'KARABINA LLC',
    email:       'info@karabina-jp.com',
    sections: [
      {
        heading: 'Introduction',
        body: 'Grape (the "App") is a live event management app provided by KARABINA LLC. This Privacy Policy explains how we handle information when you use our App.',
      },
      {
        heading: 'Information We Collect',
        body: 'The App collects and stores the following information:\n\n· Event information you enter (title, date, venue, artist name, ticket details, etc.)\n· Artist information (name, birthday, theme color, etc.)\n· App settings (color theme, calendar view preferences, etc.)\n\nAll of this information is stored only on your device.',
      },
      {
        heading: 'How We Use Your Information',
        body: 'We use the information you provide solely to operate the App\'s features (event management, ticket tracking, statistics, etc.). We do not share your information with third parties or use it for marketing purposes.',
      },
      {
        heading: 'Data Transmission',
        body: 'The current version of the App does not transmit any entered data to servers. All data is stored locally on your device and is not sent over the internet.\n\nFuture versions may introduce cloud backup functionality. If so, this policy will be updated and you will be notified within the App in advance.',
      },
      {
        heading: 'Third-Party Services',
        body: 'The App uses the following third-party services, each governed by its own Privacy Policy:\n\n· Apple App Store (Apple Inc.)\n· Google Play Store (Google LLC)\n· Google Forms (Google LLC) — Used for our contact form. Information you submit via the contact form is stored on Google\'s servers and subject to Google\'s Privacy Policy (https://policies.google.com/privacy).',
      },
      {
        heading: 'Data Deletion',
        body: 'Uninstalling the App will delete all data stored on your device.',
      },
      {
        heading: "Children's Privacy",
        body: 'The App is not directed to children under the age of 13. We do not knowingly collect information from children under 13.',
      },
      {
        heading: 'Changes to This Policy',
        body: 'This Policy may be updated from time to time. When changes are made, the updated version will be posted on this page and you will be notified within the App.',
      },
      {
        heading: 'Contact Us',
        body: 'For questions about this Privacy Policy, please contact us at:',
        contact: true,
      },
    ],
  },
} as const

// ─── LangToggle ──────────────────────────────────────────────────────────────
function LangToggle({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <div style={{
      display: 'flex',
      background: 'var(--color-encore-bg-section)',
      borderRadius: 999,
      padding: 3,
      gap: 2,
    }}>
      {(['ja', 'en'] as const).map(l => (
        <button
          key={l}
          onClick={() => setLang(l)}
          style={{
            padding: '4px 14px',
            borderRadius: 999,
            border: 'none',
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: lang === l ? 700 : 400,
            fontFamily: 'var(--font-google-sans), sans-serif',
            background: lang === l ? 'var(--color-encore-green)' : 'transparent',
            color: lang === l ? '#FFFFFF' : 'var(--color-encore-text-sub)',
            transition: 'all 0.15s',
          }}
        >
          {l === 'ja' ? '日本語' : 'English'}
        </button>
      ))}
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function PrivacyPage() {
  return (
    <Suspense fallback={null}>
      <PrivacyContent />
    </Suspense>
  )
}

function PrivacyContent() {
  const [lang, setLang] = useState<Lang>('ja')
  const searchParams = useSearchParams()
  const isEmbed = searchParams.get('embed') === '1'
  const c = CONTENT[lang]

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-encore-bg)',
      fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
      color: 'var(--color-encore-green)',
    }}>
      {/* embed (iframe) モードでは mobile-CSS の overflow:hidden を上書きしてスクロール可能に */}
      {isEmbed && (
        <style>{`html, body { overflow: auto !important; height: auto !important; }`}</style>
      )}
      {/* ヘッダー — embed モード時は非表示 */}
      {!isEmbed && (
        <div style={{
          position: 'sticky', top: 0, zIndex: 10,
          background: 'var(--color-encore-bg)',
          borderBottom: '1px solid var(--color-encore-border-light)',
          padding: '14px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {/* アプリ名 */}
          <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '0.06em' }}>
            Grape
          </span>

          {/* 言語トグル */}
          <LangToggle lang={lang} setLang={setLang} />
        </div>
      )}

      {/* embed 時は言語トグルだけ本文上部に表示 */}
      {isEmbed && (
        <div style={{
          display: 'flex', justifyContent: 'flex-end',
          padding: '12px 24px 0',
        }}>
          <LangToggle lang={lang} setLang={setLang} />
        </div>
      )}

      {/* 本文 */}
      <div style={{
        maxWidth: 640,
        margin: '0 auto',
        padding: '32px 24px 80px',
      }}>
        {/* タイトル */}
        <h1 style={{
          fontSize: 24, fontWeight: 700,
          marginBottom: 6,
          letterSpacing: lang === 'en' ? '0.01em' : 0,
        }}>
          {c.title}
        </h1>
        <p style={{
          fontSize: 12, fontWeight: 400,
          color: 'var(--color-encore-text-sub)',
          marginBottom: 32,
        }}>
          {c.updated}
        </p>

        {/* セクション */}
        {c.sections.map((section, i) => (
          <div key={i} style={{ marginBottom: 32 }}>
            <h2 style={{
              fontSize: 16, fontWeight: 700,
              marginBottom: 10,
              paddingBottom: 8,
              borderBottom: '1px solid var(--color-encore-border-light)',
            }}>
              {section.heading}
            </h2>
            <p style={{
              fontSize: 14, fontWeight: 400,
              lineHeight: 1.8,
              color: 'var(--color-encore-green)',
              whiteSpace: 'pre-line',
            }}>
              {section.body}
            </p>
            {'contact' in section && section.contact && (
              <div style={{
                marginTop: 14,
                padding: '14px 16px',
                background: 'var(--color-encore-bg-section)',
                borderRadius: 8,
              }}>
                <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
                  {c.company}
                </p>
                <a
                  href={`mailto:${c.email}`}
                  style={{
                    fontSize: 14, fontWeight: 400,
                    color: 'var(--color-encore-amber)',
                    textDecoration: 'none',
                  }}
                >
                  {c.email}
                </a>
              </div>
            )}
          </div>
        ))}

        {/* フッター */}
        <div style={{
          marginTop: 48,
          paddingTop: 20,
          borderTop: '1px solid var(--color-encore-border-light)',
          textAlign: 'center',
        }}>
          <p style={{
            fontSize: 12, fontWeight: 400,
            color: 'var(--color-encore-text-sub)',
          }}>
            © {new Date().getFullYear()} {c.company}. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
