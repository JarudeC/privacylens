import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  SlideInUp,
  SlideOutUp 
} from 'react-native-reanimated';

const AnimatedView = Animated.createAnimatedComponent(View);

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  onDismiss?: () => void;
  visible: boolean;
}

const Alert: React.FC<AlertProps> = ({
  type,
  title,
  message,
  onDismiss,
  visible,
}) => {
  const getAlertConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: 'checkmark-circle' as const,
          bgColor: 'bg-privacy-safe',
          iconColor: '#FFFFFF',
        };
      case 'error':
        return {
          icon: 'close-circle' as const,
          bgColor: 'bg-privacy-high',
          iconColor: '#FFFFFF',
        };
      case 'warning':
        return {
          icon: 'warning' as const,
          bgColor: 'bg-privacy-medium',
          iconColor: '#FFFFFF',
        };
      case 'info':
        return {
          icon: 'information-circle' as const,
          bgColor: 'bg-secondary',
          iconColor: '#FFFFFF',
        };
    }
  };

  const config = getAlertConfig();

  if (!visible) return null;

  return (
    <AnimatedView
      entering={SlideInUp.springify()}
      exiting={SlideOutUp.springify()}
      className={`absolute top-12 left-4 right-4 ${config.bgColor} rounded-2xl p-4 flex-row items-start shadow-lg z-50`}
    >
      <Ionicons 
        name={config.icon} 
        size={24} 
        color={config.iconColor}
        className="mr-3 mt-0.5"
      />
      
      <View className="flex-1">
        <Text className="text-white font-semibold text-base">
          {title}
        </Text>
        {message && (
          <Text className="text-white/90 text-sm mt-1">
            {message}
          </Text>
        )}
      </View>

      {onDismiss && (
        <TouchableOpacity
          onPress={onDismiss}
          className="ml-2"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </AnimatedView>
  );
};

export default Alert;