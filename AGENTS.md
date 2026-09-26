# AGENTS.md

このRepositoryは `oosaka0123-sudo/ai-master` の共通Web制作標準に従う。

作業開始時:
1. ai-master の `AGENTS.md` を確認する。
2. ai-master の `WEB_DEVELOPMENT.md` を確認する。
3. このRepositoryのREADMEとcurrent codeを確認する。
4. Astro公式Documentationは採用バージョンに対応する内容を使う。

原則:
- Static First
- Zero-JS by default
- Islandsは必要部分だけ
- Astro標準機能を外部依存より優先
- Secretをcommitしない
- `npm run check` と `npm run build` を完了条件に含める
- Mobile / Preview / Productionを確認する

Projectへ複製して使う場合、Project固有要件はそのProjectの文書へ記録する。
