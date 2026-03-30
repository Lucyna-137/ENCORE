'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import * as ty from '@/components/encore/typographyStyles'
import { StatusBar } from '@/components/encore/NavHeader'
import { ArrowLeft, ArrowSquareOut, Envelope } from '@phosphor-icons/react'

// ─── ドキュメントコンポーネント群 ──────────────────────────────────────────────

function DocH2({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
      fontSize: 20, fontWeight: 700, lineHeight: 1.35,
      color: 'var(--color-encore-green)',
      marginBottom: 12,
    }}>
      {children}
    </div>
  )
}

function DocH3({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
      fontSize: 16, fontWeight: 700, lineHeight: 1.4,
      color: 'var(--color-encore-green)',
      marginTop: 24, marginBottom: 8,
    }}>
      {children}
    </div>
  )
}

function DocH4({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
      fontSize: 14, fontWeight: 700, lineHeight: 1.4,
      color: 'var(--color-encore-text-sub)',
      marginTop: 16, marginBottom: 6,
    }}>
      {children}
    </div>
  )
}

function DocBody({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
      fontSize: 13, fontWeight: 400, lineHeight: 1.75,
      color: 'var(--color-encore-green)',
      margin: '0 0 12px',
    }}>
      {children}
    </p>
  )
}

function DocLink({ href, children }: { href?: string; children: React.ReactNode }) {
  return (
    <a
      href={href ?? '#'}
      style={{
        fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
        fontSize: 13, fontWeight: 400,
        color: 'var(--color-encore-amber)',
        textDecoration: 'underline',
        textDecorationColor: 'rgba(192,138,74,0.4)',
        display: 'inline-flex', alignItems: 'center', gap: 3,
      }}
    >
      {children}
      {href && <ArrowSquareOut size={11} />}
    </a>
  )
}

function DocContactBox({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      marginTop: 8, marginBottom: 12,
      padding: '14px 16px',
      background: 'var(--color-encore-bg-section)',
      borderRadius: 8,
      border: '1px solid var(--color-encore-border-light)',
    }}>
      {children}
    </div>
  )
}

