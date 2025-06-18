import React, { useState } from 'react';
import { View, TextInput, Alert, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const colorScheme = useColorScheme();

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword || !displayName) {
      Alert.alert('エラー', 'すべての項目を入力してください');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('エラー', 'パスワードが一致しません');
      return;
    }

    if (password.length < 6) {
      Alert.alert('エラー', 'パスワードは6文字以上で入力してください');
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, displayName);
      Alert.alert('成功', 'アカウントが作成されました', [
        { text: 'OK', onPress: () => router.replace('/(tabs)') }
      ]);
    } catch (error: any) {
      console.error('Sign up error:', error);
      Alert.alert('アカウント作成エラー', error.message || 'アカウント作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.form}>
          <ThemedText type="title" style={styles.title}>
            アカウント作成
          </ThemedText>
          
          <TextInput
            style={[
              styles.input,
              { 
                backgroundColor: Colors[colorScheme ?? 'light'].background,
                borderColor: Colors[colorScheme ?? 'light'].text,
                color: Colors[colorScheme ?? 'light'].text
              }
            ]}
            placeholder="表示名"
            placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
            value={displayName}
            onChangeText={setDisplayName}
            autoComplete="name"
          />
          
          <TextInput
            style={[
              styles.input,
              { 
                backgroundColor: Colors[colorScheme ?? 'light'].background,
                borderColor: Colors[colorScheme ?? 'light'].text,
                color: Colors[colorScheme ?? 'light'].text
              }
            ]}
            placeholder="メールアドレス"
            placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          
          <TextInput
            style={[
              styles.input,
              { 
                backgroundColor: Colors[colorScheme ?? 'light'].background,
                borderColor: Colors[colorScheme ?? 'light'].text,
                color: Colors[colorScheme ?? 'light'].text
              }
            ]}
            placeholder="パスワード（6文字以上）"
            placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password-new"
          />
          
          <TextInput
            style={[
              styles.input,
              { 
                backgroundColor: Colors[colorScheme ?? 'light'].background,
                borderColor: Colors[colorScheme ?? 'light'].text,
                color: Colors[colorScheme ?? 'light'].text
              }
            ]}
            placeholder="パスワード確認"
            placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoComplete="password-new"
          />
          
          <ThemedView 
            style={[
              styles.button,
              { backgroundColor: Colors[colorScheme ?? 'light'].tint }
            ]}
            onTouchEnd={handleSignUp}
          >
            <ThemedText style={[styles.buttonText, { color: '#fff' }]}>
              {loading ? 'アカウント作成中...' : 'アカウント作成'}
            </ThemedText>
          </ThemedView>
          
          <View style={styles.linkContainer}>
            <ThemedText>すでにアカウントをお持ちの方は </ThemedText>
            <Link href="/(auth)/signin" style={styles.link}>
              <ThemedText style={[styles.linkText, { color: Colors[colorScheme ?? 'light'].tint }]}>
                サインイン
              </ThemedText>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
  },
  form: {
    padding: 20,
    marginHorizontal: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  link: {
    marginLeft: 5,
  },
  linkText: {
    fontWeight: '600',
  },
});