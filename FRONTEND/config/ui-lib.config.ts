/**
 * React Native UI Lib Configuration
 * Setup theme, colors, typography
 */
import { BorderRadiuses, Colors, Spacings, Typography } from 'react-native-ui-lib';

// Brand Colors
const brandColors = {
  primaryColor: '#6366F1',      // Indigo 500
  primaryDarker: '#4F46E5',     // Indigo 600
  primaryLighter: '#818CF8',    // Indigo 400
  secondaryColor: '#F59E0B',    // Amber 500
  accentColor: '#10B981',       // Emerald 500

  // Backgrounds
  screenBG: '#F1F5F9',          // Slate 100
  cardBG: '#FFFFFF',
  surface: '#FFFFFF',

  // Text
  textColor: '#0F172A',         // Slate 900
  textSecondary: '#64748B',    // Slate 500
  textTertiary: '#94A3B8',     // Slate 400
  textInverse: '#FFFFFF',

  // Status
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',

  // UI Elements
  border: '#E2E8F0',            // Slate 200
  divider: '#F1F5F9',           // Slate 100
  disabled: '#CBD5E1',

  // Greyscale for legacy/misc usage
  grey10: '#1F2937',
  grey20: '#374151',
  grey30: '#4B5563',
  grey40: '#6B7280',
  grey50: '#9CA3AF',
  grey60: '#D1D5DB',
  grey70: '#E5E7EB',
  grey80: '#F3F4F6',

  // Action Colors
  red30: '#EF4444',
  orange30: '#F59E0B',
  orange80: '#FEF3C7',
  indigo80: '#E0E7FF',
  indigo70: '#C7D2FE',
};

// Load brand colors
Colors.loadColors(brandColors);

// Load design tokens
Colors.loadSchemes({
  light: {
    screenBG: brandColors.screenBG,
    textColor: brandColors.textColor,
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
