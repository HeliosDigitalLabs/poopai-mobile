import React, { useState } from "react";
import {
  View,
  Text,
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
import { useDimensions } from "../../context/core/DimensionsContext";
import { RootStackParamList } from "../../types/navigation";
import { AppConfig } from "../../config/app.config";
import BackButton from "../../components/navigation/BackButton";

type ConditionsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Conditions"
>;

const COMMON_CONDITIONS = [
  "IBS (Irritable Bowel Syndrome)",
  "IBD (Inflammatory Bowel Disease)",
  "Crohn's Disease",
  "Ulcerative Colitis",
  "GERD (Acid Reflux)",
  "Lactose Intolerance",
  "Celiac Disease",
  "Food Allergies",
  "Constipation",
  "Diarrhea",
  "Bloating",
  "Gas",
  "None",
];

export default function ConditionsScreen() {
  const { user, setUser } = useAuth();
  const navigation = useNavigation<ConditionsScreenNavigationProp>();
  const { screenWidth, screenHeight } = useDimensions();

  // Calculate responsive values
  const containerPadding = Math.min(screenWidth * 0.05, 20); // 5% of screen width, max 20px
  const titleFontSize = Math.min(screenHeight * 0.04, 32); // 4% of screen height, max 32px
  const subtitleFontSize = Math.min(screenHeight * 0.02, 16); // 2% of screen height, max 16px
  const sectionTitleFontSize = Math.min(screenHeight * 0.023, 18); // 2.3% of screen height, max 18px
  const buttonFontSize = Math.min(screenHeight * 0.02, 16); // 2% of screen height, max 16px
  const buttonPadding = Math.min(screenHeight * 0.015, 12); // 1.5% of screen height, max 12px
  const borderRadius = Math.min(screenHeight * 0.015, 12); // 1.5% of screen height, max 12px
  const sectionMargin = Math.min(screenHeight * 0.038, 30); // 3.8% of screen height, max 30px
  const gridGap = Math.min(screenHeight * 0.013, 10); // 1.3% of screen height, max 10px
  const noneButtonWidthReduction = Math.min(screenWidth * 0.01, 8); // 1% of width, max 8px

  // Log dimensions for debugging
  console.log(`ConditionsScreen dimensions: ${screenWidth}x${screenHeight}`);

  // Get current conditions from user profile (backend format)
  const currentConditions = user?.profile?.conditions || [];
  const [selectedConditions, setSelectedConditions] =
    useState<string[]>(currentConditions);
  const [customCondition, setCustomCondition] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleBack = () => {
    navigation.goBack();
  };

  const toggleCondition = (condition: string) => {
    if (condition === "None") {
      // "None" is mutually exclusive with other options
      if (selectedConditions.includes(condition)) {
        setSelectedConditions([]);
      } else {
        setSelectedConditions([condition]);
      }
    } else {
      // Remove "None" if selecting a specific condition
      let newConditions = selectedConditions.filter((c) => c !== "None");

      if (selectedConditions.includes(condition)) {
        newConditions = newConditions.filter((c) => c !== condition);
      } else {
        newConditions = [...newConditions, condition];
      }

      setSelectedConditions(newConditions);
    }
  };

  const addCustomCondition = () => {
    if (
      customCondition.trim() &&
      !selectedConditions.includes(customCondition.trim())
    ) {
      // Remove "None" if adding a custom condition
      const newConditions = selectedConditions.filter((c) => c !== "None");
      setSelectedConditions([...newConditions, customCondition.trim()]);
      setCustomCondition("");
    }
  };

  const removeCondition = (condition: string) => {
    setSelectedConditions(selectedConditions.filter((c) => c !== condition));
  };

  const handleSaveConditions = async () => {
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
            conditions: selectedConditions,
            recentSymptoms: user?.profile.recentSymptoms || [],
            temperament: user?.profile.temperament || null,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update conditions");
      }

      // Update the user context with the new conditions
      if (user) {
        const updatedUser = {
          ...user,
          profile: {
            ...user.profile,
            conditions: selectedConditions,
          },
        };
        setUser(updatedUser);

        // Update stored user data
        await AsyncStorage.setItem("userData", JSON.stringify(updatedUser));
      }

      Alert.alert("Success", "Digestive conditions updated successfully");
      navigation.goBack();
    } catch (error: any) {
      console.error("Error updating conditions:", error);
      Alert.alert("Error", error.message || "Failed to update conditions");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "transparent",
      }}
    >
      <BackButton onPress={handleBack} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: containerPadding,
          paddingTop: screenHeight * 0.12, // 12% from top for back button space
          paddingBottom: Math.min(screenHeight * 0.05, 40),
        }}
      >
        <Text
          style={{
            fontSize: titleFontSize,
            fontWeight: "bold",
            color: "#374151",
            textAlign: "center",
            marginBottom: Math.min(screenHeight * 0.01, 8),
          }}
        >
          Digestive Conditions
        </Text>

        <Text
          style={{
            fontSize: subtitleFontSize,
            color: "#6b7280",
            textAlign: "center",
            marginBottom: sectionMargin,
            lineHeight: subtitleFontSize * 1.4,
          }}
        >
          Select any digestive conditions you live with to help personalize your
          analysis
        </Text>

        {/* Common Conditions */}
        <View style={{ marginBottom: sectionMargin }}>
          <Text
            style={{
              fontSize: sectionTitleFontSize,
              fontWeight: "600",
              color: "#374151",
              marginBottom: Math.min(screenHeight * 0.019, 15),
            }}
          >
            Choose from common conditions:
          </Text>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: gridGap,
            }}
          >
            {COMMON_CONDITIONS.map((condition) => {
              const isNoneButton = condition === "None";
              return (
                <TouchableOpacity
                  key={condition}
                  style={{
                    backgroundColor: selectedConditions.includes(condition)
                      ? "#f59e0b"
                      : "white",
                    borderWidth: 2,
                    borderColor: selectedConditions.includes(condition)
                      ? "#f59e0b"
                      : "#e5e7eb",
                    borderRadius: borderRadius,
                    paddingHorizontal: buttonPadding + 4,
                    paddingVertical: buttonPadding,
                    marginBottom: Math.min(screenHeight * 0.01, 8),
                    width: isNoneButton
                      ? screenWidth -
                        containerPadding * 2 -
                        noneButtonWidthReduction
                      : "48%",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                  onPress={() => toggleCondition(condition)}
                >
                  <Text
                    style={{
                      fontSize: buttonFontSize,
                      color: selectedConditions.includes(condition)
                        ? "white"
                        : "#374151",
                      fontWeight: "500",
                      textAlign: "center",
                    }}
                  >
                    {condition}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Custom Condition Input */}
        <View style={{ marginBottom: sectionMargin }}>
          <Text
            style={{
              fontSize: sectionTitleFontSize,
              fontWeight: "600",
              color: "#374151",
              marginBottom: Math.min(screenHeight * 0.019, 15),
            }}
          >
            Add a custom condition:
          </Text>

          <View
            style={{
              flexDirection: "row",
              gap: gridGap,
            }}
          >
            <TextInput
              style={{
                flex: 1,
                backgroundColor: "white",
                borderWidth: 1,
                borderColor: "#d1d5db",
                borderRadius: borderRadius,
                paddingHorizontal: buttonPadding + 4,
                paddingVertical: Math.min(screenHeight * 0.018, 14),
                fontSize: buttonFontSize,
                color: "#111827",
              }}
              value={customCondition}
              onChangeText={setCustomCondition}
              placeholder="Enter your condition..."
              placeholderTextColor="#9ca3af"
              editable={!isLoading}
            />
            <TouchableOpacity
              style={{
                backgroundColor:
                  !customCondition.trim() || isLoading ? "#9ca3af" : "#f59e0b",
                borderRadius: borderRadius,
                paddingHorizontal: Math.min(screenWidth * 0.05, 20),
                paddingVertical: Math.min(screenHeight * 0.018, 14),
                justifyContent: "center",
              }}
              onPress={addCustomCondition}
              disabled={!customCondition.trim() || isLoading}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: buttonFontSize,
                  fontWeight: "600",
                }}
              >
                Add
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Selected Conditions */}
        {selectedConditions.length > 0 && (
          <View style={{ marginBottom: sectionMargin }}>
            <Text
              style={{
                fontSize: sectionTitleFontSize,
                fontWeight: "600",
                color: "#374151",
                marginBottom: Math.min(screenHeight * 0.019, 15),
              }}
            >
              Your selected conditions:
            </Text>

            <View
              style={{
                backgroundColor: "white",
                borderRadius: borderRadius,
                padding: buttonPadding + 4,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              {selectedConditions.map((condition, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingVertical: Math.min(screenHeight * 0.01, 8),
                  }}
                >
                  <Text
                    style={{
                      fontSize: buttonFontSize,
                      color: "#374151",
                      flex: 1,
                    }}
                  >
                    • {condition}
                  </Text>
                  <TouchableOpacity
                    style={{
                      backgroundColor: "#ef4444",
                      borderRadius: 15,
                      width: Math.min(screenHeight * 0.03, 24),
                      height: Math.min(screenHeight * 0.03, 24),
                      justifyContent: "center",
                      alignItems: "center",
                      marginLeft: gridGap,
                    }}
                    onPress={() => removeCondition(condition)}
                    disabled={isLoading}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontSize: buttonFontSize,
                        fontWeight: "bold",
                      }}
                    >
                      ×
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Save Button */}
        <TouchableOpacity
          style={{
            backgroundColor: isLoading ? "#9ca3af" : "#f59e0b",
            borderRadius: borderRadius,
            paddingVertical: buttonPadding + 4,
            alignItems: "center",
            marginTop: Math.min(screenHeight * 0.025, 20),
            shadowColor: isLoading ? "transparent" : "#f59e0b",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isLoading ? 0 : 0.3,
            shadowRadius: 8,
            elevation: isLoading ? 0 : 6,
          }}
          onPress={handleSaveConditions}
          disabled={isLoading}
        >
          {isLoading ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: Math.min(screenWidth * 0.02, 8),
              }}
            >
              <ActivityIndicator color="#ffffff" size="small" />
              <Text
                style={{
                  color: "white",
                  fontSize: Math.min(screenHeight * 0.023, 18),
                  fontWeight: "600",
                }}
              >
                Saving...
              </Text>
            </View>
          ) : (
            <Text
              style={{
                color: "white",
                fontSize: Math.min(screenHeight * 0.023, 18),
                fontWeight: "600",
              }}
            >
              Save Conditions
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
