import { ToastProvider } from '@/components/toast';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import Mapbox from '@rnmapbox/maps';
import Constants from 'expo-constants';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';
import 'react-native-reanimated';

import '../config/ui-lib.config';

import { useColorScheme } from '@/hooks/use-color-scheme';

const mapboxToken = Constants.expoConfig?.extra?.mapboxAccessToken;
if (mapboxToken) {
  Mapbox.setAccessToken(mapboxToken);
} else {
  console.error('Mapbox access token not found in app config');
}

if (__DEV__) {
  LogBox.ignoreLogs([
    'Unable to activate keep awake',
  ]);
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ToastProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="home" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="signup" options={{ headerShown: false }} />
          <Stack.Screen name="profile" options={{ headerShown: false }} />
          <Stack.Screen name="category" options={{ headerShown: false }} />
          <Stack.Screen name="product_detail" options={{ headerShown: false }} />
          <Stack.Screen name="service_detail" options={{ headerShown: false }} />
          <Stack.Screen name="cart" options={{ headerShown: false }} />
          <Stack.Screen name="checkout" options={{ headerShown: false }} />
          <Stack.Screen name="booking" options={{ headerShown: false }} />
          <Stack.Screen name="booking-detail" options={{ headerShown: false }} />
          <Stack.Screen name="my-bookings" options={{ headerShown: false }} />
          <Stack.Screen name="favorite" options={{ headerShown: false }} />
          <Stack.Screen name="setting-location" options={{ headerShown: false }} />
          <Stack.Screen name="setting-payment" options={{ headerShown: false }} />
          <Stack.Screen name="add-location" options={{ headerShown: false }} />
          <Stack.Screen name="noti_setting" options={{ headerShown: false }} />
          <Stack.Screen name="help" options={{ headerShown: false }} />
          <Stack.Screen name="orders" options={{ headerShown: false }} />
          <Stack.Screen name="order-detail" options={{ headerShown: false }} />
          <Stack.Screen name="admin/location-management" options={{ headerShown: false }} />
          <Stack.Screen name="admin/booking-management" options={{ headerShown: false }} />
          <Stack.Screen name="admin/category-management" options={{ headerShown: false }} />
          <Stack.Screen name="admin/order-management" options={{ headerShown: false }} />
          <Stack.Screen name="admin/product-management" options={{ headerShown: false }} />
          <Stack.Screen name="admin/qna-management" options={{ headerShown: false }} />
          <Stack.Screen name="admin/service-management" options={{ headerShown: false }} />
          <Stack.Screen name="admin/user-management" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </ToastProvider>
  );
}
