import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
}) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const getButtonClasses = () => {
    const baseClasses = 'flex-row items-center justify-center rounded-lg';
    
    const sizeClasses = {
      sm: 'h-9 px-3',
      md: 'h-11 px-4',
      lg: 'h-12 px-6',
    };

    const variantClasses = {
      primary: 'bg-primary',
      secondary: 'bg-secondary',
      ghost: 'bg-transparent border border-white/20',
    };

    const disabledClasses = disabled ? 'opacity-50' : '';

    return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${disabledClasses}`;
  };

  const getTextClasses = () => {
    const baseClasses = 'font-semibold';
    
    const sizeClasses = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    };

    const variantClasses = {
      primary: 'text-white',
      secondary: 'text-white',
      ghost: 'text-white',
    };

    return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]}`;
  };

  return (
    <TouchableOpacity
      className={getButtonClasses()}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color="white"
          className="mr-2"
        />
      )}
      <Text className={getTextClasses()}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default Button;