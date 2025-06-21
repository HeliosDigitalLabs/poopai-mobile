# App Architecture

## Overview

The PoopAI frontend is built with React Native and Expo, featuring a modular architecture with global state management, responsive design, and consistent visual theming. The app uses a provider-based architecture for state management and maintains a global visual theme throughout all screens.

## Core Architecture Components

### 1. Application Entry Point

**Files:**
- `App.tsx` - Main application component
- `index.js` - Expo entry point

**Purpose:**
- Initialize the app with global providers
- Set up global background styling
- Configure status bar and navigation

**Key Features:**
- Provider hierarchy setup (Auth, Scan, Onboarding contexts)
- Global gradient background with cloudy sky overlay
- Loading screen during app initialization
- Status bar configuration

**Implementation Details:**
```tsx
// Provider hierarchy in App.tsx
<AuthProvider>
  <OnboardingProvider>
    <ScanProvider>
      <LoadingProvider>
        <DimensionsProvider>
          {/* App content */}
        </DimensionsProvider>
      </LoadingProvider>
    </ScanProvider>
  </OnboardingProvider>
</AuthProvider>
```

### 2. Global Background System

**Location:** `App.tsx` (LinearGradient + ImageBackground)

**Purpose:**
- Maintain consistent visual theme across all screens
- Provide smooth transitions during navigation
- Create atmospheric background effect

**Configuration:**
- **Gradient:** `["#ffffff", "#f1f5f9", "#cbd5e1"]` (white to light gray)
- **Background Image:** `assets/cloudy_sky.jpg` at 12% opacity with 1.2x scale
- **Applied globally** to prevent visual inconsistencies during navigation

**Customization:**
```tsx
// To change global background in App.tsx
<LinearGradient 
  colors={["#new-color-1", "#new-color-2", "#new-color-3"]}
  style={styles.background}
>
  <ImageBackground 
    source={require('./assets/new-background.jpg')}
    style={{ opacity: 0.15, transform: [{ scale: 1.3 }] }}
  >
```

### 3. Responsive Design System

**Location:** `context/core/DimensionsContext.tsx`

**Purpose:**
- Provide device dimensions to all components
- Enable responsive UI calculations
- Maintain consistent proportions across devices

**Key Features:**
- Real-time screen dimension tracking
- Automatic updates on orientation changes
- Used throughout app for responsive sizing

**Usage Example:**
```tsx
const { screenWidth, screenHeight } = useDimensions();
const buttonHeight = screenHeight * 0.06; // 6% of screen height
const fontSize = screenHeight * 0.02; // 2% of screen height
```

## File Structure Organization

### Feature-Based Organization
```
frontend/
├── components/
│   ├── analysis/     # Analysis-related components
│   ├── auth/         # Authentication components
│   ├── camera/       # Camera and scanning components
│   ├── calendar/     # Calendar components
│   ├── core/         # Core reusable components
│   ├── navigation/   # Navigation components
│   ├── quiz/         # Onboarding quiz components
│   ├── subscription/ # Payment and subscription components
│   └── ui/          # Basic UI components
├── screens/
│   ├── analysis/     # Analysis results screens
│   ├── camera/       # Camera screens
│   ├── calendar/     # Calendar screens
│   ├── core/         # Core app screens (Home)
│   ├── onboarding/   # Onboarding flow screens
│   ├── profile/      # Profile and settings screens
│   └── subscription/ # Payment screens
├── context/
│   ├── auth/         # Authentication context
│   ├── core/         # Core app contexts (Dimensions, Loading)
│   └── features/     # Feature-specific contexts
├── services/
│   ├── analysis/     # Analysis API services
│   ├── auth/         # Authentication services
│   └── subscription/ # Subscription services
└── types/           # TypeScript definitions
```

## Key Design Patterns

### 1. Context-Based State Management
- Each major feature has its own context
- Contexts are composed in a provider hierarchy
- State is lifted to appropriate levels to avoid prop drilling

### 2. Responsive Design Pattern
- All sizing calculations use screen dimensions
- Components adapt to different screen sizes
- Consistent proportions across devices

### 3. Service Layer Pattern
- Business logic separated into service files
- API calls abstracted behind service interfaces
- Easy to mock for testing and development

## Development Environment

### Configuration Files
- `app.config.js` - Expo configuration
- `babel.config.js` - Babel transpilation setup
- `metro.config.js` - Metro bundler configuration
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.js` - NativeWind/Tailwind CSS setup

### Key Dependencies
- **React Native & Expo** - Core framework
- **React Navigation** - Navigation system
- **NativeWind** - Tailwind CSS for React Native
- **Expo Blur** - Blur effects
- **React Native Linear Gradient** - Gradient effects
- **AsyncStorage** - Local data persistence

## Initialization Flow

1. **App Start** - `index.js` loads `App.tsx`
2. **Provider Setup** - Context providers are initialized in hierarchy
3. **Loading Screen** - `LoadingContext` manages initial loading state
4. **Authentication Check** - `AuthContext` determines user state
5. **Navigation Decision** - Route to onboarding or main app based on user state
6. **Screen Rendering** - Appropriate screens load with global styling

## Performance Considerations

### Optimization Strategies
- Context providers are ordered by update frequency
- Heavy components use `React.memo` for memoization
- Image assets are optimized and properly sized
- Animations use `useNativeDriver` when possible

### Bundle Size Management
- Feature-based code splitting through dynamic imports
- Tree shaking enabled for unused code elimination
- Asset optimization through Expo's build process

## Customization Guide

### Adding New Features
1. Create feature directory in appropriate section (`components/`, `screens/`, etc.)
2. Add context if global state is needed
3. Create service layer for API interactions
4. Add navigation routes if new screens are involved
5. Update TypeScript types as needed

### Modifying Global Styles
1. **Background:** Update `App.tsx` LinearGradient colors
2. **Dimensions:** Modify calculations in `DimensionsContext.tsx`
3. **Theme:** Update Tailwind config in `tailwind.config.js`

### Environment Configuration
- Development settings in `config/app.config.ts`
- Environment variables through Expo's config system
- Feature flags for experimental features

## Testing Strategy

### Unit Testing
- Component testing with React Native Testing Library
- Service layer testing with Jest
- Context testing with custom render utilities

### Integration Testing
- Navigation flow testing
- Auth flow integration tests
- API integration tests with mocked services

### Development Tools
- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Expo development tools for debugging

## Troubleshooting

### Common Issues

**Navigation not working:**
- Check navigation prop types in `types/navigation.ts`
- Verify screen registration in `AppNavigator.tsx`
- Ensure proper navigation hierarchy

**Context not updating:**
- Verify provider hierarchy in `App.tsx`
- Check if context is properly consumed with hook
- Ensure state updates are immutable

**Responsive sizing issues:**
- Verify `DimensionsContext` is accessible
- Check calculations use screen dimensions
- Test on different device sizes

**Background not showing:**
- Check `App.tsx` gradient configuration
- Verify image assets are properly imported
- Ensure styles are applied correctly

### Performance Issues
- Use React DevTools Profiler to identify bottlenecks
- Check for unnecessary re-renders in contexts
- Optimize image sizes and formats
- Use `React.memo` for expensive components
