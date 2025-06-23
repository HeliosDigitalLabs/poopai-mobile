# Google/Apple Authentication Setup Guide for EAS Builds

This guide will help you properly configure Google and Apple authentication to work in EAS builds.

## Current Issues

1. **Missing GoogleService-Info.plist**: Required for Google Sign-In on iOS
2. **Invalid Google Client IDs**: Placeholder values need to be replaced with real ones
3. **EAS Build Configuration**: Need proper configuration for production builds

## Step-by-Step Setup

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select your existing project
3. Enable the **Google+ API** and **Google Sign-In API**
4. Go to **Credentials** section
5. Create OAuth 2.0 client IDs for:

#### Web Application Client (for webClientId):

- Application type: Web application
- Name: "PoopAI Web Client"
- Authorized redirect URIs: Leave empty for now

#### iOS Application Client (for iosClientId):

- Application type: iOS
- Name: "PoopAI iOS Client"
- Bundle ID: `com.trypoopai.app` (must match your app.json)

#### Android Application Client (if needed):

- Application type: Android
- Name: "PoopAI Android Client"
- Package name: `com.poopai.app` (must match your app.json)
- SHA-1 certificate fingerprint: Get this from EAS Build or your keystore

### 2. Download GoogleService-Info.plist

1. In Google Cloud Console, go to your project
2. Click on "Download GoogleService-Info.plist" for iOS
3. Save this file as `GoogleService-Info.plist` in your frontend root directory
4. Update the template file with your actual values

### 3. Update Configuration Files

Replace the placeholder values in `config/socialAuthConfig.ts` with your actual client IDs:

```typescript
export const SocialAuthConfig = {
  google: {
    webClientId: "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com",
    iosClientId: "YOUR_IOS_CLIENT_ID.apps.googleusercontent.com",
  },
  apple: {
    // Apple Sign-In is configured through expo-apple-authentication
  },
};
```

### 4. Apple Developer Console Setup

1. Go to [Apple Developer Console](https://developer.apple.com/)
2. Navigate to your App ID: `com.trypoopai.app`
3. Enable "Sign In with Apple" capability
4. Configure App Groups if needed
5. Create/update your provisioning profiles

### 5. EAS Build Configuration

Update your `eas.json` to ensure proper build configuration:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": false
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      }
    },
    "production": {
      "autoIncrement": true
    }
  }
}
```

### 6. Build and Test

1. Create a development build:

   ```bash
   eas build --platform ios --profile development
   ```

2. Install the development build on a physical device

3. Test Google/Apple sign-in functionality

## Common Issues and Solutions

### Google Sign-In Issues:

- **"Sign in cancelled"**: User cancelled the flow
- **"Network error"**: Check internet connection
- **"Invalid client ID"**: Verify client IDs match Google Console
- **"App not verified"**: Add test users in Google Console for development

### Apple Sign-In Issues:

- **Not available in simulator**: Must test on physical iOS device
- **iOS version too old**: Requires iOS 13+
- **Bundle ID mismatch**: Ensure Apple Developer Console matches app.json

### EAS Build Issues:

- **Google Services not found**: Ensure GoogleService-Info.plist is in project root
- **Provisioning profile issues**: Regenerate profiles after enabling Apple Sign-In
- **Certificate problems**: Use EAS managed credentials or upload manually

## Testing Checklist

- [ ] GoogleService-Info.plist exists in project root
- [ ] Real Google client IDs in socialAuthConfig.ts
- [ ] Apple Sign-In capability enabled in Apple Developer Console
- [ ] Bundle IDs match between Apple Console and app.json
- [ ] Test on physical iOS device (not simulator)
- [ ] Test on physical Android device
- [ ] Verify backend endpoints are accessible
- [ ] Check EAS build logs for configuration errors

## Debug Tips

1. Enable verbose logging in your auth handlers
2. Check EAS build logs for configuration warnings
3. Use `eas build --platform ios --profile development --clear-cache` if issues persist
4. Test in Expo Go first, then development build, then production build
5. Use `npx expo doctor` to check for configuration issues

## Backend Requirements

Ensure your backend has these endpoints:

- `POST /api/auth/google` - accepts `{ idToken, deviceId }`
- `POST /api/auth/apple` - accepts `{ idToken, deviceId, email?, fullName? }`

Both should return `{ token: string, user?: any }`
