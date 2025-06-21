# PoopAI Frontend Feature Inventory

This document provides a comprehensive list of all features currently implemented in the PoopAI frontend application. Each feature is documented with its location, purpose, and implementation details.

## Table of Contents

1. [Core App Architecture](#core-app-architecture)
2. [Authentication & User Management](#authentication--user-management)
3. [Onboarding F### 30. Profile S### 31. Settings### 32. Health Data Screens

**Location**: `screens/profile/PoopGoalsScreen.tsx`, `screens/profile/ConditionsScreen.tsx`, `screens/profile/SymptomsScreen.tsx`
**Purpose**: Health-related data management
**Features**:

- **PoopGoalsScreen**: Personal health goals management
- **ConditionsScreen**: Medical conditions tracking
- **SymptomsScreen**: Symptoms monitoring and updates**Location**: `screens/profile/SettingsScreen.tsx`
  **Purpose**: App configuration and user preferencesn

**Location**: `screens/profile/ProfileScreen.tsx`
**Purpose**: User profile management and navigation hub(#onboarding-flow) 4. [Camera & Scanning](#camera--scanning) 5. [AI Analysis & Results](#ai-analysis--results) 6. [Subscription & Payment System](#subscription--payment-system) 7. [Calendar & History](#calendar--history) 8. [User Profile & Settings](#user-profile--settings) 9. [Navigation & Routing](#navigation--routing) 10. [UI Components & Animations](#ui-components--animations) 11. [Context & State Management](#context--state-management) 12. [Services & APIs](#services--apis) 13. [Development Tools](#development-tools) 14. [Home Screen](#home-screen) 15. [Assets & Resources](#assets--resources)

---

## Core App Architecture

### 1. Main App Entry Point

**Location**: `App.tsx`, `index.js`
**Purpose**: Application initialization, global providers setup, and background styling
**Implementation**:

- Global gradient background with cloudy sky image overlay
- Provider hierarchy for all contexts (Auth, Scan, Onboarding, etc.)
- Loading screen handling during app initialization
- StatusBar configuration
- Global CSS imports for NativeWind styling

### 2. Global Background System

**Location**: `App.tsx` (LinearGradient + ImageBackground)
**Purpose**: Consistent visual theme across all screens
**Implementation**:

- Linear gradient: `["#ffffff", "#f1f5f9", "#cbd5e1"]`
- Background image: `assets/cloudy_sky.jpg` with 12% opacity and 1.2x scale
- Applied globally to maintain consistency during navigation transitions

### 3. Responsive Design System

**Location**: `context/DimensionsContext.tsx`
**Purpose**: Dynamic sizing based on device dimensions
**Implementation**:

- Provides `screenWidth` and `screenHeight` to all components
- Used for responsive calculations throughout the app
- Ensures consistent proportions across different device sizes

---

## Authentication & User Management

### 4. Authentication Context & Service

**Location**: `context/auth/AuthContext.tsx`, `services/auth/authService.ts`
**Purpose**: User authentication, session management, and user data handling
**Implementation**:

- JWT token-based authentication
- User profile data management (name, email, premium status, scan counts)
- Device-based anonymous usage support
- Authentication state persistence with AsyncStorage
- Automatic token refresh and validation

### 5. Authentication Modals & Forms

**Location**: `components/auth/` directory
**Purpose**: User authentication UI components
**Features**:

- **LoginForm**: Email/password login with validation
- **SignupForm**: Account creation with form validation
- **AuthModal**: Generic modal wrapper for auth forms
- **OnboardingAuthModal**: Specialized auth modal for onboarding flow
- **LogoutConfirmationModal**: Confirms user logout action
- **ReSignInModal**: Handles re-authentication scenarios

### 6. Authentication Overlay System

**Location**: `components/auth/AuthOverlay.tsx`
**Purpose**: Global authentication overlay that can appear over any screen
**Implementation**:

- Blur background with glassmorphism effects
- Switchable between login and signup modes
- Integrated with auth context for state management

---

## Onboarding Flow

### 7. Onboarding Context & Management

**Location**: `context/features/OnboardingContext.tsx`
**Purpose**: Manages onboarding completion state and navigation targets
**Implementation**:

- Tracks whether user has completed onboarding
- Handles navigation destination after onboarding ("home" or "camera")
- Integrates with authentication to skip onboarding for returning users

### 8. Interactive Onboarding Screen Component

**Location**: `components/core/OnboardingScreen.tsx`
**Purpose**: Reusable animated dialogue component with PoopBot character
**Features**:

- Typewriter text animation with customizable speed
- Animated PoopBot character with floating effects
- Sparkle animations around character
- Primary and secondary action buttons
- Tap-to-skip functionality
- Responsive sizing based on device dimensions

### 9. Main Onboarding Screen

**Location**: `screens/onboarding/OnboardingScreen.tsx`
**Purpose**: Initial app introduction with PoopBot
**Implementation**:

- Introduction messages from PoopAI character
- "Let's go!" button to proceed to quiz
- Animated character interactions

### 10. Micro Quiz System

**Location**: `screens/onboarding/MicroQuizScreen.tsx`
**Purpose**: Comprehensive user onboarding questionnaire
**Flow Steps**:

- Main goal selection (health, tracking, curiosity, fun)
- Health conditions assessment
- Symptoms evaluation
- Health goals setting
- Tracking preferences
- Analysis preference selection
- Final messaging before app usage

### 11. Quiz Components & Layouts

**Location**: `components/quiz/` directory
**Purpose**: Reusable quiz UI components
**Components**:

- **QuizScreenLayout**: Common layout wrapper with back navigation
- **QuizSingleSelect**: Single choice selection interface
- **QuizMultiSelect**: Multiple choice selection interface
- **MainQuizGridButtons**: Main goal selection grid
- **QuizOptionButton**: Individual option button component
- **QuizNavigationButton**: Navigation controls for quiz flow

### 12. Specialized Quiz Screens

**Location**: `screens/onboarding/` directory
**Features**:

- **ConditionsScreen**: Health conditions assessment
- **SymptomsScreen**: Symptoms evaluation interface
- **GoalsScreen**: Health goals selection
- **TrackingFrequencyScreen**: Tracking frequency preferences
- **AnalysisPreferenceScreen**: Analysis detail preferences
- **PersonalizationScreen**: Final personalization step

### 13. Quiz Context & Data Management

**Location**: `context/features/QuizContext.tsx`
**Purpose**: Manages user responses throughout onboarding
**Implementation**:

- Stores all quiz answers
- Provides answer updates and retrieval
- Integrates with backend for data persistence

---

## Camera & Scanning

### 14. Camera Screen & Functionality

**Location**: `screens/camera/CameraScreen.tsx`
**Purpose**: Photo capture and analysis initiation
**Features**:

- Expo Camera integration with permission handling
- Photo preview with blur toggle functionality
- Scan counter integration with premium checks
- Analysis loading states and animations
- Retry and navigation controls
- Flash toggle functionality

### 15. Camera Components & Overlays

**Location**: `components/camera/` directory (camera-related)
**Components**:

- **CameraView**: Main camera interface component
- **ScanOverlay**: UI overlay during scanning
- **CameraLoadingOverlay**: Initial camera loading state
- **ScanInstructions**: User guidance for taking photos

### 16. Scan Counter System

**Location**: `components/camera/ScanCounter.tsx`, `components/camera/CameraScanCounter.tsx`
**Purpose**: Display and manage user scan credits
**Features**:

- Real-time scan count display
- Premium vs. free user differentiation
- Interactive upgrade prompts
- Responsive sizing based on camera button size
- Integration with payment flow

### 17. Scan Context & State Management

**Location**: `context/features/ScanContext.tsx`
**Purpose**: Global scan credit and usage tracking
**Features**:

- Tracks scans left (free and paid)
- Premium user status management
- Total scans performed tracking
- Development mode controls for testing
- Automatic refresh after successful scans
- Integration with backend for real-time updates

---

## AI Analysis & Results

### 18. Analysis Service

**Location**: `services/analysis/analysisService.ts`
**Purpose**: Image analysis API integration
**Implementation**:

- Image upload and processing
- AI analysis result parsing
- Error handling and retry logic
- Development mode mock responses
- Integration with scan tracking

### 19. Results Screen

**Location**: `screens/analysis/ResultsScreen.tsx`
**Purpose**: Display AI analysis results with animations
**Features**:

- Animated poop meter with score visualization
- Cinematic transition from meter to card view
- Blur toggle for photo privacy
- Sharing functionality for results
- Save results popup integration
- Premium subscription prompts for new users

### 20. Results Components

**Location**: `components/analysis/` directory (results-related)
**Components**:

- **PoopMeterAnimation**: Animated score meter with visual feedback
- **PoopScoreDisplay**: Circular score display component
- **AnalysisSummary**: Detailed analysis breakdown
- **ShareableResultsView**: Formatted view for sharing
- **SaveResultsPopup**: Save confirmation interface
- **ResultCard**: Card-style result display
- **AnalyzingOverlay**: Loading animation during analysis

### 21. Analysis Data Types

**Location**: `types/api.ts`
**Purpose**: Type definitions for analysis data
**Implementation**:

- Structured analysis response types
- Bristol scale integration
- Score and recommendation fields
- Timestamp and metadata handling

---

## Subscription & Payment System

### 22. In-App Purchase Service

**Location**: `services/subscription/InAppPurchaseService.ts`
**Purpose**: iOS App Store integration for subscriptions
**Features**:

- Monthly and annual subscription plans
- Mock implementation for development/Expo Go
- Purchase validation and receipt handling
- Subscription status checking
- Product loading and pricing
- Error handling and user feedback

### 23. In-App Purchase Hook

**Location**: `hooks/useInAppPurchases.ts`
**Purpose**: React hook for subscription management
**Implementation**:

- Subscription plan loading
- Purchase flow handling
- Subscription status tracking
- Error handling with user alerts
- Purchase restoration

### 24. Payment Screen

**Location**: `screens/subscription/PaymentScreen.tsx`
**Purpose**: Subscription upgrade interface
**Features**:

- Multiple payment screen types (scan credits, premium subscription)
- Plan selection (monthly/annual) with pricing
- Feature comparison lists
- Free trial offerings
- Premium benefits highlighting
- Animated subscription flows

### 25. Payment Configuration

**Location**: `config/paymentConfig.ts`
**Purpose**: Payment screen configurations and copy
**Implementation**:

- Screen-specific configurations
- Feature lists and pricing
- Copy text and messaging
- Plan comparison data

### 26. Subscription Context

**Location**: `context/features/SubscriptionContext.tsx`
**Purpose**: Global subscription state management
**Implementation**:

- Premium status tracking
- Subscription validation
- Integration with user profile
- Automatic status updates

---

## Calendar & History

### 27. Calendar Screen

**Location**: `screens/calendar/CalendarScreen.tsx`
**Purpose**: Monthly calendar view with scan history
**Features**:

- Monthly calendar grid with navigation
- Scan date highlighting with count badges
- Today indicator and visual differentiation
- Scan details modal with analysis display
- Scan image display in detail modal
- Monthly summary statistics
- Bristol type color coding

### 28. Mini Calendar Component

**Location**: `components/calendar/MiniCalendar.tsx`
**Purpose**: Compact 7-day scroll view for profile screen
**Features**:

- Horizontal scrolling 7-day view
- Focused day with large preview
- Scan image preview with blur toggle
- Average score calculation and display
- Interactive day selection
- Responsive sizing and animations
- Integration with full calendar navigation

### 29. Scan Service & History

**Location**: `services/analysis/scanService.ts`
**Purpose**: Scan data management and calendar integration
**Features**:

- User scan history retrieval
- Date-based scan grouping
- Monthly scan filtering
- Scan deletion functionality
- Data formatting for calendar display

---

## User Profile & Settings

### 31. Profile Screen

**Location**: `screens/ProfileScreen.tsx`
**Purpose**: User profile management and navigation hub
**Features**:

- Mini calendar integration
- Settings navigation
- Health goals management
- Conditions and symptoms access
- Logout functionality with confirmation
- Premium calendar feature access
- Responsive header with navigation

### 32. Settings Screen

**Location**: `screens/SettingsScreen.tsx`
**Purpose**: App configuration and user preferences
**Features**:

- Account management
- Notification preferences
- Privacy settings
- Data management options
- Version information
- Logout functionality

### 33. Health Data Screens

**Location**: `screens/PoopGoalsScreen.tsx`, `screens/ConditionsScreen.tsx`, `screens/SymptomsScreen.tsx`
**Purpose**: Health-related data management
**Features**:

- **PoopGoalsScreen**: Personal health goals management
- **ConditionsScreen**: Medical conditions tracking
- **SymptomsScreen**: Symptoms monitoring and updates
- Form validation and data persistence
- Integration with user profile

---

## Navigation & Routing

### 34. App Navigator

**Location**: `navigation/AppNavigator.tsx`
**Purpose**: Main navigation structure and routing logic
**Implementation**:

- Stack navigation with custom transitions
- Onboarding vs. main app flow routing
- Authentication-based navigation guards
- Gesture control configuration
- Screen-specific navigation options

### 35. Navigation Types

**Location**: `types/navigation.ts`
**Purpose**: TypeScript definitions for navigation
**Implementation**:

- Route parameter type definitions
- Screen name type safety
- Navigation prop types
- Parameter validation

---

## UI Components & Animations

### 36. Button Components

**Location**: `components/` directory
**Components**:

- **PrimaryButton**: Main action buttons with loading states
- **HeroPrimaryButton**: Large promotional buttons
- **HeroSecondaryButton**: Secondary action buttons
- **BackButton**: Consistent back navigation
- **HomeButton**: Home navigation with responsive sizing

### 37. Display Components

**Location**: `components/` directory
**Components**:

- **HomeHeader**: Main screen header with user greeting
- **LoadingScreen**: App initialization loading with progress
- **ErrorDisplay**: Error state handling and display
- **InteractiveDialogue**: Conversation-style UI components

### 38. Animation Components

**Location**: `components/` directory
**Features**:

- **PoopMeterAnimation**: Animated score visualization
- **AnalyzingOverlay**: Loading animations during analysis
- **FreeScanCelebrationModal**: Reward animations
- Sparkle effects and floating animations
- Transition animations between screens

---

## Context & State Management

### 38. Loading Context

**Location**: `context/core/LoadingContext.tsx`
**Purpose**: Global loading state management
**Implementation**:

- App initialization loading
- Progress tracking
- Loading completion handling

### 39. Dimensions Context

**Location**: `context/core/DimensionsContext.tsx`
**Purpose**: Responsive design dimensions
**Implementation**:

- Screen dimension tracking
- Responsive calculation utilities
- Device-specific adjustments

### 40. Error Context

**Location**: `context/core/ErrorContext.tsx`
**Purpose**: Global error handling and display
**Implementation**:

- Error state management
- Error message display
- Error recovery handling

---

## Services & APIs

### 41. Authentication Service

**Location**: `services/auth/authService.ts`
**Purpose**: Backend authentication API integration
**Features**:

- User login and registration
- Token management
- Profile data synchronization
- Device scan data for anonymous users
- Password reset functionality

---

## Development Tools

### 42. Development Configuration

**Location**: `config/app.config.ts`
**Purpose**: Environment-specific configuration
**Implementation**:

- Development vs. production settings
- API endpoint configuration
- Feature flags
- Debug settings

---

## Home Screen

### 43. Home Screen

**Location**: `screens/core/HomeScreen.tsx`
**Purpose**: Main app landing screen with single camera button layout
**Features**:

- Poop score display with profile integration
- Single camera button with animations
- Sparkle effects around camera button
- Floating animations
- Scan counter integration
- Responsive layout calculations
- Premium user handling

---

## Assets & Resources

### 44. Assets & Resources

**Location**: `assets/` directory
**Purpose**: Application visual assets
**Content**:

- SVG icons and illustrations
- Background images
- App icons and splash screens
- Character assets (PoopBot)

---

## Summary

The PoopAI frontend consists of **44 major features** across multiple categories:

- **13** Core app architecture & management features
- **8** Authentication & user management features
- **10** Onboarding flow features
- **4** Camera & scanning features
- **4** AI analysis & results features
- **5** Subscription & payment features
- **3** Calendar & history features
- **3** Profile & settings features
- **2** Navigation features
- **3** UI component categories
- **3** Context management features
- **1** Service integration
- **1** Development configuration tool
- **1** Home screen
- **1** Assets & resources

This inventory provides a comprehensive overview of all implemented functionality in the PoopAI frontend application as of June 2025.
