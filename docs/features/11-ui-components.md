# UI Components & Design System

## Overview

The UI components system provides a comprehensive set of reusable components, animations, and design patterns used throughout the PoopAI application. It includes button components, display elements, interactive components, and animation systems that maintain consistency and provide engaging user experiences.

## Architecture

### Component Categories

**Button Components** (`components/ui/`)

- Primary and secondary action buttons
- Hero buttons for promotional content
- Navigation buttons with consistent styling

**Display Components** (`components/core/`)

- Headers, loading screens, and informational displays
- Error handling and status components
- Interactive dialogue systems

**Animation Components** (`components/analysis/`, `components/ui/`)

- Sophisticated animation systems for results display
- Loading and transition animations
- Interactive visual effects

## Implementation Details

### 1. Button Components

#### PrimaryButton

**Location:** `components/ui/PrimaryButton.tsx`

**Purpose:**

- Main call-to-action buttons throughout the app
- Consistent styling with loading and disabled states
- Responsive sizing and accessibility features

**Features:**

- **Loading States:** Spinner animation during async operations
- **Disabled States:** Visual feedback for unavailable actions
- **Responsive Design:** Adapts to different screen sizes
- **Accessibility:** Screen reader support and proper touch targets

**Implementation:**

```tsx
interface PrimaryButtonProps {
  title: string;
  onPress: () => void | Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
  size?: "small" | "medium" | "large";
  icon?: string;
  style?: ViewStyle;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  isLoading = false,
  disabled = false,
  variant = "primary",
  size = "medium",
  icon,
  style,
}) => {
  const { screenHeight } = useDimensions();

  // Dynamic sizing based on screen dimensions
  const buttonHeight = {
    small: screenHeight * 0.05,
    medium: screenHeight * 0.06,
    large: screenHeight * 0.08,
  }[size];

  const handlePress = useCallback(async () => {
    if (disabled || isLoading) return;

    try {
      await onPress();
    } catch (error) {
      console.error("Button action failed:", error);
    }
  }, [onPress, disabled, isLoading]);

  const buttonStyle = [
    styles.button,
    styles[variant],
    styles[size],
    { height: buttonHeight },
    disabled && styles.disabled,
    style,
  ];

  const textStyle = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={handlePress}
      disabled={disabled || isLoading}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || isLoading }}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variant === "primary" ? "white" : "#3b82f6"}
        />
      ) : (
        <View style={styles.content}>
          {icon && (
            <Ionicons
              name={icon}
              size={20}
              color={variant === "primary" ? "white" : "#3b82f6"}
              style={styles.icon}
            />
          )}
          <Text style={textStyle}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primary: {
    backgroundColor: "#3b82f6",
  },
  secondary: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#3b82f6",
  },
  danger: {
    backgroundColor: "#ef4444",
  },
  disabled: {
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  text: {
    fontWeight: "600",
    textAlign: "center",
  },
  primaryText: {
    color: "white",
  },
  secondaryText: {
    color: "#3b82f6",
  },
  dangerText: {
    color: "white",
  },
  disabledText: {
    opacity: 0.7,
  },
  icon: {
    marginRight: 4,
  },
});
```

#### HeroPrimaryButton & HeroSecondaryButton

**Location:** `components/ui/HeroPrimaryButton.tsx`, `components/ui/HeroSecondaryButton.tsx`

**Purpose:**

- Large, prominent buttons for main app actions
- Enhanced visual design with gradients and effects
- Used for primary calls-to-action like "Start Scanning"

**Features:**

- **Gradient Backgrounds:** Multi-color gradients for visual appeal
- **Animated Effects:** Subtle animations and hover states
- **Large Touch Targets:** Optimized for easy interaction
- **Premium Styling:** Enhanced visual design for important actions

**Implementation:**

```tsx
const HeroPrimaryButton: React.FC<HeroButtonProps> = ({
  title,
  subtitle,
  onPress,
  isLoading = false,
  disabled = false,
  icon,
}) => {
  const { screenHeight } = useDimensions();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const buttonHeight = screenHeight * 0.08; // 8% of screen height

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[{ transform: [{ scale: scaleAnim }] }, { height: buttonHeight }]}
    >
      <TouchableOpacity
        style={[styles.heroButton, disabled && styles.disabled]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || isLoading}
        accessibilityRole="button"
        accessibilityLabel={title}
      >
        <LinearGradient
          colors={["#3b82f6", "#1d4ed8", "#1e40af"]}
          style={styles.gradient}
        >
          <View style={styles.heroContent}>
            {icon && (
              <Ionicons
                name={icon}
                size={24}
                color="white"
                style={styles.heroIcon}
              />
            )}
            <View style={styles.textContainer}>
              <Text style={styles.heroTitle}>{title}</Text>
              {subtitle && <Text style={styles.heroSubtitle}>{subtitle}</Text>}
            </View>
          </View>

          {isLoading && (
            <ActivityIndicator
              size="small"
              color="white"
              style={styles.loadingIndicator}
            />
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};
```

