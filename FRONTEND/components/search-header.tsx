import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';
import { styles } from '../styles/search-header-styles';

export default function SearchHeader() {
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search Product..."
          placeholderTextColor="#999"
        />
      </View>
      
      <View style={styles.iconsContainer}>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="notifications-outline" size={24} color="#333" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="cart-outline" size={24} color="#333" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="chatbubble-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
