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
import { RootStackParamList } from "../../types/navigation";
import BackButton from "../../components/navigation/BackButton";
import { AppConfig } from "../../config/app.config";
import AsyncStorage from "@react-native-async-storage/async-storage";

type SettingsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Settings"
>;

export default function SettingsScreen() {
  const { user, setUser } = useAuth();
  const { resetOnboarding } = useOnboarding();
  const { totalScansPerformed, resetScanCounter } = useScan();
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const [username, setUsername] = useState(user?.profile.name || "");
  const [isLoading, setIsLoading] = useState(false);

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
