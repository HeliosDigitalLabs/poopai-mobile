# Profile & Settings System

## Overview

The profile and settings system provides comprehensive user account management, health data configuration, and app preferences. It includes profile management, health goal tracking, medical conditions and symptoms management, and app settings configuration. The system integrates with the mini calendar and provides easy access to all user-related functionality.

## Architecture

### Core Components

**Profile Screen** (`screens/profile/ProfileScreen.tsx`)

- Main profile hub with user information and navigation
- Mini calendar integration for quick scan history access
- Settings and health data navigation

**Settings Screen** (`screens/profile/SettingsScreen.tsx`)

- App configuration and user preferences
- Account management and data controls
- Privacy settings and data export options

**Health Data Screens** (`screens/profile/`)

- Specialized screens for health-related data management
- Goals, conditions, and symptoms tracking
- Integration with onboarding quiz data

## Implementation Details

### 1. Profile Screen

**Location:** `screens/profile/ProfileScreen.tsx`

**Purpose:**

- Central hub for user profile management
- Quick access to recent scan history via mini calendar
- Navigation to settings and health data screens

**Key Features:**

- **User Information Display:** Name, email, subscription status
- **Mini Calendar Integration:** 7-day scroll view with scan previews
- **Quick Actions:** Settings, health goals, logout
- **Premium Status Indicator:** Visual indication of subscription status
- **Responsive Layout:** Adapts to different screen sizes

**State Management:**

```tsx
interface ProfileState {
  user: User | null;
  selectedDate: Date;
  isLoading: boolean;
  showLogoutModal: boolean;
  recentScans: ScanRecord[];
}
```

**Implementation:**

```tsx
const ProfileScreen = ({ navigation }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { isPremium } = useSubscription();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigation.replace("Home");
    }
  }, [isAuthenticated]);

  const handleCalendarDaySelect = (date: Date) => {
    setSelectedDate(date);
    // Navigate to full calendar with selected date
    navigation.navigate("Calendar", {
      initialDate: date,
      highlightDate: true,
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
      setShowLogoutModal(false);
      navigation.replace("Home");
    } catch (error) {
      Alert.alert("Logout Error", "Failed to logout. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </Text>
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || "User"}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>

            {isPremium && (
              <View style={styles.premiumBadge}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.premiumText}>Premium Member</Text>
              </View>
            )}
          </View>
        </View>

        {/* Mini Calendar Section */}
        <View style={styles.calendarSection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <MiniCalendar
            selectedDate={selectedDate}
            onDaySelect={handleCalendarDaySelect}
            onViewFullCalendar={() => navigation.navigate("Calendar")}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <ProfileActionButton
            title="Health Goals"
            subtitle="Manage your digestive health objectives"
            icon="target"
            onPress={() => navigation.navigate("PoopGoals")}
          />

          <ProfileActionButton
            title="Conditions & Symptoms"
            subtitle="Update your health information"
            icon="medical"
            onPress={() => navigation.navigate("Conditions")}
          />

          <ProfileActionButton
            title="Settings"
            subtitle="App preferences and account settings"
            icon="settings"
            onPress={() => navigation.navigate("Settings")}
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => setShowLogoutModal(true)}
        >
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmationModal
        visible={showLogoutModal}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </SafeAreaView>
  );
};
```

**Profile Action Button Component:**

```tsx
const ProfileActionButton = ({ title, subtitle, icon, onPress }) => {
  return (
    <TouchableOpacity style={styles.actionButton} onPress={onPress}>
      <View style={styles.actionIcon}>
        <Ionicons name={icon} size={24} color="#3b82f6" />
      </View>

      <View style={styles.actionContent}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
    </TouchableOpacity>
  );
};
```

### 2. Settings Screen

**Location:** `screens/profile/SettingsScreen.tsx`

**Purpose:**

- App configuration and user preferences
- Account management and security settings
- Data management and privacy controls

**Key Features:**

- **Account Management:** Update profile information
- **Notification Settings:** Push notification preferences
- **Privacy Controls:** Data sharing and export options
- **App Preferences:** Theme, language, and display settings
- **Support Access:** Help, feedback, and contact options

**Settings Categories:**

```tsx
const settingsConfig = {
  account: {
    title: "Account",
    items: [
      {
        id: "profile",
        title: "Edit Profile",
        subtitle: "Update your name and email",
        icon: "person",
        onPress: () => navigation.navigate("EditProfile"),
      },
      {
        id: "subscription",
        title: "Subscription",
        subtitle: "Manage your premium subscription",
        icon: "card",
        onPress: () => navigation.navigate("Payment"),
      },
      {
        id: "security",
        title: "Security",
        subtitle: "Password and authentication",
        icon: "shield-checkmark",
        onPress: () => navigation.navigate("Security"),
      },
    ],
  },

  notifications: {
    title: "Notifications",
    items: [
      {
        id: "push_notifications",
        title: "Push Notifications",
        subtitle: "Scan reminders and insights",
        icon: "notifications",
        type: "toggle",
        value: notificationSettings.pushEnabled,
      },
      {
        id: "daily_reminders",
        title: "Daily Reminders",
        subtitle: "Daily scan reminder notifications",
        icon: "alarm",
        type: "toggle",
        value: notificationSettings.dailyReminders,
      },
    ],
  },

  privacy: {
    title: "Privacy & Data",
    items: [
      {
        id: "data_export",
        title: "Export Data",
        subtitle: "Download your scan history",
        icon: "download",
        onPress: () => handleDataExport(),
      },
      {
        id: "delete_account",
        title: "Delete Account",
        subtitle: "Permanently delete your account",
        icon: "trash",
        onPress: () => handleDeleteAccount(),
        destructive: true,
      },
    ],
  },
};
```

