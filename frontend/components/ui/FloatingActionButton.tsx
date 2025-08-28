import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  withRepeat,
  withSequence,
  interpolate
} from 'react-native-reanimated';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedView = Animated.createAnimatedComponent(View);

interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  size?: number;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
  icon = 'add',
  size = 24,
}) => {
  const scale = useSharedValue(1);
  const pulse = useSharedValue(0);
  const glow = useSharedValue(0);

  React.useEffect(() => {
    // Subtle pulsing animation
    pulse.value = withRepeat(
      withSequence(
        withSpring(1, { duration: 2500 }),
        withSpring(0, { duration: 2500 })
      ),
      -1,
      true
    );

    // Subtle glow effect
    glow.value = withRepeat(
      withSequence(
        withSpring(1, { duration: 3500 }),
        withSpring(0, { duration: 3500 })
      ),
      -1,
      true
    );
  }, []);

  const handlePressIn = () => {
    scale.value = withSpring(0.92);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    onPress();
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pulseAnimatedStyle = useAnimatedStyle(() => {
    const scaleValue = interpolate(pulse.value, [0, 1], [1, 1.15]);
    const opacityValue = interpolate(pulse.value, [0, 1], [0.2, 0]);
    
    return {
      transform: [{ scale: scaleValue }],
      opacity: opacityValue,
    };
  });

  const glowAnimatedStyle = useAnimatedStyle(() => {
    const scaleValue = interpolate(glow.value, [0, 1], [1, 1.25]);
    const opacityValue = interpolate(glow.value, [0, 1], [0.1, 0]);
    
    return {
      transform: [{ scale: scaleValue }],
      opacity: opacityValue,
    };
  });

  return (
    <View className="justify-center items-center">
      {/* Outer glow ring */}
      <AnimatedView 
        className="absolute bg-primary rounded-xl"
        style={[{ width: 60, height: 36 }, glowAnimatedStyle]}
      />
      
      {/* Pulse ring */}
      <AnimatedView 
        className="absolute bg-primary/30 rounded-xl"
        style={[{ width: 56, height: 32 }, pulseAnimatedStyle]}
      />
      
      {/* Main button */}
      <AnimatedTouchableOpacity
        className="bg-primary rounded-xl shadow-xl"
        style={[
          { 
            width: 48, 
            height: 32, 
            shadowColor: '#FE2C55',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 8,
            elevation: 10,
          }, 
          buttonAnimatedStyle
        ]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <View className="flex-1 items-center justify-center">
          <Ionicons 
            name={icon} 
            size={size} 
            color="#FFFFFF" 
          />
        </View>
      </AnimatedTouchableOpacity>
    </View>
  );
};

export default FloatingActionButton;