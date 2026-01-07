import { Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');
const isTablet = width > 768;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5EC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: width * 0.04,
    paddingVertical: isTablet ? 20 : 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: isTablet ? 22 : 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  addressList: {
    paddingHorizontal: width * 0.04,
    paddingTop: 20,
  },
  addressCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: isTablet ? 20 : 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addressCardPrimary: {
    backgroundColor: '#E8F5E9',
    borderWidth: 2,
    borderColor: '#4A7C59',
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkboxContainer: {
    marginRight: 12,
    padding: 4,
  },
  addressName: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: 'bold',
    color: '#333',
  },
  primaryBadge: {
    fontSize: isTablet ? 12 : 10,
    color: '#4A7C59',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  addressBodyContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  addressBody: {
    flex: 1,
    marginRight: 12,
  },
  homeIconButton: {
    padding: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressText: {
    fontSize: isTablet ? 15 : 13,
    color: '#666',
    lineHeight: isTablet ? 22 : 20,
    marginBottom: 4,
  },
  phoneText: {
    fontSize: isTablet ? 15 : 13,
    color: '#4A7C59',
    fontWeight: '600',
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: isTablet ? 14 : 12,
    color: '#999',
    marginTop: 8,
  },
  addButton: {
    backgroundColor: '#fff',
    paddingVertical: isTablet ? 18 : 16,
    borderRadius: 12,
    marginHorizontal: width * 0.04,
    marginTop: 10,
    marginBottom: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4A7C59',
    borderStyle: 'solid',
  },
  addButtonText: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
    color: '#4A7C59',
  },
  // Delete Modal Styles
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  deleteModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  deleteModalIcon: {
    marginBottom: 16,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  deleteModalMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  deleteModalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  deleteModalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  deleteModalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  deleteModalDeleteButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#ff4444',
    alignItems: 'center',
  },
  deleteModalDeleteText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  // Message Modal Styles (Success/Error)
  messageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  messageModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    width: '100%',
    maxWidth: 350,
    alignItems: 'center',
  },
  messageModalIcon: {
    marginBottom: 16,
  },
  messageModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  messageModalMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  messageModalButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  messageModalButtonSuccess: {
    backgroundColor: '#82b440',
  },
  messageModalButtonError: {
    backgroundColor: '#ff4444',
  },
  messageModalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
