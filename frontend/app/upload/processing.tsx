import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat, 
  withTiming,
  withSequence,
  interpolate
} from 'react-native-reanimated';
import Typography from '../../components/ui/Typography';
import { UploadedVideo, BackendResponse } from '../../lib/types/upload';
import { videoUploadService } from '../../lib/services/videoUploadService';

const AnimatedView = Animated.createAnimatedComponent(View);

export default function ProcessingScreen() {
  const router = useRouter();
  const { videoData, analysisData, error, filteredFrames, mode } = useLocalSearchParams<{ 
    videoData: string;
    analysisData?: string;
    error?: string;
    filteredFrames?: string;
    mode?: string;
  }>();
  const [currentTask, setCurrentTask] = useState('Analysis completed!');
  const [hasStartedProcessing, setHasStartedProcessing] = useState(false);

  const video: UploadedVideo = JSON.parse(videoData);
  const analysis = analysisData ? JSON.parse(analysisData) : null;

  const rotation = useSharedValue(0);
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (hasStartedProcessing) return; // Prevent multiple executions
    setHasStartedProcessing(true);
    
    // Immediately stop all audio playback
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: false,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      playThroughEarpieceAndroid: false
    });

    // Start animations
    rotation.value = withRepeat(
      withTiming(360, { duration: 2000 }),
      -1
    );

    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0, { duration: 1000 })
      ),
      -1
    );

    // Handle backend processing
    if (error) {
      setCurrentTask('Upload failed');
      // Show error for 2 seconds then return to upload
      setTimeout(() => {
        router.replace('/upload');
      }, 2000);
    } else if (mode === 'protect' && analysis && filteredFrames) {
      // Creating protected video
      const createProtectedVideo = async () => {
        try {
          const selectedFrames = JSON.parse(filteredFrames);
          
          setCurrentTask('Creating protected video...');
          
          // Call backend to create protected video
          console.log('📹 Creating protected video...', {
            videoId: analysis.videoId,
            selectedFramesCount: selectedFrames.length
          });
          
          const protectionResponse = await videoUploadService.createProtectedVideo(
            analysis.videoId,
            selectedFrames
          );
          
          console.log('✅ Protected video created:', protectionResponse);
          
          setCurrentTask('Protection completed!');
          
          // Navigate to blurred preview with protected video
          setTimeout(() => {
            const blurredPreviewData = {
              videoData: JSON.stringify(video),
              responseData: JSON.stringify({
                ...analysis,
                piiFrames: selectedFrames,
                processedVideoUri: protectionResponse.protectedVideoUri
              })
            };
            
            console.log('🎬 Navigating to blurred preview with:', blurredPreviewData);
            
            router.replace({
              pathname: '/upload/blurred-preview',
              params: blurredPreviewData
            });
          }, 1000);
          
        } catch (protectionError) {
          console.error('Protection failed:', protectionError);
          setCurrentTask('Protection failed');
          setTimeout(() => {
            router.replace('/upload');
          }, 2000);
        }
      };
      
      createProtectedVideo();
    } else if (analysis) {
      // Already have analysis data, go to review immediately
      setCurrentTask('Analysis completed!');
      
      setTimeout(() => {
        router.replace({
          pathname: '/upload/review',
          params: { 
            videoData: JSON.stringify(video),
            analysisData: JSON.stringify(analysis)
          },
        });
      }, 1500);
    } else {
      // Need to call backend API
      const processVideo = async () => {
        try {
          setCurrentTask('Uploading video...');
          
          // Create FormData for upload
          const formData = new FormData();
          formData.append('video', {
            uri: video.uri,
            name: video.fileName || 'video.mp4',
            type: video.mimeType || 'video/mp4',
          } as any);

          setCurrentTask('Analyzing video...');
          
          // Upload to backend and get analysis
          const analysisResult = await videoUploadService.uploadAndAnalyzeFormData(formData);
          
          setCurrentTask('Analysis completed!');
          
          // Navigate to review with analysis data
          setTimeout(() => {
            router.replace({
              pathname: '/upload/review',
              params: { 
                videoData: JSON.stringify(video),
                analysisData: JSON.stringify(analysisResult)
              },
            });
          }, 1000);
          
        } catch (uploadError) {
          console.error('Backend processing failed:', uploadError);
          setCurrentTask('Processing failed');
          setTimeout(() => {
            router.replace('/upload');
          }, 2000);
        }
      };

      processVideo();
    }
  }, [analysis, error]);

  const rotationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const pulseStyle = useAnimatedStyle(() => {
    const scale = interpolate(pulse.value, [0, 1], [1, 1.1]);
    const opacity = interpolate(pulse.value, [0, 1], [0.3, 0.1]);
    
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <View className="flex-1 bg-black items-center justify-center px-6">
      {/* Animated Loading Icon */}
      <View className="items-center mb-12">
        {/* Outer pulse ring */}
        <AnimatedView 
          className="absolute bg-primary rounded-full"
          style={[{ width: 120, height: 120 }, pulseStyle]}
        />
        
        {/* Main loading icon */}
        <AnimatedView style={rotationStyle}>
          <View className="bg-primary rounded-full p-8">
            <Ionicons name="shield-checkmark" size={48} color="#FFFFFF" />
          </View>
        </AnimatedView>
      </View>

      {/* Status Info */}
      <View className="items-center space-y-6" style={{ gap: 24 }}>
        <Typography variant="h2" weight="bold" className="text-center">
          Analyzing Your Video
        </Typography>

        <Typography variant="body" color="gray" className="text-center">
          {currentTask}
        </Typography>

        <View className="mt-4">
          <Typography variant="caption" color="gray" className="text-center">
            Scanning for privacy-sensitive content
          </Typography>
        </View>
      </View>
    </View>
  );
}