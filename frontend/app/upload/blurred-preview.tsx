import React, { useState } from 'react';
import { View, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Button from '../../components/ui/Button';
import Typography from '../../components/ui/Typography';
import { UploadedVideo, BackendResponse } from '../../lib/types/upload';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function BlurredPreviewScreen() {
  const router = useRouter();
  const { videoData, responseData } = useLocalSearchParams<{ 
    videoData: string; 
    responseData: string;
  }>();
  const [isPlaying, setIsPlaying] = useState(false);

  const video: UploadedVideo = JSON.parse(videoData);
  const response: BackendResponse = JSON.parse(responseData);

  // Use the protected video URI from backend response (now with streaming support)
  const blurredVideoUri = response.processedVideoUri || video.uri;

  const player = useVideoPlayer(blurredVideoUri, (player) => {
    player.loop = true;
    player.muted = false;
  });

  // Add error handling for video loading
  React.useEffect(() => {
    if (player) {
      player.addListener('statusChange', (status) => {
        if (status.error) {
          console.error('Video player error:', status.error);
        }
      });
    }
  }, [player]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      try {
        player.play();
        setIsPlaying(true);
      } catch (error) {
        console.warn('Failed to play video:', error);
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      try {
        if (player && typeof player.pause === 'function') {
          player.pause();
        }
        if (player && typeof player.release === 'function') {
          player.release();
        }
      } catch (error) {
        console.warn('Failed to cleanup video player:', error);
      }
    };
  }, [player]);

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        try {
          if (player && typeof player.pause === 'function') {
            player.pause();
          }
          if (player && typeof player.release === 'function') {
            player.release();
          }
        } catch (error) {
          console.warn('Failed to cleanup video player on focus loss:', error);
        }
      };
    }, [player])
  );

  const togglePlayback = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      if (isPlaying) {
        if (player && typeof player.pause === 'function') {
          player.pause();
        }
      } else {
        if (player && typeof player.play === 'function') {
          player.play();
        }
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.warn('Failed to toggle playback:', error);
    }
  };

  const uploadBlurredVideo = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      if (player && typeof player.pause === 'function') {
        player.pause();
      }
      if (player && typeof player.release === 'function') {
        player.release();
      }
    } catch (error) {
      console.warn('Failed to cleanup video player before navigation:', error);
    }
    
    router.push({
      pathname: '/upload/success',
      params: { 
        videoData: JSON.stringify(video),
        responseData: JSON.stringify(response),
        uploadType: 'blurred'
      },
    });
  };

  const goBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const getDetectionLabel = (type: string) => {
    switch (type) {
      case 'credit_card': return 'Credit Card';
      case 'car_plate': return 'License Plate';
      default: return type;
    }
  };

  return (
    <View className="flex-1 bg-black">
      {/* Back Button - Floating */}
      <View className="absolute top-16 left-4 z-10">
        <TouchableOpacity 
          onPress={goBack} 
          className="bg-black/50 rounded-full p-3"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 5,
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Video Player - Top Section */}
      <View className="flex-1 px-6 pt-28 pb-4">
        <View 
          className="relative rounded-3xl overflow-hidden bg-gray-900 flex-1"
          style={{ 
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 12,
          }}
        >
          <VideoView
            style={{ flex: 1 }}
            player={player}
            allowsFullscreen={false}
            allowsPictureInPicture={false}
            contentFit="contain"
            onLoad={() => console.log('✅ Protected video loaded successfully')}
            onError={(error) => console.error('❌ Protected video failed to load:', error)}
          />
          
          {/* Play/Pause Overlay */}
          <TouchableOpacity
            className="absolute inset-0 items-center justify-center"
            onPress={togglePlayback}
            activeOpacity={0.7}
          >
            {!isPlaying && (
              <View className="bg-black/60 rounded-full p-6">
                <Ionicons name="play" size={48} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>

          {/* Protected Badge */}
          <View className="absolute top-4 right-4 bg-green-600 rounded-full px-3 py-1">
            <Typography variant="caption" weight="semibold" className="text-white">
              Privacy Protected
            </Typography>
          </View>
        </View>
      </View>

      {/* Bottom Section */}
      <View className="px-6 pb-12">
        {/* Info Card */}
        <View className="bg-green-900/20 rounded-2xl p-4 mb-6 border border-green-500/30">
          <View className="flex-row items-center mb-3">
            <Ionicons name="shield-checkmark" size={24} color="#4CAF50" />
            <Typography variant="body" weight="semibold" className="ml-3">
              Sensitive Areas Protected
            </Typography>
          </View>
          
          <Typography variant="caption" color="gray" className="mb-3">
            Only the detected privacy information has been blurred. The rest of your video remains unchanged.
          </Typography>
          
          <Typography variant="caption" color="gray" className="mb-2">
            Protected items:
          </Typography>
          
          <View className="flex-row flex-wrap" style={{ gap: 8 }}>
            {response.piiFrames.map((frame, index) => 
              frame.detections.map((detection, detectionIndex) => (
                <View 
                  key={`${index}-${detectionIndex}`}
                  className="bg-gray-800 rounded-full px-3 py-1"
                >
                  <Typography variant="caption" className="text-white">
                    {getDetectionLabel(detection.type)}
                  </Typography>
                </View>
              ))
            ).flat()}
          </View>
        </View>

        {/* Upload Actions */}
        <View className="space-y-3" style={{ gap: 12 }}>
          <Button
            title="Upload Protected Video"
            onPress={uploadBlurredVideo}
            variant="primary"
            size="lg"
          />
          
          <View className="items-center">
            <Typography variant="caption" color="gray" className="text-center">
              Your video quality remains the same - only sensitive areas are protected
            </Typography>
          </View>
        </View>
      </View>
    </View>
  );
}