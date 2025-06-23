# Authentication System

## Overview

The authentication system handles user login, registration, session management, and device-based anonymous usage. It supports both authenticated users with cloud data sync and anonymous users with local data storage. The system uses JWT tokens for secure API communication and provides seamless transitions between anonymous and authenticated states.

## Architecture

### Core Components

**Authentication Context** (`context/auth/AuthContext.tsx`)
- Global authentication state management
- User profile data handling
- Session persistence and token management
- Anonymous user support

**Authentication Service** (`services/auth/authService.ts`)
- API communication for auth operations
- Token validation and refresh
- Device identification for anonymous users
- Password reset functionality

**Authentication UI Components** (`components/auth/`)
- Login and signup forms
- Modal systems for auth flows
- Overlay system for global auth access

## Implementation Details

### Authentication Context

**State Management:**
```tsx
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  deviceId: string;
  isLoading: boolean;
  token: string | null;
}
```

**Key Features:**
- Persistent session storage with AsyncStorage
- Automatic token validation on app start
- Device ID generation for anonymous users
- User profile data synchronization

**Methods:**
- `login(email, password)` - Authenticate with credentials
- `logout()` - Clear session and redirect
- `register(userData)` - Create new account
- `updateProfile(data)` - Update user information
- `validateSession()` - Check token validity

### Authentication Service

**Core Functions:**

```tsx
// Login with email/password
const login = async (email: string, password: string): Promise<AuthResponse>

// Register new user
const register = async (userData: RegisterData): Promise<AuthResponse>

// Validate current session
const validateToken = async (token: string): Promise<boolean>

// Update user profile
const updateProfile = async (userId: string, data: ProfileData): Promise<User>

// Password reset
const forgotPassword = async (email: string): Promise<void>
```

**Token Management:**
- JWT tokens stored securely in AsyncStorage
- Automatic token refresh before expiration
- Token validation on API requests
- Secure token removal on logout

### Anonymous User Support

**Device-Based Usage:**
- Unique device ID generation using Expo Device
- Local scan data storage for anonymous users
- Seamless migration to authenticated account
- Temporary scan credits for anonymous users

**Migration Flow:**
1. Anonymous user accumulates local data
2. User decides to create account
3. Local data migrated to cloud storage
4. Device ID linked to user account

## UI Components

### Authentication Forms

**LoginForm** (`components/auth/LoginForm.tsx`)
- Email/password input with validation
- "Remember me" functionality
- Forgot password link
- Social login placeholder (future feature)

**SignupForm** (`components/auth/SignupForm.tsx`)
- User registration with validation
- Terms of service acceptance
- Email verification flow
- Profile setup integration

**Form Validation:**
```tsx
// Email validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password requirements
const passwordMinLength = 8;
const requiresNumbers = true;
const requiresSpecialChars = false;
```

### Modal Systems

**AuthModal** (`components/auth/AuthModal.tsx`)
- Generic modal wrapper for auth flows
- Switchable between login/signup modes
- Blur background with glassmorphism effects
- Keyboard-aware scrolling

**OnboardingAuthModal** (`components/auth/OnboardingAuthModal.tsx`)
- Specialized for onboarding flow
- Simplified UI for first-time users
- Skip option for anonymous usage
- Direct integration with onboarding context

**AuthOverlay** (`components/auth/AuthOverlay.tsx`)
- Global overlay accessible from any screen
- Triggered by premium feature access
- Maintains current screen context
- Smooth transition animations

### Additional Auth Components

**LogoutConfirmationModal** (`components/auth/LogoutConfirmationModal.tsx`)
- Confirms user logout action
- Data loss warnings for anonymous users
- Option to create account before logout

**ReSignInModal** (`components/auth/ReSignInModal.tsx`)
- Handles expired session scenarios
- Quick re-authentication
- Preserves user context and navigation state

## Authentication Flow

