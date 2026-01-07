import { Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');
const isTablet = width > 768;
const numColumns = isTablet ? 3 : 2;
const cardSpacing = isTablet ? 20 : 10;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    backgroundColor: '#fff',
    paddingBottom: 15,
    paddingTop: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: width * 0.04,
    paddingVertical: isTablet ? 15 : 12,
  },
  backButton: {
    padding: isTablet ? 10 : 8,
  },
  headerTitle: {
    fontSize: isTablet ? 22 : 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cartButton: {
    backgroundColor: '#4CAF50',
    padding: isTablet ? 10 : 8,
    borderRadius: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginHorizontal: width * 0.04,
    marginTop: 10,
    height: isTablet ? 50 : 45,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: isTablet ? 16 : 14,
    color: '#333',
  },
  dropdownContainer: {
    marginHorizontal: width * 0.04,
    marginTop: 15,
  },
  dropdownLabel: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: isTablet ? 14 : 12,
  },
  dropdownText: {
    fontSize: isTablet ? 16 : 14,
    color: '#333',
  },
  dropdownMenu: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginHorizontal: width * 0.04,
    marginTop: 5,
    maxHeight: isTablet ? 300 : 200,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownScroll: {
    maxHeight: isTablet ? 300 : 200,
  },
  dropdownItem: {
    paddingHorizontal: 15,
    paddingVertical: isTablet ? 14 : 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemActive: {
    backgroundColor: '#f0f8f0',
  },
  dropdownItemText: {
    fontSize: isTablet ? 16 : 14,
    color: '#666',
  },
  dropdownItemTextActive: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
  productsGrid: {
    paddingHorizontal: cardSpacing / 2,
    paddingTop: 15,
    paddingBottom: 20,
  },
  productRow: {
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingHorizontal: cardSpacing / 2,
  },
  productCardWrapper: {
    width: (width - (cardSpacing * (numColumns + 1))) / numColumns,
    marginHorizontal: cardSpacing / 4,
  },
});
