# Astro Web Starter

`ai-master/WEB_DEVELOPMENT.md` を実装へ落とし込んだ共通Astroスターターです。

## 方針

- Astro-first for content-focused websites
- Static First
- Zero-JS by default
- Islandsは必要なUIだけ
- Content Collectionsは反復コンテンツへ
- `astro:assets` を画像最適化の第一選択にする
- 外部依存を必要最小限にする
- Mobile / Accessibility / SEO / Core Web Vitalsを標準品質にする

Astroそのものを目的にしません。Webアプリ等で別構成が合理的なら、Project側へ理由を残して変更します。

## Start

```bash
npm install
cp .env.example .env
npm run dev
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
npm run dev
```

## 最初に変更する項目

1. `.env` の `SITE_URL`
2. `src/config/site.ts` のサイト名・説明・locale・author
3. `public/favicon.svg`
4. `public/og-default.svg`
5. サンプル `src/content/posts/welcome.md`

`SITE_URL=https://example.com` のまま本番公開しないでください。

## Commands

```bash
npm run dev
npm run check
npm run build
npm run preview
npm run ci
```

## Rendering

デフォルトはStaticです。

SSR / on-demand renderingが必要になった場合だけ、採用Hostingに合うAdapterをProject側で追加してください。

SSRへ切り替える前に確認する要件:

- 認証
- 個別化
- リアルタイムデータ
- Server-only secret
- Request-time処理

## Content

ブログ・ニュース・FAQ・スポット等の反復データは `src/content.config.ts` のschemaをProject用に変更します。

固定ページまでContent Collectionsへ押し込まないでください。

## CI

GitHub Actionsで以下を実行します。

1. `npm ci`
2. `npm run check`
3. `npm run build`

CI失敗を無視して本番へ反映しません。

## Source of Truth

共通Web標準:
- `oosaka0123-sudo/ai-master/WEB_DEVELOPMENT.md`

共通Security / SSOT:
- `oosaka0123-sudo/ai-master/AGENTS.md`

Project固有の仕様・Hosting・Domain・API・SEO・Release手順は、このスターターではなく各Project Repositoryを正本にします。
