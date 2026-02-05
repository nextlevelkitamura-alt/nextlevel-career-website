# Implementation Plan: attireカラムエラーの修正

## 1. Requirements Restatement

ユーザーが本日新しく追加した項目（通勤時間など）を入力して求人更新した際、以下のエラーが発生：

```
Could not find the 'attire' column of 'jobs' in the schema cache
```

**原因**:
- データベースには`attire_type`と`hair_style`カラムしか追加されていない
- しかしコード内では`attire`カラムに空文字列をセットしようとしている
- マイグレーションファイル`20260204_add_attire_hair_style_fields.sql`では`attire`カラムが追加されていない

**解決策**:
- `attire`カラムをデータベースに追加するマイグレーションを作成
- `jobs`テーブルと`draft_jobs`テーブル両方に追加

---

## 2. Risk Assessment

- **LOW**: データベースマイグレーション — 単純なカラム追加のみ
- **LOW**: 既存データへの影響 — 新規カラムなので既存データには影響なし
- **LOW**: コード変更 — 既に空文字列をセットしているので、マイグレーション後は動作

---

## 3. Dependencies

- Supabase（PostgreSQLデータベース）
- 既存マイグレーション: `20260204_add_attire_hair_style_fields.sql`

---

## 4. Implementation Phases

### Phase 1: マイグレーションファイルの作成

**ファイル**: `supabase/migrations/20260205_add_attire_column.sql`

**内容**:
```sql
-- 服装・髪型（まとめ）カラムを追加
-- jobs テーブル
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS attire text;

-- draft_jobs テーブル
ALTER TABLE draft_jobs ADD COLUMN IF NOT EXISTS attire text;
```

**タスク**:
- [ ] マイグレーションファイルを作成
- [ ] ローカルでマイグレーションをテスト（可能であれば）

### Phase 2: Supabaseでのマイグレーション実行

**手順**:
1. Supabaseダッシュボードにアクセス
2. SQL Editorを開く
3. マイグレーションファイルの内容を実行
4. または、CLIからマイグレーションを適用

**タスク**:
- [ ] Supabaseダッシュボードでマイグレーションを実行
- [ ] `jobs`テーブルに`attire`カラムが追加されたことを確認
- [ ] `draft_jobs`テーブルに`attire`カラムが追加されたことを確認

### Phase 3: 動作確認

**タスク**:
- [ ] 管理画面で求人を作成・更新してエラーが出ないことを確認
- [ ] 既存求人の表示が正しいことを確認

---

## 5. Estimated Complexity

- **Low**

理由:
- 単純なカラム追加のみ
- 既存コードは既に`attire`に空文字列をセットしているので、マイグレーション後は即座に動作
- 既存データへの影響なし（NULL許容のカラム）

---

## 6. Critical Files

| ファイル | 操作 | 優先度 |
|---|---|---|
| `supabase/migrations/20260205_add_attire_column.sql` | 新規作成 | **HIGH** |
| Supabaseデータベース | マイグレーション実行 | **HIGH** |

---

## 7. Verification Checklist

### マイグレーション確認
- [ ] `jobs`テーブルに`attire`カラムが存在することを確認
- [ ] `draft_jobs`テーブルに`attire`カラムが存在することを確認
- [ ] カラムの型が`text`であることを確認

### 動作確認
- [ ] 求人の新規作成がエラーなしで完了する
- [ ] 求人の更新がエラーなしで完了する
- [ ] ドラフト求人の作成・更新がエラーなしで完了する

---

## 8. Notes

### 既存コードの状態
コード内では既に`attire`カラムに空文字列をセットしている：

**EditJobForm.tsx**:
```typescript
formData.set("attire", "");
```

**create/page.tsx**:
```typescript
formData.set("attire", "");
```

**actions.ts**:
```typescript
const attire = formData.get("attire") as string;
// ...
attire,
```

そのため、マイグレーションを実行すれば、即座に動作する状態になっている。

### カラムの役割
- `attire`: 服装・髪型を一文で表現した文字列（例: "オフィスカジュアル、ネイルOK"）
- `attire_type`: 服装をプルダウンで選択（ビジネスカジュアル、自由、スーツ、制服貸与、その他）
- `hair_style`: 髪型をプルダウンで選択（特に指定なし、明るくなればよし、その他）

`attire`は後方互換性のために残してあるフィールドで、将来的には`attire_type`と`hair_style`に完全に置き換わる可能性がある。

---

⚠️ **重要：実装を開始するには必ず /tdd を実行してください！**
