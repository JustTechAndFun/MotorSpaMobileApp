import { Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
  },
  title: {
    fontSize: width > 768 ? 22 : 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    paddingHorizontal: width * 0.04,
  },
  scrollContent: {
    paddingHorizontal: width * 0.04,
  },
});
