// Fixed PaymentScreen with defensive configuration handling
import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Alert,
  Animated,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../types/navigation";
import BackButton from "../../components/navigation/BackButton";
import { Ionicons } from "@expo/vector-icons";
import PoopbotSvg from "../../assets/poopbot.svg";
import FreeScanCelebrationModal from "../../components/subscription/FreeScanCelebrationModal";
import AuthModal from "../../components/auth/AuthModal";
import { useScan } from "../../context/features/ScanContext";
import { useAuth } from "../../context/auth/AuthContext";
import { useDimensions } from "../../context/core/DimensionsContext";
// import { useAdMob } from "../../hooks/useAdMob";
import { useInAppPurchases } from "../../hooks/useInAppPurchases";
import { logEvent, setUserTraits } from "../../lib/analytics";
import {
  PAYMENT_SCREEN_OPENED,
  PAYMENT_BUTTON_CLICKED,
  SUBSCRIBED,
  USER_PROP_SUB_STATUS,
} from "../../lib/analyticsEvents";

// Import config with error handling
import { paymentConfigs as importedPaymentConfigs } from "../../config/paymentConfig";
import { AppConfig } from "../../config/app.config";

let paymentConfigs: any = {};

try {
  paymentConfigs = importedPaymentConfigs || {};
  console.log(
    "PaymentScreen: Successfully loaded payment configs",
    Object.keys(paymentConfigs)
  );
} catch (error) {
  console.warn("Failed to import paymentConfig:", error);
  // Provide fallback config
  paymentConfigs = {
    "scan-credits": {
      title: "Unlock Unlimited Scans",
      subtitle: "Go beyond your weekly limit & get full access to PoopAI",
      sectionTitle: "Premium Features",
      features: [
        { icon: "camera", text: "Unlimited scans" },
        { icon: "analytics", text: "Advanced analytics" },
      ],
      choosePlanTitle: "Pick Your Plan",
      monthlyText: {
        title: "Monthly",
        focusNumber: "1",
        timeframe: "Month",
        price: "$1.99",
        period: "per month",
        perMonthPrice: "$1.99/mo.",
      },
      annualText: {
        title: "Annual",
        focusNumber: "1",
        timeframe: "Year",
        price: "$12.99",
        period: "per year",
        perMonthPrice: "$1.08/mo.",
        badge: "Best Value",
      },
      subscribeButtonText: {
        monthly: "Subscribe Monthly",
        annual: "Subscribe Annually",
        disabled: "Select a Plan",
      },
      freeScanSection: {
        title: "Not ready to upgrade?",
        subtitle: "Share PoopAI with a friend to get a free scan.",
        buttonText: "Get 1 Free Scan",
        disclaimer: "Share with friends to earn scans.",
      },
    },
  };
}

type PaymentScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Payment"
>;

type PaymentScreenRouteProp = RouteProp<RootStackParamList, "Payment">;

interface Props {
  navigation?: PaymentScreenNavigationProp;
  route?: PaymentScreenRouteProp;
}

const { width, height } = Dimensions.get("window");

