require('dotenv').config();
module.exports = {
  expo: {
    name: "MotorSpa",
    slug: "MotorSpa",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "motorspa",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "This app needs access to your location to help you select delivery addresses on the map.",
        NSLocationAlwaysUsageDescription: "This app needs access to your location to help you select delivery addresses on the map."
      }
    },
    android: {
      package: "com.motorspa.app",
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      permissions: [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION"
      ]
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Allow MotorSpa to use your location to help you select delivery addresses.",
          "locationAlwaysPermission": "Allow MotorSpa to use your location to help you select delivery addresses.",
          "locationWhenInUsePermission": "Allow MotorSpa to use your location to help you select delivery addresses."
        }
      ],
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            backgroundColor: "#000000"
          }
        }
      ],
      "expo-web-browser",
      "@react-native-google-signin/google-signin"
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true
    },
    extra: {
      mapboxAccessToken: process.env.MAPBOX_ACCESS_TOKEN,
      eas: {
        projectId: "865b8e63-a7a0-42d4-9c5d-837bd1c5770b"
      },
      googleWebClientId: process.env.GOOGLE_WEB_CLIENT_ID
    },
    updates: {
      url: "https://u.expo.dev/865b8e63-a7a0-42d4-9c5d-837bd1c5770b"
    },
    runtimeVersion: {
      policy: "appVersion"
    }
  }
};