import { useState, useCallback } from 'react';
import { UploadFlowState, UploadedVideo, BackendResponse } from '../types/upload';
import { videoUploadService } from '../services/videoUploadService';
import { APIError } from '../services/api';

export const useUploadFlow = () => {
  const [state, setState] = useState<UploadFlowState>({
    currentStep: 'select',
    selectedVideo: null,
    backendResponse: null,
    isUploading: false,
    error: null,
  });

  const setSelectedVideo = useCallback((video: UploadedVideo) => {
    setState(prev => ({
      ...prev,
      selectedVideo: video,
      currentStep: 'preview',
      error: null,
    }));
  }, []);

  const startProcessing = useCallback(async (video: UploadedVideo, videoFile: File) => {
    setState(prev => ({
      ...prev,
      currentStep: 'processing',
      isUploading: true,
      error: null,
    }));

    try {
      // Real backend call - upload video and get PII analysis
      const response = await videoUploadService.uploadAndAnalyze(
        videoFile,
        (progress) => {
          // Progress updates could be handled here if needed
          console.log(`Upload progress: ${progress}%`);
        }
      );

      // Convert backend response to frontend format
      const backendResponse: BackendResponse = {
        videoId: response.videoId,
        status: 'completed',
        piiFrames: response.piiFrames.map(frame => ({
          ...frame,
          frameUri: frame.frameUri, // Backend provides image URLs
        })),
        processedVideoUri: null, // No blurred video yet
        processingTime: response.processingTime,
        totalFramesAnalyzed: response.totalFramesAnalyzed,
      };

      setState(prev => ({
        ...prev,
        backendResponse,
        currentStep: 'review',
        isUploading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof APIError 
        ? error.message 
        : 'Processing failed. Please try again.';
        
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isUploading: false,
        currentStep: 'preview',
      }));
    }
  }, []);

  const createProtectedVideo = useCallback(async (filteredPiiFrames: BackendResponse['piiFrames']) => {
    const { backendResponse } = state;
    if (!backendResponse) return;

    setState(prev => ({
      ...prev,
      isUploading: true,
      error: null,
    }));

    try {
      // Second POST - Create protected video with filtered PII objects
      const response = await videoUploadService.createProtectedVideo(
        backendResponse.videoId,
        filteredPiiFrames
      );

      // Update backend response with protected video URL
      const updatedResponse: BackendResponse = {
        ...backendResponse,
        processedVideoUri: response.protectedVideoUri,
      };

      setState(prev => ({
        ...prev,
        backendResponse: updatedResponse,
        isUploading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof APIError 
        ? error.message 
        : 'Failed to create protected video. Please try again.';
        
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isUploading: false,
      }));
    }
  }, [state.backendResponse]);

  const completeUpload = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: 'success',
    }));
  }, []);

  const resetFlow = useCallback(() => {
    setState({
      currentStep: 'select',
      selectedVideo: null,
      backendResponse: null,
      isUploading: false,
      error: null,
    });
  }, []);

  return {
    state,
    setSelectedVideo,
    startProcessing,
    createProtectedVideo,
    completeUpload,
    resetFlow,
  };
};