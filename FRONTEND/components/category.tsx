import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, Colors, TouchableOpacity as UILibTouchableOpacity } from 'react-native-ui-lib';
import { Dimensions, TouchableOpacity } from 'react-native';
import { categoryService } from '../services';
import { styles } from '../styles/category-styles';
import type { Category as CategoryType } from '../types/api.types';

const { width } = Dimensions.get('window');
const iconSize = width > 768 ? 36 : 30;

interface CategoryItemProps {
  category: CategoryType;
  icon: string;
  iconType?: 'ionicons' | 'material';
  onPress: () => void;
}

function CategoryItem({ category, icon, iconType = 'ionicons', onPress }: CategoryItemProps) {
  return (
    <TouchableOpacity
      style={{
        alignItems: 'center',
        width: 70
      }}
      onPress={onPress}
    >
      <View
        width={64}
        height={64}
        center
        style={{
          borderRadius: 18,
          backgroundColor: Colors.white,
          shadowColor: Colors.primaryColor,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.12,
          shadowRadius: 6,
          elevation: 4,
          borderWidth: 1.5,
          borderColor: Colors.grey70
        }}
      >
        {iconType === 'ionicons' ? (
          <Ionicons name={icon as any} size={28} color={Colors.primaryColor} />
        ) : (
          <MaterialCommunityIcons name={icon as any} size={28} color={Colors.primaryColor} />
        )}
      </View>
      <Text
        marginT-8
        grey10
        center
        numberOfLines={2}
        style={{
          fontWeight: '600',
          lineHeight: 14,
          fontSize: 11,
          width: '100%',
          textAlign: 'center'
        }}
      >
        {category.name}
      </Text>
    </TouchableOpacity>
  );
}

// Default icons mapping
const iconMapping: Record<string, { icon: string; iconType: 'ionicons' | 'material' }> = {
  'Oil': { icon: 'water', iconType: 'ionicons' },
  'Tire': { icon: 'ellipse', iconType: 'ionicons' },
  'Battery': { icon: 'battery-charging', iconType: 'ionicons' },
  'Accessories': { icon: 'bicycle', iconType: 'ionicons' },
  'Lamp': { icon: 'bulb', iconType: 'ionicons' },
  'Hardware': { icon: 'hardware-chip', iconType: 'ionicons' },
  'Tools': { icon: 'build', iconType: 'ionicons' },
  'Others': { icon: 'settings', iconType: 'ionicons' },
};

export default function Category() {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryType[]>([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getRootCategories();
      const activeCategories = data.filter(c => c.isActive);

      // Custom ordering: swap Oil and Other positions
      const sorted = [...activeCategories].sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();

        // Put Oil at position 0 (where Other was)
        if (aName === 'oil') return -1;
        if (bName === 'oil') return 1;

        // Put Other at position 7 (where Oil was)
        if (aName === 'other' || aName === 'others') return 1;
        if (bName === 'other' || bName === 'others') return -1;

        return 0; // Keep original order for other categories
      });

      setCategories(sorted);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleCategoryPress = (category: CategoryType) => {
    router.push(`/category?categoryId=${category.id}`);
  };

  const getIconForCategory = (categoryName: string) => {
    return iconMapping[categoryName] || { icon: 'cube', iconType: 'ionicons' as const };
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Categories</Text>

      <View style={styles.grid}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25, paddingHorizontal: 10 }}>
          {categories.slice(0, 4).map((category) => {
            const iconData = getIconForCategory(category.name);
            return (
              <CategoryItem
                key={String(category.id)}
                category={category}
                icon={iconData.icon}
                iconType={iconData.iconType}
                onPress={() => handleCategoryPress(category)}
              />
            );
          })}
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10 }}>
          {categories.slice(4, 8).map((category) => {
            const iconData = getIconForCategory(category.name);
            return (
              <CategoryItem
                key={String(category.id)}
                category={category}
                icon={iconData.icon}
                iconType={iconData.iconType}
                onPress={() => handleCategoryPress(category)}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}
