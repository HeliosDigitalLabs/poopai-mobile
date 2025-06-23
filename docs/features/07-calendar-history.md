# Calendar & History System

## Overview

The calendar and history system provides users with comprehensive tracking and visualization of their digestive health over time. It includes a full monthly calendar view, a compact mini calendar for the profile screen, and detailed historical analysis with trends and patterns. The system integrates with the analysis results to provide meaningful insights into health patterns.

## Architecture

### Core Components

**Calendar Screen** (`screens/calendar/CalendarScreen.tsx`)

- Full monthly calendar with scan history
- Interactive day selection and details
- Monthly summary statistics
- Scan detail modal with analysis display

**Mini Calendar** (`components/calendar/MiniCalendar.tsx`)

- Compact 7-day horizontal scroll view
- Profile screen integration
- Quick day preview with scan images
- Average score calculation and display

**Scan Service** (`services/analysis/scanService.ts`)

- Historical scan data management
- Calendar data formatting and filtering
- Trend analysis and statistics
- Data synchronization with backend

## Implementation Details

### 1. Calendar Screen

**Location:** `screens/calendar/CalendarScreen.tsx`

**Purpose:**

- Comprehensive monthly view of scan history
- Detailed day-by-day analysis tracking
- Visual representation of health patterns
- Access to historical scan details

**Key Features:**

- **Monthly Navigation:** Swipe between months with smooth transitions
- **Scan Indicators:** Visual badges showing scan count per day
- **Bristol Type Colors:** Color-coded days based on Bristol scale results
- **Today Highlighting:** Clear indication of current date
- **Detail Modal:** Tap days for detailed scan information
- **Summary Statistics:** Monthly averages and trends

**State Management:**

```tsx
interface CalendarState {
  currentMonth: Date;
  selectedDay: Date | null;
  scanData: { [key: string]: DayScanData };
  isLoading: boolean;
  showDetailModal: boolean;
  monthlyStats: MonthlyStats;
}

interface DayScanData {
  date: string;
  scans: ScanRecord[];
  averageScore: number;
  bristolTypes: number[];
  totalScans: number;
}

interface MonthlyStats {
  totalScans: number;
  averageScore: number;
  mostCommonType: number;
  consistencyTrend: "improving" | "declining" | "stable";
  streakDays: number;
}
```

**Calendar Grid Implementation:**

```tsx
const renderCalendarGrid = () => {
  const daysInMonth = getDaysInMonth(currentMonth);
  const startDate = startOfMonth(currentMonth);
  const endDate = endOfMonth(currentMonth);
  const startDay = getDay(startDate); // Day of week (0-6)

  // Generate calendar grid with proper week alignment
  const calendarDays = [];

  // Add empty cells for days before month start
  for (let i = 0; i < startDay; i++) {
    calendarDays.push(null);
  }

  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    const dateKey = format(date, "yyyy-MM-dd");
    const dayData = scanData[dateKey];

    calendarDays.push({
      date,
      dateKey,
      dayData,
      isToday: isSameDay(date, new Date()),
      isSelected: selectedDay && isSameDay(date, selectedDay),
      hasScans: dayData && dayData.totalScans > 0,
    });
  }

  return (
    <View style={styles.calendarGrid}>
      {calendarDays.map((day, index) => (
        <CalendarDay
          key={index}
          day={day}
          onPress={() => handleDayPress(day)}
        />
      ))}
    </View>
  );
};
```

**Day Component with Scan Indicators:**

```tsx
const CalendarDay = ({ day, onPress }) => {
  if (!day) {
    return <View style={styles.emptyDay} />;
  }

  const { date, dayData, isToday, isSelected, hasScans } = day;

  // Determine day styling based on data
  const dayStyle = [
    styles.calendarDay,
    isToday && styles.todayDay,
    isSelected && styles.selectedDay,
    hasScans && styles.dayWithScans,
  ];

  // Get Bristol type color for background
  const bristolColor = dayData?.averageScore
    ? getBristolColor(dayData.averageScore)
    : "transparent";

  return (
    <TouchableOpacity
      style={[dayStyle, { backgroundColor: bristolColor }]}
      onPress={() => onPress(day)}
    >
      <Text style={styles.dayNumber}>{date.getDate()}</Text>

      {hasScans && (
        <View style={styles.scanBadge}>
          <Text style={styles.scanCount}>{dayData.totalScans}</Text>
        </View>
      )}

      {isToday && <View style={styles.todayIndicator} />}
    </TouchableOpacity>
  );
};
```

