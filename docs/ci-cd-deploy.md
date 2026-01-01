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

