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
import { useQuiz } from "../../context/features/QuizContext";

interface SignupFormProps {
  onSuccess: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSuccess }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const { signup } = useAuth();
  const { answers } = useQuiz();

  const clearErrors = () => {
    setNameError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
  };

  const handleSubmit = async () => {
    clearErrors();

    // Validation
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

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setEmailError("Please enter a valid email address");
      return;
    }

    if (!password.trim()) {
      setPasswordError("Password is required");
      return;
    }

    // Password validation
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

    setIsLoading(true);
    try {
      await signup(email.trim().toLowerCase(), password, name.trim(), answers);
      onSuccess();
    } catch (error: any) {
      // Handle specific auth errors with contextual messages
      if (error.message?.includes("A user already exists for this device")) {
        setEmailError("An account already exists for this device.");
      } else if (
        error.message?.includes("409") ||
        error.message?.includes("already exists") ||
        error.message?.includes("Email already registered")
      ) {
        setEmailError("An account with this email already exists");
      } else if (
        error.message?.includes("400") ||
        error.message?.includes("validation")
      ) {
        setEmailError("Invalid email or password format");
      } else if (
        error.message?.includes("network") ||
        error.message?.includes("Network")
      ) {
        setEmailError("Network error - please check your connection");
      } else {
        setEmailError("Signup failed - please try again");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Name Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Name</Text>
        {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
        <TextInput
          style={[styles.input, nameError && styles.inputError]}
          value={name}
          onChangeText={(text) => {
            setName(text);
            if (nameError) setNameError(""); // Clear error on typing
          }}
          placeholder="Enter your name"
          placeholderTextColor="#9ca3af"
          autoCapitalize="words"
          autoCorrect={false}
          editable={!isLoading}
        />
      </View>

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
          placeholder="Create a password (min. 6 characters)"
          placeholderTextColor="#9ca3af"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isLoading}
        />
      </View>

      {/* Confirm Password Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Confirm Password</Text>
        {confirmPasswordError ? (
          <Text style={styles.errorText}>{confirmPasswordError}</Text>
        ) : null}
        <TextInput
          style={[styles.input, confirmPasswordError && styles.inputError]}
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            if (confirmPasswordError) setConfirmPasswordError(""); // Clear error on typing
          }}
          placeholder="Confirm your password"
          placeholderTextColor="#9ca3af"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isLoading}
        />
      </View>

      {/* Terms Notice */}
      <Text style={styles.termsText}>
        By creating an account, you agree to our Terms of Service and Privacy
        Policy.
      </Text>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#ffffff" size="small" />
            <Text style={styles.submitButtonText}>Creating Account...</Text>
          </View>
        ) : (
          <Text style={styles.submitButtonText}>Create Account</Text>
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
    marginBottom: 18,
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
  termsText: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 16,
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  submitButton: {
    backgroundColor: "#10b981",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#10b981",
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

export default SignupForm;
