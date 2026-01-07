import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    RefreshControl,
    ScrollView, TextInput, TouchableOpacity,
} from 'react-native';
import { Text, View } from 'react-native-ui-lib';
import { qnaService } from '../../services';
import { styles } from '../../styles/admin-qna-management-styles';
import { QnAMessage, QnAStatus } from '../../types/api.types';

type FilterType = 'all' | 'PENDING' | 'ANSWERED' | 'CLOSED';

export default function QnAManagementScreen() {
  const router = useRouter();
  
  const [messages, setMessages] = useState<QnAMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  
  // Reply Modal
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<QnAMessage | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyStatus, setReplyStatus] = useState<QnAStatus>('ANSWERED');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await qnaService.getAllMessages();
      setMessages(data.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (error: any) {
      console.error('Error loading messages:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách tin nhắn');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMessages();
    setRefreshing(false);
  }, []);

  const handleReply = (message: QnAMessage) => {
    setSelectedMessage(message);
    setReplyText(message.reply || '');
    setReplyStatus(message.reply ? message.status : 'ANSWERED');
    setReplyModalVisible(true);
  };

  const handleSubmitReply = async () => {
    if (!replyText.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập nội dung phản hồi');
      return;
    }

    try {
      setSubmitting(true);
      await qnaService.replyToMessage(selectedMessage!.id, {
        reply: replyText.trim(),
        status: replyStatus,
      });
      Alert.alert('Thành công', 'Đã gửi phản hồi');
      setReplyModalVisible(false);
      loadMessages();
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể gửi phản hồi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (message: QnAMessage, newStatus: QnAStatus) => {
    try {
      await qnaService.updateStatus(message.id, newStatus);
      Alert.alert('Thành công', 'Đã cập nhật trạng thái');
      loadMessages();
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể cập nhật trạng thái');
    }
  };

  const handleDelete = (message: QnAMessage) => {
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
              await qnaService.deleteMessage(message.id);
              Alert.alert('Thành công', 'Đã xóa tin nhắn');
              loadMessages();
            } catch (error: any) {
              Alert.alert('Lỗi', error.message || 'Không thể xóa tin nhắn');
            }
          },
        },
      ]
    );
  };


  const filteredMessages = messages.filter((msg) => {
    // Filter by status
    if (filterType !== 'all' && msg.status !== filterType) {
      return false;
    }

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        msg.subject.toLowerCase().includes(query) ||
        msg.message.toLowerCase().includes(query) ||
        msg.user?.name.toLowerCase().includes(query) ||
        msg.user?.phone.includes(query)
      );
    }

    return true;
  });

  const stats = {
    total: messages.length,
    pending: messages.filter(m => m.status === 'PENDING').length,
    answered: messages.filter(m => m.status === 'ANSWERED').length,
    closed: messages.filter(m => m.status === 'CLOSED').length,
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

  const renderMessageItem = ({ item }: { item: QnAMessage }) => (
    <View style={styles.messageCard}>
      <View style={styles.messageHeader}>
        <View style={{ flex: 1 }}>
          <View style={styles.userInfo}>
            <Ionicons name="person-circle" size={20} color="#666" />
            <Text style={styles.userName}>{item.user?.name || 'Unknown'}</Text>
            <Text style={styles.userPhone}> • {item.user?.phone || 'N/A'}</Text>
          </View>
          <Text style={styles.messageSubject}>{item.subject}</Text>
        </View>
        <TouchableOpacity onPress={() => handleReply(item)}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <Text style={styles.messageContent} numberOfLines={3}>
        {item.message}
      </Text>

      {item.reply && (
        <View style={styles.replyPreview}>
          <Ionicons name="checkmark-circle" size={16} color="#34C759" />
          <Text style={styles.replyPreviewText} numberOfLines={2}>
            {item.reply}
          </Text>
        </View>
      )}

      <View style={styles.messageFooter}>
        <Text style={styles.messageDate}>
          {new Date(item.createdAt).toLocaleString('vi-VN')}
        </Text>
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleReply(item)}
          >
            <Ionicons name="chatbubble-outline" size={18} color="#007AFF" />
            <Text style={styles.actionText}>Trả lời</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, { marginLeft: 8 }]}
            onPress={() => handleDelete(item)}
          >
            <Ionicons name="trash-outline" size={18} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quản lý QnA</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#82b440" />
          <Text style={{ marginTop: 12, color: '#666' }}>Đang tải...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản lý QnA</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Statistics */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Tổng số</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#FF9500' }]}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Đang chờ</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#34C759' }]}>{stats.answered}</Text>
          <Text style={styles.statLabel}>Đã trả lời</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#999' }]}>{stats.closed}</Text>
          <Text style={styles.statLabel}>Đã đóng</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm theo tiêu đề, nội dung, user..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery !== '' && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.filterChip, filterType === 'all' && styles.filterChipActive]}
            onPress={() => setFilterType('all')}
          >
            <Text style={[styles.filterChipText, filterType === 'all' && styles.filterChipTextActive]}>
              Tất cả ({messages.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filterType === 'PENDING' && styles.filterChipActive]}
            onPress={() => setFilterType('PENDING')}
          >
            <Text style={[styles.filterChipText, filterType === 'PENDING' && styles.filterChipTextActive]}>
              Đang chờ ({stats.pending})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filterType === 'ANSWERED' && styles.filterChipActive]}
            onPress={() => setFilterType('ANSWERED')}
          >
            <Text style={[styles.filterChipText, filterType === 'ANSWERED' && styles.filterChipTextActive]}>
              Đã trả lời ({stats.answered})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filterType === 'CLOSED' && styles.filterChipActive]}
            onPress={() => setFilterType('CLOSED')}
          >
            <Text style={[styles.filterChipText, filterType === 'CLOSED' && styles.filterChipTextActive]}>
              Đã đóng ({stats.closed})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Message List */}
      <FlatList
        data={filteredMessages}
        renderItem={renderMessageItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#82b440']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              {searchQuery || filterType !== 'all' ? 'Không tìm thấy tin nhắn' : 'Chưa có tin nhắn nào'}
            </Text>
          </View>
        }
      />

      {/* Reply Modal */}
      <Modal
        visible={replyModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setReplyModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setReplyModalVisible(false)}>
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {selectedMessage?.reply ? 'Chỉnh sửa phản hồi' : 'Trả lời câu hỏi'}
            </Text>
            <TouchableOpacity onPress={handleSubmitReply} disabled={submitting}>
              <Text style={[styles.saveButton, submitting && { opacity: 0.5 }]}>
                {submitting ? 'Đang gửi...' : 'Gửi'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* User Info */}
            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>Khách hàng</Text>
              <View style={styles.userInfoCard}>
                <Ionicons name="person" size={18} color="#666" />
                <Text style={styles.userInfoText}>
                  {selectedMessage?.user?.name} • {selectedMessage?.user?.phone}
                </Text>
              </View>
            </View>

            {/* Original Message */}
            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>Câu hỏi</Text>
              <View style={styles.originalMessage}>
                <Text style={styles.originalSubject}>{selectedMessage?.subject}</Text>
                <Text style={styles.originalText}>{selectedMessage?.message}</Text>
              </View>
            </View>

            {/* Reply Input */}
            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>Phản hồi *</Text>
              <TextInput
                style={styles.replyInput}
                placeholder="Nhập nội dung phản hồi..."
                value={replyText}
                onChangeText={setReplyText}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>

            {/* Status Selection */}
            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>Trạng thái</Text>
              <View style={styles.statusOptions}>
                <TouchableOpacity
                  style={[
                    styles.statusOption,
                    replyStatus === 'ANSWERED' && styles.statusOptionActive,
                  ]}
                  onPress={() => setReplyStatus('ANSWERED')}
                >
                  <View style={[styles.statusDot, { backgroundColor: '#34C759' }]} />
                  <Text style={styles.statusOptionText}>Đã trả lời</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.statusOption,
                    replyStatus === 'CLOSED' && styles.statusOptionActive,
                  ]}
                  onPress={() => setReplyStatus('CLOSED')}
                >
                  <View style={[styles.statusDot, { backgroundColor: '#999' }]} />
                  <Text style={styles.statusOptionText}>Đóng</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
