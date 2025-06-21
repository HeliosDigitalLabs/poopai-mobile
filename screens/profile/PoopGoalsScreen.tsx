import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../../context/auth/AuthContext";
import { RootStackParamList } from "../../types/navigation";
import { AppConfig } from "../../config/app.config";
import BackButton from "../../components/navigation/BackButton";
import { logEvent } from "../../lib/analytics";
import { PROFILE_UPDATED } from "../../lib/analyticsEvents";

type PoopGoalsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "PoopGoals"
>;

const COMMON_GOALS = [
  "Poop regularly",
  "Improve digestion",
  "Reduce bloating",
  "Increase fiber intake",
  "Stay hydrated",
  "Exercise more",
  "Eat more vegetables",
  "Reduce processed foods",
];

export default function PoopGoalsScreen() {
  const { user, setUser } = useAuth();
  const navigation = useNavigation<PoopGoalsScreenNavigationProp>();
  const [selectedGoals, setSelectedGoals] = useState<string[]>(
    user?.profile.poopGoals || []
  );
  const [customGoal, setCustomGoal] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleBack = () => {
    navigation.goBack();
  };

  const toggleGoal = (goal: string) => {
    if (selectedGoals.includes(goal)) {
      setSelectedGoals(selectedGoals.filter((g) => g !== goal));
    } else {
      setSelectedGoals([...selectedGoals, goal]);
    }
  };

  const addCustomGoal = () => {
    if (customGoal.trim() && !selectedGoals.includes(customGoal.trim())) {
      setSelectedGoals([...selectedGoals, customGoal.trim()]);
      setCustomGoal("");
    }
  };

  const removeGoal = (goal: string) => {
    setSelectedGoals(selectedGoals.filter((g) => g !== goal));
  };

  const handleSaveGoals = async () => {
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
            name: user?.profile.name || "",
            poopGoals: selectedGoals,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update poop goals");
      }

      // Update the user context with the new goals
      if (user) {
        const updatedUser = {
          ...user,
          profile: {
            ...user.profile,
            poopGoals: selectedGoals,
          },
        };
        setUser(updatedUser);

        // Update stored user data
        await AsyncStorage.setItem("userData", JSON.stringify(updatedUser));

        // Track profile update
        logEvent(PROFILE_UPDATED, {
          field: "poopGoals",
          newValue: selectedGoals,
        });
      }

      Alert.alert("Success", "Poop goals updated successfully");
      navigation.goBack();
    } catch (error: any) {
      console.error("Error updating poop goals:", error);
      Alert.alert("Error", error.message || "Failed to update poop goals");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <BackButton onPress={handleBack} />

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.title}>Poop Goals</Text>
        <Text style={styles.subtitle}>
          Set your digestive health goals to track your progress
        </Text>

        {/* Common Goals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose from common goals:</Text>
          <View style={styles.goalsGrid}>
            {COMMON_GOALS.map((goal) => (
              <TouchableOpacity
                key={goal}
                style={[
                  styles.goalButton,
                  selectedGoals.includes(goal) && styles.goalButtonSelected,
                ]}
                onPress={() => toggleGoal(goal)}
              >
                <Text
                  style={[
                    styles.goalButtonText,
                    selectedGoals.includes(goal) &&
                      styles.goalButtonTextSelected,
                  ]}
                >
                  {goal}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Custom Goal Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add a custom goal:</Text>
          <View style={styles.customGoalContainer}>
            <TextInput
              style={styles.customGoalInput}
              value={customGoal}
              onChangeText={setCustomGoal}
              placeholder="Enter your custom goal..."
              placeholderTextColor="#9ca3af"
              editable={!isLoading}
            />
            <TouchableOpacity
              style={[
                styles.addButton,
                (!customGoal.trim() || isLoading) && styles.addButtonDisabled,
              ]}
              onPress={addCustomGoal}
              disabled={!customGoal.trim() || isLoading}
            >
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Selected Goals */}
        {selectedGoals.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your selected goals:</Text>
            <View style={styles.selectedGoalsContainer}>
              {selectedGoals.map((goal, index) => (
                <View key={index} style={styles.selectedGoalItem}>
                  <Text style={styles.selectedGoalText}>• {goal}</Text>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeGoal(goal)}
                    disabled={isLoading}
                  >
                    <Text style={styles.removeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSaveGoals}
          disabled={isLoading}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#ffffff" size="small" />
              <Text style={styles.saveButtonText}>Saving...</Text>
            </View>
          ) : (
            <Text style={styles.saveButtonText}>Save Goals</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 100,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#374151",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 30,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 15,
  },
  goalsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  goalButton: {
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  goalButtonSelected: {
    backgroundColor: "#10b981",
    borderColor: "#10b981",
  },
  goalButtonText: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
  },
  goalButtonTextSelected: {
    color: "white",
  },
  customGoalContainer: {
    flexDirection: "row",
    gap: 10,
  },
  customGoalInput: {
    flex: 1,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#111827",
  },
  addButton: {
    backgroundColor: "#10b981",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    justifyContent: "center",
  },
  addButtonDisabled: {
    backgroundColor: "#9ca3af",
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  selectedGoalsContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedGoalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  selectedGoalText: {
    fontSize: 16,
    color: "#374151",
    flex: 1,
  },
  removeButton: {
    backgroundColor: "#ef4444",
    borderRadius: 15,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  removeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  saveButton: {
    backgroundColor: "#3b82f6",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonDisabled: {
    backgroundColor: "#9ca3af",
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
