import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Button, Card, Colors, Text, View } from 'react-native-ui-lib';
import BottomNavigator from '../components/bottom-navigator';
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
        onPress={() => handleToggleService(item)}
        activeOpacity={0.7}
      >
        <Card
          marginH-20
          marginB-18
          padding-16
          style={{
            borderRadius: 20,
            borderWidth: isSelected ? 2.5 : 1.5,
            borderColor: isSelected ? Colors.primaryColor : Colors.grey70,
            elevation: isSelected ? 6 : 3,
            shadowColor: isSelected ? Colors.primaryColor : '#000',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: isSelected ? 0.2 : 0.1,
            shadowRadius: 8,
            backgroundColor: isSelected ? '#F0F4FF' : Colors.white
          }}
        >
          <View row>
            {/* Service Image */}
            <View
              style={{
                width: 110,
                height: 110,
                borderRadius: 18,
                overflow: 'hidden',
                backgroundColor: Colors.grey80
              }}
            >
              <Image
                source={{ uri: item.imageUrl || 'https://via.placeholder.com/110' }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
              {item.discountPercentage > 0 && (
                <View
                  absT
                  absR
                  paddingH-8
                  paddingV-4
                  style={{
                    backgroundColor: '#FF5722',
                    borderBottomLeftRadius: 12,
                    margin: 0
                  }}
                >
                  <Text text90 white style={{ fontWeight: 'bold' }}>-{item.discountPercentage}%</Text>
                </View>
              )}
            </View>

            {/* Service Info */}
            <View flex marginL-15 spread>
              <View>
                <Text text70 textColor numberOfLines={2} style={{ fontWeight: 'bold', lineHeight: 22 }}>
                  {item.name}
                </Text>
                <Text text90 grey40 marginT-6 numberOfLines={2} style={{ lineHeight: 18 }}>
                  {item.description}
                </Text>
              </View>

              <View marginT-12>
                {/* Price */}
                <View row centerV>
                  {item.discountPercentage > 0 && (
                    <Text text90 grey50 marginR-8 style={{ textDecorationLine: 'line-through' }}>
                      {formatCurrency(item.price)}
                    </Text>
                  )}
                  <Text text60 primaryColor style={{ fontWeight: 'bold' }}>
                    {formatCurrency(finalPrice)} ₫
                  </Text>
                </View>

                {/* Duration */}
                {item.estimatedDuration && (
                  <View row centerV marginT-6>
                    <Ionicons name="time-outline" size={16} color={Colors.grey40} />
                    <Text text90 grey40 marginL-6 style={{ fontWeight: '500' }}>
                      {item.estimatedDuration} phút
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Checkbox */}
            <View center marginL-12>
              <View
                width={28}
                height={28}
                br100
                center
                style={{
                  backgroundColor: isSelected ? Colors.primaryColor : 'transparent',
                  borderWidth: isSelected ? 0 : 2.5,
                  borderColor: Colors.grey50
                }}
              >
                {isSelected && <Ionicons name="checkmark" size={18} color="white" />}
              </View>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View
          row
          centerV
          paddingH-20
          paddingV-18
          bg-white
          style={{
            borderBottomWidth: 1.5,
            borderBottomColor: Colors.grey70
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: Colors.grey80,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 15
            }}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.textColor} />
          </TouchableOpacity>
          <View flex>
            <Text text50 textColor style={{ fontWeight: 'bold' }}>Chọn dịch vụ</Text>
            <Text text90 grey40 marginT-2 style={{ fontWeight: '500' }}>Chọn dịch vụ phù hợp cho xe của bạn</Text>
          </View>
        </View>
        <View flex center>
          <ActivityIndicator size="large" color={Colors.primaryColor} />
          <Text text70 grey40 marginT-15 style={{ fontWeight: '500' }}>Đang tải dịch vụ...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (services.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View
          row
          centerV
          paddingH-20
          paddingV-18
          bg-white
          style={{
            borderBottomWidth: 1.5,
            borderBottomColor: Colors.grey70
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: Colors.grey80,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 15
            }}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.textColor} />
          </TouchableOpacity>
          <Text text50 textColor style={{ fontWeight: 'bold' }}>Chọn dịch vụ</Text>
        </View>
        <View flex center paddingH-40>
          <View
            width={120}
            height={120}
            center
            br100
            bg-grey80
            marginB-25
          >
            <Ionicons name="construct-outline" size={60} color={Colors.grey40} />
          </View>
          <Text text50 textColor center style={{ fontWeight: 'bold' }}>Không có dịch vụ</Text>
          <Text text80 grey40 center marginT-12 style={{ lineHeight: 24 }}>
            Hiện tại chưa có dịch vụ nào khả dụng
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      {/* Modern Header */}
      <View
        row
        centerV
        paddingH-20
        paddingV-18
        bg-white
        style={{
          borderBottomWidth: 1.5,
          borderBottomColor: Colors.grey70
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: Colors.grey80,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 15
          }}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textColor} />
        </TouchableOpacity>
        <View flex>
          <Text text50 textColor style={{ fontWeight: 'bold' }}>Chọn dịch vụ</Text>
          <Text text90 grey40 marginT-2 style={{ fontWeight: '500' }}>
            {services.length} dịch vụ khả dụng
          </Text>
        </View>
      </View>

      {/* Service List */}
      <FlatList
        data={services}
        renderItem={renderServiceItem}
        keyExtractor={(item) => item.id!}
        contentContainerStyle={{ paddingTop: 20, paddingBottom: selectedServices.length > 0 ? 240 : 100 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Modern Footer Checkout */}
      {selectedServices.length > 0 && (
        <View
          bg-white
          padding-22
          left
          right
          style={{
            position: 'absolute',
            bottom: 70,
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -5 },
            shadowOpacity: 0.12,
            shadowRadius: 15,
            elevation: 12,
            paddingBottom: 28
          }}
        >
          <View row spread centerV marginB-18>
            <View>
              <Text text80 grey40 style={{ fontWeight: '500' }}>
                Đã chọn {selectedServices.length} dịch vụ
              </Text>
              <Text text40 primaryColor marginT-4 style={{ fontWeight: 'bold', letterSpacing: 0.3 }}>
                {formatCurrency(getTotalAmount())} ₫
              </Text>
            </View>

            <View
              paddingH-16
              paddingV-8
              style={{
                backgroundColor: Colors.grey80,
                borderRadius: 12
              }}
            >
              <Text text80 grey20 style={{ fontWeight: '600' }}>
                {selectedServices.reduce((sum, s) => sum + s.quantity, 0)} item
              </Text>
            </View>
          </View>

          <Button
            label="Tiếp tục đặt lịch"
            onPress={handleContinue}
            backgroundColor={Colors.primaryColor}
            style={{ height: 58, borderRadius: 18 }}
            labelStyle={{ fontWeight: 'bold', fontSize: 16, letterSpacing: 0.5 }}
            enableShadow
            iconSource={() => <Ionicons name="arrow-forward" size={22} color="#fff" style={{ marginLeft: 10 }} />}
            iconOnRight
          />
        </View>
      )}

      {/* Bottom Navigator */}
      <View absB absL absR>
        <BottomNavigator activeTab="booking" />
      </View>
    </SafeAreaView>
  );
}

function formatCurrency(n: number) {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
