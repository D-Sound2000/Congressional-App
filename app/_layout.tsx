import { Stack } from 'expo-router';
import HeaderNavBar from '@/components/HeaderNavBar';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
    // <HeaderNavBar />

  );
}
