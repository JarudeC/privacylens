import React from 'react';
import { View, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Button from '../../components/ui/Button';
import Typography from '../../components/ui/Typography';
import { UploadedVideo, BackendResponse } from '../../lib/types/upload';

export default function UploadSuccessScreen() {
  const router = useRouter();
  const { videoData, responseData } = useLocalSearchParams<{ 
    videoData: string; 
    responseData: string;
  }>();

  const video: UploadedVideo = JSON.parse(videoData);
  const response: BackendResponse = JSON.parse(responseData);

  const uploadAnother = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace('/upload');
  };

  const goHome = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace('/(tabs)');
  };

  const shareVideo = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Implement share functionality
  };

  const getIssuesSummary = () => {
    const types = response.piiFrames.reduce((acc, frame) => {
      frame.detections.forEach(detection => {
        if (!acc.includes(detection.type)) {
          acc.push(detection.type);
        }
      });
      return acc;
    }, [] as string[]);

    return types.map(type => {
      switch (type) {
        case 'credit_card': return 'Credit Cards';
        case 'id_card': return 'ID Cards';
        case 'address': return 'Addresses';
        default: return type;
      }
    }).join(', ');
  };

  return (
    <View className="flex-1 bg-black">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="flex-1 items-center justify-center px-6 pt-20">
          {/* Success Icon */}
          <View className="items-center mb-12">
            <View className="bg-green-500 rounded-full p-8 mb-6">
              <Ionicons name="checkmark" size={48} color="#FFFFFF" />
            </View>
            
            <Typography variant="h1" weight="bold" className="mb-3 text-center">
              Upload Complete!
            </Typography>
            
            <Typography variant="body" color="gray" className="text-center">
              Your video has been successfully uploaded with privacy protection
            </Typography>
          </View>

          {/* Summary Cards */}
          <View className="w-full space-y-4 mb-12" style={{ gap: 16 }}>
            {/* Privacy Protection Summary */}
            <View className="bg-gray-800 rounded-2xl p-4">
              <View className="flex-row items-center mb-3">
                <Ionicons name="shield-checkmark" size={24} color="#4CAF50" />
                <Typography variant="body" weight="semibold" className="ml-3">
                  Privacy Protected
                </Typography>
              </View>
              
              <Typography variant="caption" color="gray" className="mb-2">
                Detected and blurred: {getIssuesSummary()}
              </Typography>
              
              <Typography variant="caption" color="gray">
                {response.piiFrames.length} frame(s) processed in {(response.processingTime / 1000).toFixed(1)}s
              </Typography>
            </View>

            {/* Video Info */}
            <View className="bg-gray-800 rounded-2xl p-4">
              <View className="flex-row items-center mb-3">
                <Ionicons name="videocam" size={24} color="#FE2C55" />
                <Typography variant="body" weight="semibold" className="ml-3">
                  Video Details
                </Typography>
              </View>
              
              <View className="flex-row justify-between">
                <View>
                  <Typography variant="caption" color="gray">
                    Duration
                  </Typography>
                  <Typography variant="caption" weight="medium">
                    {Math.floor(video.duration / 60000)}:{String(Math.floor((video.duration % 60000) / 1000)).padStart(2, '0')}
                  </Typography>
                </View>
                
                <View>
                  <Typography variant="caption" color="gray">
                    Resolution
                  </Typography>
                  <Typography variant="caption" weight="medium">
                    {video.width}×{video.height}
                  </Typography>
                </View>
                
                <View>
                  <Typography variant="caption" color="gray">
                    Size
                  </Typography>
                  <Typography variant="caption" weight="medium">
                    {(video.size / (1024 * 1024)).toFixed(1)} MB
                  </Typography>
                </View>
              </View>
            </View>

            {/* Share Options */}
            <View className="bg-gray-800 rounded-2xl p-4">
              <View className="flex-row items-center mb-3">
                <Ionicons name="share" size={24} color="#00E5FF" />
                <Typography variant="body" weight="semibold" className="ml-3">
                  Share Your Video
                </Typography>
              </View>
              
              <Typography variant="caption" color="gray" className="mb-3">
                Your video is now safe to share publicly
              </Typography>
              
              <Button
                title="Share Video"
                onPress={shareVideo}
                variant="ghost"
                size="md"
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View className="px-6 pb-8">
        <View className="space-y-3" style={{ gap: 12 }}>
          <Button
            title="Upload Another Video"
            onPress={uploadAnother}
            variant="primary"
            size="lg"
          />
          
          <Button
            title="Back to Home"
            onPress={goHome}
            variant="ghost"
            size="lg"
          />
        </View>
      </View>
    </View>
  );
}