# Camera & Scanning System

## Overview

The camera and scanning system provides the core functionality for capturing and analyzing images. It integrates device camera capabilities with scan credit management, premium user handling, and seamless transitions to the analysis flow. The system supports both authenticated and anonymous users with different scan limitations.

## Architecture

### Core Components

**Camera Screen** (`screens/camera/CameraScreen.tsx`)

- Primary photo capture interface
- Permission handling and camera setup
- Scan credit validation and management
- Analysis flow initiation

**Camera Components** (`components/camera/`)

- Modular UI components for camera functionality
- Scan counter displays and overlays
- Loading states and instructions

**Scan Context** (`context/features/ScanContext.tsx`)

- Global scan credit and usage tracking
- Premium user status management
- Real-time scan data synchronization

## Implementation Details

### 1. Camera Screen

**Location:** `screens/camera/CameraScreen.tsx`

**Purpose:**

- Capture photos using device camera
- Validate scan credits before capture
- Manage photo preview and retake options
- Initiate analysis flow

**Key Features:**

- **Camera Integration:** Expo Camera with permission handling
- **Photo Preview:** Blur toggle for privacy during preview
- **Scan Validation:** Check credits before allowing capture
- **Flash Control:** Toggle flash for better photo quality
- **Analysis Transition:** Seamless flow to results screen

**State Management:**

```tsx
interface CameraState {
  hasPermission: boolean;
  isReady: boolean;
  photo: CameraCapturedPicture | null;
  isAnalyzing: boolean;
  showPreview: boolean;
  isBlurred: boolean;
  flashMode: FlashMode;
}
```

**Core Methods:**

```tsx
// Request camera permissions
const requestPermissions = async (): Promise<boolean>

// Capture photo with validation
const takePicture = async (): Promise<void>

// Retry photo capture
const retakePhoto = (): void

// Start analysis process
const analyzePhoto = async (): Promise<void>

// Toggle photo blur in preview
const toggleBlur = (): void
```

**Permission Handling:**

```tsx
const requestPermissions = async () => {
  const { status } = await Camera.requestCameraPermissionsAsync();
  if (status !== "granted") {
    Alert.alert(
      "Camera Permission Required",
      "Please enable camera access to scan your poop.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Settings", onPress: () => Linking.openSettings() },
      ]
    );
    return false;
  }
  return true;
};
```

**Scan Credit Validation:**

```tsx
const takePicture = async () => {
  // Check if user can scan
  if (!canScan()) {
    navigation.navigate("Payment", {
      type: "scan-credits",
      noScreen: "Camera",
    });
    return;
  }

  // Consume scan credit
  await consumeScan();

  // Capture photo
  const photo = await cameraRef.current?.takePictureAsync({
    quality: 0.8,
    base64: false,
    skipProcessing: false,
  });

  setPhoto(photo);
  setShowPreview(true);
};
```

### 2. Camera Components

#### CameraView Component

**Location:** `components/camera/CameraView.tsx`

**Purpose:** Main camera interface component with controls

**Features:**

- Camera viewfinder with overlay
- Capture button with animation
- Flash toggle control
- Focus indicator

**Props:**

```tsx
interface CameraViewProps {
  onCapture: () => Promise<void>;
  onFlashToggle: () => void;
  flashMode: FlashMode;
  isReady: boolean;
  isCapturing: boolean;
}
```

#### Scan Counter Components

**Location:** `components/camera/ScanCounter.tsx`, `components/camera/CameraScanCounter.tsx`

**Purpose:** Display and manage scan credits

**Features:**

- Real-time scan count display
- Premium vs free user differentiation
- Interactive upgrade prompts
- Responsive sizing based on context

**Implementation:**

```tsx
// ScanCounter - General purpose counter
const ScanCounter = ({ count, isPremium, onUpgrade, size = "medium" }) => {
  if (isPremium) {
    return (
      <View style={styles.premiumContainer}>
        <Ionicons name="infinite" size={24} color="#10b981" />
        <Text style={styles.premiumText}>Unlimited</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.counter, styles[size]]}
      onPress={count === 0 ? onUpgrade : undefined}
    >
      <Text style={styles.countText}>{count}</Text>
      <Text style={styles.labelText}>scans left</Text>
    </TouchableOpacity>
  );
};

// CameraScanCounter - Camera-specific version
const CameraScanCounter = () => {
  const { scansLeft, isPremium } = useScan();
  const navigation = useNavigation();

  const handleUpgrade = () => {
    navigation.navigate("Payment", {
      type: "scan-credits",
      noScreen: "Camera",
    });
  };

  return (
    <ScanCounter
      count={scansLeft}
      isPremium={isPremium}
      onUpgrade={handleUpgrade}
      size="large"
    />
  );
};
```

