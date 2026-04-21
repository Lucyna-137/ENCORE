/**
 * Jina AI Reader (r.jina.ai) 経由でページをマークダウン取得
 *
 * - JS実行後のレンダリング済み内容を取得できる（SPA対応）
 * - 大手サイトのbot保護を通過できることが多い
 * - 無料枠内。API key不要（任意）
 *
 * 参考: https://jina.ai/reader
 */

import type { PageContent } from './parser'

interface JinaFetchOptions {
  timeoutMs?: number
  /** Jina に待機させる CSS セレクタ（SPAの描画完了用） */
  waitForSelector?: string
}

/**
 * Jina AI Reader 経由で URL を取得し、PageContent 互換のオブジェクトを返す
 * 失敗時は null を返す
 */
export async function fetchViaJina(
  url: string,
  opts: JinaFetchOptions = {}
): Promise<PageContent | null> {
  const { timeoutMs = 12_000, waitForSelector } = opts

  try {
    const jinaUrl = `https://r.jina.ai/${url}`
    const headers: Record<string, string> = {
      // マークダウン形式
      'X-Return-Format': 'markdown',
      Accept: 'text/plain',
    }
    if (waitForSelector) headers['X-Wait-For-Selector'] = waitForSelector

    const res = await fetch(jinaUrl, {
      headers,
      signal: AbortSignal.timeout(timeoutMs),
    })
    if (!res.ok) return null

    const markdown = await res.text()
    if (!markdown || markdown.length < 50) return null

    // マークダウンから OGP 風の情報を抽出
    // Jina の出力は通常 "Title: ...\nURL Source: ...\n\nMarkdown Content:\n# ...\n"
    const titleMatch = markdown.match(/^Title:\s*(.+)$/m)
    const title = titleMatch?.[1].trim() ?? ''

    // 最初の見出しを description 代わりに
    const bodyStart = markdown.indexOf('Markdown Content:')
    const body = bodyStart >= 0 ? markdown.slice(bodyStart + 'Markdown Content:'.length).trim() : markdown

    // 画像URL抽出 (![alt](url) 形式の画像)
    // logo/icon/avatar/banner/button/pagetop 等、イベント画像ではないものは除外
    const imageUrls: string[] = []
    const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g
    let m: RegExpExecArray | null
    const skipPatterns = [
      /\.svg(\?|$)/i,
      /\.(gif)(\?|$)/i,
      /logo[_\-.]/i,
      /icon[_\-.]/i,
      /avatar[_\-.]/i,
      /banner[_\-.]/i,
      /button[_\-.]/i,
      /btn[_\-.]/i,
      /pagetop/i,
      /placeholder/i,
      /spacer/i,
      /1x1\./i,
    ]
    while ((m = imgRegex.exec(body)) !== null && imageUrls.length < 4) {
      const alt = m[1].trim()
      const imgUrl = m[2].split(' ')[0].trim()
      if (!imgUrl || !/^https?:\/\//.test(imgUrl)) continue
      if (imageUrls.includes(imgUrl)) continue
      // alt テキストが "logo" や "icon" を含むものも除外
      const isBadAlt = /logo|icon|avatar|banner|user-|pagetop/i.test(alt)
      const isBadUrl = skipPatterns.some(p => p.test(imgUrl))
      if (isBadAlt || isBadUrl) continue
      imageUrls.push(imgUrl)
    }

    // body を AIに渡せるサイズに切り詰め
    // ヘッダー/ナビゲーション/追跡ピクセル等のノイズを落としてから truncate
    let cleaned = body
      // 追跡ピクセル画像を除去
      .replace(/!\[[^\]]*\]\((?:https?:\/\/)?(?:analytics\.twitter|t\.co\/i\/adsct|ads\.google|ad\.doubleclick|google-analytics|googletagmanager|googlesyndication|amplitude|segment\.com|mxpnl|hotjar|facebook\.com\/tr)[^)]*\)/g, '')
      // 異常に長いURL（Trackingパラメータ大量のpixel）を含む画像を除去
      .replace(/!\[[^\]]*\]\([^)]{200,}\)/g, '')
      // 200文字超のプレーンURL行を除去
      .replace(/^https?:\/\/[^\s]{200,}$/gm, '')
      // 単純なナビリンク行を除去
      .replace(/^\*\s+\[[^\]]+\]\([^)]+\)\s*$/gm, '')
      // ログイン/会員登録等の共通UI文字列を削除
      .replace(/^(ログイン|ログアウト|会員登録|メニュー|閉じる|シェア|\s*Twitter\s*|\s*line\s*|\s*Facebook\s*)$/gm, '')
      // 連続する空行を1つに
      .replace(/\n{3,}/g, '\n\n')

    // eplus・pia等で「受付終了」の行を除去（"受付中"が他にあれば混乱を避ける）
    if (cleaned.includes('受付中') && cleaned.includes('受付終了')) {
      // "####" で区切られる各チケット行を分解し、「受付終了」だけの行を削除
      const rows = cleaned.split(/(?=^####?\s)/m)
      const filteredRows = rows.filter(row => {
        // ステータスが受付終了で、受付中が含まれていない → 除外
        if (/受付終了/.test(row) && !/受付中/.test(row)) return false
        return true
      })
      // 「受付は全て終了しました」の誤解ブロックも除去
      cleaned = filteredRows.join('').replace(/#+\s*受付は全て終了しました[\s\S]{0,200}/g, '')
    }

    const textContent = cleaned.slice(0, 10000)

    return {
      title,
      description: '',
      textContent,
      imageUrls,
      canonicalUrl: url,
    }
  } catch {
    return null
  }
}
