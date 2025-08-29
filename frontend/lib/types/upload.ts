export interface UploadedVideo {
  id: string;
  uri: string;
  duration: number;
  width: number;
  height: number;
  size: number;
  fileName?: string;
  mimeType?: string;
}

export interface PIIDetection {
  type: 'credit_card' | 'id_card' | 'address';
  confidence: number;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export interface PIIFrame {
  id: string;
  frameUri: string; // Snapshot image from backend
  timestamp: number; // Time in video where PII was detected
  detections: PIIDetection[]; // What PII was found in this frame
}

export interface BackendResponse {
  videoId: string;
  status: 'processing' | 'completed' | 'failed';
  piiFrames: PIIFrame[]; // Screenshots with PII detection
  processedVideoUri?: string; // Pre-blurred video from backend
  processingTime: number;
  totalFramesAnalyzed: number;
}

export interface UploadFlowState {
  currentStep: 'select' | 'preview' | 'processing' | 'review' | 'success';
  selectedVideo: UploadedVideo | null;
  backendResponse: BackendResponse | null;
  isUploading: boolean;
  error: string | null;
}

export type UploadStackParamList = {
  UploadVideo: undefined;
  VideoPreview: { video: UploadedVideo };
  Processing: { video: UploadedVideo };
  ReviewFlags: { video: UploadedVideo; response: BackendResponse };
  UploadSuccess: { video: UploadedVideo; response: BackendResponse };
};