# AI Analysis & Results System

## Overview

The AI analysis and results system processes captured photos through backend AI services and presents comprehensive health insights through animated, interactive result displays. The system handles image upload, analysis processing, result visualization, and data persistence with engaging animations and user-friendly presentations.

## Architecture

### Core Components

**Analysis Service** (`services/analysis/analysisService.ts`)

- Image upload and processing coordination
- AI analysis API integration
- Error handling and retry logic
- Development mode mock responses

**Results Screen** (`screens/analysis/ResultsScreen.tsx`)

- Primary results display with animations
- Score visualization and breakdown
- Social sharing functionality
- Data persistence options

**Analysis Components** (`components/analysis/`)

- Specialized UI components for result display
- Animation controllers and visual effects
- Interactive elements and controls

## Implementation Details

### 1. Analysis Service

**Location:** `services/analysis/analysisService.ts`

**Purpose:**

- Handle image upload to backend AI services
- Process and parse analysis responses
- Manage analysis state and error handling
- Provide development mode testing capabilities

**Core Functions:**

```tsx
// Main analysis function
const analyzeImage = async (
  imageUri: string,
  deviceId: string,
  userId?: string
): Promise<AnalysisResult>

// Upload image with retry logic
const uploadImage = async (
  imageUri: string,
  uploadUrl: string
): Promise<string>

// Poll for analysis completion
const pollAnalysisStatus = async (
  analysisId: string
): Promise<AnalysisResult>

// Development mode mock
const getMockAnalysis = (): Promise<AnalysisResult>
```

**Analysis Flow:**

```tsx
const analyzeImage = async (
  imageUri: string,
  deviceId: string,
  userId?: string
) => {
  try {
    // 1. Upload image to cloud storage
    const uploadResponse = await uploadImage(imageUri);

    // 2. Initiate AI analysis
    const analysisResponse = await initiateAnalysis({
      imageUrl: uploadResponse.url,
      deviceId,
      userId,
      timestamp: new Date().toISOString(),
    });

    // 3. Poll for completion
    const result = await pollAnalysisStatus(analysisResponse.analysisId);

    // 4. Process and validate result
    return validateAnalysisResult(result);
  } catch (error) {
    console.error("Analysis failed:", error);
    throw new AnalysisError(error.message);
  }
};
```

**Error Handling:**

```tsx
class AnalysisError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = "AnalysisError";
  }
}

const handleAnalysisError = (error: AnalysisError) => {
  switch (error.code) {
    case "UPLOAD_FAILED":
      return "Failed to upload image. Please check your connection.";
    case "ANALYSIS_TIMEOUT":
      return "Analysis is taking longer than expected. Please try again.";
    case "INVALID_IMAGE":
      return "Image quality is too low. Please retake the photo.";
    default:
      return "Analysis failed. Please try again.";
  }
};
```

### 2. Analysis Data Types

**Location:** `types/api.ts`

**Core Types:**

```tsx
interface AnalysisResult {
  id: string;
  score: number; // 1-7 Bristol scale score
  confidence: number; // AI confidence percentage
  bristolType: BristolType; // Detailed Bristol classification
  healthInsights: HealthInsight[]; // Health recommendations
  trends: TrendData[]; // Historical trend analysis
  imageUrl: string; // Processed image URL
  analyzedAt: string; // Analysis timestamp
  nutritionInsights?: NutritionInsight[];
  symptoms?: SymptomIndicator[];
}

interface BristolType {
  type: number; // 1-7 Bristol scale
  name: string; // Type name (e.g., "Separate hard lumps")
  description: string; // Detailed description
  healthIndicator: "poor" | "fair" | "good" | "excellent";
  color: string; // UI color for visualization
}

interface HealthInsight {
  category: "hydration" | "fiber" | "timing" | "consistency" | "general";
  title: string;
  description: string;
  severity: "low" | "medium" | "high";
  recommendations: string[];
  icon: string;
}
```

### 3. Results Screen

**Location:** `screens/analysis/ResultsScreen.tsx`

**Purpose:**

- Display analysis results with engaging animations
- Provide detailed health insights and recommendations
- Enable result sharing and saving
- Integrate with premium upgrade flows

**Key Features:**

- **Animated Poop Meter:** Cinematic score reveal animation
- **Bristol Scale Visualization:** Interactive scale display
- **Health Insights:** Categorized recommendations
- **Photo Privacy:** Blur toggle for sharing
- **Social Sharing:** Formatted results for social media
- **Data Persistence:** Save results to user history

**Animation Sequence:**

```tsx
const runAnimationSequence = async () => {
  // 1. Show analyzing overlay (3-5 seconds)
  setShowAnalyzing(true);
  await new Promise((resolve) => setTimeout(resolve, 4000));

  // 2. Hide analyzing, start meter animation
  setShowAnalyzing(false);
  setShowMeter(true);

  // 3. Animate meter fill (2 seconds)
  Animated.timing(meterProgress, {
    toValue: analysisResult.score / 7,
    duration: 2000,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: false,
  }).start();

  // 4. Show score number with bounce
  await new Promise((resolve) => setTimeout(resolve, 1500));
  Animated.spring(scoreScale, {
    toValue: 1,
    tension: 100,
    friction: 8,
    useNativeDriver: true,
  }).start();

  // 5. Transition to card view (1 second delay)
  await new Promise((resolve) => setTimeout(resolve, 2000));
  setShowCard(true);

  // 6. Fade out meter, fade in card
  Animated.parallel([
    Animated.timing(meterOpacity, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }),
    Animated.timing(cardOpacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }),
  ]).start();
};
```

