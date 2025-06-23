#!/usr/bin/env node

/**
 * Validation script to check if Google/Apple authentication is properly configured
 * Run with: node scripts/validateSocialAuth.js
 */

const fs = require("fs");
const path = require("path");

console.log("🔍 Validating Social Authentication Configuration...\n");

// Check if configuration file exists
const configPath = path.join(__dirname, "../config/socialAuthConfig.ts");
if (!fs.existsSync(configPath)) {
  console.error("❌ config/socialAuthConfig.ts not found");
  process.exit(1);
}

// Read configuration file
const configContent = fs.readFileSync(configPath, "utf-8");

// Validation checks
const checks = [
  {
    name: "Google Web Client ID",
    test: () =>
      !configContent.includes("YOUR_WEB_CLIENT_ID_HERE") &&
      !configContent.includes("70a62df1"),
    fix: "Replace webClientId with your actual Google Cloud Console web client ID",
  },
  {
    name: "Google iOS Client ID",
    test: () =>
      !configContent.includes("YOUR_IOS_CLIENT_ID_HERE") &&
      !configContent.includes("70a62df1"),
    fix: "Replace iosClientId with your actual Google Cloud Console iOS client ID",
  },
  {
    name: "GoogleService-Info.plist",
    test: () =>
      fs.existsSync(path.join(__dirname, "../GoogleService-Info.plist")),
    fix: "Download GoogleService-Info.plist from Google Cloud Console and place in project root",
  },
  {
    name: "app.json iOS Bundle ID",
    test: () => {
      const appJsonPath = path.join(__dirname, "../app.json");
      if (!fs.existsSync(appJsonPath)) return false;
      const appJson = JSON.parse(fs.readFileSync(appJsonPath, "utf-8"));
      return appJson.expo?.ios?.bundleIdentifier === "com.trypoopai.app";
    },
    fix: "Ensure iOS bundleIdentifier in app.json matches your Apple Developer Console configuration",
  },
  {
    name: "Apple Sign-In Capability",
    test: () => {
      const appJsonPath = path.join(__dirname, "../app.json");
      if (!fs.existsSync(appJsonPath)) return false;
      const appJson = JSON.parse(fs.readFileSync(appJsonPath, "utf-8"));
      return appJson.expo?.ios?.usesAppleSignIn === true;
    },
    fix: "Enable Apple Sign-In in app.json and Apple Developer Console",
  },
];

let allPassed = true;

checks.forEach((check) => {
  try {
    const passed = check.test();
    if (passed) {
      console.log(`✅ ${check.name}`);
    } else {
      console.log(`❌ ${check.name}`);
      console.log(`   Fix: ${check.fix}\n`);
      allPassed = false;
    }
  } catch (error) {
    console.log(`❌ ${check.name} (Error: ${error.message})`);
    console.log(`   Fix: ${check.fix}\n`);
    allPassed = false;
  }
});

console.log("\n" + "=".repeat(50));

if (allPassed) {
  console.log("🎉 All social authentication checks passed!");
  console.log("You should now be able to build and test Google/Apple sign-in.");
} else {
  console.log("⚠️  Some configuration issues found.");
  console.log("Please fix the issues above and run this script again.");
  console.log("\nFor detailed setup instructions, see:");
  console.log("docs/google-apple-auth-setup.md");
}

console.log("\nNext steps:");
console.log("1. Fix any configuration issues above");
console.log("2. Run: eas build --platform ios --profile development");
console.log("3. Install the build on a physical device");
console.log("4. Test Google/Apple sign-in functionality");

process.exit(allPassed ? 0 : 1);