### 2. Mini Calendar Component

**Location:** `components/calendar/MiniCalendar.tsx`

**Purpose:**

- Compact calendar for profile screen
- Quick access to recent scan history
- Visual preview of scan images
- Smooth horizontal scrolling interface

**Key Features:**

- **7-Day View:** Horizontal scrolling with focused day
- **Scan Image Preview:** Blurred images with toggle
- **Average Score Display:** Quick health indicator
- **Smooth Animations:** Transition between days
- **Navigation Integration:** Links to full calendar

**Implementation:**

```tsx
const MiniCalendar = ({ onDaySelect, selectedDate }) => {
  const [days, setDays] = useState<CalendarDay[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(3); // Center day
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    generateDays();
  }, [selectedDate]);

  const generateDays = () => {
    const today = new Date();
    const startDate = subDays(today, 3); // 3 days before today
    const generatedDays = [];

    for (let i = 0; i < 7; i++) {
      const date = addDays(startDate, i);
      const dateKey = format(date, "yyyy-MM-dd");
      const dayData = getScanDataForDate(dateKey);

      generatedDays.push({
        date,
        dateKey,
        dayData,
        isToday: isSameDay(date, today),
        isSelected: selectedDate && isSameDay(date, selectedDate),
      });
    }

    setDays(generatedDays);
  };

  const handleDayPress = (day: CalendarDay, index: number) => {
    setFocusedIndex(index);
    onDaySelect?.(day.date);

    // Scroll to center the selected day
    scrollViewRef.current?.scrollTo({
      x: index * DAY_WIDTH - (SCREEN_WIDTH - DAY_WIDTH) / 2,
      animated: true,
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={DAY_WIDTH}
        decelerationRate="fast"
      >
        {days.map((day, index) => (
          <MiniCalendarDay
            key={day.dateKey}
            day={day}
            index={index}
            focusedIndex={focusedIndex}
            onPress={() => handleDayPress(day, index)}
          />
        ))}
      </ScrollView>

      {/* Focused Day Preview */}
      {days[focusedIndex] && <FocusedDayPreview day={days[focusedIndex]} />}
    </View>
  );
};
```

**Focused Day Preview:**

```tsx
const FocusedDayPreview = ({ day }) => {
  const [imageBlurred, setImageBlurred] = useState(true);

  if (!day.dayData || day.dayData.totalScans === 0) {
    return (
      <View style={styles.noScansPreview}>
        <Text style={styles.noScansText}>No scans for this day</Text>
      </View>
    );
  }

  const latestScan = day.dayData.scans[0]; // Most recent scan

  return (
    <View style={styles.previewContainer}>
      <TouchableOpacity
        style={styles.imageContainer}
        onPress={() => setImageBlurred(!imageBlurred)}
      >
        <Image
          source={{ uri: latestScan.imageUrl }}
          style={[styles.scanImage, imageBlurred && styles.blurredImage]}
        />
        {imageBlurred && (
          <View style={styles.blurOverlay}>
            <Ionicons name="eye-off" size={24} color="white" />
            <Text style={styles.blurText}>Tap to reveal</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.scoreContainer}>
        <Text style={styles.scoreLabel}>Average Score</Text>
        <Text style={styles.scoreValue}>
          {day.dayData.averageScore.toFixed(1)}/7
        </Text>
        <Text style={styles.bristolType}>
          {getBristolTypeName(day.dayData.averageScore)}
        </Text>
      </View>
    </View>
  );
};
```

### 3. Scan Service & Data Management

**Location:** `services/analysis/scanService.ts`

**Purpose:**

- Retrieve and format scan history for calendar display
- Calculate monthly and daily statistics
- Provide trend analysis and insights
- Handle data synchronization between local and backend storage

**Core Functions:**

```tsx
// Get scan data for specific month
const getMonthScanData = async (
  year: number,
  month: number,
  userId?: string
): Promise<{ [key: string]: DayScanData }>

// Get scan history for date range
const getScanHistoryRange = async (
  startDate: Date,
  endDate: Date,
  userId?: string
): Promise<ScanRecord[]>

// Calculate monthly statistics
const calculateMonthlyStats = (
  scanData: { [key: string]: DayScanData }
): Promise<MonthlyStats>

// Get trending insights
const getTrendInsights = (
  currentMonth: MonthlyStats,
  previousMonth: MonthlyStats
): TrendInsight[]
```

**Data Processing:**

