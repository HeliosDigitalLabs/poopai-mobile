import React, { useEffect, useState } from "react";
import { View, Text, Image, Animated } from "react-native";
import { SvgXml } from "react-native-svg";

// Import SVG and PNG assets
import PoopMeterSvg from "../../assets/poop_meter.svg";

interface PoopMeterAnimationProps {
  targetScore: number;
  onAnimationComplete: () => void;
}

export default function PoopMeterAnimation({
  targetScore,
  onAnimationComplete,
}: PoopMeterAnimationProps) {
  const [currentScore, setCurrentScore] = useState(0);
  const [currentFillPercentage, setCurrentFillPercentage] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [fireworks, setFireworks] = useState<
    Array<{
      id: number;
      x: number;
      y: number;
      opacity: Animated.Value;
      scale: Animated.Value;
    }>
  >([]);

  const scaleAnim = useState(new Animated.Value(0))[0]; // Start at scale 0
  const scoreScaleAnim = useState(new Animated.Value(1))[0]; // For subtle growth during scoring
  const celebrationBounceAnim = useState(new Animated.Value(1))[0]; // For end celebration
  const disappointmentSinkAnim = useState(new Animated.Value(1))[0]; // For low scores
  const meterSpinRotate = useState(new Animated.Value(0))[0]; // For spin animation
  const meterFadeOut = useState(new Animated.Value(1))[0]; // For fade out animation

  useEffect(() => {
    // Ensure we start at 0, then animate with overshoot effect
    scaleAnim.setValue(0); // Explicitly set to 0 first

    // Start the spring animation
    Animated.sequence([
      // Stage 1: Fast spring
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 135,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    startScoreAnimation();
  }, []);

  const startScoreAnimation = () => {
    // Dynamic duration based on score
    // Max score (10) = 10 seconds, with 0.5 second minimum
    const maxDuration = 5000; // 10 seconds in milliseconds
    const minDuration = 500; // 0.5 seconds in milliseconds
    const scorePercentage = targetScore / 10; // Convert to percentage (0-1)
    const duration =
      minDuration + scorePercentage * (maxDuration - minDuration);

    const totalSteps = 250; // Total animation steps

    const scoreIncrement = targetScore / totalSteps;
    const fillIncrement = ((targetScore / 10) * 100) / totalSteps;
    const stepDuration = duration / totalSteps;

    let step = 0;

    // Animate subtle scale growth during score counting (1.0 to 1.05)
    Animated.timing(scoreScaleAnim, {
      toValue: 1.05,
      duration: duration,
      useNativeDriver: true,
    }).start();

    // Ease-in-out function (cubic ease-in-out curve)
    const easeInOut = (t: number): number => {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    // Single timer for both animations to ensure perfect sync
    const timer = setInterval(() => {
      step++;

      // Calculate progress (0 to 1)
      const linearProgress = step / totalSteps;

      // Apply ease-in-out curve to the progress
      const easedProgress = easeInOut(linearProgress);

      // Update score (but only every few steps to make it more readable)
      if (step % 3 === 0 || step >= totalSteps) {
        const newScore = Math.min(targetScore * easedProgress, targetScore);
        setCurrentScore(newScore);
      }

      // Update fill (every step for smoothness)
      const newFillPercentage = Math.min(
        (targetScore / 10) * 100 * easedProgress,
        (targetScore / 10) * 100
      );
      setCurrentFillPercentage(newFillPercentage);

      if (step >= totalSteps) {
        clearInterval(timer);
        // Trigger end animation based on score
        triggerEndAnimation();
      }
    }, stepDuration);

    return () => clearInterval(timer);
  };

  const triggerEndAnimation = () => {
    // Determine animation type based on score
    if (targetScore >= 7.5) {
      // High score: Fireworks celebration
      triggerCelebration();
    } else if (targetScore >= 5.0) {
      // Medium score: Gentle bounce
      triggerMediumCelebration();
    } else {
      // Low score: Disappointed sink
      triggerDisappointment();
    }

    // After celebration, spin and fade out the meter
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(meterSpinRotate, {
          toValue: 1, // 360 degrees
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(meterFadeOut, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();

      onAnimationComplete();
    }, 1000); // Start spin/fade after celebration
  };

  const triggerCelebration = () => {
    setShowCelebration(true);

    // Bounce animation for the meter
    Animated.sequence([
      Animated.spring(celebrationBounceAnim, {
        toValue: 1.15,
        tension: 300,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.spring(celebrationBounceAnim, {
        toValue: 1.0,
        tension: 200,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Create fireworks
    createFireworks();
  };

  const triggerMediumCelebration = () => {
    // Gentle bounce for medium scores
    Animated.spring(celebrationBounceAnim, {
      toValue: 1.08,
      tension: 150,
      friction: 6,
      useNativeDriver: true,
    }).start(() => {
      Animated.spring(celebrationBounceAnim, {
        toValue: 1.0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();
    });
  };

  const triggerDisappointment = () => {
    // Sink animation for low scores
    Animated.sequence([
      Animated.timing(disappointmentSinkAnim, {
        toValue: 0.95,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(disappointmentSinkAnim, {
        toValue: 1.0,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const createFireworks = () => {
    const numFireworks = 6 + Math.floor(Math.random() * 4); // 6-9 fireworks
    const newFireworks: Array<{
      id: number;
      x: number;
      y: number;
      opacity: Animated.Value;
      scale: Animated.Value;
    }> = [];

    for (let i = 0; i < numFireworks; i++) {
      const firework = {
        id: Date.now() + i,
        x: -100 + Math.random() * 400, // Random x position
        y: -50 + Math.random() * 200, // Random y position
        opacity: new Animated.Value(0),
        scale: new Animated.Value(0),
      };

      newFireworks.push(firework);

      // Animate each firework with staggered delay
      const delay = i * 150 + Math.random() * 200;

      setTimeout(() => {
        Animated.parallel([
          Animated.sequence([
            Animated.timing(firework.opacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(firework.opacity, {
              toValue: 0,
              duration: 800,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.spring(firework.scale, {
              toValue: 1.5,
              tension: 100,
              friction: 3,
              useNativeDriver: true,
            }),
            Animated.timing(firework.scale, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
        ]).start();
      }, delay);

      // Clean up firework after animation
      setTimeout(() => {
        setFireworks((prev) => prev.filter((f) => f.id !== firework.id));
      }, delay + 1200);
    }

    setFireworks((prev) => [...prev, ...newFireworks]);
  };

  // Calculate fill color based on fill percentage (red to green)
  const getScoreColor = (fillPercentage: number): string => {
    const percentage = Math.min(fillPercentage / 100, 1);
    const red = Math.round(255 * (1 - percentage));
    const green = Math.round(255 * percentage);
    return `rgb(${red}, ${green}, 0)`;
  };

  const fillColor = getScoreColor(currentFillPercentage);

  return (
    <Animated.View
      className="items-center justify-center"
      style={{
        transform: [
          { scale: scaleAnim },
          { scale: scoreScaleAnim },
          { scale: celebrationBounceAnim },
          { scale: disappointmentSinkAnim },
          {
            rotate: meterSpinRotate.interpolate({
              inputRange: [0, 1],
              outputRange: ["0deg", "360deg"],
            }),
          },
        ],
        opacity: meterFadeOut,
      }}
    >
      {/* Fireworks overlay */}
      {showCelebration &&
        fireworks.map((firework) => (
          <Animated.View
            key={firework.id}
            style={{
              position: "absolute",
              left: firework.x,
              top: firework.y,
              width: 20,
              height: 20,
              opacity: firework.opacity,
              transform: [{ scale: firework.scale }],
              zIndex: 10,
            }}
          >
            <View
              style={{
                width: 20,
                height: 20,
                backgroundColor: "#FFD700",
                borderRadius: 10,
                shadowColor: "#FFD700",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 5,
                elevation: 10,
              }}
            />
            {/* Add some sparkle lines */}
            <View style={{ position: "absolute", left: 8, top: 8 }}>
              <View
                style={{
                  width: 4,
                  height: 4,
                  backgroundColor: "#FFF",
                  borderRadius: 2,
                  position: "absolute",
                  left: -15,
                  top: -2,
                }}
              />
              <View
                style={{
                  width: 4,
                  height: 4,
                  backgroundColor: "#FFF",
                  borderRadius: 2,
                  position: "absolute",
                  left: 15,
                  top: -2,
                }}
              />
              <View
                style={{
                  width: 4,
                  height: 4,
                  backgroundColor: "#FFF",
                  borderRadius: 2,
                  position: "absolute",
                  left: -2,
                  top: -15,
                }}
              />
              <View
                style={{
                  width: 4,
                  height: 4,
                  backgroundColor: "#FFF",
                  borderRadius: 2,
                  position: "absolute",
                  left: -2,
                  top: 15,
                }}
              />
            </View>
          </Animated.View>
        ))}

      {/* Main meter container */}
      <View className="relative" style={{ width: 200, height: 200 }}>
        {/* Fill image (cropped from bottom) */}
        <View
          className="absolute bottom-0 left-0 right-0 overflow-hidden"
          style={{
            height: `${currentFillPercentage}%`,
          }}
        >
          <Image
            source={require("../../assets/poop_meter_fill.png")}
            style={{
              width: 200,
              height: 200,
              position: "absolute",
              bottom: 0,
              tintColor: fillColor,
            }}
            resizeMode="contain"
          />
        </View>

        {/* SVG overlay */}
        <View className="absolute inset-0">
          <PoopMeterSvg width={200} height={200} />
        </View>
      </View>

      {/* Score display */}
      <View className="mt-6 items-center">
        <Text className="text-6xl font-bold text-white drop-shadow-2xl">
          {currentScore.toFixed(1)}
        </Text>
        <Text className="text-xl font-semibold text-white/90 drop-shadow-lg">
          / 10
        </Text>
      </View>
    </Animated.View>
  );
}
