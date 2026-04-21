import Anthropic from '@anthropic-ai/sdk'
import { extractPageContent, fetchImageAsBase64 } from '@/lib/event-extraction/parser'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const EXTRACTION_PROMPT = `あなたは日本の音楽ライブイベント情報を正確に抽出するアシスタントです。
ユーザから渡されたWebページ（HTMLテキスト＋画像）から、以下のJSON形式でイベント情報を抽出してください。

不明な項目は null を返すこと。推測しないこと。

{
  "title": "イベント名（フルで正確に）",
  "date": "YYYY-MM-DD形式の日付、不明ならnull",
  "openingTime": "HH:MM形式の開場時間、不明ならnull",
  "startTime": "HH:MM形式の開演時間、不明ならnull",
  "endTime": "HH:MM形式の終演時間、不明ならnull",
  "venue": "会場名（正確に）",
  "artists": ["出演アーティスト名1", "..."],
  "price": 整数（円、税込）、不明ならnull,
  "liveType": "ワンマン" | "対バン" | "フェス" | "配信" | "舞台・公演" | "メディア出演" | "リリースイベント" | null,
  "memo": "特筆すべき情報があれば（先行販売・抽選情報・1ドリンク別途など）、なければnull",
  "sourceUrl": "元URL"
}

注意:
- フライヤー画像の文字も精読すること。特に日時・会場・出演者はフライヤー内にあることが多い
- 日付の曜日は返すJSONには含めない（dateのみ）
- 和暦は西暦に変換
- 「ONE MAN」「ワンマン」「ワンマンライブ」→ liveType: "ワンマン"
- 出演者が3組以上の場合 → liveType: "フェス" or "対バン" を文脈から判断
- JSONのみ返答。\`\`\`jsonなどのラッパー不要。`

interface ExtractedEvent {
  title: string | null
  date: string | null
  openingTime: string | null
  startTime: string | null
  endTime: string | null
  venue: string | null
  artists: string[] | null
  price: number | null
  liveType: string | null
  memo: string | null
  sourceUrl: string
  coverImageUrl?: string | null // 参考画像URL
}

export async function POST(request: Request) {
  try {
    const { url } = await request.json()

    if (!url || typeof url !== 'string' || !/^https?:\/\//.test(url)) {
      return Response.json({ error: '有効なURLを指定してください' }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return Response.json({ error: 'ANTHROPIC_API_KEY が未設定です' }, { status: 500 })
    }

    // ─── Step 1: HTML取得 ──────────────────────────────────────
    const htmlRes = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GRAPEbot/1.0; +https://grape.app)',
        Accept: 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(15_000),
    })
    if (!htmlRes.ok) {
      return Response.json(
        { error: `ページ取得に失敗しました (HTTP ${htmlRes.status})` },
        { status: 422 }
      )
    }
    const html = await htmlRes.text()

    // ─── Step 2: HTML解析 ──────────────────────────────────────
    const page = extractPageContent(html, url)

    // ─── Step 3: メイン画像（フライヤー）を取得 ──────────────
    let imageData: Awaited<ReturnType<typeof fetchImageAsBase64>> = null
    let coverImageUrl: string | null = null
    for (const imgUrl of page.imageUrls) {
      const data = await fetchImageAsBase64(imgUrl)
      if (data) {
        imageData = data
        coverImageUrl = imgUrl
        break
      }
    }

    // ─── Step 4: Claude Haiku Vision で構造化 ──────────────────
    const client = new Anthropic({ apiKey })

    const userContent: Anthropic.ContentBlockParam[] = []

    if (imageData) {
      userContent.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: imageData.mediaType,
          data: imageData.base64,
        },
      })
    }

    userContent.push({
      type: 'text',
      text: `元URL: ${url}

ページタイトル: ${page.title}
ページ説明: ${page.description}

ページ本文抜粋:
${page.textContent}

上記＋添付画像からイベント情報をJSONで返してください。`,
    })

    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      system: EXTRACTION_PROMPT,
      messages: [{ role: 'user', content: userContent }],
    })

    // ─── Step 5: Claude のレスポンスをパース ─────────────────
    const text = response.content
      .filter((c): c is Anthropic.TextBlock => c.type === 'text')
      .map(c => c.text)
      .join('\n')
      .trim()

    let parsed: ExtractedEvent
    try {
      // ```json ブロック付きなら剥がす
      const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '')
      parsed = JSON.parse(cleaned) as ExtractedEvent
    } catch (parseErr) {
      console.error('[event-from-url] JSON parse失敗:', text)
      return Response.json(
        { error: 'AIレスポンスの解析に失敗しました', raw: text },
        { status: 502 }
      )
    }

    parsed.sourceUrl = url
    parsed.coverImageUrl = coverImageUrl

    return Response.json({
      event: parsed,
      usage: response.usage, // デバッグ用
    })
  } catch (err) {
    console.error('[event-from-url] 予期しないエラー:', err)
    return Response.json(
      { error: err instanceof Error ? err.message : '不明なエラー' },
      { status: 500 }
    )
  }
}
