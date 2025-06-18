import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="signin" 
        options={{ 
          title: 'サインイン',
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="signup" 
        options={{ 
          title: 'アカウント作成',
          headerShown: false 
        }} 
      />
    </Stack>
  );
}