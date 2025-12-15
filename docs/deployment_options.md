# HonoXブログのデプロイオプション（記事を別のGitブランチで管理）

## 概要
HonoXブログシステムでは、記事データを別のGitブランチ（またはリポジトリ）で管理する場合、デプロイの鍵は**ビルド時に記事データを統合する**ことです。ホスト先としてVercelまたはCloudflareを想定し、以下の4つのデプロイスケナリオを提案します。各オプションの利点、欠点、実装手順を記載。

## 提案1: ビルド時記事取得（推奨: シンプルで汎用的）
- **概要**: ビルドスクリプトで記事ブランチ/リポジトリから記事をクローンまたはダウンロードし、`dummy-posts/`に配置してからビルド。
- **利点**:
  - 記事更新時にブログリポジトリをトリガー可能。
  - Vercel/Cloudflare両方で対応。
- **欠点**:
  - ビルド時間が長くなる可能性。
  - 非公開リポジトリの場合、秘密鍵が必要。
- **実装手順**:
  1. 記事ブランチをGitHubの別リポジトリ（例: `username/blog-articles`）に置く。
  2. `package.json`のbuildスクリプトを変更: `git clone https://github.com/username/blog-articles.git temp-articles && cp -r temp-articles/* dummy-posts/ && rm -rf temp-articles`
  3. 記事更新時にGitHub Actionsでブログリポジトリのビルドをトリガー（例: repository_dispatch）。
- **Vercelデプロイ**: VercelのGit統合で自動ビルド。記事リポジトリ更新時にwebhookでVercelを再ビルド。
- **Cloudflareデプロイ**: Cloudflare PagesでGit統合。ビルドコマンドに上記スクリプトを追加。

## 提案2: Git Submoduleを使用
- **概要**: 記事ブランチをGitサブモジュールとしてブログリポジトリに追加。ビルド時にサブモジュールを更新。
- **利点**:
  - Gitネイティブで管理しやすく、記事更新がブログコミットに連動。
- **欠点**:
  - サブモジュールの扱いが複雑。初心者には不向き。
- **実装手順**:
  1. `git submodule add -b articles-branch https://github.com/username/blog-articles.git articles`
  2. `package.json` build: `git submodule update --init --recursive && cp -r articles/* dummy-posts/`
  3. 記事更新時はサブモジュールを更新してコミット。
- **Vercelデプロイ**: Vercelはサブモジュールをサポート（設定で有効化）。自動ビルド。
- **Cloudflareデプロイ**: Pagesでサブモジュールをサポート。ビルド時に更新。

## 提案3: Runtime時記事取得（API経由）
- **概要**: ビルド時は静的ページのみ生成。記事はruntimeで外部API/GitHub APIから取得。
- **利点**:
  - ビルドが軽く、記事更新が即時反映。SSGをISR（Incremental Static Regeneration）風に。
- **欠点**:
  - APIレート制限（GitHub無料プランで5000/時）。
  - セキュリティ（トークン管理）。
- **実装手順**:
  1. GitHub APIで記事ブランチのファイルをフェッチ（例: `fetch('https://api.github.com/repos/username/blog-articles/contents/').then(r => r.json())`）。
  2. `getAllPosts`関数をAPI呼び出しに変更。キャッシュ（KVなど）を使用。
  3. SSGは記事なしでビルドし、動的ルートでAPIから取得。
- **Vercelデプロイ**: Vercel FunctionsでAPI呼び出し。ISRで再生成可能。
- **Cloudflareデプロイ**: Cloudflare WorkersでAPIフェッチ。KVでキャッシュ。

## 提案4: モノリポ + ブランチ別管理
- **概要**: ブログと記事を同じリポジトリの別ブランチで管理。マージで統合。
- **利点**:
  - 管理がシンプル。CI/CDで自動マージ。
- **欠点**:
  - コミット履歴が混在。チーム開発で衝突しやすい。
- **実装手順**:
  1. メインリポジトリに`main`（ブログコード）と`articles`ブランチを作成。
  2. `articles`ブランチに`dummy-posts/`を置き、PRで`main`にマージ。
  3. マージ時にビルドトリガー。
- **Vercelデプロイ**: ブランチ指定でデプロイ（例: `main`のみ）。
- **Cloudflareデプロイ**: Pagesでブランチフィルタリング。

## 追加の考慮点
- **セキュリティ**: 記事リポジトリが公開なら問題なし。非公開ならGitHubトークンを使用（環境変数で管理）。
- **パフォーマンス**: CloudflareはグローバルCDNが強み。Vercelはエッジ関数が便利。
- **CI/CD**: GitHub Actionsで記事更新を検知し、ブログビルドを自動化（例: `workflow_dispatch`）。
- **テスト**: 記事取得部分をテスト（例: モックAPI）。

## 結論
最もバランスの良いオプションは**提案1（ビルド時記事取得）**です。シンプルで汎用性が高く、Vercel/Cloudflare両方で実装可能です。詳細な実装が必要な場合は、追加調査を行います。</content>
<parameter name="filePath">docs/deployment_options.md