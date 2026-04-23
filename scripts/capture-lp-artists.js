/**
 * LP Hero Visual 用・アーティスト詳細画面のバッチ撮影
 *
 * 6 人分のアーティスト詳細画面（正方形写真・最上部まで）を
 * 786×1864 PNG で撮る。LP の Hero Visual でフェード切り替えに使う想定。
 *
 * 事前に dev server が http://localhost:3000 で立ち上がっていること
 *
 * 使い方:
 *   node scripts/capture-lp-artists.js
 *
 * 出力:
 *   public/screenshots/lp-mobile/hero-artist-{id}.png   × 6
 *
 * ビューポートと除去処理は capture-lp-mobile.js と同一:
 *   393×932 @ DPR 2 → 786×1864 PNG / phone frame 除去 / Next.js dev indicator 非表示
 */

const VIEWPORT_WIDTH  = 393
const VIEWPORT_HEIGHT = 932

const { chromium } = require('playwright')
const path = require('path')

const BASE = 'http://localhost:3000'
const OUT_DIR = path.join(__dirname, '..', 'public', 'screenshots', 'lp-mobile')

// src/lib/grape/dummyData.ts の ARTISTS と対応
const ARTIST_IDS = ['aoi', 'nana', 'mei', 'koharu', 'lumenade', 'luna']

async function setupPremium(page) {
  await page.evaluate(() => {
    localStorage.setItem('grape-is-premium', 'true')
  })
}

/** スマホ枠（borderRadius 44 + shadow + 外周余白）を除去 */
async function removePhoneFrame(page) {
  await page.evaluate(() => {
    const allDivs = Array.from(document.querySelectorAll('div'))
    allDivs.forEach((el) => {
      const cs = getComputedStyle(el)
      if (cs.borderTopLeftRadius === '44px') {
        el.style.borderRadius = '0'
        el.style.boxShadow = 'none'
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
    document.body.style.background = 'var(--color-encore-bg)'
    document.body.style.margin = '0'
    document.body.style.padding = '0'
    document.documentElement.style.background = 'var(--color-encore-bg)'
    document.documentElement.style.margin = '0'
    document.documentElement.style.padding = '0'
  })
  await page.waitForTimeout(200)
}

async function main() {
  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: { width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT },
    deviceScaleFactor: 2,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    isMobile: false,
    hasTouch: false,
    colorScheme: 'light',
  })
  const page = await context.newPage()

  console.log(`📸 Capturing ${ARTIST_IDS.length} artist hero screens (${VIEWPORT_WIDTH * 2}×${VIEWPORT_HEIGHT * 2} @ 2x DPR)`)
  console.log(`   → ${OUT_DIR}`)
  console.log('')

  for (const id of ARTIST_IDS) {
    const name = `hero-artist-${id}`
    const filepath = path.join(OUT_DIR, `${name}.png`)
    process.stdout.write(`  ${name.padEnd(34)} ... `)
    try {
      await page.goto(`${BASE}/grape/artist/${id}`, { waitUntil: 'networkidle' })
      await setupPremium(page)
      await page.reload({ waitUntil: 'networkidle' })
      await page.waitForTimeout(1400)
      await removePhoneFrame(page)
      await page.addStyleTag({ content: `
        nextjs-portal, next-route-announcer,
        [data-nextjs-toast], [data-nextjs-dev-tools-button],
        [data-nextjs-dialog-overlay], [data-nextjs-scroll-focus-boundary] {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
      ` })
      await page.waitForTimeout(100)
      await page.screenshot({ path: filepath, type: 'png', fullPage: false })
      console.log('✅')
    } catch (e) {
      console.log(`❌  ${e.message}`)
    }
  }

  await browser.close()
  console.log('')
  console.log('Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
