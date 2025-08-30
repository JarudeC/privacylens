import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Button from '../../components/ui/Button';
import Typography from '../../components/ui/Typography';
import { videoUploadService } from '../../lib/services/videoUploadService';
import { UploadedVideo, BackendResponse, PIIFrame } from '../../lib/types/upload';

const { width: screenWidth } = Dimensions.get('window');

export default function ReviewFlagsScreen() {
  const router = useRouter();
  const { videoData, analysisData } = useLocalSearchParams<{ 
    videoData: string; 
    analysisData: string;
  }>();
  const [selectedFrame, setSelectedFrame] = useState<PIIFrame | null>(null);
  const [filteredFrames, setFilteredFrames] = useState<PIIFrame[]>([]);
  const [isCreatingProtected, setIsCreatingProtected] = useState(false);
  const [hasNavigated, setHasNavigated] = useState(false);
  
  React.useEffect(() => {
    setFilteredFrames(response.piiFrames);
  }, []);

  const video: UploadedVideo = JSON.parse(videoData);
  const response: BackendResponse = JSON.parse(analysisData);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return '#F44336';
      case 'medium': return '#FF9800'; 
      case 'low': return '#FFC107';
      default: return '#8A8A8A';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return 'warning';
      case 'medium': return 'alert-circle';
      case 'low': return 'information-circle';
      default: return 'help-circle';
    }
  };

  const getPIIIcon = (type: string) => {
    switch (type) {
      case 'credit_card': return 'card';
      case 'car_plate': return 'car';
      default: return 'document';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const minutes = Math.floor(timestamp / 60);
    const seconds = Math.floor(timestamp % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const removeDetection = (frameId: string, detectionIndex: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    setFilteredFrames(prevFrames => 
      prevFrames.map(frame => {
        if (frame.id === frameId) {
          const updatedDetections = frame.detections.filter((_, index) => index !== detectionIndex);
          return { ...frame, detections: updatedDetections };
        }
        return frame;
      }).filter(frame => frame.detections.length > 0) // Remove frames with no detections
    );
    
    // Update selectedFrame if it's the current one
    if (selectedFrame?.id === frameId) {
      const updatedFrame = filteredFrames.find(f => f.id === frameId);
      if (updatedFrame) {
        const updatedDetections = updatedFrame.detections.filter((_, index) => index !== detectionIndex);
        if (updatedDetections.length > 0) {
          setSelectedFrame({ ...updatedFrame, detections: updatedDetections });
        } else {
          setSelectedFrame(null);
        }
      }
    }
  };

  const createProtectedVideo = async () => {
    if (isCreatingProtected || hasNavigated) return;
    
    console.log('🔐 Creating protected video - single call');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsCreatingProtected(true);
    setHasNavigated(true);
    
    router.replace({
      pathname: '/upload/processing',
      params: { 
        videoData: JSON.stringify(video),
        analysisData: JSON.stringify(response),
        filteredFrames: JSON.stringify(filteredFrames),
        mode: 'protect' // Flag to indicate we're creating protected video
      },
    });
  };

  const uploadOriginal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/upload/success',
      params: { 
        videoData: JSON.stringify(video),
        responseData: JSON.stringify({
          ...response,
          piiFrames: filteredFrames // Use filtered frames, not original response
        }),
        uploadType: 'original'
      },
    });
  };

  const goBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Route back to upload screen to restart the process
    router.replace('/upload');
  };

  return (
    <View className="flex-1 bg-black">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-16 pb-6">
        <TouchableOpacity onPress={goBack} className="p-2">
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <Typography variant="h3" weight="semibold">
          Review Detections
        </Typography>
        
        <View className="w-8" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Summary */}
        <View className="px-4 mb-4">
          <View className="bg-gray-800 rounded-2xl p-4">
            <View className="flex-row items-center mb-3">
              <Ionicons name="shield-checkmark" size={24} color="#4CAF50" />
              <Typography variant="body" weight="semibold" className="ml-3">
                Analysis Complete
              </Typography>
            </View>
            
            <Typography variant="caption" color="gray" className="mb-2">
              Found {filteredFrames.length} frame(s) with potential privacy concerns
            </Typography>
            
            <Typography variant="caption" color="gray">
              Processed {response.totalFramesAnalyzed} frames in {(response.processingTime / 1000).toFixed(1)}s
            </Typography>
          </View>
        </View>

        {/* PII Frames */}
        <View className="px-4">
          <Typography variant="h3" weight="semibold" className="mb-4">
            Potential Issues
          </Typography>
          
          <Typography variant="caption" color="gray" className="mb-4">
            Review each detection and tap the ✕ to remove false positives
          </Typography>
          
          {filteredFrames.length === 0 ? (
            <View className="bg-green-900/20 rounded-2xl p-6 border border-green-500/30">
              <View className="items-center">
                <Ionicons name="checkmark-circle" size={48} color="#4CAF50" />
                <Typography variant="body" weight="semibold" className="mt-3 mb-2">
                  No Privacy Concerns Detected
                </Typography>
                <Typography variant="caption" color="gray" className="text-center">
                  All potential issues have been reviewed and removed
                </Typography>
              </View>
            </View>
          ) : null}
          
          {filteredFrames.map((frame, index) => (
            <TouchableOpacity
              key={frame.id}
              className="mb-4"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedFrame(selectedFrame?.id === frame.id ? null : frame);
              }}
              activeOpacity={0.8}
            >
              <View className="bg-gray-800 rounded-2xl overflow-hidden">
                {/* Frame Image */}
                <View className="relative">
                  <Image 
                    source={{ uri: frame.frameUri }}
                    style={{ 
                      width: screenWidth - 32, 
                      height: (screenWidth - 32) * 0.6 
                    }}
                    className="bg-gray-700"
                  />
                  
                  {/* Timestamp Badge */}
                  <View className="absolute top-3 right-3 bg-black/70 rounded-full px-3 py-1">
                    <Typography variant="caption" weight="medium">
                      {formatTimestamp(frame.timestamp)}
                    </Typography>
                  </View>
                </View>

                {/* Detection Summary */}
                <View className="p-4">
                  <View className="flex-row items-center justify-between">
                    <Typography variant="body" weight="semibold">
                      Frame {index + 1}
                    </Typography>
                    
                    <View className="flex-row items-center">
                      <Typography variant="caption" color="gray" className="mr-2">
                        {frame.detections.length} issue(s)
                      </Typography>
                      <Ionicons 
                        name={selectedFrame?.id === frame.id ? "chevron-up" : "chevron-down"} 
                        size={20} 
                        color="#8A8A8A" 
                      />
                    </View>
                  </View>

                  {/* Detection Details */}
                  {selectedFrame?.id === frame.id && (
                    <View className="mt-4 pt-4 border-t border-gray-700">
                      {frame.detections.map((detection, detectionIndex) => (
                        <View key={detectionIndex} className="flex-row items-center mb-3">
                          <View 
                            className="rounded-full p-2 mr-3"
                            style={{ backgroundColor: getSeverityColor(detection.severity) + '20' }}
                          >
                            <Ionicons 
                              name={getPIIIcon(detection.type)} 
                              size={16} 
                              color={getSeverityColor(detection.severity)} 
                            />
                          </View>
                          
                          <View className="flex-1">
                            <Typography variant="caption" weight="medium">
                              {detection.description}
                            </Typography>
                            <Typography variant="caption" color="gray">
                              {Math.round(detection.confidence * 100)}% confidence • {detection.severity} risk
                            </Typography>
                          </View>
                          
                          <TouchableOpacity
                            onPress={() => removeDetection(frame.id, detectionIndex)}
                            className="bg-red-500/20 rounded-full p-2 ml-2"
                            activeOpacity={0.7}
                          >
                            <Ionicons name="close" size={16} color="#F44336" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom spacing */}
        <View className="h-32" />
      </ScrollView>

      {/* Bottom Actions */}
      <View className="px-4 pb-8 bg-black">
        <View className="mb-6 p-4 bg-blue-900/20 rounded-2xl border border-blue-500/30">
          <Typography variant="caption" color="gray" className="text-center mb-2">
            We can create a protected version with only flagged areas blurred
          </Typography>
          <Typography variant="caption" color="gray" className="text-center">
            Remove false positives above, then create your protected video
          </Typography>
        </View>
        
        <View className="space-y-3" style={{ gap: 12 }}>
          {filteredFrames.length > 0 ? (
            <Button
              title={isCreatingProtected 
                ? "Creating Protected Video..." 
                : `Create Protected Video (${filteredFrames.length} areas)`
              }
              onPress={createProtectedVideo}
              variant="primary"
              size="lg"
              disabled={isCreatingProtected}
            />
          ) : (
            <Button
              title="No Protection Needed"
              onPress={uploadOriginal}
              variant="primary"
              size="lg"
            />
          )}
          
          <Button
            title="Upload Original Video"
            onPress={uploadOriginal}
            variant="ghost"
            size="lg"
          />
        </View>
      </View>
    </View>
  );
}