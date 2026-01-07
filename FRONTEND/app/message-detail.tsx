import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { qnaService } from '../services';
import { QnAMessage } from '../types/api.types';

export default function MessageDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  
  const [message, setMessage] = useState<QnAMessage | null>(null);
  const [loading, setLoading] = useState(true);

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
      Alert.alert('Lỗi', 'Không thể tải tin nhắn');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc muốn xóa tin nhắn này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await qnaService.deleteMessage(params.id!);
              Alert.alert('Thành công', 'Đã xóa tin nhắn');
              router.back();
            } catch (error: any) {
              Alert.alert('Lỗi', error.message || 'Không thể xóa tin nhắn');
            }
          },
        },
      ]
    );
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
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết tin nhắn</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#82b440" />
        </View>
      </SafeAreaView>
    );
  }

  if (!message) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết tin nhắn</Text>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={22} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Status */}
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(message.status) }]}>
            <Text style={styles.statusText}>{getStatusText(message.status)}</Text>
          </View>
          <Text style={styles.dateText}>
            {new Date(message.createdAt).toLocaleString('vi-VN')}
          </Text>
        </View>

        {/* Subject */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Tiêu đề</Text>
          <Text style={styles.subject}>{message.subject}</Text>
        </View>

        {/* Message */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Câu hỏi của bạn</Text>
          <View style={styles.messageBox}>
            <Text style={styles.messageText}>{message.message}</Text>
          </View>
        </View>

        {/* Reply */}
        {message.reply ? (
          <View style={styles.section}>
            <View style={styles.replyHeader}>
              <Ionicons name="chatbubble-ellipses" size={18} color="#82b440" />
              <Text style={styles.replyLabel}>Phản hồi từ chúng tôi</Text>
            </View>
            <View style={styles.replyBox}>
              <Text style={styles.replyText}>{message.reply}</Text>
            </View>
            {message.updatedAt !== message.createdAt && (
              <Text style={styles.replyDate}>
                Phản hồi lúc: {new Date(message.updatedAt).toLocaleString('vi-VN')}
              </Text>
            )}
          </View>
        ) : (
          <View style={styles.section}>
            <View style={styles.pendingBox}>
              <Ionicons name="time-outline" size={24} color="#FF9500" />
              <Text style={styles.pendingText}>
                Chúng tôi đang xem xét câu hỏi của bạn và sẽ phản hồi sớm nhất có thể
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 48,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#333',
  },
  deleteButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statusContainer: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 20,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#fff',
  },
  dateText: {
    fontSize: 13,
    color: '#999',
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase' as const,
  },
  subject: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#333',
    lineHeight: 28,
  },
  messageBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  messageText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  replyHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 8,
  },
  replyLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#82b440',
    marginLeft: 6,
    textTransform: 'uppercase' as const,
  },
  replyBox: {
    backgroundColor: '#f0f8f4',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#c8e6d0',
  },
  replyText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  replyDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    fontStyle: 'italic' as const,
  },
  pendingBox: {
    backgroundColor: '#fff9f0',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: '#ffe4b3',
  },
  pendingText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    lineHeight: 20,
  },
};
