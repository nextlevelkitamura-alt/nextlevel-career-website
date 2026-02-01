# PROJECT_MASTER (Lv.1: 全体設計図)

## プロジェクト概要
**Project Name**: Next Level Career Site
**Description**: キャリアアップを目指す求職者向けの求人検索・応募・相談プラットフォーム。

## 技術スタック
- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS
- **Backend/DB**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **UI Components**: Shadcn UI, Lucide React
- **Hosting**: Vercel

## ディレクトリ構成（主要なもの）
```
/app
  /admin       # 管理画面 (求人管理, ユーザー管理, マスタ管理)
  /auth        # 認証関連
  /jobs        # 求人検索・詳細
  /mypage      # 求職者マイページ (チャット, 応募履歴)
  /api         # API Routes
/components
  /ui          # Shadcn UIパーツ
  /admin       # 管理画面用コンポーネント
  /chat        # チャット機能コンポーネント
/utils
  /supabase    # Supabaseクライアント
```

## 基本ルール
- **デザイン**: モバイルファースト。レスポンシブ対応必須。
- **認証**: Supabase Auth を使用。ユーザー種別（admin/user）によるアクセス制御を徹底する。
- **アイコン**: Lucide React を使用。
