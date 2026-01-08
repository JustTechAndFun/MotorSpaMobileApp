import { Platform, StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  screen: { backgroundColor: '#F5F5EC' },
  container: { padding: 16, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  backBtn: { padding: 6 },
  backText: { color: '#333' },
  screenTitle: { fontSize: 18, fontWeight: '700', marginTop: 6 },

  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'nowrap',
  },
  avatar: { width: 56, height: 56, borderRadius: 28, flexShrink: 0 },
  userHandle: { color: '#666', marginBottom: 4, flexWrap: 'wrap' },
  userName: { fontWeight: '700', fontSize: 16, flexWrap: 'wrap' },
  linkBtn: { marginTop: 8 },
  linkText: { color: '#6aa84f' },

  section: { marginTop: 12 },
  sectionTitle: { color: '#8a8a8a', marginBottom: 8 },
  option: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  optText: { fontSize: 14 },

  adminButton: {
    backgroundColor: '#E74C3C',
    padding: 14,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#E74C3C',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  adminButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },

  logoutBtn: {
    marginTop: 16,
    backgroundColor: '#82b440',
    padding: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  logoutBtnDisabled: {
    backgroundColor: '#cccccc',
  },
  logoutText: { color: '#fff', fontWeight: '700' },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    marginHorizontal: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#E74C3C',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '600',
  },

  editCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
  },
  avatarUpload: { alignItems: 'center', marginBottom: 12 },
  avatarLarge: { width: 88, height: 88, borderRadius: 44 },
  uploadText: { color: '#6aa84f', marginTop: 6 },

  field: { marginBottom: 12 },
  label: { color: '#888', marginBottom: 6 },
  input: {
    backgroundColor: '#f7f7f7',
    padding: 10,
    borderRadius: 8,
  },
  radio: { padding: 6 },

  saveBtn: {
    marginTop: 8,
    backgroundColor: '#82b440',
    padding: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  saveText: { color: '#fff', fontWeight: '700' },
});
