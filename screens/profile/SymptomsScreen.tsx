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

type SymptomsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Symptoms"
>;

const COMMON_SYMPTOMS = [
  "Bloating",
  "Gas",
  "Constipation",
  "Diarrhea",
  "Abdominal pain",
  "Cramping",
  "Nausea",
  "Heartburn",
  "Indigestion",
  "Irregular bowel movements",
  "Stomach discomfort",
  "Loss of appetite",
  "Fatigue after eating",
  "Food sensitivities",
  "None",
];

export default function SymptomsScreen() {
  const { user, setUser } = useAuth();
  const navigation = useNavigation<SymptomsScreenNavigationProp>();

  // Get current symptoms from user profile (backend format)
  const currentSymptoms = user?.profile?.recentSymptoms || [];
  const [selectedSymptoms, setSelectedSymptoms] =
    useState<string[]>(currentSymptoms);
  const [customSymptom, setCustomSymptom] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleBack = () => {
    navigation.goBack();
  };

  const toggleSymptom = (symptom: string) => {
    if (symptom === "None") {
      // "None" is mutually exclusive with other options
      if (selectedSymptoms.includes(symptom)) {
        setSelectedSymptoms([]);
      } else {
        setSelectedSymptoms([symptom]);
      }
    } else {
      // Remove "None" if selecting a specific symptom
      let newSymptoms = selectedSymptoms.filter((s) => s !== "None");

      if (selectedSymptoms.includes(symptom)) {
        newSymptoms = newSymptoms.filter((s) => s !== symptom);
      } else {
        newSymptoms = [...newSymptoms, symptom];
      }

      setSelectedSymptoms(newSymptoms);
    }
  };

  const addCustomSymptom = () => {
    if (
      customSymptom.trim() &&
      !selectedSymptoms.includes(customSymptom.trim())
    ) {
      // Remove "None" if adding a custom symptom
      const newSymptoms = selectedSymptoms.filter((s) => s !== "None");
      setSelectedSymptoms([...newSymptoms, customSymptom.trim()]);
      setCustomSymptom("");
    }
  };

  const removeSymptom = (symptom: string) => {
    setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptom));
  };

  const handleSaveSymptoms = async () => {
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
            poopGoals: user?.profile.poopGoals || [],
            conditions: user?.profile.conditions || [],
            recentSymptoms: selectedSymptoms,
            temperament: user?.profile.temperament || null,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update symptoms");
      }

      // Update the user context with the new symptoms
      if (user) {
        const updatedUser = {
          ...user,
          profile: {
            ...user.profile,
            recentSymptoms: selectedSymptoms,
          },
        };
        setUser(updatedUser);

        // Update stored user data
        await AsyncStorage.setItem("userData", JSON.stringify(updatedUser));
      }

      Alert.alert("Success", "Recent symptoms updated successfully");
      navigation.goBack();
    } catch (error: any) {
      console.error("Error updating symptoms:", error);
      Alert.alert("Error", error.message || "Failed to update symptoms");
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
        <Text style={styles.title}>Recent Symptoms</Text>
        <Text style={styles.subtitle}>
          Select any symptoms you've experienced recently to help personalize
          your analysis
        </Text>

        {/* Common Symptoms */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose from common symptoms:</Text>
          <View style={styles.symptomsGrid}>
            {COMMON_SYMPTOMS.map((symptom) => (
              <TouchableOpacity
                key={symptom}
                style={[
                  styles.symptomButton,
                  selectedSymptoms.includes(symptom) &&
                    styles.symptomButtonSelected,
                  symptom === "None" && styles.noneButton,
                ]}
                onPress={() => toggleSymptom(symptom)}
              >
                <Text
                  style={[
                    styles.symptomButtonText,
                    selectedSymptoms.includes(symptom) &&
                      styles.symptomButtonTextSelected,
                  ]}
                >
                  {symptom}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Custom Symptom Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add a custom symptom:</Text>
          <View style={styles.customSymptomContainer}>
            <TextInput
              style={styles.customSymptomInput}
              value={customSymptom}
              onChangeText={setCustomSymptom}
              placeholder="Enter your symptom..."
              placeholderTextColor="#9ca3af"
              editable={!isLoading}
            />
            <TouchableOpacity
              style={[
                styles.addButton,
                (!customSymptom.trim() || isLoading) &&
                  styles.addButtonDisabled,
              ]}
              onPress={addCustomSymptom}
              disabled={!customSymptom.trim() || isLoading}
            >
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Selected Symptoms */}
        {selectedSymptoms.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your selected symptoms:</Text>
            <View style={styles.selectedSymptomsContainer}>
              {selectedSymptoms.map((symptom, index) => (
                <View key={index} style={styles.selectedSymptomItem}>
                  <Text style={styles.selectedSymptomText}>• {symptom}</Text>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeSymptom(symptom)}
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
          onPress={handleSaveSymptoms}
          disabled={isLoading}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#ffffff" size="small" />
              <Text style={styles.saveButtonText}>Saving...</Text>
            </View>
          ) : (
            <Text style={styles.saveButtonText}>Save Symptoms</Text>
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
  symptomsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  symptomButton: {
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  symptomButtonSelected: {
    backgroundColor: "#dc2626",
    borderColor: "#dc2626",
  },
  noneButton: {
    width: "100%",
  },
  symptomButtonText: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
    textAlign: "center",
  },
  symptomButtonTextSelected: {
    color: "white",
  },
  customSymptomContainer: {
    flexDirection: "row",
    gap: 10,
  },
  customSymptomInput: {
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
    backgroundColor: "#dc2626",
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
  selectedSymptomsContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedSymptomItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  selectedSymptomText: {
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
    backgroundColor: "#dc2626",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#dc2626",
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