```tsx
const getMonthScanData = async (
  year: number,
  month: number,
  userId?: string
) => {
  try {
    // Fetch raw scan history
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    const scans = await getScanHistoryRange(startDate, endDate, userId);

    // Group scans by date
    const groupedData: { [key: string]: DayScanData } = {};

    scans.forEach((scan) => {
      const dateKey = format(new Date(scan.analyzedAt), "yyyy-MM-dd");

      if (!groupedData[dateKey]) {
        groupedData[dateKey] = {
          date: dateKey,
          scans: [],
          averageScore: 0,
          bristolTypes: [],
          totalScans: 0,
        };
      }

      groupedData[dateKey].scans.push(scan);
      groupedData[dateKey].bristolTypes.push(scan.score);
      groupedData[dateKey].totalScans++;
    });

    // Calculate averages for each day
    Object.keys(groupedData).forEach((dateKey) => {
      const dayData = groupedData[dateKey];
      dayData.averageScore =
        dayData.bristolTypes.reduce((a, b) => a + b, 0) /
        dayData.bristolTypes.length;
    });

    return groupedData;
  } catch (error) {
    console.error("Failed to get month scan data:", error);
    throw error;
  }
};
```

**Statistics Calculation:**

```tsx
const calculateMonthlyStats = async (scanData: {
  [key: string]: DayScanData;
}) => {
  const allScans = Object.values(scanData).flatMap((day) => day.scans);

  if (allScans.length === 0) {
    return {
      totalScans: 0,
      averageScore: 0,
      mostCommonType: 0,
      consistencyTrend: "stable",
      streakDays: 0,
    };
  }

  // Calculate basic stats
  const totalScans = allScans.length;
  const averageScore =
    allScans.reduce((sum, scan) => sum + scan.score, 0) / totalScans;

  // Find most common Bristol type
  const typeCounts = {};
  allScans.forEach((scan) => {
    typeCounts[scan.score] = (typeCounts[scan.score] || 0) + 1;
  });
  const mostCommonType = Object.keys(typeCounts).reduce((a, b) =>
    typeCounts[a] > typeCounts[b] ? a : b
  );

  // Calculate consistency trend
  const consistencyTrend = calculateConsistencyTrend(allScans);

  // Calculate streak days (consecutive days with scans)
  const streakDays = calculateStreakDays(Object.keys(scanData));

  return {
    totalScans,
    averageScore,
    mostCommonType: parseInt(mostCommonType),
    consistencyTrend,
    streakDays,
  };
};
```

### 4. Calendar Navigation & Integration

**Month Navigation:**

```tsx
const handleMonthChange = async (direction: "prev" | "next") => {
  const newMonth =
    direction === "next"
      ? addMonths(currentMonth, 1)
      : subMonths(currentMonth, 1);

  setCurrentMonth(newMonth);
  setIsLoading(true);

  try {
    const monthData = await scanService.getMonthScanData(
      newMonth.getFullYear(),
      newMonth.getMonth(),
      user?.id
    );

    setScanData(monthData);

    const stats = await scanService.calculateMonthlyStats(monthData);
    setMonthlyStats(stats);
  } catch (error) {
    console.error("Failed to load month data:", error);
  } finally {
    setIsLoading(false);
  }
};
```

**Integration with Profile Screen:**

```tsx
// In ProfileScreen.tsx
const handleCalendarDaySelect = (date: Date) => {
  navigation.navigate("Calendar", {
    initialDate: date,
    highlightDate: true,
  });
};

<MiniCalendar
  selectedDate={selectedDate}
  onDaySelect={handleCalendarDaySelect}
  onViewFullCalendar={() => navigation.navigate("Calendar")}
/>;
```

## Data Visualization

### Bristol Scale Color Mapping

```tsx
const getBristolColor = (score: number): string => {
  const colorMap = {
    1: "#8B4513", // Brown - hard lumps
    2: "#A0522D", // Saddle brown - lumpy
    3: "#D2691E", // Chocolate - cracked surface
    4: "#DAA520", // Goldenrod - smooth snake
    5: "#F4A460", // Sandy brown - soft blobs
    6: "#DEB887", // Burlywood - fluffy pieces
    7: "#F5DEB3", // Wheat - watery
  };

  const roundedScore = Math.round(score);
  return colorMap[roundedScore] || "#E5E7EB";
};
```

### Trend Analysis

