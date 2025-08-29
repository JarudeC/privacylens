import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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

export default function BlurProcessingScreen() {
  const router = useRouter();
  const { videoData, responseData } = useLocalSearchParams<{ 
    videoData: string; 
    responseData: string;
  }>();
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState('Preparing video...');

  const video: UploadedVideo = JSON.parse(videoData);
  const response: BackendResponse = JSON.parse(responseData);

  const rotation = useSharedValue(0);
  const pulse = useSharedValue(0);

  useEffect(() => {
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

    // Simulate blur processing steps
    const steps = [
      { task: 'Preparing video...', progress: 15, delay: 800 },
      { task: 'Locating sensitive areas...', progress: 35, delay: 1000 },
      { task: 'Applying blur effects...', progress: 60, delay: 1500 },
      { task: 'Optimizing quality...', progress: 85, delay: 1200 },
      { task: 'Finalizing protected video...', progress: 100, delay: 600 },
    ];

    let currentStep = 0;
    const processSteps = () => {
      if (currentStep < steps.length) {
        const step = steps[currentStep];
        setCurrentTask(step.task);
        setProgress(step.progress);
        currentStep++;
        
        setTimeout(processSteps, step.delay);
      } else {
        // Processing complete, navigate to blurred preview
        const updatedResponse = {
          ...response,
          processedVideoUri: `${video.uri}_blurred`,
        };

        router.replace({
          pathname: '/upload/blurred-preview',
          params: { 
            videoData: JSON.stringify(video),
            responseData: JSON.stringify(updatedResponse)
          },
        });
      }
    };

    processSteps();
  }, []);

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
          className="absolute bg-blue-500 rounded-full"
          style={[{ width: 120, height: 120 }, pulseStyle]}
        />
        
        {/* Main loading icon */}
        <AnimatedView style={rotationStyle}>
          <View className="bg-blue-500 rounded-full p-8">
            <Ionicons name="eye-off" size={48} color="#FFFFFF" />
          </View>
        </AnimatedView>
      </View>

      {/* Progress Info */}
      <View className="items-center space-y-6" style={{ gap: 24 }}>
        <Typography variant="h2" weight="bold" className="text-center">
          Creating Protected Video
        </Typography>

        <Typography variant="body" color="gray" className="text-center">
          {currentTask}
        </Typography>

        {/* Progress Bar */}
        <View className="w-full max-w-xs">
          <View className="bg-gray-800 rounded-full h-2 overflow-hidden">
            <View 
              className="bg-blue-500 h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </View>
          <Typography variant="caption" color="gray" className="text-center mt-2">
            {progress}% complete
          </Typography>
        </View>

        <View className="mt-8">
          <Typography variant="caption" color="gray" className="text-center">
            Applying privacy protection to {response.piiFrames.length} detected area(s)
          </Typography>
        </View>
      </View>
    </View>
  );
}