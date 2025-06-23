# Development Tools & Configuration

## Overview

The development tools and configuration system provides essential utilities for building, testing, and debugging the PoopAI application. This includes environment-specific settings, development mode toggles, configuration management, and debugging utilities that help developers work efficiently across different environments.

## Architecture

### Configuration Management

**App Configuration** (`config/app.config.ts`)

- Environment-specific settings and feature flags
- API endpoint management for development vs production
- Mock data configuration for testing

**Payment Configuration** (`config/paymentConfig.ts`)

- Payment screen configurations and copy text
- Feature lists and pricing information
- A/B testing configurations for different payment flows

### Development Environment Support

**Mock Services**

- Development mode toggles for API services
- Mock data responses for offline development
- Simulated delays to test loading states

**Debugging Tools**

- Console logging for development mode
- Service health checking utilities
- Request/response debugging helpers

## Implementation Details

### 1. App Configuration

**Location:** `config/app.config.ts`

**Purpose:**

- Central configuration management for the entire application
- Environment-specific settings and API endpoints
- Feature flags and development mode controls

**Configuration Structure:**

```tsx
export const AppConfig = {
  // Development mode flag
  isDevelopmentMode: false, // Set to true for local development

  // API configuration
  api: {
    baseUrl: "http://104.248.224.160:5000", // Production backend URL
    endpoints: {
      analyzeImage: "/api/poop/analyze",
      // Add other endpoints as needed
    },
    timeout: 300000, // 5 minutes for AI processing
  },

  // Mock data settings
  mockData: {
    analysisDelay: 3000, // Simulated processing time in development
  },
} as const;
```

**Usage Examples:**

```tsx
// Environment-aware service selection
const getAnalysisService = () => {
  return AppConfig.isDevelopmentMode
    ? mockAnalysisService
    : productionAnalysisService;
};

// API endpoint construction
const apiUrl = `${AppConfig.api.baseUrl}${AppConfig.api.endpoints.analyzeImage}`;

// Development mode checks
if (AppConfig.isDevelopmentMode) {
  console.log("🔧 Running in development mode with mock data");
}
```

### 2. Environment Management

**Development Mode Features:**

- Mock API responses for offline development
- Extended logging and debugging information
- Simulated processing delays for testing loading states
- Bypass authentication for faster development cycles

**Production Mode Features:**

- Real API communication with backend services
- Optimized logging (errors only)
- Performance optimizations
- Full authentication requirements

**Environment Detection:**

```tsx
// Automatic environment detection
const isDev = __DEV__; // React Native development flag
const isExpoGo = Constants.appOwnership === "expo"; // Running in Expo Go

// Configuration switching
const getApiBaseUrl = () => {
  if (isDev) {
    return "http://localhost:3000"; // Local development server
  }
  return "https://api.poopai.com"; // Production API
};
```

### 3. Payment Configuration System

**Location:** `config/paymentConfig.ts`

**Purpose:**

- Centralized payment screen configurations
- A/B testing support for different payment flows
- Dynamic pricing and feature list management

**Configuration Types:**

```tsx
interface PaymentConfig {
  title: string;
  subtitle: string;
  sectionTitle: string;
  features: Array<{
    icon: string;
    text: string;
  }>;
  choosePlanTitle: string;
  monthlyText: {
    title: string;
    price: string;
    period: string;
    // ... additional pricing fields
  };
  annualText: {
    title: string;
    price: string;
    period: string;
    badge?: string;
    // ... additional pricing fields
  };
  freeScanSection?: {
    title: string;
    subtitle: string;
    buttonText: string;
    disclaimer: string;
  };
}
```

**Usage:**

```tsx
// Dynamic configuration loading
const config = paymentConfigs["scan-credits"] || paymentConfigs.default;

// Feature list rendering
{
  config.features.map((feature, index) => (
    <FeatureItem key={index} icon={feature.icon} text={feature.text} />
  ));
}
```

### 4. Debugging Utilities

**Development Logging:**

```tsx
const debugLog = (service: string, operation: string, data?: any) => {
  if (__DEV__) {
    console.log(`🔧 [${service}] ${operation}`, data ? data : "");
  }
};

// Usage in services
debugLog("AuthService", "Login attempt", { email: user.email });
debugLog("AnalysisService", "Image upload started");
```

**Service Health Monitoring:**

```tsx
const checkServiceHealth = async () => {
  const healthCheck = {
    auth: await testAuthServiceConnection(),
    analysis: await testAnalysisServiceConnection(),
    subscription: await testSubscriptionServiceConnection(),
    timestamp: new Date().toISOString(),
  };

  if (__DEV__) {
    console.table(healthCheck);
  }

  return healthCheck;
};
```

**Network Request Debugging:**

```tsx
const logNetworkRequest = (url: string, method: string, headers: any) => {
  if (__DEV__) {
    console.group(`🌐 ${method} ${url}`);
    console.log("Headers:", headers);
    console.log("Timestamp:", new Date().toISOString());
    console.groupEnd();
  }
};
```

### 5. Feature Flags System

**Implementation:**

```tsx
const FeatureFlags = {
  enableAnalyticsSharingButton: true,
  enablePremiumOnboardingFlow: true,
  enableAdvancedHealthMetrics: false,
  enableSocialSharing: true,

  // Subscription features
  enableFreeTrialOffer: true,
  enableSharingBasedFreeScans: true,

  // Development features
  enableMockAnalysis: AppConfig.isDevelopmentMode,
  enableDebugPanel: __DEV__,
};

// Usage in components
{
  FeatureFlags.enableSharingBasedFreeScans && <FreeScanSharingSection />;
}
```

