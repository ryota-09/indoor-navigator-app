import React, { useState } from 'react';
import { View, TextInput, Alert, StyleSheet, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { Link, router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const colorScheme = useColorScheme();

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('エラー', 'メールアドレスとパスワードを入力してください');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Sign in error:', error);
      Alert.alert('サインインエラー', error.message || 'サインインに失敗しました');
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
            サインイン
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
            placeholder="パスワード"
            placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
          />
          
          <Pressable 
            style={[
              styles.button,
              { backgroundColor: Colors[colorScheme ?? 'light'].tint }
            ]}
            onPress={handleSignIn}
            disabled={loading}
          >
            <ThemedText style={[styles.buttonText, { color: '#fff' }]}>
              {loading ? 'サインイン中...' : 'サインイン'}
            </ThemedText>
          </Pressable>
          
          <View style={styles.linkContainer}>
            <ThemedText>アカウントをお持ちでない方は </ThemedText>
            <Link href="/(auth)/signup" style={styles.link}>
              <ThemedText style={[styles.linkText, { color: Colors[colorScheme ?? 'light'].tint }]}>
                アカウント作成
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