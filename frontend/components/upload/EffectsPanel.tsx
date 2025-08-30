import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Typography from '../ui/Typography';

interface Effect {
  id: string;
  name: string;
  icon: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
}

interface EffectsPanelProps {
  selectedTool: string | null;
  onEffectChange: (effectId: string, value: number) => void;
}

export default function EffectsPanel({
  selectedTool,
  onEffectChange
}: EffectsPanelProps) {
  const [effects, setEffects] = useState<Effect[]>([
    { id: 'brightness', name: 'Brightness', icon: 'sunny', value: 0, min: -100, max: 100, step: 1, unit: '%' },
    { id: 'contrast', name: 'Contrast', icon: 'contrast', value: 0, min: -100, max: 100, step: 1, unit: '%' },
    { id: 'saturation', name: 'Saturation', icon: 'color-palette', value: 0, min: -100, max: 100, step: 1, unit: '%' },
    { id: 'exposure', name: 'Exposure', icon: 'camera', value: 0, min: -2, max: 2, step: 0.1, unit: 'EV' },
    { id: 'highlights', name: 'Highlights', icon: 'sunny-outline', value: 0, min: -100, max: 100, step: 1, unit: '%' },
    { id: 'shadows', name: 'Shadows', icon: 'moon', value: 0, min: -100, max: 100, step: 1, unit: '%' },
    { id: 'vibrance', name: 'Vibrance', icon: 'flower', value: 0, min: -100, max: 100, step: 1, unit: '%' },
    { id: 'warmth', name: 'Warmth', icon: 'thermometer', value: 0, min: -100, max: 100, step: 1, unit: '%' },
  ]);

  const updateEffect = (effectId: string, value: number) => {
    setEffects(prev => 
      prev.map(effect => 
        effect.id === effectId ? { ...effect, value } : effect
      )
    );
    onEffectChange(effectId, value);
  };

  const resetAllEffects = () => {
    setEffects(prev => 
      prev.map(effect => ({ ...effect, value: 0 }))
    );
  };

  if (!selectedTool || !['brightness', 'contrast', 'saturation', 'temperature'].includes(selectedTool)) {
    return null;
  }

  return (
    <View className="bg-gray-900 rounded-2xl p-4 mb-4">
      <View className="flex-row items-center justify-between mb-4">
        <Typography variant="body" weight="semibold">
          Color Adjustments
        </Typography>
        <TouchableOpacity 
          onPress={resetAllEffects}
          className="bg-gray-700 rounded-full px-3 py-1"
        >
          <Typography variant="caption" color="gray">
            Reset
          </Typography>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 300 }}>
        {effects.map((effect) => (
          <View key={effect.id} className="mb-6">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                <Ionicons 
                  name={effect.icon as any} 
                  size={16} 
                  color="#8A8A8A" 
                  style={{ marginRight: 8 }}
                />
                <Typography variant="caption" weight="medium">
                  {effect.name}
                </Typography>
              </View>
              <Typography variant="caption" color="gray">
                {effect.value}{effect.unit}
              </Typography>
            </View>

            <View className="relative">
              <View className="h-2 bg-gray-700 rounded-full">
                <View 
                  className="h-2 bg-primary rounded-full"
                  style={{ 
                    width: `${((effect.value - effect.min) / (effect.max - effect.min)) * 100}%` 
                  }}
                />
              </View>
              
              <TouchableOpacity
                className="absolute w-4 h-4 bg-white rounded-full border-2 border-primary"
                style={{
                  left: `${((effect.value - effect.min) / (effect.max - effect.min)) * 100}%`,
                  top: -6,
                  marginLeft: -8
                }}
              />
            </View>

            <View className="flex-row justify-between mt-1">
              <Typography variant="caption" color="gray" className="text-xs">
                {effect.min}{effect.unit}
              </Typography>
              <Typography variant="caption" color="gray" className="text-xs">
                {effect.max}{effect.unit}
              </Typography>
            </View>
          </View>
        ))}
      </ScrollView>

      <View className="mt-4 p-3 bg-blue-900/20 rounded-xl border border-blue-500/30">
        <Typography variant="caption" color="gray" className="text-center">
          💡 Tip: Tap and hold on the timeline to scrub through your video while adjusting
        </Typography>
      </View>
    </View>
  );
}