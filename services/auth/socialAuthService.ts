import { Platform } from "react-native";
import * as AuthSession from "expo-auth-session";
import * as AppleAuthentication from "expo-apple-authentication";
import { authService } from "./authService";
import { getDeviceId } from "../../utils/deviceId";
import {
  SocialAuthConfig,
  validateSocialAuthConfig,
} from "../../config/socialAuthConfig";

// Dynamically import Google Sign-In to avoid runtime errors in Expo Go
let GoogleSignin: any = null;
try {
  GoogleSignin =
    require("@react-native-google-signin/google-signin").GoogleSignin;
} catch (error) {
  console.warn("Google Sign-In not available - requires development build");
}

export interface SocialAuthResult {
  success: boolean;
  token?: string;
  user?: any;
  error?: string;
}

class SocialAuthService {
  constructor() {
    this.initializeGoogleSignIn();
  }

  private initializeGoogleSignIn() {
    // Validate configuration first
    const isConfigValid = validateSocialAuthConfig();

    // Configure Google Sign-In only if available and properly configured
    if (GoogleSignin) {
      if (!isConfigValid) {
        console.warn(
          "⚠️ Google Sign-In configuration is incomplete. Please update config/socialAuthConfig.ts with your actual credentials."
        );
        return;
      }

      try {
        GoogleSignin.configure({
          webClientId: SocialAuthConfig.google.webClientId,
          iosClientId: SocialAuthConfig.google.iosClientId,
          scopes: ["profile", "email"],
          offlineAccess: false,
        });
        console.log("✅ Google Sign-In configured successfully");
      } catch (error) {
        console.warn("⚠️ Failed to configure Google Sign-In:", error);
      }
    } else {
      console.warn(
        "⚠️ Google Sign-In not available - requires development build"
      );
    }
  }

  /**
   * Sign in with Google
   */
  async signInWithGoogle(): Promise<SocialAuthResult> {
    try {
      if (!GoogleSignin) {
        throw new Error(
          "Google Sign-In requires a development build. Please create a development build to use this feature."
        );
      }

      console.log("🔵 Starting Google Sign-In...");

      // Check if Google Play Services are available
      await GoogleSignin.hasPlayServices();

      // Sign in and get user info
      const userInfo = await GoogleSignin.signIn();

      if (!userInfo.data?.idToken) {
        throw new Error("Failed to get Google ID token");
      }

      console.log("🔵 Google Sign-In successful, sending to backend...");

      // Get device ID for account association
      const deviceId = await getDeviceId();

      // Send ID token to your backend
      const response = await authService.loginWithGoogle(
        userInfo.data.idToken,
        deviceId
      );

      return {
        success: true,
        token: response.token,
        user: response.user,
      };
    } catch (error: any) {
      console.error("❌ Google Sign-In failed:", error);

      let errorMessage = "Google Sign-In failed";
      if (error.message?.includes("development build")) {
        errorMessage = "Google Sign-In requires a development build";
      } else if (error.code === "SIGN_IN_CANCELLED") {
        errorMessage = "Sign-in was cancelled";
      } else if (error.code === "IN_PROGRESS") {
        errorMessage = "Sign-in is already in progress";
      } else if (error.code === "PLAY_SERVICES_NOT_AVAILABLE") {
        errorMessage = "Google Play Services not available";
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Sign in with Apple (iOS only)
   */
  async signInWithApple(): Promise<SocialAuthResult> {
    try {
      if (Platform.OS !== "ios") {
        throw new Error("Apple Sign-In is only available on iOS");
      }

      console.log("🍎 Starting Apple Sign-In...");

      // Check if Apple Authentication is available
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      if (!isAvailable) {
        throw new Error("Apple Sign-In is not available on this device");
      }

      // Perform Apple Sign-In
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        throw new Error("Failed to get Apple identity token");
      }

      console.log("🍎 Apple Sign-In successful, sending to backend...");

      // Get device ID for account association
      const deviceId = await getDeviceId();

      // Send identity token to your backend
      const response = await authService.loginWithApple(
        credential.identityToken,
        deviceId,
        {
          email: credential.email,
          fullName: credential.fullName,
        }
      );

      return {
        success: true,
        token: response.token,
        user: response.user,
      };
    } catch (error: any) {
      console.error("❌ Apple Sign-In failed:", error);
      console.log("Error details:", {
        message: error.message,
        code: error.code,
        name: error.name,
        stack: error.stack,
      });

      let errorMessage = "Apple Sign-In failed";
      if (error.code === "ERR_REQUEST_CANCELED") {
        errorMessage = "Sign-in was cancelled";
      } else if (error.code === "ERR_INVALID_RESPONSE") {
        errorMessage = "Invalid response from Apple";
      } else if (error.message?.includes("not available")) {
        errorMessage = "Apple Sign-In is not available on this device";
      } else if (error.message?.includes("identity token")) {
        errorMessage = "Failed to get Apple identity token";
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Sign out from Google
   */
  async signOutGoogle(): Promise<void> {
    try {
      if (GoogleSignin) {
        await GoogleSignin.signOut();
        console.log("🔵 Google Sign-Out successful");
      }
    } catch (error) {
      console.error("❌ Google Sign-Out failed:", error);
    }
  }

  /**
   * Check if user is signed in to Google
   */
  async isGoogleSignedIn(): Promise<boolean> {
    try {
      if (!GoogleSignin) {
        return false;
      }
      const currentUser = await GoogleSignin.getCurrentUser();
      return currentUser !== null;
    } catch (error) {
      console.error("❌ Failed to check Google sign-in status:", error);
      return false;
    }
  }

  /**
   * Check if Google Sign-In is available (requires development build)
   */
  isGoogleSignInAvailable(): boolean {
    return GoogleSignin !== null;
  }

  /**
   * Check if Apple Sign-In is available (iOS only)
   */
  async isAppleSignInAvailable(): Promise<boolean> {
    console.log("🔍 Checking Apple Sign-In availability...");
    console.log("  Platform.OS:", Platform.OS);

    if (Platform.OS !== "ios") {
      console.log("  ❌ Not iOS platform");
      return false;
    }

    try {
      const available = await AppleAuthentication.isAvailableAsync();
      console.log(
        "  ✅ AppleAuthentication.isAvailableAsync() result:",
        available
      );
      return available;
    } catch (error) {
      console.log("  ❌ Error checking Apple availability:", error);
      return false;
    }
  }
}

export const socialAuthService = new SocialAuthService();
