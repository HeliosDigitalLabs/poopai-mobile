import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authService, SignupData } from "../../services/auth/authService";
import { socialAuthService } from "../../services/auth/socialAuthService";
import { QuizAnswers } from "../features/QuizContext";

interface User {
  id: string;
  email: string;
  profile: {
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
  };
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    email: string,
    password: string,
    name: string,
    quizAnswers?: QuizAnswers
  ) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithApple: () => Promise<void>;
  completeSocialAuth: (token: string, userData: any) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  showAuthOverlay: boolean;
  setShowAuthOverlay: (show: boolean) => void;
  setUser: (user: User | null) => void;
  refreshUserData: () => Promise<void>; // Add refresh function
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  signup: async () => {},
  loginWithGoogle: async () => {},
  loginWithApple: async () => {},
  completeSocialAuth: async () => {},
  logout: async () => {},
  checkAuthStatus: async () => {},
  showAuthOverlay: false,
  setShowAuthOverlay: () => {},
  setUser: () => {},
  refreshUserData: async () => {}, // Initialize with no-op function
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthOverlay, setShowAuthOverlay] = useState(false);

  const isAuthenticated = !!token && !!user;

  // Check for existing auth on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const storedToken = await AsyncStorage.getItem("authToken");

      if (storedToken) {
        // Verify token is still valid
        const isValid = await authService.verifyToken(storedToken);
        if (isValid) {
          // Get fresh user data from server
          try {
            const userProfile = await authService.getUserProfile(storedToken);
            console.log("🏠 Frontend processed user profile data:");
            console.log("   - freeScansLeft:", userProfile.freeScansLeft);
            console.log("   - paidScanCount:", userProfile.paidScanCount);
            console.log("   - premium:", userProfile.premium);
            console.log("   - poopScoreAvg:", userProfile.poopScoreAvg);

            const userData: User = {
              id: "temp-id", // Backend only returns profile data
              email: "unknown", // We don't store email separately, could enhance later
              profile: userProfile,
            };

            // Update stored user data with fresh profile
            await AsyncStorage.setItem("userData", JSON.stringify(userData));

            setToken(storedToken);
            setUser(userData);
          } catch (profileError) {
            console.error("Error fetching user profile:", profileError);
            // If profile fetch fails, fall back to stored data but still authenticate
            const storedUser = await AsyncStorage.getItem("userData");
            if (storedUser) {
              setToken(storedToken);
              setUser(JSON.parse(storedUser));
            } else {
              // No stored user data and can't fetch - logout
              await AsyncStorage.multiRemove(["authToken", "userData"]);
            }
          }
        } else {
          // Token expired, clear storage
          await AsyncStorage.multiRemove(["authToken", "userData"]);
        }
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      // Clear potentially corrupted data
      await AsyncStorage.multiRemove(["authToken", "userData"]);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);
      const { token: newToken } = response;

      // Get user profile with full data
      const userProfile = await authService.getUserProfile(newToken);
      console.log("🔑 Login - Frontend processed user profile data:");
      console.log("   - freeScansLeft:", userProfile.freeScansLeft);
      console.log("   - paidScanCount:", userProfile.paidScanCount);
      console.log("   - premium:", userProfile.premium);
      console.log("   - poopScoreAvg:", userProfile.poopScoreAvg);

      const userData: User = {
        id: "temp-id", // Backend only returns profile, not full user
        email,
        profile: userProfile,
      };

      // Store auth data
      await AsyncStorage.setItem("authToken", newToken);
      await AsyncStorage.setItem("userData", JSON.stringify(userData));

      setToken(newToken);
      setUser(userData);
      setShowAuthOverlay(false);
    } catch (error: any) {
      console.error("Login error:", error);
      // Re-throw with contextual message for forms to handle
      if (
        error.message?.includes("401") ||
        error.message?.includes("Unauthorized")
      ) {
        throw new Error("Invalid password");
      } else if (
        error.message?.includes("404") ||
        error.message?.includes("User not found")
      ) {
        throw new Error("No user found");
      } else if (
        error.message?.includes("network") ||
        error.message?.includes("Network")
      ) {
        throw new Error("Network error");
      } else {
        throw new Error("Login failed");
      }
    }
  };

  // Helper function to transform quiz answers to backend format
  const transformQuizAnswersForSignup = (quizAnswers: QuizAnswers) => {
    // Map healthGoals to poopGoals (as the user specified)
    const poopGoals = quizAnswers.healthGoals || [];

    // Combine digestiveConditions and customCondition for conditions
    const conditions = [...(quizAnswers.digestiveConditions || [])];
    if (quizAnswers.customCondition) {
      conditions.push(quizAnswers.customCondition);
    }

    // Use recentSymptoms directly
    const recentSymptoms = quizAnswers.recentSymptoms || [];

    // Map analysisPreference to temperament (funny, serious, or both)
    let temperament: string | undefined;
    if (quizAnswers.analysisPreference === "Funny") {
      temperament = "funny";
    } else if (quizAnswers.analysisPreference === "Serious") {
      temperament = "serious";
    } else if (quizAnswers.analysisPreference === "Both") {
      temperament = "both";
    }

    return {
      poopGoals,
      conditions,
      recentSymptoms,
      temperament,
    };
  };

  const signup = async (
    email: string,
    password: string,
    name: string,
    quizAnswers?: QuizAnswers
  ) => {
    try {
      // Prepare signup data with quiz answers if provided
      const signupData: SignupData = {
        email,
        password,
        name,
        ...(quizAnswers ? transformQuizAnswersForSignup(quizAnswers) : {}),
      };

      const response = await authService.signup(signupData);
      const { token: newToken } = response;

      // Get full user profile after signup
      try {
        const userProfile = await authService.getUserProfile(newToken);
        const userData: User = {
          id: "temp-id", // Backend only returns token on signup
          email,
          profile: userProfile,
        };

        // Store auth data
        await AsyncStorage.setItem("authToken", newToken);
        await AsyncStorage.setItem("userData", JSON.stringify(userData));

        setToken(newToken);
        setUser(userData);
        setShowAuthOverlay(false);
      } catch (profileError) {
        console.error("Error fetching profile after signup:", profileError);
        // Fall back to basic user data if profile fetch fails
        const userData: User = {
          id: "temp-id",
          email,
          profile: {
            name,
            ...(quizAnswers ? transformQuizAnswersForSignup(quizAnswers) : {}),
          },
        };

        await AsyncStorage.setItem("authToken", newToken);
        await AsyncStorage.setItem("userData", JSON.stringify(userData));

        setToken(newToken);
        setUser(userData);
        setShowAuthOverlay(false);
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      // Re-throw with contextual message for forms to handle
      // Check for specific device restriction error first
      if (error.message?.includes("A user already exists for this device")) {
        throw new Error("A user already exists for this device");
      } else if (
        error.message?.includes("409") ||
        error.message?.includes("already exists")
      ) {
        throw new Error("Email already registered");
      } else if (
        error.message?.includes("400") ||
        error.message?.includes("validation")
      ) {
        throw new Error("Invalid information");
      } else if (
        error.message?.includes("network") ||
        error.message?.includes("Network")
      ) {
        throw new Error("Network error");
      } else {
        throw new Error("Signup failed");
      }
    }
  };

  const loginWithGoogle = async () => {
    try {
      // Don't set global isLoading for social auth - it interferes with modal behavior
      console.log("🔵 Starting Google authentication...");

      const result = await socialAuthService.signInWithGoogle();

      if (!result.success) {
        throw new Error(result.error || "Google authentication failed");
      }

      console.log("🔵 Google authentication successful!");

      // Get user profile after successful authentication
      try {
        const userProfile = await authService.getUserProfile(result.token!);

        const userData: User = {
          id: "temp-id",
          email: result.user?.email || "unknown",
          profile: userProfile,
        };

        // Store auth data
        await AsyncStorage.setItem("authToken", result.token!);
        await AsyncStorage.setItem("userData", JSON.stringify(userData));

        setToken(result.token!);
        setUser(userData);
        setShowAuthOverlay(false);
      } catch (profileError) {
        console.error(
          "Error fetching profile after Google auth:",
          profileError
        );
        // Fall back to basic user data if profile fetch fails
        const userData: User = {
          id: "temp-id",
          email: result.user?.email || "unknown",
          profile: {
            name: result.user?.name || "Unknown",
          },
        };

        await AsyncStorage.setItem("authToken", result.token!);
        await AsyncStorage.setItem("userData", JSON.stringify(userData));

        setToken(result.token!);
        setUser(userData);
        setShowAuthOverlay(false);
      }
    } catch (error: any) {
      console.error("Google authentication error:", error);
      throw new Error(error.message || "Google authentication failed");
    }
  };

  const loginWithApple = async () => {
    try {
      // Don't set global isLoading for social auth - it interferes with modal behavior
      console.log("🍎 Starting Apple authentication...");

      const result = await socialAuthService.signInWithApple();

      if (!result.success) {
        throw new Error(result.error || "Apple authentication failed");
      }

      console.log("🍎 Apple authentication successful!");

      // Get user profile after successful authentication
      try {
        const userProfile = await authService.getUserProfile(result.token!);

        const userData: User = {
          id: "temp-id",
          email: result.user?.email || "unknown",
          profile: userProfile,
        };

        // Store auth data
        await AsyncStorage.setItem("authToken", result.token!);
        await AsyncStorage.setItem("userData", JSON.stringify(userData));

        setToken(result.token!);
        setUser(userData);
        setShowAuthOverlay(false);
      } catch (profileError) {
        console.error("Error fetching profile after Apple auth:", profileError);
        // Fall back to basic user data if profile fetch fails
        const userData: User = {
          id: "temp-id",
          email: result.user?.email || "unknown",
          profile: {
            name: result.user?.name || "Unknown",
          },
        };

        await AsyncStorage.setItem("authToken", result.token!);
        await AsyncStorage.setItem("userData", JSON.stringify(userData));

        setToken(result.token!);
        setUser(userData);
        setShowAuthOverlay(false);
      }
    } catch (error: any) {
      console.error("Apple authentication error:", error);
      throw new Error(error.message || "Apple authentication failed");
    }
  };

  const completeSocialAuth = async (token: string, userData: any) => {
    try {
      // Store auth data
      await AsyncStorage.setItem("authToken", token);
      await AsyncStorage.setItem("userData", JSON.stringify(userData));

      setToken(token);
      setUser(userData);
      setShowAuthOverlay(false);
    } catch (error) {
      console.error("Error completing social auth:", error);
      throw error;
    }
  };

  const logout = async () => {
    // Clear local state (no backend logout endpoint needed)
    setUser(null);
    setToken(null);
    setShowAuthOverlay(false); // Hide any auth modals

    // DON'T clear first-time user tracking - once they've been through name customization,
    // they shouldn't see it again even after logout/login

    // For manual logout, also clear authentication history to prevent ReSignInModal
    await AsyncStorage.multiRemove([
      "authToken",
      "userData",
      "hasBeenAuthenticated", // Clear auth history for manual logout
    ]);
  };

  // Function to refresh user data from server (for updating poop score averages after scans)
  const refreshUserData = React.useCallback(async () => {
    if (!token) {
      console.log("No token available, cannot refresh user data");
      return;
    }

    try {
      console.log("Refreshing user data from server...");
      const userProfile = await authService.getUserProfile(token);
      console.log("🔄 Refresh - Frontend processed user profile data:");
      console.log("   - freeScansLeft:", userProfile.freeScansLeft);
      console.log("   - paidScanCount:", userProfile.paidScanCount);
      console.log("   - premium:", userProfile.premium);
      console.log("   - poopScoreAvg:", userProfile.poopScoreAvg);

      const userData: User = {
        id: user?.id || "temp-id",
        email: user?.email || "unknown",
        profile: userProfile,
      };

      // Update stored user data with fresh profile
      await AsyncStorage.setItem("userData", JSON.stringify(userData));
      setUser(userData);
      console.log(
        "User data refreshed successfully, new poop score avg:",
        userProfile.poopScoreAvg
      );
    } catch (error) {
      console.error("Error refreshing user data:", error);
      // Don't throw error - just log it, keep existing user data
    }
  }, [token]); // Only depend on token, not user properties that change when we call setUser

  const value: AuthContextValue = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    signup,
    loginWithGoogle,
    loginWithApple,
    completeSocialAuth,
    logout,
    checkAuthStatus,
    showAuthOverlay,
    setShowAuthOverlay,
    setUser,
    refreshUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
