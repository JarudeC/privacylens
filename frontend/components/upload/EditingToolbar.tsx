import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Typography from '../ui/Typography';

interface EditingTool {
  id: string;
  name: string;
  icon: string;
  category: 'basic' | 'effects' | 'text' | 'audio' | 'color';
  isPro?: boolean;
}

interface EditingToolbarProps {
  selectedTool: string | null;
  onToolSelect: (toolId: string) => void;
}

const editingTools: EditingTool[] = [
  { id: 'trim', name: 'Trim', icon: 'cut', category: 'basic' },
  { id: 'split', name: 'Split', icon: 'resize', category: 'basic' },
  { id: 'speed', name: 'Speed', icon: 'speedometer', category: 'basic' },
  { id: 'rotate', name: 'Rotate', icon: 'refresh', category: 'basic' },
  
  { id: 'blur', name: 'Blur', icon: 'radio-button-off', category: 'effects' },
  { id: 'sharpen', name: 'Sharpen', icon: 'diamond', category: 'effects', isPro: true },
  { id: 'noise', name: 'Noise', icon: 'scan', category: 'effects', isPro: true },
  { id: 'vintage', name: 'Vintage', icon: 'camera', category: 'effects', isPro: true },
  
  { id: 'title', name: 'Title', icon: 'text', category: 'text' },
  { id: 'subtitle', name: 'Subtitle', icon: 'chatbox', category: 'text' },
  { id: 'caption', name: 'Caption', icon: 'chatbubbles', category: 'text', isPro: true },
  
  { id: 'volume', name: 'Volume', icon: 'volume-high', category: 'audio' },
  { id: 'fade', name: 'Fade', icon: 'trending-down', category: 'audio', isPro: true },
  { id: 'music', name: 'Music', icon: 'musical-notes', category: 'audio', isPro: true },
  
  { id: 'brightness', name: 'Brightness', icon: 'sunny', category: 'color' },
  { id: 'contrast', name: 'Contrast', icon: 'contrast', category: 'color' },
  { id: 'saturation', name: 'Saturation', icon: 'color-palette', category: 'color', isPro: true },
  { id: 'temperature', name: 'Temperature', icon: 'thermometer', category: 'color', isPro: true },
];

const categories = [
  { id: 'basic', name: 'Basic', icon: 'build' },
  { id: 'effects', name: 'Effects', icon: 'sparkles' },
  { id: 'text', name: 'Text', icon: 'text' },
  { id: 'audio', name: 'Audio', icon: 'volume-high' },
  { id: 'color', name: 'Color', icon: 'color-palette' },
];

export default function EditingToolbar({
  selectedTool,
  onToolSelect
}: EditingToolbarProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const handleCategoryPress = (categoryId: string) => {
    if (expandedCategory === categoryId) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(categoryId);
    }
  };

  const filteredTools = expandedCategory 
    ? editingTools.filter(tool => tool.category === expandedCategory)
    : [];

  return (
    <View className="bg-gray-900 rounded-2xl px-4 py-2 mb-4">
      <Typography variant="body" weight="semibold" className="mb-4">
        Editing Tools
      </Typography>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        className="mb-4"
      >
        <View className="flex-row" style={{ gap: 12 }}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => handleCategoryPress(category.id)}
              className={`items-center justify-center px-4 py-3 rounded-xl ${
                expandedCategory === category.id 
                  ? 'bg-primary' 
                  : 'bg-gray-800'
              }`}
            >
              <View className="items-center">
                <Ionicons 
                  name={category.icon as any} 
                  size={24} 
                  color={expandedCategory === category.id ? '#FFFFFF' : '#8A8A8A'} 
                />
                <Typography 
                  variant="caption" 
                  className={`mt-2 ${
                    expandedCategory === category.id ? 'text-white' : 'text-gray-400'
                  }`}
                >
                  {category.name}
                </Typography>
                
                {expandedCategory === category.id && (
                  <View className="mt-1">
                    <Ionicons name="chevron-up" size={14} color="#FFFFFF" />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {expandedCategory && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
        >
          <View className="flex-row" style={{ gap: 12 }}>
            {filteredTools.map((tool) => (
              <TouchableOpacity
                key={tool.id}
                onPress={() => onToolSelect(tool.id)}
                className={`items-center p-3 rounded-xl min-w-[70px] ${
                  selectedTool === tool.id 
                    ? 'bg-primary/20 border border-primary/50' 
                    : 'bg-gray-800'
                } ${tool.isPro ? 'border border-yellow-500/30' : ''}`}
              >
                {tool.isPro && (
                  <View className="absolute -top-1 -right-1 bg-yellow-500 rounded-full px-1">
                    <Typography variant="caption" className="text-black text-xs font-bold">
                      PRO
                    </Typography>
                  </View>
                )}
                
                <Ionicons 
                  name={tool.icon as any} 
                  size={24} 
                  color={selectedTool === tool.id ? '#FE2C55' : '#FFFFFF'} 
                />
                <Typography 
                  variant="caption" 
                  className={`mt-2 text-center ${
                    selectedTool === tool.id ? 'text-primary' : 'text-white'
                  }`}
                >
                  {tool.name}
                </Typography>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}