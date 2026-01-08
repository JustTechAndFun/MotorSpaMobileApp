import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Text, View, Colors, Card } from 'react-native-ui-lib';
import { qnaService } from '../services';
import { QnAMessage } from '../types/api.types';

const FAQItem = ({ question, answer, isInitiallyOpen = false }: any) => {
  const [isOpen, setIsOpen] = useState(isInitiallyOpen);

  return (
    <Card
      padding-18
      marginB-12
      enableShadow
      style={{ borderRadius: 16 }}
    >
      <TouchableOpacity
        onPress={() => setIsOpen(!isOpen)}
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Text text70 textColor flex style={{ fontWeight: 'bold', marginRight: 12 }}>
          {question}
        </Text>
        <View
          width={32}
          height={32}
          center
          br100
          style={{ backgroundColor: Colors.primaryColor + '20' }}
        >
          <Ionicons
            name={isOpen ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={Colors.primaryColor}
          />
        </View>
      </TouchableOpacity>
      {isOpen && (
        <View marginT-14 paddingT-14 style={{ borderTopWidth: 1, borderTopColor: Colors.grey80 }}>
          <Text text80 grey30 style={{ lineHeight: 24 }}>
            {answer}
          </Text>
        </View>
      )}
    </Card>
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
    <View flex bg-grey80>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />

      {/* Modern Header */}
      <View
        row
        centerV
        paddingH-20
        paddingT-15
        paddingB-18
        bg-white
        style={{
          borderBottomWidth: 1.5,
          borderBottomColor: Colors.grey70,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 3
        }}
      >
        <TouchableOpacity
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
        <Text text40 textColor style={{ fontWeight: 'bold' }}>Help Center</Text>
      </View>

      {/* Modern Tabs */}
      <View
        row
        bg-white
        paddingH-20
        paddingV-12
        style={{ borderBottomWidth: 1, borderBottomColor: Colors.grey80 }}
      >
        <TouchableOpacity
          onPress={() => setActiveTab('faq')}
          style={{
            flex: 1,
            alignItems: 'center',
            paddingVertical: 10,
            borderBottomWidth: activeTab === 'faq' ? 3 : 0,
            borderBottomColor: Colors.primaryColor
          }}
        >
          <Ionicons
            name="help-circle-outline"
            size={22}
            color={activeTab === 'faq' ? Colors.primaryColor : Colors.grey40}
          />
          <Text
            text80
            marginT-6
            style={{
              color: activeTab === 'faq' ? Colors.primaryColor : Colors.grey40,
              fontWeight: activeTab === 'faq' ? 'bold' : '600'
            }}
          >
            FAQ
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('contact')}
          style={{
            flex: 1,
            alignItems: 'center',
            paddingVertical: 10,
            borderBottomWidth: activeTab === 'contact' ? 3 : 0,
            borderBottomColor: Colors.primaryColor
          }}
        >
          <Ionicons
            name="mail-outline"
            size={22}
            color={activeTab === 'contact' ? Colors.primaryColor : Colors.grey40}
          />
          <Text
            text80
            marginT-6
            style={{
              color: activeTab === 'contact' ? Colors.primaryColor : Colors.grey40,
              fontWeight: activeTab === 'contact' ? 'bold' : '600'
            }}
          >
            Liên hệ
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('messages')}
          style={{
            flex: 1,
            alignItems: 'center',
            paddingVertical: 10,
            borderBottomWidth: activeTab === 'messages' ? 3 : 0,
            borderBottomColor: Colors.primaryColor
          }}
        >
          <Ionicons
            name="chatbubbles-outline"
            size={22}
            color={activeTab === 'messages' ? Colors.primaryColor : Colors.grey40}
          />
          <Text
            text80
            marginT-6
            style={{
              color: activeTab === 'messages' ? Colors.primaryColor : Colors.grey40,
              fontWeight: activeTab === 'messages' ? 'bold' : '600'
            }}
          >
            Tin nhắn
          </Text>
        </TouchableOpacity>
      </View>

      <View flex>
        {activeTab === 'faq' && (
          <ScrollView contentContainerStyle={{ paddingTop: 20, paddingHorizontal: 20, paddingBottom: 100 }}>
            <Text text60 textColor style={{ fontWeight: 'bold', marginBottom: 20 }}>Câu hỏi thường gặp</Text>
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
          <ScrollView contentContainerStyle={{ paddingTop: 20, paddingHorizontal: 20, paddingBottom: 100 }}>
            <Text text60 textColor style={{ fontWeight: 'bold', marginBottom: 12 }}>Gửi câu hỏi</Text>
            <Text text80 grey40 style={{ marginBottom: 24 }}>
              Gửi câu hỏi của bạn và chúng tôi sẽ phản hồi sớm nhất có thể
            </Text>

            <View style={{ marginBottom: 16 }}>
              <Text text80 textColor style={{ fontWeight: '600', marginBottom: 8 }}>Tiêu đề *</Text>
              <TextInput
                style={{
                  backgroundColor: 'white',
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  borderRadius: 14,
                  fontSize: 15,
                  color: Colors.textColor
                }}
                placeholder="Ví dụ: Hỏi về sản phẩm"
                placeholderTextColor={Colors.grey50}
                value={subject}
                onChangeText={setSubject}
              />
            </View>

            <View style={{ marginBottom: 24 }}>
              <Text text80 textColor style={{ fontWeight: '600', marginBottom: 8 }}>Nội dung *</Text>
              <TextInput
                style={{
                  backgroundColor: 'white',
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  borderRadius: 14,
                  fontSize: 15,
                  color: Colors.textColor,
                  minHeight: 140,
                  textAlignVertical: 'top'
                }}
                placeholder="Nhập nội dung câu hỏi của bạn..."
                placeholderTextColor={Colors.grey50}
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={6}
              />
            </View>

            <TouchableOpacity
              style={{
                paddingVertical: 16,
                borderRadius: 14,
                backgroundColor: submitting ? Colors.grey60 : Colors.primaryColor,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: Colors.primaryColor,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6
              }}
              onPress={handleSubmitMessage}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text text70 white style={{ fontWeight: 'bold' }}>Gửi câu hỏi</Text>
              )}
            </TouchableOpacity>

            <View style={{ height: 20 }} />
          </ScrollView>
        )}

        {activeTab === 'messages' && (
          <ScrollView
            contentContainerStyle={{ paddingTop: 20, paddingHorizontal: 20, paddingBottom: 100 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primaryColor]} />
            }
          >
            {loading ? (
              <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
                <ActivityIndicator size="large" color={Colors.primaryColor} />
              </View>
            ) : myMessages.length === 0 ? (
              <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
                <View
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 50,
                    backgroundColor: 'white',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 20
                  }}
                >
                  <Ionicons name="chatbubbles-outline" size={50} color={Colors.grey60} />
                </View>
                <Text text60 textColor style={{ fontWeight: 'bold', marginBottom: 8 }}>Chưa có tin nhắn nào</Text>
                <Text text80 grey50 style={{ marginBottom: 24 }}>Gửi câu hỏi để nhận hỗ trợ</Text>
                <TouchableOpacity
                  style={{
                    paddingVertical: 14,
                    paddingHorizontal: 32,
                    borderRadius: 14,
                    backgroundColor: Colors.primaryColor,
                    shadowColor: Colors.primaryColor,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 6,
                    elevation: 4
                  }}
                  onPress={() => setActiveTab('contact')}
                >
                  <Text text70 white style={{ fontWeight: 'bold' }}>Gửi câu hỏi ngay</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {myMessages.map((msg) => (
                  <Card
                    key={msg.id}
                    enableShadow
                    elevation={2}
                    padding-16
                    marginB-12
                    style={{ borderRadius: 16 }}
                    onPress={() => router.push(`/message-detail?id=${msg.id}`)}
                  >
                    <View row centerV spread marginB-8>
                      <Text text70 textColor flex style={{ fontWeight: 'bold', marginRight: 12 }} numberOfLines={1}>
                        {msg.subject}
                      </Text>
                      <View
                        style={{
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          borderRadius: 8,
                          backgroundColor: getStatusColor(msg.status)
                        }}
                      >
                        <Text text90 white style={{ fontWeight: 'bold' }}>{getStatusText(msg.status)}</Text>
                      </View>
                    </View>
                    <Text text80 grey40 marginB-10 numberOfLines={2}>
                      {msg.message}
                    </Text>
                    {msg.reply && (
                      <View row centerV marginB-8 style={{ gap: 6 }}>
                        <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                        <Text text90 style={{ color: '#34C759', fontWeight: '600' }}>Đã có phản hồi</Text>
                      </View>
                    )}
                    <Text text90 grey50>
                      {new Date(msg.createdAt).toLocaleDateString('vi-VN')}
                    </Text>
                  </Card>
                ))}
              </>
            )}
            <View style={{ height: 20 }} />
          </ScrollView>
        )}
      </View>
    </View>
  );
}