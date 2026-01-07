import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Text, View } from 'react-native-ui-lib';
import { motorServiceService } from '../services';
import { styles } from '../styles/select-service-styles';
import { BookingService, MotorService } from '../types/api.types';

interface SelectedService extends BookingService {
  service: MotorService;
}

export default function SelectServiceScreen() {
  const router = useRouter();
  
  const [services, setServices] = useState<MotorService[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await motorServiceService.getServices();
      const activeServices = data.filter(s => s.isActive);
      setServices(activeServices);
    } catch (error: any) {
      console.error('Error loading services:', error);
      Alert.alert(
        'Lỗi', 
        'Không thể tải danh sách dịch vụ. Vui lòng thử lại.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const isServiceSelected = (serviceId: string): boolean => {
    return selectedServices.some(s => s.serviceId === serviceId);
  };

  const handleToggleService = (service: MotorService) => {
    const isSelected = isServiceSelected(service.id!);
    
    if (isSelected) {
      setSelectedServices(prev => prev.filter(s => s.serviceId !== service.id));
    } else {
      setSelectedServices(prev => [
        ...prev,
        {
          serviceId: service.id!,
          quantity: 1,
          service: service,
        }
      ]);
    }
  };

  const getTotalAmount = (): number => {
    return selectedServices.reduce((sum, s) => {
      const price = s.service.discountPercentage > 0
        ? s.service.price * (1 - s.service.discountPercentage / 100)
        : s.service.price;
      return sum + price;
    }, 0);
  };

  const handleContinue = () => {
    if (selectedServices.length === 0) {
      Alert.alert('Thông báo', 'Vui lòng chọn ít nhất một dịch vụ');
      return;
    }

    const servicesParam = JSON.stringify(selectedServices.map(s => ({
      serviceId: s.serviceId,
      quantity: s.quantity,
      service: s.service,
    })));
    
    router.push(`/booking?services=${encodeURIComponent(servicesParam)}`);
  };

  const renderServiceItem = ({ item }: { item: MotorService }) => {
    const isSelected = isServiceSelected(item.id!);
    const finalPrice = item.discountPercentage > 0
      ? item.price * (1 - item.discountPercentage / 100)
      : item.price;

    return (
      <TouchableOpacity 
        style={[styles.serviceCard, isSelected && styles.serviceCardSelected]}
        onPress={() => handleToggleService(item)}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: item.imageUrl || 'https://via.placeholder.com/120' }}
          style={styles.serviceCardImage}
          resizeMode="cover"
        />
        
        <View style={styles.serviceCardContent}>
          <View style={styles.serviceCardHeader}>
            <Text style={styles.serviceCardName} numberOfLines={2}>
              {item.name}
            </Text>
            {item.discountPercentage > 0 && (
              <View style={styles.discountBadgeSmall}>
                <Text style={styles.discountTextSmall}>-{item.discountPercentage}%</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.serviceCardDescription} numberOfLines={2}>
            {item.description}
          </Text>
          
          <View style={styles.serviceCardFooter}>
            <View>
              <Text style={styles.serviceCardPrice}>
                {formatCurrency(finalPrice)} VNĐ
              </Text>
              {item.estimatedDuration && (
                <Text style={styles.serviceCardDuration}>
                  ⏱ {item.estimatedDuration} phút
                </Text>
              )}
            </View>
            
            <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
              {isSelected && (
                <Ionicons name="checkmark" size={18} color="#fff" />
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chọn dịch vụ</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#82b440" />
          <Text style={{ marginTop: 12, color: '#666' }}>Đang tải dịch vụ...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (services.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chọn dịch vụ</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="construct-outline" size={64} color="#CCC" />
          <Text style={styles.emptyText}>Không có dịch vụ nào</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chọn dịch vụ</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Service List */}
      <FlatList
        data={services}
        renderItem={renderServiceItem}
        keyExtractor={(item) => item.id!}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Footer with Total and Continue Button */}
      {selectedServices.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>
              Tổng cộng ({selectedServices.reduce((sum, s) => sum + s.quantity, 0)} dịch vụ)
            </Text>
            <Text style={styles.totalAmount}>
              {formatCurrency(getTotalAmount())} VNĐ
            </Text>
          </View>
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>Tiếp tục</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

function formatCurrency(n: number) {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
