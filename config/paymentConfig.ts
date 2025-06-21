// Configuration for dynamic payment screen content
export interface PaymentConfig {
  title: string;
  subtitle: string;
  sectionTitle: string;
  features: Array<{
    icon: string;
    text: string;
  }>;
  choosePlanTitle: string;
  monthlyText: {
    title: string;
    focusNumber: string;
    timeframe: string;
    price: string;
    period: string;
    perMonthPrice: string;
    badge?: string;
  };
  annualText: {
    title: string;
    focusNumber: string;
    timeframe: string;
    price: string;
    period: string;
    perMonthPrice: string;
    badge?: string;
  };
  subscribeButtonText: {
    monthly: string;
    annual: string;
    disabled: string;
  };
  freeTrialText?: {
    title: string;
    subtitle: string;
    disclaimer: string;
  };
  freeScanSection?: {
    title: string;
    subtitle: string;
    buttonText: string;
    disclaimer: string;
  };
}

export const paymentConfigs: Record<string, PaymentConfig> = {
  // Default scan credits configuration
  "scan-credits": {
    title: "Unlock Unlimited Scans",
    subtitle: "Go beyond your weekly limit & get full access to PoopAI",
    sectionTitle: "Premium Features",
    features: [
      { icon: "camera", text: "Unlimited scans" },
      { icon: "analytics", text: "Advanced analytics" },
      { icon: "calendar", text: "Full calendar access" },
      { icon: "trending-up", text: "Progress tracking" },
    ],
    choosePlanTitle: "Pick Your Plan",
    monthlyText: {
      title: "Monthly",
      focusNumber: "1",
      timeframe: "month",
      price: "$1.99",
      period: "per month",
      perMonthPrice: "$1.99/mo",
    },
    annualText: {
      title: "Annual",
      focusNumber: "1",
      timeframe: "year",
      price: "$12.99",
      period: "per year",
      perMonthPrice: "$1.08/mo",
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
      disclaimer:
        "Share with friends to earn scan credits.\nRefer a friend to unlock scans.",
    },
  },

  // Premium subscription focused configuration
  "premium-subscription": {
    title: "Experience the Full Power of PoopAI",
    subtitle: "Unlock unlimited scans at the lowest price we'll ever offer.",
    sectionTitle: "Premium Features",
    features: [
      { icon: "camera", text: "Unlimited scans" },
      { icon: "analytics", text: "Advanced analytics" },
      { icon: "calendar", text: "Full calendar access" },
      { icon: "trending-up", text: "Progress tracking" },
    ],
    choosePlanTitle: "Pick Your Plan",
    monthlyText: {
      title: "Monthly",
      focusNumber: "1",
      timeframe: "month",
      price: "$1.99",
      period: "per month",
      perMonthPrice: "$1.99/mo",
    },
    annualText: {
      title: "Annual",
      focusNumber: "1",
      timeframe: "year",
      price: "$12.99",
      period: "per year",
      perMonthPrice: "$1.08/mo",
      badge: "Best Value",
    },
    subscribeButtonText: {
      monthly: "Subscribe Monthly",
      annual: "Subscribe Annually",
      disabled: "Select a Plan",
    },
  },

  // Onboarding configuration
  onboarding: {
    title: "Welcome to Premium Health Tracking",
    subtitle: "Start your journey with advanced health analytics",
    sectionTitle: "What You'll Get",
    features: [
      { icon: "star", text: "Advanced AI analysis" },
      { icon: "shield-checkmark", text: "Secure & private" },
      { icon: "trophy", text: "Achievement tracking" },
      { icon: "notifications", text: "Smart reminders" },
    ],
    choosePlanTitle: "Pick Your Plan",
    monthlyText: {
      title: "Monthly",
      focusNumber: "1",
      timeframe: "month",
      price: "$1.99",
      period: "per month",
      perMonthPrice: "$1.99/mo",
    },
    annualText: {
      title: "Annual",
      focusNumber: "1",
      timeframe: "year",
      price: "$12.99",
      period: "per year",
      perMonthPrice: "$1.08/mo",
      badge: "Best Value",
    },
    subscribeButtonText: {
      monthly: "Start Monthly Plan",
      annual: "Start Annual Plan",
      disabled: "Select a Plan",
    },
    freeTrialText: {
      title: "7-Day Free Trial",
      subtitle: "Try all features risk-free",
      disclaimer: "Cancel anytime during trial period",
    },
    freeScanSection: {
      title: "Skip for Now",
      subtitle: "Continue with limited features",
      buttonText: "Continue with Basic",
      disclaimer: "You can upgrade anytime from settings.",
    },
  },

  // Annual preselection with free trial
  "annual-trial": {
    title: "Start Your Free Trial",
    subtitle: "Experience premium features with our annual plan",
    sectionTitle: "Premium Benefits",
    features: [
      { icon: "time", text: "Save time with automation" },
      { icon: "bar-chart", text: "Detailed health insights" },
      { icon: "cloud", text: "Cloud sync across devices" },
      { icon: "heart", text: "Personalized recommendations" },
    ],
    choosePlanTitle: "Best Value - Annual Plan",
    monthlyText: {
      title: "Monthly",
      focusNumber: "1",
      timeframe: "month",
      price: "$1.99",
      period: "per month",
      perMonthPrice: "$1.99/mo",
    },
    annualText: {
      title: "Annual",
      focusNumber: "1",
      timeframe: "year",
      price: "$12.99",
      period: "per year",
      perMonthPrice: "$1.08/mo",
      badge: "Best Value",
    },
    subscribeButtonText: {
      monthly: "Start Monthly Trial",
      annual: "Start Annual Trial",
      disabled: "Select a Plan",
    },
    freeTrialText: {
      title: "7-Day Free Trial",
      subtitle: "No commitment, cancel anytime",
      disclaimer: "Trial starts immediately after subscription",
    },
    freeScanSection: {
      title: "Not Ready Yet?",
      subtitle: "Continue with basic scanning features",
      buttonText: "Maybe Later",
      disclaimer: "Limited features available without subscription.",
    },
  },
};

// Helper function to get configuration based on screen type and options
export function getPaymentConfig(
  type: "scan-credits" | "premium-subscription",
  preselection?: "monthly" | "annual" | null,
  freeTrial?: boolean
): PaymentConfig {
  // Determine config key based on parameters
  let configKey: string = type;

  if (freeTrial && preselection === "annual") {
    configKey = "annual-trial";
  } else if (type === "premium-subscription" && preselection === "annual") {
    // Could add more specific configurations here
    configKey = "premium-subscription";
  }

  return paymentConfigs[configKey] || paymentConfigs[type];
}

// Helper function to modify config based on dynamic parameters
export function customizeConfig(
  baseConfig: PaymentConfig,
  options: {
    preselection?: "monthly" | "annual" | null;
    freeTrial?: boolean;
  }
): PaymentConfig {
  const config = { ...baseConfig };

  // Customize based on free trial
  if (options.freeTrial) {
    config.choosePlanTitle = "Try Free for 7 Days — Cancel Anytime!";
    config.subscribeButtonText = {
      monthly: "Start Free Trial (Monthly)",
      annual: "Start Free Trial (Annual)",
      disabled: "Select a Plan",
    };
  }

  // Customize based on preselection
  if (options.preselection === "annual") {
    config.annualText.price = config.annualText.price.includes("Only")
      ? config.annualText.price
      : `Only ${config.annualText.price}`;
  }

  return config;
}
