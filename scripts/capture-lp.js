/**
 * LP素材用スクリーンショット自動撮影スクリプト
 *
 * 事前にdev serverが http://localhost:3000 で立ち上がっていること
 *
 * 使い方:
 *   node scripts/capture-lp.js
 *
 * 出力先: public/screenshots/lp/
 * ビューポート: iPhone 14 Pro (393x852 @3x = 1179x2556 Retina)
 */

const { chromium, devices } = require('playwright')
const path = require('path')

const BASE = 'http://localhost:3000'
const OUT_DIR = path.join(__dirname, '..', 'public', 'screenshots', 'lp')

/**
 * 撮影対象リスト
 *   name:      保存ファイル名（拡張子なし）
 *   url:       遷移先パス
 *   setup:     遷移後に実行する処理（localStorage操作・クリック等）
 *   mode:      'full'（内部スクロールを展開してコンテンツ全体を撮影）
 *              'viewport'（標準iPhone 14 Proビューポートのまま撮影）
 *   wait:      撮影前の追加待機ms（デフォルト: 800）
 */
const SHOTS = [
  // ── カレンダー ──────────────────────────────────────────────────────────
  // Month/Week/Day は viewport サイズで丁度良い（全体が1画面に収まる）
  {
    name: '01-calendar-month',
    url: '/grape/calendar',
    setup: async (page) => {
      await page.evaluate(() => localStorage.setItem('grape-calendar-view', '月'))
      await page.reload({ waitUntil: 'networkidle' })
    },
    mode: 'viewport',
  },
  // List view は長いので全体を撮る
  {
    name: '02-calendar-list',
    url: '/grape/calendar',
    setup: async (page) => {
      await page.evaluate(() => localStorage.setItem('grape-calendar-view', 'リスト'))
      await page.reload({ waitUntil: 'networkidle' })
    },
    mode: 'full',
    wait: 1400,
  },

  // ── チケット ────────────────────────────────────────────────────────────
  { name: '03-tickets', url: '/grape/tickets', mode: 'full', wait: 1200 },

  // ── レポート（3分割 → 1枚の全体像に統合） ──────────────────────────────
  { name: '04-report', url: '/grape/report', mode: 'full', wait: 1400 },

  // ── アーティスト詳細（6名） ─────────────────────────────────────────────
  { name: '05-artist-aoi',      url: '/grape/artist/aoi',      mode: 'full', wait: 1200 },
  { name: '06-artist-nana',     url: '/grape/artist/nana',     mode: 'full', wait: 1200 },
  { name: '07-artist-mei',      url: '/grape/artist/mei',      mode: 'full', wait: 1200 },
  { name: '08-artist-koharu',   url: '/grape/artist/koharu',   mode: 'full', wait: 1200 },
  { name: '09-artist-lumenade', url: '/grape/artist/lumenade', mode: 'full', wait: 1200 },
  { name: '10-artist-luna',     url: '/grape/artist/luna',     mode: 'full', wait: 1200 },

  // ── 設定 ────────────────────────────────────────────────────────────────
  { name: '11-settings', url: '/grape/settings', mode: 'full', wait: 1000 },
]

/**
 * 各ページの「Phone frame」ラッパー（borderRadius 44 + boxShadow + 中央寄せpadding）を
 * 除去して、純粋なUIだけのフラットなスクショにする
 */
async function removePhoneFrame(page) {
  await page.evaluate(() => {
    const allDivs = Array.from(document.querySelectorAll('div'))
    allDivs.forEach(el => {
      const cs = getComputedStyle(el)

      // Phone frame: borderRadius 44px の要素を発見 → 角R/シャドウ除去 + 親もリセット
      if (cs.borderTopLeftRadius === '44px') {
        el.style.borderRadius = '0'
        el.style.boxShadow = 'none'

        // 直接の親（外側センタリング用ラッパー）から祖先3段まで余白除去
        let parent = el.parentElement
        for (let i = 0; i < 3 && parent; i++) {
          parent.style.padding = '0'
          parent.style.margin = '0'
          parent.style.background = 'var(--color-encore-bg)'
          parent.style.alignItems = 'flex-start'
          parent.style.minHeight = '0'
          parent = parent.parentElement
        }
      }
    })

    // body/html 外周の余白・背景もクリア
    document.body.style.background = 'var(--color-encore-bg)'
    document.body.style.margin = '0'
    document.body.style.padding = '0'
    document.documentElement.style.background = 'var(--color-encore-bg)'
    document.documentElement.style.margin = '0'
    document.documentElement.style.padding = '0'
  })
  await page.waitForTimeout(200)
}

