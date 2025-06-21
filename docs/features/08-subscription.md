# Subscription System

## Overview

The subscription system manages in-app purchases, premium features, and payment flows. It provides a seamless upgrade experience with multiple subscription plans, free trial options, and sharing-based free scans. The system integrates with iOS App Store for subscription management and includes comprehensive error handling and user feedback.

## Architecture

### Core Components

**In-App Purchase Service** (`services/subscription/InAppPurchaseService.ts`)

- iOS App Store integration for subscription management
- Purchase validation and receipt handling
- Mock implementation for development/Expo Go testing

**Payment Screen** (`screens/subscription/PaymentScreen.tsx`)

- Subscription upgrade interface with multiple payment types
- Plan selection and feature comparison
- Free scan integration and sharing options

**Subscription Context** (`context/features/SubscriptionContext.tsx`)

- Global subscription state management
- Premium status tracking and validation
- Integration with user profile and scan limits

## Implementation Details

### 1. In-App Purchase Service

**Location:** `services/subscription/InAppPurchaseService.ts`

**Purpose:**

- Handle iOS App Store subscription purchases
- Validate purchase receipts and manage subscription status
- Provide development mode testing capabilities

**Core Functions:**

```tsx
// Initialize IAP service
const initializeIAP = async (): Promise<void>

// Load available subscription products
const loadProducts = async (productIds: string[]): Promise<Product[]>

// Purchase subscription
const purchaseSubscription = async (productId: string): Promise<PurchaseResult>

// Restore previous purchases
const restorePurchases = async (): Promise<PurchaseResult[]>

// Get current subscription status
const getSubscriptionStatus = async (): Promise<SubscriptionStatus>

// Validate receipt with backend
const validateReceipt = async (receipt: string): Promise<ValidationResult>
```

**Mock Implementation for Development:**

```tsx
// Development/Expo Go mock service
const mockInAppPurchaseService = {
  initializeIAP: async () => {
    console.log("Mock IAP: Initialized");
    return Promise.resolve();
  },

  loadProducts: async (productIds: string[]) => {
    console.log("Mock IAP: Loading products", productIds);

    // Return mock products for testing
    return [
      {
        productId: "monthly_premium",
        price: "$1.99",
        localizedPrice: "$1.99",
        currency: "USD",
        title: "Monthly Premium",
        description: "Premium features for one month",
      },
      {
        productId: "annual_premium",
        price: "$12.99",
        localizedPrice: "$12.99",
        currency: "USD",
        title: "Annual Premium",
        description: "Premium features for one year",
      },
    ];
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

**Real IAP Implementation:**

```tsx
import * as InAppPurchases from "expo-in-app-purchases";

