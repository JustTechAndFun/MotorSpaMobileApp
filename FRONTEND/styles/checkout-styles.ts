import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
    color: '#333',
  },
  headerPlaceholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  section: {
    marginTop: 8,
  },
  
  // Card Styles
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginVertical: 6,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  
  // Product Styles
  productRow: {
    flexDirection: 'row',
    marginTop: 8,
    flexWrap: 'nowrap',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    flexShrink: 0,
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
    minWidth: 0,
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    flexWrap: 'wrap',
    flexShrink: 1,
  },
  productDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantity: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  price: {
    fontSize: 14,
    color: '#666',
  },
  
  // Address Styles
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  editText: {
    fontSize: 14,
    color: '#82b440',
    fontWeight: '600',
  },
  addressContent: {
    marginTop: 8,
  },
  addressName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  addressDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  addressCity: {
    fontSize: 14,
    color: '#666',
  },
  emptyState: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#82b440',
    fontWeight: '600',
    marginLeft: 8,
  },
  
  // Shipping Styles
  shippingOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  shippingLabel: {
    fontSize: 15,
    color: '#333',
  },
  shippingPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  
  // Payment Styles
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  paymentLabel: {
    fontSize: 15,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  defaultBadge: {
    backgroundColor: '#82b440',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  addPaymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#82b440',
    borderRadius: 8,
    borderStyle: 'dashed',
  },
  addPaymentText: {
    fontSize: 14,
    color: '#82b440',
    fontWeight: '600',
    marginLeft: 8,
  },
  
  // Payment Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  paymentMethodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  paymentMethodItemSelected: {
    borderColor: '#82b440',
    backgroundColor: '#E8F5E9',
  },
  paymentMethodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  paymentMethodDetails: {
    fontSize: 14,
    color: '#666',
  },
  emptyPayment: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyPaymentText: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
  },
  addPaymentMethodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#82b440',
    borderStyle: 'dashed',
    marginTop: 8,
  },
  addPaymentMethodText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#82b440',
    marginLeft: 8,
  },
  
  // Price Details
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 8,
  },
  totalRow: {
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#82b440',
  },
  
  // Footer
  footer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  footerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  footerLabel: {
    fontSize: 14,
    color: '#666',
  },
  footerTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  confirmButton: {
    backgroundColor: '#82b440',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
