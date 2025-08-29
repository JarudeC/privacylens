import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Typography from '../ui/Typography';

interface Layer {
  id: string;
  name: string;
  type: 'video' | 'overlay' | 'text' | 'effect' | 'audio';
  isVisible: boolean;
  isLocked: boolean;
}

interface LayerPanelProps {
  layers: Layer[];
  selectedLayer: string | null;
  onLayerSelect: (layerId: string) => void;
  onLayerToggle: (layerId: string) => void;
  onLayerLock: (layerId: string) => void;
}

export default function LayerPanel({
  layers,
  selectedLayer,
  onLayerSelect,
  onLayerToggle,
  onLayerLock
}: LayerPanelProps) {
  const getLayerIcon = (type: Layer['type']) => {
    switch (type) {
      case 'video': return 'videocam';
      case 'overlay': return 'layers';
      case 'text': return 'text';
      case 'effect': return 'color-filter';
      case 'audio': return 'volume-high';
      default: return 'document';
    }
  };

  const getLayerColor = (type: Layer['type']) => {
    switch (type) {
      case 'video': return '#4CAF50';
      case 'overlay': return '#2196F3';
      case 'text': return '#FF9800';
      case 'effect': return '#9C27B0';
      case 'audio': return '#F44336';
      default: return '#8A8A8A';
    }
  };

  return (
    <View className="bg-gray-900 rounded-2xl p-4 mb-4">
      <View className="flex-row items-center justify-between mb-4">
        <Typography variant="body" weight="semibold">Layers</Typography>
        <TouchableOpacity className="bg-primary rounded-full p-2">
          <Ionicons name="add" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 200 }}>
        {layers.map((layer, index) => (
          <TouchableOpacity
            key={layer.id}
            onPress={() => onLayerSelect(layer.id)}
            className={`flex-row items-center p-3 mb-2 rounded-xl ${
              selectedLayer === layer.id ? 'bg-primary/20 border border-primary/50' : 'bg-gray-800'
            }`}
          >
            <View className="flex-row items-center flex-1">
              <View 
                className="w-8 h-8 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: getLayerColor(layer.type) + '20' }}
              >
                <Ionicons 
                  name={getLayerIcon(layer.type)} 
                  size={16} 
                  color={getLayerColor(layer.type)} 
                />
              </View>
              
              <View className="flex-1">
                <Typography variant="caption" weight="medium">
                  {layer.name}
                </Typography>
                <Typography variant="caption" color="gray" className="text-xs">
                  Layer {layers.length - index}
                </Typography>
              </View>
            </View>

            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => onLayerToggle(layer.id)}
                className="mr-2 p-1"
              >
                <Ionicons 
                  name={layer.isVisible ? "eye" : "eye-off"} 
                  size={16} 
                  color={layer.isVisible ? "#FFFFFF" : "#8A8A8A"} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => onLayerLock(layer.id)}
                className="p-1"
              >
                <Ionicons 
                  name={layer.isLocked ? "lock-closed" : "lock-open"} 
                  size={16} 
                  color={layer.isLocked ? "#FF9800" : "#8A8A8A"} 
                />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}