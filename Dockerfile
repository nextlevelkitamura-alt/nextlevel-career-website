# ===============================================
# Stage 1: Dependencies
# ===============================================
FROM node:20-alpine AS deps
WORKDIR /app

# package.jsonとlock fileをコピー
COPY package.json package-lock.json* ./

# 依存関係をインストール（devDependenciesも含める）
RUN npm ci && \
    npm cache clean --force

# ===============================================
# Stage 2: Builder
# ===============================================
FROM node:20-alpine AS builder
WORKDIR /app

# 依存関係をdepsステージからコピー
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# ビルド時引数として環境変数を受け取る
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_CALCOM_APPLY_URL
ARG NEXT_PUBLIC_CALCOM_CONSULT_URL

# 環境変数（ビルド時に必要な公開変数のみ）
# 秘密鍵はビルド時に不要なため設定しない
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_CALCOM_APPLY_URL=$NEXT_PUBLIC_CALCOM_APPLY_URL
ENV NEXT_PUBLIC_CALCOM_CONSULT_URL=$NEXT_PUBLIC_CALCOM_CONSULT_URL

# Next.jsをビルド（standaloneモード有効化が前提）
RUN npm run build

# ===============================================
# Stage 3: Runner（本番実行環境）
# ===============================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 非rootユーザーを作成
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# 必要なファイルのみコピー
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

# Cloud RunのPORTは動的に割り当てられる
EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
