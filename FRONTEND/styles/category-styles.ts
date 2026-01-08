import { Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');
const iconSize = width > 768 ? 80 : 60;

export const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
  },
  title: {
    fontSize: width > 768 ? 26 : 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 18,
    letterSpacing: 0.3,
  },
  grid: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 25,
    paddingHorizontal: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  categoryItem: {
    alignItems: 'center',
    width: '22%',
  },
  iconContainer: {
    width: iconSize,
    height: iconSize,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: width > 768 ? 13 : 11,
    color: '#333',
    textAlign: 'center',
  },
});
