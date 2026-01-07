import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { qnaService } from '../services';
import { styles } from '../styles/help-styles';
import { QnAMessage } from '../types/api.types';

const COLORS = {
  LIGHT_GREEN: '#E6EAE0',
  MEDIUM_GREEN: '#D6E2D0',
  DARK_GREEN: '#387A4C',
};

const FAQItem = ({ question, answer, isInitiallyOpen = false }: any) => {
  const [isOpen, setIsOpen] = useState(isInitiallyOpen);

  return (
    <View style={styles.faqContainer}>
      <TouchableOpacity
        style={[styles.faqQuestionBar, isOpen && styles.faqQuestionBarOpen]}
        onPress={() => setIsOpen(!isOpen)}
      >
        <Text style={styles.faqQuestionText}>{question}</Text>
        <Ionicons name={isOpen ? 'chevron-up' : 'chevron-forward'} size={20} color={COLORS.DARK_GREEN} />
      </TouchableOpacity>
      {isOpen && (
        <View style={styles.faqAnswer}>
          <Text style={styles.faqAnswerText}>{answer}</Text>
        </View>
      )}
    </View>
  );
};

export default function HelpCenterScreen() {
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'faq' | 'contact' | 'messages'>('faq');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [myMessages, setMyMessages] = useState<QnAMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (activeTab === 'messages') {
      loadMyMessages();
    }
  }, [activeTab]);

  const loadMyMessages = async () => {
    try {
      setLoading(true);
      const data = await qnaService.getMyMessages();
      setMyMessages(data.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (error: any) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMyMessages();
    setRefreshing(false);
  }, []);

  const handleSubmitMessage = async () => {
    if (!subject.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tiêu đề');
      return;
    }
    if (!message.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập nội dung');
      return;
    }

    try {
      setSubmitting(true);
      await qnaService.createMessage({
        subject: subject.trim(),
        message: message.trim(),
      });
      Alert.alert('Thành công', 'Đã gửi câu hỏi của bạn. Chúng tôi sẽ phản hồi sớm nhất!');
      setSubject('');
      setMessage('');
      setActiveTab('messages');
      loadMyMessages();
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể gửi tin nhắn');
    } finally {
      setSubmitting(false);
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

  const faqData = [
    {
      id: 1,
      question: 'How long does it take to deliver my order?',
      answer:
        "The product will be shipped from the store 1 day after payment has been made and will arrive in approximately 2-5 days, depending on the buyer's location.",
      isInitiallyOpen: true,
    },
    {
      id: 2,
      question: 'How do I confirm payment?',
      answer:
        'The buyer does not need to upload proof of payment because it is automatically managed by the system. If the payment is successful, the transaction status on the page will automatically change from "Not Paid" to "Packaged".',
    },
  ];

  return (
    <SafeAreaView style={styles.screenContainer}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            try {
              router.back();
            } catch {
              try {
                router.push('/home');
              } catch {
                /* no-op */
              }
            }
          }}
        >
          <FontAwesome5 name="arrow-left" size={18} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help Center</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'faq' && styles.tabActive]}
          onPress={() => setActiveTab('faq')}
        >
          <Ionicons name="help-circle-outline" size={20} color={activeTab === 'faq' ? '#82b440' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'faq' && styles.tabTextActive]}>
            FAQ
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'contact' && styles.tabActive]}
          onPress={() => setActiveTab('contact')}
        >
          <Ionicons name="mail-outline" size={20} color={activeTab === 'contact' ? '#82b440' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'contact' && styles.tabTextActive]}>
            Liên hệ
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'messages' && styles.tabActive]}
          onPress={() => setActiveTab('messages')}
        >
          <Ionicons name="chatbubbles-outline" size={20} color={activeTab === 'messages' ? '#82b440' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'messages' && styles.tabTextActive]}>
            Tin nhắn
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mainContentContainer}>
        {activeTab === 'faq' && (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.faqTitle}>Câu hỏi thường gặp</Text>
            {faqData.map((item) => (
              <FAQItem 
                key={item.id} 
                question={`${item.id}. ${item.question}`} 
                answer={item.answer} 
                isInitiallyOpen={item.isInitiallyOpen} 
              />
            ))}
            <View style={{ height: 20 }} />
          </ScrollView>
        )}

        {activeTab === 'contact' && (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.contactFormTitle}>Gửi câu hỏi</Text>
            <Text style={styles.contactFormDesc}>
              Gửi câu hỏi của bạn và chúng tôi sẽ phản hồi sớm nhất có thể
            </Text>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Tiêu đề *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Ví dụ: Hỏi về sản phẩm"
                value={subject}
                onChangeText={setSubject}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Nội dung *</Text>
              <TextInput
                style={[styles.formInput, styles.formTextArea]}
                placeholder="Nhập nội dung câu hỏi của bạn..."
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity 
              style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
              onPress={handleSubmitMessage}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Gửi câu hỏi</Text>
              )}
            </TouchableOpacity>

            <View style={{ height: 20 }} />
          </ScrollView>
        )}

        {activeTab === 'messages' && (
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#82b440']} />
            }
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#82b440" />
              </View>
            ) : myMessages.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
                <Text style={styles.emptyText}>Chưa có tin nhắn nào</Text>
                <TouchableOpacity 
                  style={styles.emptyButton}
                  onPress={() => setActiveTab('contact')}
                >
                  <Text style={styles.emptyButtonText}>Gửi câu hỏi ngay</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {myMessages.map((msg) => (
                  <TouchableOpacity
                    key={msg.id}
                    style={styles.messageCard}
                    onPress={() => router.push(`/message-detail?id=${msg.id}`)}
                  >
                    <View style={styles.messageHeader}>
                      <Text style={styles.messageSubject} numberOfLines={1}>
                        {msg.subject}
                      </Text>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(msg.status) }]}>
                        <Text style={styles.statusText}>{getStatusText(msg.status)}</Text>
                      </View>
                    </View>
                    <Text style={styles.messagePreview} numberOfLines={2}>
                      {msg.message}
                    </Text>
                    {msg.reply && (
                      <View style={styles.replyIndicator}>
                        <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                        <Text style={styles.replyText}>Đã có phản hồi</Text>
                      </View>
                    )}
                    <Text style={styles.messageDate}>
                      {new Date(msg.createdAt).toLocaleDateString('vi-VN')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </>
            )}
            <View style={{ height: 20 }} />
          </ScrollView>
        )}
      </View>

      {activeTab === 'faq' && (
        <View style={[styles.footerContainer, { backgroundColor: COLORS.LIGHT_GREEN }]}>
          <View style={styles.footerInnerBar} />
          <View style={styles.contactRow}>
            <Text style={styles.contactUsText}>LIÊN HỆ</Text>
            <View style={styles.callCenterBox}>
              <Ionicons name="call-outline" size={20} color={COLORS.DARK_GREEN} />
              <Text style={[styles.callCenterText, { color: COLORS.DARK_GREEN }]}>Call Center</Text>
              <Text style={[styles.phoneNumberText, { color: COLORS.DARK_GREEN }]}>220510</Text>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}