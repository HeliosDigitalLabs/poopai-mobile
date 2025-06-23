# Social Authentication Frontend Setup Guide

This guide explains how to configure the frontend for Google and Apple authentication.

## What's Already Implemented

✅ **Installed Packages:**

- `expo-auth-session` - For OAuth flows
- `expo-crypto` - For secure random generation
- `@react-native-google-signin/google-signin` - Google Sign-In SDK
- `expo-apple-authentication` - Apple Sign-In SDK

✅ **Services Created:**

- `socialAuthService.ts` - Handles Google/Apple sign-in flows
- Updated `authService.ts` - Added backend communication methods

✅ **Context Updated:**

- `AuthContext.tsx` - Added `loginWithGoogle()` and `loginWithApple()` methods

✅ **UI Updated:**

- `AuthModal.tsx` - Enabled Google and Apple sign-in buttons

## Configuration Required

### 1. Google Sign-In Setup

**Step 1: Google Cloud Console**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable the Google Sign-In API
4. Go to "Credentials" section
5. Create OAuth 2.0 client IDs:
   - **Web application** (for webClientId)
   - **iOS application** (for iosClientId)

**Step 2: Update Configuration**
Edit `/config/socialAuthConfig.ts`:

```typescript
export const SocialAuthConfig = {
  google: {
    webClientId: "YOUR_ACTUAL_WEB_CLIENT_ID.apps.googleusercontent.com",
    iosClientId: "YOUR_ACTUAL_IOS_CLIENT_ID.apps.googleusercontent.com",
  },
};
```

### 2. Apple Sign-In Setup

**Step 1: Apple Developer Console**

1. Go to [Apple Developer Console](https://developer.apple.com/)
2. Select your app identifier
3. Add "Sign In with Apple" capability
4. Configure Sign In with Apple

**Step 2: Xcode Configuration**

1. Open your iOS project in Xcode
2. Go to your app target settings
3. Under "Signing & Capabilities", add "Sign In with Apple"

**Note:** Apple Sign-In doesn't require client IDs in the config - it's handled automatically by `expo-apple-authentication`.

### 3. Backend Endpoints Required

Your backend needs to implement these endpoints:

```
POST /api/auth/google
POST /api/auth/apple
```

See `/docs/social-auth-backend-setup.md` for detailed backend implementation guide.

## Usage

Once configured, users can:

1. **Sign in with Google:**

   - Tap "Continue with Google" button
   - Google Sign-In flow opens
   - User authenticates with Google
   - App receives JWT token from your backend

2. **Sign in with Apple:**
   - Tap "Continue with Apple" button
   - Apple Sign-In flow opens
   - User authenticates with Apple
   - App receives JWT token from your backend

## Testing

### Development Testing

- Google Sign-In works in Expo Go and development builds
- Apple Sign-In requires a development build (not available in Expo Go)

### Production Testing

- Both Google and Apple Sign-In work in production builds
- Make sure to test on actual devices

## Error Handling

The implementation includes error handling for:

- Cancelled sign-ins
- Network errors
- Invalid tokens
- Service unavailability

Errors are logged to console and can be extended to show user-friendly messages.

## Security Notes

- ID tokens are sent securely to your backend for verification
- Never trust frontend claims - always verify tokens on backend
- Device IDs are included for account linking
- User data is stored securely in AsyncStorage after successful authentication
