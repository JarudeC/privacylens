import React, { useState } from 'react';
import { View, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Button from '../../components/ui/Button';
import Typography from '../../components/ui/Typography';
import CaptionModal from '../../components/upload/CaptionModal';
import EditingToolbar from '../../components/upload/EditingToolbar';
import EffectsPanel from '../../components/upload/EffectsPanel';
import { videoUploadService } from '../../lib/services/videoUploadService';
import { UploadedVideo } from '../../lib/types/upload';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function VideoPreviewScreen() {
  const router = useRouter();
  const { videoData } = useLocalSearchParams<{ videoData: string }>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [caption, setCaption] = useState('');
  const [showCaptionModal, setShowCaptionModal] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const video: UploadedVideo = JSON.parse(videoData);

  const player = useVideoPlayer(video.uri, (player) => {
    player.loop = true;
    player.muted = false;
  });

  React.useEffect(() => {
    const timer = setTimeout(() => {
      try {
        if (player && typeof player.play === 'function') {
          player.play();
          setIsPlaying(true);
        }
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
      } catch (error) {
        console.warn('Failed to pause video player:', error);
      }
    };
  }, [player]);

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        try {
          if (player && typeof player.pause === 'function') {
            player.pause();
            setIsPlaying(false);
          }
        } catch (error) {
          console.warn('Failed to pause video player on focus loss:', error);
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

  const continueToNext = async () => {
    if (isUploading) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsUploading(true);
    
    try {
      // Cleanup video player
      if (player && typeof player.pause === 'function') {
        player.pause();
        setIsPlaying(false);
      }
    } catch (error) {
      console.warn('Failed to pause video player before navigation:', error);
    }

    try {
      // Create FormData directly with React Native compatible approach
      const formData = new FormData();
      formData.append('video', {
        uri: video.uri,
        name: video.fileName || 'video.mp4',
        type: video.mimeType || 'video/mp4',
      } as any);

      // Upload to backend and get analysis
      const analysisResult = await videoUploadService.uploadAndAnalyzeFormData(formData);
      
      // Navigate to processing with real data
      router.replace({
        pathname: '/upload/processing',
        params: { 
          videoData: JSON.stringify(video),
          analysisData: JSON.stringify(analysisResult)
        },
      });
    } catch (error) {
      console.error('Upload failed:', error);
      // Navigate to processing anyway - it will handle the error
      router.replace({
        pathname: '/upload/processing',
        params: { 
          videoData: JSON.stringify(video),
          error: error instanceof Error ? error.message : 'Upload failed'
        },
      });
    }
    
    setIsUploading(false);
  };

  const goBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const openCaptionModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowCaptionModal(true);
  };

  const handleCaptionSave = (newCaption: string) => {
    setCaption(newCaption);
    setShowCaptionModal(false);
  };

  const handleCaptionCancel = () => {
    setShowCaptionModal(false);
  };

  const handleToolSelect = (toolId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTool(selectedTool === toolId ? null : toolId);
  };

  const handleEffectChange = (effectId: string, value: number) => {
  };

  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <>
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
          </View>
        </View>

        {/* Bottom Section - Editing Tools and Caption */}
        <View className="px-6 pb-12">
          {/* Editing Tools */}
          <EditingToolbar
            selectedTool={selectedTool}
            onToolSelect={handleToolSelect}
          />

          {/* Effects Panel */}
          <EffectsPanel
            selectedTool={selectedTool}
            onEffectChange={handleEffectChange}
          />

          {/* Caption Section */}
          <TouchableOpacity 
            className="bg-gray-800/50 rounded-2xl p-4 mb-6"
            onPress={openCaptionModal}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1 mr-3">
                {caption ? (
                  <Typography variant="body" className="leading-6">
                    {caption}
                  </Typography>
                ) : (
                  <Typography variant="body" color="gray">
                    Add a caption...
                  </Typography>
                )}
              </View>
              <Ionicons name="create-outline" size={20} color="#8A8A8A" />
            </View>
          </TouchableOpacity>

          {/* Video Stats */}
          <View className="flex-row justify-around mb-8 bg-gray-800/30 rounded-2xl py-4">
            <View className="items-center">
              <Typography variant="caption" color="gray" className="mb-1">
                Duration
              </Typography>
              <Typography variant="body" weight="medium">
                {formatDuration(video.duration / 1000)}
              </Typography>
            </View>
            
            <View className="items-center">
              <Typography variant="caption" color="gray" className="mb-1">
                Quality
              </Typography>
              <Typography variant="body" weight="medium">
                {video.width}p
              </Typography>
            </View>
            
            <View className="items-center">
              <Typography variant="caption" color="gray" className="mb-1">
                Size
              </Typography>
              <Typography variant="body" weight="medium">
                {formatFileSize(video.size)}
              </Typography>
            </View>
          </View>

          {/* Next Button */}
          <Button
            title={isUploading ? "Uploading..." : "Continue"}
            onPress={continueToNext}
            variant="primary"
            size="lg"
            disabled={isUploading}
          />
        </View>
      </View>

      {/* Caption Modal */}
      <CaptionModal
        visible={showCaptionModal}
        initialCaption={caption}
        onSave={handleCaptionSave}
        onCancel={handleCaptionCancel}
      />
    </>
  );
}