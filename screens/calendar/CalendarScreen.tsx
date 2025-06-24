import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  Dimensions,
  Modal,
  Image,
<<<<<<< HEAD
  Pressable,
=======
>>>>>>> 5a9bbd588055ef2a2b282113038f674c9f6c7304
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../types/navigation";
import { ScanService, ScanData } from "../../services/analysis/scanService";
import { BlurView } from "expo-blur";
import { logEvent } from "../../lib/analytics";
<<<<<<< HEAD
import DeleteConfirmationModal from "../../components/ui/DeleteConfirmationModal";
import { Ionicons } from "@expo/vector-icons";
=======
>>>>>>> 5a9bbd588055ef2a2b282113038f674c9f6c7304
import {
  CALENDAR_OPENED,
  CALENDAR_DAY_CLICKED,
  CALENDAR_TIME_SPENT,
} from "../../lib/analyticsEvents";

type CalendarScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Calendar"
>;

interface Props {
  navigation: CalendarScreenNavigationProp;
}

const { width, height } = Dimensions.get("window");

export default function CalendarScreen({ navigation }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [scans, setScans] = useState<ScanData[]>([]);
  const [scansByDate, setScansByDate] = useState<Record<string, ScanData[]>>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [signedImageUrls, setSignedImageUrls] = useState<
    Record<string, string>
  >({});
<<<<<<< HEAD
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [scanToDelete, setScanToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
=======
>>>>>>> 5a9bbd588055ef2a2b282113038f674c9f6c7304
  const screenStartTime = useRef<number>(Date.now());

  // Track calendar opened
  useEffect(() => {
    logEvent(CALENDAR_OPENED);
    screenStartTime.current = Date.now();
  }, []);

  // Track calendar time spent when component unmounts or navigation changes
  useEffect(() => {
    const unsubscribe = navigation.addListener("blur", () => {
      const timeSpent = (Date.now() - screenStartTime.current) / 1000;
      logEvent(CALENDAR_TIME_SPENT, {
        duration: parseFloat(timeSpent.toFixed(1)),
      });
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    loadScans();
  }, []);

  useEffect(() => {
    const grouped = ScanService.groupScansByDate(scans);
    setScansByDate(grouped);
  }, [scans]);

<<<<<<< HEAD
  // Debug: Watch for deleteModalVisible changes
  useEffect(() => {
    console.log("🔍 deleteModalVisible changed to:", deleteModalVisible);
    console.log("🔍 scanToDelete changed to:", scanToDelete);
  }, [deleteModalVisible, scanToDelete]);

=======
>>>>>>> 5a9bbd588055ef2a2b282113038f674c9f6c7304
  const loadScans = async () => {
    try {
      setLoading(true);
      const userScans = await ScanService.getUserScans();
      setScans(userScans);

      const urlMap: Record<string, string> = {};

      await Promise.all(
        userScans.map(async (scan) => {
          let imageKey = scan.image_url;
          if (imageKey.startsWith("uploads/")) {
            imageKey = imageKey.replace(/^uploads\//, "");
          } else {
            const lastSlash = imageKey.lastIndexOf("/");
            if (lastSlash !== -1) {
              imageKey = imageKey.substring(lastSlash + 1);
            }
          }

          try {
            const signedUrl = await ScanService.getSignedImageUrl(imageKey);
            urlMap[scan.id] = signedUrl;
          } catch (err) {
            console.warn("❌ Failed to get signed URL for scan:", scan.id);
          }
        })
      );

      setSignedImageUrls(urlMap);
    } catch (error) {
      console.error("Error loading scans:", error);
      Alert.alert("Error", "Failed to load scan data");
      setScans([]);
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  const handleDeleteScan = (scanId: string) => {
    console.log("🗑️ Delete button pressed for scan:", scanId);
    setModalVisible(false); // Hide the calendar modal
    setScanToDelete(scanId);
    setDeleteModalVisible(true);
    console.log("🗑️ State should be updated now");
  };

  const confirmDeleteScan = async () => {
    if (!scanToDelete) return;

    try {
      setIsDeleting(true);
      await ScanService.deleteScan(scanToDelete);

      // Remove the scan from local state
      setScans((prevScans) =>
        prevScans.filter((scan) => scan.id !== scanToDelete)
      );

      // Remove signed URL for the deleted scan
      setSignedImageUrls((prevUrls) => {
        const newUrls = { ...prevUrls };
        delete newUrls[scanToDelete];
        return newUrls;
      });

      console.log("✅ Scan deleted successfully");
    } catch (error) {
      console.error("❌ Failed to delete scan:", error);
      Alert.alert(
        "Delete Failed",
        "There was an error deleting the scan. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsDeleting(false);
      setDeleteModalVisible(false);
      // Reopen the calendar modal if a date is selected
      if (selectedDate) setModalVisible(true);
      setScanToDelete(null);
    }
  };

  const cancelDeleteScan = () => {
    setDeleteModalVisible(false);
    // Reopen the calendar modal if a date is selected
    if (selectedDate) setModalVisible(true);
    setScanToDelete(null);
  };

=======
>>>>>>> 5a9bbd588055ef2a2b282113038f674c9f6c7304
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const getDateString = (day: number) => {
    const localDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );

    // Force to local YYYY-MM-DD without using toISOString (which converts to UTC)
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, "0");
    const date = String(localDate.getDate()).padStart(2, "0");

    return `${year}-${month}-${date}`;
  };

  const isDateWithScan = (day: number) => {
    if (!day) return false;
    const dateStr = getDateString(day);
    return scansByDate[dateStr] && scansByDate[dateStr].length > 0;
  };

  const isToday = (day: number) => {
    if (!day) return false;
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const getScanCount = (day: number) => {
    if (!day) return 0;
    const dateStr = getDateString(day);
    return scansByDate[dateStr]?.length || 0;
  };

  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const handleDayPress = (day: number) => {
    if (!day) return;
    const dateStr = getDateString(day);

    // Track calendar day clicked
    logEvent(CALENDAR_DAY_CLICKED, {
      date: dateStr,
    });

    if (scansByDate[dateStr] && scansByDate[dateStr].length > 0) {
      setSelectedDate(dateStr);
      setModalVisible(true);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getBristolColor = (bristolType: number) => {
    const colors = [
      "#dc2626", // Type 1 - Red
      "#ea580c", // Type 2 - Orange-red
      "#d97706", // Type 3 - Orange
      "#10b981", // Type 4 - Green (ideal)
      "#059669", // Type 5 - Dark green
      "#0891b2", // Type 6 - Blue
      "#1e40af", // Type 7 - Dark blue
    ];
    return colors[bristolType - 1] || "#6b7280";
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const days = getDaysInMonth(currentDate);

  const selectedDateScans = selectedDate ? scansByDate[selectedDate] || [] : [];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Scan Calendar</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Calendar Container */}
        <View style={styles.calendarWrapper}>
          <LinearGradient
            colors={["rgba(255, 255, 255, 0.4)", "rgba(255, 255, 255, 0.2)"]}
            style={styles.calendarContainer}
          >
            {/* Month Navigation */}
            <View style={styles.monthHeader}>
              <TouchableOpacity
                onPress={goToPreviousMonth}
                style={styles.navButton}
              >
                <Text style={styles.navButtonText}>‹</Text>
              </TouchableOpacity>

              <Text style={styles.monthTitle}>
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </Text>

              <TouchableOpacity
                onPress={goToNextMonth}
                style={styles.navButton}
              >
                <Text style={styles.navButtonText}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Week Day Headers */}
            <View style={styles.weekDaysContainer}>
              {weekDays.map((day) => (
                <Text key={day} style={styles.weekDayText}>
                  {day}
                </Text>
              ))}
            </View>

            {/* Calendar Grid */}
            <View style={styles.daysContainer}>
              {days.map((day, index) => {
                const scanCount = day ? getScanCount(day) : 0;
                if (day) {
                  console.log(
                    "🧠 Date string for calendar cell",
                    getDateString(day)
                  );
                  console.log(
                    "📦 Available scan keys:",
                    Object.keys(scansByDate)
                  );
                }
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dayCell,
                      !day && styles.emptyDay,
                      day && isToday(day) && styles.todayCell,
                      day && isDateWithScan(day) && styles.scanDay,
                    ]}
                    onPress={() => day && handleDayPress(day)}
                    disabled={!day || !isDateWithScan(day)}
                  >
                    {day && (
                      <>
                        <Text
                          style={[
                            styles.dayText,
                            isToday(day) && styles.todayText,
                            isDateWithScan(day) && styles.scanDayText,
                          ]}
                        >
                          {day}
                        </Text>
                        {scanCount > 0 && (
                          <View style={styles.scanCountBadge}>
                            <Text style={styles.scanCountText}>
                              {scanCount}
                            </Text>
                          </View>
                        )}
                      </>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </LinearGradient>
        </View>

        {/* Monthly Summary */}
        <View style={styles.summaryWrapper}>
          <LinearGradient
            colors={["rgba(255, 255, 255, 0.4)", "rgba(255, 255, 255, 0.2)"]}
            style={styles.summaryContainer}
          >
            <Text style={styles.summaryTitle}>
              {monthNames[currentDate.getMonth()]} Summary
            </Text>
            <View style={styles.summaryStats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {
                    Object.keys(scansByDate).filter((date) =>
                      date.startsWith(
                        `${currentDate.getFullYear()}-${(
                          currentDate.getMonth() + 1
                        )
                          .toString()
                          .padStart(2, "0")}`
                      )
                    ).length
                  }
                </Text>
                <Text style={styles.statLabel}>Days with Scans</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {
                    scans.filter((scan) =>
                      scan.created_at.startsWith(
                        `${currentDate.getFullYear()}-${(
                          currentDate.getMonth() + 1
                        )
                          .toString()
                          .padStart(2, "0")}`
                      )
                    ).length
                  }
                </Text>
                <Text style={styles.statLabel}>Total Scans</Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      </ScrollView>

      {/* Scan Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <BlurView intensity={20} style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={[
                "rgba(255, 255, 255, 0.95)",
                "rgba(255, 255, 255, 0.85)",
              ]}
              style={styles.modalContent}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {selectedDate && formatDate(selectedDate)}
                </Text>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeButtonText}>×</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScroll}>
                {selectedDateScans.map((scan, index) => (
                  <View key={scan.id} style={styles.scanItem}>
<<<<<<< HEAD
                    {/* Debug: Log scan ID */}
                    {(() => {
                      console.log("📊 Rendering scan with ID:", scan.id);
                      return null;
                    })()}

                    <View style={styles.scanHeader}>
                      <View style={styles.scanHeaderLeft}>
                        <View
                          style={[
                            styles.bristolIndicator,
                            {
                              backgroundColor: getBristolColor(
                                scan.analysis.bristolType
                              ),
                            },
                          ]}
                        />
                        <Text style={styles.scanTime}>
                          {formatTime(scan.created_at)}
                        </Text>
                        <Text style={styles.bristolType}>
                          Type {scan.analysis.bristolType}
                        </Text>
                      </View>

                      {/* Delete Button */}
                      <Pressable
                        style={[
                          styles.deleteButton,
                          {
                            backgroundColor: "rgba(255, 0, 0, 0.1)",
                            borderRadius: 16,
                          },
                        ]}
                        onPress={() => {
                          console.log(
                            "🔥 Pressable pressed, scan ID:",
                            scan.id
                          );
                          handleDeleteScan(scan.id);
                        }}
                        disabled={isDeleting}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={18}
                          color="rgba(220, 38, 38, 0.8)"
                        />
                      </Pressable>
=======
                    <View style={styles.scanHeader}>
                      <View
                        style={[
                          styles.bristolIndicator,
                          {
                            backgroundColor: getBristolColor(
                              scan.analysis.bristolType
                            ),
                          },
                        ]}
                      />
                      <Text style={styles.scanTime}>
                        {formatTime(scan.created_at)}
                      </Text>
                      <Text style={styles.bristolType}>
                        Type {scan.analysis.bristolType}
                      </Text>
>>>>>>> 5a9bbd588055ef2a2b282113038f674c9f6c7304
                    </View>

                    {/* Scan Image */}
                    {signedImageUrls[scan.id] && (
                      <View style={styles.scanImageContainer}>
                        <Image
                          source={{ uri: signedImageUrls[scan.id] }}
                          style={styles.scanImage}
                          resizeMode="cover"
                        />
                      </View>
                    )}

                    <Text style={styles.bristolName}>
                      {scan.analysis.bristolName}
                    </Text>

                    <Text style={styles.scanScore}>
                      Score: {scan.analysis.score}/10
                    </Text>

                    {scan.analysis.poopSummary && (
                      <Text style={styles.scanSummary}>
                        {scan.analysis.poopSummary}
                      </Text>
                    )}
                  </View>
                ))}
              </ScrollView>
            </LinearGradient>
          </View>
        </BlurView>
      </Modal>
<<<<<<< HEAD

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        visible={deleteModalVisible}
        onDelete={confirmDeleteScan}
        onKeep={cancelDeleteScan}
      />

      {/* Debug: Log modal state */}
      {(() => {
        console.log("🔍 Modal state - deleteModalVisible:", deleteModalVisible);
        console.log("🔍 Modal state - scanToDelete:", scanToDelete);
        return null;
      })()}
=======
>>>>>>> 5a9bbd588055ef2a2b282113038f674c9f6c7304
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonText: {
    fontSize: 24,
    color: "rgba(0, 0, 0, 0.7)",
    fontWeight: "600",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "rgba(0, 0, 0, 0.8)",
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  calendarWrapper: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  calendarContainer: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    borderTopColor: "rgba(205, 164, 133, 0.95)",
    borderLeftColor: "rgba(160, 82, 45, 0.95)",
    borderRightColor: "rgba(139, 69, 19, 0.95)",
    borderBottomColor: "rgba(101, 67, 33, 0.95)",
  },
  monthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  navButtonText: {
    fontSize: 20,
    color: "rgba(0, 0, 0, 0.7)",
    fontWeight: "600",
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "rgba(0, 0, 0, 0.8)",
  },
  weekDaysContainer: {
    flexDirection: "row",
    marginBottom: 10,
  },
  weekDayText: {
    flex: 1,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(0, 0, 0, 0.6)",
    paddingVertical: 8,
  },
  daysContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: `${100 / 7}%`,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginBottom: 4,
  },
  emptyDay: {
    // Empty cells for days before the first day of the month
  },
  todayCell: {
    backgroundColor: "rgba(59, 130, 246, 0.3)",
    borderRadius: 25,
  },
  scanDay: {
    backgroundColor: "rgba(16, 185, 129, 0.3)",
    borderRadius: 25,
  },
  dayText: {
    fontSize: 16,
    color: "rgba(0, 0, 0, 0.7)",
    fontWeight: "500",
  },
  todayText: {
    color: "#3b82f6",
    fontWeight: "700",
  },
  scanDayText: {
    color: "#10b981",
    fontWeight: "700",
  },
  scanCountBadge: {
    position: "absolute",
    top: 2,
    right: 8,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#dc2626",
    alignItems: "center",
    justifyContent: "center",
  },
  scanCountText: {
    fontSize: 10,
    color: "white",
    fontWeight: "600",
  },
  summaryWrapper: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  summaryContainer: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderTopColor: "rgba(205, 164, 133, 0.95)",
    borderLeftColor: "rgba(160, 82, 45, 0.95)",
    borderRightColor: "rgba(139, 69, 19, 0.95)",
    borderBottomColor: "rgba(101, 67, 33, 0.95)",
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "rgba(0, 0, 0, 0.8)",
    marginBottom: 16,
    textAlign: "center",
  },
  summaryStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#10b981",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "rgba(0, 0, 0, 0.6)",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: width * 0.9,
    maxHeight: height * 0.7,
    borderRadius: 20,
    overflow: "hidden",
  },
  modalContent: {
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "rgba(0, 0, 0, 0.8)",
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    fontSize: 24,
    color: "rgba(0, 0, 0, 0.6)",
    fontWeight: "300",
  },
  modalScroll: {
    maxHeight: height * 0.5,
  },
  scanItem: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  scanHeader: {
    flexDirection: "row",
    alignItems: "center",
<<<<<<< HEAD
    justifyContent: "space-between",
    marginBottom: 8,
  },
  scanHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
=======
    marginBottom: 8,
  },
>>>>>>> 5a9bbd588055ef2a2b282113038f674c9f6c7304
  bristolIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  scanTime: {
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(0, 0, 0, 0.7)",
    marginRight: 8,
  },
  bristolType: {
    fontSize: 12,
    color: "rgba(0, 0, 0, 0.5)",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  bristolName: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(0, 0, 0, 0.8)",
    marginBottom: 4,
  },
  scanScore: {
    fontSize: 14,
    fontWeight: "500",
    color: "#10b981",
    marginBottom: 8,
  },
  scanSummary: {
    fontSize: 14,
    color: "rgba(0, 0, 0, 0.6)",
    lineHeight: 20,
  },
  scanImageContainer: {
    marginVertical: 12,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  scanImage: {
    width: "100%",
    height: 120,
    borderRadius: 12,
  },
<<<<<<< HEAD
  deleteButton: {
    padding: 12,
    zIndex: 1000,
    elevation: 5,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 44,
    minHeight: 44,
  },
  deleteButtonBlur: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
=======
>>>>>>> 5a9bbd588055ef2a2b282113038f674c9f6c7304
});
