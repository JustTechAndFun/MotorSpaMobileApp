import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, TouchableOpacity, View } from 'react-native';
import { styles } from '../styles/bottom-navigator-styles';

const { width } = Dimensions.get('window');
const iconSize = width > 768 ? 32 : 28;

interface BottomNavigatorProps {
  activeTab?: 'home' | 'favorite' | 'booking' | 'cart' | 'profile';
}

export default function BottomNavigator({ activeTab = 'home' }: BottomNavigatorProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.navButton} onPress={() => router.push('/home')}>
        <View style={[styles.iconContainer, activeTab === 'home' && styles.activeIcon]}>
          <Ionicons 
            name={activeTab === 'home' ? 'home' : 'home-outline'} 
            size={iconSize} 
            color={activeTab === 'home' ? '#fff' : '#666'} 
          />
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.navButton} onPress={() => router.push('/favorite')}>
        <View style={[styles.iconContainer, activeTab === 'favorite' && styles.activeIcon]}>
          <Ionicons 
            name={activeTab === 'favorite' ? 'heart' : 'heart-outline'} 
            size={iconSize} 
            color={activeTab === 'favorite' ? '#fff' : '#666'} 
          />
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.navButton} onPress={() => router.push('/select-service')}>
        <View style={[styles.iconContainer, activeTab === 'booking' && styles.activeIcon]}>
          <Ionicons 
            name={activeTab === 'booking' ? 'calendar' : 'calendar-outline'} 
            size={iconSize} 
            color={activeTab === 'booking' ? '#fff' : '#666'} 
          />
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.navButton} onPress={() => router.push('/cart')}>
        <View style={[styles.iconContainer, activeTab === 'cart' && styles.activeIcon]}>
          <Ionicons 
            name={activeTab === 'cart' ? 'cart' : 'cart-outline'} 
            size={iconSize} 
            color={activeTab === 'cart' ? '#fff' : '#666'} 
          />
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.navButton} onPress={() => router.push('/profile')}>
        <View style={[styles.iconContainer, activeTab === 'profile' && styles.activeIcon]}>
          <Ionicons 
            name={activeTab === 'profile' ? 'person' : 'person-outline'} 
            size={iconSize} 
            color={activeTab === 'profile' ? '#fff' : '#666'} 
          />
        </View>
      </TouchableOpacity>
    </View>
  );
}
