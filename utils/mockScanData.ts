/**
 * Mock Scan Data Generator for Development Mode
 *
 * This utility generates realistic mock scan data for testing the scan context
 * and calendar functionality when the app is in development mode.
 */

import { AppConfig } from "../config/app.config";

export interface MockScanData {
  id: string;
  user_id: string;
  image_url: string;
  analysis: {
    score: number;
    bristolType: number;
    bristolName: string;
    poopSummary: string;
    stoolDescription: string;
    hydrationJudgement: string;
    fiberJudgement: string;
    recommendation: string;
    capturedAt: string;
  };
  created_at: string;
}

// Array of realistic mock analysis data
const MOCK_ANALYSES = [
  {
    score: 8.5,
    bristolType: 4,
    bristolName: "Perfect Sausage",
    poopSummary:
      "Excellent well-formed stool indicating optimal digestive health. Good hydration and fiber balance evident from smooth texture and consistent shape.",
    stoolDescription:
      "Smooth, well-formed cylindrical shape with consistent diameter throughout length.",
    hydrationJudgement:
      "Excellent hydration levels evident from smooth texture and optimal moisture content.",
    fiberJudgement:
      "Perfect fiber content creating ideal form and consistency without being too loose or hard.",
    recommendation:
      "Maintain current diet and hydration habits. This is an excellent example of healthy digestion.",
  },
  {
    score: 6.2,
    bristolType: 3,
    bristolName: "Cracked Log",
    poopSummary:
      "Generally good stool but shows some surface cracks indicating mild dehydration. Fiber content appears adequate but could use slight improvement.",
    stoolDescription:
      "Well-formed but shows surface cracks and slight hardness at edges.",
    hydrationJudgement:
      "Slightly dehydrated - increase water intake by 1-2 glasses per day.",
    fiberJudgement:
      "Adequate fiber but could benefit from more fruits and vegetables in diet.",
    recommendation:
      "Increase water intake and add more fiber-rich foods like berries and leafy greens.",
  },
  {
    score: 4.1,
    bristolType: 6,
    bristolName: "Mushy Mess",
    poopSummary:
      "Loose, mushy consistency suggests possible dietary issues or mild digestive upset. May indicate need for dietary adjustments.",
    stoolDescription:
      "Soft, mushy pieces with poorly defined edges and loose consistency.",
    hydrationJudgement:
      "Potentially overhydrated or absorption issues affecting stool consistency.",
    fiberJudgement:
      "Fiber balance may be off - consider reducing insoluble fiber temporarily.",
    recommendation:
      "Consider probiotics and temporarily reduce dairy and high-fat foods. Monitor for improvement.",
  },
  {
    score: 7.8,
    bristolType: 4,
    bristolName: "Golden Standard",
    poopSummary:
      "Near-perfect stool showing excellent digestive health. Great balance of hydration, fiber, and overall digestive function.",
    stoolDescription:
      "Smooth, banana-like consistency with perfect diameter and length.",
    hydrationJudgement:
      "Optimal hydration levels creating perfect moisture balance in stool.",
    fiberJudgement:
      "Excellent fiber balance from diverse plant sources creating ideal consistency.",
    recommendation:
      "Keep up the great work! Your current diet and lifestyle are supporting excellent digestive health.",
  },
  {
    score: 5.5,
    bristolType: 2,
    bristolName: "Lumpy Logger",
    poopSummary:
      "Hard, lumpy stool indicating constipation and dehydration. Suggests need for more water and fiber in diet.",
    stoolDescription:
      "Hard, lumpy pieces that are difficult to pass with irregular shape.",
    hydrationJudgement:
      "Significantly dehydrated - stool appears dry and hard throughout.",
    fiberJudgement:
      "Insufficient fiber intake evident from hard, compressed consistency.",
    recommendation:
      "Increase water intake significantly and add more fiber through fruits, vegetables, and whole grains.",
  },
];

/**
 * Generates mock scan data for development mode
 * @param count Number of mock scans to generate
 * @param daysBack How many days back to distribute the scans
 * @returns Array of mock scan data
 */
export const generateMockScans = (
  count: number = 10,
  daysBack: number = 30
): MockScanData[] => {
  if (!AppConfig.isDevelopmentMode) {
    console.warn("⚠️ generateMockScans called in production mode");
    return [];
  }

  const mockScans: MockScanData[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    // Distribute scans randomly over the past daysBack days
    const daysAgo = Math.floor(Math.random() * daysBack);
    const scanDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    // Add some random hours/minutes to make it more realistic
    scanDate.setHours(Math.floor(Math.random() * 16) + 6); // Between 6 AM and 10 PM
    scanDate.setMinutes(Math.floor(Math.random() * 60));

    // Pick a random analysis from our mock data
    const analysis =
      MOCK_ANALYSES[Math.floor(Math.random() * MOCK_ANALYSES.length)];

    // Create mock scan
    const mockScan: MockScanData = {
      id: `mock_scan_${Date.now()}_${i}`,
      user_id: "mock_user_dev",
      image_url: `mock://scan_image_${i}.jpg`,
      analysis: {
        ...analysis,
        capturedAt: scanDate.toISOString(),
      },
      created_at: scanDate.toISOString(),
    };

    mockScans.push(mockScan);
  }

  // Sort by date (newest first)
  mockScans.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  console.log(`📊 Generated ${count} mock scans for development mode`);
  return mockScans;
};

/**
 * Get mock scan data for a specific date range
 * @param startDate Start date for the range
 * @param endDate End date for the range
 * @returns Array of mock scans within the date range
 */
export const getMockScansForDateRange = (
  startDate: Date,
  endDate: Date
): MockScanData[] => {
  if (!AppConfig.isDevelopmentMode) {
    return [];
  }

  // Generate some scans for the date range
  const daysDiff = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const scanCount = Math.min(Math.max(Math.floor(daysDiff / 3), 1), 15); // 1-15 scans depending on range

  return generateMockScans(scanCount, daysDiff);
};

/**
 * Clear all mock scan data (for development testing)
 */
export const clearMockScanData = () => {
  if (!AppConfig.isDevelopmentMode) {
    console.warn("⚠️ clearMockScanData called in production mode");
    return;
  }

  console.log("🧹 Mock scan data cleared for development mode");
  // This could clear AsyncStorage or any local mock data if needed
};

export default {
  generateMockScans,
  getMockScansForDateRange,
  clearMockScanData,
};