#### Camera Overlays

**Location:** `components/camera/`

**ScanOverlay** - UI overlay during scanning process

- Scanning animation
- Progress indicators
- Cancel option

**CameraLoadingOverlay** - Initial camera loading state

- Camera initialization feedback
- Permission request handling
- Error state display

**ScanInstructions** - User guidance component

- Photo capture tips
- Positioning guidelines
- Quality recommendations

### 3. Scan Context & Credit Management

**Location:** `context/features/ScanContext.tsx`

**Purpose:**

- Track scan credits and usage globally
- Manage premium user status
- Provide scan-related state to components
- Handle backend synchronization

**State Structure:**

```tsx
interface ScanState {
  scansLeft: number; // Remaining scan credits
  isPremium: boolean; // Premium subscription status
  totalScans: number; // Total scans performed
  isLoading: boolean; // Loading state
  lastScanDate: Date | null; // Last scan timestamp
  scanHistory: ScanRecord[]; // Recent scan history
}
```

**Key Methods:**

```tsx
// Check if user can perform scan
canScan(): boolean

// Consume a scan credit
consumeScan(): Promise<void>

// Award free scan (from ads/sharing)
awardFreeScan(): Promise<void>

// Refresh scan data from backend
refreshScanData(): Promise<void>

// Check premium status
checkPremiumStatus(): Promise<boolean>

// Get scan history
getScanHistory(): Promise<ScanRecord[]>
```

**Credit Management Logic:**

```tsx
const consumeScan = async () => {
  // Premium users have unlimited scans
  if (isPremium) {
    setTotalScans((prev) => prev + 1);
    return;
  }

  // Check if user has scans remaining
  if (scansLeft <= 0) {
    throw new Error("No scans remaining");
  }

  try {
    // Update backend
    await scanService.consumeScan(deviceId);

    // Update local state
    setScansLeft((prev) => Math.max(0, prev - 1));
    setTotalScans((prev) => prev + 1);
    setLastScanDate(new Date());

    // Refresh data to ensure sync
    await refreshScanData();
  } catch (error) {
    console.error("Failed to consume scan:", error);
    throw error;
  }
};
```

**Premium Status Handling:**

```tsx
const checkPremiumStatus = async () => {
  try {
    const { user } = useAuth();
    if (!user) return false;

    const subscriptionStatus = await subscriptionService.getStatus(user.id);
    const isActive = subscriptionStatus.isActive;

    setIsPremium(isActive);
    return isActive;
  } catch (error) {
    console.error("Failed to check premium status:", error);
    return false;
  }
};
```

## Scan Flow Integration

### 1. Photo Capture Flow

```
Camera Screen → Permission Check → Scan Credit Check → Photo Capture → Preview → Analysis
├── No Permission → Request → Settings/Retry
├── No Credits → Payment Screen → Return to Camera
├── Capture Success → Preview Screen → Analyze/Retake
└── Analysis Start → Results Screen
```

### 2. Credit Validation Flow

```
Scan Request → Check Premium Status → Check Credits → Proceed/Block
├── Premium User → Unlimited Access → Proceed
├── Has Credits → Consume Credit → Proceed
└── No Credits → Payment Flow → Return with Credits
```

### 3. Analysis Integration Flow

```
Photo Captured → Upload to Analysis Service → Track Scan Usage → Navigate to Results
├── Upload Success → Increment Total Scans → Results Screen
└── Upload Failed → Restore Credit → Error Handling
```

## Development Features

### 1. Development Mode Controls

**Location:** `components/camera/ScanContextDevelopmentControls.tsx`

**Purpose:** Testing and debugging tools for development

**Features:**

- Manual scan credit adjustment
- Premium status toggle
- Scan history simulation
- Backend sync testing

**Usage:**

```tsx
// Only shown in development mode
{
  __DEV__ && (
    <ScanContextDevelopmentControls
      onAddCredits={(amount) => setScansLeft((prev) => prev + amount)}
      onTogglePremium={() => setIsPremium((prev) => !prev)}
      onClearHistory={() => setScanHistory([])}
      onRefreshData={refreshScanData}
    />
  );
}
```

