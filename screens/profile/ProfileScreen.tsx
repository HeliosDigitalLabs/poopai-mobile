import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { BlurView } from "expo-blur";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useAuth } from "../../context/auth/AuthContext";
import { useOnboarding } from "../../context/features/OnboardingContext";
import { useDimensions } from "../../context/core/DimensionsContext";
import { RootStackParamList } from "../../types/navigation";
import HomeButton from "../../components/navigation/HomeButton";
import MiniCalendar from "../../components/calendar/MiniCalendar";
import LogoutConfirmationModal from "../../components/auth/LogoutConfirmationModal";
import HomeSvg from "../../assets/home.svg";
import { logEvent } from "../../lib/analytics";
import { PROFILE_OPENED, PROFILE_TIME_SPENT } from "../../lib/analyticsEvents";

type ProfileScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Profile"
>;

export default function ProfileScreen() {
  const { logout, user, isAuthenticated, setShowAuthOverlay } = useAuth();
  const { clearUnauthenticatedData } = useOnboarding();
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const screenStartTime = React.useRef<number>(Date.now());

  // Track profile screen opened
  React.useEffect(() => {
    logEvent(PROFILE_OPENED);
    screenStartTime.current = Date.now();
  }, []);

  // Track profile time spent when component unmounts or navigation changes
  React.useEffect(() => {
    const unsubscribe = navigation.addListener("blur", () => {
      const timeSpent = (Date.now() - screenStartTime.current) / 1000;
      logEvent(PROFILE_TIME_SPENT, {
        duration: parseFloat(timeSpent.toFixed(1)),
      });
    });

    return unsubscribe;
  }, [navigation]);

  // Check if user is authenticated when screen loads
  React.useEffect(() => {
    if (!isAuthenticated) {
      // Show auth modal with method selection (initial screen)
      setShowAuthOverlay(true);
      // Navigate back to home since user needs to authenticate
      navigation.goBack();
    }
  }, [isAuthenticated, setShowAuthOverlay, navigation]);

  // If not authenticated, don't render the screen content
  if (!isAuthenticated) {
    return null;
  }

  // Get current device dimensions from context
  const { screenHeight } = useDimensions();

  // Calculate responsive values based on screen height
  const headerButtonSize = screenHeight * 0.05; // 5% of screen height for buttons
  const titleFontSize = screenHeight * 0.04; // 4% of screen height for title
  const buttonFontSize = screenHeight * 0.024; // 2.4% of screen height for button text
  const buttonRadius = screenHeight * 0.025; // 2.5% of screen height for border radius
  const buttonMinHeight = screenHeight * 0.06; // 6% of screen height for button height

  const handleLogout = async () => {
    try {
      await logout(); // This now clears authentication history too
      // Navigate to the home screen specifically (not just go back)
      navigation.navigate("Home");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleLogoutPress = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    handleLogout();
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  const handleSettings = () => {
    navigation.navigate("Settings");
  };

  const handleHomeNavigation = () => {
    console.log("Home button pressed");
    try {
      navigation.navigate("Home");
      console.log("Navigation to Home called");
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };

  const handlePoopGoals = () => {
    navigation.navigate("PoopGoals");
  };

  const handleConditions = () => {
    navigation.navigate("Conditions");
  };

  const handleSymptoms = () => {
    navigation.navigate("Symptoms");
  };

  const handleCalendar = () => {
    // Check if user has premium status - if so, navigate directly to Calendar
    if (user?.profile?.premium) {
      console.log("User has premium, navigating directly to Calendar");
      navigation.navigate("Calendar");
    } else {
      // For non-premium users, show payment screen
      navigation.navigate("Payment", {
        noScreen: "Profile",
        type: "premium-subscription",
        preselection: "monthly",
        freeTrial: false,
      });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "transparent" }}>
      {/* Level 1: Header (15% of screen) - Home button, Profile title, Settings button */}
      <View
        style={{
          flexBasis: "15%",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: screenHeight * 0.025, // 2.5% horizontal padding
          paddingVertical: screenHeight * 0.05, // 1.5% vertical padding
          marginTop: screenHeight * 0.02,
        }}
      >
        {/* Home Button */}
        <TouchableOpacity
          onPress={handleHomeNavigation}
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 1, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <HomeSvg width={headerButtonSize} height={headerButtonSize} />
        </TouchableOpacity>

        {/* Profile Title */}
        <Text
          style={{
            fontSize: titleFontSize,
            fontWeight: "bold",
            color: "#654321", // Dark brown for consistency
            textAlign: "center",
          }}
        >
          Profile
        </Text>

        {/* Settings Button */}
        <TouchableOpacity
          onPress={handleSettings}
          style={{
            backgroundColor: "white",
            borderRadius: headerButtonSize * 0.5,
            width: headerButtonSize,
            height: headerButtonSize,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <Text style={{ fontSize: headerButtonSize * 0.5 }}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Level 2: Mini Calendar (35% of screen) */}
      <View
        style={{
          flexBasis: "40%",
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: screenHeight * 0.025, // 2.5% horizontal padding only
        }}
      >
        <MiniCalendar onViewCalendar={handleCalendar} />
      </View>

      {/* Level 3: Edit Poop Goals Button (10% of screen) */}
      <View
        style={{
          flexBasis: "10%",
          justifyContent: "center",
          alignItems: "center",
          paddingVertical: screenHeight * 0, // 1% vertical padding
          paddingHorizontal: screenHeight * 0.025, // 2.5% horizontal padding
        }}
      >
        <TouchableOpacity
          style={{
            borderRadius: buttonRadius * 1.2, // More rounded for bubbly effect
            backgroundColor: "rgba(139, 69, 19, 0.515)", // Slightly more visible brownish tint
            borderWidth: 5, // Thicker border for premium feel
            borderColor: "rgba(160, 82, 45, 0.3)", // More visible brown border
            shadowColor: "#8B4513",
            shadowOffset: { width: 0, height: 8 }, // Larger shadow
            shadowOpacity: 0.2,
            shadowRadius: 16, // More blur for floating effect
            elevation: 12,
            width: "100%",
            minHeight: buttonMinHeight,
            paddingVertical: screenHeight * 0.015,
            paddingHorizontal: screenHeight * 0.025,
            alignItems: "center",
            justifyContent: "center",
            // Enhanced glassmorphic gradient borders
            borderTopColor: "rgba(205, 164, 133, 0.75)", // Warmer top
            borderLeftColor: "rgba(160, 82, 45, 0.74)", // Visible left
            borderRightColor: "rgba(139, 69, 19, 0.72)", // Subtle right
            borderBottomColor: "rgba(101, 67, 33, 0.71)", // Darker bottom for depth
          }}
          onPress={handlePoopGoals}
          activeOpacity={0.7}
        >
          <Text
            style={{
              color: "#ffffff", // Dark brown for contrast with glassmorphic background
              fontSize: buttonFontSize,
              fontWeight: "800",
              textShadowColor: "rgba(0, 0, 0, 0.2)", // Dark shadow for proper depth
              textShadowOffset: { width: 0, height: 2 }, // Slightly more distance
              textShadowRadius: 4,
              letterSpacing: 0.5,
            }}
          >
            🎯 Edit Poop Goals
          </Text>
        </TouchableOpacity>
      </View>

      {/* Level 4: Edit Conditions Button (10% of screen) */}
      <View
        style={{
          flexBasis: "10%",
          justifyContent: "center",
          alignItems: "center",
          paddingVertical: screenHeight * 0.01, // 1% vertical padding
          paddingHorizontal: screenHeight * 0.025, // 2.5% horizontal padding
        }}
      >
        <TouchableOpacity
          style={{
            borderRadius: buttonRadius * 1.2, // More rounded for bubbly effect
            backgroundColor: "rgba(139, 69, 19, 0.515)", // Slightly more visible brownish tint
            borderWidth: 5, // Thicker border for premium feel
            borderColor: "rgba(160, 82, 45, 0.3)", // More visible brown border
            shadowColor: "#8B4513", // Brown shadow
            shadowOffset: { width: 0, height: 8 }, // Larger shadow
            shadowOpacity: 0.2,
            shadowRadius: 16, // More blur for floating effect
            elevation: 12,
            width: "100%",
            minHeight: buttonMinHeight,
            paddingVertical: screenHeight * 0.015,
            paddingHorizontal: screenHeight * 0.025,
            alignItems: "center",
            justifyContent: "center",
            // Enhanced glassmorphic gradient borders
            borderTopColor: "rgba(205, 164, 133, 0.75)", // Warmer top
            borderLeftColor: "rgba(160, 82, 45, 0.74)", // Visible left
            borderRightColor: "rgba(139, 69, 19, 0.72)", // Subtle right
            borderBottomColor: "rgba(101, 67, 33, 0.71)", // Darker bottom for depth
          }}
          onPress={handleConditions}
          activeOpacity={0.7}
        >
          <Text
            style={{
              color: "#ffffff", // Dark brown for contrast with glassmorphic background
              fontSize: buttonFontSize,
              fontWeight: "800",
              textShadowColor: "rgba(0, 0, 0, 0.2)", // Dark shadow for proper depth
              textShadowOffset: { width: 0, height: 2 }, // Slightly more distance
              textShadowRadius: 4,
              letterSpacing: 0.5,
            }}
          >
            🩺 Edit Conditions
          </Text>
        </TouchableOpacity>
      </View>

      {/* Level 5: Edit Symptoms Button (10% of screen) */}
      <View
        style={{
          flexBasis: "10%",
          justifyContent: "center",
          alignItems: "center",
          paddingVertical: screenHeight * 0.01, // 1% vertical padding
          paddingHorizontal: screenHeight * 0.025, // 2.5% horizontal padding
        }}
      >
        <TouchableOpacity
          style={{
            borderRadius: buttonRadius * 1.2, // More rounded for bubbly effect
            backgroundColor: "rgba(139, 69, 19, 0.515)", // Slightly more visible brownish tint
            borderWidth: 5, // Thicker border for premium feel
            borderColor: "rgba(160, 82, 45, 0.3)", // More visible brown border
            shadowColor: "#8B4513",
            shadowOffset: { width: 0, height: 8 }, // Larger shadow
            shadowOpacity: 0.2,
            shadowRadius: 16, // More blur for floating effect
            elevation: 12,
            width: "100%",
            minHeight: buttonMinHeight,
            paddingVertical: screenHeight * 0.015,
            paddingHorizontal: screenHeight * 0.025,
            alignItems: "center",
            justifyContent: "center",
            // Enhanced glassmorphic gradient borders
            borderTopColor: "rgba(205, 164, 133, 0.75)", // Warmer top
            borderLeftColor: "rgba(160, 82, 45, 0.74)", // Visible left
            borderRightColor: "rgba(139, 69, 19, 0.72)", // Subtle right
            borderBottomColor: "rgba(101, 67, 33, 0.71)", // Darker bottom for depth
          }}
          onPress={handleSymptoms}
          activeOpacity={0.7}
        >
          <Text
            style={{
              color: "#ffffff", // Dark brown for contrast with glassmorphic background
              fontSize: buttonFontSize,
              fontWeight: "800",
              textShadowColor: "rgba(0, 0, 0, 0.2)", // Dark shadow for proper depth
              textShadowOffset: { width: 0, height: 2 }, // Slightly more distance
              textShadowRadius: 4,
              letterSpacing: 0.5,
            }}
          >
            🤒 Edit Symptoms
          </Text>
        </TouchableOpacity>
      </View>

      {/* Level 6: Logout Button (20% of screen) with smaller padding */}
      <View
        style={{
          flexBasis: "15%",
          justifyContent: "center",
          alignItems: "center",
          paddingTop: screenHeight * 0, // 3% top padding (reduced from 15%)
          paddingBottom: screenHeight * 0.04, // 1% bottom padding (reduced from 5%)
          paddingHorizontal: screenHeight * 0.025, // 2.5% horizontal padding
        }}
      >
        <TouchableOpacity
          style={{
            borderRadius: buttonRadius,
            overflow: "hidden",
            backgroundColor: "rgba(153, 27, 27, 0.92)",
            borderWidth: 5,
            borderColor: "rgba(120, 15, 15, 0.6)",
            shadowColor: "#7f1d1d",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.25,
            shadowRadius: 12,
            elevation: 10,
            width: "100%",
            minHeight: buttonMinHeight,
          }}
          onPress={handleLogoutPress}
          activeOpacity={0.7}
        >
          <BlurView
            intensity={35}
            tint="light"
            style={{
              paddingVertical: screenHeight * 0.02,
              paddingHorizontal: screenHeight * 0.025,
              alignItems: "center",
              justifyContent: "center",
              minHeight: buttonMinHeight,
            }}
          >
            <Text
              style={{
                color: "#ffffff", // Dark red color
                fontSize: buttonFontSize,
                fontWeight: "800",
                textShadowColor: "rgba(176, 6, 6, 0.4)", // Light shadow for contrast with dark red text
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 4,
                letterSpacing: 0.5,
              }}
            >
              Logout
            </Text>
          </BlurView>
        </TouchableOpacity>
      </View>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmationModal
        visible={showLogoutModal}
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
      />
    </View>
  );
}
