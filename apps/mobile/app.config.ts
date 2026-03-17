import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Receipt Radar',
  slug: 'receipt-radar-mobile',
  owner: 'jolman009',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  scheme: 'receiptradar',
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#f8fafc',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.jolma.receiptradar',
  },
  android: {
    package: 'com.jolma.receiptradar',
    permissions: ['CAMERA', 'READ_MEDIA_IMAGES'],
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    ['expo-camera', { cameraPermission: 'Allow Receipt Radar to use your camera to scan receipts.' }],
    ['expo-image-picker', { photosPermission: 'Allow Receipt Radar to access your photos to upload receipts.' }],
    'expo-sharing',
    'expo-sqlite',
    'expo-image',
    'expo-secure-store',
    ['@sentry/react-native/expo', { organization: 'receipt-radar', project: 'receipt-radar-mobile' }],
    'expo-updates',
  ],
  extra: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL || 'https://receipt-radar-api.onrender.com/api',
    eas: {
      projectId: '1a88a075-d431-4cac-98d7-ac3632691309',
    },
  },
});
