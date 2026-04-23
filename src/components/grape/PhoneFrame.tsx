'use client'

import React from 'react'
import ToastHost from './ToastHost'

/**
 * PhoneFrame — Grapeの全画面ページ共通ラッパー
 *
 * デスクトップ（≥900px）: 393×852 のiPhone風フレーム（角R・シャドウ・外周余白あり）
 *                          開発・デザインプレビュー用
 * モバイル（<900px）:       全画面表示（フレーム・角R・シャドウなし）
 *                          実機・Capacitor での通常表示
 *
 * 切り替えは `src/app/globals.css` のメディアクエリで制御。
 *
 * ToastHost を内包しており、全ページで `useGrapeToast().show()` で
 * トーストを表示できる（フレーム内に重なって表示される）。
 */
interface PhoneFrameProps {
  children: React.ReactNode
  /**
   * 中身をフレーム中央に配置する（空状態・エラー画面用）。
   * デフォルトは column スタック（上詰め）。
   */
  center?: boolean
}

export default function PhoneFrame({ children, center = false }: PhoneFrameProps) {
  return (
    <div className="grape-outer">
      <div className={`grape-phone-frame${center ? ' grape-phone-frame--center' : ''}`}>
        {children}
        <ToastHost />
      </div>
    </div>
  )
}
