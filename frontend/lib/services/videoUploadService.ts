import { apiClient } from './api';
import { VideoUploadResponse, ProtectionRequest, ProtectionResponse } from '../types/api';

class VideoUploadService {
  // First POST - Upload video and get PII analysis
  async uploadAndAnalyze(
    videoFile: File,
    onProgress?: (progress: number) => void
  ): Promise<VideoUploadResponse> {
    const formData = new FormData();
    formData.append('video', videoFile);

    try {
      const response = await apiClient.uploadWithProgress<VideoUploadResponse>(
        '/api/v1/video/upload',
        formData,
        onProgress
      );
      return response;
    } catch (error) {
      console.error('Video upload failed:', error);
      throw error;
    }
  }

  // React Native compatible upload method
  async uploadAndAnalyzeFormData(
    formData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<VideoUploadResponse> {
    try {
      const response = await apiClient.uploadWithProgress<VideoUploadResponse>(
        '/api/v1/video/upload',
        formData,
        onProgress
      );
      return response;
    } catch (error) {
      console.error('Video upload failed:', error);
      throw error;
    }
  }

  // Second POST - Create protected video with selected PII objects
  async createProtectedVideo(
    videoId: string,
    piiToProtect: ProtectionRequest['piiFrames']
  ): Promise<ProtectionResponse> {
    try {
      const response = await apiClient.post<ProtectionResponse>(
        '/api/v1/video/protect',
        {
          videoId,
          piiFrames: piiToProtect
        }
      );
      return response;
    } catch (error) {
      console.error('Video protection failed:', error);
      throw error;
    }
  }
}

export const videoUploadService = new VideoUploadService();