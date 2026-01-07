import { Ionicons } from '@expo/vector-icons';
import React, { createContext, useCallback, useContext, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type ToastType = 'success' | 'error' | 'info';

interface ToastConfig {
  type: ToastType;
  text1: string;
  text2?: string;
  position?: 'top' | 'center' | 'bottom';
}

interface ToastContextType {
  show: (config: ToastConfig) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastConfig | null>(null);
  const [opacity] = useState(new Animated.Value(0));

  const show = useCallback((config: ToastConfig) => {
    setToast(config);
    
    // Fade in
    Animated.timing(opacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Auto hide after 3 seconds
    setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setToast(null);
      });
    }, 3000);
  }, [opacity]);

  const hide = () => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setToast(null);
    });
  };

  const getIcon = () => {
    switch (toast?.type) {
      case 'success':
        return <Ionicons name="checkmark-circle" size={24} color="#FFF" />;
      case 'error':
        return <Ionicons name="close-circle" size={24} color="#FFF" />;
      case 'info':
        return <Ionicons name="information-circle" size={24} color="#FFF" />;
      default:
        return null;
    }
  };

  const getBackgroundColor = () => {
    switch (toast?.type) {
      case 'success':
        return '#4CAF50';
      case 'error':
        return '#F44336';
      case 'info':
        return '#2196F3';
      default:
        return '#333';
    }
  };

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast && (
        <Animated.View
          style={[
            styles.toastContainer,
            toast.position === 'center' ? styles.toastCenter : 
            toast.position === 'bottom' ? styles.toastBottom : 
            styles.toastTop,
            { 
              opacity,
              backgroundColor: getBackgroundColor(),
            },
          ]}
        >
          <TouchableOpacity
            style={styles.toastContent}
            onPress={hide}
            activeOpacity={0.9}
          >
            <View style={styles.iconContainer}>
              {getIcon()}
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.text1}>{toast.text1}</Text>
              {toast.text2 && <Text style={styles.text2}>{toast.text2}</Text>}
            </View>
          </TouchableOpacity>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 9999,
  },
  toastTop: {
    top: 50,
  },
  toastCenter: {
    top: '50%',
    transform: [{ translateY: -50 }],
  },
  toastBottom: {
    bottom: 100,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  text1: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  text2: {
    color: '#FFF',
    fontSize: 14,
    opacity: 0.9,
  },
});
