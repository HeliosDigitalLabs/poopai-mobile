import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  Animated,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Camera, FlashMode } from "expo-camera";
import { BlurView } from "expo-blur";
import { RootStackParamList } from "../../types/navigation";
import { analyzeImage } from "../../services/analysis/analysisService";
import { AppConfig } from "../../config/app.config";
import ScanInstructions from "../../components/camera/ScanInstructions";
import CameraView from "../../components/camera/CameraView";
import ScanOverlay from "../../components/camera/ScanOverlay";
import AnalyzingOverlay from "../../components/analysis/AnalyzingOverlay";
import ScanCounterOverlay from "../../components/analysis/ScanCounterOverlay";
import CameraLoadingOverlay from "../../components/camera/CameraLoadingOverlay";
import HomeButton from "../../components/navigation/HomeButton";
import CameraScanCounter from "../../components/camera/CameraScanCounter";
import CameraWarningPill from "../../components/camera/CameraWarningPill";
import AnalyzeButton from "../../components/camera/AnalyzeButton";
import RetryButton from "../../components/camera/RetryButton";
import AnalyzePrompt from "../../components/camera/AnalyzePrompt";
import { useAuth } from "../../context/auth/AuthContext";
import { useScan } from "../../context/features/ScanContext";
import { useDimensions } from "../../context/core/DimensionsContext";
import { logEvent } from "../../lib/analytics";
import {
  SCAN_STARTED,
  PIC_TAKEN,
  SCAN_SUBMITTED,
  SCAN_FAILED,
} from "../../lib/analyticsEvents";

// Import SVGs - keeping for now but will remove AnalyzePromptSvg
import AnalyzePromptSvg from "../../assets/analyze_prompt.svg";

type CameraScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Camera"
>;

interface CameraState {
  hasPermission: boolean;
  isReady: boolean;
  capturedPhoto: string | null;
  isScanning: boolean;
  isAnalyzing: boolean;
  showPreview: boolean;
  showScanCounter: boolean;
}

