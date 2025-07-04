// Configuration file for social authentication
// IMPORTANT: Replace these placeholder values with your actual credentials from Google Cloud Console

export const SocialAuthConfig = {
  google: {
    // REPLACE THESE WITH YOUR ACTUAL GOOGLE CLOUD CONSOLE CREDENTIALS
    // Get these from: https://console.cloud.google.com/apis/credentials
    webClientId: "YOUR_WEB_CLIENT_ID_HERE.apps.googleusercontent.com", // Replace with your actual web client ID
    iosClientId: "YOUR_IOS_CLIENT_ID_HERE.apps.googleusercontent.com", // Replace with your actual iOS client ID
    // Note: androidClientId is not needed for the current Google Sign-In setup
  },

  // Apple Sign-In doesn't require client IDs - it's handled by expo-apple-authentication
  // But you'll need to configure your app in Apple Developer Console
  apple: {
    // Apple Sign-In is configured through expo-apple-authentication
    // Make sure your app has Apple Sign-In capability enabled
  },
};

// Validation function to check if configuration is properly set up
export const validateSocialAuthConfig = () => {
  const errors: string[] = [];

  // Check Google configuration
  if (
    SocialAuthConfig.google.webClientId.includes("YOUR_") ||
    SocialAuthConfig.google.webClientId.includes("70a62df1")
  ) {
    errors.push(
      "Google webClientId is not configured - still using placeholder"
    );
  }

  if (
    SocialAuthConfig.google.iosClientId.includes("YOUR_") ||
    SocialAuthConfig.google.iosClientId.includes("70a62df1")
  ) {
    errors.push(
      "Google iosClientId is not configured - still using placeholder"
    );
  }

  if (errors.length > 0) {
    console.warn("⚠️ Social Auth Configuration Issues:");
    errors.forEach((error) => console.warn(`  - ${error}`));
    console.warn("See docs/google-apple-auth-setup.md for setup instructions");
  }

  return errors.length === 0;
};

// Instructions for setup:
//
// GOOGLE SETUP:
// 1. Go to Google Cloud Console: https://console.cloud.google.com/
// 2. Create a new project or select existing project
// 3. Enable Google+ API
// 4. Go to Credentials section
// 5. Create OAuth 2.0 client IDs for:
//    - Web application (for webClientId)
//    - iOS application (for iosClientId)
// 6. Replace the placeholder values above with your actual client IDs
//
// APPLE SETUP:
// 1. Go to Apple Developer Console: https://developer.apple.com/
// 2. Add "Sign In with Apple" capability to your app identifier
// 3. Configure your app in Xcode to include Apple Sign-In
// 4. No additional client IDs needed - handled by expo-apple-authentication
//
// BACKEND SETUP:
// Make sure your backend has the following endpoints:
// - POST /api/auth/google (accepts { idToken, deviceId })
// - POST /api/auth/apple (accepts { idToken, deviceId, email?, fullName? })
// Both should return { token: string, user?: any }
