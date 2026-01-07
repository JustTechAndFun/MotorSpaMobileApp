import { Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');
const iconContainerSize = width > 768 ? 60 : 50;

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#B8D4A8',
    paddingVertical: width > 768 ? 15 : 12,
    paddingHorizontal: width * 0.05,
    borderTopWidth: 1,
    borderTopColor: '#A0C490',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  iconContainer: {
    width: iconContainerSize,
    height: iconContainerSize,
    borderRadius: iconContainerSize / 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  activeIcon: {
    backgroundColor: '#4A7C59',
  },
});