**A/B Testing Support:**

```tsx
const getFeatureVariant = (featureName: string, userId?: string): string => {
  if (!userId) return "default";

  // Simple hash-based variant assignment
  const hash = simpleHash(userId + featureName);
  return hash % 2 === 0 ? "variantA" : "variantB";
};
```

### 6. Build Configuration

**Metro Configuration:**

```javascript
// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Custom resolver for development
config.resolver.alias = {
  "@services": "./services",
  "@components": "./components",
  "@config": "./config",
  "@utils": "./utils",
};

module.exports = config;
```

**TypeScript Configuration:**

```json
// tsconfig.json (key development settings)
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "baseUrl": "./",
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./components/*"],
      "@services/*": ["./services/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx"]
}
```

## Development Workflows

### 1. Local Development Setup

**Environment Setup:**

```bash
# Install dependencies
npm install

# Set development mode
# Edit config/app.config.ts: isDevelopmentMode: true

# Start development server
npx expo start

# Run on device/simulator
npx expo run:ios
npx expo run:android
```

**Development Mode Benefits:**

- Mock API responses (no backend required)
- Extended logging and debugging
- Hot reload and fast refresh
- Access to React Native debugger

### 2. Testing Configuration

**Jest Configuration:**

```javascript
// jest.config.js
module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testPathIgnorePatterns: ["/node_modules/", "/build/"],
  moduleNameMapping: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@components/(.*)$": "<rootDir>/components/$1",
  },
};
```

**Test Environment Variables:**

```tsx
// jest.setup.js
process.env.NODE_ENV = "test";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

// Mock app config for testing
jest.mock("./config/app.config", () => ({
  AppConfig: {
    isDevelopmentMode: true,
    api: {
      baseUrl: "http://localhost:3000",
      endpoints: { analyzeImage: "/api/test" },
      timeout: 5000,
    },
  },
}));
```

### 3. Production Build Configuration

**Build Optimization:**

```tsx
// Pre-build configuration check
const validateProductionConfig = () => {
  if (__DEV__) {
    console.warn("⚠️ Development mode is enabled in production build!");
  }

  if (AppConfig.isDevelopmentMode) {
    throw new Error("Production build cannot use development mode");
  }

  if (!AppConfig.api.baseUrl.startsWith("https://")) {
    throw new Error("Production API must use HTTPS");
  }
};
```

**Environment-Specific Builds:**

```javascript
// app.config.js (Expo configuration)
export default ({ config }) => {
  const isProduction = process.env.APP_VARIANT === "production";

  return {
    ...config,
    name: isProduction ? "PoopAI" : "PoopAI Dev",
    slug: isProduction ? "poopai" : "poopai-dev",
    extra: {
      isProduction,
      apiUrl: isProduction ? "https://api.poopai.com" : "http://localhost:3000",
    },
  };
};
```

## Debugging Tools

### 1. Console Debugging

**Structured Logging:**

```tsx
const Logger = {
  debug: (tag: string, message: string, data?: any) => {
    if (__DEV__) {
      console.log(`🔧 [${tag}] ${message}`, data || "");
    }
  },

  error: (tag: string, error: Error, context?: any) => {
    console.error(`❌ [${tag}] ${error.message}`, { error, context });
  },

  performance: (tag: string, startTime: number) => {
    if (__DEV__) {
      const duration = Date.now() - startTime;
      console.log(`⏱️ [${tag}] Took ${duration}ms`);
    }
  },
};
```

### 2. React Native Debugger Integration

**Debugger Configuration:**

```tsx
// Enable Flipper integration
if (__DEV__) {
  import("react-native-flipper").then(({ default: Flipper }) => {
    // Network debugging
    Flipper.addNetworkInterceptor({
      onRequest: (request) => {
        console.log("Network Request:", request);
      },
      onResponse: (response) => {
        console.log("Network Response:", response);
      },
    });
  });
}
```

### 3. Performance Monitoring

**Render Performance:**

```tsx
const withPerformanceMonitoring = (Component: React.FC) => {
  return (props: any) => {
    const renderStart = Date.now();

    useEffect(() => {
      const renderTime = Date.now() - renderStart;
      if (__DEV__ && renderTime > 100) {
        console.warn(`⚠️ Slow render: ${Component.name} took ${renderTime}ms`);
      }
    });

    return <Component {...props} />;
  };
};
```

## Best Practices

### Configuration Management

- Keep sensitive data out of configuration files
- Use environment variables for deployment-specific settings
- Validate configuration on app startup
- Use TypeScript for type-safe configuration

### Development Workflow

- Always test with both mock and real data
- Use feature flags for experimental features
- Maintain separate development and production configurations
- Regular dependency updates and security audits

### Debugging

- Use structured logging with appropriate log levels
- Implement proper error boundaries
- Monitor performance in development
- Test error scenarios thoroughly

### Build Process

- Validate configuration before production builds
- Use automated testing in CI/CD pipeline
- Monitor bundle size and performance
- Implement proper environment separation

This development tools system provides a solid foundation for efficient development, testing, and deployment of the PoopAI application while maintaining code quality and developer productivity.