const realInAppPurchaseService = {
  initializeIAP: async () => {
    try {
      await InAppPurchases.connectAsync();
      console.log("IAP: Connected successfully");
    } catch (error) {
      console.error("IAP: Failed to connect:", error);
      throw new Error("Failed to initialize in-app purchases");
    }
  },

  loadProducts: async (productIds: string[]) => {
    try {
      const { results } = await InAppPurchases.getProductsAsync(productIds);
      return results.map((product) => ({
        productId: product.productId,
        price: product.price,
        localizedPrice: product.localizedPrice,
        currency: product.currencyCode,
        title: product.title,
        description: product.description,
      }));
    } catch (error) {
      console.error("IAP: Failed to load products:", error);
      throw new Error("Failed to load subscription plans");
    }
  },

  purchaseSubscription: async (productId: string) => {
    try {
      const { type, ...result } =
        await InAppPurchases.purchaseItemAsync(productId);

      if (type === InAppPurchases.IAPResponseCode.OK) {
        return {
          success: true,
          transactionId: result.transactionId,
          receipt: result.receipt,
          productId,
        };
      } else {
        throw new Error(`Purchase failed with code: ${type}`);
      }
    } catch (error) {
      console.error("IAP: Purchase failed:", error);
      throw error;
    }
  },
};
```

### 2. In-App Purchase Hook

**Location:** `hooks/useInAppPurchases.ts`

**Purpose:**

- React hook for subscription management
- Handles purchase flow with proper error handling
- Manages loading states and user feedback

**Implementation:**

```tsx
export const useInAppPurchases = () => {
  const [subscriptionPlans, setSubscriptionPlans] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  // Load available subscription plans
  useEffect(() => {
    loadSubscriptionPlans();
  }, []);

  const loadSubscriptionPlans = async () => {
    setIsLoading(true);
    try {
      await iapService.initializeIAP();
      const products = await iapService.loadProducts([
        "monthly_premium",
        "annual_premium",
      ]);

      // Sort products for consistent display
      const sortedProducts = products.sort((a, b) => {
        const aPeriod = a.productId.includes("monthly") ? "month" : "year";
        const bPeriod = b.productId.includes("monthly") ? "month" : "year";
        return aPeriod === "month" ? -1 : 1; // Monthly first
      });

      setSubscriptionPlans(sortedProducts);
    } catch (error) {
      console.error("Failed to load subscription plans:", error);
      Alert.alert(
        "Loading Error",
        "Unable to load subscription plans. Please try again later.",
        [{ text: "OK" }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const purchaseSubscription = async (productId: string) => {
    setIsPurchasing(true);

    try {
      const result = await iapService.purchaseSubscription(productId);

      if (result.success) {
        // Validate with backend
        const validation = await validatePurchase(result);

        if (validation.valid) {
          setHasActiveSubscription(true);

          Alert.alert(
            "Purchase Successful!",
            "Thank you for subscribing to PoopAI Premium. You now have unlimited scans and access to all premium features.",
            [{ text: "Great!" }]
          );

          return { success: true };
        } else {
          throw new Error("Purchase validation failed");
        }
      }
    } catch (error) {
      console.error("Purchase failed:", error);

      const errorMessage = error.userCancelled
        ? "Purchase was cancelled"
        : "Purchase failed. Please try again or contact support.";

      Alert.alert("Purchase Error", errorMessage, [{ text: "OK" }]);

      return { success: false, error: error.message };
    } finally {
      setIsPurchasing(false);
    }
  };

  const restorePurchases = async () => {
    setIsLoading(true);
    try {
      const purchases = await iapService.restorePurchases();

      if (purchases.length > 0) {
        const hasValid = await validatePurchases(purchases);
        setHasActiveSubscription(hasValid);

        Alert.alert(
          "Purchases Restored",
          hasValid
            ? "Your premium subscription has been restored."
            : "No active subscriptions found.",
          [{ text: "OK" }]
        );
      } else {
        Alert.alert(
          "No Purchases Found",
          "No previous purchases were found for this account.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Restore failed:", error);
      Alert.alert(
        "Restore Error",
        "Failed to restore purchases. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {
    subscriptionPlans,
    isLoading,
    isPurchasing,
    hasActiveSubscription,
    purchaseSubscription,
    restorePurchases,
    loadSubscriptionPlans,
  };
};
```

### 3. Payment Screen

**Location:** `screens/subscription/PaymentScreen.tsx`

**Purpose:**

- Primary subscription upgrade interface
- Multiple payment screen types and configurations
- Plan selection with feature comparison
- Free scan integration with sharing functionality

**Screen Types:**

- **scan-credits:** Focus on unlimited scans
- **premium-subscription:** Full premium features

**Key Features:**

- **Responsive Design:** Adapts to different screen sizes
- **Plan Selection:** Monthly vs Annual with pricing
- **Feature Highlights:** Visual feature comparison
- **Free Trial Options:** 7-day trial for new users
- **Sharing Integration:** Free scans through sharing (replaces ads)
- **Animated Elements:** Engaging visual effects

**State Management:**

```tsx
interface PaymentScreenState {
  selectedPlan: "monthly" | "annual" | null;
  showCelebrationModal: boolean;
  showForcedAuthModal: boolean;
  previousScanCount: number;
}
```

**Plan Selection Implementation:**

```tsx
const renderPlanCards = () => {
  return (
    <View style={styles.plansRow}>
      {/* Monthly Plan */}
      <TouchableOpacity
        style={[
          styles.planCard,
          selectedPlan === "monthly" && styles.selectedPlanCard,
        ]}
        onPress={() => setSelectedPlan("monthly")}
      >
        <View style={styles.planBannerMonthly}>
          <Text style={styles.planBannerText}>Popular</Text>
        </View>

        <LinearGradient
          colors={
            selectedPlan === "monthly"
              ? ["rgba(59, 130, 246, 0.3)", "rgba(147, 51, 234, 0.3)"]
              : ["rgba(255, 255, 255, 0.4)", "rgba(255, 255, 255, 0.2)"]
          }
          style={styles.planCardGradient}
        >
          <Text style={styles.focusNumber}>1</Text>
          <Text style={styles.timeframeText}>Month</Text>
          <View style={styles.dividerLine} />
          <Text style={styles.planCardPrice}>{config.monthlyText.price}</Text>
          <Text style={styles.perMonthPrice}>
            {config.monthlyText.perMonthPrice}
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Annual Plan */}
      <TouchableOpacity
        style={[
          styles.planCard,
          selectedPlan === "annual" && styles.selectedPlanCard,
        ]}
        onPress={() => setSelectedPlan("annual")}
      >
        <View style={styles.planBannerAnnual}>
          <Text style={styles.planBannerText}>Best Value</Text>
        </View>

        {/* Discount Badge */}
        <Animated.View
          style={[styles.discountBadge, { transform: [{ rotate: "10deg" }] }]}
        >
          <Text style={styles.discountText}>45% Off</Text>
        </Animated.View>

        <LinearGradient
          colors={
            selectedPlan === "annual"
              ? ["rgba(43, 226, 110, 0.56)", "rgba(182, 238, 92, 0.56)"]
              : ["rgba(255, 255, 255, 0.4)", "rgba(255, 255, 255, 0.2)"]
          }
          style={styles.planCardGradient}
        >
          <Text style={styles.focusNumber}>1</Text>
          <Text style={styles.timeframeText}>Year</Text>
          <View style={styles.dividerLine} />
          <Text style={styles.planCardPrice}>{config.annualText.price}</Text>
          <Text style={styles.perMonthPrice}>
            {config.annualText.perMonthPrice}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};
```

**Free Scan Section (Sharing-Based):**

```tsx
const renderFreeScanSection = () => {
  if (!showFreeScanSection) return null;

  return (
    <>
      <View style={styles.orDivider}>
        <Text style={styles.orText}>Or</Text>
      </View>

      <View style={styles.freeSection}>
        <BlurView intensity={20} style={styles.freeScanContainer}>
          <Text style={styles.freeSectionTitle}>
            {config.freeScanSection?.title}
          </Text>
          <Text style={styles.freeSectionSubtitle}>
            {config.freeScanSection?.subtitle}
          </Text>

          <TouchableOpacity
            style={styles.shareScanButton}
            onPress={handleShareForFreeScan}
          >
            <BlurView intensity={30} style={styles.shareBlur}>
              <View style={styles.shareContent}>
                <Ionicons name="share" size={20} color="white" />
                <Text style={styles.shareText}>
                  {config.freeScanSection?.buttonText}
                </Text>
              </View>
            </BlurView>
          </TouchableOpacity>

          <Text style={styles.shareDisclaimer}>
            {config.freeScanSection?.disclaimer}
          </Text>
        </BlurView>
      </View>
    </>
  );
};

const handleShareForFreeScan = async () => {
  try {
    const shareOptions = {
      title: "Check out PoopAI!",
      message:
        "I've been using PoopAI to track my digestive health. It's amazing what AI can tell you! Download it here: [App Store Link]",
      url: "https://poopai.app", // Replace with actual app store link
    };

    const result = await Share.share(shareOptions);

    if (result.action === Share.sharedAction) {
      // Award free scan after successful share
      await awardFreeScan();
      setShowCelebrationModal(true);

      console.log("🎁 Free scan awarded through sharing");
    }
  } catch (error) {
    console.error("Share failed:", error);
    Alert.alert("Share Error", "Unable to share right now. Please try again.", [
      { text: "OK" },
    ]);
  }
};
```

### 4. Payment Configuration

**Location:** `config/paymentConfig.ts`

**Purpose:**

- Centralized payment screen configurations
- Feature lists and pricing information
- Copy text and messaging variations

**Configuration Structure:**

```tsx
export const paymentConfigs = {
  "scan-credits": {
    title: "Unlock Unlimited Scans",
    subtitle: "Go beyond your weekly limit & get full access to PoopAI",
    sectionTitle: "Premium Features",
    features: [
      { icon: "camera", text: "Unlimited scans" },
      { icon: "analytics", text: "Advanced analytics" },
      { icon: "calendar", text: "Scan calendar" },
      { icon: "trends", text: "Health trends" },
    ],
    choosePlanTitle: "Pick Your Plan",
    monthlyText: {
      title: "Monthly",
      focusNumber: "1",
      timeframe: "Month",
      price: "$1.99",
      period: "per month",
      perMonthPrice: "$1.99/mo.",
    },
    annualText: {
      title: "Annual",
      focusNumber: "1",
      timeframe: "Year",
      price: "$12.99",
      period: "per year",
      perMonthPrice: "$1.08/mo.",
      badge: "Best Value",
    },
    subscribeButtonText: {
      monthly: "Subscribe Monthly",
      annual: "Subscribe Annually",
      disabled: "Select a Plan",
    },
    freeScanSection: {
      title: "Not ready to upgrade?",
      subtitle: "Share PoopAI with a friend to get a free scan.",
      buttonText: "Get 1 Free Scan",
      disclaimer: "Share with friends to earn scans.",
    },
  },

  "premium-subscription": {
    title: "Unlock Premium PoopAI",
    subtitle: "Get unlimited scans and advanced health insights",
    // ... premium-specific configuration
  },
};
```

### 5. Subscription Context

**Location:** `context/features/SubscriptionContext.tsx`

**Purpose:**

- Global subscription state management
- Premium status validation and caching
- Integration with scan limits and feature access

**Implementation:**

```tsx
interface SubscriptionState {
  isPremium: boolean;
  subscriptionType: "monthly" | "annual" | null;
  expirationDate: Date | null;
  isLoading: boolean;
  lastChecked: Date | null;
}

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<SubscriptionState>({
    isPremium: false,
    subscriptionType: null,
    expirationDate: null,
    isLoading: false,
    lastChecked: null,
  });

  const checkSubscriptionStatus = useCallback(async () => {
    // Avoid frequent checks - cache for 1 hour
    if (
      state.lastChecked &&
      Date.now() - state.lastChecked.getTime() < 3600000
    ) {
      return state.isPremium;
    }

    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const status = await iapService.getSubscriptionStatus();

      setState({
        isPremium: status.isActive,
        subscriptionType: status.type,
        expirationDate: status.expirationDate,
        isLoading: false,
        lastChecked: new Date(),
      });

      return status.isActive;
    } catch (error) {
      console.error("Failed to check subscription status:", error);
      setState((prev) => ({ ...prev, isLoading: false }));
      return false;
    }
  }, [state.lastChecked]);

  const contextValue = useMemo(
    () => ({
      ...state,
      checkSubscriptionStatus,
    }),
    [state, checkSubscriptionStatus]
  );

  return (
    <SubscriptionContext.Provider value={contextValue}>
      {children}
    </SubscriptionContext.Provider>
  );
};
```

## Premium Feature Integration

### Scan Limit Override

```tsx
// In ScanContext.tsx
const canScan = () => {
  const { isPremium } = useSubscription();

  if (isPremium) {
    return true; // Unlimited scans for premium users
  }

  return scansLeft > 0;
};
```

### Premium UI Indicators

```tsx
const PremiumBadge = () => {
  const { isPremium } = useSubscription();

  if (!isPremium) return null;

  return (
    <View style={styles.premiumBadge}>
      <Ionicons name="star" size={16} color="#FFD700" />
      <Text style={styles.premiumText}>Premium</Text>
    </View>
  );
};
```

### Feature Gating

```tsx
const PremiumFeature = ({ children, fallback }) => {
  const { isPremium } = useSubscription();

  if (isPremium) {
    return children;
  }

  return (
    fallback || (
      <TouchableOpacity
        style={styles.upgradePrompt}
        onPress={() => navigation.navigate("Payment")}
      >
        <Text>Upgrade to Premium to unlock this feature</Text>
      </TouchableOpacity>
    )
  );
};
```

## Error Handling

### Purchase Error Types

```tsx
enum PurchaseErrorType {
  USER_CANCELLED = "user_cancelled",
  PAYMENT_INVALID = "payment_invalid",
  NETWORK_ERROR = "network_error",
  PRODUCT_NOT_AVAILABLE = "product_not_available",
  RECEIPT_VALIDATION_FAILED = "receipt_validation_failed",
}

const handlePurchaseError = (error: PurchaseError) => {
  switch (error.type) {
    case PurchaseErrorType.USER_CANCELLED:
      // Don't show error for user cancellation
      break;

    case PurchaseErrorType.PAYMENT_INVALID:
      Alert.alert(
        "Payment Error",
        "Your payment method was declined. Please check your payment information and try again.",
        [{ text: "OK" }]
      );
      break;

    case PurchaseErrorType.NETWORK_ERROR:
      Alert.alert(
        "Connection Error",
        "Unable to process purchase. Please check your internet connection and try again.",
        [
          { text: "Retry", onPress: () => retryPurchase() },
          { text: "Cancel", style: "cancel" },
        ]
      );
      break;

    default:
      Alert.alert(
        "Purchase Failed",
        "Something went wrong with your purchase. Please try again or contact support.",
        [{ text: "OK" }]
      );
  }
};
```

## Testing

### Unit Tests

- IAP service mock functionality
- Purchase flow error handling
- Subscription status validation
- Payment configuration loading

### Integration Tests

- Complete purchase flow
- Receipt validation with backend
- Premium feature access
- Subscription restoration

### Payment Testing

- Test with sandbox Apple IDs
- Verify subscription auto-renewal
- Test family sharing scenarios
- Validate receipt processing

## Troubleshooting

### Common Issues

**Purchases not working:**

- Verify Apple Developer account setup
- Check product IDs in App Store Connect
- Test with sandbox environment
- Validate receipt handling

**Premium status not updating:**

- Check subscription context integration
- Verify receipt validation logic
- Test subscription expiration handling
- Monitor for network connectivity

**Free scan sharing not working:**

- Check Share API permissions
- Verify social platform integration
- Test share completion detection
- Monitor for platform-specific issues

### Development Setup

- Configure test Apple IDs for sandbox
- Set up App Store Connect for IAP testing
- Implement proper receipt validation
- Test on physical devices (IAP doesn't work in simulator)
