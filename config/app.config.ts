/**
 * Application Configuration
 *
 * This file contains app-wide configuration settings that control
 * various features and behaviors throughout the application.
 *
 * 🔧 DEVELOPMENT MODE SETUP:
 * To enable development mode with mock data and testing features:
 * 1. Set isDevelopmentMode to true
 * 2. Configure mock data settings below
 * 3. The app will use mock scan data and provide 99 free scans for testing
 */

export const AppConfig = {
  /**
   * DEVELOPMENT MODE FLAG
   *
   * Controls whether the app uses mock data (development) or real API calls (production)
   *
   * - true: Uses mock data, no API calls to backend
   * - false: Makes real API calls to backend server
   */
  isDevelopmentMode: false,

  /**
   * SOCIAL AUTHENTICATION
   *
   * Controls whether social authentication features are enabled
   * Set to false if backend endpoints are not yet implemented
   */
  socialAuth: {
    enabled: false, // Set to true once backend endpoints are implemented
    showButtons: false, // Whether to show Google/Apple buttons in UI
  },

  /**
   * API Configuration
   */
  api: {
    baseUrl: "http://104.248.224.160:5000", // Update this with your actual backend URL
    endpoints: {
      analyzeImage: "/api/poop/analyze",
    },
    timeout: 300000, // 5 minutes - generous timeout to allow AI processing time
  },

  /**
   * Mock Data Configuration
   */
  mockData: {
    analysisDelay: 3000, // How long to show "analyzing" animation in development mode (ms)
    developmentScansLeft: 3, // How many scans to give users in development mode
    generateMockHistory: true, // Whether to generate mock scan history for testing
    mockHistoryCount: 15, // Number of mock scans to generate for history
    mockHistoryDaysBack: 30, // How many days back to distribute mock scans
    forceNoPoopDetected: false, // Set to true to test "no poop detected" screen with PoopBot animation in development mode
  },
} as const;

export type AppConfigType = typeof AppConfig;
