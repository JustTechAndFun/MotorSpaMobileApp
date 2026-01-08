import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f8faf7' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 12,
    paddingTop: 48,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  back: { padding: 6 },
  title: { fontWeight: '700', fontSize: 18, marginLeft: 6 },
  container: { padding: 16 },
  card: { backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 12 },
  label: { fontWeight: '700', marginBottom: 8 },
  serviceHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 8 
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  option: { flex: 1, padding: 10, borderRadius: 8, backgroundColor: '#f3f6f2', marginHorizontal: 4, alignItems: 'center' },
  optionActive: { backgroundColor: '#82b440' },
  optionText: { color: '#333', fontWeight: '600' },
  optionTextActive: { color: '#fff' },
  
  // Service Card Styles
  serviceCard: {
    width: 220,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
    flexShrink: 0,
  },
  serviceCardActive: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  serviceImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#f0f0f0',
  },
  serviceContent: {
    padding: 12,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  serviceNameActive: {
    color: '#007AFF',
  },
  serviceDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    lineHeight: 16,
  },
  servicePriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  servicePriceActive: {
    color: '#007AFF',
  },
  discountBadge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  discountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  serviceDuration: {
    fontSize: 11,
    color: '#666',
  },
  
  // Selected Service Card
  selectedServiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedServiceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 8,
  },
  selectedServiceImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  selectedServiceInfo: {
    flex: 1,
    marginLeft: 12,
  },
  selectedServiceName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  selectedServiceDesc: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  selectedServicePrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#007AFF',
  },
  
  // Select Service Button
  selectServiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f8ff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    marginTop: 8,
  },
  selectServiceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 8,
  },
  
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
  },
  
  // Location Styles
  addLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
  },
  locationItem: {
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  locationItemSelected: {
    backgroundColor: '#f0f8ff',
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  locationPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  locationDescription: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 4,
  },
  emptyLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff9f0',
    borderRadius: 8,
  },
  
  // Form Inputs
  notesInput: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  
  // Submit Button
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  
  inputButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 8 },
  inputText: { marginLeft: 8, color: '#333' },
  input: { backgroundColor: '#fff', padding: 10, borderRadius: 8 },
  summary: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 10, marginTop: 6 },
  thumb: { width: 80, height: 80, borderRadius: 8 },
  bookBtn: { marginTop: 16, backgroundColor: '#82b440', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  bookText: { color: '#fff', fontWeight: '700' },
});

/* simple inline styles for web <input> elements */
export const stylesWeb: any = {
  input: {
    width: '100%',
    padding: 10,
    borderRadius: 8,
    border: 'none',
    backgroundColor: '#fff',
    marginTop: 6,
    marginBottom: 6,
  },
};
