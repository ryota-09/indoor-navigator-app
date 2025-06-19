import { initializeApp, getApps } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase設定 - デモ用の設定
const firebaseConfig = {
  // 注意: これはデモ用の設定です。本番環境では必ず環境変数を使用してください
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyB-demo-key-for-testing",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "indoor-navigator-demo.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "indoor-navigator-demo",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "indoor-navigator-demo.appspot.com",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:123456789012:web:abcdef123456789",
};

// Firebaseアプリの初期化
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Auth の初期化（React Native用の永続化設定）
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (error) {
  // 既に初期化されている場合は既存のインスタンスを取得
  auth = getAuth(app);
}

// Firestore の初期化
export const db = getFirestore(app);

export { auth };
export default app;