import { Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: width * 0.04,
    paddingVertical: 10,
    backgroundColor: '#fff',
    gap: width * 0.03,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: width > 768 ? 16 : 14,
    color: '#333',
  },
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: width * 0.03,
  },
  iconButton: {
    padding: 4,
  },
});
