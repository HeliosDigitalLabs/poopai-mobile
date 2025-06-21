# Development Mode Setup - Scan Context Implementation

## Overview

The scan context now fully supports development mode with mock data and testing features. When `isDevelopmentMode` is set to `true` in `app.config.ts`, the app provides a complete testing environment.

## What's Implemented

### 1. Mock Scan Credits

- **99 free scans** automatically provided in development mode
- Easily configurable in `app.config.ts` via `mockData.developmentScansLeft`
- Scans decrement properly when testing the analysis flow
- No API calls to backend for scan credit management

### 2. Mock Scan History

- Automatically generates realistic mock scan data for testing calendars and history views
- **15 mock scans** distributed over the **last 30 days** by default
- Realistic analysis data with various Bristol types and scores
- Configurable via `app.config.ts`:
  - `mockData.generateMockHistory`: Enable/disable mock history
  - `mockData.mockHistoryCount`: Number of scans to generate
  - `mockData.mockHistoryDaysBack`: Time range for distribution

### 3. Enhanced Scan Service

- `ScanService.getUserScans()` returns mock data in development mode
- `ScanService.getScansForDateRange()` supports calendar date filtering
- No backend API calls when in development mode
- Seamless fallback to production API when development mode is disabled

### 4. Development Tools

- `setDevelopmentScansLeft(count)` - Manually adjust scan count for testing
- `resetScanCounter()` - Reset total scans performed counter
- All development functions are safe-guarded against production use

## Configuration Files

### `/frontend/config/app.config.ts`

```typescript
export const AppConfig = {
  isDevelopmentMode: true, // ← Set this to enable development mode

  mockData: {
    developmentScansLeft: 99, // Free scans in dev mode
    generateMockHistory: true, // Enable mock scan history
    mockHistoryCount: 15, // Number of mock scans
    mockHistoryDaysBack: 30, // Days to distribute scans over
  },
};
```

### `/frontend/context/features/ScanContext.tsx`

- Automatically detects development mode
- Provides 99 scans when `isDevelopmentMode: true`
- Uses mock data instead of API calls
- Maintains scan count in local storage for testing

### `/frontend/utils/mockScanData.ts`

- Generates realistic mock scan analysis data
- Various Bristol types (2-6) with appropriate scores
- Realistic timestamps distributed over specified date range
- Includes detailed analysis text for each mock scan

## How to Use

### Enable Development Mode

1. Open `/frontend/config/app.config.ts`
2. Set `isDevelopmentMode: true` (already set)
3. Adjust mock data settings if needed
4. Run the app - you'll automatically get 99 scans and mock history

### Test Different Scenarios

```typescript
// In development mode, you can use:
const { setDevelopmentScansLeft, resetScanCounter } = useScan();

// Test low scan count
setDevelopmentScansLeft(2);

// Test no scans
setDevelopmentScansLeft(0);

// Reset for fresh testing
resetScanCounter();
```

### Switch to Production

1. Set `isDevelopmentMode: false` in `app.config.ts`
2. App will use real API calls and backend scan management
3. All development features automatically disabled

## Benefits for Testing

1. **No Backend Required**: Test the full app without running backend services
2. **Realistic Data**: Mock scans include proper analysis data for UI testing
3. **Calendar Testing**: Mock history populates calendar views for comprehensive testing
4. **Credit Flow Testing**: Can test scan credit consumption and low-credit scenarios
5. **Easily Configurable**: Change scan counts and history without code changes
6. **Safe Fallback**: Production mode works exactly as before

## Files Modified

- ✅ `/frontend/config/app.config.ts` - Added development mode configuration
- ✅ `/frontend/context/features/ScanContext.tsx` - Updated to use config-driven scan count
- ✅ `/frontend/services/analysis/scanService.ts` - Added mock data support
- ✅ `/frontend/utils/mockScanData.ts` - New mock data generator utility

The scan context now provides a complete development environment with 99 scans and realistic mock data, while maintaining full compatibility with production mode.
