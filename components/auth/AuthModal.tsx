import React, { useState, useEffect } from "react";
import {
  View,
  Modal,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  Dimensions,
  Alert,
} from "react-native";
import { BlurView } from "expo-blur";
import * as WebBrowser from "expo-web-browser";
import { useAuth } from "../../context/auth/AuthContext";
import { useQuiz } from "../../context/features/QuizContext";
import { authService } from "../../services/auth/authService";
import { socialAuthService } from "../../services/auth/socialAuthService";
import { Ionicons } from "@expo/vector-icons";

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
  initialMode?: "login" | "signup" | "method-selection";
  forced?: boolean; // If true, hides close button and prevents closing
}

type AuthMode =
  | "method-selection"
  | "login"
  | "signup"
  | "forgot-password"
  | "name-customization";

const { width: screenWidth } = Dimensions.get("window");

const AuthModal: React.FC<AuthModalProps> = ({
  visible,
  onClose,
  initialMode = "method-selection",
  forced = false,
}) => {
  const [authMode, setAuthMode] = useState<AuthMode>(initialMode);
  const {
    login,
    signup,
    loginWithGoogle,
    loginWithApple,
    isLoading,
    setUser,
    completeSocialAuth,
  } = useAuth();
  const { answers } = useQuiz();

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Social auth flow states
  const [pendingUser, setPendingUser] = useState<any>(null);
  const [socialAuthToken, setSocialAuthToken] = useState<string | null>(null);
  const [customizedName, setCustomizedName] = useState("");

  // Social auth availability
  const [isGoogleAvailable, setIsGoogleAvailable] = useState(false);
  const [isAppleAvailable, setIsAppleAvailable] = useState(false);

  // Error states
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  // Forgot password state
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);

  // Check social auth availability on mount
  useEffect(() => {
    const checkSocialAuthAvailability = async () => {
      const googleAvailable = socialAuthService.isGoogleSignInAvailable();
      const appleAvailable = await socialAuthService.isAppleSignInAvailable();

      console.log("🔍 Social auth availability check:");
      console.log("  Google available:", googleAvailable);
      console.log("  Apple available:", appleAvailable);
      console.log("  Platform:", Platform.OS);

      setIsGoogleAvailable(googleAvailable);
      setIsAppleAvailable(appleAvailable);
    };
    checkSocialAuthAvailability();
  }, []);

  const clearErrors = () => {
    setNameError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setForgotPasswordSuccess(false);
  };

  const clearForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    clearErrors();
  };

  const handlePrivacyPolicy = async () => {
    try {
      await WebBrowser.openBrowserAsync("https://trypoopai.com/privacy", {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FORM_SHEET,
        controlsColor: "#3b82f6",
        toolbarColor: "#ffffff",
      });
    } catch (error) {
      console.error("Error opening privacy policy:", error);
    }
  };

  const handleTermsOfUse = async () => {
    try {
      await WebBrowser.openBrowserAsync("https://trypoopai.com/terms", {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FORM_SHEET,
        controlsColor: "#3b82f6",
        toolbarColor: "#ffffff",
      });
    } catch (error) {
      console.error("Error opening terms of use:", error);
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const handleLogin = async () => {
    clearErrors();

    if (!email.trim()) {
      setEmailError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    if (!password.trim()) {
      setPasswordError("Password is required");
      return;
    }

    try {
      await login(email.trim().toLowerCase(), password);
      clearForm();
      onClose();
    } catch (error: any) {
      if (
        error.message?.includes("404") ||
        error.message?.includes("not found")
      ) {
        setEmailError("No account found with this email");
      } else if (
        error.message?.includes("401") ||
        error.message?.includes("invalid")
      ) {
        setPasswordError("Incorrect password");
      } else {
        setEmailError("Login failed. Please try again.");
      }
    }
  };

  const handleSignup = async () => {
    clearErrors();

    if (!name.trim()) {
      setNameError("Name is required");
      return;
    }

    if (name.trim().length < 2) {
      setNameError("Name must be at least 2 characters long");
      return;
    }

    if (!email.trim()) {
      setEmailError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    if (!password.trim()) {
      setPasswordError("Password is required");
      return;
    }

    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
      return;
    }

    if (!confirmPassword.trim()) {
      setConfirmPasswordError("Please confirm your password");
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      return;
    }

    try {
      await signup(email.trim().toLowerCase(), password, name.trim(), answers);
      clearForm();
      onClose();
    } catch (error: any) {
      // Check for specific device already exists error first
      if (error.message?.includes("A user already exists for this device")) {
        setEmailError("An account already exists for this device.");
      } else if (
        error.message?.includes("409") ||
        error.message?.includes("already exists")
      ) {
        setEmailError("An account with this email already exists");
      } else if (
        error.message?.includes("400") ||
        error.message?.includes("validation")
      ) {
        setEmailError("Invalid email or password format");
      } else {
        setEmailError("Account creation failed. Please try again.");
      }
    }
  };

  const handleForgotPassword = async () => {
    clearErrors();

    if (!email.trim()) {
      setEmailError("Please enter your email address");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    try {
      await authService.forgotPassword(email.trim().toLowerCase());
      setForgotPasswordSuccess(true);
      console.log("✅ Password reset email sent successfully to:", email);
    } catch (error: any) {
      console.error("❌ Forgot password error:", error);
      setEmailError(
        error.message ||
          "Failed to send password reset email. Please try again."
      );
    }
  };

  const handleGoogleAuth = async () => {
    if (!isGoogleAvailable) {
      Alert.alert(
        "Development Build Required",
        "Google Sign-In requires a development build. Please create a development build or use email authentication.",
        [{ text: "OK" }]
      );
      return;
    }

    try {
      // Use socialAuthService directly to get the response
      const result = await socialAuthService.signInWithGoogle();
      if (result.success && result.user && result.token) {
        // Check if this is a first-time user (we can determine this by checking if they have a default/generated name)
        const isFirstTime = await checkIfFirstTimeUser(result.user);

        if (isFirstTime) {
          // Store the user data and token, then show name customization
          setPendingUser(result.user);
          setSocialAuthToken(result.token);
          setCustomizedName(result.user.name || "");
          setAuthMode("name-customization");
        } else {
          // For existing users, complete auth directly using the proper context method
          const userData = {
            id: result.user.id || "temp-id",
            email: result.user.email || "unknown",
            profile: result.user,
          };

          await completeSocialAuth(result.token, userData);
          // Mark user as signed in (redundant but ensures consistency)
          await markUserAsSignedIn(result.user);
          clearForm();
          onClose();
        }
      } else {
        throw new Error(result.error || "Google Sign-In failed");
      }
    } catch (error: any) {
      console.error("❌ Google authentication error:", error);
      Alert.alert(
        "Google Sign-In Failed",
        error.message || "Unable to sign in with Google. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  const handleAppleAuth = async () => {
    console.log(
      "🍎 Apple auth handler called. isAppleAvailable:",
      isAppleAvailable
    );

    if (!isAppleAvailable) {
      console.log("⚠️ Apple availability check failed, but trying anyway...");
      // Don't return immediately - let's try anyway to see what the real error is
      Alert.alert(
        "Apple Sign-In Unavailable",
        "Apple Sign-In is only available on iOS devices with iOS 13 or later.",
        [{ text: "OK" }]
      );
      // Temporarily comment out the return to debug
      // return;
    }

    try {
      // Use socialAuthService directly to get the response
      const result = await socialAuthService.signInWithApple();
      if (result.success && result.user && result.token) {
        // Check if this is a first-time user
        const isFirstTime = await checkIfFirstTimeUser(result.user);

        if (isFirstTime) {
          // Store the user data and token, then show name customization
          setPendingUser(result.user);
          setSocialAuthToken(result.token);
          setCustomizedName(result.user.name || "");
          setAuthMode("name-customization");
        } else {
          // For existing users, complete auth directly using the proper context method
          const userData = {
            id: result.user.id || "temp-id",
            email: result.user.email || "unknown",
            profile: result.user,
          };

          await completeSocialAuth(result.token, userData);
          // Mark user as signed in (redundant but ensures consistency)
          await markUserAsSignedIn(result.user);
          clearForm();
          onClose();
        }
      } else {
        throw new Error(result.error || "Apple Sign-In failed");
      }
    } catch (error: any) {
      console.error("❌ Apple authentication error:", error);
      Alert.alert(
        "Apple Sign-In Failed",
        error.message || "Unable to sign in with Apple. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  // Helper function to determine if this is a first-time user on this device
  const checkIfFirstTimeUser = async (user: any): Promise<boolean> => {
    try {
      // Check if this user has signed in on this device before
      const AsyncStorage = await import(
        "@react-native-async-storage/async-storage"
      );
      const userKey = `hasSignedIn_${user.email || user.id}`;
      const hasSignedInBefore = await AsyncStorage.default.getItem(userKey);

      if (hasSignedInBefore) {
        console.log("🔍 User has signed in before on this device");
        return false; // Not first time
      }

      console.log("🆕 First time user on this device");
      // Don't mark them yet - wait until they complete the flow
      return true; // First time
    } catch (error) {
      console.error("Error checking first-time user status:", error);
      // If we can't check, assume it's not first time to avoid showing the modal unnecessarily
      return false;
    }
  };

  // Helper function to mark user as having signed in on this device
  const markUserAsSignedIn = async (user: any): Promise<void> => {
    try {
      const AsyncStorage = await import(
        "@react-native-async-storage/async-storage"
      );
      const userKey = `hasSignedIn_${user.email || user.id}`;
      await AsyncStorage.default.setItem(userKey, "true");
      console.log("✅ Marked user as signed in on this device");
    } catch (error) {
      console.error("Error marking user as signed in:", error);
    }
  };

  const handleNameCustomization = async () => {
    try {
      if (!customizedName.trim()) {
        Alert.alert("Name Required", "Please enter a name to continue.");
        return;
      }

      if (!socialAuthToken || !pendingUser) {
        throw new Error("Missing authentication data");
      }

      // Update the user's name on the backend
      await authService.updateUserName(customizedName.trim(), socialAuthToken);

      // Create the updated user object with the new name
      const userData = {
        id: pendingUser.id || "temp-id",
        email: pendingUser.email || "unknown",
        profile: {
          ...pendingUser.profile,
          name: customizedName.trim(),
        },
      }; // Complete the authentication using the context method (this will store the token properly)
      await completeSocialAuth(socialAuthToken, userData);

      // Mark user as having signed in on this device (so they won't see name customization again)
      await markUserAsSignedIn(pendingUser);

      clearForm();
      setPendingUser(null);
      setSocialAuthToken(null);
      setCustomizedName("");
      onClose();
    } catch (error: any) {
      console.error("❌ Name customization error:", error);
      Alert.alert(
        "Update Failed",
        error.message || "Failed to update your name. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  // Reset modal state when modal is closed or when visible prop changes
  useEffect(() => {
    if (!visible) {
      // Reset all modal state when closed
      setAuthMode(initialMode);
      setPendingUser(null);
      setSocialAuthToken(null);
      setCustomizedName("");
      clearForm();
    }
  }, [visible, initialMode]);

  const renderMethodSelection = () => (
    <View style={styles.methodContainer}>
      <Text style={styles.title}>
        {forced ? "Create Your Premium Account" : "Welcome to PoopAI"}
      </Text>
      <Text style={styles.subtitle}>
        {forced
          ? "You've successfully upgraded to Premium! Create an account to save your subscription and access all premium features."
          : "Choose how you'd like to continue"}
      </Text>

      {/* Email Sign In Button */}
      <TouchableOpacity
        style={[styles.methodButton, styles.emailButton]}
        onPress={() => setAuthMode("login")}
      >
        <BlurView intensity={30} tint="light" style={styles.methodButtonBlur}>
          <Ionicons
            name="mail-outline"
            size={24}
            color="rgba(255, 255, 255, 0.9)"
          />
          <Text style={styles.methodButtonText}>Continue with Email</Text>
        </BlurView>
      </TouchableOpacity>

      {/* Google Sign In Button */}
      <TouchableOpacity
        style={[styles.methodButton, styles.googleButton]}
        disabled={isLoading}
        onPress={handleGoogleAuth}
      >
        <BlurView intensity={30} tint="light" style={styles.methodButtonBlur}>
          <Ionicons
            name="logo-google"
            size={24}
            color={
              isLoading
                ? "rgba(255, 255, 255, 0.5)"
                : "rgba(255, 255, 255, 0.9)"
            }
          />
          <Text
            style={[
              styles.methodButtonText,
              {
                color: isLoading
                  ? "rgba(255, 255, 255, 0.5)"
                  : "rgba(255, 255, 255, 0.9)",
              },
            ]}
          >
            {isLoading ? "Signing In..." : "Continue with Google"}
          </Text>
        </BlurView>
      </TouchableOpacity>

      {/* Apple Sign In Button */}
      <TouchableOpacity
        style={[styles.methodButton, styles.appleButton]}
        disabled={isLoading}
        onPress={handleAppleAuth}
      >
        <BlurView intensity={30} tint="light" style={styles.methodButtonBlur}>
          <Ionicons
            name="logo-apple"
            size={24}
            color={
              isLoading
                ? "rgba(255, 255, 255, 0.5)"
                : "rgba(255, 255, 255, 0.9)"
            }
          />
          <Text
            style={[
              styles.methodButtonText,
              {
                color: isLoading
                  ? "rgba(255, 255, 255, 0.5)"
                  : "rgba(255, 255, 255, 0.9)",
              },
            ]}
          >
            {isLoading ? "Signing In..." : "Continue with Apple"}
          </Text>
        </BlurView>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setAuthMode("signup")}
        style={styles.switchButton}
      >
        <Text style={styles.switchText}>
          Don't have an account?{" "}
          <Text style={styles.switchLink}>Create one</Text>
        </Text>
      </TouchableOpacity>

      {/* Privacy Policy and Terms of Use Fine Print */}
      <View style={styles.finePrintContainer}>
        <Text style={styles.finePrintText}>
          View our{" "}
          <Text style={styles.finePrintLink} onPress={handlePrivacyPolicy}>
            Privacy Policy
          </Text>{" "}
          and{" "}
          <Text style={styles.finePrintLink} onPress={handleTermsOfUse}>
            Terms of Use
          </Text>
        </Text>
      </View>
    </View>
  );

  const renderLoginForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.title}>Welcome Back!</Text>
      <Text style={styles.subtitle}>Sign in to continue your journey</Text>

      {/* Email Input */}
      <View style={styles.inputContainer}>
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
        <View style={styles.inputWrapper}>
          <BlurView intensity={20} tint="light" style={styles.inputBlur}>
            <TextInput
              style={styles.textInput}
              placeholder="Email"
              placeholderTextColor="rgba(255, 255, 255, 0.6)"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) setEmailError("");
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </BlurView>
        </View>
      </View>

      {/* Password Input */}
      <View style={styles.inputContainer}>
        {passwordError ? (
          <Text style={styles.errorText}>{passwordError}</Text>
        ) : null}
        <View style={styles.inputWrapper}>
          <BlurView intensity={20} tint="light" style={styles.inputBlur}>
            <TextInput
              style={styles.textInput}
              placeholder="Password"
              placeholderTextColor="rgba(255, 255, 255, 0.6)"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (passwordError) setPasswordError("");
              }}
              secureTextEntry
            />
          </BlurView>
        </View>
      </View>

      {/* Forgot Password */}
      <TouchableOpacity
        onPress={() => setAuthMode("forgot-password")}
        style={styles.forgotButton}
      >
        <Text style={styles.forgotText}>Forgot Password?</Text>
      </TouchableOpacity>

      {/* Sign In Button */}
      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleLogin}
        disabled={isLoading}
      >
        <BlurView intensity={35} tint="light" style={styles.submitButtonBlur}>
          {isLoading ? (
            <ActivityIndicator color="rgba(255, 255, 255, 0.9)" />
          ) : (
            <Text style={styles.submitButtonText}>Sign In</Text>
          )}
        </BlurView>
      </TouchableOpacity>

      {/* Switch to Sign Up */}
      <TouchableOpacity
        onPress={() => {
          clearForm();
          setAuthMode("signup");
        }}
        style={styles.switchButton}
      >
        <Text style={styles.switchText}>
          Don't have an account?{" "}
          <Text style={styles.switchLink}>Create one</Text>
        </Text>
      </TouchableOpacity>

      {/* Privacy Policy and Terms of Use Fine Print */}
      <View style={styles.finePrintContainer}>
        <Text style={styles.finePrintText}>
          View our{" "}
          <Text style={styles.finePrintLink} onPress={handlePrivacyPolicy}>
            Privacy Policy
          </Text>{" "}
          and{" "}
          <Text style={styles.finePrintLink} onPress={handleTermsOfUse}>
            Terms of Use
          </Text>
        </Text>
      </View>
    </View>
  );

  const renderSignupForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Join us to start your health journey</Text>

      {/* Name Input */}
      <View style={styles.inputContainer}>
        {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
        <View style={styles.inputWrapper}>
          <BlurView intensity={20} tint="light" style={styles.inputBlur}>
            <TextInput
              style={styles.textInput}
              placeholder="Name"
              placeholderTextColor="rgba(255, 255, 255, 0.6)"
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (nameError) setNameError("");
              }}
              autoCapitalize="words"
            />
          </BlurView>
        </View>
      </View>

      {/* Email Input */}
      <View style={styles.inputContainer}>
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
        <View style={styles.inputWrapper}>
          <BlurView intensity={20} tint="light" style={styles.inputBlur}>
            <TextInput
              style={styles.textInput}
              placeholder="Email"
              placeholderTextColor="rgba(255, 255, 255, 0.6)"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) setEmailError("");
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </BlurView>
        </View>
      </View>

      {/* Password Input */}
      <View style={styles.inputContainer}>
        {passwordError ? (
          <Text style={styles.errorText}>{passwordError}</Text>
        ) : null}
        <View style={styles.inputWrapper}>
          <BlurView intensity={20} tint="light" style={styles.inputBlur}>
            <TextInput
              style={styles.textInput}
              placeholder="Password"
              placeholderTextColor="rgba(255, 255, 255, 0.6)"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (passwordError) setPasswordError("");
              }}
              secureTextEntry
            />
          </BlurView>
        </View>
      </View>

      {/* Confirm Password Input */}
      <View style={styles.inputContainer}>
        {confirmPasswordError ? (
          <Text style={styles.errorText}>{confirmPasswordError}</Text>
        ) : null}
        <View style={styles.inputWrapper}>
          <BlurView intensity={20} tint="light" style={styles.inputBlur}>
            <TextInput
              style={styles.textInput}
              placeholder="Confirm Password"
              placeholderTextColor="rgba(255, 255, 255, 0.6)"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (confirmPasswordError) setConfirmPasswordError("");
              }}
              secureTextEntry
            />
          </BlurView>
        </View>
      </View>

      {/* Create Account Button */}
      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSignup}
        disabled={isLoading}
      >
        <BlurView intensity={35} tint="light" style={styles.submitButtonBlur}>
          {isLoading ? (
            <ActivityIndicator color="rgba(255, 255, 255, 0.9)" />
          ) : (
            <Text style={styles.submitButtonText}>Create Account</Text>
          )}
        </BlurView>
      </TouchableOpacity>

      {/* Switch to Sign In */}
      <TouchableOpacity
        onPress={() => {
          clearForm();
          setAuthMode("login");
        }}
        style={styles.switchButton}
      >
        <Text style={styles.switchText}>
          Already have an account?{" "}
          <Text style={styles.switchLink}>Sign in</Text>
        </Text>
      </TouchableOpacity>

      {/* Privacy Policy and Terms of Use Fine Print */}
      <View style={styles.finePrintContainer}>
        <Text style={styles.finePrintText}>
          View our{" "}
          <Text style={styles.finePrintLink} onPress={handlePrivacyPolicy}>
            Privacy Policy
          </Text>{" "}
          and{" "}
          <Text style={styles.finePrintLink} onPress={handleTermsOfUse}>
            Terms of Use
          </Text>
        </Text>
      </View>
    </View>
  );

  const renderForgotPassword = () => (
    <View style={styles.formContainer}>
      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.subtitle}>
        {forgotPasswordSuccess
          ? "Check your email for reset instructions"
          : "Enter your email to receive reset instructions"}
      </Text>

      {forgotPasswordSuccess ? (
        // Success state
        <View style={styles.successContainer}>
          <View style={styles.successIconContainer}>
            <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
          </View>
          <Text style={styles.successMessage}>
            We've sent password reset instructions to:
          </Text>
          <Text style={styles.successEmail}>{email}</Text>
          <Text style={styles.successSubtext}>
            Please check your inbox and follow the link to reset your password.
          </Text>
        </View>
      ) : (
        // Email input form
        <>
          {/* Email Input */}
          <View style={styles.inputContainer}>
            {emailError ? (
              <Text style={styles.errorText}>{emailError}</Text>
            ) : null}
            <View style={styles.inputWrapper}>
              <BlurView intensity={20} tint="light" style={styles.inputBlur}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Email"
                  placeholderTextColor="rgba(255, 255, 255, 0.6)"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (emailError) setEmailError("");
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </BlurView>
            </View>
          </View>

          {/* Send Reset Button */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleForgotPassword}
            disabled={isLoading}
          >
            <BlurView
              intensity={35}
              tint="light"
              style={styles.submitButtonBlur}
            >
              {isLoading ? (
                <ActivityIndicator color="rgba(255, 255, 255, 0.9)" />
              ) : (
                <Text style={styles.submitButtonText}>Send Reset Link</Text>
              )}
            </BlurView>
          </TouchableOpacity>
        </>
      )}

      {/* Back to Sign In */}
      <TouchableOpacity
        onPress={() => {
          clearForm();
          setAuthMode("login");
        }}
        style={styles.switchButton}
      >
        <Text style={styles.switchText}>
          <Text style={styles.switchLink}>← Back to Sign In</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Name customization view for first-time social auth users
  const renderNameCustomization = () => (
    <View style={styles.nameCustomizationContainer}>
      <Text style={styles.nameCustomizationTitle}>
        Welcome! Choose your display name
      </Text>
      <View style={styles.nameInputRow}>
        <TextInput
          style={styles.nameInput}
          value={customizedName}
          onChangeText={setCustomizedName}
          placeholder="Enter your name"
          autoFocus
          autoCapitalize="words"
          returnKeyType="done"
        />
        {customizedName.length > 0 && (
          <TouchableOpacity
            onPress={() => setCustomizedName("")}
            style={styles.clearNameButton}
          >
            <Ionicons name="close-circle" size={22} color="#888" />
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity
        style={styles.confirmNameButton}
        onPress={handleNameCustomization}
        disabled={isLoading}
      >
        <Text style={styles.confirmNameButtonText}>Confirm</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCurrentView = () => {
    switch (authMode) {
      case "method-selection":
        return renderMethodSelection();
      case "login":
        return renderLoginForm();
      case "signup":
        return renderSignupForm();
      case "forgot-password":
        return renderForgotPassword();
      case "name-customization":
        return renderNameCustomization();
      default:
        return renderMethodSelection();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={forced ? undefined : onClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
        >
          <SafeAreaView style={styles.container}>
            <View style={styles.modalContainer}>
              {/* Close button - only show if not forced */}
              {!forced && (
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onClose}
                  disabled={isLoading}
                >
                  <BlurView intensity={30} style={styles.closeButtonBlur}>
                    <Ionicons
                      name="close"
                      size={24}
                      color="rgba(255, 255, 255, 0.9)"
                    />
                  </BlurView>
                </TouchableOpacity>
              )}

              {/* Back button for non-method-selection screens */}
              {authMode !== "method-selection" && (
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => {
                    if (authMode === "forgot-password") {
                      setAuthMode("login");
                    } else {
                      setAuthMode("method-selection");
                    }
                    clearForm();
                  }}
                  disabled={isLoading}
                >
                  <BlurView intensity={30} style={styles.closeButtonBlur}>
                    <Ionicons
                      name="arrow-back"
                      size={24}
                      color="rgba(255, 255, 255, 0.9)"
                    />
                  </BlurView>
                </TouchableOpacity>
              )}

              {/* Content Container */}
              <View style={styles.contentContainer}>
                <BlurView
                  intensity={80}
                  tint="light"
                  style={styles.contentBlur}
                >
                  {renderCurrentView()}
                </BlurView>
              </View>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 400,
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 20,
    borderRadius: 20,
    overflow: "hidden",
  },
  backButton: {
    position: "absolute",
    top: 12,
    left: 12,
    zIndex: 20,
    borderRadius: 20,
    overflow: "hidden",
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonBlur: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    borderRadius: 28,
    width: "90%",
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 15,
  },
  contentBlur: {
    padding: 32,
    paddingTop: 64, // Ensures content (title) is pushed below the close button
    // Increase blur intensity for a stronger effect
    // The intensity prop is set in the component, not here, so update the BlurView usage:
  },

  // Method Selection Styles
  methodContainer: {
    alignItems: "center",
  },
  methodButton: {
    width: "100%",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  emailButton: {
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  googleButton: {
    backgroundColor: "rgba(234, 67, 53, 0.1)",
  },
  appleButton: {
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  methodButtonBlur: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 12,
  },
  methodButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.9)",
  },

  // Form Styles
  formContainer: {
    width: "100%",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "rgba(255, 255, 255, 0.95)",
    textAlign: "center",
    marginBottom: 8,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },

  // Input Styles
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  inputBlur: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  textInput: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Button Styles
  submitButton: {
    borderRadius: 16,
    marginTop: 8,
    marginBottom: 24,
    overflow: "hidden",
    backgroundColor: "rgba(59, 130, 246, 0.3)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.4)",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  submitButtonBlur: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: "800",
    color: "rgba(255, 255, 255, 0.95)",
    textShadowColor: "rgba(59, 130, 246, 0.8)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  forgotButton: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "600",
  },

  switchButton: {
    alignItems: "center",
    paddingVertical: 12,
  },
  switchText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
  },
  switchLink: {
    color: "rgba(255, 255, 255, 0.95)",
    fontWeight: "700",
    textShadowColor: "rgba(59, 130, 246, 0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Success State Styles
  successContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  successIconContainer: {
    marginBottom: 16,
  },
  successMessage: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    marginBottom: 8,
    fontWeight: "600",
  },
  successEmail: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.95)",
    textAlign: "center",
    fontWeight: "700",
    marginBottom: 12,
  },
  successSubtext: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    lineHeight: 20,
  },

  // Name Customization Styles
  nameCustomizationContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    width: "100%",
  },
  nameCustomizationTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#222",
    marginBottom: 18,
    textAlign: "center",
  },
  nameInputRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 18,
  },
  nameInput: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    color: "#222",
  },
  clearNameButton: {
    marginLeft: 6,
    padding: 2,
  },
  confirmNameButton: {
    backgroundColor: "#4B8DF8",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignItems: "center",
    marginTop: 8,
    width: "100%",
  },
  confirmNameButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
    letterSpacing: 0.5,
  },
  finePrintContainer: {
    marginTop: 12,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  finePrintText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    lineHeight: 16,
  },
  finePrintLink: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    textDecorationLine: "underline",
    fontWeight: "500",
  },
});

export default AuthModal;