**Settings Implementation:**

```tsx
const SettingsScreen = ({ navigation }) => {
  const { user, updateProfile, deleteAccount } = useAuth();
  const [notificationSettings, setNotificationSettings] = useState({
    pushEnabled: true,
    dailyReminders: false,
    weeklyInsights: true,
  });

  const handleToggleSetting = async (settingId: string, newValue: boolean) => {
    try {
      const updatedSettings = {
        ...notificationSettings,
        [settingId]: newValue,
      };

      setNotificationSettings(updatedSettings);

      // Save to backend
      await apiService.updateNotificationSettings(user.id, updatedSettings);

      // Update local notification permissions if needed
      if (settingId === "pushEnabled") {
        if (newValue) {
          await requestNotificationPermissions();
        } else {
          await disableNotifications();
        }
      }
    } catch (error) {
      console.error("Failed to update setting:", error);
      Alert.alert("Error", "Failed to update setting. Please try again.");
    }
  };

  const handleDataExport = async () => {
    try {
      Alert.alert(
        "Export Data",
        "This will generate a file containing all your scan history and health data.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Export", onPress: () => exportUserData() },
        ]
      );
    } catch (error) {
      Alert.alert("Export Error", "Failed to export data. Please try again.");
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This action cannot be undone. All your data will be permanently deleted.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => confirmDeleteAccount(),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {Object.entries(settingsConfig).map(([categoryKey, category]) => (
          <SettingsSection
            key={categoryKey}
            title={category.title}
            items={category.items}
            onToggle={handleToggleSetting}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};
```

### 3. Health Data Screens

#### Health Goals Screen

**Location:** `screens/profile/PoopGoalsScreen.tsx`

**Purpose:**

- Manage personal health objectives
- Track progress toward digestive health goals
- Set reminders and targets

**Features:**

- **Goal Categories:** Regularity, consistency, timing, etc.
- **Progress Tracking:** Visual progress indicators
- **Reminder Settings:** Custom notification scheduling
- **Achievement System:** Goal completion rewards

**Implementation:**

```tsx
const PoopGoalsScreen = () => {
  const [healthGoals, setHealthGoals] = useState<HealthGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHealthGoals();
  }, []);

  const loadHealthGoals = async () => {
    try {
      const goals = await healthService.getHealthGoals(user.id);
      setHealthGoals(goals);
    } catch (error) {
      console.error("Failed to load health goals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateGoal = async (goalId: string, updates: Partial<HealthGoal>) => {
    try {
      const updatedGoal = await healthService.updateHealthGoal(goalId, updates);

      setHealthGoals((prev) =>
        prev.map((goal) =>
          goal.id === goalId ? { ...goal, ...updatedGoal } : goal
        )
      );
    } catch (error) {
      Alert.alert("Error", "Failed to update goal. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.screenTitle}>Health Goals</Text>

        {healthGoals.map((goal) => (
          <HealthGoalCard
            key={goal.id}
            goal={goal}
            onUpdate={(updates) => updateGoal(goal.id, updates)}
          />
        ))}

        <TouchableOpacity
          style={styles.addGoalButton}
          onPress={() => navigation.navigate("AddHealthGoal")}
        >
          <Text style={styles.addGoalText}>Add New Goal</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};
```

#### Conditions Screen

**Location:** `screens/profile/ConditionsScreen.tsx`

**Purpose:**

- Manage medical conditions affecting digestive health
- Update condition status and medications
- Share information with healthcare providers

**Features:**

- **Condition Categories:** IBS, IBD, food allergies, etc.
- **Medication Tracking:** Current medications and dosages
- **Symptom Correlation:** Link conditions to scan results
- **Healthcare Integration:** Export for medical appointments

#### Symptoms Screen

**Location:** `screens/profile/SymptomsScreen.tsx`

**Purpose:**

- Track ongoing digestive symptoms
- Monitor symptom changes over time
- Correlate symptoms with scan results

**Features:**

- **Symptom Categories:** Pain, bloating, frequency, etc.
- **Severity Tracking:** 1-10 severity scales
- **Trend Analysis:** Symptom patterns over time
- **Trigger Identification:** Food and lifestyle correlations

### 4. Data Integration

**Profile Data Sync:**

