/**
 * Analysis API Service
 *
 * This service handles all communication with the backend server for image analysis.
 * It includes both production API calls and development mode mock responses.
 */

import { AppConfig } from "../../config/app.config";
import { getDeviceId } from "../../utils/deviceId";
import * as FileSystem from "expo-file-system";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  AnalyzeImageRequest,
  AnalyzeImageResponse,
  AnalysisData,
  ApiError,
} from "../../types/api";

/**
 * Mock analysis data for development mode
 */
const MOCK_ANALYSIS_RESPONSE: AnalyzeImageResponse = {
  bristolName: "Jimmy's Smooth Sausage",
  score: 7.9,
  bristolType: 4,
  poopSummary:
    "The poop appears well-formed and consistent. Slightly darker than ideal. Suggests mild dehydration but overall excellent digestive health indicators.",
  stoolDescription:
    "Well-formed cylindrical shape with smooth surface texture. Consistent diameter throughout length.",
  hydrationJudgement:
    "Slightly darker brown coloration suggests mild dehydration. Texture appears adequately moist but could benefit from increased water intake.",
  fiberJudgement:
    "Good fiber content evident from well-formed structure. Indicates adequate dietary fiber intake supporting healthy digestion.",
  recommendation:
    "💧 Increase daily water intake to 8-10 glasses. Consider adding more leafy greens to your diet for optimal hydration and fiber balance.",
  capturedAt: new Date().toISOString(),
  scan_id: "mock-scan-id-12345",
};

/**
 * Mock "no poop detected" response for development mode testing
 */
const MOCK_NO_POOP_RESPONSE: AnalyzeImageResponse = {
  bristolName: "Unrecognized",
  score: 0,
  bristolType: 0,
  poopSummary: "Image does not appear to contain poop.",
  stoolDescription: "",
  hydrationJudgement: "",
  fiberJudgement: "",
  recommendation: "",
  capturedAt: new Date().toISOString(),
  scan_id: "mock-no-poop-scan-id",
};

/**
 * Compresses and converts an image URI to base64 string with retry logic and timeout safeguards
 */
async function convertImageToBase64(imageUri: string): Promise<string> {
  const MAX_RETRIES = 3;
  const TIMEOUT_MS = 12000; // 12 seconds timeout

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(
        `🖼️ Starting image compression (attempt ${attempt}/${MAX_RETRIES})...`
      );

      // Create a promise that will be resolved/rejected by the compression process
      const compressionPromise = new Promise<string>(
        async (resolve, reject) => {
          try {
            // First compress the image to reduce size
            const compressedImage = await manipulateAsync(
              imageUri,
              [{ resize: { width: 1024 } }], // Resize to max width of 1024px to reduce file size
              {
                compress: 0.7, // 70% quality - good balance between quality and size
                format: SaveFormat.JPEG,
              }
            );

            console.log(
              "📏 Image compressed from original to:",
              compressedImage.uri
            );

            // Then convert compressed image to base64
            const base64 = await FileSystem.readAsStringAsync(
              compressedImage.uri,
              {
                encoding: FileSystem.EncodingType.Base64,
              }
            );

            // Log size for debugging
            const sizeInMB = (base64.length * 0.75) / (1024 * 1024); // Approximate size in MB
            console.log(`📊 Compressed image size: ~${sizeInMB.toFixed(2)}MB`);

            resolve(base64);
          } catch (error) {
            reject(error);
          }
        }
      );

      // Create a timeout promise that will reject after TIMEOUT_MS
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(
            new Error(
              `Image compression timed out after ${TIMEOUT_MS / 1000} seconds`
            )
          );
        }, TIMEOUT_MS);
      });

      // Race between compression and timeout
      const result = await Promise.race([compressionPromise, timeoutPromise]);

      console.log(
        `✅ Image compression completed successfully on attempt ${attempt}`
      );
      return result;
    } catch (error) {
      console.error(
        `❌ Image compression failed on attempt ${attempt}:`,
        error
      );

      // If this was the last attempt, throw a user-friendly error
      if (attempt === MAX_RETRIES) {
        console.error(`🚫 All ${MAX_RETRIES} compression attempts failed`);
        throw new Error(
          "There was an issue processing your image. Please try taking the photo again."
        );
      }

      // Wait a bit before retrying (progressive backoff)
      const backoffDelay = attempt * 1000; // 1s, 2s, 3s delays
      console.log(`⏳ Waiting ${backoffDelay}ms before retry...`);
      await new Promise((resolve) => setTimeout(resolve, backoffDelay));
    }
  }

  // This should never be reached, but TypeScript requires it
  throw new Error("Unexpected error in image compression retry loop");
}

/**
 * Makes the actual API call to analyze the image
 */
