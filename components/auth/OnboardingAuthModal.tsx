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
import { useAuth } from "../../context/auth/AuthContext";
import { useQuiz } from "../../context/features/QuizContext";
import { authService } from "../../services/auth/authService";
import { socialAuthService } from "../../services/auth/socialAuthService";
import { Ionicons } from "@expo/vector-icons";

interface OnboardingAuthModalProps {
  visible: boolean;
  onClose: () => void;
  onSkip?: () => void; // Optional skip for later functionality
  initialMode?: "create-account-selection" | "login" | "signup";
}

type OnboardingAuthMode =
  | "create-account-selection"
  | "login"
  | "signup"
  | "forgot-password";

const { width: screenWidth } = Dimensions.get("window");

const OnboardingAuthModal: React.FC<OnboardingAuthModalProps> = ({
  visible,
  onClose,
  onSkip,
  initialMode = "create-account-selection",
}) => {
  const [authMode, setAuthMode] = useState<OnboardingAuthMode>(initialMode);
  const { login, signup, loginWithGoogle, loginWithApple, isLoading } =
    useAuth();
  const { answers } = useQuiz();

  // Social auth availability
  const [isGoogleAvailable, setIsGoogleAvailable] = useState(false);
  const [isAppleAvailable, setIsAppleAvailable] = useState(false);

  // Local loading states for social auth (separate from global auth loading)
  const [googleAuthLoading, setGoogleAuthLoading] = useState(false);
  const [appleAuthLoading, setAppleAuthLoading] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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

      console.log("🔍 Social auth availability check (OnboardingAuthModal):");
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
    console.log("🔍 Google auth debug - availability:", isGoogleAvailable);

    if (!isGoogleAvailable) {
      Alert.alert(
        "Development Build Required",
        "Google Sign-In requires a development build. Please create a development build or use email authentication.",
        [{ text: "OK" }]
      );
      return;
    }

    try {
      console.log("🔵 Starting Google authentication...");
      setGoogleAuthLoading(true); // Use local loading state
      await loginWithGoogle();
      console.log("✅ Google authentication successful");
      clearForm();
      onClose();
    } catch (error: any) {
      console.error("❌ Google authentication error:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        stack: error.stack,
      });
      Alert.alert(
        "Google Sign-In Failed",
        `Error: ${error.message || "Unable to sign in with Google. Please try again."}`,
        [{ text: "OK" }]
      );
    } finally {
      setGoogleAuthLoading(false); // Reset local loading state
    }
  };

  const handleAppleAuth = async () => {
    console.log("🍎 Apple auth debug - availability:", isAppleAvailable);
    console.log("🍎 Platform:", Platform.OS);

    if (!isAppleAvailable) {
      Alert.alert(
        "Apple Sign-In Unavailable",
        "Apple Sign-In is only available on iOS devices with iOS 13 or later.",
        [{ text: "OK" }]
      );
      return;
    }

    try {
      console.log("🍎 Starting Apple authentication...");
      setAppleAuthLoading(true); // Use local loading state
      await loginWithApple();
      console.log("✅ Apple authentication successful");
      clearForm();
      onClose();
    } catch (error: any) {
      console.error("❌ Apple authentication error:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        stack: error.stack,
      });
      Alert.alert(
        "Apple Sign-In Failed",
        `Error: ${error.message || "Unable to sign in with Apple. Please try again."}`,
        [{ text: "OK" }]
      );
    } finally {
      setAppleAuthLoading(false); // Reset local loading state
    }
  };

  const renderCreateAccountSelection = () => (
    <View style={styles.methodContainer}>
      <Text style={styles.title}>Save your preferences?</Text>
      <Text style={styles.subtitle}>
        Create an account to save your answers and keep track of your scans.
      </Text>

      {/* Email Create Account Button */}
      <TouchableOpacity
        style={[styles.methodButton, styles.emailButton]}
        onPress={() => setAuthMode("signup")}
      >
        <BlurView intensity={30} tint="light" style={styles.methodButtonBlur}>
          <Ionicons
            name="mail-outline"
            size={24}
            color="rgba(255, 255, 255, 0.9)"
          />
          <Text style={styles.methodButtonText}>Create Account with Email</Text>
        </BlurView>
      </TouchableOpacity>

      {/* Google Create Account Button */}
      <TouchableOpacity
        style={[styles.methodButton, styles.googleButton]}
        onPress={handleGoogleAuth}
        disabled={googleAuthLoading || !isGoogleAvailable}
      >
        <BlurView intensity={30} tint="light" style={styles.methodButtonBlur}>
          <Ionicons
            name="logo-google"
            size={24}
            color={
              googleAuthLoading || !isGoogleAvailable
                ? "rgba(255, 255, 255, 0.5)"
                : "rgba(255, 255, 255, 0.9)"
            }
          />
          <Text
            style={[
              styles.methodButtonText,
              {
                color:
                  googleAuthLoading || !isGoogleAvailable
                    ? "rgba(255, 255, 255, 0.5)"
                    : "rgba(255, 255, 255, 0.9)",
              },
            ]}
          >
            {!isGoogleAvailable
              ? "Google (Requires Dev Build)"
              : googleAuthLoading
                ? "Signing In..."
                : "Create with Google"}
          </Text>
        </BlurView>
      </TouchableOpacity>

      {/* Apple Create Account Button */}
      <TouchableOpacity
        style={[styles.methodButton, styles.appleButton]}
        onPress={handleAppleAuth}
        disabled={appleAuthLoading || !isAppleAvailable}
      >
        <BlurView intensity={30} tint="light" style={styles.methodButtonBlur}>
          <Ionicons
            name="logo-apple"
            size={24}
            color={
              appleAuthLoading || !isAppleAvailable
                ? "rgba(255, 255, 255, 0.5)"
                : "rgba(255, 255, 255, 0.9)"
            }
          />
          <Text
            style={[
              styles.methodButtonText,
              {
                color:
                  appleAuthLoading || !isAppleAvailable
                    ? "rgba(255, 255, 255, 0.5)"
                    : "rgba(255, 255, 255, 0.9)",
              },
            ]}
          >
            {!isAppleAvailable
              ? "Apple (iOS Only)"
              : appleAuthLoading
                ? "Signing In..."
                : "Create with Apple"}
          </Text>
        </BlurView>
      </TouchableOpacity>

      {/* Already have account link */}
      <TouchableOpacity
        onPress={() => setAuthMode("login")}
        style={styles.switchButton}
      >
        <Text style={styles.switchText}>
          Already have an account?{" "}
          <Text style={styles.switchLink}>Sign in</Text>
        </Text>
      </TouchableOpacity>

      {/* Skip option */}
      {onSkip && (
        <TouchableOpacity onPress={onSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderLoginForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.title}>Welcome back!</Text>
      <Text style={styles.subtitle}>
        Sign in to save your preferences and continue your journey
      </Text>

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
            <Text style={styles.submitButtonText}>Sign In & Save</Text>
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
          Need to create an account?{" "}
          <Text style={styles.switchLink}>Sign up</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderSignupForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.title}>Create Your Account</Text>
      <Text style={styles.subtitle}>
        Save your preferences and start tracking your health journey
      </Text>

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
            <Text style={styles.submitButtonText}>Create Account & Save</Text>
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

  const renderCurrentView = () => {
    switch (authMode) {
      case "create-account-selection":
        return renderCreateAccountSelection();
      case "login":
        return renderLoginForm();
      case "signup":
        return renderSignupForm();
      case "forgot-password":
        return renderForgotPassword();
      default:
        return renderCreateAccountSelection();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {
        console.log(
          "🚫 Modal onRequestClose called - close button should now work properly"
        );
        onClose();
      }}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
        >
          <SafeAreaView style={styles.container}>
            <View style={styles.modalContainer}>
              {/* Close button */}
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

              {/* Back button for non-create-account-selection screens */}
              {authMode !== "create-account-selection" && (
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => {
                    if (authMode === "forgot-password") {
                      setAuthMode("login");
                    } else {
                      setAuthMode("create-account-selection");
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
                  intensity={40}
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
    right: 32,
    zIndex: 20,
    borderRadius: 20,
    overflow: "hidden",
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: 12,
    left: 32,
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
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 15,
    marginHorizontal: 24,
  },
  contentBlur: {
    padding: 32,
    paddingTop: 64,
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
    backgroundColor: "rgba(34, 197, 94, 0.2)", // Green tint for account creation focus
    shadowColor: "#22c55e",
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
    backgroundColor: "rgba(34, 197, 94, 0.3)", // Green theme for account creation
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.4)",
    shadowColor: "#22c55e",
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
    textShadowColor: "rgba(34, 197, 94, 0.8)",
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
    textShadowColor: "rgba(34, 197, 94, 0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Skip button for onboarding context
  skipButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  skipText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.6)",
    fontWeight: "500",
    textAlign: "center",
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
});

export default OnboardingAuthModal;
