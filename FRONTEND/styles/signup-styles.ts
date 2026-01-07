import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  bg: { 
    flex: 1, 
    width: '100%',
  },
  safe: { 
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  logoWrap: { 
    alignItems: 'center', 
    marginBottom: 30,
  },
  logo: { 
    width: 200, 
    height: 200,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardTitle: { 
    fontSize: 28, 
    fontWeight: '700', 
    color: '#82b440',
    marginBottom: 4,
  },
  cardSub: { 
    fontSize: 16, 
    color: '#666',
    marginBottom: 24,
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  icon: { 
    color: '#666', 
    marginRight: 12,
  },
  countryCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8E8E8',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 10,
  },
  countryCodeText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
    marginRight: 2,
  },
  input: { 
    flex: 1, 
    fontSize: 15, 
    color: '#333',
  },

  primaryButton: {
    backgroundColor: '#82b440',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: { 
    color: '#fff', 
    fontSize: 16,
    fontWeight: '700',
  },

  footerLink: { 
    alignItems: 'center',
    paddingVertical: 12,
  },
  footerLinkText: { 
    color: '#82b440',
    fontSize: 14,
    fontWeight: '600',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e6e6e6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
  },
  countryList: {
    padding: 8,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginVertical: 2,
  },
  countryItemSelected: {
    backgroundColor: '#e8f4fd',
  },
  countryFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  countryName: {
    flex: 1,
    fontSize: 16,
    color: '#222',
  },
  countryCodeInList: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
});
