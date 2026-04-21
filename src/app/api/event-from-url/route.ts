import Anthropic from '@anthropic-ai/sdk'
import { extractPageContent, fetchImageAsBase64 } from '@/lib/event-extraction/parser'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Claude のレスポンステキストから JSON オブジェクトを安全に抽出
 * - ```json ```  ブロックを剥がす
 * - 余計な前置き/後書きテキストを除去
 * - {...} の最初のオブジェクトを取り出す
 */
function extractJsonFromText<T>(text: string): T {
  let t = text.trim()
  // code fence 剥がし
  t = t.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '')
  // 最初の { から対応する } までを抽出
  const firstBrace = t.indexOf('{')
  if (firstBrace === -1) throw new Error('JSONオブジェクトが見つかりません')
  let depth = 0
  let endIdx = -1
  let inString = false
  let escape = false
  for (let i = firstBrace; i < t.length; i++) {
    const ch = t[i]
    if (escape) { escape = false; continue }
    if (ch === '\\' && inString) { escape = true; continue }
    if (ch === '"') { inString = !inString; continue }
    if (inString) continue
    if (ch === '{') depth++
    else if (ch === '}') {
      depth--
      if (depth === 0) { endIdx = i; break }
    }
  }
  if (endIdx === -1) throw new Error('JSONオブジェクトの終端が見つかりません')
  return JSON.parse(t.slice(firstBrace, endIdx + 1)) as T
}

