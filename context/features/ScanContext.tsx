import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppConfig } from "../../config/app.config";
import { ScanService } from "../../services/analysis/scanService";
import { authService } from "../../services/auth/authService";
import { getDeviceId } from "../../utils/deviceId";
import { useAuth } from "../auth/AuthContext";

interface ScanContextValue {
  scansLeft: number;
  totalScansPerformed: number; // Track total scans completed by user
  isLoading: boolean;
  isPremium: boolean; // Add premium status
  refreshScanData: () => Promise<void>;
  incrementScanCount: () => void;
  awardFreeScan: () => void;
  // Development mode functions
  setDevelopmentScansLeft: (count: number) => void;
  resetScanCounter: () => void; // Development function to reset total scan count
}

const ScanContext = createContext<ScanContextValue>({
  scansLeft: 0,
  totalScansPerformed: 0,
  isLoading: true,
  isPremium: false,
  refreshScanData: async () => {},
  incrementScanCount: () => {},
  awardFreeScan: () => {},
  setDevelopmentScansLeft: () => {},
  resetScanCounter: () => {},
});

// Helper functions to extract scan data from user profile
const getUserScanData = (user: any) => {
  console.log("🔍 Processing user scan data from profile:");
  console.log("   Raw user object:", JSON.stringify(user, null, 2));

  if (!user?.profile) {
    console.log("   ❌ No user profile found, using defaults");
    return { scansLeft: 3, isPremium: false };
  }

  const freeScans = user.profile.freeScansLeft || 0;
  const paidScans = user.profile.paidScanCount || 0;
  const isPremium = user.profile.premium || false;

  console.log("   📊 Extracted scan data:");
  console.log(
    `      - freeScansLeft: ${freeScans} (raw: ${user.profile.freeScansLeft})`
  );
  console.log(
    `      - paidScanCount: ${paidScans} (raw: ${user.profile.paidScanCount})`
  );
  console.log(`      - premium: ${isPremium} (raw: ${user.profile.premium})`);

  // Premium users have unlimited scans (we'll show a high number for UI purposes)
  const totalScansLeft = isPremium ? 999 : freeScans + paidScans;

  console.log(`   📱 Calculated total scans: ${totalScansLeft}`);

  return { scansLeft: totalScansLeft, isPremium };
};

const DEVELOPMENT_SCANS_LEFT_KEY = "dev_scans_left";
const TOTAL_SCANS_PERFORMED_KEY = "total_scans_performed";

// 🔧 DEVELOPMENT MODE SETTINGS - Easy to change for testing
const DEV_MODE_SETTINGS = {
  scansLeft: AppConfig.mockData.developmentScansLeft, // Use centralized config for development scan count
};

