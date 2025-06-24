import React from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDimensions } from "../../context/core/DimensionsContext";

interface DeleteConfirmationModalProps {
  visible: boolean;
  onDelete: () => void;
  onKeep: () => void;
}

export default function DeleteConfirmationModal({
  visible,
  onDelete,
  onKeep,
}: DeleteConfirmationModalProps) {
  // Fallback for dimensions if context is missing
  let screenHeight = 600;
  let screenWidth = 350;
  try {
    // Try to get from context
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const dims = useDimensions();
    if (dims?.screenHeight && dims?.screenWidth) {
      screenHeight = dims.screenHeight;
      screenWidth = dims.screenWidth;
    }
  } catch (e) {
    // fallback to defaults
  }

  // Debug logging
  console.log("🗂️ DeleteConfirmationModal render - visible:", visible);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onKeep}
    >
      {/* Dark overlay */}
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.4)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Modal content */}
        <View
          style={{
            width: screenWidth * 0.85,
            maxWidth: 400,
            borderRadius: 20,
            overflow: "hidden",
            backgroundColor: "#fff",
            borderWidth: 2,
            borderColor: "#dc2626",
            padding: 24,
            alignItems: "center",
          }}
        >
          <Ionicons
            name="trash-outline"
            size={36}
            color="#dc2626"
            style={{ marginBottom: 12 }}
          />
          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: "#dc2626",
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            Delete this scan?
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: "#333",
              marginBottom: 24,
              textAlign: "center",
            }}
          >
            Are you sure you want to delete this scan? This action cannot be
            undone.
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: "#dc2626",
              borderRadius: 12,
              paddingVertical: 14,
              paddingHorizontal: 32,
              marginBottom: 12,
              width: "100%",
              alignItems: "center",
            }}
            onPress={onDelete}
          >
            <Text
              style={{
                color: "#fff",
                fontWeight: "700",
                fontSize: 16,
              }}
            >
              Delete
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: "#f3f4f6",
              borderRadius: 12,
              paddingVertical: 14,
              paddingHorizontal: 32,
              width: "100%",
              alignItems: "center",
            }}
            onPress={onKeep}
          >
            <Text
              style={{
                color: "#374151",
                fontWeight: "600",
                fontSize: 16,
              }}
            >
              Keep Scan
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
