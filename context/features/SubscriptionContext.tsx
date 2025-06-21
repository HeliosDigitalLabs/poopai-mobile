import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { inAppPurchaseService } from "../../services/subscription/InAppPurchaseService";

interface SubscriptionContextType {
  hasActiveSubscription: boolean;
  isCheckingSubscription: boolean;
  checkSubscriptionStatus: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
  undefined
);

export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error(
      "useSubscription must be used within a SubscriptionProvider"
    );
  }
  return context;
};

interface SubscriptionProviderProps {
  children: ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({
  children,
}) => {
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(false);

  const checkSubscriptionStatus = async () => {
    setIsCheckingSubscription(true);
    try {
      console.log("📢 Checking subscription status...");
      const isActive = await inAppPurchaseService.isSubscriptionActive();
      setHasActiveSubscription(isActive);
      console.log(
        `📢 Subscription status: ${isActive ? "Active" : "Inactive"}`
      );
    } catch (error) {
      console.error("❌ Failed to check subscription status:", error);
      // Default to no subscription on error
      setHasActiveSubscription(false);
    } finally {
      setIsCheckingSubscription(false);
    }
  };

  const refreshSubscription = async () => {
    await checkSubscriptionStatus();
  };

  // Initialize subscription status on mount
  useEffect(() => {
    const initializeSubscription = async () => {
      try {
        await inAppPurchaseService.initialize();
        await checkSubscriptionStatus();
      } catch (error) {
        console.error("❌ Failed to initialize subscription context:", error);
      }
    };

    initializeSubscription();
  }, []);

  const value: SubscriptionContextType = {
    hasActiveSubscription,
    isCheckingSubscription,
    checkSubscriptionStatus,
    refreshSubscription,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export default SubscriptionProvider;
