import { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import {
  inAppPurchaseService,
  SubscriptionPlan,
  PurchaseResult,
} from "../services/subscription/InAppPurchaseService";

export interface UseInAppPurchasesResult {
  // State
  subscriptionPlans: SubscriptionPlan[];
  isLoading: boolean;
  isPurchasing: boolean;
  hasActiveSubscription: boolean;

  // Actions
  loadProducts: () => Promise<void>;
  purchaseSubscription: (productId: string) => Promise<PurchaseResult>;
  restorePurchases: () => Promise<void>;
  checkSubscriptionStatus: () => Promise<void>;
}

export const useInAppPurchases = (): UseInAppPurchasesResult => {
  const [subscriptionPlans, setSubscriptionPlans] = useState<
    SubscriptionPlan[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  /**
   * Load available subscription products
   */
  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log("📢 Loading subscription products...");

      await inAppPurchaseService.initialize();
      const products = await inAppPurchaseService.getAvailableProducts();

      setSubscriptionPlans(products);
      console.log(`📢 Loaded ${products.length} subscription plans`);
    } catch (error: any) {
      console.error("❌ Failed to load products:", error);
      Alert.alert(
        "Error",
        "Failed to load subscription plans. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Purchase a subscription
   */
  const purchaseSubscription = useCallback(
    async (productId: string): Promise<PurchaseResult> => {
      setIsPurchasing(true);
      try {
        console.log(`📢 Starting purchase for: ${productId}`);

        const result = await inAppPurchaseService.purchaseSubscription(
          productId
        );

        if (result.success) {
          console.log("📢 Purchase successful!");

          // Update subscription status
          await checkSubscriptionStatus();

          // Show success message
          Alert.alert(
            "Success!",
            "Your subscription has been activated. Enjoy unlimited scans!",
            [{ text: "OK" }]
          );
        } else {
          console.error("❌ Purchase failed:", result.error);
          Alert.alert(
            "Purchase Failed",
            result.error || "Something went wrong. Please try again.",
            [{ text: "OK" }]
          );
        }

        return result;
      } catch (error: any) {
        console.error("❌ Purchase error:", error);
        const result: PurchaseResult = {
          success: false,
          error: error.message,
        };

        Alert.alert(
          "Purchase Error",
          "Unable to complete purchase. Please try again.",
          [{ text: "OK" }]
        );

        return result;
      } finally {
        setIsPurchasing(false);
      }
    },
    []
  );

  /**
   * Restore previous purchases
   */
  const restorePurchases = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log("📢 Restoring purchases...");

      const restored = await inAppPurchaseService.restorePurchases();

      if (restored.length > 0) {
        console.log(`📢 Restored ${restored.length} purchases`);
        await checkSubscriptionStatus();

        Alert.alert(
          "Purchases Restored",
          "Your previous purchases have been restored.",
          [{ text: "OK" }]
        );
      } else {
        Alert.alert(
          "No Purchases Found",
          "No previous purchases were found to restore.",
          [{ text: "OK" }]
        );
      }
    } catch (error: any) {
      console.error("❌ Failed to restore purchases:", error);
      Alert.alert(
        "Restore Failed",
        "Unable to restore purchases. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Check if user has an active subscription
   */
  const checkSubscriptionStatus = useCallback(async () => {
    try {
      const isActive = await inAppPurchaseService.isSubscriptionActive();
      setHasActiveSubscription(isActive);
      console.log(
        `📢 Subscription status: ${isActive ? "Active" : "Inactive"}`
      );
    } catch (error: any) {
      console.error("❌ Failed to check subscription status:", error);
    }
  }, []);

  // Load products and check subscription status on mount
  useEffect(() => {
    loadProducts();
    checkSubscriptionStatus();
  }, [loadProducts, checkSubscriptionStatus]);

  return {
    // State
    subscriptionPlans,
    isLoading,
    isPurchasing,
    hasActiveSubscription,

    // Actions
    loadProducts,
    purchaseSubscription,
    restorePurchases,
    checkSubscriptionStatus,
  };
};

export default useInAppPurchases;