### 4. Analysis Components

#### PoopMeterAnimation

**Location:** `components/analysis/PoopMeterAnimation.tsx`

**Purpose:** Animated circular meter for score visualization

**Features:**

- Circular progress animation with gradient fill
- Dynamic color changes based on score
- Pulsing effects for emphasis
- Score number animation with bouncing

**Implementation:**

```tsx
const PoopMeterAnimation = ({ score, maxScore = 7, onAnimationComplete }) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start progress animation
    Animated.timing(progressAnim, {
      toValue: score / maxScore,
      duration: 2000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start(() => {
      // Start pulsing effect
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 1000 }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000 }),
        ])
      ).start();

      onAnimationComplete?.();
    });
  }, [score]);

  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <Animated.View
      style={[styles.container, { transform: [{ scale: pulseAnim }] }]}
    >
      <Svg width={diameter} height={diameter}>
        <Circle
          cx={radius}
          cy={radius}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <AnimatedCircle
          cx={radius}
          cy={radius}
          r={radius}
          stroke={getScoreColor(score)}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>{score}</Text>
        <Text style={styles.maxScoreText}>/ {maxScore}</Text>
      </View>
    </Animated.View>
  );
};
```

#### AnalyzingOverlay

**Location:** `components/analysis/AnalyzingOverlay.tsx`

**Purpose:** Loading animation during analysis processing

**Features:**

- Animated scanning effects
- Progress indicators
- Engaging messaging
- Cancel option for long analyses

**Animation Effects:**

```tsx
const AnalyzingOverlay = ({ isVisible, onCancel }) => {
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isVisible) {
      // Scanning line animation
      Animated.loop(
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      ).start();

      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 1000 }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000 }),
        ])
      ).start();
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <BlurView style={styles.overlay} intensity={50}>
      <Animated.View
        style={[styles.scanContainer, { transform: [{ scale: pulseAnim }] }]}
      >
        <Text style={styles.analyzingText}>Analyzing your sample...</Text>
        <View style={styles.scanArea}>
          <Animated.View
            style={[
              styles.scanLine,
              {
                transform: [
                  {
                    translateY: scanLineAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-100, 100],
                    }),
                  },
                ],
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>AI is processing your image</Text>
      </Animated.View>
    </BlurView>
  );
};
```

#### ResultCard & Analysis Summary

**Location:** `components/analysis/ResultCard.tsx`, `components/analysis/AnalysisSummary.tsx`

**Purpose:** Detailed result display with health insights

**Features:**

- Bristol scale visualization
- Health insight categorization
- Recommendation lists
- Trend indicators
- Interactive elements

**Implementation:**

```tsx
const AnalysisSummary = ({ analysisResult }) => {
  const { score, bristolType, healthInsights, trends } = analysisResult;

  return (
    <ScrollView style={styles.container}>
      {/* Bristol Scale Display */}
      <BristolScaleDisplay currentType={bristolType.type} interactive={true} />

      {/* Health Insights */}
      <View style={styles.insightsSection}>
        <Text style={styles.sectionTitle}>Health Insights</Text>
        {healthInsights.map((insight, index) => (
          <HealthInsightCard
            key={index}
            insight={insight}
            onExpand={() => showDetailedInsight(insight)}
          />
        ))}
      </View>

      {/* Recommendations */}
      <RecommendationsSection
        recommendations={getRecommendations(healthInsights)}
      />

      {/* Trend Analysis */}
      {trends.length > 0 && <TrendAnalysisSection trends={trends} />}
    </ScrollView>
  );
};
```

### 5. Sharing System

**Location:** `components/analysis/ShareableResultsView.tsx`

**Purpose:** Generate shareable result views for social media

**Features:**

- Privacy-friendly result formatting
- Custom styling for sharing
- Multiple sharing formats
- Image generation for sharing

**Implementation:**

```tsx
const ShareableResultsView = ({
  analysisResult,
  includePhoto = false,
  shareFormat = "standard",
}) => {
  const shareableData = useMemo(() => {
    return {
      score: analysisResult.score,
      bristolType: analysisResult.bristolType.name,
      date: new Date().toLocaleDateString(),
      insights: analysisResult.healthInsights
        .filter((insight) => insight.severity !== "high") // Privacy filter
        .slice(0, 3), // Limit insights
    };
  }, [analysisResult]);

  const generateShareImage = async () => {
    // Generate image for sharing
    const imageUri = await captureRef(shareViewRef, {
      format: "png",
      quality: 0.8,
    });

    return imageUri;
  };

  return (
    <View ref={shareViewRef} style={styles.shareContainer}>
      <Text style={styles.shareTitle}>My PoopAI Analysis</Text>
      <Text style={styles.shareScore}>Score: {shareableData.score}/7</Text>
      <Text style={styles.shareType}>{shareableData.bristolType}</Text>

      {shareableData.insights.map((insight, index) => (
        <Text key={index} style={styles.shareInsight}>
          • {insight.title}
        </Text>
      ))}

      <Text style={styles.shareFooter}>Analyzed with PoopAI</Text>
    </View>
  );
};
```

