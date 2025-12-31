# mdblog-hono

HonoX + Cloudflare Workers で構築したMarkdownブログシステム

## 機能

- Markdownファイルからの静的サイト生成（SSG）
- Cloudflare Workersへのデプロイ
- ダークモード対応
- OGP画像の自動生成
- いいねボタン（PostgreSQL）
- SNSシェアボタン（Twitter、はてなブックマーク）

## ローカル開発

### 必要なもの

- Node.js 20+
- npm

### セットアップ

1. 依存関係のインストール

```bash
npm install
```

2. 環境変数の設定

`.env`ファイルを作成：

```env
VITE_POSTS_REPO_URL=git@github.com:username/posts-repo.git
VITE_POSTS_REPO_DIR=posts_repo
VITE_BASE_URL=http://localhost:8788
VITE_SITE_TITLE=My Blog
VITE_AUTHOR=Your Name
VITE_GITHUB_USERNAME=username
VITE_TWITTER_USERNAME=username
VITE_DB_CONNECTION_STRING=postgresql://...
```

3. 開発サーバーの起動

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

## CI/CD 自動デプロイ設定

記事リポジトリへのpushで自動的にデプロイするための設定手順です。

### 1. GitHub Personal Access Token (PAT) の作成

2つのPATが必要です：

#### PAT 1: 記事リポジトリ読み取り用（メインリポジトリで使用）

1. GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens
2. 「Generate new token」をクリック
3. 設定：
   - Token name: `mdblog-posts-read`
   - Expiration: 任意
   - Repository access: 「Only select repositories」→ 記事リポジトリを選択
   - Permissions → Repository permissions → Contents: `Read-only`
4. 「Generate token」をクリックしてトークンをコピー

#### PAT 2: デプロイトリガー用（記事リポジトリで使用）

1. GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens
2. 「Generate new token」をクリック
3. 設定：
   - Token name: `mdblog-dispatch`
   - Expiration: 任意
   - Repository access: 「Only select repositories」→ メインリポジトリ（mdblog-hono）を選択
   - Permissions → Repository permissions → Contents: `Read and write`
4. 「Generate token」をクリックしてトークンをコピー

### 2. Cloudflare API Token の作成

1. Cloudflare Dashboard → My Profile → API Tokens
2. 「Create Token」をクリック
3. 「Edit Cloudflare Workers」テンプレートを使用
4. 必要に応じてアカウントとゾーンを設定
5. 「Continue to summary」→「Create Token」
6. トークンをコピー

### 3. メインリポジトリ（mdblog-hono）の設定

GitHub → mdblog-honoリポジトリ → Settings → Secrets and variables → Actions

#### Secrets（「New repository secret」で追加）

| Name | 値 |
|------|-----|
| `GH_TOKEN` | PAT 1（記事リポジトリ読み取り用） |
| `CLOUDFLARE_API_TOKEN` | Cloudflare APIトークン |
| `POSTS_REPO` | 記事リポジトリのフルパス（例: `username/my-posts`） |

#### Variables（「Variables」タブ →「New repository variable」で追加）

| Name | 値 |
|------|-----|
| `VITE_POSTS_REPO_DIR` | `posts_repo` |
| `VITE_BASE_URL` | `https://your-site.workers.dev` |
| `VITE_SITE_TITLE` | サイトタイトル |
| `VITE_AUTHOR` | 著者名 |
| `VITE_GITHUB_USERNAME` | GitHubユーザー名 |
| `VITE_TWITTER_USERNAME` | Twitterユーザー名 |

### 4. 記事リポジトリの設定

GitHub → 記事リポジトリ → Settings → Secrets and variables → Actions

#### Secrets（「New repository secret」で追加）

| Name | 値 |
|------|-----|
| `DISPATCH_TOKEN` | PAT 2（デプロイトリガー用） |

#### ワークフローファイルの配置

記事リポジトリに `.github/workflows/trigger-deploy.yml` を作成：

```yaml
name: Trigger Blog Deploy

on:
  push:
    branches: [main]

jobs:
  trigger:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger deployment
        run: |
          curl -X POST \
            -H "Accept: application/vnd.github.v3+json" \
            -H "Authorization: token ${{ secrets.DISPATCH_TOKEN }}" \
            https://api.github.com/repos/${{ github.repository_owner }}/mdblog-hono/dispatches \
            -d '{"event_type": "posts-updated"}'
```

### 5. 動作確認

1. 記事リポジトリに変更をpush
2. 記事リポジトリのActions → 「Trigger Blog Deploy」が実行される
3. メインリポジトリのActions → 「Deploy to Cloudflare Workers」が実行される
4. Cloudflare Workersにデプロイされる

## 記事の書き方

記事リポジトリの `posts/` ディレクトリにMarkdownファイルを配置します。

### フロントマター

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

| フィールド | 必須 | 説明 |
|-----------|------|------|
| `id` | いいね機能使用時 | DB上のpost_id |
| `title` | 推奨 | 記事タイトル |
| `create_date` | 推奨 | 作成日（YYYY-MM-DD） |
| `genre` | 任意 | ジャンル（サイドバーに表示） |
| `published` | 必須 | `true`で公開 |

### 画像

記事リポジトリの `images/` ディレクトリに画像を配置し、Markdown内で参照：

```markdown
![alt text](images/example.png)
```

