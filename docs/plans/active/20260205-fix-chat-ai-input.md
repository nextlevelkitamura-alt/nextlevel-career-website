# Implementation Plan: AI相談機能の入力バグ修正

## 1. Requirements Restatement

ユーザーの問題：
- 「AIで修正・追加」ボタンのチャット機能で**エンターキーで入力できない**
- **会話を始めることができない**

### 原因分析

`ChatAIRefineDialog.tsx` で `onKeyPress` イベントを使用していることが原因。

**問題のコード（180-185行目）**:
```typescript
const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
};
```

**問題点**:
1. `onKeyPress` は非推奨（deprecated）イベント
2. 日本語入力（IME）の変換確定時に誤動作する
3. `isComposing` のチェックがない（IME入力中かどうかの判定がない）

### 正しい実装（ChatInterface.tsxの例）

```typescript
const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        // IME変換中はスキップ
        if ((e.nativeEvent as any).isComposing) {
            return;
        }
        e.preventDefault();
        handleSubmit(e as unknown as React.FormEvent);
    }
};
```

## 2. Risk Assessment

- **LOW**: 修正範囲が限定的（1ファイル）
- **LOW**: 既存機能の破壊リスクなし（バグ修正のみ）
- **NONE**: DBやAPIへの影響なし

## 3. Dependencies

- 追加ライブラリ: なし
- 外部サービス: なし

## 4. Implementation Phases

### Phase 1: ChatAIRefineDialog.tsx の修正

**対象ファイル**: `components/admin/ChatAIRefineDialog.tsx`

**タスク**:
- [ ] `handleKeyPress` → `handleKeyDown` にリネーム
- [ ] IME composing チェックを追加
- [ ] `onKeyPress` → `onKeyDown` に変更（300行目のinput要素）

**修正後のコード**:
```typescript
const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        // IME変換中（日本語入力など）はスキップ
        if ((e.nativeEvent as any).isComposing) {
            return;
        }
        e.preventDefault();
        handleSend();
    }
};
```

**input要素の修正**:
```tsx
<input
    type="text"
    value={input}
    onChange={(e) => setInput(e.target.value)}
    onKeyDown={handleKeyDown}  // ← onKeyPress から変更
    ...
/>
```

### Phase 2: テスト検証

**タスク**:
- [ ] 日本語入力で変換確定後にメッセージが送信されないことを確認
- [ ] 変換完了後のEnterでメッセージが送信されることを確認
- [ ] Shift+Enterで改行ができることを確認（将来的にtextareaに変更する場合）
- [ ] 送信ボタンクリックが正常に動作することを確認

## 5. Estimated Complexity

- **Low**

理由:
- 1ファイルのみの修正
- 既存パターン（ChatInterface.tsx）をそのまま適用
- テストも最小限

## 6. Critical Files

| ファイル | 変更内容 | 優先度 |
|---|---|---|
| `components/admin/ChatAIRefineDialog.tsx` | `onKeyPress` → `onKeyDown` + IMEチェック追加 | **HIGH** |

## 7. Verification Checklist

### 機能確認
- [ ] 日本語入力で「タイトルを修正して」と入力し、変換確定でEnterを押しても送信されない
- [ ] 変換確定後、再度Enterを押すとメッセージが送信される
- [ ] 英語入力でEnterを押すと即座に送信される
- [ ] 送信ボタンクリックで送信される
- [ ] AIの応答が正常に表示される

### ビルド確認
- [ ] `npx tsc --noEmit` で型エラーなし
- [ ] `npm run build` でビルド成功
