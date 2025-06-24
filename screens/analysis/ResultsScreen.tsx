import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ImageBackground,
  ScrollView,
  Alert,
  Animated,
  Easing,
<<<<<<< HEAD
  Modal,
=======
>>>>>>> 5a9bbd588055ef2a2b282113038f674c9f6c7304
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { LinearGradient } from "expo-linear-gradient";
<<<<<<< HEAD
import { BlurView } from "expo-blur";
=======
>>>>>>> 5a9bbd588055ef2a2b282113038f674c9f6c7304
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import * as StoreReview from "expo-store-review";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RootStackParamList } from "../../types/navigation";
import { AppConfig } from "../../config/app.config";
import { AnalysisData } from "../../types/api";
import PrimaryButton from "../../components/ui/PrimaryButton";
import BlurToggleButton from "../../components/ui/BlurToggleButton";
import LearnMoreButton from "../../components/ui/LearnMoreButton";
<<<<<<< HEAD
import DeleteConfirmationModal from "../../components/ui/DeleteConfirmationModal";
=======
>>>>>>> 5a9bbd588055ef2a2b282113038f674c9f6c7304
import AnalyzePrompt from "../../components/camera/AnalyzePrompt";
import PoopMeterAnimation from "../../components/analysis/PoopMeterAnimation";
// REMOVED: SaveResultsPopup import - no longer showing auth nudges
// import SaveResultsPopup from "../../components/analysis/SaveResultsPopup";
import BristolTypeBadge from "../../components/analysis/BristolTypeBadge";
import { useAuth } from "../../context/auth/AuthContext";
import { useScan } from "../../context/features/ScanContext";
import { useDimensions } from "../../context/core/DimensionsContext";
import ResultsPoopbotPrompt from "../../components/analysis/ResultsPoopbotPrompt";
<<<<<<< HEAD
import { useBlur } from "../../context/features/BlurContext";
=======
import { logEvent } from "../../lib/analytics";
import {
  SHARE_CLICKED,
  SHARE_COMPLETED,
  LEARN_MORE_OPENED,
  LEARN_MORE_TIME_SPENT,
  SCAN_SUBMITTED,
} from "../../lib/analyticsEvents";
>>>>>>> 5a9bbd588055ef2a2b282113038f674c9f6c7304

// Import SVG assets
import HomeSvg from "../../assets/home.svg";
import CameraSvg from "../../assets/camera.svg";
import ShareSvg from "../../assets/share.svg";
import { Ionicons } from "@expo/vector-icons";

type ResultsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Results"
>;
type ResultsScreenRouteProp = RouteProp<RootStackParamList, "Results">;

