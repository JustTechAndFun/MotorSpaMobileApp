import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Modal,
} from 'react-native';
import { Text, View, Colors, Card } from 'react-native-ui-lib';
import { qnaService } from '../services';
import { QnAMessage } from '../types/api.types';

export default function MessageDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  
  const [message, setMessage] = useState<QnAMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadMessage();
    }
  }, [params.id]);

  const loadMessage = async () => {
    try {
      setLoading(true);
      const data = await qnaService.getMessageById(params.id!);
      setMessage(data);
    } catch (error: any) {
      console.error('Error loading message:', error);
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await qnaService.deleteMessage(params.id!);
      router.back();
    } catch (error: any) {
      console.error('Error deleting message:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return '#FF9500';
      case 'ANSWERED': return '#34C759';
      case 'CLOSED': return '#999';
      default: return '#999';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Đang chờ';
      case 'ANSWERED': return 'Đã trả lời';
      case 'CLOSED': return 'Đã đóng';
      default: return status;
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.grey80 }}>
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar barStyle="dark-content" />

        {/* Header */}
        <View style={{ paddingTop: 50, paddingBottom: 14, paddingHorizontal: 16, backgroundColor: 'white' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: Colors.grey80,
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <MaterialIcons name="arrow-back-ios" size={18} color={Colors.textColor} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
            <Text text60 style={{ fontWeight: 'bold', color: Colors.textColor }}>Chi tiết tin nhắn</Text>
            <View style={{ width: 40 }} />
          </View>
        </View>

        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primaryColor} />
          <Text text70 marginT-10 style={{ color: Colors.grey50 }}>Đang tải...</Text>
        </View>
      </View>
    );
  }

  if (!message) {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.grey80 }}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={{ paddingTop: 50, paddingBottom: 14, paddingHorizontal: 16, backgroundColor: 'white' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: Colors.grey80,
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <MaterialIcons name="arrow-back-ios" size={18} color={Colors.textColor} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
          <Text text60 style={{ fontWeight: 'bold', color: Colors.textColor }}>Chi tiết tin nhắn</Text>
          <TouchableOpacity
            onPress={() => setShowDeleteModal(true)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: Colors.red30,
              opacity: 0.15,
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <MaterialIcons name="delete-outline" size={20} color={Colors.red30} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Card */}
        <Card
          enableShadow
          elevation={2}
          style={{
            marginBottom: 16,
            borderRadius: 16,
            backgroundColor: 'white',
            padding: 16
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 12,
                backgroundColor: getStatusColor(message.status)
              }}
            >
              <Text text90 white style={{ fontWeight: 'bold' }}>
                {getStatusText(message.status)}
              </Text>
            </View>
            <Text text90 style={{ color: Colors.grey50 }}>
              {new Date(message.createdAt).toLocaleString('vi-VN')}
            </Text>
          </View>
        </Card>

        {/* Subject Card */}
        <View style={{ marginBottom: 16 }}>
          <Text text80 style={{ fontWeight: '600', color: Colors.grey50, marginBottom: 8, textTransform: 'uppercase' }}>
            Tiêu đề
          </Text>
          <Text text60 style={{ fontWeight: 'bold', color: Colors.textColor, lineHeight: 28 }}>
            {message.subject}
          </Text>
        </View>

        {/* Question Card */}
        <View style={{ marginBottom: 16 }}>
          <Text text80 style={{ fontWeight: '600', color: Colors.grey50, marginBottom: 8, textTransform: 'uppercase' }}>
            Câu hỏi của bạn
          </Text>
          <Card
            enableShadow
            elevation={1}
            style={{
              borderRadius: 14,
              backgroundColor: 'white',
              padding: 16
            }}
          >
            <Text text80 style={{ color: Colors.textColor, lineHeight: 22 }}>
              {message.message}
            </Text>
          </Card>
        </View>

        {/* Reply Section */}
        {message.reply ? (
          <View style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <MaterialIcons name="chat-bubble" size={18} color={Colors.primaryColor} />
              <Text text80 style={{ fontWeight: '600', color: Colors.primaryColor, marginLeft: 6, textTransform: 'uppercase' }}>
                Phản hồi từ chúng tôi
              </Text>
            </View>
            <Card
              enableShadow
              elevation={1}
              style={{
                borderRadius: 14,
                backgroundColor: '#e8f5e9',
                padding: 16,
                borderWidth: 1,
                borderColor: Colors.primaryColor
              }}
            >
              <Text text80 style={{ color: Colors.textColor, lineHeight: 22 }}>
                {message.reply}
              </Text>
            </Card>
            {message.updatedAt !== message.createdAt && (
              <Text text90 style={{ color: Colors.grey50, marginTop: 8, fontStyle: 'italic' }}>
                Phản hồi lúc: {new Date(message.updatedAt).toLocaleString('vi-VN')}
              </Text>
            )}
          </View>
        ) : (
          <Card
            enableShadow
            elevation={1}
            style={{
              borderRadius: 14,
              backgroundColor: '#fff9f0',
              padding: 20,
              borderWidth: 1,
              borderColor: '#ffe4b3',
              marginBottom: 16
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialIcons name="schedule" size={24} color="#FF9500" />
              <Text text80 style={{ flex: 1, color: Colors.grey40, marginLeft: 12, lineHeight: 20 }}>
                Chúng tôi đang xem xét câu hỏi của bạn và sẽ phản hồi sớm nhất có thể
              </Text>
            </View>
          </Card>
        )}
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <Modal visible={showDeleteModal} animationType="fade" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 24, width: '100%', maxWidth: 340, alignItems: 'center' }}>
            <View
              style={{
                width: 70,
                height: 70,
                borderRadius: 35,
                backgroundColor: Colors.red30,
                opacity: 0.15,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20
              }}
            >
              <MaterialIcons name="delete-outline" size={36} color={Colors.red30} />
            </View>
            <Text text60 style={{ fontWeight: 'bold', color: Colors.textColor, marginBottom: 8, textAlign: 'center' }}>
              Xóa tin nhắn
            </Text>
            <Text text80 style={{ color: Colors.grey50, marginBottom: 24, textAlign: 'center' }}>
              Bạn có chắc chắn muốn xóa tin nhắn này? Hành động này không thể hoàn tác.
            </Text>
            <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
              <TouchableOpacity
                onPress={() => setShowDeleteModal(false)}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 14,
                  backgroundColor: Colors.grey80,
                  alignItems: 'center'
                }}
              >
                <Text text70 style={{ fontWeight: 'bold', color: Colors.textColor }}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setShowDeleteModal(false);
                  handleDelete();
                }}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 14,
                  backgroundColor: Colors.red30,
                  alignItems: 'center',
                  shadowColor: Colors.red30,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 6,
                  elevation: 4
                }}
              >
                <Text text70 white style={{ fontWeight: 'bold' }}>Xóa</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

