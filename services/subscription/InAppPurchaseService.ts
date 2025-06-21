import { Platform } from "react-native";

// Declare global type for TypeScript
declare const global: any;

// Check if we're in a development environment or Expo Go
// In development mode, always use mock implementation for easier testing
const shouldUseMockImplementation =
  __DEV__ ||
  (typeof global?.expo !== "undefined" &&
    global.expo?.modules?.ExponentConstants?.appOwnership === "expo");

// Only attempt to load native module in production builds
let StoreKit: any;
let ProductType: any;
let isNativeModuleAvailable = false;

// Completely avoid importing the native module in development/Expo Go
if (!shouldUseMockImplementation) {
  // Only load in production builds
  try {
    // Use dynamic import to avoid loading the module at bundle time
    const storeKitModule = eval("require")("expo-store-kit");
    StoreKit = storeKitModule.StoreKit;
    ProductType = storeKitModule.ProductType;
    isNativeModuleAvailable = true;
    console.log("📢 StoreKit loaded for production build");
  } catch (error: any) {
    console.warn("⚠️ StoreKit not available in production build");
    isNativeModuleAvailable = false;
  }
} else {
  console.log(
    "📢 Using mock In-App Purchase implementation (development/Expo Go mode)"
  );
  isNativeModuleAvailable = false;
}

// Mock objects for development and Expo Go
if (!isNativeModuleAvailable) {
  StoreKit = {
    getProductsAsync: () => Promise.resolve([]),
    purchaseItemAsync: () => Promise.resolve({ responseCode: 0 }),
    finishTransactionAsync: () => Promise.resolve(),
    getReceiptAsync: () => Promise.resolve(null),
  };
  ProductType = {
    SUBSCRIPTION: "subscription",
    CONSUMABLE: "consumable",
  };
}

// In-App Purchase Configuration
const IAP_CONFIG = {
  products: {
    // These would be your actual App Store Connect product IDs
    monthly: "com.poopai.premium.monthly",
    yearly: "com.poopai.premium.yearly",
  },
  // Test product IDs for development (Apple provides these)
  testProducts: {
    monthly: "com.poopai.premium.monthly.test",
    yearly: "com.poopai.premium.yearly.test",
  },
};

export interface SubscriptionPlan {
  id: string;
  title: string;
  description: string;
  price: string;
  localizedPrice?: string;
  period: "month" | "year";
  type: "subscription";
  savings?: string;
}

export interface PurchaseResult {
  success: boolean;
  productId?: string;
  transactionId?: string;
  receipt?: string;
  error?: string;
}

export interface InAppPurchaseServiceInterface {
  initialize(): Promise<void>;
  getAvailableProducts(): Promise<SubscriptionPlan[]>;
  purchaseSubscription(productId: string): Promise<PurchaseResult>;
  restorePurchases(): Promise<PurchaseResult[]>;
  isSubscriptionActive(): Promise<boolean>;
}

class InAppPurchaseService implements InAppPurchaseServiceInterface {
  private isInitialized = false;
  private availableProducts: SubscriptionPlan[] = [];

  constructor() {
    console.log(`📢 InAppPurchaseService initialized for ${Platform.OS}`);
  }

  /**
   * Initialize the In-App Purchase system
   */
  async initialize(): Promise<void> {
    try {
      if (!isNativeModuleAvailable) {
        console.log("📢 Using mock In-App Purchase implementation");
        this.isInitialized = true;
        this.setupMockProducts();
        return;
      }

      if (this.isInitialized) {
        console.log("📢 In-App Purchases already initialized");
        return;
      }

      console.log("📢 Initializing In-App Purchases...");

      // Load available products from the store
      await this.loadProducts();

      this.isInitialized = true;
      console.log("📢 In-App Purchase service initialized successfully");
    } catch (error: any) {
      console.error("❌ Failed to initialize In-App Purchases:", error);
      throw new Error(`In-App Purchase initialization failed: ${error}`);
    }
  }

