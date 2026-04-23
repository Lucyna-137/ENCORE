/**
 * Phase 3 実装機能のスクリーンショット自動撮影
 *
 * 事前に dev server が http://localhost:3000 で立ち上がっていること
 *
 * 使い方:
 *   node scripts/capture-phase3.js
 *
 * 出力先: public/screenshots/phase3/
 * ビューポート: iPhone 14 Pro
 *
 * 撮影内容:
 *   1-last-tab-restore.png        — /grape → /grape/report への last-tab 復帰
 *   2-same-day-preview.png        — MiniEventSheet 同日プレビュー（重複警告）
 *   3-calendar-urgency-markers.png — Calendar セルに期限マーカー（danger + warn）
 *   4-listview-week-conflict.png  — ListView 週次合算 + ダブルブッキング警告
 */

const { chromium, devices } = require('playwright')
const path = require('path')

const BASE = 'http://localhost:3000'
const OUT_DIR = path.join(__dirname, '..', 'public', 'screenshots', 'phase3')

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

/** 期限マーカー用: PHAROS FES と LIGHTS CIRCUIT の期限データを差し替える */
async function injectUrgencyDemoData(page) {
  await page.evaluate(() => {
    const raw = localStorage.getItem('grape_lives_v1')
    if (!raw) return
    const lives = JSON.parse(raw)
    const pharos = lives.find((l) => l.title === 'PHAROS FES 2026')
    if (pharos) {
      // 2日先 = danger (pulse red)
      pharos.ticketDeadline = '2026-04-24'
    }
    const lights = lives.find((l) => l.title.includes('LIGHTS CIRCUIT'))
    if (lights) {
      // 4日先 = warn (amber)
      lights.ticketStatus = 'waiting'
      lights.announcementDate = '2026-04-26'
    }
    localStorage.setItem('grape_lives_v1', JSON.stringify(lives))
  })
}

/** 同日プレビュー用: 4/25 の Day view で 9:00-15:00 をドラッグして MiniEventSheet を重複表示 */
async function openMiniSheetWithOverlap(page) {
  // Day view & 4/25 に移動
  await page.evaluate(() => localStorage.setItem('grape-calendar-view', '日'))
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForTimeout(800)
  // 今日(4/22)から次へ3回移動して 4/25
  for (let i = 0; i < 3; i++) {
    await page.evaluate(() => {
      const svgs = Array.from(document.querySelectorAll('svg'))
      const nextCaret = svgs.find((s) => {
        const r = s.getBoundingClientRect()
        return r.x > 320 && r.y < 250 && r.y > 120
      })
      const btn = nextCaret?.closest('button')
      btn?.click()
    })
    await page.waitForTimeout(300)
  }
  await page.waitForTimeout(500)

  // イベントブロックの実測座標を取得（存在する event block の真上10:00ラインを使う）
  // React のポインタハンドラが確実に発火するよう、evaluate 内で PointerEvent を直接ディスパッチ
  await page.evaluate(() => {
    const eventBlock = document.querySelector('[data-event-block="true"]')
    const eventArea = eventBlock && eventBlock.parentElement
    if (!eventArea) return
    const br = eventBlock.getBoundingClientRect()
    const ar = eventArea.getBoundingClientRect()
    const HOUR_H = 56
    const xCenter = ar.x + ar.width / 2
    const startY = br.y - 2 * HOUR_H + 10 // 9:00 付近（ブロックの2h上）
    const endY = br.y + 4 * HOUR_H         // 15:00（ブロック内=重複）

    const common = {
      pointerId: 1,
      pointerType: 'mouse',
      isPrimary: true,
      button: 0,
      bubbles: true,
      cancelable: true,
      composed: true,
    }
    eventArea.dispatchEvent(new PointerEvent('pointerdown', { ...common, buttons: 1, clientX: xCenter, clientY: startY }))
    const steps = 12
    for (let i = 1; i <= steps; i++) {
      const y = startY + ((endY - startY) * i) / steps
      eventArea.dispatchEvent(new PointerEvent('pointermove', { ...common, buttons: 1, clientX: xCenter, clientY: y }))
    }
    eventArea.dispatchEvent(new PointerEvent('pointerup', { ...common, buttons: 0, clientX: xCenter, clientY: endY }))
  })
  await page.waitForTimeout(800)
}

