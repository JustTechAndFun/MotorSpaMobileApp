import { Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');
const cardWidth = width > 768 ? width * 0.2 : width * 0.38;

export const styles = StyleSheet.create({
  container: {
    width: cardWidth,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginRight: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageContainer: {
    width: '100%',
    height: cardWidth * 0.85,
    backgroundColor: '#f9f9f9',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  infoContainer: {
    padding: 10,
  },
  name: {
    fontSize: width > 768 ? 15 : 13,
    color: '#333',
    marginBottom: 5,
    fontWeight: '500',
  },
  price: {
    fontSize: width > 768 ? 16 : 14,
    color: '#ff6b00',
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  soldText: {
    fontSize: 11,
    color: '#999',
  },
});
