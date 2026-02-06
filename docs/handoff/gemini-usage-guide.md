# Gemini 2.0 Flash Implementation Handoff Guide

このドキュメントは、Googleの最新モデル `gemini-2.0-flash` を利用した安定した構造化データ抽出ロジックを、他のプロジェクト（Claude Code等）に移植するための仕様書兼実装ガイドです。

## 1. 概要
- **モデル**: `gemini-2.0-flash`
- **特徴**: 高速・低コスト・JSONモードのネイティブサポート
- **目的**: 安定したJSON出力を保証し、TypeScriptでの型安全性を確保する

## 2. 依存パッケージ
移植先プロジェクトで以下をインストールしてください。

```bash
npm install @google/generative-ai
# または
yarn add @google/generative-ai
```

## 3. 実装コード仕様 (`utils/ai-client.ts`)

以下のコードをコピーして、ユーティリティとして配置することを推奨します。

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

// 環境変数チェック (.envに GOOGLE_GENERATIVE_AI_API_KEY を設定すること)
const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
if (!apiKey) {
  console.warn("Using AIClient without GOOGLE_GENERATIVE_AI_API_KEY set.");
}

// クライアント初期化
const genAI = new GoogleGenerativeAI(apiKey || "");

// デフォルト設定
const DEFAULT_MODEL = "gemini-2.0-flash";

interface GenerateOptions {
  model?: string;
  temperature?: number;
  systemInstruction?: string;
}

export class AIClient {
  /**
   * 構造化データ(JSON)生成・抽出用メソッド
   * @template T 期待するレスポンス型
   */
  static async generateJSON<T>(
    prompt: string,
    options: GenerateOptions = {}
  ): Promise<T | null> {
    try {
      const modelName = options.model || DEFAULT_MODEL;
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: "application/json", // JSON強制出力
          temperature: options.temperature ?? 0.7,
        },
        systemInstruction: options.systemInstruction,
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return JSON.parse(text) as T;

    } catch (error) {
      console.error(\`[AIClient] Error with \${options.model || DEFAULT_MODEL}:\`, error);
      return null;
    }
  }

  /**
   * テキスト生成用メソッド
   */
  static async generateText(
    prompt: string,
    options: GenerateOptions = {}
  ): Promise<string> {
    try {
      const modelName = options.model || DEFAULT_MODEL;
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: options.temperature ?? 0.7,
        },
        systemInstruction: options.systemInstruction,
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();

    } catch (error) {
      console.error("[AIClient] Error generating text:", error);
      return "";
    }
  }
}
```

## 4. Claude Codeへの引き継ぎプロンプト

以下のテキストをコピーして、Claude Codeに入力してください。

```text
@Gemini実装について
# 指示
現在開発中のプロジェクトに、Googleの `gemini-2.0-flash` を利用したAI機能を実装したいです。
既存のベストプラクティスに基づいた以下の仕様で、`utils/ai-client.ts` ユーティリティを作成し、
それを使用して機能実装を進めてください。

# 要件
1. パッケージ: `@google/generative-ai` を使用
2. モデル: デフォルトで `gemini-2.0-flash` を使用
3. JSONモード: `generationConfig: { responseMimeType: "application/json" }` を活用し、安定したJSON出力を実現すること
4. 構成: シングルトンまたはスタティッククラスとして、どこからでも型安全に呼び出せるようにすること

# 参考コード仕様
(ここに docs/handoff/gemini-usage-guide.md の「3. 実装コード仕様」の内容を参照してください)
```