## Data Persistence

### Saving Results

```tsx
const saveAnalysisResult = async (result: AnalysisResult) => {
  try {
    // Save to backend if authenticated
    if (user?.id) {
      await apiService.saveAnalysis(user.id, result);
    }

    // Always save locally for offline access
    const savedResults = await AsyncStorage.getItem("analysis_history");
    const history = savedResults ? JSON.parse(savedResults) : [];

    const updatedHistory = [result, ...history].slice(0, 50); // Keep last 50
    await AsyncStorage.setItem(
      "analysis_history",
      JSON.stringify(updatedHistory)
    );

    // Update scan context
    await scanContext.refreshScanData();
  } catch (error) {
    console.error("Failed to save analysis result:", error);
    throw error;
  }
};
```

### Result History Integration

```tsx
const getAnalysisHistory = async (): Promise<AnalysisResult[]> => {
  try {
    // Try to fetch from backend first
    if (user?.id) {
      const backendHistory = await apiService.getAnalysisHistory(user.id);
      return backendHistory;
    }

    // Fallback to local storage
    const localHistory = await AsyncStorage.getItem("analysis_history");
    return localHistory ? JSON.parse(localHistory) : [];
  } catch (error) {
    console.error("Failed to load analysis history:", error);
    return [];
  }
};
```

## Integration Points

### With Camera System

- Receives photo from camera capture
- Validates image quality before analysis
- Returns to camera on analysis failure

### With Subscription System

- Premium users get detailed insights
- Free users get basic analysis
- Upgrade prompts for enhanced features

### With Calendar System

- Analysis results appear in calendar
- Historical trend analysis
- Date-based result filtering

### With Profile System

- Results influence health recommendations
- Trend data updates profile insights
- Goal tracking integration

## Customization

### Adding New Analysis Features

**Custom Health Insights:**

```tsx
// Add new insight categories
const customInsightGenerators = {
  exercise: (bristolType: BristolType) => ({
    category: "exercise",
    title: "Exercise Impact",
    description: generateExerciseInsight(bristolType),
    recommendations: getExerciseRecommendations(bristolType),
  }),

  stress: (trends: TrendData[]) => ({
    category: "stress",
    title: "Stress Indicators",
    description: analyzeStressPatterns(trends),
    recommendations: getStressManagementTips(),
  }),
};
```

**Enhanced Visualizations:**

```tsx
// Add 3D Bristol scale visualization
const BristolScale3D = ({ currentType }) => {
  return (
    <View style={styles.scale3D}>
      {bristolTypes.map((type) => (
        <Animated3DModel
          key={type.id}
          model={type.model}
          highlighted={type.id === currentType}
          onPress={() => showTypeDetails(type)}
        />
      ))}
    </View>
  );
};
```

### Modifying Analysis Parameters

**Scoring Algorithm:**

```tsx
// Customize scoring weights
const analysisWeights = {
  bristol: 0.6, // Bristol type weight
  color: 0.2, // Color analysis weight
  texture: 0.15, // Texture analysis weight
  size: 0.05, // Size analysis weight
};

const calculateScore = (analysisData: RawAnalysisData) => {
  return (
    analysisData.bristol * analysisWeights.bristol +
    analysisData.color * analysisWeights.color +
    analysisData.texture * analysisWeights.texture +
    analysisData.size * analysisWeights.size
  );
};
```

## Testing

### Unit Tests

- Analysis service API calls
- Result data parsing and validation
- Animation component behavior
- Sharing functionality

### Integration Tests

- Complete analysis flow from photo to results
- Error handling and retry logic
- Data persistence and retrieval
- Premium vs free user experiences

### Visual Testing

- Animation timing and smoothness
- Result display accuracy
- Responsive design across devices
- Accessibility compliance

## Troubleshooting

### Common Issues

**Analysis not starting:**

- Check network connectivity
- Verify image upload success
- Test backend API availability
- Monitor for timeout issues

**Animations not smooth:**

- Verify useNativeDriver usage
- Check device performance
- Reduce animation complexity
- Test on various devices

**Results not saving:**

- Check AsyncStorage permissions
- Verify backend connectivity
- Test data serialization
- Monitor for storage limits

**Sharing not working:**

- Check social sharing permissions
- Verify image generation
- Test share intent handling
- Monitor for format compatibility

### Performance Optimization

- Optimize image upload size
- Cache analysis results
- Minimize animation re-renders
- Use lazy loading for insights

### Error Recovery

- Implement retry mechanisms
- Provide offline mode
- Cache results for reliability
- Graceful degradation for API failures
