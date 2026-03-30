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

export default function TermsPage() {
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
            利用規約
          </span>
        </div>

        {/* ── スクロールコンテンツ ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px 40px' }}>

          {/* 施行日 */}
          <div style={{ ...ty.captionMuted, marginBottom: 20 }}>
            制定日：20XX年XX月XX日　最終更新：20XX年XX月XX日
          </div>

          <DocH2>利用規約</DocH2>
          <DocBody>
            本利用規約（以下「本規約」）は、○○○○株式会社（以下「当社」）が提供するライブ管理アプリ「ENCORE」（以下「本サービス」）のご利用にあたり、ユーザーと当社との間の権利義務関係を定めるものです。本サービスをご利用いただく前に、本規約を必ずお読みください。
          </DocBody>

          <DocDivider />

          {/* 第1条 */}
          <DocH3>第1条　適用</DocH3>
          <DocBody>
            本規約は、ユーザーと当社との間の本サービスの利用に関わる一切の関係に適用されるものとします。当社は本サービスに関し、本規約のほか、ご利用にあたってのルール等、各種の定め（以下「個別規定」）をすることがあります。これら個別規定はその名称のいかんに関わらず、本規約の一部を構成するものとします。
          </DocBody>

          {/* 第2条 */}
          <DocH3>第2条　利用登録</DocH3>
          <DocH4>2-1　登録申請</DocH4>
          <DocBody>
            本サービスにおいては、登録希望者が本規約に同意の上、当社の定める方法によって利用登録を申請し、当社がこれを承認することによって、利用登録が完了するものとします。ダミーテキストダミーテキストダミーテキストダミーテキストダミーテキスト。
          </DocBody>
          <DocH4>2-2　登録拒否</DocH4>
          <DocBody>
            当社は、利用登録の申請者に以下の事由があると判断した場合、利用登録の申請を承認しないことがあり、その理由については一切の開示義務を負わないものとします。ダミーテキストダミーテキストダミーテキスト。
          </DocBody>

          {/* 第3条 */}
          <DocH3>第3条　禁止事項</DocH3>
          <DocBody>
            ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。ダミーテキストダミーテキストダミーテキストダミーテキストダミーテキストダミーテキストダミーテキストダミーテキスト。
          </DocBody>
          <DocBody>
            ダミーテキストダミーテキストダミーテキストダミーテキストダミーテキストダミーテキストダミーテキストダミーテキストダミーテキストダミーテキスト。法令または公序良俗に違反する行為、犯罪行為に関連する行為、当社のサーバーまたはネットワークの機能を破壊したり、妨害したりする行為が該当します。
          </DocBody>

          {/* 第4条 */}
          <DocH3>第4条　本サービスの提供の停止等</DocH3>
          <DocBody>
            当社は、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。ダミーテキストダミーテキストダミーテキスト。
          </DocBody>

          {/* 第5条 */}
          <DocH3>第5条　免責事項</DocH3>
          <DocBody>
            当社の債務不履行責任は、当社の故意または重過失によらない場合には免責されるものとします。ダミーテキストダミーテキストダミーテキストダミーテキストダミーテキスト。また、本サービスに関連してユーザーと他のユーザーまたは第三者との間において生じた取引、連絡または紛争等については、当社は一切責任を負いません。
          </DocBody>

          {/* 関連リンク */}
          <DocH3>関連ドキュメント</DocH3>
          <DocBody>
            プライバシーポリシーについては、以下をご参照ください。
          </DocBody>
          <div style={{ marginBottom: 16 }}>
            <DocLink href="/grape/settings/privacy">プライバシーポリシー</DocLink>
          </div>
          <div style={{ marginBottom: 24 }}>
            <DocLink href="#">特定商取引法に基づく表記</DocLink>
          </div>

          <DocDivider />

          {/* お問い合わせ */}
          <DocH3>お問い合わせ</DocH3>
          <DocBody>
            本規約に関するご質問・ご意見は、下記の窓口までお問い合わせください。
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
                  メールでのお問い合わせ
                </div>
                <DocLink href="#">support@example.com</DocLink>
              </div>
            </div>
            <div style={{
              fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
              fontSize: 12, fontWeight: 400, lineHeight: 1.6,
              color: 'var(--color-encore-text-sub)',
            }}>
              ○○○○株式会社<br />
              〒XXX-XXXX 東京都○○区○○ X-X-X<br />
              受付時間：平日 10:00〜18:00
            </div>
          </DocContactBox>

        </div>
      </div>
    </div>
  )
}