#### Navigation Buttons

**BackButton** (`components/navigation/BackButton.tsx`)

- Consistent back navigation throughout the app
- Customizable appearance and behavior
- Proper accessibility support

**HomeButton** (`components/navigation/HomeButton.tsx`)

- Quick navigation to home screen
- Responsive sizing and positioning
- Integration with navigation state

### 2. Display Components

#### HomeHeader

**Location:** `components/core/HomeHeader.tsx`

**Purpose:**

- Main screen header with user greeting and context
- Dynamic content based on user state and time of day
- Integration with user profile and notifications

**Features:**

- **Personalized Greetings:** Time-based and user-specific messages
- **Status Indicators:** Scan credits, premium status, notifications
- **Responsive Layout:** Adapts to different screen sizes and content
- **Animation Support:** Smooth transitions and updates

**Implementation:**

```tsx
const HomeHeader: React.FC<HomeHeaderProps> = ({
  user,
  scansLeft,
  isPremium,
  onProfilePress,
  onNotificationPress,
}) => {
  const { screenWidth, screenHeight } = useDimensions();

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = user?.name?.split(" ")[0] || "there";

    if (hour < 12) return `Good morning, ${name}!`;
    if (hour < 18) return `Good afternoon, ${name}!`;
    return `Good evening, ${name}!`;
  };

  const getMotivationalMessage = () => {
    const messages = [
      "Ready to track your digestive health?",
      "Let's see how you're doing today!",
      "Your health journey continues!",
      "Time for another scan?",
    ];

    return messages[Math.floor(Math.random() * messages.length)];
  };

  return (
    <View style={[styles.header, { paddingTop: screenHeight * 0.02 }]}>
      <View style={styles.headerContent}>
        {/* User Greeting */}
        <View style={styles.greetingSection}>
          <Text style={[styles.greeting, { fontSize: screenHeight * 0.025 }]}>
            {getGreeting()}
          </Text>
          <Text style={[styles.motivation, { fontSize: screenHeight * 0.018 }]}>
            {getMotivationalMessage()}
          </Text>
        </View>

        {/* Status Section */}
        <View style={styles.statusSection}>
          {/* Scan Counter */}
          <ScanCounter count={scansLeft} isPremium={isPremium} size="small" />

          {/* Profile Button */}
          <TouchableOpacity
            style={styles.profileButton}
            onPress={onProfilePress}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
```

#### LoadingScreen

**Location:** `components/core/LoadingScreen.tsx`

**Purpose:**

- App initialization loading with progress indication
- Engaging loading animation with PoopBot character
- Smooth transition to main app content

**Features:**

- **Progress Tracking:** Visual progress bar with percentage
- **Animated Character:** PoopBot with floating and sparkle effects
- **Loading Messages:** Contextual loading text updates
- **Smooth Transitions:** Fade out when loading completes

#### ErrorDisplay

**Location:** `components/core/ErrorDisplay.tsx`

**Purpose:**

- Standardized error display with recovery options
- User-friendly error messaging and illustrations
- Retry functionality and support contact options

### 3. Interactive Components

#### InteractiveDialogue

**Location:** `components/core/InteractiveDialogue.tsx`

**Purpose:**

- Conversational interface for guided interactions
- Typewriter text effects with character animations
- Used in onboarding and help systems

**Features:**

- **Typewriter Animation:** Configurable typing speed and delays
- **Character Integration:** Animated characters (PoopBot)
- **Interactive Elements:** Buttons, choices, and progress indicators
- **Skip Functionality:** Tap to skip or speed up animations

**Implementation:**