  /**
   * Get available subscription plans
   */
  async getAvailableProducts(): Promise<SubscriptionPlan[]> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      console.log(
        `📢 Found ${this.availableProducts.length} available products`
      );
      return this.availableProducts;
    } catch (error: any) {
      console.error("❌ Failed to get available products:", error);
      return this.getMockProducts();
    }
  }

  /**
   * Purchase a subscription
   */
  async purchaseSubscription(productId: string): Promise<PurchaseResult> {
    try {
      if (!isNativeModuleAvailable) {
        return this.mockPurchase(productId);
      }

      if (!this.isInitialized) {
        await this.initialize();
      }

      console.log(`📢 Purchasing subscription: ${productId}`);

      // Make the purchase
      const result = await StoreKit.purchaseItemAsync(productId);

      if (result.responseCode === 0) {
        console.log("📢 Purchase successful");

        // Finish the transaction
        if (result.transactionId) {
          await StoreKit.finishTransactionAsync(result.transactionId);
        }

        return {
          success: true,
          productId: result.productId,
          transactionId: result.transactionId,
          receipt: result.receipt,
        };
      } else {
        throw new Error(
          `Purchase failed with response code: ${result.responseCode}`
        );
      }
    } catch (error: any) {
      console.error("❌ Purchase failed:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Restore previous purchases
   */
  async restorePurchases(): Promise<PurchaseResult[]> {
    try {
      if (!isNativeModuleAvailable) {
        console.log("📢 Mock restore - no purchases to restore");
        return [];
      }

      console.log("📢 Restoring purchases...");

      // Get receipt data to check for existing purchases
      const receipt = await StoreKit.getReceiptAsync();

      if (receipt) {
        // In a real implementation, you would parse the receipt
        // and validate it with your backend server
        console.log("📢 Found existing purchases");
        return [
          {
            success: true,
            receipt: receipt,
          },
        ];
      }

      return [];
    } catch (error: any) {
      console.error("❌ Failed to restore purchases:", error);
      return [];
    }
  }

  /**
   * Check if user has an active subscription
   */
  async isSubscriptionActive(): Promise<boolean> {
    try {
      if (!isNativeModuleAvailable) {
        // In mock mode, simulate having no active subscription
        return false;
      }

      // Get receipt and validate with your backend
      const receipt = await StoreKit.getReceiptAsync();

      if (receipt) {
        // In production, send receipt to your backend for validation
        // For now, assume any receipt means active subscription
        return true;
      }

      return false;
    } catch (error: any) {
      console.error("❌ Failed to check subscription status:", error);
      return false;
    }
  }

  /**
   * Load products from the app store
   */
  private async loadProducts(): Promise<void> {
    try {
      const productIds = Object.values(
        __DEV__ ? IAP_CONFIG.testProducts : IAP_CONFIG.products
      );

      console.log(`📢 Loading products: ${productIds.join(", ")}`);

      const products = await StoreKit.getProductsAsync(productIds);

      this.availableProducts = products.map(this.mapStoreProduct);
    } catch (error: any) {
      console.error("❌ Failed to load products:", error);
      this.availableProducts = this.getMockProducts();
    }
  }

  /**
   * Map store product to our interface
   */
  private mapStoreProduct(storeProduct: any): SubscriptionPlan {
    const isYearly = storeProduct.productId.includes("yearly");

    return {
      id: storeProduct.productId,
      title: isYearly ? "Premium Yearly" : "Premium Monthly",
      description: isYearly
        ? "Unlimited scans + advanced features (save 84%)"
        : "Unlimited scans + advanced features",
      price: storeProduct.price || (isYearly ? "$12.99" : "$1.99"),
      localizedPrice: storeProduct.localizedPrice,
      period: isYearly ? "year" : "month",
      type: "subscription",
      savings: isYearly ? "Save 84%" : undefined,
    };
  }

  /**
   * Setup mock products for development
   */
  private setupMockProducts(): void {
    this.availableProducts = this.getMockProducts();
  }

  /**
   * Get mock products for testing
   */
  private getMockProducts(): SubscriptionPlan[] {
    return [
      {
        id: IAP_CONFIG.products.monthly,
        title: "Premium Monthly",
        description: "Unlimited scans + advanced features",
        price: "$1.99",
        period: "month",
        type: "subscription",
      },
      {
        id: IAP_CONFIG.products.yearly,
        title: "Premium Yearly",
        description: "Unlimited scans + advanced features (save 84%)",
        price: "$12.99",
        period: "year",
        type: "subscription",
        savings: "Save 84%",
      },
    ];
  }

  /**
   * Mock purchase for development
   */
  private async mockPurchase(productId: string): Promise<PurchaseResult> {
    console.log(`📢 Mock purchasing: ${productId}`);

    // Simulate purchase flow with loading time
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log("📢 Mock purchase completed successfully");

    return {
      success: true,
      productId,
      transactionId: `mock_${Date.now()}`,
      receipt: "mock_receipt_data",
    };
  }

  /**
   * Get current configuration info (useful for debugging)
   */
  getConfig() {
    return {
      platform: Platform.OS,
      isDevelopment: __DEV__,
      isInitialized: this.isInitialized,
      availableProductsCount: this.availableProducts.length,
      isNativeModuleAvailable,
      productIds: __DEV__ ? IAP_CONFIG.testProducts : IAP_CONFIG.products,
    };
  }

  /**
   * Check if the native In-App Purchase module is available
   */
  isNativeModuleAvailable(): boolean {
    return isNativeModuleAvailable;
  }
}

// Export a singleton instance
export const inAppPurchaseService = new InAppPurchaseService();
export default inAppPurchaseService;
