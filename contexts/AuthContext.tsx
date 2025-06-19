import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { auth } from '@/config/firebase';

// 開発モードの設定
const DEV_MODE = process.env.NODE_ENV === 'development' || true; // 開発時は常にtrue
const MOCK_USER = DEV_MODE ? {
  uid: 'dev-user-123',
  email: 'developer@test.com',
  displayName: 'Developer User',
  emailVerified: true,
} as User : null;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(DEV_MODE ? MOCK_USER : null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (DEV_MODE) {
      // 開発モードでは即座にモックユーザーを設定
      setUser(MOCK_USER);
      setLoading(false);
      return;
    }

    // 本番モードではFirebase認証を使用
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    if (DEV_MODE) {
      // 開発モードではモックログイン
      console.log('Dev mode: Mock sign in with', email);
      setUser(MOCK_USER);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    if (DEV_MODE) {
      // 開発モードではモック登録
      console.log('Dev mode: Mock sign up with', email);
      setUser(MOCK_USER);
      return;
    }

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      if (displayName && result.user) {
        await updateProfile(result.user, {
          displayName: displayName
        });
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    if (DEV_MODE) {
      // 開発モードではモックログアウト
      console.log('Dev mode: Mock logout');
      setUser(null);
      return;
    }

    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}