const EXTRACTION_PROMPT = `あなたは日本の音楽ライブイベント情報を正確に抽出するアシスタントです。
ユーザから渡されたWebページ（HTMLテキスト＋画像）から、以下のJSON形式でイベント情報を抽出してください。

不明な項目は null を返すこと。推測しないこと（誤った情報より空の方が価値がある）。

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
  "ticketUrl": "チケット販売・購入ページのURL（本文内の tiget.net / t.pia.jp / eplus.jp / l-tike.com 等の外部リンク）、明示がなければnull",
  "saleStartDate": "チケット販売開始日 YYYY-MM-DD、不明ならnull",
  "saleStartTime": "チケット販売開始時刻 HH:MM、不明ならnull",
  "sourceUrl": "元URL"
}

# 日本のライブ業界の略語・用語辞書（必ず正しく解釈すること）

## 時間表記
- **openingTime（開場）**: OPEN / Open / open / 開場 / 受付開始 / doors / 入場開始
- **startTime（開演）**: START / Start / start / 開演 / LIVE START / ライブスタート / STAGE ON
- **endTime（終演）**: END / CLOSE / Close / 終演 / 終了 / FINISH
- 並記パターン:
  - 「OPEN 18:00 / START 18:30」→ opening=18:00, start=18:30
  - 「開場18:00 開演18:30」「18:00開場 18:30開演」→ 同上
  - 「18:00open / 18:30start」「18:00OPEN/18:30START」連結形も同様
  - 「18:00/18:30」のように無名で並ぶ場合、前者=開場・後者=開演
- 「受付」単体はopeningTimeと同等と解釈
- OA（Opening Act）/ 転換 / SE（Sound Effect、BGM）は時間情報ではない補助情報

## チケット情報
- **ticketUrl**: 本文や画像内の外部チケット販売サイトURLを抽出
  - 対象サイト例: tiget.net / t.pia.jp / eplus.jp / l-tike.com / rakuten-ticket.jp / cnplayguide.com / ticket.rakuten.co.jp / iflyer.tv
  - 複数あればメイン販売サイトを選ぶ
  - Xの短縮URL（t.co/...）は展開後のURLを使う（ページ本文の facets 展開 replacement を参照）
- **saleStartDate / saleStartTime**:
  - 「チケット販売開始」「発売日」「チケット発売」「予約開始」「抽選受付開始」「先行予約開始」「3/23 19:00〜」「3月23日19時より」等のパターンから抽出
  - 日付のみの場合は saleStartTime を null に
  - 時間のみ（「19:00〜販売」等）で日付不明なら両方nullに
- memo への販売フェーズ記載は継続（「FC先行 / オフィシャル先行」等）

## 料金表記
- **priceに入れる優先順位**（最も一般的な入場価格）:
  1. ADV / ADV. / 前売 / 前売り / 事前 / 先行価格
  2. 単一価格表記（「¥3,500」だけの場合）
  3. DOOR / Door / 当日 / 当券
- 「ADV ¥3,500 / DOOR ¥4,000」→ price: 3500（ADV優先）、memoに「当日 ¥4,000」
- **1ドリンク別途**: 以下は priceに含めない、memo に記載:
  - 「+1D」「+1Drink」「+1ドリンク」「D別」「ドリンク別」「DRINK別」「要1D」「要1Drink」「1D代別途」
  - 例: price: 3500, memo: "1ドリンク別途(¥600)"
- **学割・U18・会員割引**: memo に記載
- **指定席/自由席/オールスタンディング/S席/A席**: memo に記載
- **整理番号**: memo に記載
- **招待**「招待券」「invitation」→ price: 0 もしくは null
- **税込/税抜**: priceには税込金額を優先
- **販売フェーズ**:
  - 「FC先行」「ファンクラブ先行」「FC会員限定先行」
  - 「オフィシャル先行」「OL先行」「オフィシャルHP先行」
  - 「一般発売」「一般販売」「通常販売」
  - 「抽選」「抽選販売」「抽選申込」
  - 「先着」「先着順」
  - 「完売」「SOLD OUT」→ memoに記載、priceは通常通り
  - これらは memo の冒頭に記載すると良い

## イベント種別 (liveType)
- **"ワンマン"**: ONE MAN / ONEMAN / ワンマン / ワンマンライブ / 1st ONE MAN LIVE / 単独公演
- **"対バン"**:
  - 「ツーマン」「TWO-MAN」「2MAN」→ 2組
  - 「スリーマン」「THREE-MAN」「3MAN」→ 3組
  - 「対バン」「vs」「w/」「with」「presents」「×」（複数組出演）
  - 出演者欄が2〜3組で明示的に共演
- **"フェス"**:
  - 「FES」「FESTIVAL」「フェス」「フェスティバル」「サーキット」「CIRCUIT」
  - 出演者4組以上 & イベント名にフェス感のある名前
- **"配信"**: 「配信」「配信ライブ」「オンラインライブ」「無観客配信」「ストリーミング」「LIVE STREAMING」
- **"舞台・公演"**: 「舞台」「演劇」「公演」「ミュージカル」「朗読劇」
- **"メディア出演"**: 「TV出演」「ラジオ出演」「番組」「収録」
- **"リリースイベント"**:
  - 「リリイベ」「リリースイベント」「発売記念イベント」
  - 「インストア」「インストアライブ」「店頭イベント」
  - 「ミニライブ&お渡し会」「お渡し会」「握手会」「撮影会」「チェキ会」
- 迷ったら: 同じ日に複数アーティスト → 対バン、多数 → フェス、単独 → ワンマン

## 会場表記（venue）
- **正規化パターン**:
  - 「@会場名」「at会場名」「於会場名」「会場:〇〇」「venue:〇〇」「ライブ会場:〇〇」
  - 「〇〇ホール」「〇〇アリーナ」「〇〇スタジアム」「Zepp〇〇」「〇〇Arena」
- ライブハウスの正式名を優先
- 住所情報が含まれる場合は venue には入れず無視
- 略称しかなければそれでOK

## アーティスト表記 (artists)
- 主演・出演者を全員配列で返す
- 「○○ / △△ / □□」のスラッシュ区切り、「○○, △△」のカンマ区切り、改行区切りいずれも正しく分割
- 「w/」「with」「feat.」「×」で繋がっている共演者も配列に含む
- 「他」「and more」「etc.」はアーティスト名に入れない
- 「ゲスト:」以降のゲスト出演者も配列に含める
- 所属グループ名と個人名が両方ある場合は明記されている方を優先

## 日付 (date)
- 西暦フォーマット: YYYY-MM-DD のみ返す
- 「2026/4/26(土)」「2026年4月26日(土)」「4/26(土)」「4月26日」
- 年が省略されている場合は、文脈・今日の日付から判断（通常は今年か来年）
- 和暦（令和6年＝2024年、令和7年＝2025年、令和8年＝2026年）は西暦に変換
- 曜日は date には含めない（dateはYYYY-MM-DDのみ）
- 複数日開催（Day1/Day2/2days）の場合、最初の日付を返す

## タイトル (title)
- 副題（サブタイトル）も含めた正式名称
- 「○○ ONE MAN LIVE 『△△』」のような表記は全て含める
- 《》『』「」【】の装飾記号は保持

## memo に入れる情報
優先度高い順:
1. 販売フェーズ（FC先行・オフィシャル先行・一般発売・抽選など）
2. 1ドリンク別途（金額も含めて）
3. 座席種別（指定席・自由席・オールスタンディング）
4. 整理番号
5. 年齢制限（「未就学児入場不可」等）
6. ADV以外の価格情報（当日券の金額など）
7. 特典情報（チェキ・特典券配布など）
書式例: "FC先行 / 1ドリンク別途(¥600) / オールスタンディング / 当日 ¥4,000"

## 共通の重要注意事項
- **フライヤー画像内の文字も精読すること**。日時・会場・出演者はフライヤー内のみに記載されることが多い
- 画像内の複数情報（日付 / 時間 / 会場 / 出演者 / 料金）を見落とさずにすべて拾う
- 曖昧な情報は推測せず null を返す（Premium品質のため精度最優先）
- X/Twitterのポストの場合は「本文テキスト＋添付画像」の両方を総合的に判断する
- 出力は純粋な JSON のみ。\`\`\`jsonブロックや前置き/後書き（「以下が抽出結果です」等）は絶対に不要`

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
  ticketUrl: string | null      // チケット購入ページURL（本文内のtiget/pia等）
  saleStartDate: string | null  // チケット販売開始日 YYYY-MM-DD
  saleStartTime: string | null  // チケット販売開始時間 HH:MM
  sourceUrl: string
  coverImage?: string | null    // 主要画像URL（フライヤー）
  images?: string[] | null      // 追加画像URL（補助情報・マップ・セトリ等）
}

