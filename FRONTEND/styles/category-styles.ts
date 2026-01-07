import { Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');
const iconSize = width > 768 ? 80 : 60;

export const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
    paddingHorizontal: width * 0.04,
  },
  title: {
    fontSize: width > 768 ? 22 : 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  grid: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: width * 0.04,
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
