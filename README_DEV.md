# 開発モード設定

このプロジェクトは開発時にFirebase認証をバイパスして、モックユーザーで自動ログインするように設定されています。

## 開発モードの特徴

### 自動ログイン
- アプリ起動時に自動的にモックユーザーでログインされます
- Firebase APIキーの設定は不要です
- 認証画面をスキップして直接メイン画面にアクセスできます

### モックユーザー情報
```
メールアドレス: developer@test.com
表示名: Developer User
UID: dev-user-123
```

## 開発時の起動方法

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npx expo start --web
```

## 本番モードへの切り替え

`contexts/AuthContext.tsx`の6行目を編集：

```typescript
// 開発モード
const DEV_MODE = process.env.NODE_ENV === 'development' || true;

// 本番モード
const DEV_MODE = process.env.NODE_ENV === 'development' || false;
```

本番モードでは、実際のFirebase設定が必要になります。

## 主な画面

1. **ホーム** - メインダッシュボード
2. **Editor** - マップエディタ（施設マップの作成）
3. **Explore** - 探索画面

## トラブルシューティング

### 依存関係エラー
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

### キャッシュクリア
```bash
npx expo start --clear
```