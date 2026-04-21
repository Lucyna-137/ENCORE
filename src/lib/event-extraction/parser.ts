/**
 * URL / HTML からイベント情報を抽出するユーティリティ
 */

export interface PageContent {
  title: string
  description: string
  textContent: string
  imageUrls: string[]
  canonicalUrl?: string
}

/**
 * OGP / description が汎用テンプレートでイベント固有の情報がない場合を判定
 * 例: 「〇〇をチケットぴあで今すぐチェック」「Peatix: Tools for Communities and Events」など
 */
export function isGenericOgp(title: string, description: string, textContent: string): boolean {
  const combined = `${title} ${description}`.toLowerCase()

  // 汎用テンプレート文句（サイト共通の売り文句）
  const genericPhrases = [
    'をチケットぴあで今すぐチェック',
    'チケットの先行情報',
    'tools for communities',
    'grow your communities',
    'official website',
    'オフィシャル ウェブサイト',
    'オフィシャルサイト',
    'チケット情報のご紹介',
    'チケット販売サイト',
  ]

  const hasGenericPhrase = genericPhrases.some(p => combined.includes(p.toLowerCase()))

  // description が短すぎる & 本文もスカスカなら SPA/空ページの可能性
  const emptyShell = description.length < 40 && textContent.length < 200

  return hasGenericPhrase || emptyShell
}

/** HTMLからメタ情報・本文・画像URLを抽出（サーバサイド） */
export function extractPageContent(html: string, baseUrl: string): PageContent {
  const absolute = (url: string): string => {
    if (!url) return ''
    try {
      return new URL(url, baseUrl).toString()
    } catch {
      return url
    }
  }

  // ─── OGP / meta ─────────────────────────────────────────────────
  const metaMatch = (name: string): string => {
    const regex = new RegExp(
      `<meta[^>]+(?:property|name)=["']${name}["'][^>]+content=["']([^"']+)["']`,
      'i'
    )
    const m = html.match(regex)
    if (m) return m[1]
    // content が先の順序パターン
    const regex2 = new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${name}["']`,
      'i'
    )
    return html.match(regex2)?.[1] ?? ''
  }

  const ogTitle = metaMatch('og:title')
  const ogDescription = metaMatch('og:description')
  const ogImage = metaMatch('og:image')
  const twitterImage = metaMatch('twitter:image')
  const metaDescription = metaMatch('description')
  const canonicalUrl = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1] ?? baseUrl

  // ─── <title> ──────────────────────────────────────────────────
  const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ?? ''

  // ─── 本文テキスト抽出 ────────────────────────────────────────
  // script, style, nav, header, footer を除去してからタグを落とす
  const stripped = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<(?:nav|header|footer|aside|form)[\s\S]*?<\/(?:nav|header|footer|aside|form)>/gi, '')
  const textContent = stripped
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()

  // ─── 画像URL収集 ────────────────────────────────────────────────
  const imageUrls: string[] = []
  if (ogImage) imageUrls.push(absolute(ogImage))
  if (twitterImage && !imageUrls.includes(absolute(twitterImage))) {
    imageUrls.push(absolute(twitterImage))
  }
  // <img> タグから上位3枚まで
  const imgMatches = Array.from(html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi))
  for (const m of imgMatches.slice(0, 3)) {
    const src = absolute(m[1])
    if (src && !imageUrls.includes(src) && !src.match(/\.svg$/i)) {
      imageUrls.push(src)
    }
    if (imageUrls.length >= 4) break
  }

  return {
    title: ogTitle || titleTag,
    description: ogDescription || metaDescription,
    textContent: textContent.slice(0, 4000), // Claude 入力用に切り詰め
    imageUrls: imageUrls.slice(0, 3),
    canonicalUrl,
  }
}

/** 画像URL → base64データ（Claude Vision入力用） */
export async function fetchImageAsBase64(
  url: string
): Promise<{ base64: string; mediaType: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif' } | null> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (GRAPE event-import bot)' },
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) return null

    const contentType = res.headers.get('content-type') ?? ''
    let mediaType: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif' = 'image/jpeg'
    if (contentType.includes('png')) mediaType = 'image/png'
    else if (contentType.includes('webp')) mediaType = 'image/webp'
    else if (contentType.includes('gif')) mediaType = 'image/gif'

    const arrayBuffer = await res.arrayBuffer()
    // 2MB以上の画像はスキップ（コスト抑制）
    if (arrayBuffer.byteLength > 2 * 1024 * 1024) return null

    const base64 = Buffer.from(arrayBuffer).toString('base64')
    return { base64, mediaType }
  } catch {
    return null
  }
}
