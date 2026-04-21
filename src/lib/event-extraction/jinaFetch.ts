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

    // body を AIに渡せるサイズに切り詰め（Jinaは情報密度が高いので多めでOK）
    const textContent = body
      .replace(/\n{3,}/g, '\n\n')
      .slice(0, 8000)

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
