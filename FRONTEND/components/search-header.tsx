import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { TextInput, TouchableOpacity } from 'react-native';
import { View, Text, Colors, Spacings, Badge } from 'react-native-ui-lib';
import { styles } from '../styles/search-header-styles';

export default function SearchHeader() {
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
        />
      </View>

      {/* Action Icons */}
      <View row centerV>
        <TouchableOpacity
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            backgroundColor: Colors.grey80,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 10,
            position: 'relative'
          }}
        >
          <Ionicons name="notifications-outline" size={24} color={Colors.grey10} />
          <View
            absT
            absR
            width={10}
            height={10}
            br100
            bg-red30
            style={{ top: 6, right: 6 }}
          />
        </TouchableOpacity>

        <TouchableOpacity
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
          <Badge
            label="2"
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
        </TouchableOpacity>
      </View>
    </View>
  );
}