```tsx
const calculateConsistencyTrend = (
  scans: ScanRecord[]
): "improving" | "declining" | "stable" => {
  if (scans.length < 7) return "stable"; // Need at least a week of data

  // Sort by date
  const sortedScans = scans.sort(
    (a, b) =>
      new Date(a.analyzedAt).getTime() - new Date(b.analyzedAt).getTime()
  );

  // Calculate moving averages
  const firstWeekAvg =
    sortedScans.slice(0, 7).reduce((sum, scan) => sum + scan.score, 0) / 7;
  const lastWeekAvg =
    sortedScans.slice(-7).reduce((sum, scan) => sum + scan.score, 0) / 7;

  const difference = Math.abs(lastWeekAvg - 4); // 4 is ideal Bristol score
  const previousDifference = Math.abs(firstWeekAvg - 4);

  if (difference < previousDifference - 0.5) return "improving";
  if (difference > previousDifference + 0.5) return "declining";
  return "stable";
};
```

## Premium Features

### Advanced Calendar Features

```tsx
// Premium users get enhanced calendar features
const PremiumCalendarFeatures = () => {
  if (!isPremium) return null;

  return (
    <>
      {/* Trend Analysis Chart */}
      <TrendChart
        data={monthlyTrends}
        period="3months"
        showProjections={true}
      />

      {/* Pattern Recognition */}
      <PatternInsights
        patterns={detectedPatterns}
        onViewDetails={showPatternDetails}
      />

      {/* Export Options */}
      <ExportControls
        onExportPDF={exportToPDF}
        onExportCSV={exportToCSV}
        onShareWithDoctor={shareWithDoctor}
      />
    </>
  );
};
```

## Customization

### Adding New Calendar Views

**Weekly View:**

```tsx
const WeeklyCalendar = ({ selectedWeek, onWeekChange }) => {
  const weekDays = getWeekDays(selectedWeek);

  return (
    <View style={styles.weeklyContainer}>
      {weekDays.map((day) => (
        <WeeklyDay key={day.dateKey} day={day} onPress={handleDayPress} />
      ))}
    </View>
  );
};
```

**Yearly Overview:**

```tsx
const YearlyCalendar = ({ year, onMonthSelect }) => {
  const months = getMonthsInYear(year);

  return (
    <ScrollView style={styles.yearlyContainer}>
      {months.map((month) => (
        <MonthSummaryCard
          key={month.key}
          month={month}
          stats={month.stats}
          onPress={() => onMonthSelect(month)}
        />
      ))}
    </ScrollView>
  );
};
```

### Custom Statistics

**Health Streaks:**

```tsx
const calculateHealthStreaks = (scanData: { [key: string]: DayScanData }) => {
  const sortedDates = Object.keys(scanData).sort();
  let currentStreak = 0;
  let longestStreak = 0;
  let healthyStreak = 0; // Streak of healthy scores (3-5)

  sortedDates.forEach((dateKey) => {
    const dayData = scanData[dateKey];
    if (dayData.totalScans > 0) {
      currentStreak++;

      // Check if day has healthy scores
      const hasHealthyScore = dayData.scans.some(
        (scan) => scan.score >= 3 && scan.score <= 5
      );

      if (hasHealthyScore) {
        healthyStreak++;
      } else {
        healthyStreak = 0;
      }
    } else {
      longestStreak = Math.max(longestStreak, currentStreak);
      currentStreak = 0;
    }
  });

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    healthyStreak,
  };
};
```

## Testing

### Unit Tests

- Calendar date calculations
- Scan data grouping and formatting
- Statistics calculation accuracy
- Navigation between months

### Integration Tests

- Data loading and display
- Mini calendar sync with full calendar
- Profile screen integration
- Premium feature access

### Visual Tests

- Calendar layout on different screen sizes
- Day highlighting and selection
- Scan indicator visibility
- Animation smoothness

## Troubleshooting

### Common Issues

**Calendar not loading data:**

- Check scan service API connectivity
- Verify date range calculations
- Test with mock data
- Monitor for timezone issues

**Mini calendar not syncing:**

- Check shared state between components
- Verify date selection handlers
- Test navigation parameter passing
- Monitor for prop update issues

**Performance issues with large datasets:**

- Implement data pagination
- Use virtual scrolling for long lists
- Cache frequently accessed data
- Optimize re-render frequency

**Date display inconsistencies:**

- Standardize date formatting across components
- Handle timezone conversions properly
- Test with different locale settings
- Verify date parsing logic

### Performance Optimization

- Lazy load calendar data by month
- Cache scan data for recently viewed months
- Use memo for expensive calculations
- Optimize scroll performance

### Accessibility Features

- Screen reader support for calendar navigation
- High contrast mode for day indicators
- Voice control for date selection
- Keyboard navigation support
