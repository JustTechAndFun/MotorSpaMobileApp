import { Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 180,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  banner: {
    width: '100%',
    height: '100%',
    // borderRadius: 8,
  },
});