export default function ResultsScreen() {
  const navigation = useNavigation<ResultsScreenNavigationProp>();
  const route = useRoute<ResultsScreenRouteProp>();
  const { user, refreshUserData } = useAuth();
  const { incrementScanCount, totalScansPerformed } = useScan();
  const { screenHeight, screenWidth } = useDimensions();
<<<<<<< HEAD
  const { blurByDefault } = useBlur();
=======
>>>>>>> 5a9bbd588055ef2a2b282113038f674c9f6c7304

  // Calculate dynamic score size - 5% of screen height
  const scoreFontSize = Math.round(screenHeight * 0.05);
  const maxScoreFontSize = Math.round(screenHeight * 0.025); // 2.5% for the max score text
  const scoreTitleFontSize = Math.round(screenHeight * 0.0115); // 1.5% for the "Poop Score:" title

  // Calculate dynamic badge positioning - based on screen dimensions
  const badgeTopPosition = Math.round(screenHeight * 0.06); // 0.5% of screen height
  const badgeRightPosition = Math.round(screenWidth * 0.01); // 2% of screen width

  // Calculate dynamic score padding - 0.25% of screen width
  const scorePaddingLeft = Math.round(screenWidth * 0.01);

  // Ref to track if scan has been counted to avoid double counting
  const scanCountedRef = useRef(false);

  // State for blur toggle
<<<<<<< HEAD
  const [isBlurred, setIsBlurred] = useState(blurByDefault);
=======
  const [isBlurred, setIsBlurred] = useState(false);
>>>>>>> 5a9bbd588055ef2a2b282113038f674c9f6c7304
  // State to control animation flow
  const [showMeterAnimation, setShowMeterAnimation] = useState(true);
  const [showCardMode, setShowCardMode] = useState(false);
  // State for sharing
  const [isSharing, setIsSharing] = useState(false);
  const [hideUIForShare, setHideUIForShare] = useState(false);
  // State for expanded mode
  const [isExpanded, setIsExpanded] = useState(false);
  // State for button text (changes immediately on click)
  const [buttonShowsCollapse, setButtonShowsCollapse] = useState(false);
<<<<<<< HEAD
  // State for delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  // State for delete operation
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
=======
  // State for learn more time tracking
  const learnMoreStartTime = useRef<number | null>(null);
>>>>>>> 5a9bbd588055ef2a2b282113038f674c9f6c7304
  // REMOVED: Auth popup state and timer - no longer showing auth nudges
  // const [showAuthPopup, setShowAuthPopup] = useState(false);
  // const authPopupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // App Store Review popup state and timer
  const [reviewPopupShown, setReviewPopupShown] = useState(false);
  const reviewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load review popup shown status from storage
  useEffect(() => {
    const loadReviewStatus = async () => {
      try {
        const reviewShown = await AsyncStorage.getItem("reviewPopupShown");
        if (reviewShown === "true") {
          setReviewPopupShown(true);
          console.log("⭐ Review popup already shown previously");
        }
      } catch (error) {
        console.error("⭐ Error loading review status:", error);
      }
    };
    loadReviewStatus();
  }, []);

  // Animation values for cinematic transition
  const photoScale = useRef(new Animated.Value(1)).current; // Full screen to card size
  const photoTranslateY = useRef(new Animated.Value(0)).current; // Center to card position
  const containerMarginH = useRef(new Animated.Value(0)).current; // Horizontal margin (0 to 16)
  const containerMarginT = useRef(new Animated.Value(-64)).current; // Top margin (-64 to 0)
  const containerMarginB = useRef(new Animated.Value(-150)).current; // Bottom margin (-140 to 24) - negative to expand over button area
  const containerRadius = useRef(new Animated.Value(32)).current; // Border radius (16 to 32) - increased for more rounded corners
  const containerBorderWidth = useRef(new Animated.Value(24)).current; // Border width (24 to 14)
  const containerShadow = useRef(new Animated.Value(0)).current; // Shadow opacity (0 to 0.25)
  const containerFlex = useRef(new Animated.Value(1)).current; // Flex value (1 to ~0.7 for card)
  const titleOpacity = useRef(new Animated.Value(0)).current; // Fade in title section
  const titleTranslateY = useRef(new Animated.Value(50)).current; // Move up from center
  const summaryOpacity = useRef(new Animated.Value(0)).current; // Fade in summary
  const summaryTranslateY = useRef(new Animated.Value(-50)).current; // Move down from center
  const buttonsOpacity = useRef(new Animated.Value(0)).current; // Fade in buttons
  const buttonsTranslateY = useRef(new Animated.Value(140)).current; // Move up from off-screen (140px is button height)
  // Animation values for expanded mode
  const expandedOpacity = useRef(new Animated.Value(0)).current; // Fade in expanded sections
  const expandedTranslateY = useRef(new Animated.Value(100)).current; // Start from below, move up to expand
  const drawerTranslateY = useRef(
    new Animated.Value(screenHeight * 0.35)
  ).current; // Drawer position (starts showing normal summary)
  const meterSpinRotate = useRef(new Animated.Value(0)).current; // Spin animation
  const meterFadeOut = useRef(new Animated.Value(1)).current; // Fade out animation

  // Animation values for premium card glimmer effect
  const glimmerTranslateX = useRef(new Animated.Value(-200)).current;
  const glimmerOpacity = useRef(new Animated.Value(0)).current;
  const glimmerRotate = useRef(new Animated.Value(0)).current;

  // Ref to track glimmer animation timeout for cleanup
  const glimmerTimeoutRef = useRef<number | null>(null);

  // Animation values for card floating effect
  const cardFloatY = useRef(new Animated.Value(0)).current;
  const cardFloatX = useRef(new Animated.Value(0)).current;
  const cardRotate = useRef(new Animated.Value(0)).current;

  // Animation values for blur toggle button position
  const blurToggleTop = useRef(new Animated.Value(20)).current; // Start at top left (20px from top)
  const blurToggleLeft = useRef(new Animated.Value(15)).current; // Start at 15px from left

  // Ref for capturing the actual card container
  const cardContainerRef = useRef<View>(null);

  // Mock data for development mode fallback
  const mockData: AnalysisData = {
    bristolName: "Jimmy's Smooth Sausage",
    score: 6.3,
    bristolType: 3,
    poopSummary:
      "The poop appears well-formed and consistent. Slightly darker than ideal. Suggests mild dehydration but overall excellent digestive health indicators.",
    stoolDescription:
      "Well-formed cylindrical shape with smooth surface texture. Consistent diameter throughout length.",
    hydrationJudgement:
      "Slightly darker brown coloration suggests mild dehydration. Texture appears adequately moist but could benefit from increased water intake.",
    fiberJudgement:
      "Good fiber content evident from well-formed structure. Indicates adequate dietary fiber intake supporting healthy digestion.",
    recommendation:
      "💧 Increase daily water intake to 8-10 glasses. Consider adding more leafy greens to your diet for optimal hydration and fiber balance.",
    capturedAt: new Date().toISOString(),
    maxScore: 10,
    timestamp: "May 3rd, 2024 – 3:04pm",
    photo:
      route.params?.photo ||
      "https://external-preview.redd.it/OW60BkNYFhJwsz7mMDhju55PGzPVAlDEk_3z-mUW7dQ.png?format=pjpg&auto=webp&s=81d0b339d83101f64548e7939fef6f60f77c9ad4",
  };

  // 🎯 DATA SOURCE SELECTION
  // Use analysis data from route params if available, otherwise fall back to mock data
  let analysisData: AnalysisData = route.params?.analysisData || mockData;

<<<<<<< HEAD
=======
  // Track successful scan submission when real analysis data is available
  useEffect(() => {
    if (route.params?.analysisData) {
      logEvent(SCAN_SUBMITTED, {
        poopScore: route.params.analysisData.score,
        bristolType: route.params.analysisData.bristolName,
        bristolTypeNumber: route.params.analysisData.bristolType,
        maxScore: route.params.analysisData.maxScore,
        hydrationJudgement: route.params.analysisData.hydrationJudgement,
        fiberJudgement: route.params.analysisData.fiberJudgement,
        stoolDescription: route.params.analysisData.stoolDescription,
      });
    }
  }, [route.params?.analysisData]);

>>>>>>> 5a9bbd588055ef2a2b282113038f674c9f6c7304
  // Clean up review timer on unmount
  useEffect(() => {
    return () => {
      if (reviewTimerRef.current) {
        clearTimeout(reviewTimerRef.current);
        reviewTimerRef.current = null;
      }
    };
  }, []);

  // Function to show the app store review popup
  const showReviewPopup = async () => {
    try {
      // Check if the device supports in-app reviews
      const isAvailable = await StoreReview.isAvailableAsync();

      if (isAvailable) {
        console.log("⭐ Device supports in-app reviews, requesting review");
        await StoreReview.requestReview();
        setReviewPopupShown(true);
        await AsyncStorage.setItem("reviewPopupShown", "true");
      } else {
        console.log(
          "⭐ Device doesn't support in-app reviews, showing custom alert"
        );
        // Fallback for devices that don't support in-app reviews
        Alert.alert(
          "Enjoying PoopAI? 💩✨",
          "We'd love to hear from you! Your review helps other people discover the magic of AI-powered poop analysis. Would you like to leave a review?",
          [
            {
              text: "Maybe Later",
              style: "cancel",
              onPress: async () => {
                setReviewPopupShown(true);
                await AsyncStorage.setItem("reviewPopupShown", "true");
              },
            },
            {
              text: "Leave Review ⭐",
              onPress: async () => {
                setReviewPopupShown(true);
                await AsyncStorage.setItem("reviewPopupShown", "true");
                // Try to open the store page
                const storeUrl = await StoreReview.storeUrl();
                if (storeUrl) {
                  console.log("⭐ Opening store URL:", storeUrl);
                  await StoreReview.requestReview();
                }
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error("⭐ Error showing review popup:", error);
      setReviewPopupShown(true); // Mark as shown to prevent retry
      await AsyncStorage.setItem("reviewPopupShown", "true");
    }
  };

  // Count the scan when results are first loaded (only once)
  useEffect(() => {
    if (!scanCountedRef.current && route.params?.analysisData) {
      // Only increment for successful scans (not mock data)
      console.log("📊 Incrementing scan count for completed analysis");
      incrementScanCount();
      scanCountedRef.current = true;

      // Check if this is the user's second scan (totalScansPerformed will be 1 before increment, 2 after)
      const isSecondScan = totalScansPerformed === 1;

      if (isSecondScan && !reviewPopupShown) {
        console.log(
          "⭐ Second scan detected! Will show review popup after card view is visible"
        );
        // Note: We don't start the timer here - we start it when showCardMode becomes true
      }

      // REMOVED: Auth modal nudge for 2nd/3rd scan - no longer showing authentication prompts
      // The logic previously checked for 2nd or 3rd scan (totalScansPerformed === 1 or 2) and
      // showed a 5-second timer that would prompt unauthenticated users to create an account.
      // This has been removed to provide a cleaner user experience.
    }
  }, [
    route.params?.analysisData,
    incrementScanCount,
    totalScansPerformed,
    navigation,
    user,
  ]);

  // Show review popup 2 seconds after card mode becomes visible (only on second scan)
  useEffect(() => {
    if (showCardMode && route.params?.analysisData && !reviewPopupShown) {
      const isSecondScan = totalScansPerformed === 2; // After increment, second scan shows totalScansPerformed = 2

      console.log(
        `⭐ Card mode is visible. Total scans: ${totalScansPerformed}, Is second scan: ${isSecondScan}, Review shown: ${reviewPopupShown}`
      );

      if (isSecondScan) {
        console.log(
          "⭐ Card mode visible and this is second scan - starting 2-second review timer"
        );

        reviewTimerRef.current = setTimeout(() => {
          console.log("⏰ 2 seconds elapsed, showing app store review prompt");
          showReviewPopup();
        }, 2000); // 2 seconds
      }
    }
  }, [
    showCardMode,
    totalScansPerformed,
    reviewPopupShown,
    route.params?.analysisData,
  ]);

  // Cleanup glimmer animation on unmount
  useEffect(() => {
    return () => {
      stopGlimmerAnimation();
    };
  }, []);

<<<<<<< HEAD
  // Sync local isBlurred state with blurByDefault when it changes
  useEffect(() => {
    setIsBlurred(blurByDefault);
  }, [blurByDefault]);

  const handleShare = async () => {
    if (isSharing) return; // Prevent multiple simultaneous shares

=======
  const handleShare = async () => {
    if (isSharing) return; // Prevent multiple simultaneous shares

    // Track share clicked
    logEvent(SHARE_CLICKED, {
      method: "Link", // Default method for expo sharing
      hidePoop: isBlurred,
    });

>>>>>>> 5a9bbd588055ef2a2b282113038f674c9f6c7304
    // Check if we have a valid photo before attempting to share
    if (!analysisData.photo) {
      Alert.alert(
        "Error",
        "No photo available to share. Please take a new photo first."
      );
      return;
    }

    // Only allow sharing in card mode (not during meter animation)
    if (!showCardMode) {
      Alert.alert(
        "Please wait",
        "Please wait for the analysis to complete before sharing."
      );
      return;
    }

    // If expanded section is open, collapse it first
    if (isExpanded) {
      console.log("handleShare - Collapsing expanded section before sharing");

      // Immediately change button text
      setButtonShowsCollapse(false);

      // Collapse: Move drawer back to normal summary position
      await new Promise<void>((resolve) => {
        Animated.parallel([
          Animated.timing(drawerTranslateY, {
            toValue: screenHeight * 0.49, // Return to original starting position
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(expandedOpacity, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setIsExpanded(false);
          // Show title section again
          Animated.parallel([
            Animated.timing(titleOpacity, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(titleTranslateY, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ]).start(() => {
            resolve(); // Animation complete, resolve the promise
          });
        });
      });
    }

    console.log("handleShare - About to capture card container in card mode");

    try {
      setIsSharing(true);

      // Hide UI elements for clean capture
      setHideUIForShare(true); // Position glimmer at 2% across the card for sharing
      const cardWidth = screenWidth - 32; // Account for margins (16px each side)
      const glimmerStartPosition = -screenWidth * 1.5; // Original start position
      const glimmerEndPosition = screenWidth * 1.5; // Original end position
      const glimmerRange = glimmerEndPosition - glimmerStartPosition;
      const glimmerAt2Percent = glimmerStartPosition + glimmerRange * 0.02; // 2% of the way across

      glimmerTranslateX.setValue(glimmerAt2Percent);
      glimmerOpacity.setValue(1); // Make glimmer visible
      glimmerRotate.setValue(45); // Set rotation

      // Wait longer to ensure UI opacity transitions are complete
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Capture the actual card container directly
      if (cardContainerRef.current) {
        console.log("handleShare - Card container ref found, capturing...");

        const uri = await captureRef(cardContainerRef.current, {
          format: "png",
          quality: 0.9,
          result: "tmpfile",
          width: undefined, // Let it use natural dimensions
          height: undefined, // Let it use natural dimensions
        });

        console.log("handleShare - Successfully captured card:", uri);

        // Check if sharing is available
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: "image/png",
            dialogTitle: "Share your PoopAI results!",
          });
<<<<<<< HEAD
        } else {
=======

          // Track successful share
          logEvent(SHARE_COMPLETED, {
            method: "Link",
            success: true,
          });
        } else {
          // Track failed share
          logEvent(SHARE_COMPLETED, {
            method: "Link",
            success: false,
          });
>>>>>>> 5a9bbd588055ef2a2b282113038f674c9f6c7304
          Alert.alert("Error", "Sharing is not available on this device");
        }
      } else {
        console.error("Card container ref is null");
<<<<<<< HEAD
=======
        logEvent(SHARE_COMPLETED, {
          method: "Link",
          success: false,
        });
>>>>>>> 5a9bbd588055ef2a2b282113038f674c9f6c7304
        Alert.alert("Error", "Unable to capture the card. Please try again.");
      }
    } catch (error) {
      console.error("Error sharing:", error);
<<<<<<< HEAD
=======
      logEvent(SHARE_COMPLETED, {
        method: "Link",
        success: false,
      });
>>>>>>> 5a9bbd588055ef2a2b282113038f674c9f6c7304
      Alert.alert("Error", "Failed to share the image. Please try again.");
    } finally {
      // Restore UI elements
      setHideUIForShare(false);

      // Restart glimmer animation (this will stop any existing ones first)
      if (showCardMode) {
        startGlimmerAnimation();
      }

      setIsSharing(false);
    }
  };

  const handleLearnMore = () => {
    if (isExpanded) {
<<<<<<< HEAD
=======
      // Track learn more time spent when closing
      if (learnMoreStartTime.current) {
        const timeSpent = (Date.now() - learnMoreStartTime.current) / 1000;
        logEvent(LEARN_MORE_TIME_SPENT, {
          duration: parseFloat(timeSpent.toFixed(1)),
          scrolledToBottom: false, // We don't track scroll in this implementation
        });
        learnMoreStartTime.current = null;
      }

>>>>>>> 5a9bbd588055ef2a2b282113038f674c9f6c7304
      // Immediately change button text
      setButtonShowsCollapse(false);

      // Collapse: Move drawer back to normal summary position
      Animated.parallel([
        Animated.timing(drawerTranslateY, {
          toValue: screenHeight * 0.49, // Return to original starting position
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(expandedOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsExpanded(false);
        // Show title section again
        Animated.parallel([
          Animated.timing(titleOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(titleTranslateY, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();
      });
    } else {
<<<<<<< HEAD
=======
      // Track learn more opened
      logEvent(LEARN_MORE_OPENED);
      learnMoreStartTime.current = Date.now();

>>>>>>> 5a9bbd588055ef2a2b282113038f674c9f6c7304
      // Immediately change button text
      setButtonShowsCollapse(true);

      // Expand: Hide title section and show expanded content
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(titleTranslateY, {
          toValue: -50,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsExpanded(true);
        // Move drawer up to visible position
        Animated.parallel([
          Animated.timing(drawerTranslateY, {
            toValue: 0, // Move drawer to visible position
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(expandedOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }
  };

  const handleScanAgain = () => {
    navigation.navigate("Camera");
  };

  const handleGoHome = async () => {
    // Refresh user data to get updated poop score average after scan
    if (user) {
      try {
        await refreshUserData();
      } catch (error) {
        console.error("Error refreshing user data before going home:", error);
        // Continue navigation even if refresh fails
      }
    }
    navigation.navigate("Home");
  };

  const toggleBlur = () => {
    setIsBlurred(!isBlurred);
  };

<<<<<<< HEAD
  const handleDeleteScan = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setShowDeleteModal(false);

    // Check if we have an analysis ID
    if (!analysisData.id) {
      console.error("❌ No analysis ID available for deletion");
      setDeleteError("Unable to delete scan - no ID found");
      return;
    }

    console.log("🗑️ Attempting to delete scan with ID:", analysisData.id);

    setIsDeleting(true);
    setDeleteError(null);

    try {
      // Get auth token
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      console.log(
        "🗑️ Making DELETE request to:",
        `${AppConfig.api.baseUrl}/api/user/scan/${analysisData.id}`
      );

      // Make DELETE request to the backend
      const response = await fetch(
        `${AppConfig.api.baseUrl}/api/user/scan/${analysisData.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      console.log("✅ Scan deleted successfully");

      // Navigate back to home after successful deletion
      setTimeout(() => {
        setIsDeleting(false);
        navigation.navigate("Home");
      }, 1500); // Brief delay to show success state
    } catch (error) {
      console.error("❌ Error deleting scan:", error);
      setIsDeleting(false);
      setDeleteError(
        error instanceof Error ? error.message : "Failed to delete scan"
      );
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  const handleDismissDeleteError = () => {
    setDeleteError(null);
  };

=======
>>>>>>> 5a9bbd588055ef2a2b282113038f674c9f6c7304
  const handleMeterAnimationComplete = () => {
    // Start the cinematic transition sequence
    startCinematicTransition();
  };

  const startCinematicTransition = () => {
    // Step 1: Hide the meter animation first
    setTimeout(() => {
      setShowMeterAnimation(false);

      // Step 2: Animate the photo container from full-screen to card size
      Animated.parallel([
        // Animate container margins to create card effect
        Animated.timing(containerMarginH, {
          toValue: 16, // Add horizontal margins
          duration: 800,
          useNativeDriver: false, // margin can't use native driver
        }),
        Animated.timing(containerMarginT, {
          toValue: 0, // Adjust top margin
          duration: 800,
          useNativeDriver: false,
        }),
        Animated.timing(containerMarginB, {
          toValue: 24, // Add bottom margin
          duration: 800,
          useNativeDriver: false,
        }),
        // Animate border radius to create rounded corners
        Animated.timing(containerRadius, {
          toValue: 24, // Increased from 24 for more rounded corners
          duration: 800,
          useNativeDriver: false,
        }),
        // Animate border width to reduce thickness
        Animated.timing(containerBorderWidth, {
          toValue: 18,
          duration: 800,
          useNativeDriver: false,
        }),
        // Animate shadow to create card elevation
        Animated.timing(containerShadow, {
          toValue: 0.4, // Increased from 0.25 to 0.4 for more visible shadow
          duration: 800,
          useNativeDriver: false,
        }),
        // Animate flex to compress the container vertically (leave space for buttons)
        Animated.timing(containerFlex, {
          toValue: 1, // Keep at 1 since buttons will be present in layout
          duration: 800,
          useNativeDriver: false,
        }),
      ]).start(() => {
        // Step 3: Show card mode immediately (no secondary animation)
        setShowCardMode(true);

        // Animate title section moving up and fading in
        Animated.parallel([
          Animated.timing(titleOpacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(titleTranslateY, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
          // Animate blur toggle button to its final position below title
          Animated.timing(blurToggleTop, {
            toValue: 95, // Move to position below title section
            duration: 600,
            useNativeDriver: false,
          }),
        ]).start();

        // Animate summary moving down and fading in (slight delay)
        setTimeout(() => {
          Animated.parallel([
            Animated.timing(summaryOpacity, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(summaryTranslateY, {
              toValue: 0,
              duration: 600,
              useNativeDriver: true,
            }),
          ]).start();
        }, 200);

        // Animate buttons moving up and fading in (slight delay)
        setTimeout(() => {
          Animated.parallel([
            Animated.timing(buttonsOpacity, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(buttonsTranslateY, {
              toValue: 0,
              duration: 600,
              useNativeDriver: true,
            }),
          ]).start();
        }, 400);

        // Start the glimmer animation after card is fully formed
        setTimeout(() => {
          startGlimmerAnimation();
        }, 1200);

        // Start the floating animation after card is fully formed
        setTimeout(() => {
          startCardFloatingAnimation();
        }, 1500);
      });
    }, 800); // Wait for meter's own spin animation
  };

  const stopGlimmerAnimation = () => {
    // Clear any pending timeout
    if (glimmerTimeoutRef.current) {
      clearTimeout(glimmerTimeoutRef.current);
      glimmerTimeoutRef.current = null;
    }

    // Stop all glimmer animations
    glimmerTranslateX.stopAnimation();
    glimmerOpacity.stopAnimation();
    glimmerRotate.stopAnimation();
  };

  const startGlimmerAnimation = () => {
    // Stop any existing glimmer animation
    stopGlimmerAnimation();

    const createGlimmer = () => {
      // Reset position and opacity
      glimmerTranslateX.setValue(-screenWidth * 1.5);
      glimmerOpacity.setValue(0);
      glimmerRotate.setValue(45);

      // Create smooth glimmer sweep
      Animated.sequence([
        // Fade in
        Animated.timing(glimmerOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        // Sweep across with rotation
        Animated.parallel([
          Animated.timing(glimmerTranslateX, {
            toValue: screenWidth * 1.5,
            duration: 1200, // Reduced from 2000ms to 1200ms
            easing: Easing.out(Easing.cubic), // Cubic out easing
            useNativeDriver: true,
          }),
          Animated.timing(glimmerRotate, {
            toValue: 55,
            duration: 1200, // Reduced from 2000ms to 1200ms
            easing: Easing.out(Easing.cubic), // Cubic out easing
            useNativeDriver: true,
          }),
        ]),
        // Fade out
        Animated.timing(glimmerOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Wait before next glimmer (random between 5 and 10 seconds)
        const waitMs = 5000 + Math.random() * 5000;
        glimmerTimeoutRef.current = setTimeout(() => {
          createGlimmer();
        }, waitMs);
      });
    };

    createGlimmer();
  };

  // Calculate dynamic score color based on score (red to green)
  const getScoreColor = (score: number): string => {
    const percentage = Math.min(score / 10, 1);
    const red = Math.round(255 * (1 - percentage));
    const green = Math.round(255 * percentage);
    return `rgb(${red}, ${green}, 0)`;
  };

  // Floating animation for the card
  const startCardFloatingAnimation = () => {
    const createFloatingMotion = () => {
      // Generate random target positions within a small radius
      const randomY = (Math.random() - 0.5) * 6; // -3 to +3 pixels
      const randomX = (Math.random() - 0.5) * 4; // -2 to +2 pixels
      const randomRotation = (Math.random() - 0.5) * 0.5; // -0.25 to +0.25 degrees (reduced by half)

      Animated.parallel([
        Animated.timing(cardFloatY, {
          toValue: randomY,
          duration: 3000 + Math.random() * 2000, // 3-5 seconds
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(cardFloatX, {
          toValue: randomX,
          duration: 2500 + Math.random() * 2000, // 2.5-4.5 seconds
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(cardRotate, {
          toValue: randomRotation,
          duration: 4000 + Math.random() * 2000, // 4-6 seconds
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Continue the floating motion seamlessly
        createFloatingMotion();
      });
    };

    createFloatingMotion();
  };

  return (
    <View className="flex-1 bg-transparent">
      {/* Status Bar Spacing - Always present */}
      <View className="pt-16" />
      {/* Unified Photo Container - Animates from full-screen to card */}
      <Animated.View
        style={{
          flex: containerFlex,
          marginHorizontal: containerMarginH,
          marginTop: containerMarginT,
          marginBottom: containerMarginB,
        }}
      >
        {/* Floating Animation Container - Only handles transforms */}
        <Animated.View
          style={{
            flex: 1,
            transform: [
              { translateY: cardFloatY },
              { translateX: cardFloatX },
              {
                rotate: cardRotate.interpolate({
                  inputRange: [-0.5, 0.5],
                  outputRange: ["-0.5deg", "0.5deg"],
                }),
              },
            ],
          }}
        >
          {/* Shadow Container - Provides drop shadow without clipping */}
          <Animated.View
            ref={cardContainerRef}
            style={{
              flex: 1,
              borderRadius: containerRadius,
              borderWidth: 1.5,
              borderColor: "rgb(120, 79, 46)", // Thin brown border around the card
              backgroundColor: "rgb(120, 79, 46)", // Brown background fill behind the card
              shadowColor: "#000",
              shadowOpacity: showCardMode ? 0.4 : containerShadow,
              shadowRadius: showCardMode
                ? 14
                : containerShadow.interpolate({
                    inputRange: [0, 0.4],
                    outputRange: [0, 14],
                  }),
              shadowOffset: {
                width: 0,
                height: showCardMode
                  ? 6
                  : containerShadow.interpolate({
                      inputRange: [0, 0.4],
                      outputRange: [0, 6],
                    }),
              },
              elevation: showCardMode
                ? 12
                : containerShadow.interpolate({
                    inputRange: [0, 0.4],
                    outputRange: [0, 12],
                  }),
            }}
          >
            {/* Content Container - Handles overflow clipping and corner radius */}
            <Animated.View
              style={{
                flex: 1,
                borderRadius: containerRadius,
                overflow: "hidden", // This clips the glimmer and content properly
              }}
            >
              {/* Solid Border */}
              <View
                style={{
                  flex: 1,
                  backgroundColor: "rgb(137, 115, 93)", // Same color as section borders
                }}
              >
                {/* Premium Card Glimmer Effect - Only visible in card mode */}
                {showCardMode && (
                  <Animated.View
                    style={{
                      position: "absolute",
                      top: -screenHeight * 0.2, // Start much higher
                      left: -screenWidth * 0.3, // Start further left
                      width: screenWidth * 2, // Much wider to ensure full coverage
                      height: screenHeight * 1.8, // Much taller to ensure full coverage
                      zIndex: 10,
                      opacity: glimmerOpacity.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 0.5], // Increased from 0.3 to 0.5
                      }),
                      transform: [
                        { translateX: glimmerTranslateX },
                        {
                          rotate: glimmerRotate.interpolate({
                            inputRange: [0, 360],
                            outputRange: ["0deg", "360deg"],
                          }),
                        },
                      ],
                    }}
                    pointerEvents="none"
                  >
                    {/* Main glimmer beam */}
                    <LinearGradient
                      colors={[
                        "transparent",
                        "transparent",
                        "rgba(255, 255, 255, 0.05)", // Much lower opacity
                        "rgba(255, 255, 255, 0.15)",
                        "rgba(255, 223, 0, 0.25)",
                        "rgba(255, 255, 255, 0.4)", // Peak reduced from 1.0 to 0.4
                        "rgba(255, 223, 0, 0.25)",
                        "rgba(255, 255, 255, 0.15)",
                        "rgba(255, 255, 255, 0.05)",
                        "transparent",
                        "transparent",
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{
                        position: "absolute",
                        width: screenWidth * 0.8, // Wider beam
                        height: "100%",
                        left: screenWidth * 0.1,
                      }}
                    />

                    {/* Secondary shimmer layer */}
                    <LinearGradient
                      colors={[
                        "transparent",
                        "rgba(255, 255, 255, 0.08)", // Much lower opacity
                        "rgba(255, 223, 0, 0.12)",
                        "rgba(255, 255, 255, 0.2)", // Peak reduced from 0.6 to 0.2
                        "rgba(255, 223, 0, 0.12)",
                        "rgba(255, 255, 255, 0.08)",
                        "transparent",
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{
                        position: "absolute",
                        width: screenWidth * 0.4,
                        height: "100%",
                        left: screenWidth * 0.3,
                      }}
                    />
                  </Animated.View>
                )}

                <Animated.View
                  style={{
                    flex: 1,
                    margin: containerBorderWidth,
                    borderRadius: containerRadius.interpolate({
                      inputRange: [16, 32], // Updated to match new containerRadius range
                      outputRange: [12, 28], // Slightly smaller radius for inner content
                    }),
                    overflow: "hidden",
                  }}
                >
                  <ImageBackground
                    source={{
                      uri: analysisData.photo || undefined,
                    }}
                    className="flex-1"
                    resizeMode="cover"
                    blurRadius={isBlurred ? 35 : 0}
                    onError={() =>
                      console.error(
                        "ResultsScreen: Failed to load photo:",
                        analysisData.photo
                      )
                    }
                  >
                    {/* Blur Toggle Button - Animated Position */}
                    {!hideUIForShare && !isExpanded && (
                      <Animated.View
                        style={{
                          position: "absolute",
                          top: blurToggleTop, // Animated from 20px (top left) to 95px (below title)
                          left: blurToggleLeft, // Keep at 15px from left
                          zIndex: 10,
                        }}
                      >
                        <BlurToggleButton
                          isBlurred={isBlurred}
                          onPress={toggleBlur}
                          size="medium"
                        />
                      </Animated.View>
                    )}

<<<<<<< HEAD
                    {/* Trash Button - Top Right of Image */}
                    {!hideUIForShare && !isExpanded && showCardMode && (
                      <Animated.View
                        style={{
                          position: "absolute",
                          top: blurToggleTop, // Same animated top position as blur toggle
                          right: 15, // Fixed position at right (matching blur toggle's 15px from left)
                          zIndex: 10,
                        }}
                      >
                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={handleDeleteScan}
                        >
                          <BlurView
                            intensity={8}
                            tint="dark"
                            style={{
                              borderRadius: 24,
                              width: 48,
                              height: 48,
                              borderWidth: 1.5,
                              borderColor: "rgba(107, 114, 128, 0.5)", // Gray border
                              backgroundColor: "rgba(107, 114, 128, 0.3)", // Gray background
                              shadowColor: "#000",
                              shadowOffset: { width: 0, height: 4 },
                              shadowOpacity: 0.15,
                              shadowRadius: 8,
                              elevation: 8,
                              overflow: "hidden",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <View
                              style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: "rgba(107, 114, 128, 0.25)", // Gray overlay
                                borderRadius: 24,
                              }}
                            />
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Ionicons
                                name="trash-outline"
                                size={24}
                                color="#FFFFFF"
                              />
                            </View>
                          </BlurView>
                        </TouchableOpacity>
                      </Animated.View>
                    )}

=======
>>>>>>> 5a9bbd588055ef2a2b282113038f674c9f6c7304
                    {/* Full-Screen Mode Content - During Meter Animation */}
                    {showMeterAnimation && <View className="flex-1"></View>}

                    {/* Card Mode Content - After Meter Animation */}
                    {showCardMode && (
                      <View className="flex-1">
                        {/* Animated Title Section - Hidden when expanded */}
                        {!isExpanded && (
                          <Animated.View
                            style={{
                              opacity: titleOpacity,
                              transform: [{ translateY: titleTranslateY }],
                            }}
                          >
                            {/* Title and Timestamp with Background - Full Width */}
                            <View>
                              <LinearGradient
                                colors={[
                                  "#d6c7a6", // highlight / top left
                                  "#b49b74", // midtone (base version of #736349 lightened)
                                  "#e6ddc8", // soft edge / reflection highlight
                                ]}
                                start={{ x: 0, y: 0 }} // Top left (135deg equivalent)
                                end={{ x: 1, y: 1 }} // Bottom right (135deg equivalent)
                                style={{
                                  opacity: 0.95,
                                  borderRadius: 0,
                                  padding: 12,
                                  borderBottomWidth: 8,
                                  borderBottomColor: "rgb(137, 115, 93)",
                                  shadowColor: "#000",
                                  shadowOffset: { width: 0, height: 2 },
                                  shadowOpacity: 0.1,
                                  shadowRadius: 4,
                                  elevation: 2,
                                }}
                              >
                                <Text
                                  className="text-2xl font-bold text-gray-800 mb-1 text-center"
                                  style={{ fontFamily: "Super Adorable" }}
                                >
                                  {user?.profile?.name
                                    ? `${user.profile.name.split(" ")[0]}'s ${analysisData.bristolName.toUpperCase()}`
                                    : analysisData.bristolName.toUpperCase()}
                                </Text>
                                <View className="flex-row justify-center items-center">
                                  <Text className="text-sm text-gray-600 font-medium text-center">
                                    {analysisData.timestamp}
                                  </Text>
                                </View>
                              </LinearGradient>
                            </View>
                          </Animated.View>
                        )}

                        {/* Spacer to push content up when not expanded */}
                        {!isExpanded && <View className="flex-1" />}

                        {/* Animated Analysis Summary - Drawer Style */}
                        <Animated.View
                          className={`${isExpanded ? "" : "justify-end"}`}
                          style={{
                            position: isExpanded ? "absolute" : "relative",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: isExpanded
                              ? screenHeight * 0.65
                              : undefined, // Reduced height for better fit across screens
                            opacity: summaryOpacity,
                            transform: isExpanded
                              ? [{ translateY: drawerTranslateY }]
                              : [{ translateY: summaryTranslateY }],
                          }}
                        >
                          {/* Dynamic Button - Outside Analysis Section */}
                          <View
                            className="px-4 pb-4"
                            style={{ alignItems: "flex-start" }}
                          >
                            <LearnMoreButton
                              onPress={handleLearnMore}
                              isCollapsed={buttonShowsCollapse}
                              size="medium"
                              style={{ opacity: hideUIForShare ? 0 : 1 }}
                              disabled={hideUIForShare}
                            />
                          </View>

                          {/* Bristol Type Badge - Top Right - Outside padded area */}
                          <View
                            style={{
                              position: "absolute",
                              top: badgeTopPosition,
                              right: badgeRightPosition,
                              zIndex: 10,
                            }}
                          >
                            <BristolTypeBadge type={analysisData.bristolType} />
                          </View>

                          <LinearGradient
                            colors={[
                              "#d6c7a6", // highlight / top left
                              "#b49b74", // midtone (base version of #736349 lightened)
                              "#e6ddc8", // soft edge / reflection highlight
                            ]}
                            start={{ x: 0, y: 0 }} // Top left (135deg equivalent)
                            end={{ x: 1, y: 1 }} // Bottom right (135deg equivalent)
                            style={{
                              opacity: 0.95,
                              borderRadius: 0,
                              padding: 8,
                              paddingBottom: 0,
                              borderTopWidth: 8,
                              borderTopColor: "rgba(137, 115, 93, 1)",
                              shadowColor: "#000",
                              shadowOffset: { width: 0, height: 4 },
                              shadowOpacity: 0.1,
                              shadowRadius: 8,
                              elevation: 4,
                              flex: isExpanded ? 1 : undefined,
                            }}
                          >
                            {/* Header with Score */}
                            <View className="mb-0">
                              {/* Poop Score Title */}
                              <Text
                                className="font-black text-black"
                                style={{
                                  fontSize: scoreTitleFontSize,
                                  paddingLeft: scorePaddingLeft,
                                }}
                              >
                                POOP SCORE:
                              </Text>
                              <View
                                className="flex-row items-baseline"
                                style={{ marginTop: -6 }}
                              >
                                <Text
                                  className="font-bold"
                                  style={{
                                    color: getScoreColor(analysisData.score),
                                    fontSize: scoreFontSize,
                                    paddingLeft: scorePaddingLeft,
                                    textShadowColor: "rgba(0, 0, 0, 0.3)",
                                    textShadowOffset: { width: 1, height: 1 },
                                    textShadowRadius: 4,
                                  }}
                                >
                                  {analysisData.score}
                                </Text>
                                <Text
                                  className="font-semibold text-gray-500 ml-1"
                                  style={{ fontSize: maxScoreFontSize }}
                                >
                                  / {analysisData.maxScore}
                                </Text>
                              </View>
                            </View>

                            {/* Content Area */}
                            {isExpanded ? (
                              <ScrollView
                                showsVerticalScrollIndicator={false}
                                style={{ flex: 1, marginTop: 16 }}
                                contentContainerStyle={{ paddingBottom: 16 }}
                              >
                                {/* Poopbot Prompt above Analysis Summary */}
                                <View style={{ marginBottom: 8 }}>
                                  <ResultsPoopbotPrompt />
                                </View>

                                <Text className="text-3xl font-bold text-gray-800 mb-4">
                                  🔍 Analysis Summary
                                </Text>

                                <Text className="text-gray-700 text-2xl leading-8 mb-4">
                                  {analysisData.poopSummary}
                                </Text>

                                <Animated.View
                                  style={{
                                    opacity: expandedOpacity,
                                  }}
                                >
                                  {/* Observations Section */}
                                  <View className="pt-4 border-t border-gray-300/50">
                                    <Text className="text-3xl font-bold text-gray-800 mb-3">
                                      🔬 Detailed Observations
                                    </Text>

                                    <View className="space-y-3">
                                      <View className="mb-3">
                                        <Text className="text-xl font-semibold text-gray-700 mb-1">
                                          Physical Description:
                                        </Text>
                                        <Text className="text-xl text-gray-600 leading-7">
                                          {analysisData.stoolDescription}
                                        </Text>
                                      </View>

                                      <View className="mb-3">
                                        <Text className="text-xl font-semibold text-gray-700 mb-1">
                                          Hydration Assessment:
                                        </Text>
                                        <Text className="text-xl text-gray-600 leading-7">
                                          {analysisData.hydrationJudgement}
                                        </Text>
                                      </View>

                                      <View className="mb-3">
                                        <Text className="text-xl font-semibold text-gray-700 mb-1">
                                          Fiber Content:
                                        </Text>
                                        <Text className="text-xl text-gray-600 leading-7">
                                          {analysisData.fiberJudgement}
                                        </Text>
                                      </View>
                                    </View>
                                  </View>

                                  {/* Recommendation Section */}
                                  <View className="mt-4 p-3 bg-amber-50/80 rounded-lg border border-amber-200/50">
                                    <Text className="text-2xl font-semibold text-amber-800 mb-2">
                                      ⚠️ Recommendation
                                    </Text>
                                    <Text className="text-xl text-amber-700 leading-7">
                                      {analysisData.recommendation}
                                    </Text>
                                  </View>
                                </Animated.View>
                              </ScrollView>
                            ) : null}
                          </LinearGradient>
                        </Animated.View>
                      </View>
                    )}
                  </ImageBackground>
                </Animated.View>
              </View>
            </Animated.View>
            {/* Close Content Container */}
          </Animated.View>
          {/* Close Floating Animation Container */}
        </Animated.View>
        {/* Close Shadow Container */}
      </Animated.View>
      {/* Close Unified Photo Container */}

      {/* Poop Meter Animation - Absolute positioned above everything */}
      {showMeterAnimation && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 24,
          }}
          pointerEvents="none"
        >
          <PoopMeterAnimation
            targetScore={analysisData.score}
            onAnimationComplete={handleMeterAnimationComplete}
          />
        </View>
      )}

      {/* Bottom Action Buttons - Always present but initially off-screen */}
      <Animated.View
        className="mx-4 mb-2"
        style={{
          opacity: buttonsOpacity,
          transform: [{ translateY: buttonsTranslateY }],
        }}
      >
        <View className="flex-row justify-between px-0" style={{ height: 140 }}>
          {/* Scan Again Button */}
          <View className="flex-1 items-center justify-end pb-4">
            <TouchableOpacity
              onPress={handleScanAgain}
              className="items-center"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <CameraSvg width={96} height={96} color="#6B7280" />
              <Text className="text-gray-600 font-semibold text-base mt-2">
                Scan Again
              </Text>
            </TouchableOpacity>
          </View>

          {/* Home Button */}
          <View className="flex-1 items-center justify-start pt-1">
            <TouchableOpacity
              onPress={handleGoHome}
              className="items-center"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 4,
              }}
            >
              <HomeSvg width={96} height={96} color="#8B5CF6" />
            </TouchableOpacity>
          </View>

          {/* Share Button */}
          <View className="flex-1 items-center justify-end pb-4">
            <TouchableOpacity
              onPress={handleShare}
              disabled={isSharing}
              className="items-center"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isSharing ? 0.1 : 0.25,
                shadowRadius: 4,
                elevation: 3,
                opacity: isSharing ? 0.6 : 1.0,
              }}
            >
              <ShareSvg
                width={96}
                height={96}
                color={isSharing ? "#9CA3AF" : "#6B7280"}
              />
              <Text
                className="text-gray-600 font-semibold text-base mt-2"
                style={{ color: isSharing ? "#9CA3AF" : "#6B7280" }}
              >
                {isSharing ? "Sharing..." : "Share"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
      {/* REMOVED: Save Results Popup - no longer showing auth nudges for 2nd/3rd scans */}
<<<<<<< HEAD

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        visible={showDeleteModal}
        onDelete={handleConfirmDelete}
        onKeep={handleCancelDelete}
      />

      {/* Delete Loading Modal */}
      {isDeleting && (
        <Modal visible={true} transparent={true} animationType="fade">
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <BlurView
              intensity={20}
              tint="dark"
              style={{
                borderRadius: 24,
                padding: 32,
                borderWidth: 1.5,
                borderColor: "rgba(255, 255, 255, 0.2)",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                alignItems: "center",
                overflow: "hidden",
              }}
            >
              <Text
                style={{
                  fontSize: screenHeight * 0.024,
                  fontWeight: "700",
                  color: "#FFFFFF",
                  textAlign: "center",
                  marginBottom: 16,
                }}
              >
                Deleting Scan...
              </Text>
              <Text
                style={{
                  fontSize: screenHeight * 0.018,
                  color: "rgba(255, 255, 255, 0.8)",
                  textAlign: "center",
                }}
              >
                Please wait
              </Text>
            </BlurView>
          </View>
        </Modal>
      )}

      {/* Delete Error Modal */}
      {deleteError && (
        <Modal visible={true} transparent={true} animationType="fade">
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 20,
            }}
          >
            <BlurView
              intensity={20}
              tint="dark"
              style={{
                borderRadius: 24,
                padding: 24,
                borderWidth: 1.5,
                borderColor: "rgba(239, 68, 68, 0.4)",
                backgroundColor: "rgba(239, 68, 68, 0.2)",
                maxWidth: screenWidth * 0.85,
                overflow: "hidden",
              }}
            >
              <View style={{ alignItems: "center" }}>
                <Ionicons
                  name="alert-circle-outline"
                  size={48}
                  color="#EF4444"
                  style={{ marginBottom: 16 }}
                />
                <Text
                  style={{
                    fontSize: screenHeight * 0.024,
                    fontWeight: "700",
                    color: "#FFFFFF",
                    textAlign: "center",
                    marginBottom: 8,
                  }}
                >
                  Delete Failed
                </Text>
                <Text
                  style={{
                    fontSize: screenHeight * 0.018,
                    color: "rgba(255, 255, 255, 0.8)",
                    textAlign: "center",
                    marginBottom: 24,
                    lineHeight: screenHeight * 0.024,
                  }}
                >
                  {deleteError}
                </Text>
                <TouchableOpacity onPress={handleDismissDeleteError}>
                  <BlurView
                    intensity={15}
                    tint="light"
                    style={{
                      borderRadius: 16,
                      paddingVertical: 12,
                      paddingHorizontal: 24,
                      borderWidth: 1.5,
                      borderColor: "rgba(255, 255, 255, 0.4)",
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                      overflow: "hidden",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: screenHeight * 0.02,
                        fontWeight: "600",
                        color: "#FFFFFF",
                        textAlign: "center",
                      }}
                    >
                      OK
                    </Text>
                  </BlurView>
                </TouchableOpacity>
              </View>
            </BlurView>
          </View>
        </Modal>
      )}
=======
>>>>>>> 5a9bbd588055ef2a2b282113038f674c9f6c7304
    </View>
  );
}
