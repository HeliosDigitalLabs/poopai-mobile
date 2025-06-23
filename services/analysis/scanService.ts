import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppConfig } from "../../config/app.config";
import {
  generateMockScans,
  getMockScansForDateRange,
} from "../../utils/mockScanData";

export interface ScanData {
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

export class ScanService {
  static async getUserScans(): Promise<ScanData[]> {
    // Development mode: Return mock scan data
    if (AppConfig.isDevelopmentMode && AppConfig.mockData.generateMockHistory) {
      console.log("📊 Development mode: Returning mock scan history");
      return generateMockScans(
        AppConfig.mockData.mockHistoryCount,
        AppConfig.mockData.mockHistoryDaysBack
      );
    }

    // Production mode: Fetch from API
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        throw new Error("No auth token found");
      }

      const response = await fetch(`${AppConfig.api.baseUrl}/api/user/scans`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch scans: ${response.status}`);
      }

      const scans: ScanData[] = await response.json();
      return scans;
    } catch (error) {
      console.error("Error fetching user scans:", error);
      throw error;
    }
  }

  static async deleteScan(scanId: string): Promise<void> {
    // Development mode: Just log the deletion (since it's mock data)
    if (AppConfig.isDevelopmentMode) {
      console.log(`📊 Development mode: Mock deleting scan ${scanId}`);
      return;
    }

    // Production mode: Delete from API
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        throw new Error("No auth token found");
      }

      const response = await fetch(
        `${AppConfig.api.baseUrl}/api/user/scan/${scanId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete scan: ${response.status}`);
      }
    } catch (error) {
      console.error("Error deleting scan:", error);
      throw error;
    }
  }

  /**
   * Groups scans by date for calendar display
   */
  static groupScansByDate(scans: ScanData[]): Record<string, ScanData[]> {
    const grouped: Record<string, ScanData[]> = {};

    scans.forEach((scan) => {
        // ✅ NEW — convert to local date string
        const scanDate = new Date(scan.created_at);
        const date =
          scanDate.getFullYear() +
          "-" +
          String(scanDate.getMonth() + 1).padStart(2, "0") +
          "-" +
          String(scanDate.getDate()).padStart(2, "0");

        if (!grouped[date]) {
          grouped[date] = [];
        }
        grouped[date].push(scan);
      });

      return grouped;
    }

  /**
   * Gets scan dates for a specific month (for calendar highlighting)
   */
  static getScanDatesForMonth(
    scans: ScanData[],
    year: number,
    month: number
  ): string[] {
    const monthStr = month.toString().padStart(2, "0");
    const yearMonth = `${year}-${monthStr}`;

    return scans
      .filter((scan) => scan.created_at.startsWith(yearMonth))
      .map((scan) => scan.created_at.split("T")[0]);
  }

  /**
   * Gets scans for a specific date range (useful for calendar and history views)
   */
  static async getScansForDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<ScanData[]> {
    // Development mode: Generate mock data for the date range
    if (AppConfig.isDevelopmentMode && AppConfig.mockData.generateMockHistory) {
      console.log(
        `📊 Development mode: Generating mock scans for date range ${startDate.toISOString().split("T")[0]} to ${endDate.toISOString().split("T")[0]}`
      );
      return getMockScansForDateRange(startDate, endDate);
    }

    // Production mode: Get all scans and filter by date range
    const allScans = await this.getUserScans();
    return allScans.filter((scan) => {
      const scanDate = new Date(scan.created_at);
      return scanDate >= startDate && scanDate <= endDate;
    });
  }

  /**
   * Fetches a signed URL for a scan image (call only when displaying the image)
   */
  static async getSignedImageUrl(imageKey: string): Promise<string> {
    const token = await AsyncStorage.getItem("authToken");
    if (!token) throw new Error("No auth token found");
    const response = await fetch(
      `${AppConfig.api.baseUrl}/api/user/image-url?filename=${encodeURIComponent(
        imageKey
      )}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch signed image URL: ${response.status}`);
    }
    const data = await response.json();
    return data.url;
  }
}
