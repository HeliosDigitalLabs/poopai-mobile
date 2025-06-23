import React from "react";
import {
  View,
  Modal,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";

interface LogoutConfirmationModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const { width: screenWidth } = Dimensions.get("window");

const LogoutConfirmationModal: React.FC<LogoutConfirmationModalProps> = ({
  visible,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />

        <SafeAreaView style={styles.safeArea}>
          <View style={styles.container}>
            <BlurView intensity={50} tint="light" style={styles.modalContent}>
              {/* Close button */}
              <TouchableOpacity style={styles.closeButton} onPress={onCancel}>
                <Ionicons
                  name="close"
                  size={24}
                  color="rgba(139, 69, 19, 0.8)"
                />
              </TouchableOpacity>

              {/* Warning icon */}
              <View style={styles.iconContainer}>
                <BlurView intensity={30} tint="light" style={styles.iconBlur}>
                  <Ionicons
                    name="warning-outline"
                    size={32}
                    color="rgba(255, 193, 7, 0.9)"
                  />
                </BlurView>
              </View>

              {/* Title */}
              <Text style={styles.title}>Are you sure?</Text>

              {/* Warning message */}
              <Text style={styles.message}>
                You will not be able to create another account on this device.
              </Text>

              {/* Buttons */}
              <View style={styles.buttonContainer}>
                {/* Go Back Button - More prominent */}
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={onCancel}
                  activeOpacity={0.8}
                >
                  <BlurView
                    intensity={40}
                    tint="light"
                    style={styles.primaryButtonBlur}
                  >
                    <Text style={styles.primaryButtonText}>Go Back</Text>
                  </BlurView>
                </TouchableOpacity>

                {/* Logout Button - Less prominent */}
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={onConfirm}
                  activeOpacity={0.8}
                >
                  <BlurView
                    intensity={25}
                    tint="dark"
                    style={styles.secondaryButtonBlur}
                  >
                    <Text style={styles.secondaryButtonText}>Logout</Text>
                  </BlurView>
                </TouchableOpacity>
              </View>
            </BlurView>
          </View>
        </SafeAreaView>
      </View>
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
  safeArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  container: {
    width: "100%",
    maxWidth: Math.min(screenWidth * 0.9, 400),
  },
  modalContent: {
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 16,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    zIndex: 1,
  },
  iconContainer: {
    marginBottom: 20,
  },
  iconBlur: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 193, 7, 0.3)",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "rgba(139, 69, 19, 0.9)",
    textAlign: "center",
    marginBottom: 12,
    textShadowColor: "rgba(255, 255, 255, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  message: {
    fontSize: 16,
    color: "rgba(139, 69, 19, 0.8)",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
    textShadowColor: "rgba(255, 255, 255, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonBlur: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(46, 125, 50, 0.3)",
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "rgba(46, 125, 50, 0.9)",
    textShadowColor: "rgba(255, 255, 255, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  secondaryButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  secondaryButtonBlur: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(139, 69, 19, 0.2)",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(139, 69, 19, 0.7)",
    textShadowColor: "rgba(255, 255, 255, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
});

export default LogoutConfirmationModal;