```tsx
const InteractiveDialogue: React.FC<InteractiveDialogueProps> = ({
  messages,
  character = "poopbot",
  typingSpeed = 50,
  onComplete,
  showSkip = true,
}) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const typewriterAnimation = useCallback(() => {
    const currentMessage = messages[currentMessageIndex];
    if (!currentMessage) return;

    setIsTyping(true);
    setDisplayedText("");

    let charIndex = 0;
    const interval = setInterval(() => {
      if (charIndex < currentMessage.length) {
        setDisplayedText((prev) => prev + currentMessage[charIndex]);
        charIndex++;
      } else {
        clearInterval(interval);
        setIsTyping(false);

        // Auto-advance after delay
        setTimeout(() => {
          if (currentMessageIndex < messages.length - 1) {
            setCurrentMessageIndex((prev) => prev + 1);
          } else {
            setIsComplete(true);
            onComplete?.();
          }
        }, 2000);
      }
    }, typingSpeed);

    return () => clearInterval(interval);
  }, [currentMessageIndex, messages, typingSpeed, onComplete]);

  useEffect(() => {
    typewriterAnimation();
  }, [typewriterAnimation]);

  const handleSkip = () => {
    if (isTyping) {
      // Complete current message instantly
      setDisplayedText(messages[currentMessageIndex]);
      setIsTyping(false);
    } else if (currentMessageIndex < messages.length - 1) {
      // Skip to next message
      setCurrentMessageIndex((prev) => prev + 1);
    } else {
      // Complete dialogue
      setIsComplete(true);
      onComplete?.();
    }
  };

  return (
    <View style={styles.container}>
      {/* Character Animation */}
      <AnimatedCharacter character={character} isActive={isTyping} />

      {/* Dialogue Bubble */}
      <View style={styles.dialogueBubble}>
        <Text style={styles.dialogueText}>
          {displayedText}
          {isTyping && <Text style={styles.cursor}>|</Text>}
        </Text>
      </View>

      {/* Skip Button */}
      {showSkip && !isComplete && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>{isTyping ? "Skip" : "Next"}</Text>
        </TouchableOpacity>
      )}

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        {messages.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              index <= currentMessageIndex && styles.progressDotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
};
```

### 4. Animation Systems

#### PoopMeterAnimation

**Location:** `components/analysis/PoopMeterAnimation.tsx`

**Purpose:**

- Sophisticated circular progress animation for analysis results
- Dynamic color changes based on score values
- Engaging visual feedback for health scores

**Features:**

- **Circular Progress:** Smooth arc animation with gradients
- **Dynamic Colors:** Color changes based on Bristol scale scores
- **Pulsing Effects:** Emphasis animations for important scores
- **Number Animation:** Animated score counting with easing

#### Sparkle Animation System

**Location:** Various components with sparkle effects

**Purpose:**

- Decorative particle effects for engaging interactions
- Used around characters and important UI elements
- Configurable particle count, movement, and timing

**Implementation:**

```tsx
const useSparkleAnimation = (count: number = 6, radius: number = 70) => {
  const [sparkles, setSparkles] = useState<SparkleParticle[]>([]);

  useEffect(() => {
    const generateSparkles = () => {
      const newSparkles = [];

      for (let i = 0; i < count; i++) {
        const angle = (i / count) * 2 * Math.PI;
        const x = Math.cos(angle) * (radius + Math.random() * 20);
        const y = Math.sin(angle) * (radius + Math.random() * 20);

        newSparkles.push({
          id: Date.now() + i,
          opacity: new Animated.Value(0),
          translateX: new Animated.Value(0),
          translateY: new Animated.Value(0),
          x,
          y,
        });
      }

      setSparkles(newSparkles);

      // Animate sparkles
      newSparkles.forEach((sparkle) => {
        // Opacity animation
        Animated.loop(
          Animated.sequence([
            Animated.timing(sparkle.opacity, {
              toValue: 1,
              duration: 800 + Math.random() * 400,
              useNativeDriver: true,
            }),
            Animated.timing(sparkle.opacity, {
              toValue: 0,
              duration: 800 + Math.random() * 400,
              useNativeDriver: true,
            }),
          ])
        ).start();

        // Movement animation
        Animated.loop(
          Animated.timing(sparkle.translateX, {
            toValue: (Math.random() - 0.5) * 40,
            duration: 3000 + Math.random() * 2000,
            useNativeDriver: true,
          })
        ).start();
      });
    };

    generateSparkles();
  }, [count, radius]);

  return sparkles;
};
```

## Design System

### Color Palette

