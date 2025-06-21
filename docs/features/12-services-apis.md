# Services & APIs

## Overview

The Services & APIs layer manages all external communication and data processing in the PoopAI application. This includes authentication with the backend, AI-powered image analysis, subscription management through iOS App Store, and data synchronization. The services provide abstraction layers that allow the app to work in both development and production environments with appropriate mocking and error handling.

## Architecture

### Core Service Categories

**Authentication Services** (`services/auth/`)

- User authentication and session management
- Backend API communication for user data
- Device-based anonymous user support

**Analysis Services** (`services/analysis/`)

- AI image analysis processing
- Cloud storage integration for image uploads
- Mock analysis responses for development

**Subscription Services** (`services/subscription/`)

- iOS App Store integration for in-app purchases
- Subscription status validation and management
- Mock IAP functionality for development/testing

### Service Design Principles

**Environment Awareness**

- Development mode with mock responses
- Production mode with real API integration
- Graceful fallback between modes

**Error Resilience**

- Comprehensive error handling and user feedback
- Retry mechanisms for network failures
- Offline capability where applicable

**Security First**

- JWT token management for authenticated requests
- Secure storage of sensitive data
- HTTPS-only communication in production

## Implementation Details

### 1. Authentication Service

**Location:** `services/auth/authService.ts`

**Purpose:**

- Handle all backend authentication operations
- Manage user profiles and device-based data
- Provide secure API communication

**Core Functions:**

```tsx
// User authentication
const login = async (email: string, password: string): Promise<LoginResponse>
const signup = async (userData: SignupData): Promise<SignupResponse>
const verifyToken = async (token: string): Promise<boolean>

// User profile management
const getUserProfile = async (token: string): Promise<UserProfile>
const getDeviceScanData = async (deviceId: string): Promise<DeviceScanData>

// Password management
const forgotPassword = async (email: string): Promise<void>
```

**Request Structure:**

```tsx
interface SignupData {
  email: string;
  password: string;
  name: string;
  deviceId?: string; // Automatically added
  poopGoals?: string[];
  conditions?: string[];
  recentSymptoms?: string[];
  temperament?: string;
}

interface UserProfile {
  name: string;
  poopGoals?: string[];
  conditions?: string[];
  recentSymptoms?: string[];
  temperament?: string;
  poopScoreAvg?: number;
  freeScansLeft?: number;
  paidScanCount?: number;
  premium?: boolean;
}
```

**Token Management:**

- JWT tokens stored securely in AsyncStorage
- Automatic inclusion in authenticated requests
- Token validation on app startup
- Secure token removal on logout

**Device Integration:**

- Unique device ID generation for anonymous users
- Device scan data tracking without authentication
- Seamless migration from anonymous to authenticated

### 2. Analysis Service

**Location:** `services/analysis/analysisService.ts`

**Purpose:**

- Handle AI-powered image analysis requests
- Manage image upload and processing pipeline
- Provide development mode testing capabilities

**Core Functions:**

```tsx
// Main analysis function
const analyzeImage = async (
  imageUri: string,
  deviceId: string,
  userId?: string
): Promise<AnalysisResult>

// Image processing utilities
const convertImageToBase64 = async (imageUri: string): Promise<string>
const optimizeImageForUpload = async (imageUri: string): Promise<string>

// Service availability
const isAnalysisServiceReady = async (): Promise<boolean>

// Development mode
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
    // 1. Environment check
    if (AppConfig.isDevelopmentMode) {
      return getMockAnalysis();
    }

    // 2. Image optimization
    const optimizedImageUri = await optimizeImageForUpload(imageUri);
    const base64Image = await convertImageToBase64(optimizedImageUri);

    // 3. API request preparation
    const headers = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    // 4. Backend communication
    const response = await makeApiCall(deviceId, base64Image);

    // 5. Response processing
    return parseAnalysisResponse(response);
  } catch (error) {
    handleAnalysisError(error);
    throw error;
  }
};
```

**Error Handling:**

- Network timeout protection (30 seconds)
- Retry logic for temporary failures
- Graceful degradation to mock responses
- User-friendly error messages

**Image Processing:**

- Automatic image compression and optimization
- Base64 conversion for API transmission
- File size validation and limits
- Format standardization (JPEG with quality optimization)

### 3. Scan Service

**Location:** `services/analysis/scanService.ts`

**Purpose:**

- Manage user scan history and data retrieval
- Handle scan counting and limits
- Provide data synchronization between devices

**Core Functions:**

```tsx
// Scan history management
const getUserScans = async (): Promise<ScanData[]>
const saveScanResult = async (scanData: ScanData): Promise<void>
const deleteScan = async (scanId: string): Promise<void>

// Scan counting
const getScanCount = async (deviceId: string): Promise<number>
const incrementScanCount = async (deviceId: string): Promise<void>

// Data synchronization
const syncLocalScansToCloud = async (userId: string): Promise<void>
```