async function makeApiCall(
  deviceId: string,
  imageUri: string
): Promise<AnalyzeImageResponse> {
  console.log(
    "Making API call to:",
    `${AppConfig.api.baseUrl}${AppConfig.api.endpoints.analyzeImage}`
  );

  // Convert image to base64
  const base64Image = await convertImageToBase64(imageUri);

  const requestBody = {
    deviceId,
    image: base64Image,
  };

  // Get auth token if available
  const token = await AsyncStorage.getItem("authToken");

  // Build headers with optional authorization
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
    console.log("Including auth token in request");
  } else {
    console.log("No auth token found, proceeding without authentication");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AppConfig.api.timeout);

  try {
    const response = await fetch(
      `${AppConfig.api.baseUrl}${AppConfig.api.endpoints.analyzeImage}`,
      {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers,
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    // Log response details for debugging
    console.log("Response status:", response.status);
    console.log("Response headers:", response.headers);

    // Get response text first to see what we're actually receiving
    const responseText = await response.text();
    console.log("Raw response:", responseText.substring(0, 200)); // First 200 chars

    if (!response.ok) {
      console.error("API returned error status:", response.status);
      console.error("Response body:", responseText);
      throw new Error(`API Error ${response.status}: ${responseText}`);
    }

    // Try to parse as JSON
    try {
      const responseData = JSON.parse(responseText);
      console.log("API response parsed successfully");
      console.log(
        "🔍 Raw server response:",
        JSON.stringify(responseData, null, 2)
      );
      console.log("📋 Root-level scan_id from response:", responseData.scan_id);

      // Extract analysis data from the wrapped response
      if (responseData.analysis) {
        const analysis = responseData.analysis as AnalyzeImageResponse;
        // Add scan_id from the root level response to the analysis object
        analysis.scan_id = responseData.scan_id;
        console.log(
          "📋 Analysis scan_id received from server:",
          analysis.scan_id
        );
        console.log(
          "🔍 Analysis object from server:",
          JSON.stringify(analysis, null, 2)
        );
        return analysis;
      } else {
        // If no analysis wrapper, assume direct response (for backward compatibility)
        const analysis = responseData as AnalyzeImageResponse;
        console.log(
          "📋 Analysis scan_id received from server:",
          analysis.scan_id
        );
        console.log(
          "🔍 Direct analysis response from server:",
          JSON.stringify(analysis, null, 2)
        );
        return analysis;
      }
    } catch (parseError) {
      console.error("Failed to parse JSON response:", parseError);
      console.error("Response was:", responseText);
      throw new Error(
        `Invalid JSON response: ${responseText.substring(0, 100)}`
      );
    }
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request timeout - please try again");
    }
    throw error;
  }
}

/**
 * Simulates API call with mock data for development mode
 */
async function getMockAnalysis(): Promise<AnalyzeImageResponse> {
  console.log("🔧 DEVELOPMENT MODE: Using mock analysis data");

  // Simulate network delay
  await new Promise((resolve) =>
    setTimeout(resolve, AppConfig.mockData.analysisDelay)
  );

  // Check if we should force "no poop detected" response for testing
  if (AppConfig.mockData.forceNoPoopDetected) {
    console.log(
      "🔧 MOCK: Returning 'no poop detected' response (forced by config)"
    );
    return MOCK_NO_POOP_RESPONSE;
  }

  // For random testing, uncomment the lines below to get "no poop" response 20% of the time:
  // if (Math.random() < 0.2) {
  //   console.log("🔧 MOCK: Returning 'no poop detected' response for testing");
  //   return MOCK_NO_POOP_RESPONSE;
  // }

  return MOCK_ANALYSIS_RESPONSE;
}

/**
 * Generates frontend-only data that doesn't come from the server
 */
function generateFrontendData(
  imageUri: string
): Pick<AnalysisData, "maxScore" | "timestamp" | "photo"> {
  return {
    maxScore: 10,
    timestamp: new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
    photo: imageUri,
  };
}

/**
 * Main function to analyze an image
 *
 * This function handles the complete image analysis flow:
 * 1. Gets device ID for authentication
 * 2. Either makes real API call or uses mock data based on development mode
 * 3. Combines server response with frontend-generated data
 *
 * @param imageUri - The URI of the image to analyze
 * @returns Promise<AnalysisData> - Complete analysis data for the results screen
 */
export async function analyzeImage(imageUri: string): Promise<AnalysisData> {
  try {
    console.log("🚀 Starting image analysis process...");
    console.log("Image URI:", imageUri.substring(0, 50) + "...");

    // Get device ID for authentication
    const deviceId = await getDeviceId();
    console.log("Device ID obtained for analysis");

    // Get analysis data (either from API or mock)
    let analysisResponse: AnalyzeImageResponse;

    if (AppConfig.isDevelopmentMode) {
      analysisResponse = await getMockAnalysis();
    } else {
      analysisResponse = await makeApiCall(deviceId, imageUri);
    }

    // Generate frontend-only data
    const frontendData = generateFrontendData(imageUri);

    // Combine server response with frontend data, mapping scan_id to id
    const completeAnalysis: AnalysisData = {
      ...analysisResponse,
      id: analysisResponse.scan_id, // Map scan_id from backend to id for frontend
      ...frontendData,
    };

    console.log("✅ Image analysis completed successfully");
    console.log("📋 Complete analysis data - ID:", completeAnalysis.id);
    console.log(
      "📋 Full analysis data:",
      JSON.stringify(completeAnalysis, null, 2)
    );
    console.log("Analysis score:", completeAnalysis.score);

    return completeAnalysis;
  } catch (error) {
    console.error("❌ Image analysis failed:", error);

    // If the error is from our compression retry logic, pass the user-friendly message through
    if (
      error instanceof Error &&
      error.message.includes("There was an issue processing your image")
    ) {
      throw error; // Pass through the user-friendly error message
    }

    // For other errors, provide a generic message
    throw new Error(
      `Analysis failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Checks if the analysis service is ready
 * In production mode, this could ping the server to check availability
 */
export async function isAnalysisServiceReady(): Promise<boolean> {
  if (AppConfig.isDevelopmentMode) {
    console.log("🔧 DEVELOPMENT MODE: Analysis service always ready");
    return true;
  }

  try {
    // In production, you might want to ping the server health endpoint
    console.log("Checking analysis service availability...");
    // const response = await fetch(`${AppConfig.api.baseUrl}/health`);
    // return response.ok;
    return true; // For now, assume always ready
  } catch (error) {
    console.error("Analysis service check failed:", error);
    return false;
  }
}
