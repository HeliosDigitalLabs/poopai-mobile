import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  Animated,
  PanResponder,
  ScrollView,
} from "react-native";
import { BlurView } from "expo-blur";
import { ScanService, ScanData } from "../../services/analysis/scanService";
import { Ionicons } from "@expo/vector-icons";
import { useDimensions } from "../../context/core/DimensionsContext";
import { LayoutAnimation, Platform, UIManager } from "react-native";

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

interface MiniCalendarProps {
  onDatePress?: (date: string) => void;
  onViewCalendar?: () => void;
}

interface DayData {
  date: Date;
  dateString: string;
  scans: ScanData[];
  isToday: boolean;
  isFuture: boolean;
  dayOfWeek: string;
  dayNumber: number;
}

const { width } = Dimensions.get("window");
const DAY_WIDTH = (width - 40) / 7; // Changed to 7 days visible (6 past + 1 today)
const FOCUSED_DAY_WIDTH = DAY_WIDTH * 3.5; // Increased from 2.5x to 3.5x to make it bigger
const FOCUSED_DAY_HEIGHT = FOCUSED_DAY_WIDTH * 1.2; // Slightly taller than square
const NORMAL_DAY_HEIGHT = 120; // Even taller normal days

export default function MiniCalendar({
  onDatePress,
  onViewCalendar,
}: MiniCalendarProps) {
  const [focusedDayIndex, setFocusedDayIndex] = useState(6); // Start with today at index 6 (rightmost position)
  const [scans, setScans] = useState<ScanData[]>([]);
  const [sevenDayData, setSevenDayData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [blurState, setBlurState] = useState<Record<string, boolean>>({}); // Per-day blur state
  const [focusedImageUrl, setFocusedImageUrl] = useState<string | null>(null);
  const [focusedImageLoading, setFocusedImageLoading] = useState(false);
  const [focusedImageError, setFocusedImageError] = useState<string | null>(
    null
  );
  const prevFocusedScanId = useRef<string | null>(null);

  // Get current device dimensions from context
  const { screenWidth, screenHeight } = useDimensions();

  // Calculate dynamic sizing based on screen width
  const baseDayWidth = (screenWidth - 40) / 7; // Base calculation
  const dayWidth = baseDayWidth * 1.5; // Make non-selected days 1.5x wider
  const focusedDayWidth = baseDayWidth * 3.5; // Keep focused day at 3.5x the base size
  // Responsive max height for focused day (22% of screen height, tweak as needed)
  const maxFocusedDayHeight = screenHeight * 0.22;
  const focusedDayHeight = Math.min(focusedDayWidth * 1.2, maxFocusedDayHeight);
  const normalDayHeight = 120;

  // Animation values for wheel effect
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollTimeout, setScrollTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);
  const lastScrollPosition = useRef(0);
  const scrollDirection = useRef<"left" | "right" | null>(null);

  useEffect(() => {
    loadScans();
    generateSevenDayData();
    // Set focusedDayIndex to today's index in the week (0=Mon, 6=Sun)
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)
    const mondayIndex = (dayOfWeek + 6) % 7; // 0 for Mon, 6 for Sun
    setFocusedDayIndex(mondayIndex);

    // Cleanup timeout on unmount
    return () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, []);

  useEffect(() => {
    if (scans.length > 0) {
      generateSevenDayData();
    }
  }, [scans]);

  // Scroll to position the focused day at the rightmost edge when component mounts
  useEffect(() => {
    if (sevenDayData.length > 0) {
      // Calculate the position needed to show the focused day at the right edge of the screen
      let scrollPosition = 0;

      // Add up all the widths of days before the focused day
      for (let i = 0; i < focusedDayIndex; i++) {
        scrollPosition += dayWidth + 8; // dayWidth + marginHorizontal (4px each side)
      }

      // Add the width of the focused day to get its right edge
      scrollPosition += focusedDayWidth;

      // Add the scroll content padding (15px on left side)
      scrollPosition += 15;

      // Add extra buffer to ensure it goes far enough right
      scrollPosition += 100; // Extra buffer to push it further right

      // Subtract the screen width to position the focused day's right edge at the screen's right edge
      const targetScrollPosition = scrollPosition - screenWidth;

      // Ensure we don't scroll past the content, but add extra margin
      const maxScrollPosition = Math.max(0, targetScrollPosition + 50); // Additional right margin

      // Scroll to the calculated position after ensuring ScrollView is ready
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          x: maxScrollPosition,
          animated: false, // No animation for initial positioning
        });
      }, 200); // Increased delay to ensure proper rendering
    }
  }, [sevenDayData]); // Only scroll once when data is ready — never again

  const loadScans = async () => {
    try {
      setLoading(true);
      const userScans = await ScanService.getUserScans();
      setScans(userScans);
    } catch (error) {
      console.error("Error loading scans:", error);
      setScans([]);
    } finally {
      setLoading(false);
    }
  };

  const generateSevenDayData = () => {
    const today = new Date();
    // Find Monday of the current week
    const dayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7)); // Monday as start

    const days: DayData[] = [];
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const dateString = date.toISOString().split("T")[0];
      const dayScans = scans.filter((scan) =>
        scan.created_at.startsWith(dateString)
      );
      days.push({
        date,
        dateString,
        scans: dayScans,
        isToday:
          date.getFullYear() === today.getFullYear() &&
          date.getMonth() === today.getMonth() &&
          date.getDate() === today.getDate(),
        isFuture: date > today,
        dayOfWeek: dayNames[i],
        dayNumber: date.getDate(),
      });
    }
    setSevenDayData(days);
  };

  // Helper to calculate the scroll offset for centering a day
  const getScrollOffsetForDay = (
    index: number,
    futureFocusedIndex?: number
  ) => {
    let offset = 0;
    for (let i = 0; i < sevenDayData.length; i++) {
      let widthForDay = dayWidth;
      if (i === (futureFocusedIndex ?? focusedDayIndex)) {
        widthForDay = focusedDayWidth;
      }
      if (i < index) {
        offset += widthForDay + 8; // 8 = marginHorizontal*2
      }
    }
    // Center the selected day
    let selectedWidth =
      index === (futureFocusedIndex ?? focusedDayIndex)
        ? focusedDayWidth
        : dayWidth;
    offset += selectedWidth / 2;
    offset -= screenWidth / 2;
    return Math.max(0, offset);
  };

  const handleDayPress = (index: number) => {
    if (index === focusedDayIndex) return;

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFocusedDayIndex(index);

    const day = sevenDayData[index];
    if (day && onDatePress) {
      onDatePress(day.dateString);
    }
  };

  const getAverageScore = (dayScans: ScanData[]) => {
    if (dayScans.length === 0) return null;
    const total = dayScans.reduce((sum, scan) => sum + scan.analysis.score, 0);
    return (total / dayScans.length).toFixed(1); // Score is already in 0-10 range
  };

  const getHighestScoredScan = (dayScans: ScanData[]) => {
    if (dayScans.length === 0) return null;
    return dayScans.reduce((highest, current) =>
      current.analysis.score > highest.analysis.score ? current : highest
    );
  };

  // Fetch signed URL for image when focused day or scan changes
  useEffect(() => {
    const day = sevenDayData[focusedDayIndex];
    if (!day || !day.scans.length) {
      setFocusedImageUrl(null);
      setFocusedImageLoading(false);
      setFocusedImageError(null);
      prevFocusedScanId.current = null;
      return;
    }
    const highestScoredScan = getHighestScoredScan(day.scans);
    if (!highestScoredScan) {
      setFocusedImageUrl(null);
      setFocusedImageLoading(false);
      setFocusedImageError(null);
      prevFocusedScanId.current = null;
      return;
    }
    // Always refetch when sevenDayData or focusedDayIndex changes (fixes initial load bug)
    prevFocusedScanId.current = highestScoredScan.id;
    setFocusedImageLoading(true);
    setFocusedImageError(null);
    let imageKey = highestScoredScan.image_url;

    // Strip leading "uploads/" if present
    if (imageKey.startsWith("uploads/")) {
      imageKey = imageKey.replace(/^uploads\//, "");
    } else {
      const lastSlash = imageKey.lastIndexOf("/");
      if (lastSlash !== -1) {
        imageKey = imageKey.substring(lastSlash + 1);
      }
    }

    console.log("🧼 Cleaned imageKey before requesting signed URL:", imageKey);

    if (!imageKey || imageKey.length === 0) {
      console.error(
        "MiniCalendar: imageKey is empty, not calling getSignedImageUrl"
      );
      setFocusedImageError("No image key");
      setFocusedImageLoading(false);
      return;
    }
    console.log(
      "MiniCalendar: About to call getSignedImageUrl with key:",
      imageKey
    );
    ScanService.getSignedImageUrl(imageKey)
      .then((signedUrl: string) => {
        console.log("Signed image URL:", signedUrl);
        setFocusedImageUrl(signedUrl);
        setFocusedImageLoading(false);
      })
      .catch((err: any) => {
        console.error("Failed to get signed image URL:", err);
        setFocusedImageError("Failed to load image");
        setFocusedImageUrl(null);
        setFocusedImageLoading(false);
      });
  }, [focusedDayIndex, sevenDayData]);

  const renderDayContent = (day: DayData, index: number) => {
    const isFocused = index === focusedDayIndex;
    const averageScore = getAverageScore(day.scans);
    const highestScoredScan = getHighestScoredScan(day.scans);

    if (isFocused && highestScoredScan) {
      // Focused day with scan preview - show highest scored scan image with average score
      const averageDayScore = averageScore || "0.0"; // Use average score for the day
      const isBlurred = blurState[day.dateString] ?? true; // Default to blurred for each day

      return (
        <View style={styles.focusedDayContent}>
          <View style={styles.focusedDayHeaderRow}>
            <Text style={styles.focusedDayOfWeek}>{day.dayOfWeek}</Text>
            <Text style={styles.focusedDayNumber}>{day.dayNumber}</Text>
          </View>

          <View style={styles.scanPreviewContainer}>
            <View style={styles.scanImageContainer}>
              {focusedImageLoading ? (
                <View
                  style={[
                    styles.scanImage,
                    { alignItems: "center", justifyContent: "center" },
                  ]}
                >
                  <Text style={{ color: "#654321", fontSize: 14 }}>
                    Loading...
                  </Text>
                </View>
              ) : focusedImageError ? (
                <View
                  style={[
                    styles.scanImage,
                    { alignItems: "center", justifyContent: "center" },
                  ]}
                >
                  <Text style={{ color: "#dc2626", fontSize: 14 }}>
                    Image failed
                  </Text>
                </View>
              ) : focusedImageUrl ? (
                <Image
                  source={{ uri: focusedImageUrl }}
                  style={styles.scanImage}
                />
              ) : null}
              {isBlurred && !focusedImageLoading && !focusedImageError && (
                <BlurView
                  intensity={25}
                  tint="light"
                  style={styles.blurOverlay}
                />
              )}
              <TouchableOpacity
                style={styles.blurToggle}
                onPress={() =>
                  setBlurState((prev) => ({
                    ...prev,
                    [day.dateString]: !isBlurred,
                  }))
                }
              >
                <Ionicons
                  name={isBlurred ? "eye-off" : "eye"}
                  size={24}
                  color="#654321"
                />
              </TouchableOpacity>
              {/* Score overlay on image */}
              <View style={styles.scoreOverlay}>
                <Text style={styles.scoreOverlayText}>{averageDayScore}</Text>
              </View>
            </View>
          </View>
        </View>
      );
    } else if (isFocused && !highestScoredScan) {
      // Focused day with no scan
      return (
        <View style={styles.focusedDayContent}>
          <View style={styles.focusedDayHeaderRow}>
            <Text style={styles.focusedDayOfWeek}>{day.dayOfWeek}</Text>
            <Text style={styles.focusedDayNumber}>{day.dayNumber}</Text>
          </View>

          <View style={styles.noScansContainer}>
            <Ionicons
              name="calendar-outline"
              size={32} // Increased from 24
              color="#8B4513" // Darker brown for subtle "No scans" state
            />
            <Text style={styles.noScansText}>No scans</Text>
          </View>
        </View>
      );
    } else {
      // Normal side day
      return (
        <View style={styles.normalDayContent}>
          <Text style={[styles.dayOfWeek, day.isToday && styles.todayText]}>
            {day.dayOfWeek}
          </Text>
          <Text style={[styles.dayNumber, day.isToday && styles.todayText]}>
            {day.dayNumber}
          </Text>

          {averageScore && (
            <View style={styles.smallScoreContainer}>
              <Text style={styles.smallScoreText}>{averageScore}</Text>
            </View>
          )}

          {day.scans.length > 0 && <View style={styles.scanIndicator} />}
        </View>
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <BlurView intensity={20} style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading calendar...</Text>
        </BlurView>
      </View>
    );
  }

  // Calculate dynamic font size for the View Full Calendar button
  const viewCalendarFontSize = Math.max(10, screenHeight * 0.018); // Minimum 18, scales up with screen

  return (
    <View style={styles.container}>
      <BlurView intensity={20} style={styles.calendarContainer}>
        <View style={{ flex: 1, width: "100%" }}>
          <View style={{ flex: 8, width: "100%", justifyContent: "center" }}>
            <ScrollView
              ref={scrollViewRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[
                styles.scrollContent,
                { alignItems: "center" },
              ]}
              decelerationRate="normal"
            >
              {sevenDayData.map((day, index) => {
                const isFocused = index === focusedDayIndex;

                return (
                  <Animated.View
                    key={day.dateString}
                    style={{
                      transform: [{ scale: isFocused ? 1 : 0.95 }],
                      opacity: isFocused ? 1 : 0.7,
                    }}
                  >
                    <TouchableOpacity
                      style={[
                        styles.dayContainer,
                        {
                          width: isFocused ? focusedDayWidth : dayWidth,
                          height: isFocused
                            ? focusedDayHeight
                            : normalDayHeight,
                        },
                        isFocused && styles.focusedDayContainer,
                        day.isToday && styles.todayContainer,
                      ]}
                      onPress={() => handleDayPress(index)}
                      activeOpacity={0.8}
                    >
                      <BlurView
                        intensity={isFocused ? 40 : 15}
                        style={styles.dayBlurContainer}
                      >
                        {renderDayContent(day, index)}
                      </BlurView>
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </ScrollView>
          </View>
          {onViewCalendar && (
            <View
              style={{
                flex: 1.5,
                width: "100%",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <TouchableOpacity
                style={[
                  styles.viewCalendarButton,
                  {
                    width: "60%",
                    height: "100%",
                    borderWidth: 1,
                    borderColor: "#8B4513",
                    backgroundColor: "rgba(139, 69, 19, 0.5)",
                  },
                ]}
                onPress={onViewCalendar}
              >
                <BlurView
                  intensity={30}
                  style={[
                    styles.buttonBlur,
                    {
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.viewCalendarText,
                      {
                        fontSize: viewCalendarFontSize,
                        lineHeight: viewCalendarFontSize,
                        color: "white",
                        textShadowColor: "rgba(0, 0, 0, 0.5)",
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 2,
                      },
                    ]}
                  >
                    📅 View Full Calendar
                  </Text>
                </BlurView>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  calendarContainer: {
    borderRadius: 28, // More rounded for bubbly effect
    paddingVertical: 18, // More generous padding
    borderWidth: 15, // Thicker border for premium feel
    borderColor: "rgba(139, 69, 19, 0.5)", // Slightly more visible brown border
    backgroundColor: "rgba(139, 69, 19, 0.12)", // Slightly more brownish tint
    overflow: "hidden",
    shadowColor: "#8B4513", // Brown shadow
    shadowOffset: { width: 0, height: 12 }, // Larger shadow offset
    shadowOpacity: 0.2,
    shadowRadius: 24, // Larger shadow radius for floating effect
    elevation: 12,
    // Enhanced glassmorphic borders with brown tint - more pronounced gradient
    borderTopColor: "rgba(205, 164, 133, 0.95)",
    borderLeftColor: "rgba(160, 82, 45, 0.95)",
    borderRightColor: "rgba(139, 69, 19, 0.95)",
    borderBottomColor: "rgba(101, 67, 33, 0.95)",
  },
  loadingContainer: {
    borderRadius: 28, // Match the main container
    padding: 24, // More generous padding
    alignItems: "center",
    justifyContent: "center",
    minHeight: 140, // Slightly taller
    backgroundColor: "rgba(139, 69, 19, 0.12)", // Match main container
    borderWidth: 2, // Thicker border
    borderColor: "rgba(139, 69, 19, 0.25)",
    borderTopColor: "rgba(205, 164, 133, 0.4)", // Warm top border
    borderLeftColor: "rgba(160, 82, 45, 0.3)",
    shadowColor: "#8B4513",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  loadingText: {
    color: "#654321", // Dark brown text
    fontSize: 16,
    fontWeight: "500",
  },
  scrollContent: {
    // Remove horizontal padding for seamless edge-to-edge scroll
    paddingHorizontal: 0,
  },
  dayContainer: {
    marginHorizontal: 4, // Increased margin
    borderRadius: 20, // Larger border radius
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    // Add thin brown border
    borderWidth: 1,
    borderColor: "#8B4513", // Thin brown border
  },
  focusedDayContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#8B4513",
    backgroundColor: "rgba(139, 69, 19, 0.5)", // Less opacity brown background
  },
  todayContainer: {
    borderWidth: 3,
    borderColor: "#8B4513",
  },
  dayBlurContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: 16, // Increased from 12 for larger content
  },
  focusedDayContent: {
    alignItems: "center",
    justifyContent: "flex-start",
    flex: 1,
    width: "100%",
  },
  normalDayContent: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  focusedDayHeaderRow: {
    flexDirection: "row",
    alignItems: "center", // Center vertically
    justifyContent: "center",
    gap: 4,
    marginBottom: 4,
    marginTop: 2,
  },
  focusedDayOfWeek: {
    fontSize: 14, // Smaller
    fontWeight: "500",
    color: "#654321",
    marginBottom: 0,
  },
  focusedDayNumber: {
    fontSize: 24, // Smaller
    fontWeight: "700",
    color: "#654321",
    marginBottom: 0,
  },
  dayOfWeek: {
    fontSize: 12, // Increased from 10
    fontWeight: "500",
    color: "#8B4513", // Slightly darker brown for smaller text
    marginBottom: 3, // Increased margin
  },
  dayNumber: {
    fontSize: 18, // Increased from 14
    fontWeight: "600",
    color: "#654321", // Dark brown text
    marginBottom: 6, // Increased margin
  },
  todayText: {
    color: "#654321", // Dark brown text
    textShadowColor: "rgba(255, 255, 255, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  scanPreviewContainer: {
    alignItems: "center",
    flex: 1,
    width: "100%",
    paddingHorizontal: 4,
    justifyContent: "flex-start",
  },
  scanImageContainer: {
    aspectRatio: 1, // Make it square
    width: "100%",
    maxHeight: "100%",
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 0,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  scanImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  blurOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  blurToggle: {
    position: "absolute",
    top: 6, // Increased positioning for bigger image
    right: 6, // Increased positioning for bigger image
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 16, // Increased border radius
    width: 32, // Increased from 28
    height: 32, // Increased from 28
    alignItems: "center",
    justifyContent: "center",
  },
  scoreOverlay: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  scoreOverlayText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#654321", // Dark brown text
    textAlign: "center",
  },
  smallScoreContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 8, // Increased border radius
    paddingHorizontal: 6, // Increased padding
    paddingVertical: 2,
    marginTop: 3, // Increased margin
  },
  smallScoreText: {
    fontSize: 10, // Increased from 8
    fontWeight: "600",
    color: "#654321", // Dark brown text
  },
  scanIndicator: {
    position: "absolute",
    bottom: 4, // Increased positioning
    width: 4, // Increased from 3
    height: 4, // Increased from 3
    borderRadius: 2, // Increased border radius
    backgroundColor: "#dc2626",
  },
  noScansContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  noScansText: {
    fontSize: 16, // Increased from 12
    color: "#8B4513", // Darker brown for subtle text
    marginTop: 8, // Increased margin
    fontWeight: "500",
  },
  viewCalendarButton: {
    marginTop: 20, // Increased margin
    borderRadius: 16, // Increased border radius
    overflow: "hidden",
    width: "80%",
    height: "100%",
  },
  buttonBlur: {
    paddingVertical: 5, // Increased padding
    paddingHorizontal: 5, // Increased padding
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  viewCalendarText: {
    fontSize: 18, // Increased from 16
    fontWeight: "600",
    color: "#654321", // Dark brown text
  },
});