**Data Structure:**

```tsx
interface ScanData {
  id: string;
  userId?: string;
  deviceId: string;
  imageUri: string;
  analysisResult: AnalysisResult;
  timestamp: Date;
  isLocal: boolean;
  synced: boolean;
}
```

### 4. In-App Purchase Service

**Location:** `services/subscription/InAppPurchaseService.ts`

**Purpose:**

- Handle iOS App Store subscription integration
- Manage subscription status and validation
- Provide development mode mock functionality

**Core Functions:**

```tsx
// Service initialization
const initialize = async (): Promise<void>
const getAvailableProducts = async (): Promise<SubscriptionPlan[]>

// Purchase management
const purchaseSubscription = async (productId: string): Promise<PurchaseResult>
const restorePurchases = async (): Promise<PurchaseResult[]>
const isSubscriptionActive = async (): Promise<boolean>

// Development utilities
const getMockProducts = (): SubscriptionPlan[]
const mockPurchase = async (productId: string): Promise<PurchaseResult>
```

**Product Configuration:**

```tsx
const IAP_CONFIG = {
  // Production product IDs
  products: {
    monthly: "com.poopai.premium.monthly",
    yearly: "com.poopai.premium.yearly",
  },

  // Test product IDs for development
  testProducts: {
    monthly: "com.poopai.premium.monthly.test",
    yearly: "com.poopai.premium.yearly.test",
  },
};

interface SubscriptionPlan {
  id: string;
  title: string;
  description: string;
  price: string;
  localizedPrice?: string;
  period: "month" | "year";
  type: "subscription";
  savings?: string;
}
```

**Mock Implementation:**

```tsx
// Development mode simulation
const mockInAppPurchaseService = {
  initialize: async () => {
    console.log("Mock IAP: Initialized");
    return Promise.resolve();
  },

  purchaseSubscription: async (productId: string) => {
    console.log("Mock IAP: Purchasing", productId);

    // Simulate purchase delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    return {
      success: true,
      transactionId: `mock_${Date.now()}`,
      receipt: "mock_receipt_data",
      productId,
    };
  },
};
```

## Error Handling & Resilience

### Network Error Management

**Connection Failures:**

```tsx
const handleNetworkError = (error: Error) => {
  if (error.name === "AbortError") {
    throw new Error("Request timeout - please try again");
  }

  if (!navigator.onLine) {
    throw new Error("No internet connection - please check your network");
  }

  throw new Error("Network error - please try again later");
};
```

**Retry Logic:**

```tsx
const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) throw error;

      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};
```

### Service-Specific Error Handling

**Authentication Errors:**

- Invalid credentials → Clear messaging with retry option
- Token expiration → Automatic token refresh or re-login
- Network issues → Graceful offline mode activation

**Analysis Errors:**

- Image processing failures → Clear error messages with suggestions
- API timeouts → Retry mechanism with user feedback
- Service unavailable → Fallback to mock responses in development

**Subscription Errors:**

- Purchase failures → Detailed error codes and recovery options
- Receipt validation issues → Automatic retry with backend
- App Store connectivity → Graceful degradation to cached status

## Development vs Production

### Environment Configuration

**Development Mode:**

```tsx
const AppConfig = {
  isDevelopmentMode: __DEV__,
  api: {
    baseUrl: __DEV__ ? "http://localhost:3000" : "https://api.poopai.com",
    timeout: 30000,
    endpoints: {
      analyzeImage: "/api/analyze",
      auth: "/api/auth",
      userProfile: "/api/auth/user-info",
    },
  },
};
```

**Service Switching:**

```tsx
// Automatic service selection based on environment
const getAnalysisService = () => {
  return AppConfig.isDevelopmentMode
    ? mockAnalysisService
    : productionAnalysisService;
};
```

### Development Tools

**Mock Data Generation:**

```tsx
const MOCK_ANALYSIS_RESPONSE = {
  bristolName: "Jimmy's Smooth Sausage",
  score: 7.9,
  bristolType: 4,
  poopSummary: "The poop appears well-formed and consistent...",
  stoolDescription: "Well-formed cylindrical shape...",
  hydrationJudgement: "Slightly dehydrated but within normal range",
  // ... complete mock response
};
```

**Debug Logging:**

```tsx
const debugLog = (service: string, operation: string, data: any) => {
  if (__DEV__) {
    console.log(`🔧 [${service}] ${operation}:`, data);
  }
};
```

## Security & Privacy

### Data Protection

**Token Security:**

- JWT tokens stored in secure AsyncStorage
- Automatic token expiration handling
- Secure transmission over HTTPS only
- Token removal on logout

**Image Security:**