```tsx
// Sync profile data with backend
const syncProfileData = async () => {
  try {
    const localData = await getLocalProfileData();
    const serverData = await apiService.getProfileData(user.id);

    // Merge local and server data
    const mergedData = mergeProfileData(localData, serverData);

    // Update both local and server
    await saveLocalProfileData(mergedData);
    await apiService.updateProfileData(user.id, mergedData);

    return mergedData;
  } catch (error) {
    console.error("Profile sync failed:", error);
    throw error;
  }
};
```

**Health Data Persistence:**

```tsx
// Save health data with offline support
const saveHealthData = async (data: HealthData) => {
  try {
    // Save locally first for offline access
    await AsyncStorage.setItem("health_data", JSON.stringify(data));

    // Sync with backend if online
    if (isOnline) {
      await apiService.saveHealthData(user.id, data);
    } else {
      // Queue for later sync
      await queueForSync("health_data", data);
    }
  } catch (error) {
    console.error("Failed to save health data:", error);
    throw error;
  }
};
```

## Integration Points

### With Authentication System

- Profile screens only accessible to authenticated users
- User data display and management
- Account deletion and data cleanup

### With Scan System

- Mini calendar shows scan history
- Health goals integrate with scan targets
- Symptom tracking correlates with analysis results

### With Subscription System

- Premium status display in profile
- Subscription management in settings
- Premium feature access gating

### With Onboarding System

- Health data screens use onboarding quiz data
- Goals and conditions pre-populated from quiz
- Smooth transition from onboarding to profile

## Customization

### Adding New Health Categories

**Custom Health Metrics:**

```tsx
// Add new health tracking categories
const customHealthMetrics = {
  sleep: {
    title: "Sleep Quality",
    type: "scale",
    range: [1, 10],
    icon: "bed",
    description: "Rate your sleep quality",
  },

  stress: {
    title: "Stress Level",
    type: "scale",
    range: [1, 10],
    icon: "pulse",
    description: "Current stress level",
  },

  exercise: {
    title: "Exercise Frequency",
    type: "frequency",
    options: ["daily", "weekly", "rarely", "never"],
    icon: "fitness",
    description: "How often do you exercise?",
  },
};
```

### Profile Customization Options

**Theme and Display Settings:**

```tsx
const profileCustomizations = {
  theme: {
    title: "App Theme",
    options: ["light", "dark", "auto"],
    current: userPreferences.theme,
  },

  units: {
    title: "Measurement Units",
    options: ["metric", "imperial"],
    current: userPreferences.units,
  },

  language: {
    title: "Language",
    options: ["en", "es", "fr", "de"],
    current: userPreferences.language,
  },
};
```

## Data Export & Privacy

### Data Export Implementation

```tsx
const exportUserData = async () => {
  try {
    const userData = await gatherAllUserData();

    const exportData = {
      profile: userData.profile,
      scans: userData.scanHistory,
      healthGoals: userData.healthGoals,
      conditions: userData.conditions,
      symptoms: userData.symptoms,
      preferences: userData.preferences,
      exportDate: new Date().toISOString(),
    };

    // Generate downloadable file
    const fileUri = await generateDataFile(exportData);

    // Share file with user
    await Share.share({
      url: fileUri,
      title: "PoopAI Data Export",
    });
  } catch (error) {
    console.error("Data export failed:", error);
    Alert.alert("Export Error", "Failed to export data. Please try again.");
  }
};
```

### Account Deletion

```tsx
const deleteUserAccount = async () => {
  try {
    // Delete from backend
    await apiService.deleteAccount(user.id);

    // Clear all local data
    await AsyncStorage.multiRemove([
      "auth_token",
      "user_data",
      "scan_history",
      "health_data",
      "preferences",
    ]);

    // Clear context states
    logout();

    Alert.alert(
      "Account Deleted",
      "Your account and all data have been permanently deleted.",
      [{ text: "OK" }]
    );
  } catch (error) {
    console.error("Account deletion failed:", error);
    Alert.alert(
      "Deletion Error",
      "Failed to delete account. Please contact support."
    );
  }
};
```

## Testing

### Unit Tests

- Profile data loading and display
- Settings toggle functionality
- Health data validation
- Data export generation

### Integration Tests

- Profile screen navigation
- Mini calendar integration
- Settings synchronization
- Health data persistence

### Privacy Tests

- Data export completeness
- Account deletion verification
- Data encryption validation
- GDPR compliance checks

## Troubleshooting

### Common Issues

**Profile not loading:**

- Check authentication status
- Verify user data API endpoints
- Test network connectivity
- Check AsyncStorage permissions

**Settings not saving:**

- Verify backend API connectivity
- Check data validation logic
- Test with different setting combinations
- Monitor for async operation conflicts

**Mini calendar sync issues:**

- Check scan data service integration
- Verify date handling consistency
- Test with different timezones
- Monitor calendar navigation state

**Health data not persisting:**

- Check AsyncStorage write operations
- Verify backend synchronization
- Test offline/online scenarios
- Monitor for data validation errors

### Performance Optimization

- Cache frequently accessed profile data
- Lazy load health data sections
- Optimize mini calendar rendering
- Use proper memo for expensive components

### Privacy & Security

- Encrypt sensitive health data
- Implement proper data access controls
- Regular security audits
- GDPR compliance monitoring
