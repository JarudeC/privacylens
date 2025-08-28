export interface VideoUploadResponse {
  id: string;
  status: 'processing' | 'completed' | 'failed';
  progressPercentage: number;
  flaggedItems?: FlaggedItem[];
}

export interface FlaggedItem {
  id: string;
  type: 'credit_card' | 'identity_card' | 'address';
  severity: 'low' | 'medium' | 'high';
  description: string;
  timestamp: number;
  thumbnailUrl?: string;
  confidence: number;
}

export interface UploadRequest {
  videoUri: string;
  caption: string;
  userId: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface VideoAnalysisResult {
  videoId: string;
  analysisComplete: boolean;
  flaggedItems: FlaggedItem[];
  processingTime: number;
  overallRisk: 'low' | 'medium' | 'high';
}