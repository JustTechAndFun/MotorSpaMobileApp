import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Guideline sizes based on standard ~5" screen mobile device
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

/**
 * Function to scale size based on device width
 * @param size - Base size to scale
 * @returns Scaled size
 */
export const scale = (size: number): number => {
  return (SCREEN_WIDTH / guidelineBaseWidth) * size;
};

/**
 * Function to scale size based on device height
 * @param size - Base size to scale
 * @returns Scaled size
 */
export const verticalScale = (size: number): number => {
  return (SCREEN_HEIGHT / guidelineBaseHeight) * size;
};

/**
 * Function to scale size with a factor
 * @param size - Base size to scale
 * @param factor - Scaling factor (default: 0.5)
 * @returns Moderately scaled size
 */
export const moderateScale = (size: number, factor = 0.5): number => {
  return size + (scale(size) - size) * factor;
};

/**
 * Function to normalize font sizes
 * @param size - Font size to normalize
 * @returns Normalized font size
 */
export const normalize = (size: number): number => {
  const newSize = size * (SCREEN_WIDTH / guidelineBaseWidth);
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

/**
 * Get device width
 */
export const deviceWidth = SCREEN_WIDTH;

/**
 * Get device height
 */
export const deviceHeight = SCREEN_HEIGHT;

/**
 * Check if device is small screen (width < 375)
 */
export const isSmallDevice = SCREEN_WIDTH < 375;

/**
 * Check if device is large screen (width > 768)
 */
export const isTablet = SCREEN_WIDTH > 768;

/**
 * Responsive width based on percentage
 * @param percentage - Width percentage (0-100)
 * @returns Width in pixels
 */
export const wp = (percentage: number): number => {
  return (SCREEN_WIDTH * percentage) / 100;
};

/**
 * Responsive height based on percentage
 * @param percentage - Height percentage (0-100)
 * @returns Height in pixels
 */
export const hp = (percentage: number): number => {
  return (SCREEN_HEIGHT * percentage) / 100;
};

/**
 * Get responsive padding
 * @param size - Base padding size
 * @returns Responsive padding
 */
export const getResponsivePadding = (size: number): number => {
  if (isSmallDevice) {
    return size * 0.8;
  }
  if (isTablet) {
    return size * 1.2;
  }
  return size;
};

/**
 * Get responsive font size
 * @param size - Base font size
 * @returns Responsive font size
 */
export const getResponsiveFontSize = (size: number): number => {
  if (isSmallDevice) {
    return normalize(size * 0.9);
  }
  if (isTablet) {
    return normalize(size * 1.1);
  }
  return normalize(size);
};

/**
 * Common responsive sizes
 */
export const responsiveSizes = {
  // Padding
  paddingXS: getResponsivePadding(4),
  paddingS: getResponsivePadding(8),
  paddingM: getResponsivePadding(12),
  paddingL: getResponsivePadding(16),
  paddingXL: getResponsivePadding(24),
  paddingXXL: getResponsivePadding(32),

  // Margin
  marginXS: getResponsivePadding(4),
  marginS: getResponsivePadding(8),
  marginM: getResponsivePadding(12),
  marginL: getResponsivePadding(16),
  marginXL: getResponsivePadding(24),
  marginXXL: getResponsivePadding(32),

  // Border Radius
  radiusS: getResponsivePadding(4),
  radiusM: getResponsivePadding(8),
  radiusL: getResponsivePadding(12),
  radiusXL: getResponsivePadding(16),
  radiusXXL: getResponsivePadding(24),

  // Font Sizes
  fontXS: getResponsiveFontSize(10),
  fontS: getResponsiveFontSize(12),
  fontM: getResponsiveFontSize(14),
  fontL: getResponsiveFontSize(16),
  fontXL: getResponsiveFontSize(18),
  fontXXL: getResponsiveFontSize(20),
  fontXXXL: getResponsiveFontSize(24),

  // Icon Sizes
  iconS: moderateScale(16),
  iconM: moderateScale(20),
  iconL: moderateScale(24),
  iconXL: moderateScale(28),
  iconXXL: moderateScale(32),

  // Button Heights
  buttonS: verticalScale(36),
  buttonM: verticalScale(44),
  buttonL: verticalScale(52),

  // Input Heights
  inputS: verticalScale(36),
  inputM: verticalScale(44),
  inputL: verticalScale(52),
};

export default {
  scale,
  verticalScale,
  moderateScale,
  normalize,
  deviceWidth,
  deviceHeight,
  isSmallDevice,
  isTablet,
  wp,
  hp,
  getResponsivePadding,
  getResponsiveFontSize,
  responsiveSizes,
};
