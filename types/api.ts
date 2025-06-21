/**
 * API Type Definitions
 * 
 * This file contains TypeScript type definitions for all API requests
 * and responses used in the PoopAI application.
 */

/**
 * Request payload for image analysis
 */
export interface AnalyzeImageRequest {
  deviceId: string;
  imageUri: string;
}

/**
 * Server response from image analysis
 */
export interface AnalyzeImageResponse {
  bristolName: string;
  score: number;
  bristolType: number;
  poopSummary: string;
  stoolDescription: string;
  hydrationJudgement: string;
  fiberJudgement: string;
  recommendation: string;
  capturedAt: string; // Server timestamp - not used yet but handled
}

/**
 * Complete analysis data used by the frontend (matches server response + frontend-generated data)
 */
export interface AnalysisData {
  // Server response fields (used directly)
  bristolName: string;
  score: number;
  bristolType: number;
  poopSummary: string;
  stoolDescription: string;
  hydrationJudgement: string;
  fiberJudgement: string;
  recommendation: string;
  capturedAt: string;
  
  // Frontend-generated data
  maxScore: number;
  timestamp: string;
  photo: string;
}

/**
 * API Error Response
 */
export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}
