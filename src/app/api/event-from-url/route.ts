import Anthropic from '@anthropic-ai/sdk'
import { extractPageContent, fetchImageAsBase64, isGenericOgp } from '@/lib/event-extraction/parser'
import { fetchViaJina } from '@/lib/event-extraction/jinaFetch'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Honest User-Agent — なりすましせず、自サービスを明示
 * 403で弾かれた場合は Jina AI Reader に即フォールバック
 */
const GRAPE_UA = 'GRAPEbot/1.0 (+https://grape.app/bot; Premium event import on behalf of authenticated user)'

/**
 * 常に Jina Reader 経由で取得するドメイン
 * （直接fetchがSPA空骨 or bot保護で無意味な情報しか返さないサイト）
 */
const ALWAYS_USE_JINA = new Set([
  'l-tike.com',        // ローソンチケット — bot保護
  'eplus.jp',          // e+ — SPAで直接fetchだと骨のみ
  'cnplayguide.com',   // CNプレイガイド
  'peatix.com',        // Peatix — OGPが汎用
])

function shouldAlwaysUseJina(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '')
    return ALWAYS_USE_JINA.has(host)
  } catch { return false }
}

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
  "memo": "特筆すべき情報があれば（1ドリンク別途・チケット種別と価格・受付期間終了日・ステータス・特記事項など）、なければnull",
  "salePhase": "販売フェーズ（FC先行/オフィシャル先行/一般発売/抽選/先着等）、不明ならnull",
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
  - 対象サイト例: tiget.net / t.pia.jp / eplus.jp / l-tike.com / rakuten-ticket.jp / cnplayguide.com / ticket.rakuten.co.jp / iflyer.tv / peatix.com / zaiko.io / livepocket
  - 複数あればメイン販売サイトを選ぶ
  - Xの短縮URL（t.co/...）は展開後のURLを使う（ページ本文の facets 展開 replacement を参照）
- **salePhase**（販売フェーズ - 専用フィールド）:
  - 「FC先行」「オフィシャル先行」「OL先行」「一次先行」「二次先行」「最終先行」「一般発売」「一般販売」「一般先行」「抽選」「先着」「当日券」等
  - 複数あれば最も直近の / 現在進行中のものを優先
  - **eplus・チケットぴあ等でテーブル形式**の場合、ステータス「受付中」の行から抽出（「受付終了」「受付前」は除外）
- **saleStartDate / saleStartTime**:
  - 以下パターンから抽出（表記揺れ注意）:
    - 「チケット販売開始」「発売日」「チケット発売」「予約開始」「抽選受付開始」「先行予約開始」
    - **「受付期間:YYYY/M/D(曜)HH:MM～YYYY/M/D(曜)HH:MM」の開始側（eplus形式）**
    - **「YYYY/M/D(曜)HH:MM～」「3/23 19:00〜」「3月23日19時より」**
    - **「発売日時」「販売開始日時」**
  - 日付のみの場合は saleStartTime を null に
  - 時間のみで日付不明なら両方nullに
  - **期間表記の場合は開始日時を saleStartDate/Time に、終了日時は memo に記載**

### 具体例（必ずこの通りに処理すること）

**Example 1 (eplus の複数行テーブル):**
入力:
  "#### 先着★一般8:30～受付 一般発売
  受付期間:2026/3/12(木)19:00～2026/4/25(土)13:00
  スマチケ
  受付中
  #### 先着 一般8:30～受付 イープラス先行
  受付期間:2026/2/19(木)19:00～2026/3/12(木)18:59
  受付終了
  ##### 受付は全て終了しました"

→ **最初の「受付中」の行を抽出**。salePhase: "一般発売", saleStartDate: "2026-03-12", saleStartTime: "19:00"
→ memo に "受付期間: 2026/3/12 19:00〜2026/4/25 13:00 / スマチケ" 等
→ **「受付は全て終了しました」が最後にあっても、個別の「受付中」行が存在すれば販売中扱い**
→ 「受付終了」の行は無視。ただし複数フェーズ情報を memo に補足記載してよい

