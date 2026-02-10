---
title: 求人の見え方改善
status: design
assigned: gemini
created: 2026-02-09
---

# 求人の見え方改善

## 概要
求人カードUI、詳細ページの情報構成、おすすめ表示の改善

## 対象ファイル
- `components/JobCard.tsx` — 求人カードコンポーネント
- `app/jobs/[id]/page.tsx` — 求人詳細ページ
- `components/RecommendedJobs.tsx` — おすすめ求人コンポーネント（存在する場合）

## デザイン要件

### カードUI（情報重視・Indeed風）
- 給与、場所、休日などの情報を優先的に表示
- 現在の情報量を維持しつつ、より見やすく
- 雇用形態・タグの配色は維持（正社員=青、派遣=ピンク）

### 詳細ページ（重要情報固定）
- 給与、応募ボタンなどの重要情報を常に見える位置に
- スクロールしてもCTAがアクセシブルに

### 配色・雰囲気
- 現在のオレンジ系（primary-600/700など）を維持
- Tailwind CSS のカラースキームを尊重
- 既存の `getEmploymentTypeStyle()`、`getJobTagStyle()` を継続使用
