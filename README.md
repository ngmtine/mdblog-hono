# mdblog-hono

[ngmtine.com](https://www.ngmtine.com)

- ホスト先: cloudflare workers
- フレームワーク: hono
- スタイリング: tailwind
- DB（like機能のためだけ）: supabase
- 記事リポジトリ: github（ビルド時cloneしてSSG）

### セットアップ

依存関係のインストール

```bash
npm install
```

環境変数の設定（`.env`の作成）

開発サーバーの起動

```bash
npm run dev
```

### ビルド & プレビュー

```bash
npm run build
npm run preview
```

### 手動デプロイ

```bash
npm run deploy
```


## 記事

記事用に別リポジトリを準備し、 `posts/` ディレクトリにMarkdownファイルを配置

```markdown
---
id: 1
title: 記事タイトル
create_date: 2025-01-01
genre: Tech
published: true
---

記事の本文...
```

記事リポジトリの `images/` ディレクトリに画像を配置し、Markdown内で参照

```markdown
![alt text](images/example.png)
```