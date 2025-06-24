import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useAuth } from "../../context/auth/AuthContext";
import { useOnboarding } from "../../context/features/OnboardingContext";
import { useScan } from "../../context/features/ScanContext";
import { useBlur } from "../../context/features/BlurContext";
import { RootStackParamList } from "../../types/navigation";
import BackButton from "../../components/navigation/BackButton";
import { AppConfig } from "../../config/app.config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import { Switch } from "react-native-paper";

type SettingsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Settings"
>;

export default function SettingsScreen() {
  const { user, setUser } = useAuth();
  const { resetOnboarding } = useOnboarding();
  const { totalScansPerformed, resetScanCounter } = useScan();
  const { blurByDefault, setBlurByDefault, initialized } = useBlur();
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const [username, setUsername] = useState(user?.profile.name || "");
  const [isLoading, setIsLoading] = useState(false);

  // Delete all scans state
  const [showFirstDeleteModal, setShowFirstDeleteModal] = useState(false);
  const [showSecondDeleteModal, setShowSecondDeleteModal] = useState(false);
  const [isDeletingScans, setIsDeletingScans] = useState(false);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSaveUsername = async () => {
    if (!username.trim()) {
      Alert.alert("Error", "Username cannot be empty");
      return;
    }

    if (username === user?.profile.name) {
      Alert.alert("Info", "No changes to save");
      return;
    }

    setIsLoading(true);

    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Error", "Authentication required");
        return;
      }

      const response = await fetch(
        `${AppConfig.api.baseUrl}/api/user/profile`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: username.trim(),
            poopGoals: user?.profile.poopGoals || [],
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update profile");
      }

      // Update the user context with the new username
      if (user) {
        const updatedUser = {
          ...user,
          profile: {
            ...user.profile,
            name: username.trim(),
          },
        };
        setUser(updatedUser);

        // Update stored user data
        await AsyncStorage.setItem("userData", JSON.stringify(updatedUser));
      }

      Alert.alert("Success", "Username updated successfully");
    } catch (error: any) {
      console.error("Error updating username:", error);
      Alert.alert("Error", error.message || "Failed to update username");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetOnboarding = () => {
    Alert.alert(
      "Reset Onboarding",
      "This will reset the onboarding flow. You'll see the welcome screens again on next app restart. This is for development purposes only.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            await resetOnboarding();
            Alert.alert(
              "Success",
              "Onboarding has been reset. Restart the app to see the onboarding flow."
            );
          },
        },
      ]
    );
  };

  const handleResetScanCounter = () => {
    Alert.alert(
      "Reset Scan Counter",
      `This will reset your total scan count from ${totalScansPerformed} to 0. This is for development/testing purposes only.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            await resetScanCounter();
            Alert.alert(
              "Success",
              "Scan counter has been reset to 0. You can now test the first-scan premium nudge again."
            );
          },
        },
      ]
    );
  };

  const handlePrivacyPolicy = async () => {
    try {
      const url = "https://trypoopai.com/privacy";
      await WebBrowser.openBrowserAsync(url, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FORM_SHEET,
        controlsColor: "#3b82f6",
        toolbarColor: "#ffffff",
      });
    } catch (error) {
      console.error("Error opening privacy policy:", error);
      Alert.alert("Error", "Unable to open privacy policy. Please try again.");
    }
  };

  const handleTermsOfUse = async () => {
    try {
      const url = "https://trypoopai.com/terms";
      await WebBrowser.openBrowserAsync(url, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FORM_SHEET,
        controlsColor: "#3b82f6",
        toolbarColor: "#ffffff",
      });
    } catch (error) {
      console.error("Error opening terms of use:", error);
      Alert.alert("Error", "Unable to open terms of use. Please try again.");
    }
  };

  // Delete all scans functions
  const handleDeleteAllScans = () => {
    console.log("🗑️ User initiated delete all scans");
    setShowFirstDeleteModal(true);
  };

  const handleFirstDeleteConfirm = () => {
    console.log("🗑️ User confirmed first delete modal");
    setShowFirstDeleteModal(false);
    setShowSecondDeleteModal(true);
  };

  const handleFirstDeleteCancel = () => {
    console.log("🗑️ User cancelled first delete modal");
    setShowFirstDeleteModal(false);
  };

  const handleSecondDeleteConfirm = async () => {
    console.log(
      "🗑️ User confirmed second delete modal - proceeding with deletion"
    );
    setIsDeletingScans(true);

    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      console.log("🗑️ Making API call to delete all scans");
      const response = await fetch(`${AppConfig.api.baseUrl}/api/user/delete`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          "❌ Delete API response not ok:",
          response.status,
          errorText
        );
        throw new Error(`Failed to delete scans: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Delete all scans successful:", result);

      Alert.alert(
        "Success",
        "All your scan history has been permanently deleted.",
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("❌ Error deleting all scans:", error);
      Alert.alert(
        "Error",
        "Failed to delete scan history. Please try again or contact support if the problem persists.",
        [{ text: "OK" }]
      );
    } finally {
      setIsDeletingScans(false);
      setShowSecondDeleteModal(false);
    }
  };

  const handleSecondDeleteCancel = () => {
    console.log("🗑️ User cancelled second delete modal");
    setShowSecondDeleteModal(false);
  };

  const handleResetAppData = () => {
    Alert.alert(
      "⚠️ Reset All App Data",
      "This will completely wipe ALL app data including:\n\n• Authentication tokens\n• User profile data\n• Onboarding progress\n• Scan history\n• First-time user tracking\n• All settings\n\nThe app will reload as if it's a fresh install. This cannot be undone!\n\nAre you sure you want to continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "RESET ALL DATA",
          style: "destructive",
          onPress: async () => {
            try {
              // Show loading alert
              Alert.alert("Resetting...", "Clearing all app data...");

              // Get all keys and clear everything
              const keys = await AsyncStorage.getAllKeys();
              await AsyncStorage.multiRemove(keys);

              // Force reload the app (this will restart the entire app state)
              // Note: In React Native, we can't truly "reload" like in web
              // But clearing all AsyncStorage will make the app behave like a fresh install
              Alert.alert(
                "App Data Reset Complete",
                "All app data has been cleared. Please restart the app manually to complete the reset.",
                [
                  {
                    text: "OK",
                    onPress: () => {
                      // Navigate to home and reset auth overlay
                      navigation.navigate("Home" as any);
                    },
                  },
                ]
              );
            } catch (error) {
              console.error("Error resetting app data:", error);
              Alert.alert(
                "Error",
                "Failed to reset app data. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <BackButton onPress={handleBack} />

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.title}>Settings</Text>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Account Settings</Text>

          <View style={styles.inputSection}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.textInput}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter your username"
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            onPress={handleSaveUsername}
            disabled={isLoading}
          >
            <Text style={styles.saveButtonText}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Privacy & Legal Section */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Privacy & Legal</Text>

          {/* Blur scan pictures by default toggle with background */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "#f3f4f6",
              borderRadius: 12,
              paddingVertical: 16,
              paddingHorizontal: 18,
              marginBottom: 18,
              borderWidth: 1,
              borderColor: "#e5e7eb",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.04,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Text style={{ fontSize: 16, color: "#222", fontWeight: "500" }}>
              Blur scan pictures by default
            </Text>
            <Switch
              value={blurByDefault}
              onValueChange={setBlurByDefault}
              color="#3b82f6"
              disabled={!initialized}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.saveButton,
              { backgroundColor: "#6b7280", marginBottom: 12 },
            ]}
            onPress={handlePrivacyPolicy}
          >
            <Text style={styles.saveButtonText}>Privacy Policy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: "#6b7280" }]}
            onPress={handleTermsOfUse}
          >
            <Text style={styles.saveButtonText}>Terms of Use</Text>
          </TouchableOpacity>

          {/* Delete All Scans Button */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              { backgroundColor: "#dc2626", marginTop: 12 },
              isDeletingScans && styles.saveButtonDisabled,
            ]}
            onPress={handleDeleteAllScans}
            disabled={isDeletingScans}
          >
            <Text style={styles.saveButtonText}>
              {isDeletingScans ? "Deleting..." : "DELETE ALL SCANS"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Development Section - Only show in development mode */}
        {__DEV__ && (
          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>Development Tools</Text>

            <View style={styles.inputSection}>
              <Text style={styles.label}>
                Total Scans Performed: {totalScansPerformed}
              </Text>
              <Text style={styles.devNote}>
                Track how many scans the user has completed. First scan triggers
                premium nudge after 15 seconds.
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.saveButton,
                { backgroundColor: "#f59e0b", marginBottom: 12 },
              ]}
              onPress={handleResetScanCounter}
            >
              <Text style={styles.saveButtonText}>Reset Scan Counter</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: "#ef4444" }]}
              onPress={handleResetOnboarding}
            >
              <Text style={styles.saveButtonText}>Reset Onboarding</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.saveButton,
                {
                  backgroundColor: "#dc2626",
                  marginTop: 12,
                  borderWidth: 2,
                  borderColor: "#991b1b",
                },
              ]}
              onPress={handleResetAppData}
            >
              <Text style={[styles.saveButtonText, { fontWeight: "700" }]}>
                ⚠️ RESET ALL APP DATA
              </Text>
            </TouchableOpacity>

            <Text style={styles.devNote}>
              💡 Development only: Use these tools to test onboarding and
              first-scan premium nudge flows. You may need to restart the app to
              see some changes.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* First Delete Confirmation Modal */}
      <ConfirmationModal
        visible={showFirstDeleteModal}
        title="Delete All Scans?"
        message="Are you sure you want to delete all your scan history? This will remove all your poop scan data from your account."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        onConfirm={handleFirstDeleteConfirm}
        onCancel={handleFirstDeleteCancel}
        isDestructive={true}
      />

      {/* Second Delete Confirmation Modal */}
      <ConfirmationModal
        visible={showSecondDeleteModal}
        title="Final Confirmation"
        message="This action cannot be undone. All your scan history will be permanently deleted from our servers. Are you absolutely sure you want to proceed?"
        confirmText="DELETE FOREVER"
        cancelText="Keep My Data"
        onConfirm={handleSecondDeleteConfirm}
        onCancel={handleSecondDeleteCancel}
        isDestructive={true}
        isLoading={isDeletingScans}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
    position: "relative",
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 100, // Increased to avoid overlap with back button
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#374151",
    textAlign: "center",
    marginBottom: 40,
  },
  settingsSection: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 20,
    textAlign: "center",
  },
  inputSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9fafb",
    color: "#374151",
  },
  saveButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonDisabled: {
    backgroundColor: "#9ca3af",
  },
  saveButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  devNote: {
    fontSize: 14,
    color: "#6b7280",
    fontStyle: "italic",
    marginTop: 10,
    textAlign: "center",
    lineHeight: 20,
  },
});