export default function PaymentScreen(props: Props) {
  // Get current device dimensions from context
  const { screenHeight, screenWidth } = useDimensions();

  // Calculate responsive values based on screen height
  const titleFontSize = screenHeight * 0.032; // Increased from 0.025 to 0.032 (28% larger)
  const subtitleFontSize = screenHeight * 0.02; // Increased from 0.016 to 0.020 (25% larger)
  const poopbotSize = screenHeight * 0.15; // 15% of screen height
  const planCardHeight = screenHeight * 0.22; // 22% of screen height
  const buttonHeight = screenHeight * 0.08; // 6% of screen height
  const containerPadding = screenHeight * 0.025; // 2.5% of screen height
  const borderRadius = screenHeight * 0.03; // 3% of screen height for rounded corners

  // Create dynamic styles based on screen dimensions
  const styles = createStyles(screenHeight, screenWidth);

  // Defensive programming - check if props are properly structured
  const { navigation, route } = props || {};

  // Early return with error state if critical props are missing
  if (!navigation) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Navigation error: PaymentScreen requires navigation prop
        </Text>
      </View>
    );
  }

  // Extract route parameters with comprehensive null safety
  const routeParams = route?.params ?? {};
  const {
    noScreen = "Profile",
    type = "scan-credits",
    preselection = null,
    freeTrial = false,
  } = routeParams;

  // Get configuration with fallback
  const config = useMemo(() => {
    try {
      console.log("PaymentScreen: Resolving config for type:", type);
      console.log(
        "PaymentScreen: Available configs:",
        Object.keys(paymentConfigs)
      );

      const configKey =
        type === "scan-credits" ? "scan-credits" : "premium-subscription";
      console.log("PaymentScreen: Using config key:", configKey);

      const baseConfig =
        paymentConfigs[configKey] || paymentConfigs["scan-credits"];

      if (!baseConfig) {
        console.warn("PaymentScreen: No base config found, using fallback");
        throw new Error("No valid config found");
      }

      console.log(
        "PaymentScreen: Successfully loaded config:",
        baseConfig.title
      );

      // Apply customizations
      const customizedConfig = { ...baseConfig };

      if (freeTrial) {
        customizedConfig.choosePlanTitle =
          "Try Free for 7 Days — Cancel Anytime!";
        customizedConfig.subscribeButtonText = {
          monthly: "Start Free Trial (Monthly)",
          annual: "Start Free Trial (Annual)",
          disabled: "Select a Plan",
        };
      }

      return customizedConfig;
    } catch (error) {
      console.warn("Error getting payment config:", error);
      // Return minimal fallback
      console.warn("PaymentScreen: Using minimal fallback configuration");
      return (
        paymentConfigs["scan-credits"] || {
          title: "Unlock Unlimited Scans",
          subtitle: "Go beyond your weekly limit & get full access to PoopAI",
          sectionTitle: "Premium Features",
          features: [
            { icon: "camera", text: "Unlimited scans" },
            { icon: "analytics", text: "Advanced analytics" },
          ],
          choosePlanTitle: "Pick Your Plan",
          monthlyText: {
            title: "Monthly",
            price: "$1.99",
            focusNumber: "1",
            timeframe: "Month",
            period: "per month",
            perMonthPrice: "$1.99/mo.",
          },
          annualText: {
            title: "Annual",
            price: "$12.99",
            focusNumber: "1",
            timeframe: "Year",
            period: "per year",
            perMonthPrice: "$1.08/mo.",
          },
          subscribeButtonText: {
            monthly: "Monthly",
            annual: "Annual",
            disabled: "Select Plan",
          },
          freeScanSection: {
            title: "Share for Free Scans",
            subtitle: "Get scans without subscribing",
            buttonText: "Share for Free Scan",
            disclaimer: "Share with friends to earn scans.",
          },
        }
      );
    }
  }, [type, preselection, freeTrial]);

  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual" | null>(
    preselection || null
  );

  // Scan context for free scan functionality
  const { scansLeft, awardFreeScan } = useScan();

  // Auth context for checking user authentication
  const { isAuthenticated, token, user } = useAuth();

  // AdMob hook for handling ads
  // const { loadAd, showAd, canShowAd, isAdLoading, error: adError } = useAdMob();

  // Mock AdMob functions for Expo Go compatibility
  const loadAd = () => Promise.resolve();
  const showAd = () => Promise.resolve(false);
  const canShowAd = false;
  const isAdLoading = false;
  const adError = null;

  // In-App Purchase hook for subscription management
  const {
    subscriptionPlans,
    isLoading: isLoadingPlans,
    isPurchasing,
    purchaseSubscription,
    hasActiveSubscription,
  } = useInAppPurchases();

  // Celebration modal state
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);
  const [previousScanCount, setPreviousScanCount] = useState(0);

  // Forced auth modal state for premium users without accounts
  const [showForcedAuthModal, setShowForcedAuthModal] = useState(false);

  // Shimmer animation for the button
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  // Floating animation for the discount badge
  const floatAnim = useRef(new Animated.Value(0)).current;

  // PoopBot animations for premium subscription
  const poopbotFloatY = useRef(new Animated.Value(-6)).current;
  const poopbotScale = useRef(new Animated.Value(0.9)).current;

  // Sparkle animations for PoopBot
  const [sparkles, setSparkles] = useState<
    Array<{
      id: number;
      opacity: Animated.Value;
      translateX: Animated.Value;
      translateY: Animated.Value;
      x: number;
      y: number;
    }>
  >([]);

  // Load ad when component mounts (for free scan section)
  const showFreeScanSection =
    config.freeScanSection && type === "scan-credits" && !freeTrial;

  // Track payment screen opened
  useEffect(() => {
    logEvent(PAYMENT_SCREEN_OPENED);
  }, []);

  useEffect(() => {
    if (showFreeScanSection) {
      console.log("📺 Loading ad for free scan section...");
      loadAd().catch((error) => {
        console.warn("📺 Failed to load ad:", error);
      });
    }
  }, [showFreeScanSection, loadAd]);

  useEffect(() => {
    // Start floating animation immediately
    const floatingAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    floatingAnimation.start();

    // PoopBot floating animation for premium subscription
    if (type === "premium-subscription") {
      // Entrance animation
      Animated.spring(poopbotScale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();

      // Continuous floating animation
      const poopbotFloating = Animated.loop(
        Animated.sequence([
          Animated.timing(poopbotFloatY, {
            toValue: 6,
            duration: 2500,
            useNativeDriver: true,
          }),
          Animated.timing(poopbotFloatY, {
            toValue: -6,
            duration: 2500,
            useNativeDriver: true,
          }),
        ])
      );
      poopbotFloating.start();

      // Generate sparkles around PoopBot
      const generateSparkles = () => {
        const newSparkles = [];
        for (let i = 0; i < 6; i++) {
          // Position sparkles around PoopBot's area (120x120 size)
          const angle = (i / 6) * 2 * Math.PI;
          const radius = 70 + Math.random() * 20; // Vary distance
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          newSparkles.push({
            id: Date.now() + i,
            opacity: new Animated.Value(0),
            translateX: new Animated.Value(0),
            translateY: new Animated.Value(0),
            x,
            y,
          });
        }
        setSparkles(newSparkles);

        // Animate sparkles
        newSparkles.forEach((sparkle, index) => {
          Animated.loop(
            Animated.sequence([
              Animated.timing(sparkle.opacity, {
                toValue: 1,
                duration: 800 + Math.random() * 400,
                useNativeDriver: true,
              }),
              Animated.timing(sparkle.opacity, {
                toValue: 0,
                duration: 800 + Math.random() * 400,
                useNativeDriver: true,
              }),
            ])
          ).start();

          // Gentle sparkle movement
          Animated.loop(
            Animated.sequence([
              Animated.timing(sparkle.translateX, {
                toValue: (Math.random() - 0.5) * 20,
                duration: 2000 + Math.random() * 1000,
                useNativeDriver: true,
              }),
              Animated.timing(sparkle.translateX, {
                toValue: (Math.random() - 0.5) * 20,
                duration: 2000 + Math.random() * 1000,
                useNativeDriver: true,
              }),
            ])
          ).start();
        });
      };

      generateSparkles();

      return () => {
        floatingAnimation.stop();
        poopbotFloating.stop();
      };
    }

    return () => floatingAnimation.stop();
  }, [floatAnim]);

  useEffect(() => {
    if (selectedPlan) {
      const shimmerAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 2000, // Slower shimmer movement
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 1500, // Quick fade out
            useNativeDriver: true,
          }),
          Animated.delay(3000), // 3 second pause between shimmer effects
        ])
      );
      shimmerAnimation.start();
      return () => shimmerAnimation.stop();
    }
  }, [selectedPlan, shimmerAnim]);

  const handleBack = () => {
    // Always use goBack() to preserve navigation state and parameters
    if (navigation?.goBack) {
      navigation.goBack();
    } else if (navigation?.navigate) {
      // Fallback only if goBack is not available
      (navigation.navigate as any)(noScreen);
    }
  };

  const handleSubscribe = async (plan: "monthly" | "annual") => {
    // Track payment button clicked
    logEvent(PAYMENT_BUTTON_CLICKED, {
      button: plan === "monthly" ? "Subscribe Now" : "Subscribe Now", // Could be differentiated if needed
    });

    try {
      console.log(`📱 Starting subscription purchase for ${plan} plan`);

      // TEMPORARY: Call the subscribe API endpoint for testing (WILL BE REMOVED LATER)
      // This is a temporary testing implementation and will be replaced with proper subscription flow
      if (token && isAuthenticated) {
        try {
          console.log("🔄 Making temporary API call to subscribe endpoint...");
          const response = await fetch(
            `${AppConfig.api.baseUrl}/api/auth/subscribe`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.ok) {
            const result = await response.json();
            console.log("✅ Temporary subscribe API call successful:", result);
            Alert.alert(
              "Test Subscription",
              "Temporary subscribe API call successful! This is for testing only.",
              [{ text: "OK" }]
            );
          } else {
            console.error(
              "❌ Temporary subscribe API call failed:",
              response.status
            );
            Alert.alert(
              "Test Error",
              "Temporary subscribe API call failed. Check console for details.",
              [{ text: "OK" }]
            );
          }
        } catch (apiError) {
          console.error("❌ Error calling temporary subscribe API:", apiError);
          Alert.alert(
            "API Error",
            "Error calling temporary subscribe API. Check console for details.",
            [{ text: "OK" }]
          );
        }
      } else {
        console.log("⚠️ No token available for temporary API call");
        Alert.alert(
          "Authentication Required",
          "Please log in to test the subscribe API.",
          [{ text: "OK" }]
        );
      }
      // END TEMPORARY CODE

      // Find the corresponding product ID from loaded plans
      const selectedProduct = subscriptionPlans.find(
        (product) => product.period === (plan === "monthly" ? "month" : "year")
      );

      if (!selectedProduct) {
        Alert.alert(
          "Plan Not Available",
          "The selected plan is not available. Please try again.",
          [{ text: "OK" }]
        );
        return;
      }

      // Initiate the purchase
      const result = await purchaseSubscription(selectedProduct.id);

      if (result.success) {
        console.log(`📱 Successfully purchased ${plan} subscription`);

        // Track successful subscription
        logEvent(SUBSCRIBED, {
          plan: plan === "monthly" ? "monthly" : "yearly",
          method: "Apple Pay", // This would need to be determined from the actual payment method
        });

        // Set user subscription status
        setUserTraits({
          [USER_PROP_SUB_STATUS]: "active",
        });

        // Check if user needs to create an account
        if (!isAuthenticated) {
          console.log(
            "📱 Premium user needs to create account - showing forced auth modal"
          );
          setShowForcedAuthModal(true);
        } else {
          // Navigate back to the previous screen after successful purchase
          if (navigation && navigation.goBack) {
            navigation.goBack();
          }
        }
      }
      // Error handling is done in the hook with Alert.alert
    } catch (error: any) {
      console.error("❌ Subscription error:", error);
      Alert.alert(
        "Subscription Error",
        "Something went wrong. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  const handleForcedAuthSuccess = () => {
    console.log("📱 Premium user successfully created account");
    setShowForcedAuthModal(false);

    // Navigate back to the previous screen after account creation
    if (navigation && navigation.goBack) {
      navigation.goBack();
    }
  };

  const handleWatchAd = async () => {
    try {
      // Check if ad is ready
      if (!canShowAd) {
        console.log("📺 Ad not ready, trying to load...");
        Alert.alert("Loading Ad", "Please wait while we prepare your ad...", [
          { text: "OK" },
        ]);

        try {
          await loadAd();
        } catch (loadError) {
          console.error("📺 Failed to load ad:", loadError);
          Alert.alert(
            "Ad Unavailable",
            "No ads are available right now. Please try again later.",
            [{ text: "OK" }]
          );
          return;
        }
      }

      // Store previous count for animation
      setPreviousScanCount(scansLeft);

      console.log("📺 Showing rewarded ad...");

      // Show the ad and wait for completion
      const reward = await showAd();

      if (reward) {
        console.log("📺 Ad completed successfully, awarding reward:", reward);

        // Award the free scan
        awardFreeScan();

        // Show celebration modal
        setShowCelebrationModal(true);

        console.log("🎁 Free scan awarded through ad completion");

        // Load next ad for future use
        setTimeout(() => {
          loadAd().catch((error) => {
            console.warn("📺 Failed to preload next ad:", error);
          });
        }, 1000);
      } else {
        console.log("📺 Ad completed but no reward received");
        Alert.alert(
          "Ad Error",
          "There was an issue processing your reward. Please try again.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("📺 Error showing ad:", error);

      // Show user-friendly error message
      Alert.alert(
        "Ad Error",
        "Unable to show ad right now. Please check your internet connection and try again.",
        [
          {
            text: "Try Again",
            onPress: () => {
              // Try to load a new ad
              loadAd().catch((loadError) => {
                console.warn("📺 Failed to reload ad after error:", loadError);
              });
            },
          },
          { text: "Cancel", style: "cancel" },
        ]
      );
    }
  };

  // Dynamic styles based on screen height
  const dynamicStyles = {
    content: {
      flex: 1,
      paddingHorizontal: containerPadding,
      paddingTop: 0, // Keep at 0 since we're adding paddingTop inline
      justifyContent: "flex-start" as const,
    },
    title: {
      fontSize: titleFontSize,
      fontWeight: "800" as const,
      textAlign: "center" as const,
      color: "rgba(0, 0, 0, 0.9)", // Original color
      marginTop: 0,
      marginBottom: screenHeight * 0.008, // Reduced from 0.01 to 0.008
      marginLeft: screenHeight * 0.03,
      lineHeight: titleFontSize * 1.1,
      paddingHorizontal: containerPadding,
    },
    titlePremium: {
      marginTop: screenHeight * 0.02, // Reduced from 0.05 to 0.02
    },
    subtitle: {
      fontSize: subtitleFontSize,
      color: "rgba(0, 0, 0, 0.6)", // Original color
      textAlign: "center" as const,
      marginBottom: screenHeight * 0.015, // Reduced from 0.02 to 0.015
    },
    poopbotContainer: {
      alignItems: "center" as const,
      marginVertical: screenHeight * 0.015, // Reduced from 0.025 to 0.015
      height: poopbotSize,
      justifyContent: "center" as const,
    },
    planCard: {
      width: "48%",
      height: planCardHeight,
      borderRadius: borderRadius * 0.8,
      marginHorizontal: "1%",
      marginBottom: screenHeight * 0.02,
      overflow: "hidden" as const,
      backgroundColor: "rgba(255, 255, 255, 0.4)", // Original color
      borderWidth: 2,
      borderColor: "rgba(255, 255, 255, 0.4)", // Original color
      shadowColor: "#000", // Original color
      shadowOffset: { width: 0, height: screenHeight * 0.01 },
      shadowOpacity: 0.1,
      shadowRadius: screenHeight * 0.02,
      elevation: 8,
    },
    subscribeButton: {
      height: buttonHeight,
      minHeight: Math.max(buttonHeight, 60), // Ensure minimum height
      borderRadius: borderRadius * 0.67,
      marginHorizontal: containerPadding,
      marginBottom: screenHeight * 0.02,
      backgroundColor: "transparent", // Made transparent to remove white background
      borderWidth: 0, // Removed border
      borderColor: "transparent", // Made transparent
      shadowColor: "#000", // Original color
      shadowOffset: { width: 0, height: screenHeight * 0.01 },
      shadowOpacity: 0.15,
      shadowRadius: screenHeight * 0.02,
      elevation: 10,
    },
    subscribeText: {
      fontSize: Math.max(titleFontSize * 0.7, 16), // Minimum 16px for readability
      fontWeight: "800" as const,
      color: "white", // Original color
      textAlign: "center" as const,
    },
    planCardPrice: {
      fontSize: titleFontSize * 0.8, // 80% of title size
      fontWeight: "700" as const,
      color: "rgba(0, 0, 0, 0.9)", // Original color
      textAlign: "center" as const,
    },
    perMonthPrice: {
      fontSize: subtitleFontSize * 0.9, // 90% of subtitle size
      color: "rgba(0, 0, 0, 0.6)", // Original color
      textAlign: "center" as const,
    },
    focusNumber: {
      fontSize: titleFontSize * 1.5, // Larger for focus
      fontWeight: "800" as const,
      color: "rgba(0, 0, 0, 0.9)", // Original color
      textAlign: "center" as const,
    },
    timeframeText: {
      fontSize: subtitleFontSize,
      color: "rgba(0, 0, 0, 0.6)", // Original color
      textAlign: "center" as const,
    },
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackButton onPress={handleBack} />

      <View style={[dynamicStyles.content, { transform: [{ scale: 0.95 }] }]}>
        {/* Reduced padding top */}
        <Text
          style={[
            dynamicStyles.title,
            type === "premium-subscription" && dynamicStyles.titlePremium,
          ]}
        >
          {config.title}
        </Text>
        <Text
          style={[
            dynamicStyles.subtitle,
            type === "premium-subscription" && { marginBottom: 0 },
          ]}
        >
          {config.subtitle}
        </Text>
        {/* PoopBot Animation for Premium Subscription */}
        {type === "premium-subscription" && (
          <View style={dynamicStyles.poopbotContainer}>
            {/* Sparkles around PoopBot */}
            {sparkles.map((sparkle) => (
              <Animated.View
                key={sparkle.id}
                style={{
                  position: "absolute",
                  width: 4,
                  height: 4,
                  backgroundColor: "#FFD700",
                  borderRadius: 2,
                  opacity: sparkle.opacity,
                  transform: [
                    {
                      translateX: Animated.add(
                        new Animated.Value(sparkle.x),
                        sparkle.translateX
                      ),
                    },
                    {
                      translateY: Animated.add(
                        new Animated.Value(sparkle.y),
                        sparkle.translateY
                      ),
                    },
                  ],
                  shadowColor: "#FFD700",
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.8,
                  shadowRadius: 4,
                  elevation: 10,
                  zIndex: 3,
                }}
              />
            ))}

            {/* PoopBot with floating animation */}
            <Animated.View
              style={{
                transform: [
                  { scale: poopbotScale },
                  { translateY: poopbotFloatY },
                ],
              }}
            >
              <View style={styles.poopbotShadow}>
                <PoopbotSvg width={poopbotSize} height={poopbotSize} />
              </View>
            </Animated.View>
          </View>
        )}
        {/* Main Subscription Section */}
        <View
          style={[
            styles.subscriptionSection,
            !showFreeScanSection && styles.subscriptionSectionFullScreen,
            type === "premium-subscription" &&
              styles.premiumSubscriptionSection,
          ]}
        >
          {type === "premium-subscription" ? (
            // Premium subscription without BlurView background
            <View style={styles.subscriptionContainerNoBg}>
              {/* Plan Options - Two Plan Layout */}
              <View style={styles.plansRowPremium}>
                {/* Monthly Plan */}
                <TouchableOpacity
                  style={[
                    dynamicStyles.planCard,
                    selectedPlan === "monthly" && styles.selectedPlanCard,
                  ]}
                  onPress={() => setSelectedPlan("monthly")}
                >
                  {/* Monthly Banner */}
                  <View style={styles.planBannerMonthly}>
                    <Text style={styles.planBannerText}>Popular</Text>
                  </View>
                  <LinearGradient
                    colors={
                      selectedPlan === "monthly"
                        ? ["rgba(59, 130, 246, 0.3)", "rgba(147, 51, 234, 0.3)"]
                        : [
                            "rgba(255, 255, 255, 0.4)",
                            "rgba(255, 255, 255, 0.2)",
                          ]
                    }
                    style={styles.planCardGradient}
                  >
                    <View style={styles.focusNumberContainer}>
                      <Text style={styles.focusNumber}>
                        {config.monthlyText.focusNumber}
                      </Text>
                      <Text style={styles.timeframeTextTitle}>
                        {config.monthlyText.timeframe}
                      </Text>
                    </View>
                    <Text style={styles.perMonthPrice}>
                      {config.monthlyText.perMonthPrice}
                    </Text>
                    <View style={styles.dividerLine} />
                    <Text style={styles.planCardPrice}>
                      {config.monthlyText.price}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Annual Plan */}
                <TouchableOpacity
                  style={[
                    dynamicStyles.planCard,
                    selectedPlan === "annual" && styles.selectedPlanCard,
                  ]}
                  onPress={() => setSelectedPlan("annual")}
                >
                  {/* Annual Banner */}
                  <View style={styles.planBannerAnnual}>
                    <Text style={styles.planBannerText}>Best Value</Text>
                  </View>
                  {/* 45% Off Badge */}
                  <Animated.View
                    style={[
                      styles.discountBadge,
                      {
                        transform: [
                          { rotate: "10deg" },
                          {
                            translateY: floatAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, -3],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    <Text style={styles.discountText}>45% Off</Text>
                  </Animated.View>
                  <LinearGradient
                    colors={
                      selectedPlan === "annual"
                        ? [
                            "rgba(43, 226, 110, 0.56)",
                            "rgba(182, 238, 92, 0.56)",
                          ]
                        : [
                            "rgba(255, 255, 255, 0.4)",
                            "rgba(255, 255, 255, 0.2)",
                          ]
                    }
                    style={styles.planCardGradient}
                  >
                    <View style={styles.focusNumberContainer}>
                      <Text style={styles.focusNumber}>
                        {config.annualText.focusNumber}
                      </Text>
                      <Text style={styles.timeframeTextTitle}>
                        {config.annualText.timeframe}
                      </Text>
                    </View>
                    <Text style={styles.perMonthPrice}>
                      {config.annualText.perMonthPrice}
                    </Text>
                    <View style={styles.dividerLine} />
                    <Text style={styles.planCardPrice}>
                      {config.annualText.price}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {/* Premium Features Section */}
              <View style={styles.featuresSectionPremium}>
                <Text
                  style={{
                    fontSize: titleFontSize * 0.75,
                    fontWeight: "700",
                    color: "rgba(0, 0, 0, 0.9)", // Original color
                    textAlign: "center",
                    marginBottom: screenHeight * 0.015,
                  }}
                >
                  Premium PoopAI Includes:
                </Text>
                <View style={styles.featuresGrid}>
                  <View style={styles.feature}>
                    <Ionicons
                      name="star-outline"
                      size={screenHeight * 0.028}
                      color="#3b82f6"
                    />
                    <Text style={styles.featureText}>
                      Future Features, Already Yours
                    </Text>
                  </View>
                  <View style={styles.feature}>
                    <Ionicons
                      name="infinite"
                      size={screenHeight * 0.028}
                      color="#3b82f6"
                    />
                    <Text style={styles.featureText}>Unlimited Poop Scans</Text>
                  </View>
                  <View style={styles.feature}>
                    <Ionicons
                      name="calendar"
                      size={screenHeight * 0.028}
                      color="#3b82f6"
                    />
                    <Text style={styles.featureText}>Scan Calendar</Text>
                  </View>
                </View>
              </View>
            </View>
          ) : (
            // Regular subscription with BlurView background
            <BlurView
              intensity={40}
              style={[
                {
                  borderRadius: borderRadius,
                  paddingTop: containerPadding,
                  paddingHorizontal: containerPadding,
                  paddingBottom: containerPadding * 0.3, // Reduced bottom padding
                  borderWidth: 1.5,
                  borderColor: "rgba(99, 102, 241, 0.4)", // Original purple-blue border
                  backgroundColor: "rgba(139, 92, 246, 0.08)", // Original light purple tint
                  minHeight: "auto",
                  shadowColor: "rgba(99, 102, 241, 0.3)", // Original colored shadow
                  shadowOffset: { width: 0, height: screenHeight * 0.01 },
                  shadowOpacity: 0.2,
                  shadowRadius: screenHeight * 0.02,
                  elevation: 8,
                  overflow: "hidden",
                },
                selectedPlan === "monthly" && {
                  backgroundColor: "rgba(59, 130, 246, 0.08)",
                  borderColor: "rgba(59, 130, 246, 0.4)",
                },
                selectedPlan === "annual" && {
                  backgroundColor: "rgba(34, 197, 94, 0.08)",
                  borderColor: "rgba(34, 197, 94, 0.4)",
                },
              ]}
            >
              <Text
                style={{
                  fontSize: titleFontSize * 0.8,
                  fontWeight: "700",
                  color: "rgba(0, 0, 0, 0.9)", // Original color
                  textAlign: "center",
                  marginBottom: screenHeight * 0.02,
                }}
              >
                {config.choosePlanTitle}
              </Text>

              {/* Plan Options - Two Plan Layout */}
              <View style={styles.plansRow}>
                {/* Monthly Plan */}
                <TouchableOpacity
                  style={[
                    dynamicStyles.planCard,
                    selectedPlan === "monthly" && styles.selectedPlanCard,
                  ]}
                  onPress={() => setSelectedPlan("monthly")}
                >
                  {/* Monthly Banner */}
                  <View style={styles.planBannerMonthly}>
                    <Text style={styles.planBannerText}>Popular</Text>
                  </View>
                  <LinearGradient
                    colors={
                      selectedPlan === "monthly"
                        ? ["rgba(59, 130, 246, 0.3)", "rgba(147, 51, 234, 0.3)"]
                        : [
                            "rgba(255, 255, 255, 0.4)",
                            "rgba(255, 255, 255, 0.2)",
                          ]
                    }
                    style={styles.planCardGradient}
                  >
                    <View style={styles.focusNumberContainer}>
                      <Text style={styles.focusNumber}>
                        {config.monthlyText.focusNumber}
                      </Text>
                      <Text style={styles.timeframeTextTitle}>
                        {config.monthlyText.timeframe}
                      </Text>
                    </View>
                    <Text style={styles.perMonthPrice}>
                      {config.monthlyText.perMonthPrice}
                    </Text>
                    <View style={styles.dividerLine} />
                    <Text style={styles.planCardPrice}>
                      {config.monthlyText.price}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Annual Plan */}
                <TouchableOpacity
                  style={[
                    dynamicStyles.planCard,
                    selectedPlan === "annual" && styles.selectedPlanCard,
                  ]}
                  onPress={() => setSelectedPlan("annual")}
                >
                  {/* Annual Banner */}
                  <View style={styles.planBannerAnnual}>
                    <Text style={styles.planBannerText}>Best Value</Text>
                  </View>
                  {/* 45% Off Badge */}
                  <Animated.View
                    style={[
                      styles.discountBadge,
                      {
                        transform: [
                          { rotate: "10deg" },
                          {
                            translateY: floatAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, -3],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    <Text style={styles.discountText}>45% Off</Text>
                  </Animated.View>
                  <LinearGradient
                    colors={
                      selectedPlan === "annual"
                        ? [
                            "rgba(43, 226, 110, 0.56)",
                            "rgba(182, 238, 92, 0.56)",
                          ]
                        : [
                            "rgba(255, 255, 255, 0.4)",
                            "rgba(255, 255, 255, 0.2)",
                          ]
                    }
                    style={styles.planCardGradient}
                  >
                    <View style={styles.focusNumberContainer}>
                      <Text style={styles.focusNumber}>
                        {config.annualText.focusNumber}
                      </Text>
                      <Text style={styles.timeframeTextTitle}>
                        {config.annualText.timeframe}
                      </Text>
                    </View>
                    <Text style={styles.perMonthPrice}>
                      {config.annualText.perMonthPrice}
                    </Text>
                    <View style={styles.dividerLine} />
                    <Text style={styles.planCardPrice}>
                      {config.annualText.price}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {/* Premium Features Section */}
              <View style={styles.featuresSection}>
                <Text
                  style={{
                    fontSize: titleFontSize * 0.75,
                    fontWeight: "700",
                    color: "rgba(0, 0, 0, 0.9)", // Original color
                    textAlign: "center",
                    marginBottom: screenHeight * 0.015,
                  }}
                >
                  Premium PoopAI Includes:
                </Text>
                <View style={styles.featuresGrid}>
                  <View style={styles.feature}>
                    <Ionicons
                      name="star-outline"
                      size={screenHeight * 0.028}
                      color="#3b82f6"
                    />
                    <Text style={styles.featureText}>
                      Future Features, Already Yours
                    </Text>
                  </View>
                  <View style={styles.feature}>
                    <Ionicons
                      name="infinite"
                      size={screenHeight * 0.028}
                      color="#3b82f6"
                    />
                    <Text style={styles.featureText}>Unlimited Poop Scans</Text>
                  </View>
                  <View style={styles.feature}>
                    <Ionicons
                      name="calendar"
                      size={screenHeight * 0.028}
                      color="#3b82f6"
                    />
                    <Text style={styles.featureText}>Scan Calendar</Text>
                  </View>
                </View>
              </View>

              {/* Subscribe Button */}
              <TouchableOpacity
                style={[
                  dynamicStyles.subscribeButton,
                  (!selectedPlan || isPurchasing) &&
                    styles.subscribeButtonDisabled,
                ]}
                onPress={() =>
                  selectedPlan && !isPurchasing && handleSubscribe(selectedPlan)
                }
                disabled={!selectedPlan || isPurchasing}
              >
                <BlurView
                  intensity={50}
                  style={[
                    styles.subscribeBlur,
                    selectedPlan === "monthly" && {
                      backgroundColor: "rgba(59, 130, 246, 0.1)",
                    },
                    selectedPlan === "annual" && {
                      backgroundColor: "rgba(34, 197, 94, 0.1)",
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.frostedGlassContainer,
                      selectedPlan === "monthly" && {
                        borderColor: "rgba(59, 130, 246, 0.5)",
                      },
                      selectedPlan === "annual" && {
                        borderColor: "rgba(34, 197, 94, 0.5)",
                      },
                    ]}
                  >
                    <LinearGradient
                      colors={
                        selectedPlan === "monthly"
                          ? [
                              "rgba(59, 130, 246, 0.4)",
                              "rgba(147, 51, 234, 0.35)",
                            ]
                          : selectedPlan === "annual"
                            ? [
                                "rgba(34, 197, 94, 0.4)",
                                "rgba(132, 204, 22, 0.35)",
                              ]
                            : [
                                "rgba(255, 255, 255, 0.15)",
                                "rgba(255, 255, 255, 0.05)",
                              ]
                      }
                      style={styles.subscribeGradient}
                    >
                      <View style={styles.glassReflection} />
                      {selectedPlan && (
                        <Animated.View
                          style={[
                            styles.shimmerOverlay,
                            {
                              opacity: shimmerAnim.interpolate({
                                inputRange: [0, 0.5, 1],
                                outputRange: [0, 0.7, 0],
                              }),
                              transform: [
                                {
                                  translateX: shimmerAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [-120, 320],
                                  }),
                                },
                              ],
                            },
                          ]}
                        />
                      )}
                      <Text
                        style={[
                          dynamicStyles.subscribeText,
                          (!selectedPlan || isPurchasing) &&
                            styles.subscribeTextDisabled,
                        ]}
                      >
                        {isPurchasing
                          ? "Processing..."
                          : selectedPlan
                            ? "Continue"
                            : "Select a Plan"}
                      </Text>
                    </LinearGradient>
                  </View>
                </BlurView>
              </TouchableOpacity>
            </BlurView>
          )}
        </View>
        {/* Bottom Continue Button for Premium Subscription */}
        {type === "premium-subscription" && (
          <View style={styles.bottomButtonContainer}>
            <TouchableOpacity
              style={[
                styles.subscribeButton,
                (!selectedPlan || isPurchasing) &&
                  styles.subscribeButtonDisabled,
              ]}
              onPress={() =>
                selectedPlan && !isPurchasing && handleSubscribe(selectedPlan)
              }
              disabled={!selectedPlan || isPurchasing}
            >
              <BlurView
                intensity={50}
                style={[
                  styles.subscribeBlur,
                  selectedPlan === "monthly" && {
                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                  },
                  selectedPlan === "annual" && {
                    backgroundColor: "rgba(34, 197, 94, 0.1)",
                  },
                ]}
              >
                <View
                  style={[
                    styles.frostedGlassContainer,
                    selectedPlan === "monthly" && {
                      borderColor: "rgba(59, 130, 246, 0.5)",
                    },
                    selectedPlan === "annual" && {
                      borderColor: "rgba(34, 197, 94, 0.5)",
                    },
                  ]}
                >
                  <LinearGradient
                    colors={
                      selectedPlan === "monthly"
                        ? [
                            "rgba(59, 130, 246, 0.4)",
                            "rgba(147, 51, 234, 0.35)",
                          ]
                        : selectedPlan === "annual"
                          ? [
                              "rgba(34, 197, 94, 0.4)",
                              "rgba(132, 204, 22, 0.35)",
                            ]
                          : [
                              "rgba(255, 255, 255, 0.15)",
                              "rgba(255, 255, 255, 0.05)",
                            ]
                    }
                    style={styles.subscribeGradient}
                  >
                    <View style={styles.glassReflection} />
                    {selectedPlan && (
                      <Animated.View
                        style={[
                          styles.shimmerOverlay,
                          {
                            opacity: shimmerAnim.interpolate({
                              inputRange: [0, 0.5, 1],
                              outputRange: [0, 0.7, 0],
                            }),
                            transform: [
                              {
                                translateX: shimmerAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [-120, 320],
                                }),
                              },
                            ],
                          },
                        ]}
                      />
                    )}
                    <Text
                      style={[
                        dynamicStyles.subscribeText,
                        (!selectedPlan || isPurchasing) &&
                          styles.subscribeTextDisabled,
                      ]}
                    >
                      {isPurchasing
                        ? "Processing..."
                        : selectedPlan
                          ? "Continue"
                          : "Select a Plan"}
                    </Text>
                  </LinearGradient>
                </View>
              </BlurView>
            </TouchableOpacity>
          </View>
        )}
        {/* Or Divider */}
        {showFreeScanSection && (
          <View style={styles.orDivider}>
            <Text style={styles.orText}>Or</Text>
          </View>
        )}
        {/* Free Scans Section */}
        {showFreeScanSection && (
          <View style={styles.freeSection}>
            <BlurView
              intensity={20}
              style={{
                borderRadius: borderRadius,
                padding: containerPadding,
                backgroundColor: "rgba(255, 255, 255, 0.1)", // Original color
                borderWidth: 1,
                borderColor: "rgba(255, 255, 255, 1)", // Original color
                overflow: "hidden",
              }}
            >
              <Text
                style={{
                  fontSize: titleFontSize * 0.7,
                  fontWeight: "700",
                  color: "rgba(0, 0, 0, 0.9)", // Original color
                  textAlign: "center",
                  marginBottom: screenHeight * 0.01,
                }}
              >
                {config.freeScanSection?.title}
              </Text>
              <Text
                style={{
                  fontSize: subtitleFontSize * 0.9,
                  color: "rgba(0, 0, 0, 0.6)", // Original color
                  textAlign: "center",
                  marginBottom: screenHeight * 0.02,
                }}
              >
                {config.freeScanSection?.subtitle}
              </Text>

              <TouchableOpacity
                style={[
                  {
                    height: buttonHeight * 0.8,
                    borderRadius: borderRadius * 0.6,
                    marginTop: screenHeight * 0.01,
                    backgroundColor: "rgba(255, 255, 255, 0.2)", // Original color
                    borderWidth: 1.5,
                    borderColor: "rgba(255, 255, 255, 0.4)", // Original color
                    shadowColor: "#000", // Original color
                    shadowOffset: { width: 0, height: screenHeight * 0.005 },
                    shadowOpacity: 0.15,
                    shadowRadius: screenHeight * 0.015,
                    elevation: 6,
                  },
                  (isAdLoading || !canShowAd) && styles.watchAdButtonDisabled,
                ]}
                onPress={handleWatchAd}
                disabled={isAdLoading}
              >
                <BlurView intensity={30} style={styles.watchAdBlur}>
                  <View style={styles.watchAdContent}>
                    {isAdLoading ? (
                      <>
                        <Text
                          style={{
                            fontSize: subtitleFontSize,
                            fontWeight: "600",
                            color: "rgba(0, 0, 0, 0.9)",
                            textAlign: "center",
                          }}
                        >
                          Preparing Share...
                        </Text>
                        <View style={styles.loadingDots}>
                          <Text style={styles.dotText}>•</Text>
                          <Text style={styles.dotText}>•</Text>
                          <Text style={styles.dotText}>•</Text>
                        </View>
                      </>
                    ) : !canShowAd ? (
                      <Text
                        style={{
                          fontSize: subtitleFontSize,
                          fontWeight: "600",
                          color: "rgba(0, 0, 0, 0.7)",
                          textAlign: "center",
                        }}
                      >
                        Share Not Ready
                      </Text>
                    ) : (
                      <>
                        <Text
                          style={{
                            fontSize: subtitleFontSize,
                            fontWeight: "700",
                            color: "rgba(0, 0, 0, 0.9)",
                            textAlign: "center",
                          }}
                        >
                          {config.freeScanSection?.buttonText}
                        </Text>
                        <Text
                          style={{
                            fontSize: subtitleFontSize * 0.8,
                            color: "rgba(0, 0, 0, 0.6)",
                            textAlign: "center",
                          }}
                        >
                          🤝 Ready
                        </Text>
                      </>
                    )}
                  </View>
                </BlurView>
              </TouchableOpacity>

              <Text
                style={{
                  fontSize: subtitleFontSize * 0.75,
                  color: "rgba(0, 0, 0, 0.6)",
                  textAlign: "center",
                  marginTop: screenHeight * 0.015,
                  fontStyle: "italic",
                }}
              >
                {config.freeScanSection?.disclaimer}
              </Text>
            </BlurView>
          </View>
        )}
      </View>

      {/* Free Scan Celebration Modal */}
      <FreeScanCelebrationModal
        visible={showCelebrationModal}
        onClose={() => setShowCelebrationModal(false)}
        previousCount={previousScanCount}
        newCount={scansLeft}
      />

      {/* Forced Auth Modal for Premium Users */}
      <AuthModal
        visible={showForcedAuthModal}
        onClose={handleForcedAuthSuccess}
        forced={true}
      />
    </SafeAreaView>
  );
}

// Create dynamic styles function
const createStyles = (screenHeight: number, screenWidth: number) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "transparent",
    },
    errorText: {
      fontSize: screenHeight * 0.02, // Dynamic font size
      color: "red",
      textAlign: "center",
      padding: screenHeight * 0.025, // Dynamic padding
      marginTop: screenHeight * 0.06, // Dynamic margin
    },
    content: {
      flex: 1,
      paddingHorizontal: screenHeight * 0.025, // Dynamic padding
      paddingTop: 0,
      justifyContent: "flex-start",
    },
    title: {
      fontSize: screenHeight * 0.026, // Dynamic font size
      fontWeight: "800",
      textAlign: "center",
      color: "rgba(0, 0, 0, 0.9)",
      marginTop: 0,
      marginBottom: screenHeight * 0.01, // Dynamic margin
      marginLeft: screenHeight * 0.032, // Dynamic margin
      lineHeight: screenHeight * 0.024, // Dynamic line height
      paddingHorizontal: screenHeight * 0.028, // Dynamic padding
    },
    titlePremium: {
      marginTop: screenHeight * 0.02, // Dynamic margin
    },
    subtitle: {
      fontSize: screenHeight * 0.017, // Dynamic font size
      color: "rgba(0, 0, 0, 0.6)",
      textAlign: "center",
      marginBottom: screenHeight * 0.02, // Dynamic margin
    },
    subtitlePremium: {
      marginBottom: 0,
    },
    poopbotContainer: {
      alignItems: "center",
      marginVertical: screenHeight * 0.025, // Dynamic margin
      height: screenHeight * 0.17, // Dynamic height
      justifyContent: "center",
    },
    poopbotShadow: {
      shadowColor: "#000",
      shadowOffset: { width: 2, height: screenHeight * 0.007 }, // Dynamic shadow
      shadowOpacity: 0.15,
      shadowRadius: screenHeight * 0.015, // Dynamic shadow radius
      elevation: 8,
    },
    subscriptionSection: {
      flex: 0.7,
      marginBottom: Math.min(screenHeight * 0.04, 40), // Cap at 20px for large screens
    },
    subscriptionSectionFullScreen: {
      flex: 1,
      marginBottom: 0,
    },
    premiumSubscriptionSection: {
      flex: 1,
      marginBottom: screenHeight * 0.015, // Reduced from 0.025 to 0.015
    },
    bottomButtonContainer: {
      paddingHorizontal: 0,
      paddingBottom: 0,
    },
    subscriptionContainerNoBg: {
      padding: screenHeight * 0.018, // Reduced from 0.025 to 0.018
      paddingTop: screenHeight * 0.025, // Reduced from 0.05 to 0.025
      borderRadius: screenHeight * 0.03,
      minHeight: "auto",
      overflow: "hidden",
    },
    subscriptionContainer: {
      borderRadius: screenHeight * 0.03, // Dynamic border radius
      padding: screenHeight * 0.025, // Dynamic padding
      borderWidth: 1.5,
      borderColor: "rgba(99, 102, 241, 0.4)",
      backgroundColor: "rgba(139, 92, 246, 0.08)",
      minHeight: "auto",
      shadowColor: "rgba(99, 102, 241, 0.3)",
      shadowOffset: { width: 0, height: screenHeight * 0.01 }, // Dynamic shadow
      shadowOpacity: 0.2,
      shadowRadius: screenHeight * 0.025, // Dynamic shadow radius
      elevation: 12,
      overflow: "hidden",
    },
    sectionTitle: {
      fontSize: screenHeight * 0.024, // Dynamic font size
      fontWeight: "600",
      color: "rgba(0, 0, 0, 0.8)",
      textAlign: "center",
      marginBottom: screenHeight * 0.02, // Dynamic margin
    },
    featuresGrid: {
      flexDirection: "column", // Changed to vertical stacking
      alignItems: "center", // Center features horizontally
      marginBottom: screenHeight * 0.035, // Increased gap to continue button
      gap: screenHeight * 0.008, // Reduced gap between features
    },
    feature: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center", // Center content within each feature
      gap: screenHeight * 0.015, // Gap between icon and text
      paddingVertical: screenHeight * 0.008, // Reduced vertical padding
      paddingHorizontal: screenHeight * 0.01, // Horizontal padding
    },
    featureText: {
      fontSize: screenHeight * 0.02, // Increased from 0.017 to make text bigger
      color: "rgba(0, 0, 0, 0.8)",
      fontWeight: "600",
      lineHeight: screenHeight * 0.024, // Increased line height proportionally
    },
    featuresSection: {
      marginTop: screenHeight * 0.01, // Dynamic margin
      marginBottom: -screenHeight * 0.02, // Dynamic margin
      paddingHorizontal: screenHeight * 0.005, // Dynamic padding
    },
    featuresSectionPremium: {
      marginTop: screenHeight * 0.015, // Reduced gap above features
      marginBottom: screenHeight * 0.025, // Dynamic margin
      paddingHorizontal: screenHeight * 0.005, // Dynamic padding
    },
    featuresSectionTitle: {
      fontSize: screenHeight * 0.022, // Dynamic font size
      fontWeight: "600",
      color: "rgba(0, 0, 0, 0.8)",
      textAlign: "center",
      marginBottom: screenHeight * 0.02, // Dynamic margin
    },
    choosePlanTitle: {
      fontSize: screenHeight * 0.022, // Dynamic font size
      fontWeight: "600",
      color: "rgba(0, 0, 0, 0.8)",
      textAlign: "center",
      marginBottom: screenHeight * 0.02, // Dynamic margin
    },
    plansRow: {
      flexDirection: "row",
      gap: screenHeight * 0.015, // Dynamic gap
      marginBottom: screenHeight * 0.005, // Dynamic margin
    },
    plansRowPremium: {
      flexDirection: "row",
      gap: screenHeight * 0.015, // Dynamic gap
      marginTop: 0,
      marginBottom: screenHeight * 0.005, // Dynamic margin
    },
    planBannerMonthly: {
      backgroundColor: "#3b82f6",
      paddingVertical: screenHeight * 0.007, // Dynamic padding
      paddingHorizontal: screenHeight * 0.015, // Dynamic padding
      borderTopLeftRadius: screenHeight * 0.015, // Dynamic border radius
      borderTopRightRadius: screenHeight * 0.015, // Dynamic border radius
      alignItems: "center",
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 2,
    },
    planBannerAnnual: {
      backgroundColor: "#10b981",
      paddingVertical: screenHeight * 0.007, // Dynamic padding
      paddingHorizontal: screenHeight * 0.015, // Dynamic padding
      borderTopLeftRadius: screenHeight * 0.015, // Dynamic border radius
      borderTopRightRadius: screenHeight * 0.015, // Dynamic border radius
      alignItems: "center",
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 2,
    },
    planBannerText: {
      color: "white",
      fontSize: screenHeight * 0.014, // Dynamic font size
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    planCard: {
      flex: 1,
      borderRadius: screenHeight * 0.015, // Dynamic border radius
      overflow: "hidden",
      borderWidth: 2,
      borderColor: "transparent",
      minWidth: 0,
    },
    selectedPlanCard: {
      borderColor: "rgba(59, 130, 246, 0.5)",
      shadowColor: "#3b82f6",
      shadowOffset: { width: 0, height: screenHeight * 0.002 }, // Dynamic shadow
      shadowOpacity: 0.3,
      shadowRadius: screenHeight * 0.005, // Dynamic shadow radius
      elevation: 4,
    },
    planCardGradient: {
      padding: screenHeight * 0.01, // Dynamic padding
      paddingTop: screenHeight * 0.047, // Dynamic padding
      alignItems: "center",
      position: "relative",
      minHeight: screenHeight * 0.175, // Dynamic height
      borderRadius: screenHeight * 0.015, // Dynamic border radius
    },
    popularBadge: {
      position: "absolute",
      top: screenHeight * 0.005, // Dynamic position
      right: screenHeight * 0.005, // Dynamic position
      backgroundColor: "#10b981",
      paddingHorizontal: screenHeight * 0.005, // Dynamic padding
      paddingVertical: screenHeight * 0.001, // Dynamic padding
      borderRadius: screenHeight * 0.007, // Dynamic border radius
      zIndex: 1,
    },
    popularText: {
      color: "white",
      fontSize: screenHeight * 0.01, // Dynamic font size
      fontWeight: "600",
    },
    discountBadge: {
      position: "absolute",
      top: screenHeight * 0.035, // Dynamic position
      right: screenHeight * 0.005, // Dynamic position
      backgroundColor: "#ef4444",
      paddingHorizontal: screenHeight * 0.007, // Dynamic padding
      paddingVertical: screenHeight * 0.004, // Dynamic padding
      borderRadius: screenHeight * 0.01, // Dynamic border radius
      zIndex: 3,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: screenHeight * 0.002 }, // Dynamic shadow
      shadowOpacity: 0.2,
      shadowRadius: screenHeight * 0.004, // Dynamic shadow radius
      elevation: 4,
    },
    discountText: {
      color: "white",
      fontSize: screenHeight * 0.012, // Dynamic font size
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.3,
    },
    focusNumberContainer: {
      alignItems: "center",
      marginBottom: screenHeight * 0.01, // Dynamic margin
    },
    focusNumber: {
      fontSize: screenHeight * 0.052, // Dynamic font size
      fontWeight: "900",
      color: "rgba(0, 0, 0, 0.9)",
      lineHeight: screenHeight * 0.057, // Dynamic line height
    },
    timeframeText: {
      fontSize: screenHeight * 0.017, // Dynamic font size
      color: "rgba(0, 0, 0, 0.6)",
      fontWeight: "500",
      marginTop: screenHeight * -0.002, // Dynamic margin
    },
    timeframeTextTitle: {
      fontSize: screenHeight * 0.02, // Dynamic font size
      color: "rgba(0, 0, 0, 0.8)",
      fontWeight: "700",
      marginTop: screenHeight * 0.002, // Dynamic margin
      textAlign: "center",
    },
    dividerLine: {
      width: "60%",
      height: 1,
      backgroundColor: "rgba(0, 0, 0, 0.2)",
      marginVertical: screenHeight * 0.01, // Dynamic margin
    },
    planCardPrice: {
      fontSize: screenHeight * 0.022, // Dynamic font size
      fontWeight: "700",
      color: "rgba(0, 0, 0, 0.8)",
      marginBottom: screenHeight * 0.002, // Dynamic margin
    },
    perMonthPrice: {
      fontSize: screenHeight * 0.013, // Dynamic font size
      color: "rgba(0, 0, 0, 0.6)",
      fontWeight: "500",
      marginBottom: screenHeight * 0.002, // Dynamic margin
    },
    subscribeButton: {
      borderRadius: screenHeight * 0.03, // Dynamic border radius
      overflow: "hidden",
      marginTop: screenHeight * 0.01, // Dynamic margin
      shadowColor: "rgba(0, 0, 0, 0.3)",
      shadowOffset: { width: 0, height: screenHeight * 0.01 }, // Dynamic shadow
      shadowOpacity: 0.2,
      shadowRadius: screenHeight * 0.03, // Dynamic shadow radius
      elevation: 8,
    },
    subscribeButtonDisabled: {
      opacity: 0.7,
      shadowOpacity: 0.1,
    },
    subscribeBlur: {
      borderRadius: screenHeight * 0.03, // Dynamic border radius
      overflow: "hidden",
      backgroundColor: "rgba(255, 255, 255, 0.08)",
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.2)",
    },
    frostedGlassContainer: {
      borderRadius: screenHeight * 0.03, // Dynamic border radius
      overflow: "hidden",
      backgroundColor: "rgba(255, 255, 255, 0.05)",
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.2)",
    },
    subscribeGradient: {
      paddingVertical: screenHeight * 0.025, // Dynamic padding
      paddingHorizontal: screenHeight * 0.03, // Dynamic padding
      alignItems: "center",
      position: "relative",
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.3)",
      backgroundColor: "rgba(255, 255, 255, 0.08)",
    },
    glassReflection: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: "40%",
      backgroundColor: "rgba(255, 255, 255, 0.3)",
      opacity: 0.6,
    },
    shimmerOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(255, 255, 255, 0.4)",
      width: screenHeight * 0.15, // Dynamic width
      borderRadius: screenHeight * 0.025, // Dynamic border radius
      transform: [{ skewX: "-15deg" }],
      zIndex: 3,
    },
    subscribeText: {
      fontSize: screenHeight * 0.022, // Dynamic font size
      fontWeight: "700",
      textShadowColor: "rgba(255, 255, 255, 0.5)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 1,
      letterSpacing: 0.3,
      zIndex: 2,
    },
    subscribeTextDisabled: {
      color: "rgba(107, 114, 128, 0.7)",
    },
    orDivider: {
      alignItems: "center",
      marginTop: Math.min(screenHeight * 0.1, 60), // Cap at 30px for large screens
      marginBottom: Math.min(screenHeight * 0.015, 15), // Cap at 15px for large screens
    },
    orText: {
      fontSize: screenHeight * 0.017, // Dynamic font size
      color: "rgba(0, 0, 0, 0.5)",
      fontWeight: "500",
      textAlign: "center",
    },
    freeSection: {
      flex: 0.3,
    },
    freeScanContainer: {
      marginTop: screenHeight * 0.015, // Dynamic margin
      borderRadius: screenHeight * 0.03, // Dynamic border radius
      paddingVertical: screenHeight * 0.012, // Dynamic padding
      paddingHorizontal: screenHeight * 0.025, // Dynamic padding
      borderWidth: 1,
      borderColor: "rgba(156, 163, 175, 0.2)",
      backgroundColor: "rgba(255, 255, 255, 0.05)",
      shadowColor: "rgba(0, 0, 0, 0.1)",
      shadowOffset: { width: 0, height: screenHeight * 0.005 }, // Dynamic shadow
      shadowOpacity: 0.1,
      shadowRadius: screenHeight * 0.015, // Dynamic shadow radius
      elevation: 6,
      overflow: "hidden",
    },
    freeSectionTitle: {
      fontSize: screenHeight * 0.022, // Dynamic font size
      fontWeight: "600",
      color: "rgba(0, 0, 0, 0.7)",
      textAlign: "center",
      marginBottom: screenHeight * 0.01, // Dynamic margin
    },
    freeSectionSubtitle: {
      fontSize: screenHeight * 0.017, // Dynamic font size
      color: "rgba(0, 0, 0, 0.5)",
      textAlign: "center",
      marginBottom: screenHeight * 0.022, // Dynamic margin
      lineHeight: screenHeight * 0.022, // Dynamic line height
    },
    watchAdButton: {
      borderRadius: screenHeight * 0.02, // Dynamic border radius
      marginBottom: screenHeight * 0.015, // Dynamic margin
      overflow: "hidden",
      shadowColor: "rgba(0, 0, 0, 0.1)",
      shadowOffset: { width: 0, height: screenHeight * 0.002 }, // Dynamic shadow
      shadowOpacity: 0.1,
      shadowRadius: screenHeight * 0.007, // Dynamic shadow radius
      elevation: 3,
    },
    watchAdButtonDisabled: {
      opacity: 0.6,
      shadowOpacity: 0.05,
    },
    watchAdBlur: {
      flex: 1, // Fill the full height of parent container
      paddingVertical: screenHeight * 0.012, // Dynamic padding
      paddingHorizontal: screenHeight * 0.025, // Dynamic padding
      borderRadius: screenHeight * 0.02, // Dynamic border radius
      borderWidth: 1,
      borderColor: "rgba(230, 233, 188, 0.45)",
      backgroundColor: "rgba(193, 194, 138, 0.5)",
      overflow: "hidden",
      justifyContent: "center", // Center content vertically
    },
    watchAdContent: {
      alignItems: "center",
      justifyContent: "center",
    },
    watchAdText: {
      color: "white",
      fontSize: screenHeight * 0.017, // Dynamic font size
      fontWeight: "600",
      textAlign: "center",
    },
    adStatusText: {
      color: "rgba(255, 255, 255, 0.8)",
      fontSize: screenHeight * 0.012, // Dynamic font size
      fontWeight: "500",
      marginTop: screenHeight * 0.002, // Dynamic margin
      textAlign: "center",
    },
    loadingDots: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: screenHeight * 0.005, // Dynamic margin
      gap: screenHeight * 0.002, // Dynamic gap
    },
    dotText: {
      color: "rgba(255, 255, 255, 0.8)",
      fontSize: screenHeight * 0.015, // Dynamic font size
      fontWeight: "bold",
    },
    adDisclaimer: {
      fontSize: screenHeight * 0.013, // Dynamic font size
      color: "rgba(0, 0, 0, 0.5)",
      textAlign: "center",
      lineHeight: screenHeight * 0.017, // Dynamic line height
    },
  });
