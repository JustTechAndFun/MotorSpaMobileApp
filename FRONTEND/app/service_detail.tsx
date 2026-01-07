import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { serviceService } from '../services';
import { styles } from '../styles/service-detail-styles';
import { Service } from '../types/api.types';

export default function ServiceDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const serviceId = params.serviceId as string;
  
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadService();
  }, [serviceId]);

  const loadService = async () => {
    try {
      setLoading(true);
      const data = await serviceService.getServiceById(serviceId);
      setService(data);
    } catch (error: any) {
      console.error('Error loading service:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin dịch vụ');
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    if (!service) return;
    
    // Navigate to booking page with pre-selected service
    router.push({
      pathname: '/booking',
      params: {
        preSelectedService: JSON.stringify({
          id: service.id,
          name: service.name,
          price: service.price,
          duration: service.duration,
        }),
      },
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#82b440" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!service) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="construct-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Không tìm thấy dịch vụ</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết dịch vụ</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView 
          style={styles.content}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Service Image */}
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: service.imageUrl || 'https://via.placeholder.com/400x300' }} 
              style={styles.serviceImage}
              resizeMode="cover"
            />
          </View>

          {/* Service Info Card */}
          <View style={styles.infoCard}>
            {/* Price */}
            <Text style={styles.price}>
              VND. {service.price.toLocaleString()}
            </Text>

            {/* Name & Category */}
            <Text style={styles.serviceName}>{service.name}</Text>
            {service.category && (
              <View style={styles.categoryBadge}>
                <Ionicons name="pricetag" size={14} color="#82b440" />
                <Text style={styles.categoryText}>{service.category.name}</Text>
              </View>
            )}

            {/* Quick Info */}
            <View style={styles.quickInfo}>
              <View style={styles.quickInfoItem}>
                <Ionicons name="time-outline" size={20} color="#666" />
                <Text style={styles.quickInfoLabel}>Thời gian</Text>
                <Text style={styles.quickInfoValue}>
                  {service.duration ? `${service.duration} phút` : 'Liên hệ'}
                </Text>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.quickInfoItem}>
                <Ionicons name="checkmark-circle-outline" size={20} color="#666" />
                <Text style={styles.quickInfoLabel}>Trạng thái</Text>
                <Text style={[
                  styles.quickInfoValue, 
                  { color: (service.isAvailable ?? service.isActive ?? true) ? '#34C759' : '#FF3B30' }
                ]}>
                  {(service.isAvailable ?? service.isActive ?? true) ? 'Hoạt động' : 'Ngừng'}
                </Text>
              </View>
            </View>

            {/* Description */}
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>Mô tả dịch vụ</Text>
              <Text style={styles.descriptionText}>{service.description}</Text>
            </View>

            {/* Additional Info */}
            <View style={styles.additionalInfo}>
              <View style={styles.infoItem}>
                <Ionicons name="calendar-outline" size={18} color="#82b440" />
                <Text style={styles.infoText}>Có thể đặt lịch trước</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="people-outline" size={18} color="#82b440" />
                <Text style={styles.infoText}>Được thực hiện bởi kỹ thuật viên chuyên nghiệp</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="shield-checkmark-outline" size={18} color="#82b440" />
                <Text style={styles.infoText}>Đảm bảo chất lượng dịch vụ</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Footer - Book Now Button */}
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <View style={styles.priceContainer}>
              <Text style={styles.footerPriceLabel}>Giá dịch vụ</Text>
              <Text style={styles.footerPrice}>
                {typeof service.price === 'string' 
                  ? parseFloat(service.price).toLocaleString() 
                  : service.price.toLocaleString()} đ
              </Text>
            </View>
            <TouchableOpacity 
              style={[
                styles.bookButton,
                !(service.isAvailable ?? service.isActive ?? true) && styles.bookButtonDisabled
              ]}
              onPress={handleBookNow}
              disabled={!(service.isAvailable ?? service.isActive ?? true)}
            >
              <Ionicons name="calendar" size={18} color="#fff" />
              <Text style={styles.bookButtonText}>
                {(service.isAvailable ?? service.isActive ?? true) ? 'Đặt lịch ngay' : 'Không khả dụng'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
