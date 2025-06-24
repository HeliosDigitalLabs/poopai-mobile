import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { BlurView } from "expo-blur";

const { width: screenWidth } = Dimensions.get("window");

interface BlurOnboardingModalProps {
  visible: boolean;
  onSelect: (blur: boolean) => void;
}

export default function BlurOnboardingModal({
  visible,
  onSelect,
}: BlurOnboardingModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.modalContainer}>
            <BlurView intensity={80} tint="light" style={styles.contentBlur}>
              <Text style={styles.title}>Blur photos by default?</Text>
              <Text style={styles.subtitle}>
                You can always change this later in Settings.
              </Text>
              <View style={styles.buttonCol}>
                <TouchableOpacity
                  style={[styles.button, styles.yesButton]}
                  onPress={() => onSelect(true)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.yesButtonText}>Yes, blur by default</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.noButton]}
                  onPress={() => onSelect(false)}
                  activeOpacity={0.85}
                >
                  <BlurView
                    intensity={40}
                    tint="light"
                    style={styles.noButtonBlur}
                  >
                    <Text style={styles.noButtonText}>No, don't blur</Text>
                  </BlurView>
                </TouchableOpacity>
              </View>
            </BlurView>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  safeArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  modalContainer: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 15,
    paddingHorizontal: 0,
  },
  contentBlur: {
    padding: 32,
    alignItems: "center",
    borderRadius: 28,
    width: "100%",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "rgba(255, 255, 255, 0.95)",
    textAlign: "center",
    marginBottom: 8,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },
  buttonCol: {
    flexDirection: "column",
    gap: 16,
    width: "100%",
    marginTop: 8,
  },
  button: {
    width: "100%",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 0,
    overflow: "hidden",
  },
  yesButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    paddingVertical: 18,
    marginBottom: 0,
  },
  noButton: {
    backgroundColor: "transparent",
    borderWidth: 0,
    paddingVertical: 0,
    marginBottom: 0,
  },
  noButtonBlur: {
    width: "100%",
    paddingVertical: 18,
    borderRadius: 14,
    backgroundColor: "rgba(37,99,235,0.85)",
    borderWidth: 2,
    borderColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },
  yesButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
    textShadowColor: "rgba(59, 130, 246, 0.8)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  noButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 18,
    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
