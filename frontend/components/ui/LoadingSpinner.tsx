import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import Animated, { 
  useSharedValue, 
  withRepeat, 
  withTiming,
  Easing 
} from 'react-native-reanimated';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  overlay?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color = '#FE2C55',
  overlay = false,
}) => {
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 1000,
        easing: Easing.linear,
      }),
      -1
    );
  }, [rotation]);


  if (overlay) {
    return (
      <View className="absolute inset-0 bg-black/50 items-center justify-center z-50">
        <View className="bg-gray-800 rounded-2xl p-6">
          <ActivityIndicator size={size} color={color} />
        </View>
      </View>
    );
  }

  return (
    <View className="items-center justify-center">
      <ActivityIndicator size={size} color={color} />
    </View>
  );
};

export default LoadingSpinner;