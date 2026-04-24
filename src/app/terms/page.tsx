'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'

// ─── 型 ──────────────────────────────────────────────────────────────────────
type Lang = 'ja' | 'en'

// ─── コンテンツ ───────────────────────────────────────────────────────────────
const CONTENT = {
  ja: {
    title:   '利用規約',
    updated: '最終更新日：2026年4月20日',
    company: 'KARABINA LLC',
    email:   'info@karabina-jp.com',
    sections: [
      {
        heading: 'はじめに',
        body: '本利用規約（以下「本規約」）は、KARABINA LLC（以下「当社」）が提供するライブ・イベント管理アプリ「Grape」（以下「本アプリ」）のご利用にあたり、ユーザーと当社との間の権利義務関係を定めるものです。本アプリをご利用いただく前に、本規約を必ずお読みください。本アプリをインストールまたは使用することで、本規約に同意したものとみなします。',
      },
      {
        heading: '第1条　サービスの利用',
        body: '本アプリは、ライブ・イベントのスケジュール管理、チケット情報の記録、および参加統計の確認を目的とした個人利用向けアプリです。ユーザーは、本規約の定めに従い、当社が許諾する範囲内で本アプリを利用することができます。',
      },
      {
        heading: '第2条　禁止事項',
        body: 'ユーザーは、本アプリの利用にあたり、以下の行為をしてはなりません。\n\n・法令または公序良俗に違反する行為\n・当社または第三者の知的財産権、プライバシー、名誉その他の権利を侵害する行為\n・本アプリを商業目的で無断使用する行為\n・本アプリのリバースエンジニアリング、逆コンパイル、または改ざんを行う行為\n・不正なアクセスや当社のシステムへの干渉を試みる行為\n・その他、当社が不適切と判断する行為',
      },
      {
        heading: '第3条　知的財産権',
        body: '本アプリおよびそのコンテンツ（デザイン、テキスト、画像、ロゴ等）に関する知的財産権は、当社または正当な権利者に帰属します。本規約に基づくライセンスは、これらの権利をユーザーに譲渡するものではありません。',
      },
      {
        heading: '第4条　データの取り扱い',
        body: 'ユーザーが本アプリに入力したデータ（イベント情報、アーティスト情報等）は、お使いのデバイス上にのみ保存されます。当社はこれらのデータにアクセスすることはありません。データの管理・バックアップはユーザー自身の責任において行ってください。アプリのアンインストールにより、保存されたすべてのデータが削除されます。',
      },
      {
        heading: '第5条　免責事項',
        body: '当社は、本アプリの利用によってユーザーに生じた損害（データの消失、機会損失等）について、当社の故意または重大な過失による場合を除き、一切の責任を負いません。また、本アプリは「現状有姿」で提供されるものとし、特定の目的への適合性、正確性、継続性について保証しません。',
      },
      {
        heading: '第6条　サービスの変更・停止',
        body: '当社は、ユーザーへの事前通知なく、本アプリの機能の変更、追加、または提供の停止を行うことができるものとします。これによってユーザーに生じた損害について、当社は責任を負いません。',
      },
      {
        heading: '第7条　本規約の変更',
        body: '当社は必要に応じて本規約を変更することがあります。変更後の規約は、本ページに掲載した時点から効力を生じるものとし、ユーザーが変更後も本アプリを継続して使用した場合、改定後の規約に同意したものとみなします。',
      },
      {
        heading: '第8条　準拠法・管轄裁判所',
        body: '本規約の解釈にあたっては、日本法を準拠法とします。本アプリに関して紛争が生じた場合には、当社の本店所在地を管轄する裁判所を専属的合意管轄とします。',
      },
      {
        heading: 'お問い合わせ',
        body: '本規約に関するご質問は、以下までご連絡ください。',
        contact: true,
      },
    ],
  },
  en: {
    title:   'Terms of Service',
    updated: 'Last Updated: April 20, 2026',
    company: 'KARABINA LLC',
    email:   'info@karabina-jp.com',
    sections: [
      {
        heading: 'Introduction',
        body: 'These Terms of Service ("Terms") govern your use of Grape, a live event management app ("App") provided by KARABINA LLC ("we," "us," or "our"). Please read these Terms carefully before using the App. By installing or using the App, you agree to be bound by these Terms.',
      },
      {
        heading: 'Article 1 — Use of the App',
        body: 'The App is a personal-use tool for managing live event schedules, recording ticket information, and viewing attendance statistics. You may use the App within the scope permitted by these Terms.',
      },
      {
        heading: 'Article 2 — Prohibited Activities',
        body: 'You agree not to engage in any of the following when using the App:\n\n· Violating any applicable laws or regulations\n· Infringing on the intellectual property, privacy, or other rights of us or third parties\n· Using the App for unauthorized commercial purposes\n· Reverse engineering, decompiling, or tampering with the App\n· Attempting unauthorized access to or interference with our systems\n· Any other conduct we deem inappropriate',
      },
      {
        heading: 'Article 3 — Intellectual Property',
        body: 'All intellectual property rights in the App and its content (including design, text, images, and logos) belong to us or our licensors. These Terms do not transfer any such rights to you.',
      },
      {
        heading: 'Article 4 — Your Data',
        body: 'Data you enter into the App (such as event and artist information) is stored only on your device. We have no access to this data. You are solely responsible for managing and backing up your data. Uninstalling the App will permanently delete all stored data.',
      },
      {
        heading: 'Article 5 — Disclaimer',
        body: 'To the extent permitted by law, we disclaim all liability for any damages arising from your use of the App (including data loss or missed opportunities), except in cases of our intentional misconduct or gross negligence. The App is provided "as is" without warranties of any kind, including fitness for a particular purpose, accuracy, or continuity.',
      },
      {
        heading: 'Article 6 — Changes and Suspension',
        body: 'We may modify, add to, or discontinue features of the App at any time without prior notice. We are not liable for any loss resulting from such changes.',
      },
      {
        heading: 'Article 7 — Changes to These Terms',
        body: 'We may update these Terms at any time. Revised Terms take effect when posted on this page. Continued use of the App after changes are posted constitutes your acceptance of the revised Terms.',
      },
      {
        heading: 'Article 8 — Governing Law',
        body: 'These Terms are governed by the laws of Japan. Any disputes arising in connection with the App shall be subject to the exclusive jurisdiction of the court with jurisdiction over our principal place of business.',
      },
      {
        heading: 'Contact',
        body: 'For questions about these Terms, please contact us at:',
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
export default function TermsPage() {
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
      {/* ヘッダー — embed モード時は非表示 */}
      {!isEmbed && (
        <div style={{
          position: 'sticky', top: 0, zIndex: 10,
          background: 'var(--color-encore-bg)',
          borderBottom: '1px solid var(--color-encore-border-light)',
          padding: '14px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '0.06em' }}>
            Grape
          </span>
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

        {/* プライバシーポリシーへのリンク */}
        <div style={{
          padding: '16px',
          background: 'var(--color-encore-bg-section)',
          borderRadius: 8,
          marginBottom: 32,
        }}>
          <p style={{ fontSize: 12, color: 'var(--color-encore-text-sub)', marginBottom: 8 }}>
            {lang === 'ja' ? '関連ドキュメント' : 'Related Documents'}
          </p>
          <a
            href="/privacy"
            style={{
              fontSize: 14, fontWeight: 400,
              color: 'var(--color-encore-amber)',
              textDecoration: 'none',
            }}
          >
            {lang === 'ja' ? 'プライバシーポリシー →' : 'Privacy Policy →'}
          </a>
        </div>

        {/* フッター */}
        <div style={{
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
