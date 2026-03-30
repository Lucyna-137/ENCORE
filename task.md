# ENCORE タスク管理

## 仕掛かり中

（現在なし）

---

## あとで実行

（現在なし）

---

## 完了済み（直近）

- [x] localStorage 永続化（`useGrapeStore`）実装
- [x] `tickets/page.tsx` → `useGrapeStore` に移行
- [x] `report/page.tsx` → `useGrapeStore` に移行
- [x] `CalendarListView.tsx` → `artists` prop 化（dummyData 参照を除去）
- [x] タイムピッカー 5分単位に変更
- [x] タイムピッカー スマートデフォルト（現在時刻・前後関係考慮）
- [x] ライブタイプ更新（リリイベ → リリースイベント、メディア出演・その他 追加）
- [x] QuickEventSheet → `onAddArtist` prop 経由でストアに保存
- [x] 新規アーティスト登録時にリストの先頭に追加
- [x] Settings — アーティスト管理UI（一覧・編集・削除）
- [x] Settings — AppSummaryCard の統計値を動的化（lives.length / artists.length）
- [x] ColorPicker — null = 規定の色（デフォルト）スウォッチを先頭に追加
- [x] ColorPicker — カレンダー（Month / Week / Day）の各イベントコマに `live.color` を反映
- [x] QuickEventSheet — 「イベントの色」行を追加（タップでカラーピッカー展開）
- [x] Settings — アーティスト編集: 画像アップロード UI（タップ→オーバーレイ→ファイル選択→base64保存）
- [x] Settings — アーティスト編集: 誕生日フィールド追加（GrapeArtist.birthday?: string）
