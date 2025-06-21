# Analytics Implementation Summary

This document tracks the implementation of analytics events throughout the PoopAI frontend application.

## Implemented Analytics Events

### ✅ Core Events

- **APP_OPENED** - Tracked in `App.tsx` when app starts
- **APP_CLOSED** - Tracked in `App.tsx` when app goes to background (includes session duration)

### ✅ Scanning Events

- **SCAN_STARTED** - Tracked in `CameraScreen.tsx` when camera screen opens
- **PIC_TAKEN** - Tracked in `CameraScreen.tsx` when photo is captured
- **SCAN_SUBMITTED** - Tracked in `ResultsScreen.tsx` when successful analysis completes (includes full analysis data)
- **SCAN_FAILED** - Tracked in `CameraScreen.tsx` when analysis fails (includes failure reason)

### ✅ Sharing Events

- **SHARE_CLICKED** - Tracked in `ResultsScreen.tsx` when share button pressed (includes method and hidePoop status)
- **SHARE_COMPLETED** - Tracked in `ResultsScreen.tsx` after share attempt (includes success status)

### ✅ Learn More Events

- **LEARN_MORE_OPENED** - Tracked in `ResultsScreen.tsx` when learn more section is expanded
- **LEARN_MORE_TIME_SPENT** - Tracked in `ResultsScreen.tsx` when learn more section is collapsed (includes duration)

### ✅ Calendar Events

- **CALENDAR_OPENED** - Tracked in `CalendarScreen.tsx` when calendar screen opens
- **CALENDAR_DAY_CLICKED** - Tracked in `CalendarScreen.tsx` when a date is clicked (includes date)
- **CALENDAR_TIME_SPENT** - Tracked in `CalendarScreen.tsx` when screen is left (includes duration)

### ✅ Payment Events

- **PAYMENT_SCREEN_OPENED** - Tracked in `PaymentScreen.tsx` when payment screen opens
- **PAYMENT_BUTTON_CLICKED** - Tracked in `PaymentScreen.tsx` when payment button is pressed (includes button type)
- **SUBSCRIBED** - Tracked in `PaymentScreen.tsx` when subscription is successful (includes plan and method)

### ✅ Profile Events

- **PROFILE_OPENED** - Tracked in `ProfileScreen.tsx` when profile screen opens
- **PROFILE_TIME_SPENT** - Tracked in `ProfileScreen.tsx` when screen is left (includes duration)
- **PROFILE_UPDATED** - Tracked in `PoopGoalsScreen.tsx` when poop goals are saved (includes field and new value)

### ❌ Not Yet Implemented

- **UNSUBSCRIBED** - Needs to be implemented when unsubscribe functionality is added
- **RESUBSCRIBED** - Needs to be implemented when resubscribe functionality is added
- **USER_PROP_ACCOUNT_TYPE** - To be implemented later
- **USER_PROP_REFERRAL_SOURCE** - To be implemented later
- **USER_PROP_SIGNED_UP** - To be implemented later

## Implementation Notes

### File Changes Made:

1. **Renamed file**: `analtyicsEvents.ts` → `analyticsEvents.ts` (fixed typo)
2. **App.tsx**: Added core app events with session tracking
3. **CameraScreen.tsx**: Added scanning events with proper failure tracking
4. **ResultsScreen.tsx**: Added sharing, learn more, and successful scan events
5. **CalendarScreen.tsx**: Added calendar events with time tracking
6. **PaymentScreen.tsx**: Added payment and subscription events
7. **ProfileScreen.tsx**: Added profile events with time tracking
8. **PoopGoalsScreen.tsx**: Added profile update tracking

### Key Features:

- **Time Tracking**: Implemented for screens that need duration tracking (profile, calendar, learn more)
- **Error Handling**: Scan failures are properly categorized by reason
- **Rich Data**: Scan events include full analysis data (scores, bristol type, etc.)
- **User Properties**: Subscription status is tracked as user property
- **Navigation Tracking**: Screen blur events used to calculate time spent

### Usage Examples:

```typescript
// Simple event
logEvent(SCAN_STARTED);

// Event with data
logEvent(SCAN_SUBMITTED, {
  poopScore: 89,
  bristolType: "Type 3",
  bristolTypeNumber: 3,
  maxScore: 100,
  hydrationJudgement: "Well hydrated",
  fiberJudgement: "Good fiber intake",
  stoolDescription: "Sausage-shaped with cracks on surface",
});

// User property
setUserTraits({
  [USER_PROP_SUB_STATUS]: "active",
});
```