export default function CameraScreen() {
  const navigation = useNavigation<CameraScreenNavigationProp>();
  const { isAuthenticated, setShowAuthOverlay } = useAuth();
  const { scansLeft, isPremium } = useScan();
  const { screenHeight, screenWidth } = useDimensions();
  const resultsOpacity = useRef(new Animated.Value(0)).current;
  const controlsScaleAnim = useRef(new Animated.Value(0)).current;

  // Track when camera screen is opened
  useEffect(() => {
    logEvent(SCAN_STARTED);
  }, []);

  const [cameraState, setCameraState] = useState<CameraState>({
    hasPermission: false,
    isReady: false,
    capturedPhoto: null,
    isScanning: false,
    isAnalyzing: false,
    showPreview: false,
    showScanCounter: false,
  });

  // Add camera warming state to reduce black screen
  const [cameraWarmedUp, setCameraWarmedUp] = useState(false);

  useEffect(() => {
    // Check permission immediately on mount for faster initialization
    const checkPermissionAndInit = async () => {
      try {
        // First check if we already have permission without requesting
        const { status } = await Camera.getCameraPermissionsAsync();

        if (status === "granted") {
          setCameraState((prev) => ({
            ...prev,
            hasPermission: true,
            isReady: true,
          }));

          // Warm up camera to reduce initialization delay
          setTimeout(() => {
            setCameraWarmedUp(true);
          }, 1000); // Reduced to 1 second - animation shows but doesn't overstay
        } else {
          // Only request if we don't have permission
          requestCameraPermission();
        }
      } catch (error) {
        console.error("Error checking camera permission:", error);
        requestCameraPermission();
      }
    };

    checkPermissionAndInit();
  }, []);

  const requestCameraPermission = async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      const granted = status === "granted";

      setCameraState((prev) => ({
        ...prev,
        hasPermission: granted,
        isReady: granted,
      }));

      if (!granted) {
        Alert.alert("Permission Denied", "Camera access is required to scan.");
      }
    } catch (error) {
      Alert.alert("Camera Error", "Unable to request camera permission");
    }
  };

  const handleCapture = (photoUri: string) => {
    if (!cameraState.isReady) return;

    // Track picture taken
    logEvent(PIC_TAKEN);

    setCameraState((prev) => ({
      ...prev,
      capturedPhoto: photoUri,
      showPreview: true,
    }));

    // Animate the controls appearing with scale-up effect
    Animated.spring(controlsScaleAnim, {
      toValue: 1,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const handleRetake = () => {
    // Reset animation
    controlsScaleAnim.setValue(0);

    setCameraState((prev) => ({
      ...prev,
      capturedPhoto: null,
      showPreview: false,
    }));
  };

  const performAnalysis = async () => {
    if (!cameraState.capturedPhoto) {
      console.error("❌ No captured photo to analyze");
      return;
    }

    // Track scan submission
    logEvent(SCAN_SUBMITTED);

    try {
      // Show analyzing animation
      setCameraState((prev) => ({
        ...prev,
        isAnalyzing: true,
        showScanCounter: false,
      }));

      // Perform the actual analysis (or mock analysis in development mode)
      const analysisData = await analyzeImage(cameraState.capturedPhoto);

      console.log("✅ Analysis completed, checking results...");

      // Check if no poop was detected (bristolType 0 indicates no poop found)
      if (
        analysisData.bristolType === 0 &&
        analysisData.poopSummary === "Image does not appear to contain poop."
      ) {
        console.log("❌ No poop detected, navigating to error screen...");

        // Track scan failure
        logEvent(SCAN_FAILED, {
          reason: "no-poop-detected",
        });

        // Navigate to NoPoopDetected screen with the photo
        navigation.navigate("NoPoopDetected", {
          photo: cameraState.capturedPhoto,
        });
      } else {
        console.log("✅ Poop detected, navigating to results...");

        // Navigate to Results screen with both photo and analysis data
        navigation.navigate("Results", {
          photo: cameraState.capturedPhoto,
          analysisData: analysisData,
        });
      }
    } catch (error) {
      console.error("❌ Analysis failed:", error);

      // Track scan failure
      logEvent(SCAN_FAILED, {
        reason: "analysis-error",
      });

      // Hide analyzing animation and scan counter
      setCameraState((prev) => ({
        ...prev,
        isAnalyzing: false,
        showScanCounter: false,
      }));

      // Check if this is a user-friendly error from image compression
      const isCompressionError =
        error instanceof Error &&
        error.message.includes("There was an issue processing your image");

      // Show appropriate error alert
      Alert.alert(
        isCompressionError ? "Image Processing Error" : "Analysis Failed",
        isCompressionError
          ? error.message
          : AppConfig.isDevelopmentMode
            ? "Mock analysis failed. Please try again."
            : "Unable to analyze image. Please check your internet connection and try again.",
        [
          {
            text: "Try Again",
            onPress: () => console.log("User chose to try again"),
          },
          { text: "Cancel", style: "cancel" },
        ]
      );
    }
  };

  const handleScanCounterComplete = () => {
    // When scan counter animation completes, start the analysis
    performAnalysis();
  };

  const handleUsePicture = async () => {
    if (!cameraState.capturedPhoto) return;

    // Check scan availability for non-premium users
    if (!isPremium && scansLeft <= 0) {
      console.log("🚫 No scans left, redirecting to payment screen...");

      // Navigate to scan credits payment screen instead of analyzing
      navigation.navigate("Payment", {
        noScreen: "Camera",
        type: "premium-subscription",
        preselection: "annual",
        freeTrial: false,
      });
      return;
    }

    console.log("🚀 Starting image analysis process...");
    console.log(
      "Development mode:",
      AppConfig.isDevelopmentMode ? "ON" : "OFF"
    );
    console.log(
      "Premium user:",
      isPremium ? "YES (unlimited scans)" : `NO (${scansLeft} scans left)`
    );

    // Show scan counter animation first (only for non-premium users)
    if (!isPremium) {
      setCameraState((prev) => ({ ...prev, showScanCounter: true }));
      return; // The scan counter will trigger the analyzing animation when complete
    } else {
      // For premium users, go directly to analyzing
      performAnalysis();
    }
  };

  const handleScanAgain = () => {
    // Reset results opacity and controls animation
    resultsOpacity.setValue(0);
    controlsScaleAnim.setValue(0);

    setCameraState({
      hasPermission: true,
      isReady: true,
      capturedPhoto: null,
      isScanning: false,
      isAnalyzing: false,
      showPreview: false,
      showScanCounter: false,
    });
  };

  const handleGoHome = () => {
    navigation.navigate("Home");
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleScanCounterPress = () => {
    // Navigate to payment screen focused on getting more scan credits
    navigation.navigate("Payment", {
      noScreen: "Camera",
      type: "premium-subscription",
      preselection: "monthly",
      freeTrial: false,
    });
  };

  if (!cameraState.hasPermission) {
    return (
      <View className="flex-1 bg-transparent items-center justify-center px-8">
        <View className="bg-gray-800 rounded-2xl p-8 border border-gray-700 max-w-sm w-full">
          <View className="items-center mb-6">
            <View className="w-16 h-16 bg-blue-600/20 rounded-full items-center justify-center mb-4">
              <Text className="text-blue-400 text-2xl">📷</Text>
            </View>
            <Text className="text-white text-xl font-light text-center mb-2">
              Camera Access Required
            </Text>
            <Text className="text-gray-400 text-sm text-center leading-relaxed">
              We need camera permission to capture and analyze your samples
              securely
            </Text>
          </View>

          <TouchableOpacity
            className="bg-blue-600 py-4 rounded-xl border border-blue-500"
            onPress={requestCameraPermission}
          >
            <Text className="text-white font-medium text-center tracking-wide">
              Enable Camera
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="mt-3 py-3" onPress={handleGoBack}>
            <Text className="text-gray-400 text-center font-light">
              Return Home
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      {/* Home button - Hide during analyzing and scan counter animations */}
      {!cameraState.isAnalyzing && !cameraState.showScanCounter && (
        <View
          style={{
            position: "absolute",
            top: 10,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
            pointerEvents: "box-none",
          }}
        >
          <HomeButton size={49} />
        </View>
      )}

      {/* Camera or Photo Preview */}
      {cameraState.showPreview && cameraState.capturedPhoto ? (
        <View className="flex-1">
          {/* Full-screen photo preview */}
          <Image
            source={{ uri: cameraState.capturedPhoto }}
            className="flex-1"
            resizeMode="cover"
          />

          {/* Photo confirmation controls - hide when analyzing or showing scan counter */}
          {!cameraState.isAnalyzing && !cameraState.showScanCounter && (
            <>
              {/* Analyze Prompt with PoopBot - Moved higher and centered */}
              <Animated.View
                style={{
                  position: "absolute",
                  bottom: screenHeight * 0.175, // Moved down from 0.2 to 0.15
                  left: 0,
                  right: 0, // Add right: 0 to take full width
                  alignItems: "center", // Center the prompt
                }}
              >
                <AnalyzePrompt isVisible={true} scale={controlsScaleAnim} />
              </Animated.View>

              {/* Analyze Button - Full width at bottom */}
              <Animated.View
                style={{
                  position: "absolute",
                  bottom: screenHeight * 0.05,
                  left: screenWidth * 0.08, // Padding from left
                  right: screenWidth * 0.08, // Padding from right
                }}
              >
                <AnalyzeButton
                  onPress={handleUsePicture}
                  scale={controlsScaleAnim}
                  fullWidth={true} // We'll need to add this prop
                />
              </Animated.View>

              {/* Retry Button - Top right */}
              <Animated.View
                style={{
                  position: "absolute",
                  top: screenHeight * 0.06,
                  right: screenWidth * 0.08,
                }}
              >
                <RetryButton onPress={handleRetake} scale={controlsScaleAnim} />
              </Animated.View>
            </>
          )}
        </View>
      ) : (
        <>
          {/* Camera View */}
          <CameraView
            onCapture={handleCapture}
            isReady={cameraState.isReady}
            isCameraWarmed={cameraWarmedUp}
          />

          {/* Scan Counter - positioned lower from top */}
          <View
            style={{
              position: "absolute",
              top: 45,
              left: 0,
              right: 0,
              zIndex: 10,
            }}
          >
            <CameraScanCounter
              onPress={handleScanCounterPress}
              hasPremium={isPremium}
            />
          </View>

          {/* Camera Loading Overlay - Shows while camera is initializing */}
          <CameraLoadingOverlay isLoading={!cameraWarmedUp} />

          {/* Instructions Overlay */}
          <ScanInstructions
            isVisible={!cameraState.isScanning && cameraWarmedUp}
          />

          {/* Warning Pill - Shows when camera is ready and not scanning */}
          <CameraWarningPill
            isVisible={
              !cameraState.isScanning &&
              !cameraState.isAnalyzing &&
              cameraWarmedUp
            }
          />
        </>
      )}

      {/* Scanning Overlay */}
      <ScanOverlay isScanning={cameraState.isScanning} />

      {/* Analyzing Overlay */}
      <AnalyzingOverlay isAnalyzing={cameraState.isAnalyzing} />

      {/* Scan Counter Overlay */}
      <ScanCounterOverlay
        isVisible={cameraState.showScanCounter}
        initialScansLeft={scansLeft}
        onAnimationComplete={handleScanCounterComplete}
      />
    </View>
  );
}
