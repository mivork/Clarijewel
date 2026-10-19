# Clarijewel

グループワークで制作している宝石ECサイト。フロントエンドは Next.js（`frontend/`）、バックエンドは Laravel（`backend/`）、DB は MySQL。

## 初回セットアップ（新しいPCで初めて動かすとき）

### 1. 必要なソフトをインストールする

| ソフト | バージョンの目安 | 用途 |
|---|---|---|
| [XAMPP](https://www.apachefriends.org/) | — | MySQL（`C:\xampp` にインストールする） |
| PHP | 8.3 以上 | Laravel の実行 |
| [Composer](https://getcomposer.org/) | — | PHP のパッケージ管理 |
| [Node.js](https://nodejs.org/) | 20 以上 | Next.js の実行 |
| [Stripe CLI](https://docs.stripe.com/stripe-cli) | — | 決済の Webhook 転送（`winget install Stripe.StripeCli`） |

インストール後、コマンドプロンプトで `php -v` `composer -V` `node -v` `stripe -v` が
すべてバージョンを表示することを確認する。

### 2. データベースを作る

XAMPP Control Panel で MySQL を Start し、phpMyAdmin（<http://localhost/phpmyadmin>）で
`Clarijewel-ec` という名前のデータベースを作成する（照合順序は `utf8mb4_unicode_ci`）。

### 3. バックエンドの準備

```cmd
cd backend
composer install
copy .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
```

`--seed` で、ログイン確認用のテストユーザー（`test@example.com` / パスワード `password`）と
お知らせのサンプルが作成される。

### 4. フロントエンドの準備

```cmd
cd frontend
npm install
copy .env.local.example .env.local
```

### 5. Stripe のテスト用キーを設定する

決済を試すには Stripe の**テスト用**キーが必要。キーはチーム内で安全な方法で受け取る
（GitHub・チャット・メールに貼らない）。

- `backend/.env` の `STRIPE_KEY`（`pk_test_...`）と `STRIPE_SECRET`（`sk_test_...`）
- `frontend/.env.local` の `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`（`pk_test_...`、`STRIPE_KEY` と同じ値）
- `backend/.env` の `STRIPE_WEBHOOK_SECRET`：`stripe login` のあと `stripe listen` を実行すると
  表示される `whsec_...` を設定する（PCごとに値が違う）

### 6. 管理者アカウントを作る

サイトで会員登録（またはテストユーザーを使用）したあと、次を実行する。

```cmd
cd backend
php artisan tinker --execute="App\Models\User::where('email', 'test@example.com')->update(['is_admin' => true]);"
```

### メールについて

開発環境ではメールを実際には送らず、`backend/storage/logs/laravel.log` に書き出す設定に
なっている（`MAIL_MAILER=log`）。会員登録の確認メールやパスワード再設定のリンクは、
このログファイルを開いて確認する。

## サイトの開き方（開発サーバーの起動）

セットアップ済みの環境で、サイトを開くときの手順です。

### 簡単な方法（推奨）

プロジェクト直下の `start-dev.bat` をダブルクリックすると、MySQL・バックエンド・
フロントエンド・Stripe Webhook転送・スケジューラ（保留中注文の自動確認）が一度に
起動する（5つのウィンドウが開くので、閉じずにそのままにしておく）。起動したらブラウザで
[http://localhost:3000](http://localhost:3000) を開く。

`start-dev.bat` はプロジェクトのフォルダを自動で `P:` ドライブに割り当ててから起動する
（フォルダのパスに日本語が含まれていても動くようにするため）。`P:` を別の用途で使っている
PC では起動できないので、その場合は下の「手動で起動する場合」の手順を使う。

### 手動で起動する場合

以下の `<プロジェクトのフォルダ>` は、このリポジトリを置いた場所に読み替える。

1. **XAMPPのMySQLを起動**
   XAMPP Control Panelを開き、MySQLの「Start」ボタンを押す。

2. **バックエンド（Laravel）を起動**
   コマンドプロンプトを1つ開いて実行し、そのウィンドウは閉じずに開いたままにする。

   ```cmd
   cd /d "<プロジェクトのフォルダ>\backend"
   php artisan serve --port=8001
   ```

3. **フロントエンド（Next.js）を起動**
   別のコマンドプロンプトをもう1つ開いて実行し、同様に開いたままにする。

   ```cmd
   cd /d "<プロジェクトのフォルダ>\frontend"
   npm run dev
   ```

4. **Stripe Webhookの転送を起動（決済機能を使う場合）**
   決済（購入・支払い完了）を試すときだけ必要。もう1つコマンドプロンプトを開いて実行し、
   同様に開いたままにする。これを起動していないと、決済自体は成功しても注文が
   「支払い済み」に更新されない（在庫確定・保証発行・会員ランク更新も行われない）。

   ```cmd
   stripe listen --forward-to localhost:8001/api/stripe/webhook
   ```

5. **スケジューラを起動（保留中注文の自動確認）**
   支払いが完了しないまま放置された注文を定期的にチェックし、在庫の予約状態を
   自動解放する処理。もう1つコマンドプロンプトを開いて実行し、同様に開いたままにする。
   これを起動していないと、支払われないまま放置された注文の在庫が「予約中」のまま
   戻らなくなる。

   ```cmd
   cd /d "<プロジェクトのフォルダ>\backend"
   php artisan schedule:work
   ```

6. **ブラウザでアクセス**
   [http://localhost:3000](http://localhost:3000) を開く。管理者ページは
   [http://localhost:3000/admin/dashboard](http://localhost:3000/admin/dashboard)（管理者権限のあるアカウントでログインが必要）。

## チーム開発の進め方

- `main` ブランチには直接 push しない。作業ごとにブランチを作る（例: `feature/bank-transfer`、`fix/cart-badge`）。
- 作業が終わったら GitHub で Pull Request を作り、他のメンバーに確認してもらってから `main` に取り込む。
- 作業を始める前に `main` を最新にしてからブランチを作る（`git pull` → `git switch -c <ブランチ名>`）。
- `.env` / `.env.local` は各自のPCにだけ置き、絶対にコミットしない（`.gitignore` で除外済み）。
- DB の構造を変えるときは、マイグレーションファイルを追加する。他の人が取り込んだら `php artisan migrate` を実行する。
