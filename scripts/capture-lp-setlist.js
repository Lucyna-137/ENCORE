/**
 * LP用・Setlist 機能スクショ撮影スクリプト
 *
 * 事前に dev server が http://localhost:3000 で立ち上がっていること
 *
 * 使い方:
 *   node scripts/capture-lp-setlist.js
 *
 * 出力:
 *   public/screenshots/lp-mobile/11-setlist-preview-event.png
 *     — EventPreviewScreen 内のセットリストプレビュー（7曲 + うろ覚えバッジ）
 *   public/screenshots/lp-mobile/12-setlist-editor.png
 *     — SetlistEditorSheet 編集画面（曲 + MC + ENCORE + うろ覚えトグル）
 *
 * ビューポート: 393×932 @ 2x DPR → 786×1864 PNG
 */

const VIEWPORT_WIDTH  = 393
const VIEWPORT_HEIGHT = 932

const { chromium } = require('playwright')
const path = require('path')

const BASE = 'http://localhost:3000'
const OUT_DIR = path.join(__dirname, '..', 'public', 'screenshots', 'lp-mobile')

// ── デモセトリデータ（架空曲） ─────────────────────────────────────
const DEMO_SETLIST = {
  liveId: 'l16',
  items: [
    { kind: 'song', title: '雨宿りサイダー', titleNormalized: '雨宿りサイダー' },
    { kind: 'song', title: '朝凪ボイス', titleNormalized: '朝凪ボイス' },
    { kind: 'song', title: 'Eclipse Bay', titleNormalized: 'EclipseBay' },
    { kind: 'mc', note: '久しぶりのここに帰ってきました…' },
    { kind: 'song', title: '影絵の森', titleNormalized: '影絵の森' },
    { kind: 'song', title: '十八時の特等席', titleNormalized: '十八時の特等席' },
    { kind: 'song', title: '三拍子のラブレター', titleNormalized: '三拍子のラブレター' },
    { kind: 'divider', label: 'ENCORE' },
    { kind: 'song', title: 'Satellite Diary', titleNormalized: 'SatelliteDiary' },
  ],
  approximate: true,
  updatedAt: '2026-04-23T10:00:00.000Z',
}

async function setupPremium(page) {
  await page.evaluate(() => {
    localStorage.setItem('grape-is-premium', 'true')
  })
}

async function injectSetlistData(page, data) {
  await page.evaluate((setlist) => {
    const store = {}
    store[setlist.liveId] = setlist
    localStorage.setItem('grape_setlists_v1', JSON.stringify(store))
  }, data)
}

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
  })
  await page.waitForTimeout(200)
}

async function hideDevIndicator(page) {
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

  console.log(`📸 Capturing Setlist LP screenshots (${VIEWPORT_WIDTH * 2}×${VIEWPORT_HEIGHT * 2} @ 2x DPR)`)
  console.log(`   → ${OUT_DIR}`)
  console.log('')

  // ─── 初期化: Premium + セトリデータ注入 ───────────────────
  await page.goto(`${BASE}/grape/tickets`, { waitUntil: 'networkidle' })
  await setupPremium(page)
  await injectSetlistData(page, DEMO_SETLIST)
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForTimeout(1200)
  await removePhoneFrame(page)
  await hideDevIndicator(page)
  await page.waitForTimeout(300)

  // ─── #11: EventPreview 内のセットリストプレビュー ────────
  process.stdout.write('  11-setlist-preview-event  ... ')
  try {
    // NOCTURNE 追加公演をタップ
    await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('button, [role="button"]'))
      const target = cards.find(c => (c.textContent || '').includes('NOCTURNE'))
      target?.click()
    })
    await page.waitForTimeout(700)

    // EventPreview 内スクロールを一番下に（SetlistSection + 編集ボタンが見えるまで）
    await page.evaluate(() => {
      const scrollables = Array.from(document.querySelectorAll('div')).filter(d => {
        const s = getComputedStyle(d)
        return (s.overflowY === 'auto' || s.overflowY === 'scroll') && d.scrollHeight > d.clientHeight
      })
      scrollables.forEach(s => { s.scrollTop = s.scrollHeight })
    })
    await page.waitForTimeout(500)

    await page.screenshot({
      path: path.join(OUT_DIR, '11-setlist-preview-event.png'),
      type: 'png',
      fullPage: false,
    })
    console.log('✅')
  } catch (e) {
    console.log(`❌ ${e.message}`)
  }

  // ─── #12: SetlistEditorSheet 編集画面 ───────────────────
  process.stdout.write('  12-setlist-editor         ... ')
  try {
    // 「全 7 曲を見る」ボタンをクリックして Editor を開く
    await page.evaluate(() => {
      const viewBtn = Array.from(document.querySelectorAll('button')).find(b =>
        /全 \d+ 曲を見る/.test(b.textContent || '')
      )
      viewBtn?.click()
    })
    await page.waitForTimeout(800)

    await page.screenshot({
      path: path.join(OUT_DIR, '12-setlist-editor.png'),
      type: 'png',
      fullPage: false,
    })
    console.log('✅')
  } catch (e) {
    console.log(`❌ ${e.message}`)
  }

  await browser.close()
  console.log('')
  console.log('Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