### 1. App Initialization
```
App Start → AuthContext.validateSession() → Route Decision
├── Valid Token → Load User Data → Main App
├── Invalid Token → Anonymous Mode → Onboarding/Home
└── No Token → Anonymous Mode → Onboarding
```

### 2. Login Flow
```
Login Form → Validate Credentials → Get JWT Token → Update Context → Navigate
├── Success → Store Token → Load Profile → Main App
└── Error → Display Error → Retry Options
```

### 3. Registration Flow
```
Signup Form → Create Account → Auto Login → Profile Setup → Onboarding
├── Success → JWT Token → User Profile → Quiz Flow
└── Error → Validation Messages → Form Correction
```

### 4. Anonymous to Authenticated
```
Anonymous User → Trigger Auth → Choose Register/Login → Data Migration
├── Register → Create Account → Migrate Local Data → Authenticated
└── Login → Validate Existing → Merge Data → Authenticated
```

## Integration Points

### With Scan System
- Anonymous users get limited scans
- Authenticated users get full scan history
- Premium users get unlimited scans
- Scan data syncs between devices for authenticated users

### With Subscription System
- Anonymous users see upgrade prompts
- Account required for subscription purchases
- Premium benefits only available to authenticated users
- Subscription status tied to user account

### With Profile System
- Anonymous users have limited profile functionality
- Full profile features require authentication
- Health data persists across device changes
- Profile settings sync with account

## Data Security

### Token Security
- JWT tokens stored in secure AsyncStorage
- Tokens include expiration timestamps
- Automatic token refresh before expiration
- Secure token transmission over HTTPS

### Password Security
- Passwords never stored locally
- Secure transmission to backend
- Password reset through email verification
- Optional biometric authentication (future feature)

### Data Protection
- User data encrypted in transit
- Local data protection through iOS/Android keychain
- GDPR compliance for user data handling
- Option to delete account and all data

## Customization

### Adding New Auth Methods

**Social Login Integration:**
1. Add social provider configuration
2. Update `AuthService` with new login method
3. Add UI components for social login buttons
4. Handle social login callbacks

**Biometric Authentication:**
1. Add biometric capability detection
2. Integrate with device biometric APIs
3. Add biometric setup in profile settings
4. Fallback to password authentication

### Modifying Authentication Requirements

**Password Policy Changes:**
```tsx
// Update in authService.ts
const passwordRequirements = {
  minLength: 12,
  requireUppercase: true,
  requireNumbers: true,
  requireSpecialChars: true
};
```

**Session Duration:**
```tsx
// Update token expiration handling
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days
const REFRESH_THRESHOLD = 7 * 24 * 60 * 60 * 1000; // 7 days before expiry
```

## Testing

### Unit Tests
- Context state changes
- Service API interactions
- Form validation logic
- Token management functions

### Integration Tests
- Complete login/logout flows
- Anonymous to authenticated migration
- Session persistence across app restarts
- Error handling scenarios

### Security Tests
- Token validation and refresh
- Secure storage implementation
- Data encryption verification
- Session timeout handling

## Troubleshooting

### Common Issues

**Login/Logout not working:**
- Check network connectivity
- Verify API endpoint configuration
- Check token storage and retrieval
- Validate form data before submission

**Session not persisting:**
- Verify AsyncStorage is working
- Check token expiration logic
- Ensure proper context provider setup
- Test session validation on app start

**Anonymous user data loss:**
- Check device ID generation
- Verify local storage implementation
- Test data migration flow
- Ensure proper data backup before auth

**Form validation errors:**
- Check email/password regex patterns
- Verify validation logic in forms
- Test edge cases and error states
- Ensure proper error message display

### Performance Issues
- Optimize context re-renders
- Cache user data appropriately
- Minimize API calls during validation
- Use proper loading states

### Security Concerns
- Regularly rotate JWT secrets
- Monitor for suspicious login attempts
- Implement rate limiting on auth endpoints
- Keep authentication dependencies updated
