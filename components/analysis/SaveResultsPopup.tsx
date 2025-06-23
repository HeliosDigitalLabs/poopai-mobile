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
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../../context/auth/AuthContext";
import { useScan } from "../../context/features/ScanContext";
import { AnalysisData } from "../../types/api";
import { AppConfig } from "../../config/app.config";
import LoginForm from "../auth/LoginForm";
import SignupForm from "../auth/SignupForm";

interface SaveResultsPopupProps {
  visible: boolean;
  onClose: () => void;
  analysisData: AnalysisData;
}

type AuthMode = "signup" | "login";

const SaveResultsPopup: React.FC<SaveResultsPopupProps> = ({
  visible,
  onClose,
  analysisData,
}) => {
  const [authMode, setAuthMode] = useState<AuthMode>("signup");
  const [isSaving, setIsSaving] = useState(false);
  const { isLoading, user } = useAuth();
  const { incrementScanCount } = useScan();

  const switchMode = () => {
    setAuthMode(authMode === "signup" ? "login" : "signup");
  };

  const saveScanToAPI = async () => {
    try {
      setIsSaving(true);

      // Get the stored auth token
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        throw new Error("No auth token found");
      }

      const response = await fetch(`${AppConfig.api.baseUrl}/api/user/scan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          imageUrl: analysisData.photo,
          analysis: analysisData,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save scan");
      }

      console.log("✅ Scan saved successfully to user account");

      // Increment scan count after successful save
      incrementScanCount();
    } catch (error) {
      console.error("❌ Error saving scan:", error);
      // Don't show error to user, just log it
    } finally {
      setIsSaving(false);
    }
  };

  const handleAuthSuccess = async () => {
    // Save the scan after successful authentication
    await saveScanToAPI();
    onClose();
  };

  // Close popup if user becomes authenticated while it's open
  useEffect(() => {
    if (user && visible) {
      onClose(); // Just close, don't save again
    }
  }, [user, visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView intensity={80} style={styles.overlay}>
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
                disabled={isLoading || isSaving}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>

              {/* Content */}
              <LinearGradient
                colors={["#ffffff", "#f8fafc"]}
                style={styles.contentContainer}
              >
                {/* Header */}
                <View style={styles.header}>
                  <Text style={styles.title}>💾 Save Your Results!</Text>
                  <Text style={styles.subtitle}>
                    {authMode === "signup"
                      ? "Create an account to save this analysis and track your poop health journey over time."
                      : "Sign in to save this analysis and access your poop health history."}
                  </Text>
                </View>

                {/* Form */}
                <View style={styles.formContainer}>
                  {isSaving ? (
                    <View style={styles.savingContainer}>
                      <Text style={styles.savingText}>
                        💾 Saving your results...
                      </Text>
                    </View>
                  ) : (
                    <>
                      {authMode === "signup" ? (
                        <SignupForm onSuccess={handleAuthSuccess} />
                      ) : (
                        <LoginForm onSuccess={handleAuthSuccess} />
                      )}
                    </>
                  )}
                </View>

                {/* Mode switcher */}
                {!isSaving && (
                  <View style={styles.switchContainer}>
                    <Text style={styles.switchText}>
                      {authMode === "signup"
                        ? "Already have an account? "
                        : "Don't have an account? "}
                    </Text>
                    <TouchableOpacity onPress={switchMode} disabled={isLoading}>
                      <Text style={styles.switchLink}>
                        {authMode === "signup" ? "Sign In" : "Sign Up"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Skip option */}
                {!isSaving && (
                  <View style={styles.skipContainer}>
                    <TouchableOpacity onPress={onClose} disabled={isLoading}>
                      <Text style={styles.skipText}>Skip for now</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </LinearGradient>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
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
    top: -10,
    right: 10,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 24,
    color: "#6b7280",
    fontWeight: "bold",
  },
  contentContainer: {
    borderRadius: 20,
    padding: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
  },
  formContainer: {
    marginBottom: 20,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  switchText: {
    fontSize: 14,
    color: "#6b7280",
  },
  switchLink: {
    fontSize: 14,
    color: "#3b82f6",
    fontWeight: "600",
  },
  skipContainer: {
    alignItems: "center",
  },
  skipText: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
  },
  savingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  savingText: {
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "600",
  },
});

export default SaveResultsPopup;
