import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Colors, View } from 'react-native-ui-lib';
import { styles } from '../styles/bottom-navigator-styles';

interface BottomNavigatorProps {
  activeTab?: 'home' | 'favorite' | 'booking' | 'cart' | 'profile';
}

export default function BottomNavigator({ activeTab = 'home' }: BottomNavigatorProps) {
  const router = useRouter();

  const NavItem = ({ icon, activeIcon, tab, route }: { icon: string; activeIcon: string; tab: string; route: string }) => {
    const isActive = activeTab === tab;
    return (
      <TouchableOpacity
        style={styles.navButton}
        onPress={() => router.push(route as any)}
        activeOpacity={0.7}
      >
        <View
          center
          style={[
            styles.iconContainer,
            isActive && styles.activeIcon
          ]}
        >
          <Ionicons
            name={isActive ? activeIcon : icon}
            size={24}
            color={isActive ? Colors.white : Colors.grey30}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <NavItem icon="home-outline" activeIcon="home" tab="home" route="/home" />
      <NavItem icon="heart-outline" activeIcon="heart" tab="favorite" route="/favorite" />
      <NavItem icon="calendar-outline" activeIcon="calendar" tab="booking" route="/select-service" />
      <NavItem icon="cart-outline" activeIcon="cart" tab="cart" route="/cart" />
      <NavItem icon="person-outline" activeIcon="person" tab="profile" route="/profile" />
    </View>
  );
}
