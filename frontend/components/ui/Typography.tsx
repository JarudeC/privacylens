import React from 'react';
import { Text, TextProps } from 'react-native';

interface TypographyProps extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'button';
  color?: 'white' | 'gray' | 'primary' | 'secondary';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
}

const Typography: React.FC<TypographyProps> = ({
  children,
  variant = 'body',
  color = 'white',
  weight = 'normal',
  className = '',
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'h1':
        return 'text-3xl leading-9';
      case 'h2':
        return 'text-2xl leading-8';
      case 'h3':
        return 'text-xl leading-7';
      case 'body':
        return 'text-base leading-6';
      case 'caption':
        return 'text-sm leading-5';
      case 'button':
        return 'text-base leading-6';
      default:
        return 'text-base leading-6';
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'white':
        return 'text-white';
      case 'gray':
        return 'text-gray-600';
      case 'primary':
        return 'text-primary';
      case 'secondary':
        return 'text-secondary';
      default:
        return 'text-white';
    }
  };

  const getWeightClasses = () => {
    switch (weight) {
      case 'normal':
        return 'font-normal';
      case 'medium':
        return 'font-medium';
      case 'semibold':
        return 'font-semibold';
      case 'bold':
        return 'font-bold';
      default:
        return 'font-normal';
    }
  };

  const combinedClasses = `${getVariantClasses()} ${getColorClasses()} ${getWeightClasses()} ${className}`;

  return (
    <Text className={combinedClasses} {...props}>
      {children}
    </Text>
  );
};

export default Typography;