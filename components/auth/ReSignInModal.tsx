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

interface ReSignInModalProps {
  visible: boolean;
  onClose: () => void;
  onSignBackIn: () => void;
  onStartOver: () => void;
}

const { width: screenWidth } = Dimensions.get("window");

const ReSignInModal: React.FC<ReSignInModalProps> = ({
  visible,
  onClose,
  onSignBackIn,
  onStartOver,
}) => {
  const handleSignIn = () => {
    onSignBackIn();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container}>
          <View style={styles.modalContainer}>
            {/* Close button */}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <BlurView intensity={30} style={styles.closeButtonBlur}>
                <Ionicons
                  name="close"
                  size={24}
                  color="rgba(255, 255, 255, 0.9)"
                />
              </BlurView>
            </TouchableOpacity>

            {/* Content Container */}
            <View style={styles.contentContainer}>
              <BlurView intensity={40} tint="light" style={styles.contentBlur}>
                <View style={styles.messageContainer}>
                  <View style={styles.iconContainer}>
                    <Ionicons
                      name="log-out-outline"
                      size={48}
                      color="rgba(255, 165, 0, 0.9)"
                    />
                  </View>

                  <Text style={styles.title}>Oops! You got signed out</Text>
                  <Text style={styles.subtitle}>
                    It looks like your session expired. Please sign back in to
                    continue using PoopAI with your saved preferences.
                  </Text>

                  {/* Sign Back In Button */}
                  <TouchableOpacity
                    style={[styles.actionButton, styles.primaryButton]}
                    onPress={handleSignIn}
                  >
                    <BlurView
                      intensity={35}
                      tint="light"
                      style={styles.buttonBlur}
                    >
                      <Ionicons
                        name="log-in-outline"
                        size={20}
                        color="rgba(255, 255, 255, 0.9)"
                      />
                      <Text style={styles.primaryButtonText}>Sign Back In</Text>
                    </BlurView>
                  </TouchableOpacity>

                  {/* Start Over Button */}
                  <TouchableOpacity
                    style={[styles.actionButton, styles.secondaryButton]}
                    onPress={onStartOver}
                  >
                    <BlurView
                      intensity={20}
                      tint="light"
                      style={styles.buttonBlur}
                    >
                      <Ionicons
                        name="refresh-outline"
                        size={20}
                        color="rgba(255, 255, 255, 0.7)"
                      />
                      <Text style={styles.secondaryButtonText}>
                        Start Over as New User
                      </Text>
                    </BlurView>
                  </TouchableOpacity>

                  <Text style={styles.footerText}>
                    Starting over will clear your local data and show the
                    onboarding again.
                  </Text>
                </View>
              </BlurView>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: Math.min(screenWidth - 40, 400),
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: -15,
    right: -15,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  closeButtonBlur: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 15,
  },
  contentBlur: {
    padding: 32,
  },
  messageContainer: {
    alignItems: "center",
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 165, 0, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "rgba(255, 165, 0, 0.3)",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.95)",
    textAlign: "center",
    marginBottom: 12,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  actionButton: {
    width: "100%",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  primaryButton: {
    backgroundColor: "rgba(34, 197, 94, 0.3)",
    borderColor: "rgba(34, 197, 94, 0.5)",
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  secondaryButton: {
    backgroundColor: "rgba(156, 163, 175, 0.2)",
    borderColor: "rgba(156, 163, 175, 0.4)",
  },
  buttonBlur: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 12,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.95)",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.8)",
  },
  footerText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
    lineHeight: 16,
    marginTop: 8,
  },
});

export default ReSignInModal;