/**
 * X/Twitter URL から JSON API で全画像 + テキストを取得
 * 失敗したら null を返す（呼び出し元は HTML fallback へ）
 */
async function fetchXTweetData(url: string): Promise<{
  text: string
  imageUrls: string[]
} | null> {
  try {
    const u = new URL(url)
    if (u.hostname !== 'x.com' && u.hostname !== 'www.x.com' &&
        u.hostname !== 'twitter.com' && u.hostname !== 'www.twitter.com') {
      return null
    }
    u.hostname = 'api.fxtwitter.com'
    u.search = ''

    const res = await fetch(u.toString(), {
      headers: { 'User-Agent': 'Mozilla/5.0 (GRAPE event-import)' },
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) return null
    const data = await res.json()
    if (data.code !== 200 || !data.tweet) return null

    const tweet = data.tweet
    const imageUrls: string[] = (tweet.media?.photos ?? []).map((p: { url: string }) => p.url)
    return {
      text: tweet.text ?? '',
      imageUrls,
    }
  } catch {
    return null
  }
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

    // ─── Step 1: X/Twitter なら JSON API を先に試す（多枚画像対応） ───
    const xData = await fetchXTweetData(url)

    let pageTitle = ''
    let pageDescription = ''
    let textContent = ''
    let imageUrls: string[] = []

    if (xData) {
      // X/Twitter: JSON API の結果を使用
      pageTitle = ''
      pageDescription = ''
      textContent = xData.text
      imageUrls = xData.imageUrls
    } else {
      // 通常のWebページ: HTMLを取得してOGP/本文解析
      const htmlRes = await fetch(url, {
        headers: {
          'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
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
      const page = extractPageContent(html, url)
      pageTitle = page.title
      pageDescription = page.description
      textContent = page.textContent
      imageUrls = page.imageUrls
    }

    // ─── Step 2: メイン画像（フライヤー）を取得 ──────────────
    // AI解析には最初の成功した画像のみ使う（コスト抑制）
    let imageData: Awaited<ReturnType<typeof fetchImageAsBase64>> = null
    const availableImages: string[] = []
    for (const imgUrl of imageUrls) {
      // base64化できた画像だけ availableImages に積む（複数枚対応）
      const data = await fetchImageAsBase64(imgUrl)
      if (data) {
        if (!imageData) imageData = data // 最初の成功画像をAI入力に
        availableImages.push(imgUrl)
      }
      // 最大4枚まで（X は最大4枚制限）
      if (availableImages.length >= 4) break
    }

    const coverImage = availableImages[0] ?? null
    // 「画像」欄にはカバーアートを含めた全画像を保持（後から拡大・切替できるように）
    const allImages = availableImages

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

${pageTitle ? `ページタイトル: ${pageTitle}\n` : ''}${pageDescription ? `ページ説明: ${pageDescription}\n\n` : ''}ページ本文抜粋:
${textContent}

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
      parsed = extractJsonFromText<ExtractedEvent>(text)
    } catch (parseErr) {
      console.error('[event-from-url] JSON parse失敗:', text)
      return Response.json(
        { error: 'AIレスポンスの解析に失敗しました', raw: text },
        { status: 502 }
      )
    }

    parsed.sourceUrl = url
    parsed.coverImage = coverImage
    parsed.images = allImages.length > 0 ? allImages : null

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
