// Simple API types based on actual frontend needs

// Video Upload - First POST request
export interface VideoUploadResponse {
  videoId: string;
  piiFrames: PIIFrame[];
  totalFramesAnalyzed: number;
  processingTime: number;
}

// PII Detection (what frontend already uses)
export interface PIIDetection {
  type: 'credit_card' | 'car_plate';
  confidence: number;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export interface PIIFrame {
  id: string;
  frameUri: string; // Image URL from backend
  timestamp: number;
  detections: PIIDetection[];
}

// Protection Request - Second POST request
export interface ProtectionRequest {
  videoId: string;
  piiFrames: PIIFrame[]; // Only the objects user wants to blur
}

export interface ProtectionResponse {
  protectedVideoUri: string; // The blurred video URL
}

// Error handling
export interface APIError {
  message: string;
  code?: string;
}