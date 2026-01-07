import React from 'react';
import { Dimensions, Image, View } from 'react-native';
import { styles } from '../styles/banner-styles';

const { width } = Dimensions.get('window');

export default function Banner() {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/banner.jpg')}
        style={styles.banner}
        resizeMode="cover"
      />
    </View>
  );
}