export const ScanProvider = ({ children }: { children: React.ReactNode }) => {
  const [scansLeft, setScansLeft] = useState(0);
  const [totalScansPerformed, setTotalScansPerformed] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, token, user } = useAuth();

  /**
   * Load scan data based on development mode setting
   */
  const loadScanData = useCallback(async () => {
    try {
      setIsLoading(true);

      if (AppConfig.isDevelopmentMode) {
        // Development mode: Use the DEV_MODE_SETTINGS above for easy testing
        console.log("📊 Loading scan data from development mode settings...");

        // You can easily change the number in DEV_MODE_SETTINGS at the top of this file
        const devScansLeft = DEV_MODE_SETTINGS.scansLeft;

        // Load total scans performed from AsyncStorage in development
        const storedTotalScans = await AsyncStorage.getItem(
          TOTAL_SCANS_PERFORMED_KEY
        );
        const totalScans = storedTotalScans
          ? parseInt(storedTotalScans, 10)
          : 0;

        setScansLeft(devScansLeft);
        setTotalScansPerformed(totalScans);

        console.log(`📊 Development mode - Scans Left: ${devScansLeft}`);
        console.log(
          `📊 Development mode - Total Scans Performed: ${totalScans}`
        );
      } else {
        // Production mode: Load from user profile data or device data
        if (isAuthenticated && user?.profile) {
          console.log(
            "📊 Loading scan data from authenticated user profile..."
          );

          try {
            // Calculate total scans left from user profile
            const { scansLeft: totalScansLeft, isPremium: userIsPremium } =
              getUserScanData(user);

            // In production, total scans performed would come from API
            // For now, we'll use a placeholder - this should be updated when API supports it
            const totalScansFromAPI = 0; // TODO: Get from user.profile.totalScansPerformed when API supports it

            setScansLeft(totalScansLeft);
            setIsPremium(userIsPremium);
            setTotalScansPerformed(totalScansFromAPI);

            console.log(`📊 Authenticated user profile data loaded:`);
            console.log(`   - Premium: ${userIsPremium}`);
            console.log(`   - Total scans left: ${totalScansLeft}`);
            console.log(`   - Total scans performed: ${totalScansFromAPI}`);
            console.log(`   - Free scans: ${user.profile.freeScansLeft || 0}`);
            console.log(`   - Paid scans: ${user.profile.paidScanCount || 0}`);
          } catch (error) {
            console.error("❌ Error processing user scan data:", error);
            // Fallback to default values on error
            setScansLeft(3);
            setIsPremium(false);
            setTotalScansPerformed(0);
          }
        } else {
          // Not authenticated - fetch device scan data from backend
          console.log(
            "📊 Loading scan data for unauthenticated user from device API..."
          );

          try {
            const deviceId = await getDeviceId();
            console.log(`📱 Device ID: ${deviceId}`);

            const deviceScanData =
              await authService.getDeviceScanData(deviceId);

            console.log(`📊 Device scan data loaded:`);
            console.log(`   - Anonymous: ${deviceScanData.anonymous}`);
            console.log(
              `   - Free scans left: ${deviceScanData.freeScansLeft}`
            );

            setScansLeft(deviceScanData.freeScansLeft);
            setIsPremium(false); // Unauthenticated users are never premium
            setTotalScansPerformed(0); // TODO: Track device-level scan history when API supports it
          } catch (error) {
            console.error("❌ Error fetching device scan data:", error);
            // Fallback to default values on error
            console.log("📊 Using fallback default scan counts");
            setScansLeft(3);
            setIsPremium(false);
            setTotalScansPerformed(0);
          }
        }
      }
    } catch (error) {
      console.error("❌ Error loading scan data:", error);
      // Fallback to safe defaults
      setScansLeft(3);
      setIsPremium(false);
      setTotalScansPerformed(0);
    } finally {
      setIsLoading(false);
    }
  }, [
    isAuthenticated,
    user?.profile?.freeScansLeft,
    user?.profile?.paidScanCount,
    user?.profile?.premium,
  ]);

  /**
   * Refresh scan data - useful after completing a scan
   */
  const refreshScanData = useCallback(async () => {
    console.log("🔄 Refreshing scan data...");
    await loadScanData();
  }, [loadScanData]);

  /**
   * Increment scan count (called after successful scan)
   */
  const incrementScanCount = useCallback(() => {
    if (AppConfig.isDevelopmentMode) {
      // In development mode, decrement scans left and increment total scans
      const newScansLeft = Math.max(0, scansLeft - 1);
      const newTotalScans = totalScansPerformed + 1;

      setScansLeft(newScansLeft);
      setTotalScansPerformed(newTotalScans);

      // Persist to storage
      AsyncStorage.setItem(DEVELOPMENT_SCANS_LEFT_KEY, newScansLeft.toString());
      AsyncStorage.setItem(TOTAL_SCANS_PERFORMED_KEY, newTotalScans.toString());

      console.log(
        `📊 Development scan incremented - Scans Left: ${newScansLeft}, Total Scans: ${newTotalScans}`
      );
    } else {
      // In production mode, refresh from API to get updated counts
      // TODO: In production, we should also increment total scans performed via API
      console.log(
        "📊 Production mode: Incrementing scan count via API (placeholder)"
      );
      refreshScanData();
    }
  }, [scansLeft, totalScansPerformed, refreshScanData]);

  // Development mode helper functions
  const setDevelopmentScansLeft = useCallback(async (count: number) => {
    if (AppConfig.isDevelopmentMode) {
      setScansLeft(count);
      await AsyncStorage.setItem(DEVELOPMENT_SCANS_LEFT_KEY, count.toString());
      console.log(`📊 Development scans left set to: ${count}`);
    } else {
      console.warn("⚠️ setDevelopmentScansLeft called in production mode");
    }
  }, []);

  /**
   * Reset scan counter for development/testing purposes
   */
  const resetScanCounter = useCallback(async () => {
    if (AppConfig.isDevelopmentMode) {
      setTotalScansPerformed(0);
      await AsyncStorage.setItem(TOTAL_SCANS_PERFORMED_KEY, "0");
      console.log("📊 Development: Total scan counter reset to 0");
    } else {
      console.warn("⚠️ resetScanCounter called in production mode");
    }
  }, []);

  /**
   * Award a free scan (called when user watches an ad or gets a reward)
   */
  const awardFreeScan = useCallback(() => {
    const newScansLeft = scansLeft + 1;

    if (AppConfig.isDevelopmentMode) {
      setScansLeft(newScansLeft);
      // Persist to storage
      AsyncStorage.setItem(DEVELOPMENT_SCANS_LEFT_KEY, newScansLeft.toString());
      console.log(`🎁 Free scan awarded! New scans left: ${newScansLeft}`);
    } else {
      // In production mode, this would call an API to award the scan
      // TODO: Implement API call to backend to award free scan
      console.log(
        `🎁 Free scan awarded! API call would increment user's scan credits`
      );

      // For now, update locally and then refresh from API
      setScansLeft(newScansLeft);
      refreshScanData(); // This will sync with backend
    }
  }, [scansLeft, refreshScanData]);

  // Load data on mount and when auth status changes
  useEffect(() => {
    loadScanData();
  }, [loadScanData]);

  const value: ScanContextValue = {
    scansLeft,
    totalScansPerformed,
    isLoading,
    isPremium,
    refreshScanData,
    incrementScanCount,
    awardFreeScan,
    setDevelopmentScansLeft,
    resetScanCounter,
  };

  return <ScanContext.Provider value={value}>{children}</ScanContext.Provider>;
};

export const useScan = () => {
  const context = useContext(ScanContext);
  if (!context) {
    throw new Error("useScan must be used within a ScanProvider");
  }
  return context;
};
