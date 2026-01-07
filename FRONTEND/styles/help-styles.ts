import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#F5F5EC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',    paddingTop: 48,  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 32,
  },
  headerContainer: {
    paddingTop: 18,
    paddingHorizontal: 15,
    backgroundColor: '#F5F5EC',
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainContentContainer: {
    flex: 1,
    backgroundColor: '#EEF2EB',
    marginTop: 10,
  },
  scrollContent: {
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  searchBarContainer: {
    backgroundColor: '#D6E2D0',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 20,
    marginTop: 10,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    color: '#000',
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  categoryButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },
  categoryButtonActive: {
    backgroundColor: '#6AAF4A',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  faqContainer: {
    marginBottom: 15,
  },
  faqHeader: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  faqBody: {
    backgroundColor: '#F8FAF7',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  faqBodyText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  contactBar: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginTop: 10,
    marginBottom: 20,
  },
  contactText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  contactLink: {
    fontSize: 16,
    color: '#4A7F3D',
    textDecorationLine: 'underline',
  },
  faqQuestionBar: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestionBarOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  faqQuestionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  faqAnswer: {
    backgroundColor: '#F8FAF7',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  footerContainer: {
    paddingVertical: 20,
    paddingHorizontal: 15,
    marginTop: 10,
  },
  footerInnerBar: {
    height: 4,
    backgroundColor: '#4A7F3D',
    marginBottom: 15,
    borderRadius: 2,
  },
  contactRow: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  contactUsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  callCenterBox: {
    marginTop: 8,
  },
  callCenterText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  phoneNumberText: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#82b440',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#82b440',
    fontWeight: '600',
  },

  // Contact Form
  contactFormTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    marginTop: 10,
  },
  contactFormDesc: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  formTextArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#82b440',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Messages
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: '#82b440',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  messageCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  messageSubject: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  messagePreview: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  replyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  replyText: {
    fontSize: 13,
    color: '#34C759',
    marginLeft: 4,
    fontWeight: '600',
  },
  messageDate: {
    fontSize: 12,
    color: '#999',
  },
});
