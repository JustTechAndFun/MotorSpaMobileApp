import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';

// Giữ splash screen hiển thị trong khi load
SplashScreen.preventAutoHideAsync();

export default function Index() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    async function prepare() {
      try {
        // Simulate loading (check auth, load resources, etc.)
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 seconds
        
        // Hide splash screen
        await SplashScreen.hideAsync();
        
        // Navigate based on auth state
        if (user) {
          router.replace('/home');
        } else {
          router.replace('/login');
        }
      } catch (e) {
        console.warn(e);
        // If error, go to login
        await SplashScreen.hideAsync();
        router.replace('/login');
      }
    }

    prepare();
  }, [user]);

  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/Splash Screen.png')}
        style={styles.splashImage}
        resizeMode="cover"
      />
      <ActivityIndicator 
        size="large" 
        color="#007AFF" 
        style={styles.loader}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  splashImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  loader: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
  },
});
