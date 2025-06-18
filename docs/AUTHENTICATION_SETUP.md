# Firebase Authentication セットアップガイド

## 概要
このプロジェクトではFirebase Authenticationを使用してユーザー認証を実装しています。

## セットアップ手順

### 1. 依存関係のインストール
```bash
npm install
```

### 2. Firebase プロジェクトの作成
1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 新しいプロジェクトを作成
3. Authenticationを有効化
4. メール/パスワード認証を有効化

### 3. 環境変数の設定
1. `.env.example` を `.env` にコピー
2. Firebase Console から設定情報を取得
3. `.env` ファイルに実際の値を設定

```bash
cp .env.example .env
```

### 4. 必要な環境変数
```
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456789
```

## 実装済み機能

### 認証機能
- ✅ メール/パスワードでのユーザー登録
- ✅ メール/パスワードでのログイン
- ✅ ログアウト機能
- ✅ 認証状態の永続化
- ✅ 自動ナビゲーション制御

### 画面構成
- `app/(auth)/signin.tsx` - ログイン画面
- `app/(auth)/signup.tsx` - アカウント作成画面
- `app/index.tsx` - 認証状態による自動ナビゲーション
- `contexts/AuthContext.tsx` - 認証状態管理

### セキュリティ
- AsyncStorage を使用した安全なセッション管理
- Firebase の標準セキュリティ機能を活用
- 環境変数による設定の分離

## 使用方法

### 認証状態の取得
```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, loading, signIn, signUp, logout } = useAuth();
  
  if (loading) {
    return <ActivityIndicator />;
  }
  
  if (!user) {
    // 未認証状態
    return <LoginScreen />;
  }
  
  // 認証済み状態
  return <AuthenticatedContent />;
}
```

### ログイン
```typescript
try {
  await signIn(email, password);
  // ログイン成功
} catch (error) {
  // エラーハンドリング
}
```

### ユーザー登録
```typescript
try {
  await signUp(email, password, displayName);
  // 登録成功
} catch (error) {
  // エラーハンドリング
}
```

### ログアウト
```typescript
try {
  await logout();
  // ログアウト成功
} catch (error) {
  // エラーハンドリング
}
```

## トラブルシューティング

### 依存関係エラー
Firebase パッケージがインストールされていない場合:
```bash
npm install firebase @react-native-async-storage/async-storage
```

### 環境変数エラー
`.env` ファイルが存在しない、または値が設定されていない場合:
1. `.env.example` を参考に `.env` ファイルを作成
2. Firebase Console から正しい値を取得して設定

### TypeScript エラー
型定義が見つからない場合:
```bash
npm install --save-dev @types/react @types/react-native
```