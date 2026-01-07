import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, Text, TouchableOpacity, View } from 'react-native';
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
    <TouchableOpacity style={styles.categoryItem} onPress={onPress}>
      <View style={styles.iconContainer}>
        {iconType === 'ionicons' ? (
          <Ionicons name={icon as any} size={iconSize} color="#333" />
        ) : (
          <MaterialCommunityIcons name={icon as any} size={iconSize} color="#333" />
        )}
      </View>
      <Text style={styles.categoryLabel}>{category.name}</Text>
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
        <View style={styles.row}>
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
        
        <View style={styles.row}>
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
