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

const AnimatedView = Animated.createAnimatedComponent(View);

export default function ProcessingScreen() {
  const router = useRouter();
  const { videoData, analysisData, error } = useLocalSearchParams<{ 
    videoData: string;
    analysisData?: string;
    error?: string;
  }>();
  const [progress, setProgress] = useState(100);
  const [currentTask, setCurrentTask] = useState('Analysis completed!');

  const video: UploadedVideo = JSON.parse(videoData);
  const analysis = analysisData ? JSON.parse(analysisData) : null;

  const rotation = useSharedValue(0);
  const pulse = useSharedValue(0);

  useEffect(() => {
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

    // Handle real backend data or error
    if (error) {
      setCurrentTask('Upload failed');
      setProgress(0);
      // Show error for 2 seconds then go back
      setTimeout(() => {
        router.back();
      }, 2000);
    } else if (analysis) {
      setCurrentTask('Analysis completed!');
      setProgress(100);
      
      // Convert analysis result to backend response format
      const backendResponse: BackendResponse = {
        videoId: analysis.videoId,
        status: 'completed',
        piiFrames: analysis.piiFrames,
        processedVideoUri: null, // No blurred video yet
        processingTime: analysis.processingTime,
        totalFramesAnalyzed: analysis.totalFramesAnalyzed,
      };

      // Navigate to review after brief delay
      setTimeout(() => {
        router.replace({
          pathname: '/upload/review',
          params: { 
            videoData: JSON.stringify(video),
            responseData: JSON.stringify(backendResponse)
          },
        });
      }, 1500);
    } else {
      // No analysis data - something went wrong
      setCurrentTask('No analysis data received');
      setProgress(0);
      setTimeout(() => {
        router.back();
      }, 2000);
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

      {/* Progress Info */}
      <View className="items-center space-y-6" style={{ gap: 24 }}>
        <Typography variant="h2" weight="bold" className="text-center">
          Analyzing Your Video
        </Typography>

        <Typography variant="body" color="gray" className="text-center">
          {currentTask}
        </Typography>

        {/* Progress Bar */}
        <View className="w-full max-w-xs">
          <View className="bg-gray-800 rounded-full h-2 overflow-hidden">
            <View 
              className="bg-primary h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </View>
          <Typography variant="caption" color="gray" className="text-center mt-2">
            {progress}% complete
          </Typography>
        </View>

        <View className="mt-8">
          <Typography variant="caption" color="gray" className="text-center">
            Scanning for privacy-sensitive content
          </Typography>
        </View>
      </View>
    </View>
  );
}