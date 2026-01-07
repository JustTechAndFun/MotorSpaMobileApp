/**
 * React Native UI Lib Configuration
 * Setup theme, colors, typography
 */
import { BorderRadiuses, Colors, Spacings, Typography } from 'react-native-ui-lib';

// Brand Colors
const brandColors = {
  primary: '#82b440',      // Green (main brand color)
  secondary: '#6B9B37',    // Darker green
  accent: '#9BCF53',       // Lighter green
  background: '#F5F5F5',
  surface: '#FFFFFF',
  error: '#FF3B30',
  warning: '#FF9500',
  success: '#34C759',
  info: '#007AFF',
  text: '#333333',
  textSecondary: '#666666',
  textTertiary: '#999999',
  border: '#E0E0E0',
  disabled: '#CCCCCC',
};

// Load brand colors
Colors.loadColors(brandColors);

// Load design tokens
Colors.loadSchemes({
  light: {
    screenBG: brandColors.background,
    textColor: brandColors.text,
    moonOrSun: Colors.yellow30,
    mountainForeground: Colors.green30,
    mountainBackground: Colors.green50,
  },
  dark: {
    screenBG: Colors.grey10,
    textColor: Colors.white,
    moonOrSun: Colors.grey80,
    mountainForeground: Colors.violet10,
    mountainBackground: Colors.violet20,
  },
});

// Typography
Typography.loadTypographies({
  h1: { fontSize: 32, fontWeight: '700', lineHeight: 40 },
  h2: { fontSize: 28, fontWeight: '600', lineHeight: 36 },
  h3: { fontSize: 24, fontWeight: '600', lineHeight: 32 },
  h4: { fontSize: 20, fontWeight: '600', lineHeight: 28 },
  h5: { fontSize: 18, fontWeight: '600', lineHeight: 24 },
  h6: { fontSize: 16, fontWeight: '600', lineHeight: 22 },
  body: { fontSize: 15, fontWeight: '400', lineHeight: 22 },
  bodySmall: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '400', lineHeight: 18 },
  button: { fontSize: 16, fontWeight: '600', lineHeight: 22 },
});

// Spacings
Spacings.loadSpacings({
  page: 20,
  card: 16,
  section: 24,
  item: 12,
  small: 8,
  tiny: 4,
});

// Border Radiuses
BorderRadiuses.loadBorders({
  br10: 4,
  br20: 8,
  br30: 12,
  br40: 16,
  br50: 20,
  br60: 24,
});

export default {
  Colors,
  Typography,
  Spacings,
  BorderRadiuses,
  brandColors,
};
