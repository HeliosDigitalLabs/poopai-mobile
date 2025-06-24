import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export default function ConfirmationModal({
  visible,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  isDestructive = false,
  isLoading = false,
}: ConfirmationModalProps) {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <BlurView intensity={50} style={styles.overlay}>
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={["rgba(255, 255, 255, 0.95)", "rgba(255, 255, 255, 0.9)"]}
            style={styles.modal}
          >
            {/* Title */}
            <Text style={styles.title}>{title}</Text>

            {/* Message */}
            <Text style={styles.message}>{message}</Text>

            {/* Button Container */}
            <View style={styles.buttonContainer}>
              {/* Cancel Button */}
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onCancel}
                disabled={isLoading}
              >
                <Text style={styles.cancelButtonText}>{cancelText}</Text>
              </TouchableOpacity>

              {/* Confirm Button */}
              <TouchableOpacity
                style={[
                  styles.button,
                  isDestructive
                    ? styles.destructiveButton
                    : styles.confirmButton,
                  isLoading && styles.disabledButton,
                ]}
                onPress={onConfirm}
                disabled={isLoading}
              >
                <Text
                  style={
                    isDestructive
                      ? styles.destructiveButtonText
                      : styles.confirmButtonText
                  }
                >
                  {isLoading ? "Loading..." : confirmText}
                </Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  modalContainer: {
    width: width * 0.85,
    maxWidth: 400,
    borderRadius: 20,
    overflow: "hidden",
  },
  modal: {
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "rgba(0, 0, 0, 0.9)",
    textAlign: "center",
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: "rgba(0, 0, 0, 0.7)",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: "column",
    gap: 12,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.2)",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(0, 0, 0, 0.7)",
  },
  confirmButton: {
    backgroundColor: "rgba(16, 185, 129, 0.9)",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  destructiveButton: {
    backgroundColor: "rgba(220, 38, 38, 0.9)",
  },
  destructiveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  disabledButton: {
    opacity: 0.6,
  },
});