**Example 2 (単一行):**
入力:
  "チケット販売: 2026年3月23日(木) 19:00〜"
→ salePhase: null (フェーズ名明示なし), saleStartDate: "2026-03-23", saleStartTime: "19:00"

**Example 3 (tiget description):**
入力: "■チケット：当日支払い＜前売＞¥3,500 ＜当日＞¥4,000"
→ salePhase: "前売" (明示されていれば), price: 3500, memo: "当日¥4,000"
- **チケット種別が複数並ぶ場合**（指定席 ¥5,500 / 自由席 ¥4,500 / S席 / A席等）:
  - 最安 or 自由席価格を price に
  - 他の席種と価格は memo に "指定席 ¥5,500 / 自由席 ¥4,500" 形式で記載
- memo への販売フェーズ記載は継続（「FC先行 / オフィシャル先行 / 一次抽選 / 二次抽選 / 最終先行 / 抽選販売」等）
- 特殊な公演タイプ:
  - 「振替公演」「延期公演」→ memo に明記（分かれば元の日付も）
  - 「追加公演」→ memo に「追加公演」と明記
  - 「会場変更」「会場振替」→ memo に旧会場も記載

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

## memo に追記すべき補足情報（優先度順）
1. 販売フェーズ（FC先行・オフィシャル先行・一般発売・抽選・追加公演・振替公演）
2. 1ドリンク別途（金額も含めて）
3. 座席種別（指定席 / 自由席 / オールスタンディング / S席 / A席）と各価格
4. 整理番号順入場 / 入場時整理番号
5. 身分証提示 / 本人確認 / 顔写真付身分証の必要
6. 年齢制限（未就学児入場不可 / 未就学児膝上無料 / 小学生以上有料）
7. 転売禁止 / リセール対象
8. 発券方法（電子チケット / QR / スマチケ / コンビニ発券 / 紙チケット）
9. 当日券の有無（当日券あり / 当日券なし）
10. 女性エリア / レディースエリア
書式例: "FC先行 / 1ドリンク別途(¥600) / 指定席¥5,500 / 自由席¥4,500 / 整理番号順入場"