function DocDivider() {
  return (
    <div style={{
      height: 1,
      background: 'var(--color-encore-border-light)',
      margin: '20px 0',
    }} />
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function PrivacyPage() {
  const router = useRouter()

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--color-body-bg)', padding: '20px 0',
    }}>
      <div style={{
        width: 393, height: 852,
        background: 'var(--color-encore-bg)',
        borderRadius: 44, overflow: 'hidden',
        position: 'relative', display: 'flex', flexDirection: 'column',
        boxShadow: 'var(--shadow-phone)',
      }}>
        <StatusBar />

        {/* ── ヘッダー ── */}
        <div style={{
          padding: '4px 16px 10px',
          background: 'var(--color-encore-bg)',
          flexShrink: 0,
          display: 'flex', alignItems: 'center', gap: 8,
          borderBottom: '1px solid var(--color-encore-border-light)',
        }}>
          <button
            onClick={() => router.back()}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              padding: 6, margin: '-6px 0', display: 'flex', alignItems: 'center',
              color: 'var(--color-encore-green)',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <ArrowLeft size={20} weight="regular" />
          </button>
          <span style={{
            fontFamily: 'var(--font-google-sans), sans-serif',
            fontSize: 16, fontWeight: 700,
            color: 'var(--color-encore-green)',
            flex: 1,
          }}>
            プライバシーポリシー
          </span>
        </div>

        {/* ── スクロールコンテンツ ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px 40px' }}>

          {/* 施行日 */}
          <div style={{ ...ty.captionMuted, marginBottom: 20 }}>
            制定日：20XX年XX月XX日　最終更新：20XX年XX月XX日
          </div>

          <DocH2>プライバシーポリシー</DocH2>
          <DocBody>
            ○○○○株式会社（以下「当社」）は、本ウェブサービスにおける、ユーザーの個人情報の取扱いについて、以下のとおりプライバシーポリシー（以下「本ポリシー」）を定めます。
          </DocBody>

          <DocDivider />

          {/* 第1条 */}
          <DocH3>第1条　個人情報</DocH3>
          <DocBody>
            「個人情報」とは、個人情報保護法にいう「個人情報」を指すものとし、生存する個人に関する情報であって、当該情報に含まれる氏名、生年月日、住所、電話番号、連絡先その他の記述等により特定の個人を識別できる情報および容貌、指紋、声紋にかかるデータおよび健康保険証の保険者番号などの当該情報単体から特定の個人を識別できる情報（個人識別情報）を指します。
          </DocBody>

          {/* 第2条 */}
          <DocH3>第2条　個人情報の収集方法</DocH3>
          <DocBody>
            当社は、ユーザーが利用登録をする際に氏名、生年月日、住所、電話番号、メールアドレスなどの個人情報をお尋ねすることがあります。また、ユーザーと提携先などとの間でなされたユーザーの個人情報を含む取引記録や決済に関する情報を、当社の提携先（情報提供元、広告主、広告配信先などを含みます）などから収集することがあります。
          </DocBody>

          {/* 第3条 */}
          <DocH3>第3条　個人情報を収集・利用する目的</DocH3>
          <DocH4>3-1　サービス提供のため</DocH4>
          <DocBody>
            当社が個人情報を収集・利用する目的は、本サービスの提供・運営・改善のためです。ダミーテキストダミーテキストダミーテキストダミーテキストダミーテキストダミーテキスト。
          </DocBody>
          <DocH4>3-2　ご本人への連絡のため</DocH4>
          <DocBody>
            ユーザーへのご連絡、お問い合わせ対応、サービスのご案内のために利用することがあります。ダミーテキストダミーテキストダミーテキストダミーテキスト。
          </DocBody>
          <DocH4>3-3　不正利用防止のため</DocH4>
          <DocBody>
            利用規約に違反したユーザーや、不正・不当な目的でサービスを利用しようとするユーザーの特定をし、ご利用をお断りするために利用することがあります。ダミーテキストダミーテキストダミーテキスト。
          </DocBody>

          {/* 第4条 */}
          <DocH3>第4条　利用目的の変更</DocH3>
          <DocBody>
            当社は、利用目的が変更前と関連性を有すると合理的に認められる場合に限り、個人情報の利用目的を変更するものとします。利用目的の変更を行った場合には、変更後の目的について、当社所定の方法により、ユーザーに通知し、または本ウェブサービス上に公表するものとします。
          </DocBody>

          {/* 第5条 */}
          <DocH3>第5条　個人情報の第三者提供</DocH3>
          <DocBody>
            当社は、次に掲げる場合を除いて、あらかじめユーザーの同意を得ることなく、第三者に個人情報を提供することはありません。ただし、個人情報保護法その他の法令で認められる場合を除きます。ダミーテキストダミーテキストダミーテキストダミーテキスト。
          </DocBody>

          {/* 第6条 */}
          <DocH3>第6条　Cookieの使用について</DocH3>
          <DocBody>
            本サービスは、利便性向上のためにCookieを使用することがあります。Cookieはブラウザの設定から無効にすることができますが、一部の機能が利用できなくなる場合があります。詳細は以下をご参照ください。
          </DocBody>
          <div style={{ marginBottom: 16 }}>
            <DocLink href="#">Cookie ポリシー</DocLink>
          </div>

          {/* 関連リンク */}
          <DocH3>関連ドキュメント</DocH3>
          <div style={{ marginBottom: 16 }}>
            <DocLink href="/grape/settings/terms">利用規約</DocLink>
          </div>

          <DocDivider />

          {/* お問い合わせ */}
          <DocH3>個人情報に関するお問い合わせ</DocH3>
          <DocBody>
            個人情報の開示・訂正・削除などのご請求、またはプライバシーポリシーに関するご質問は、下記の窓口までお申し出ください。
          </DocBody>
          <DocContactBox>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
              <Envelope size={15} color="var(--color-encore-text-sub)" style={{ marginTop: 1, flexShrink: 0 }} />
              <div>
                <div style={{
                  fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                  fontSize: 12, fontWeight: 700, color: 'var(--color-encore-text-sub)',
                  marginBottom: 2,
                }}>
                  個人情報保護管理者
                </div>
                <DocLink href="#">privacy@example.com</DocLink>
              </div>
            </div>
            <div style={{
              fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
              fontSize: 12, fontWeight: 400, lineHeight: 1.6,
              color: 'var(--color-encore-text-sub)',
            }}>
              ○○○○株式会社　個人情報保護担当<br />
              〒XXX-XXXX 東京都○○区○○ X-X-X<br />
              受付時間：平日 10:00〜18:00
            </div>
          </DocContactBox>

        </div>
      </div>
    </div>
  )
}
