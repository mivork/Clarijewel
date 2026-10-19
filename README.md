## サイトの開き方（開発サーバーの起動）

セットアップ済みの環境で、次回以降サイトを開くときの手順です。

### 簡単な方法（推奨）

プロジェクト直下の `start-dev.bat` をダブルクリックすると、MySQL・バックエンド・
フロントエンド・Stripe Webhook転送・スケジューラ（保留中注文の自動確認）が一度に
起動する（5つのウィンドウが開くので、閉じずにそのままにしておく）。起動したらブラウザで
[http://localhost:3000](http://localhost:3000) を開く。

### 手動で起動する場合

1. **XAMPPのMySQLを起動**
   XAMPP Control Panelを開き、MySQLの「Start」ボタンを押す。

2. **バックエンド（Laravel）を起動**
   コマンドプロンプトを1つ開いて実行し、そのウィンドウは閉じずに開いたままにする。

   ```cmd
   cd /d "c:\IWECサイト\clarijewel\backend"
   php artisan serve --port=8001
   ```

3. **フロントエンド（Next.js）を起動**
   別のコマンドプロンプトをもう1つ開いて実行し、同様に開いたままにする。

   ```cmd
   cd /d "c:\IWECサイト\clarijewel\frontend"
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
   cd /d "c:\IWECサイト\clarijewel\backend"
   php artisan schedule:work
   ```

6. **ブラウザでアクセス**
   [http://localhost:3000](http://localhost:3000) を開く。管理者ページは
   [http://localhost:3000/admin/dashboard](http://localhost:3000/admin/dashboard)（管理者権限のあるアカウントでログインが必要）。
