import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../../context/auth/AuthContext";

interface LoginFormProps {
  onSuccess: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const { login } = useAuth();

  const clearErrors = () => {
    setEmailError("");
    setPasswordError("");
  };

  const handleSubmit = async () => {
    clearErrors();

    // Validation
    if (!email.trim()) {
      setEmailError("Email is required");
      return;
    }

    if (!password.trim()) {
      setPasswordError("Password is required");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      onSuccess();
    } catch (error: any) {
      // Handle specific auth errors with contextual messages
      if (
        error.message?.includes("401") ||
        error.message?.includes("Unauthorized") ||
        error.message?.includes("Invalid password")
      ) {
        setPasswordError("Invalid password");
      } else if (
        error.message?.includes("404") ||
        error.message?.includes("User not found") ||
        error.message?.includes("No user found")
      ) {
        setEmailError("No user found with that email");
      } else if (
        error.message?.includes("network") ||
        error.message?.includes("Network")
      ) {
        setEmailError("Network error - please check your connection");
      } else {
        setEmailError("Login failed - please try again");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setEmailError(
      "Password reset will be available soon - contact support for help"
    );
  };

  return (
    <View style={styles.container}>
      {/* Email Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
        <TextInput
          style={[styles.input, emailError && styles.inputError]}
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (emailError) setEmailError(""); // Clear error on typing
          }}
          placeholder="Enter your email"
          placeholderTextColor="#9ca3af"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isLoading}
        />
      </View>

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password</Text>
        {passwordError ? (
          <Text style={styles.errorText}>{passwordError}</Text>
        ) : null}
        <TextInput
          style={[styles.input, passwordError && styles.inputError]}
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (passwordError) setPasswordError(""); // Clear error on typing
          }}
          placeholder="Enter your password"
          placeholderTextColor="#9ca3af"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isLoading}
        />
      </View>

      {/* Forgot Password */}
      <TouchableOpacity
        style={styles.forgotPasswordContainer}
        onPress={handleForgotPassword}
        disabled={isLoading}
      >
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#ffffff" size="small" />
            <Text style={styles.submitButtonText}>Signing In...</Text>
          </View>
        ) : (
          <Text style={styles.submitButtonText}>Sign In</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#111827",
  },
  inputError: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 14,
    marginBottom: 4,
    fontWeight: "500",
  },
  forgotPasswordContainer: {
    alignItems: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: "#3b82f6",
    fontWeight: "500",
  },
  submitButton: {
    backgroundColor: "#3b82f6",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#3b82f6",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: "#9ca3af",
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});

export default LoginForm;
