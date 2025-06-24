/**
 * API Type Definitions
<<<<<<< HEAD
 *
=======
 * 
>>>>>>> 5a9bbd588055ef2a2b282113038f674c9f6c7304
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
<<<<<<< HEAD
  scan_id: string; // Analysis ID from the database (backend sends as scan_id)
=======
>>>>>>> 5a9bbd588055ef2a2b282113038f674c9f6c7304
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
<<<<<<< HEAD
  id?: string; // Analysis ID from the database (optional for backward compatibility)
=======
>>>>>>> 5a9bbd588055ef2a2b282113038f674c9f6c7304
  bristolName: string;
  score: number;
  bristolType: number;
  poopSummary: string;
  stoolDescription: string;
  hydrationJudgement: string;
  fiberJudgement: string;
  recommendation: string;
  capturedAt: string;
<<<<<<< HEAD

=======
  
>>>>>>> 5a9bbd588055ef2a2b282113038f674c9f6c7304
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