/**
 * 内部スクロールコンテナとその親の高さ制約をすべて解放し、
 * 固定位置 TabBar を絶対位置に変えて文書末尾に配置
 */
async function releaseAllConstraints(page) {
  await page.evaluate(() => {
    // Step 1: 内部スクロールコンテナを全部展開
    const scrollables = Array.from(document.querySelectorAll('*')).filter(el => {
      const s = getComputedStyle(el)
      return (s.overflowY === 'auto' || s.overflowY === 'scroll') && el.scrollHeight > el.clientHeight
    })
    scrollables.forEach(el => {
      el.style.height = 'auto'
      el.style.maxHeight = 'none'
      el.style.overflow = 'visible'
      el.style.flex = 'none'
    })

    // Step 2: html/body も制約を外す
    document.documentElement.style.height = 'auto'
    document.documentElement.style.overflow = 'visible'
    document.body.style.height = 'auto'
    document.body.style.minHeight = 'auto'
    document.body.style.overflow = 'visible'

    // Step 3: 100vh / fixed height 指定の親を辿って解放（最大8段）
    if (scrollables[0]) {
      let parent = scrollables[0].parentElement
      for (let i = 0; i < 8 && parent; i++) {
        parent.style.height = 'auto'
        parent.style.maxHeight = 'none'
        parent.style.minHeight = 'auto'
        parent.style.overflow = 'visible'
        parent.style.flex = 'none'
        parent = parent.parentElement
      }
    }

    // Step 4: position: fixed の要素（TabBar等）は absolute に変換して末尾に配置
    Array.from(document.querySelectorAll('*')).forEach(el => {
      const s = getComputedStyle(el)
      if (s.position === 'fixed') {
        const rect = el.getBoundingClientRect()
        // ボトムに固定されている場合のみ絶対位置に変換
        if (parseFloat(s.bottom) === 0 || s.bottom === '0px') {
          el.style.position = 'absolute'
          el.style.bottom = '0'
          // 親が static な場合は親を relative にする
          let parent = el.parentElement
          while (parent && parent !== document.body) {
            const ps = getComputedStyle(parent)
            if (ps.position === 'static') {
              parent.style.position = 'relative'
            } else {
              break
            }
            parent = parent.parentElement
          }
        }
      }
    })
  })

  await page.waitForTimeout(400) // layout 再計算
}

async function main() {
  const browser = await chromium.launch()
  const context = await browser.newContext({
    ...devices['iPhone 14 Pro'],
    // カラースキームをlightに固定
    colorScheme: 'light',
  })
  const page = await context.newPage()

  console.log(`📸 Capturing ${SHOTS.length} screens to ${OUT_DIR}`)
  console.log('')

  for (const shot of SHOTS) {
    const filepath = path.join(OUT_DIR, `${shot.name}.png`)
    process.stdout.write(`  ${shot.name.padEnd(28)} ... `)

    try {
      await page.goto(`${BASE}${shot.url}`, { waitUntil: 'networkidle' })

      if (shot.setup) {
        await shot.setup(page)
      }

      // アニメーション・画像ロード待機
      await page.waitForTimeout(shot.wait ?? 800)

      // スマホ枠（角R / シャドウ / 外周余白）を除去（全ショット共通）
      await removePhoneFrame(page)

      if (shot.mode === 'full') {
        await releaseAllConstraints(page)
      }

      await page.screenshot({
        path: filepath,
        type: 'png',
        fullPage: shot.mode === 'full',
      })

      console.log('✅')
    } catch (err) {
      console.log(`❌ ${err.message}`)
    }
  }

  await browser.close()
  console.log('')
  console.log(`✨ Done! Files saved to: ${path.relative(process.cwd(), OUT_DIR)}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