- Images processed locally before upload
- Temporary file cleanup after analysis
- No permanent image storage on device
- Secure transmission to analysis service

**User Data Privacy:**

- Minimal data collection principle
- Clear consent for data usage
- Option to delete all user data
- GDPR compliance measures

### API Security

**Request Authentication:**

```tsx
const makeAuthenticatedRequest = async (url: string, options: RequestInit) => {
  const token = await AsyncStorage.getItem("authToken");

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  return fetch(url, { ...options, headers });
};
```

**Input Validation:**

```tsx
const validateImageInput = (imageUri: string): boolean => {
  if (!imageUri || typeof imageUri !== "string") {
    throw new Error("Invalid image URI provided");
  }

  if (!imageUri.startsWith("file://") && !imageUri.startsWith("data:")) {
    throw new Error("Image URI must be a local file or data URI");
  }

  return true;
};
```

## Testing Strategies

### Unit Testing

**Service Mocking:**

```tsx
// Mock service for testing
jest.mock("../services/auth/authService", () => ({
  authService: {
    login: jest.fn().mockResolvedValue({ token: "mock-token" }),
    getUserProfile: jest.fn().mockResolvedValue({ name: "Test User" }),
    verifyToken: jest.fn().mockResolvedValue(true),
  },
}));
```

**Error Scenario Testing:**

```tsx
describe("Analysis Service Error Handling", () => {
  it("should handle network timeouts gracefully", async () => {
    // Mock network timeout
    fetch.mockRejectedValueOnce(new Error("Network timeout"));

    await expect(analyzeImage("test-uri", "device-id")).rejects.toThrow(
      "Request timeout - please try again"
    );
  });
});
```

### Integration Testing

**End-to-End API Testing:**

```tsx
describe("Authentication Flow", () => {
  it("should complete full login/profile fetch cycle", async () => {
    const loginResponse = await authService.login("test@email.com", "password");
    expect(loginResponse.token).toBeDefined();

    const profile = await authService.getUserProfile(loginResponse.token);
    expect(profile.name).toBeDefined();
  });
});
```

## Performance Optimization

### Caching Strategies

**Response Caching:**

```tsx
const responseCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCachedResponse = (key: string) => {
  const cached = responseCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};
```

**Image Optimization:**

```tsx
const optimizeImageForUpload = async (imageUri: string): Promise<string> => {
  return await manipulateAsync(
    imageUri,
    [{ resize: { width: 800 } }], // Compress to reasonable size
    { compress: 0.8, format: SaveFormat.JPEG }
  );
};
```

### Request Optimization

**Batch Operations:**

```tsx
const batchScanUpload = async (scans: ScanData[]): Promise<void> => {
  // Upload multiple scans in a single request
  const batchData = scans.map((scan) => ({
    id: scan.id,
    imageData: scan.imageUri,
    timestamp: scan.timestamp,
  }));

  await makeApiCall("/api/scans/batch", {
    method: "POST",
    body: JSON.stringify({ scans: batchData }),
  });
};
```

## Troubleshooting

### Common Issues

**Authentication failures:**

- Check network connectivity and API endpoint
- Verify token storage and retrieval
- Validate user credentials format
- Test with development vs production endpoints

**Analysis service errors:**

- Confirm image format and size requirements
- Check API timeout settings
- Verify development mode mock responses
- Test network connectivity and retry logic

**Subscription issues:**

- Verify App Store Connect configuration
- Check product IDs and sandbox environment
- Test with valid Apple test accounts
- Validate receipt processing logic

### Debug Tools

**Service Status Checker:**

```tsx
const checkServiceHealth = async () => {
  const results = {
    auth: await testAuthService(),
    analysis: await testAnalysisService(),
    subscription: await testSubscriptionService(),
  };

  console.log("Service Health Check:", results);
  return results;
};
```

**Request Interceptor:**

```tsx
const logApiRequest = (url: string, options: RequestInit) => {
  if (__DEV__) {
    console.log("🌐 API Request:", { url, options });
  }
};
```

## Best Practices

### Service Design

- Keep services stateless and focused on single responsibilities
- Use dependency injection for better testability
- Implement proper error boundaries and fallback mechanisms
- Cache responses appropriately to reduce network calls

### Error Handling

- Provide clear, actionable error messages to users
- Log detailed error information for debugging
- Implement exponential backoff for retry logic
- Use circuit breakers for failing services

### Security

- Never log sensitive data like tokens or passwords
- Validate all inputs before processing
- Use HTTPS for all production communications
- Implement proper session management

### Performance

- Optimize image sizes before upload
- Use appropriate timeout values for different operations
- Cache static data and user preferences
- Minimize API calls through smart batching

This services layer provides the foundation for all external communication in PoopAI, ensuring reliable, secure, and performant interactions with backend systems while maintaining excellent user experience through proper error handling and offline capabilities.
