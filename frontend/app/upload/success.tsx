import React from 'react';
import { View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Button from '../../components/ui/Button';
import Typography from '../../components/ui/Typography';
import { UploadedVideo, BackendResponse } from '../../lib/types/upload';

export default function UploadSuccessScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { videoData, responseData, uploadType } = useLocalSearchParams<{ 
    videoData: string; 
    responseData: string;
    uploadType: 'original' | 'blurred';
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
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingBottom: Math.max(insets.bottom, 20)
        }}
      >
        <View className="flex-1 items-center justify-center px-6">
          {/* Success Icon */}
          <View className="items-center mb-12 mt-8">
            <View className={`${uploadType === 'original' ? 'bg-orange-500' : 'bg-green-500'} rounded-full p-8 mb-6`}>
              <Ionicons name={uploadType === 'original' ? "warning" : "checkmark"} size={48} color="#FFFFFF" />
            </View>
            
            <Typography variant="h1" weight="bold" className="mb-3 text-center">
              {uploadType === 'original' ? 'Upload Complete!' : 'Protected Upload Complete!'}
            </Typography>
            
            <Typography variant="body" color="gray" className="text-center">
              {uploadType === 'original' 
                ? 'Your original video has been uploaded with detected privacy risks'
                : 'Your video has been successfully uploaded with privacy protection'
              }
            </Typography>
          </View>

          {/* Summary Cards */}
          <View className="w-full space-y-4 mb-12" style={{ gap: 16 }}>
            {/* Privacy Summary */}
            <View className={`rounded-2xl p-4 ${uploadType === 'original' ? 'bg-orange-900/20 border border-orange-500/30' : 'bg-gray-800'}`}>
              <View className="flex-row items-center mb-3">
                <Ionicons 
                  name={uploadType === 'original' ? "shield-outline" : "shield-checkmark"} 
                  size={24} 
                  color={uploadType === 'original' ? "#FF9800" : "#4CAF50"} 
                />
                <Typography variant="body" weight="semibold" className="ml-3">
                  {uploadType === 'original' ? 'Security Risks Detected' : 'Privacy Protected'}
                </Typography>
              </View>
              
              <Typography variant="caption" color="gray" className="mb-2">
                {uploadType === 'original' 
                  ? `Detected but NOT protected: ${getIssuesSummary()}`
                  : `Detected and blurred: ${getIssuesSummary()}`
                }
              </Typography>
              
              <Typography variant="caption" color="gray">
                {uploadType === 'original' 
                  ? `${response.piiFrames.length} issue(s) detected` 
                  : `${response.piiFrames.length} area(s) protected`
                } in {(response.processingTime / 1000).toFixed(1)}s
              </Typography>
              
              {uploadType === 'original' && (
                <View className="mt-3 p-3 bg-orange-500/10 rounded-lg">
                  <Typography variant="caption" className="text-orange-300">
                    ⚠️ Warning: Your video contains sensitive information that is visible to viewers
                  </Typography>
                </View>
              )}
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
                <Ionicons 
                  name={uploadType === 'original' ? "warning-outline" : "share"} 
                  size={24} 
                  color={uploadType === 'original' ? "#FF9800" : "#00E5FF"} 
                />
                <Typography variant="body" weight="semibold" className="ml-3">
                  {uploadType === 'original' ? 'Sharing Caution' : 'Share Your Video'}
                </Typography>
              </View>
              
              <Typography variant="caption" color="gray" className="mb-3">
                {uploadType === 'original' 
                  ? 'Be careful sharing - sensitive information is still visible'
                  : 'Your video is now safe to share publicly'
                }
              </Typography>
              
              <Button
                title={uploadType === 'original' ? "Share with Caution" : "Share Video"}
                onPress={shareVideo}
                variant={uploadType === 'original' ? "secondary" : "ghost"}
                size="md"
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View className="px-6" style={{ paddingBottom: Math.max(insets.bottom, 20) }}>
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