### 2. Mock Camera Mode

For testing on simulators without camera access:

```tsx
const mockCapture = async () => {
  // Simulate photo capture for testing
  const mockPhoto = {
    uri: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
    width: 1920,
    height: 1080,
  };

  setPhoto(mockPhoto);
  setShowPreview(true);
};
```

## Error Handling

### Camera Permission Errors

```tsx
const handlePermissionError = () => {
  Alert.alert(
    "Camera Access Required",
    "PoopAI needs camera access to analyze your photos. Please enable camera permissions in your device settings.",
    [
      { text: "Cancel", style: "cancel" },
      { text: "Open Settings", onPress: () => Linking.openSettings() },
    ]
  );
};
```

### Scan Credit Errors

```tsx
const handleInsufficientCredits = () => {
  Alert.alert(
    "No Scans Remaining",
    "You've used all your free scans. Upgrade to premium for unlimited scans or watch an ad for a free scan.",
    [
      { text: "Watch Ad", onPress: () => navigation.navigate("FreeScan") },
      { text: "Upgrade", onPress: () => navigation.navigate("Payment") },
      { text: "Cancel", style: "cancel" },
    ]
  );
};
```

### Camera Hardware Errors

```tsx
const handleCameraError = (error: Error) => {
  console.error("Camera error:", error);

  Alert.alert(
    "Camera Error",
    "There was a problem accessing your camera. Please try again or restart the app.",
    [
      { text: "Retry", onPress: () => setupCamera() },
      { text: "Cancel", style: "cancel" },
    ]
  );
};
```

## Customization

### Adding New Camera Features

**Photo Filters:**

```tsx
// Add filter options to camera
const [selectedFilter, setSelectedFilter] = useState("none");

const captureWithFilter = async () => {
  const photo = await cameraRef.current?.takePictureAsync({
    quality: 0.8,
    // Add filter processing here
  });

  const processedPhoto = await applyFilter(photo, selectedFilter);
  setPhoto(processedPhoto);
};
```

**Multiple Photo Capture:**

```tsx
// Capture multiple angles
const [photos, setPhotos] = useState<CameraCapturedPicture[]>([]);

const captureMultiple = async () => {
  const photo = await takePicture();
  setPhotos((prev) => [...prev, photo]);

  if (photos.length >= 3) {
    // Proceed with analysis of multiple photos
    analyzeMultiplePhotos(photos);
  }
};
```

### Modifying Scan Credit System

**Custom Credit Packages:**

```tsx
// Add different credit packages
const CREDIT_PACKAGES = {
  starter: { credits: 5, price: 0.99 },
  standard: { credits: 20, price: 2.99 },
  premium: { credits: 100, price: 9.99 },
};
```

**Time-Based Credits:**

```tsx
// Add daily/weekly credit refreshes
const checkDailyRefresh = async () => {
  const lastRefresh = await AsyncStorage.getItem("lastCreditRefresh");
  const today = new Date().toDateString();

  if (lastRefresh !== today) {
    // Award daily credits
    await awardDailyCredits(3);
    await AsyncStorage.setItem("lastCreditRefresh", today);
  }
};
```

## Testing

### Unit Tests

- Camera permission handling
- Scan credit validation logic
- Photo capture and preview functionality
- Error handling scenarios

### Integration Tests

- Complete photo capture flow
- Credit consumption and restoration
- Premium user vs free user behavior
- Analysis flow integration

### Device Testing

- Different camera hardware
- Various lighting conditions
- Photo quality across devices
- Performance on older devices

## Troubleshooting

### Common Issues

**Camera not working:**

- Check device permissions in settings
- Verify camera hardware availability
- Test on physical device (not simulator)
- Check for camera access conflicts with other apps

**Scan credits not updating:**

- Verify ScanContext provider setup
- Check backend API connectivity
- Test credit refresh functionality
- Monitor for race conditions in credit updates

**Photo quality issues:**

- Adjust camera quality settings
- Test different lighting conditions
- Verify photo compression settings
- Check device camera capabilities

**Preview not showing:**

- Check photo capture success
- Verify state updates after capture
- Test preview component rendering
- Monitor for memory issues with large photos

### Performance Optimization

- Optimize photo quality vs file size
- Minimize camera initialization time
- Reduce preview rendering time
- Cache frequently used camera settings

### Accessibility Features

- Voice-guided photo capture
- High contrast camera overlay
- Screen reader compatibility
- Alternative input methods for capture