## サイト別 抽出のヒント
- **tiget.net**: \`<meta name="description">\` に全情報が凝縮されている（日付・会場・出演・OPEN/START・ADV/DOOR・1D別・住所）。description を精読し、タイトル側の重複は無視してよい。
- **t.pia.jp (チケットぴあ) / peatix.com**: 説明文が汎用テンプレ（「〇〇をチケットぴあで今すぐチェック」等）の場合、本文テキスト（Jinaマークダウン）と画像の方が情報量が多い。テンプレ文は参考程度に。
- **l-tike.com (ローチケ) mid= ページ**: 全国ツアー告知が多い。複数日程ある場合は最初の日付を date に、残りは memo に「他日程: 5/11(日)東京、5/17(土)大阪...」形式で記載。
- **eplus.jp (e+)**:
  - チケット種別ごとに価格が並ぶ（S席/A席/指定席/自由席）。最安/自由席価格を price に、他を memo に
  - **複数の販売フェーズ行がある場合、ステータス「受付中」または「受付前」の行を優先**（「受付終了」「予定枚数終了」は参考程度）
  - 「受付期間:YYYY/M/D(曜)HH:MM～YYYY/M/D(曜)HH:MM」の開始日時を saleStartDate/Time に、終了日時は memo に「受付終了: ○○」と記載
  - 「スマチケ」「紙チケット」等の受取方法は memo に記載
- **X/Twitter（fxtwitter経由）**: 投稿テキスト＋最大4枚の添付画像が来る。画像内のフライヤー文字を最優先、テキストは補助。
- 複数画像がある場合、**文字情報が多い画像（フライヤー・セトリ・詳細）を優先**して読み取ること。人物写真のみの画像は参考程度に。

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
  salePhase: string | null      // 販売フェーズ（FC先行/一般発売など）
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
    let fetchStrategy: 'x' | 'direct' | 'jina' | 'direct+jina' = 'direct'
    let isXSource = false

    if (xData) {
      // X/Twitter: JSON API の結果を使用
      isXSource = true
      fetchStrategy = 'x'
      textContent = xData.text
      imageUrls = xData.imageUrls
    } else {
      // 通常のWebページ: 特定ドメインは直接fetchをスキップして即 Jina
      let directOk = false
      const forceJina = shouldAlwaysUseJina(url)

      if (!forceJina) {
        try {
          const htmlRes = await fetch(url, {
            headers: {
              'User-Agent': GRAPE_UA,
              Accept: 'text/html,application/xhtml+xml',
              'Accept-Language': 'ja-JP,ja;q=0.9,en;q=0.8',
            },
            signal: AbortSignal.timeout(6_000),
          })
          if (htmlRes.ok) {
            const html = await htmlRes.text()
            const page = extractPageContent(html, url)
            pageTitle = page.title
            pageDescription = page.description
            textContent = page.textContent
            imageUrls = page.imageUrls
            directOk = true
            fetchStrategy = 'direct'
          }
        } catch { /* fall through to Jina */ }
      }

      // 直接fetchが失敗 or OGPが汎用 or 強制Jinaドメインの場合
      const needsJina = forceJina || !directOk || isGenericOgp(pageTitle, pageDescription, textContent)
      if (needsJina) {
        const jinaPage = await fetchViaJina(url, { timeoutMs: 12_000 })
        if (jinaPage) {
          pageTitle = jinaPage.title || pageTitle
          pageDescription = jinaPage.description || pageDescription
          textContent = jinaPage.textContent
          // 直接fetchで画像取れた場合はその情報も温存して合成
          imageUrls = [...new Set([...imageUrls, ...jinaPage.imageUrls])].slice(0, 4)
          fetchStrategy = directOk ? 'direct+jina' : 'jina'
        } else if (!directOk) {
          return Response.json(
            { error: 'ページを取得できませんでした。URLの公開ページであることを確認してください。' },
            { status: 422 }
          )
        }
      }
    }

    // ─── Step 2: メイン画像（フライヤー）を取得 ──────────────
    // AI解析には最大2枚まで使う（Xのみ2枚、他は1枚。コスト vs 精度のバランス）
    const maxAiImages = isXSource ? 2 : 1
    const aiImageDataList: NonNullable<Awaited<ReturnType<typeof fetchImageAsBase64>>>[] = []
    const availableImages: string[] = []
    for (const imgUrl of imageUrls) {
      const data = await fetchImageAsBase64(imgUrl)
      if (data) {
        if (aiImageDataList.length < maxAiImages) aiImageDataList.push(data)
        availableImages.push(imgUrl)
      }
      if (availableImages.length >= 4) break
    }

    const coverImage = availableImages[0] ?? null
    // 「画像」欄にはカバーアートを含めた全画像を保持（後から拡大・切替できるように）
    const allImages = availableImages

    // ─── Step 4: Claude Haiku Vision で構造化 ──────────────────
    const client = new Anthropic({ apiKey })

    const userContent: Anthropic.ContentBlockParam[] = []

    // 画像を順に追加（Xは最大2枚、他は最大1枚）
    for (const imageData of aiImageDataList) {
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
取得方法: ${fetchStrategy}

${pageTitle ? `ページタイトル: ${pageTitle}\n` : ''}${pageDescription ? `ページ説明: ${pageDescription}\n\n` : ''}ページ本文抜粋:
${textContent}

上記${aiImageDataList.length > 0 ? '＋添付画像' : ''}からイベント情報をJSONで返してください。`,
    })

    // システムプロンプトに cache_control を付与
    // → 同一セッション内で2回目以降の呼び出しがinput料金約90%オフになる
    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      system: [
        {
          type: 'text',
          text: EXTRACTION_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
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
