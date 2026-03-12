---
feature: 求人詳細ページのモバイルリッチ化
type: improvement
method: impl
created: 2026-02-17
status: planning
---

# 設計プラン: 求人詳細ページのモバイルリッチ化

> 参考: iDA (ida-mode.com) の求人詳細ページ

## 要件

スマホでの見やすさを最優先に、求人詳細ページをリッチ化する。
PCでも見栄え良く。おすすめ求人・エリア検索は今回実装しない。

## 改善ポイント

### Phase 1: 情報セクションを「1項目=1セクション」に変更

**現在**: grid-cols-3 のテーブル形式（dt/dd）
**改善後**: 各項目を太字見出し + divider で独立セクション化

変更するセクション（順序もiDA準拠に変更）:

1. **雇用形態** — 太字見出し + 値
2. **職種** — 太字見出し + 値
3. **給与** — 太字見出し + 時給（太字大きめ）+ 補足情報
4. **勤務地** — 太字見出し + エリア
5. **最寄駅** — 太字見出し + 駅名
6. **勤務地備考** — 太字見出し + アクセス情報
7. **勤務時間** — 太字見出し + 時間 + 実働/休憩
8. **休日休暇** — 太字見出し + 休日情報
9. **勤務期間** — 太字見出し + 期間（派遣のみ）
10. **研修期間** — 太字見出し + 期間/給与（派遣のみ）

### Phase 2: サマリーボックスの追加

タイトル直下に、グレー背景のサマリーボックスを追加:
- 職種（カテゴリ）
- 📍 勤務地（エリア）
- 🚃 最寄駅
- ¥ 時給/年収
- ⏰ 勤務時間

→ iDAと同様にアイコン付きで一目で把握できるようにする

### Phase 3: 仕事内容・応募資格・福利厚生の見せ方改善

- **対象となる方（応募資格）** — 箇条書きで見やすく
- **仕事内容** — 詳細な説明（改行・箇条書き対応済み）
- **福利厚生** — リスト形式で見やすく
- **服装・身だしなみ** — 現在のカード形式を維持（良い）
- **選考プロセス** — STEP形式に改善
- **応募方法** — 新規追加検討（説明テキスト）

### Phase 4: PC表示の調整

- サイドバー（応募ボタン）は維持
- メインコンテンツが1項目ずつになるため、適度な余白を確保
- PC時のmax-widthを調整して読みやすく

## 実装方針

**変更ファイル**: `app/jobs/[id]/page.tsx` のみ（メイン）

### 現在のテーブル形式:
```tsx
<dl className="divide-y divide-slate-100">
    <div className="py-4 grid grid-cols-3 gap-4">
        <dt className="text-sm font-bold text-slate-500">雇用形態</dt>
        <dd className="text-sm text-slate-900 col-span-2">{job.type}</dd>
    </div>
</dl>
```

### 改善後（1項目=1セクション）:
```tsx
<div className="divide-y divide-slate-200">
    <div className="py-6">
        <h3 className="text-base font-bold text-slate-900 mb-2">雇用形態</h3>
        <p className="text-slate-700">{job.type}</p>
    </div>
    <div className="py-6">
        <h3 className="text-base font-bold text-slate-900 mb-2">職種</h3>
        <p className="text-slate-700">{job.category}</p>
    </div>
    ...
</div>
```

## リスク評価

- **LOW**: UIのみの変更、データ構造の変更なし
- **LOW**: 既存データをそのまま活用

## 実装対象ファイル

- `app/jobs/[id]/page.tsx` — メイン変更
- （必要に応じて）コンポーネント分離

## 推奨実装方式

→ /impl（UI変更のみ）
