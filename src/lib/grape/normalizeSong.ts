/**
 * 曲名の正規化（検索・重複判定用キーの生成）
 *
 * Setlist における「同じ曲」の判定を安定させるための純粋関数。
 * SetlistSong.titleNormalized にこの関数の戻り値を格納する。
 *
 * ── 適用するルール ───────────────────────────────────────
 *   1. NFKC 正規化   — 全角/半角・合成文字を統一（"①" → "1"、"ｶﾀｶﾅ" → "カタカナ"）
 *   2. 空白削除       — 半角/全角スペース・タブ・改行をすべて削除
 *   3. 長音統一       — '‐' '-' '—' '–' '−' を 'ー'（カタカナ長音）に統一
 *
 * ── あえて適用しないルール（意図的）────────────────────
 *   - ひらがな ⇔ カタカナ変換:
 *       「ありがとう」と「アリガトウ」は意図的に別曲として扱う。
 *       アーティストが意図的に表記を使い分けるケース（特にライブタイトル・
 *       リミックス版など）を尊重するため。将来のトグル設定も導入しない方針
 *       （task.md の設計判断 2026-04-22 参照）。
 *   - 大文字/小文字:
 *       NFKC で全角英数字は半角化されるが、小文字化はしない。
 *       「LOVE」と「Love」は別表記として尊重する。
 *
 * ── 使用例 ───────────────────────────────────────────────
 *   normalizeSong('憂う門には福来たる')         → '憂う門には福来たる'
 *   normalizeSong('Ｃｉｔｙｌｉｇｈｔｓ')        → 'Citylights'
 *   normalizeSong('六畳 夢想')                  → '六畳夢想'
 *   normalizeSong('キミノ–ネイロ')              → 'キミノーネイロ'
 *   normalizeSong('ありがとう') === normalizeSong('アリガトウ')  → false（別曲）
 *
 * @param title 原文の曲名
 * @returns 正規化済みキー（空文字は空文字のまま返す）
 */
export function normalizeSong(title: string): string {
  if (!title) return ''
  return title
    .normalize('NFKC')
    // 空白系を全削除（半角スペース / タブ / 改行 / 全角スペース U+3000）
    .replace(/[\s\u3000]+/g, '')
    // 長音系の統一（ハイフン類 → カタカナ長音）
    .replace(/[‐\-—–−]/g, 'ー')
}

// ─── 手動テストケース ────────────────────────────────────────
//
// 開発時は以下をブラウザコンソールや Node で確認:
//
//   import { normalizeSong } from '@/lib/grape/normalizeSong'
//
//   console.assert(normalizeSong('憂う門には福来たる') === '憂う門には福来たる')
//   console.assert(normalizeSong('Ｃｉｔｙｌｉｇｈｔｓ') === 'Citylights')
//   console.assert(normalizeSong('  六畳　夢想  ') === '六畳夢想')
//   console.assert(normalizeSong('キミノ–ネイロ') === 'キミノーネイロ')
//   console.assert(normalizeSong('') === '')
//   // ひらがな/カタカナは別扱い
//   console.assert(normalizeSong('ありがとう') !== normalizeSong('アリガトウ'))