```tsx
export const Colors = {
  // Primary colors
  primary: "#3b82f6",
  primaryDark: "#1d4ed8",
  primaryLight: "#60a5fa",

  // Secondary colors
  secondary: "#10b981",
  secondaryDark: "#047857",
  secondaryLight: "#34d399",

  // Bristol scale colors
  bristol: {
    1: "#8B4513", // Brown
    2: "#A0522D", // Saddle brown
    3: "#D2691E", // Chocolate
    4: "#DAA520", // Goldenrod
    5: "#F4A460", // Sandy brown
    6: "#DEB887", // Burlywood
    7: "#F5DEB3", // Wheat
  },

  // Neutral colors
  gray: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
  },

  // Status colors
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  info: "#3b82f6",
};
```

### Typography Scale

```tsx
export const Typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 30,
    "4xl": 36,
  },

  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
  },

  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};
```

### Spacing System

```tsx
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
  "3xl": 64,
};
```

## Customization

### Creating New Components

**Component Template:**

```tsx
// components/ui/NewComponent.tsx
interface NewComponentProps {
  title: string;
  onPress?: () => void;
  variant?: "default" | "emphasized";
  size?: "small" | "medium" | "large";
}

const NewComponent: React.FC<NewComponentProps> = ({
  title,
  onPress,
  variant = "default",
  size = "medium",
}) => {
  const { screenHeight } = useDimensions();

  // Responsive sizing
  const componentHeight = screenHeight * 0.06;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        styles[variant],
        styles[size],
        { height: componentHeight },
      ]}
      onPress={onPress}
    >
      <Text style={[styles.title, styles[`${variant}Title`]]}>{title}</Text>
    </TouchableOpacity>
  );
};

export default NewComponent;
```

### Animation Utilities

**Reusable Animation Hooks:**

```tsx
// hooks/useAnimations.ts
export const useScaleAnimation = (initialScale = 1) => {
  const scaleAnim = useRef(new Animated.Value(initialScale)).current;

  const animateScale = useCallback(
    (toValue: number, duration = 300) => {
      Animated.timing(scaleAnim, {
        toValue,
        duration,
        useNativeDriver: true,
      }).start();
    },
    [scaleAnim]
  );

  return { scaleAnim, animateScale };
};

export const useFadeAnimation = (initialOpacity = 0) => {
  const opacityAnim = useRef(new Animated.Value(initialOpacity)).current;

  const fadeIn = useCallback(
    (duration = 300) => {
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }).start();
    },
    [opacityAnim]
  );

  const fadeOut = useCallback(
    (duration = 300) => {
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration,
        useNativeDriver: true,
      }).start();
    },
    [opacityAnim]
  );

  return { opacityAnim, fadeIn, fadeOut };
};
```

## Testing

### Component Testing

```tsx
// __tests__/components/PrimaryButton.test.tsx
describe("PrimaryButton", () => {
  test("renders correctly with title", () => {
    const { getByText } = render(
      <PrimaryButton title="Test Button" onPress={() => {}} />
    );

    expect(getByText("Test Button")).toBeVisible();
  });

  test("shows loading state", () => {
    const { getByTestId } = render(
      <PrimaryButton title="Test Button" onPress={() => {}} isLoading={true} />
    );

    expect(getByTestId("loading-indicator")).toBeVisible();
  });

  test("handles press events", () => {
    const mockPress = jest.fn();
    const { getByRole } = render(
      <PrimaryButton title="Test Button" onPress={mockPress} />
    );

    fireEvent.press(getByRole("button"));
    expect(mockPress).toHaveBeenCalled();
  });
});
```

### Animation Testing

```tsx
// Test animation behavior
test("animates scale on press", async () => {
  const { getByRole } = render(<AnimatedButton />);
  const button = getByRole("button");

  fireEvent(button, "pressIn");

  // Check animation values
  expect(mockAnimatedValue.setValue).toHaveBeenCalledWith(0.95);
});
```

## Troubleshooting

### Common Issues

**Components not responsive:**

- Check useDimensions hook integration
- Verify responsive calculations
- Test on different screen sizes
- Monitor for fixed sizing values

**Animations not smooth:**

- Ensure useNativeDriver is used when possible
- Check for heavy computations during animations
- Test on different devices
- Optimize animation timing

**Accessibility issues:**

- Verify accessibility props on touchable components
- Test with screen readers
- Check color contrast ratios
- Ensure proper touch target sizes

**Styling inconsistencies:**

- Use design system values consistently
- Check for hardcoded styles
- Verify theme integration
- Test across different platforms

### Performance Optimization

- Use React.memo for expensive components
- Optimize animation performance
- Minimize style recalculations
- Cache computed styles when possible

### Design System Maintenance

- Regularly audit component usage
- Update design tokens consistently
- Maintain component documentation
- Test design system changes thoroughly
