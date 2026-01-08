import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import { TextInput, TouchableOpacity } from 'react-native';
import { View, Text, Colors, Spacings, Badge } from 'react-native-ui-lib';
import { styles } from '../styles/search-header-styles';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { cartService } from '@/services';

interface SearchHeaderProps {
  onSearch?: (query: string) => void;
  onClear?: () => void;
}

export default function SearchHeader({ onSearch, onClear }: SearchHeaderProps) {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    loadCartCount();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadCartCount();
    }, [])
  );

  const loadCartCount = async () => {
    try {
      const cartItems = await cartService.getCart();
      setCartCount(cartItems.length);
    } catch (error) {
      console.error('Error loading cart count:', error);
    }
  };

  const handleSearch = () => {
    if (searchText.trim() && onSearch) {
      onSearch(searchText);
    }
  };

  const handleClear = () => {
    setSearchText('');
    if (onClear) {
      onClear();
    }
  };

  return (
    <View
      row
      centerV
      spread
      paddingV-12
      paddingH-20
      bg-white
      marginB-20
      style={{
        borderRadius: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      }}
    >
      {/* Search Bar */}
      <View
        flex
        row
        centerV
        paddingH-18
        marginR-15
        style={{
          height: 52,
          borderRadius: 16,
          backgroundColor: Colors.grey80,
          borderWidth: 1.5,
          borderColor: 'transparent'
        }}
      >
        <Ionicons name="search" size={22} color={Colors.primaryColor} />
        <TextInput
          style={{
            flex: 1,
            marginLeft: 12,
            fontSize: 15,
            color: Colors.textColor,
            fontWeight: '500'
          }}
          placeholder="Search products & services..."
          placeholderTextColor={Colors.grey40}
          value={searchText}
          onChangeText={(text) => {
            setSearchText(text);
            if (text.trim() && onSearch) {
              onSearch(text);
            } else if (!text.trim() && onClear) {
              onClear();
            }
          }}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={{ padding: 4 }}>
            <Ionicons name="close-circle" size={20} color={Colors.grey40} />
          </TouchableOpacity>
        )}
      </View>

      {/* Cart Icon */}
      <TouchableOpacity
        onPress={() => router.push('/cart')}
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          backgroundColor: Colors.primaryColor,
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          elevation: 4,
          shadowColor: Colors.primaryColor,
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
        }}
      >
        <Ionicons name="cart-outline" size={24} color={Colors.white} />
        {cartCount > 0 && (
          <Badge
            label={cartCount.toString()}
            size={18}
            backgroundColor={Colors.red30}
            containerStyle={{
              position: 'absolute',
              top: -4,
              right: -4,
              borderWidth: 2,
              borderColor: Colors.white,
              borderRadius: 10
            }}
            labelStyle={{ fontSize: 11, fontWeight: 'bold' }}
          />
        )}
      </TouchableOpacity>
    </View>
  );
}
