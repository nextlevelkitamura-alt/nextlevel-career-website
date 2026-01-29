# CLAUDE.md (Project Context & Commands)

## ⚡️ Initialization
Claude Code起動時、このファイルを以下のコマンドで読み込んでください。**これが唯一の開始手順です。**

```text
/read palns/CLAUDE.md palns/AI_GUIDELINES.md palns/PROJECT_MASTER.md palns/DAILY_TASK.md
(Read these files and acknowledge with "PROJECT LOADED".)
```

## 🏗 Build & Run Commands
- **Dev Server**: `npm run dev`
- **Build**: `npm run build`
- **Lint**: `npm run lint`

## 🧪 Testing
- **Local Test**: `npm test` (if available)

## 📌 Context
このプロジェクトは「情報の3層構造」で管理されています。
1. **palns/AI_GUIDELINES.md**: 憲法。
2. **palns/PROJECT_MASTER.md**: 全体地図。
3. **palns/DAILY_TASK.md**: 現在地。

作業時は必ず `DAILY_TASK.md` を更新してください。
