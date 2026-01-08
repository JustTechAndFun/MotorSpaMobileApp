import React from 'react';
import { Dimensions, ImageBackground, View as RNView } from 'react-native';
import { View, Text, Colors } from 'react-native-ui-lib';
import { Ionicons } from '@expo/vector-icons';
import Carousel from 'react-native-reanimated-carousel';
import { styles } from '../styles/banner-styles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const BANNERS = [
  'https://images.unsplash.com/photo-1558981403-c5f91cbba527?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1449491073997-60ce3ac50bd9?auto=format&fit=crop&q=80&w=800',
];

export default function Banner() {
  return (
    <RNView style={styles.container}>
      <Carousel
        loop
        width={SCREEN_WIDTH - 40} // Better padding
        height={200}
        autoPlay={true}
        data={BANNERS}
        scrollAnimationDuration={1200}
        autoPlayInterval={3500}
        renderItem={({ item }) => (
          <View
            flex
            style={{
              borderRadius: 24,
              overflow: 'hidden',
              elevation: 6,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 10,
            }}
          >
            <ImageBackground
              source={{ uri: item }}
              style={{ flex: 1, justifyContent: 'flex-end', padding: 25 }}
            >
              {/* Gradient Overlay */}
              <View
                absF
                style={{
                  background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.6))',
                  backgroundColor: 'rgba(0,0,0,0.35)'
                }}
              />

              <View style={{ zIndex: 1 }}>
                <Text white text40 style={{ fontWeight: 'bold', letterSpacing: 0.5, textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 }}>
                  Premium Care
                </Text>
                <Text white text80 marginT-8 style={{ opacity: 0.95, fontWeight: '500' }}>
                  Expert motorcycle services at your doorstep
                </Text>

                {/* Call to action indicator */}
                <View
                  row
                  centerV
                  marginT-15
                  paddingH-16
                  paddingV-8
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.25)',
                    borderRadius: 20,
                    alignSelf: 'flex-start',
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.4)'
                  }}
                >
                  <Text white text90 style={{ fontWeight: '600' }}>Explore Now</Text>
                  <Ionicons name="arrow-forward" size={16} color="white" style={{ marginLeft: 8 }} />
                </View>
              </View>
            </ImageBackground>
          </View>
        )}
      />
    </RNView>
  );
}
