import { Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: width * 0.4,
    marginBottom: 15,
  },
  banner: {
    width: '100%',
    height: '100%',
    // borderRadius: 8,
  },
});
