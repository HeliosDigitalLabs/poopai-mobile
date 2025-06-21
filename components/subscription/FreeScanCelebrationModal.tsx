import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

interface FreeScanCelebrationModalProps {
  visible: boolean;
  onClose: () => void;
  previousCount: number;
  newCount: number;
}

const { width, height } = Dimensions.get("window");

export default function FreeScanCelebrationModal({
  visible,
  onClose,
  previousCount,
  newCount,
}: FreeScanCelebrationModalProps) {
  const [showCounter, setShowCounter] = useState(false);
  const [currentDisplayCount, setCurrentDisplayCount] = useState(previousCount);

  // Animation values
  const modalOpacity = useRef(new Animated.Value(0)).current;
  const modalScale = useRef(new Animated.Value(0.8)).current;
  const counterScale = useRef(new Animated.Value(1)).current;
  const counterOpacity = useRef(new Animated.Value(0)).current;
  const celebrationScale = useRef(new Animated.Value(0)).current;

  // Confetti animation values
  const [confetti, setConfetti] = useState<
    Array<{
      id: number;
      x: Animated.Value;
      y: Animated.Value;
      rotation: Animated.Value;
      opacity: Animated.Value;
      color: string;
      size: number;
    }>
  >([]);

  // Reset animations when modal becomes visible
  useEffect(() => {
    if (visible) {
      setCurrentDisplayCount(previousCount);
      setShowCounter(false);

      // Reset all animations
      modalOpacity.setValue(0);
      modalScale.setValue(0.8);
      counterScale.setValue(1);
      counterOpacity.setValue(0);
      celebrationScale.setValue(0);

      // Start modal entrance animation
      Animated.parallel([
        Animated.timing(modalOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(modalScale, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Show counter after modal is visible
        setShowCounter(true);

        // Fade in counter
        Animated.timing(counterOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          // Start counter animation after a brief delay
          setTimeout(() => {
            animateCounter();
          }, 500);
        });
      });
    }
  }, [visible]);

  const animateCounter = () => {
    // Animate counter increase with bouncy effect
    Animated.sequence([
      // Scale up
      Animated.spring(counterScale, {
        toValue: 1.3,
        tension: 100,
        friction: 6,
        useNativeDriver: true,
      }),
      // Scale back to normal
      Animated.spring(counterScale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Update the displayed number
    setTimeout(() => {
      setCurrentDisplayCount(newCount);

      // Start confetti celebration
      setTimeout(() => {
        generateConfetti();
        animateCelebration();
      }, 200);
    }, 300);
  };

  const generateConfetti = () => {
    const colors = [
      "#FFD700",
      "#FF6B35",
      "#4ECDC4",
      "#45B7D1",
      "#96CEB4",
      "#FFEAA7",
    ];
    const newConfetti = [];

    for (let i = 0; i < 15; i++) {
      const startX = Math.random() * width;
      const startY = -50;

      const confettiPiece = {
        id: i,
        x: new Animated.Value(startX),
        y: new Animated.Value(startY),
        rotation: new Animated.Value(0),
        opacity: new Animated.Value(1),
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 6 + Math.random() * 4, // 6-10px
      };

      // Animate confetti falling
      Animated.parallel([
        Animated.timing(confettiPiece.y, {
          toValue: startY + height + 100,
          duration: 3000 + Math.random() * 2000, // 3-5 seconds
          useNativeDriver: true,
        }),
        Animated.timing(confettiPiece.x, {
          toValue: startX + (Math.random() - 0.5) * 100, // Add some horizontal drift
          duration: 3000 + Math.random() * 2000,
          useNativeDriver: true,
        }),
        Animated.timing(confettiPiece.rotation, {
          toValue: 360 + Math.random() * 720, // 1-3 full rotations
          duration: 3000 + Math.random() * 2000,
          useNativeDriver: true,
        }),
        Animated.timing(confettiPiece.opacity, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ]).start();

      newConfetti.push(confettiPiece);
    }

    setConfetti(newConfetti);

    // Clean up confetti after animation
    setTimeout(() => {
      setConfetti([]);
    }, 6000);
  };

  const animateCelebration = () => {
    // Celebration text animation
    Animated.sequence([
      Animated.spring(celebrationScale, {
        toValue: 1,
        tension: 100,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(celebrationScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(celebrationScale, {
        toValue: 1,
        tension: 150,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(modalOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(modalScale, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <BlurView intensity={80} style={styles.overlay}>
        {/* Confetti */}
        {confetti.map((piece) => (
          <Animated.View
            key={piece.id}
            style={[
              styles.confettiPiece,
              {
                backgroundColor: piece.color,
                width: piece.size,
                height: piece.size,
                opacity: piece.opacity,
                transform: [
                  { translateX: piece.x },
                  { translateY: piece.y },
                  {
                    rotate: piece.rotation.interpolate({
                      inputRange: [0, 360],
                      outputRange: ["0deg", "360deg"],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}

        {/* Modal Content */}
        <Animated.View
          style={[
            styles.modalContainer,
            {
              opacity: modalOpacity,
              transform: [{ scale: modalScale }],
            },
          ]}
        >
          <LinearGradient
            colors={["rgba(255, 255, 255, 0.9)", "rgba(255, 255, 255, 0.8)"]}
            style={styles.modalContent}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>🎉 Free Scan Earned!</Text>
              <Text style={styles.subtitle}>Enjoy your bonus scan</Text>
            </View>

            {/* Counter Display */}
            {showCounter && (
              <Animated.View
                style={[
                  styles.counterContainer,
                  {
                    opacity: counterOpacity,
                    transform: [{ scale: counterScale }],
                  },
                ]}
              >
                <Text style={styles.counterLabel}>Scans Available</Text>
                <View style={styles.counterBadge}>
                  <Text style={styles.counterNumber}>
                    {currentDisplayCount}
                  </Text>
                </View>
              </Animated.View>
            )}

            {/* Celebration Message */}
            <Animated.View
              style={[
                styles.celebrationContainer,
                {
                  transform: [{ scale: celebrationScale }],
                },
              ]}
            >
              <Text style={styles.celebrationText}>
                You now have {newCount} scan{newCount !== 1 ? "s" : ""}{" "}
                available!
              </Text>
            </Animated.View>

            {/* Close Button */}
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <LinearGradient
                colors={["#4ECDC4", "#44A08D"]}
                style={styles.closeButtonGradient}
              >
                <Text style={styles.closeButtonText}>Awesome!</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: width * 0.85,
    maxWidth: 350,
  },
  modalContent: {
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2D3748",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#718096",
    textAlign: "center",
  },
  counterContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  counterLabel: {
    fontSize: 14,
    color: "#718096",
    marginBottom: 8,
    fontWeight: "600",
  },
  counterBadge: {
    backgroundColor: "#4ECDC4",
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#4ECDC4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  counterNumber: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    minWidth: 40,
  },
  celebrationContainer: {
    marginBottom: 24,
  },
  celebrationText: {
    fontSize: 16,
    color: "#2D3748",
    textAlign: "center",
    fontWeight: "500",
  },
  closeButton: {
    width: "100%",
  },
  closeButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  confettiPiece: {
    position: "absolute",
    borderRadius: 2,
  },
});
