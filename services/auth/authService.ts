import { AppConfig } from "../../config/app.config";
import { getDeviceId } from "../../utils/deviceId";

interface LoginResponse {
  token: string;
  user?: any;
}

interface SignupResponse {
  token: string;
  user?: any;
}

interface SocialAuthResponse {
  token: string;
  user?: any;
}

export interface SignupData {
  email: string;
  password: string;
  name: string;
  deviceId?: string; // Will be automatically added
  poopGoals?: string[];
  conditions?: string[];
  recentSymptoms?: string[];
  temperament?: string;
}

interface UserProfile {
  name: string;
  poopGoals?: string[];
  conditions?: string[];
  recentSymptoms?: string[];
  temperament?: string;
  poopScoreAvg?: number;
  // Scan count and premium status
  freeScansLeft?: number;
  paidScanCount?: number;
  premium?: boolean;
}

interface DeviceScanData {
  anonymous: true;
  deviceId: string;
  freeScansLeft: number;
}

interface VerifyTokenResponse {
  valid: boolean;
  user?: any;
}

class AuthService {
  private baseUrl = AppConfig.api.baseUrl;

  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${this.baseUrl}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Login failed");
    }

    return response.json();
  }

  async signup(signupData: SignupData): Promise<SignupResponse> {
    // Get device ID and include it in signup data
    const deviceId = await getDeviceId();

    const signupDataWithDevice = {
      ...signupData,
      deviceId,
    };

    console.log("📱 Including device ID in signup request");

    const response = await fetch(`${this.baseUrl}/api/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(signupDataWithDevice),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Signup failed");
    }

    return response.json();
  }

  async verifyToken(token: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/verify-token`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        return false;
      }

      const result: VerifyTokenResponse = await response.json();
      return result.valid;
    } catch (error) {
      console.error("Token verification error:", error);
      return false;
    }
  }

  async getUserProfile(token: string): Promise<UserProfile> {
    console.log("🔍 Making API request to /api/auth/user-info...");

    const response = await fetch(`${this.baseUrl}/api/auth/user-info`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("❌ User profile API error:", error);
      throw new Error(error.error || "Failed to get user profile");
    }

    const userProfileData = await response.json();
    console.log("📊 Raw API Response from /api/auth/user-info:");
    console.log(JSON.stringify(userProfileData, null, 2));

    return userProfileData;
  }

  async getDeviceScanData(deviceId: string): Promise<DeviceScanData> {
    console.log(
      "🔍 Making API request to /api/auth/user-info for device scan data..."
    );
    console.log("📱 Device ID:", deviceId);

    const response = await fetch(
      `${this.baseUrl}/api/auth/user-info?deviceId=${encodeURIComponent(
        deviceId
      )}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("❌ Device scan data API error:", error);
      throw new Error(error.error || "Failed to get device scan data");
    }

    const deviceScanData = await response.json();
    console.log(
      "📊 Raw API Response from /api/auth/user-info (device scan data):"
    );
    console.log(JSON.stringify(deviceScanData, null, 2));

    return deviceScanData;
  }

  async forgotPassword(email: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to send password reset email");
    }

    // No return data needed for forgot password
    return;
  }

  async loginWithGoogle(
    idToken: string,
    deviceId: string
  ): Promise<SocialAuthResponse> {
    const response = await fetch(`${this.baseUrl}/api/auth/google`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idToken, deviceId }),
    });

    if (!response.ok) {
      let errorMessage = "Google authentication failed";
      try {
        const error = await response.json();
        errorMessage = error.error || errorMessage;
      } catch (parseError) {
        // If we can't parse JSON, it's likely an HTML error page
        if (response.status === 404) {
          errorMessage = "Google Sign-In is not yet implemented on the backend";
        } else {
          errorMessage = `Server error (${response.status}): Google Sign-In endpoint not available`;
        }
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  async loginWithApple(
    idToken: string,
    deviceId: string,
    userInfo?: {
      email?: string | null;
      fullName?: {
        givenName?: string | null;
        familyName?: string | null;
      } | null;
    }
  ): Promise<SocialAuthResponse> {
    const name =
      userInfo?.fullName?.givenName ||
      userInfo?.email?.split("@")[0] ||
      "AppleUser";

    const response = await fetch(`${this.baseUrl}/api/auth/apple`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        idToken,
        deviceId,
        name,
      }),
    });

    if (!response.ok) {
      let errorMessage = "Apple authentication failed";
      try {
        const error = await response.json();
        errorMessage = error.error || errorMessage;
      } catch (parseError) {
        if (response.status === 404) {
          errorMessage = "Apple Sign-In is not yet implemented on the backend";
        } else {
          errorMessage = `Server error (${response.status}): Apple Sign-In endpoint not available`;
        }
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  async updateUserName(name: string, token: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/user/profile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      let errorMessage = "Failed to update name";
      try {
        const error = await response.json();
        errorMessage = error.error || errorMessage;
      } catch (parseError) {
        errorMessage = `Server error (${response.status})`;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }
}

export const authService = new AuthService();
