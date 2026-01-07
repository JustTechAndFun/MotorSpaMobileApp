import { Ionicons } from '@expo/vector-icons';
import Mapbox from '@rnmapbox/maps';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

interface MapPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelectLocation: (location: LocationData) => void;
  initialLocation?: LocationData;
}

export default function MapPicker({
  visible,
  onClose,
  onSelectLocation,
  initialLocation,
}: MapPickerProps) {
  const cameraRef = useRef<Mapbox.Camera>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(
    initialLocation || null
  );
  const [loading, setLoading] = useState(false);
  const [locationPermission, setLocationPermission] = useState(false);

  useEffect(() => {
    if (visible) {
      requestLocationPermission();
    }
  }, [visible]);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
      
      if (status === 'granted' && !initialLocation) {
        getCurrentLocation();
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      // Get address for current location
      const address = await reverseGeocode(
        location.coords.latitude,
        location.coords.longitude
      );
      
      const newLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address,
      };
      
      setSelectedLocation(newLocation);
      
      // Animate camera to current location
      cameraRef.current?.setCamera({
        centerCoordinate: [location.coords.longitude, location.coords.latitude],
        zoomLevel: 15,
        animationDuration: 1000,
      });
    } catch (error) {
      console.error('Error getting current location:', error);
    } finally {
      setLoading(false);
    }
  };

  const reverseGeocode = async (latitude: number, longitude: number): Promise<string> => {
    try {
      const results = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      
      if (results && results.length > 0) {
        const result = results[0];
        const addressParts = [
          result.street,
          result.district,
          result.city,
          result.region,
          result.country,
        ].filter(Boolean);
        
        return addressParts.join(', ') || 'Unknown address';
      }
      
      return 'Unknown address';
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return 'Unable to get address';
    }
  };

  const handleMapPress = async (feature: any) => {
    const { geometry } = feature;
    if (!geometry || !geometry.coordinates) return;
    
    const [longitude, latitude] = geometry.coordinates;
    
    setLoading(true);
    const address = await reverseGeocode(latitude, longitude);
    
    setSelectedLocation({
      latitude,
      longitude,
      address,
    });
    setLoading(false);
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onSelectLocation(selectedLocation);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Location</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Map */}
        <View style={styles.mapContainer}>
          <Mapbox.MapView
            style={styles.map}
            styleURL={Mapbox.StyleURL.Street}
            onPress={handleMapPress}
          >
            <Mapbox.Camera
              ref={cameraRef}
              zoomLevel={initialLocation ? 15 : 12}
              centerCoordinate={
                initialLocation
                  ? [initialLocation.longitude, initialLocation.latitude]
                  : [106.6297, 10.8231] // Default: Ho Chi Minh City
              }
            />

            {locationPermission && (
              <Mapbox.LocationPuck
                puckBearingEnabled
                puckBearing="heading"
                pulsing={{ isEnabled: true }}
              />
            )}

            {selectedLocation && (
              <Mapbox.PointAnnotation
                id="selected-location"
                coordinate={[selectedLocation.longitude, selectedLocation.latitude]}
              >
                <View style={styles.markerContainer}>
                  <Ionicons name="location" size={40} color="#82b440" />
                </View>
              </Mapbox.PointAnnotation>
            )}
          </Mapbox.MapView>

          {/* Current Location Button */}
          {locationPermission && (
            <TouchableOpacity
              style={styles.currentLocationButton}
              onPress={getCurrentLocation}
              disabled={loading}
            >
              <Ionicons name="locate" size={24} color="#fff" />
            </TouchableOpacity>
          )}

          {/* Loading Overlay */}
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#82b440" />
            </View>
          )}
        </View>

        {/* Selected Location Info */}
        {selectedLocation && (
          <View style={styles.infoContainer}>
            <View style={styles.infoContent}>
              <Ionicons name="location" size={24} color="#82b440" />
              <View style={styles.infoText}>
                <Text style={styles.addressText} numberOfLines={2}>
                  {selectedLocation.address || 'Unknown address'}
                </Text>
                <Text style={styles.coordinatesText}>
                  {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.confirmButton,
              !selectedLocation && styles.confirmButtonDisabled,
            ]}
            onPress={handleConfirm}
            disabled={!selectedLocation}
          >
            <Text style={styles.confirmButtonText}>Confirm Location</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'ios' ? 50 : 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  placeholder: {
    width: 36,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentLocationButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#82b440',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
  },
  addressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  coordinatesText: {
    fontSize: 12,
    color: '#999',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  confirmButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#82b440',
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#ccc',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