/** ListView で 4/13-4/19 の週区切り + ダブルブッキング警告が同時に見える位置にスクロール */
async function scrollToWeekWithConflicts(page) {
  // List view & 2026 タブ
  await page.evaluate(() => localStorage.setItem('grape-calendar-view', 'リスト'))
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForTimeout(800)
  // 2026 タブをクリック
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('*')).filter(
      (el) => el.textContent?.trim() === '2026' && el.tagName === 'DIV' && el.children.length === 0,
    )
    const parent = tabs[0]?.closest('div[style*="cursor"]') || tabs[0]?.parentElement
    parent?.click?.()
  })
  await page.waitForTimeout(600)
  // 4/13-4/19 の週チップへスクロール
  await page.evaluate(() => {
    const chips = Array.from(document.querySelectorAll('div')).filter(
      (d) => d.style.borderRadius === '999px' && d.textContent?.includes('4/13'),
    )
    chips[0]?.scrollIntoView({ block: 'start' })
  })
  await page.waitForTimeout(500)
}

/** ─── 撮影ステップ定義 ─── */
const SHOTS = [
  {
    name: '1-last-tab-restore',
    description: 'last-tab 復帰（/grape → 最後に開いていた report へリダイレクト）',
    async run(page) {
      // last-tab を report にセットしてから /grape へ
      await page.goto(`${BASE}/grape/settings`, { waitUntil: 'networkidle' })
      await page.evaluate(() => localStorage.setItem('grape-last-tab', 'report'))
      await page.goto(`${BASE}/grape`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(1200)
      // /grape/report に飛んでいるはず
      await removePhoneFrame(page)
    },
  },
  {
    name: '2-same-day-preview',
    description: 'MiniEventSheet 同日プレビュー（時間帯重複で赤色警告）',
    async run(page) {
      await page.goto(`${BASE}/grape/calendar`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(500)
      await openMiniSheetWithOverlap(page)
      await removePhoneFrame(page)
      await page.waitForTimeout(200)
    },
  },
  {
    name: '3-calendar-urgency-markers',
    description: 'Calendar 期限マーカー（danger=赤パルス + warn=琥珀）',
    async run(page) {
      // 先にデータを書き換え、その後 Month view へ
      await page.goto(`${BASE}/grape/calendar`, { waitUntil: 'networkidle' })
      await injectUrgencyDemoData(page)
      await page.evaluate(() => localStorage.setItem('grape-calendar-view', '月'))
      await page.reload({ waitUntil: 'networkidle' })
      await page.waitForTimeout(1000)
      await removePhoneFrame(page)
    },
  },
  {
    name: '4-listview-week-conflict',
    description: 'ListView 週次合算チップ + ダブルブッキング警告',
    async run(page) {
      await page.goto(`${BASE}/grape/calendar`, { waitUntil: 'networkidle' })
      await scrollToWeekWithConflicts(page)
      await removePhoneFrame(page)
      await page.waitForTimeout(200)
    },
  },
]

async function main() {
  const browser = await chromium.launch()
  const iphone = devices['iPhone 14 Pro']
  const context = await browser.newContext({
    ...iphone,
    isMobile: false,   // pointer events を通常のマウスとして扱う
    hasTouch: false,   // text selection 干渉を避ける
    colorScheme: 'light',
  })
  const page = await context.newPage()

  console.log(`📸 Capturing ${SHOTS.length} Phase 3 screens to ${OUT_DIR}`)
  console.log('')

  for (const shot of SHOTS) {
    const filepath = path.join(OUT_DIR, `${shot.name}.png`)
    process.stdout.write(`  ${shot.name.padEnd(32)} ... `)
    try {
      await shot.run(page)
      await page.screenshot({ path: filepath, type: 'png', fullPage: false })
      console.log(`✅  ${shot.description}`)
    } catch (err) {
      console.log(`❌ ${err.message}`)
    }
  }

  // データ復元（次回走行のため、またはユーザーが手動で確認する際に影響しないように）
  await page.evaluate(() => {
    const raw = localStorage.getItem('grape_lives_v1')
    if (!raw) return
    const lives = JSON.parse(raw)
    const pharos = lives.find((l) => l.title === 'PHAROS FES 2026')
    if (pharos) pharos.ticketDeadline = '2026-04-30'
    const lights = lives.find((l) => l.title.includes('LIGHTS CIRCUIT'))
    if (lights) {
      lights.ticketStatus = 'before-sale'
      lights.announcementDate = '2026-04-10'
    }
    localStorage.setItem('grape_lives_v1', JSON.stringify(lives))
  })

  await browser.close()
  console.log('')
  console.log(`✨ Done! Files saved to: ${path.relative(process.cwd(), OUT_DIR)}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
