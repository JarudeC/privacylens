import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Typography from '../ui/Typography';

const { width: screenWidth } = Dimensions.get('window');

interface VideoTimelineProps {
  duration: number;
  currentTime: number;
  onTimeChange: (time: number) => void;
  onPlayPause: () => void;
  isPlaying: boolean;
}

export default function VideoTimeline({
  duration,
  currentTime,
  onTimeChange,
  onPlayPause,
  isPlaying
}: VideoTimelineProps) {
  const [isDragging, setIsDragging] = useState(false);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const generateTimeMarkers = () => {
    const markers = [];
    const totalMarkers = Math.floor(duration / 5);
    
    for (let i = 0; i <= totalMarkers; i++) {
      const time = i * 5;
      markers.push(
        <View key={i} className="items-center">
          <View className="w-px h-3 bg-gray-400" />
          <Typography variant="caption" color="gray" className="mt-1 text-xs">
            {formatTime(time)}
          </Typography>
        </View>
      );
    }
    return markers;
  };

  return (
    <View className="bg-gray-900 rounded-2xl p-4 mb-4">
      <View className="flex-row items-center justify-between mb-4">
        <Typography variant="body" weight="semibold">Timeline</Typography>
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={onPlayPause}
            className="bg-primary rounded-full p-2 mr-3"
          >
            <Ionicons 
              name={isPlaying ? "pause" : "play"} 
              size={16} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
          <Typography variant="caption" color="gray">
            {formatTime(currentTime)} / {formatTime(duration)}
          </Typography>
        </View>
      </View>

      <View className="relative">
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="mb-4"
        >
          <View 
            className="flex-row items-center justify-between px-2"
            style={{ width: Math.max(screenWidth - 64, duration * 10) }}
          >
            {generateTimeMarkers()}
          </View>
        </ScrollView>

        <View className="relative h-12 bg-gray-800 rounded-lg overflow-hidden">
          <View 
            className="absolute h-full bg-primary/30 rounded-lg"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
          
          <View 
            className="absolute w-1 h-full bg-primary"
            style={{ left: `${(currentTime / duration) * 100}%` }}
          />

          <View className="absolute inset-0 flex-row items-center px-2">
            {Array.from({ length: Math.floor(duration / 2) }).map((_, i) => (
              <View key={i} className="w-px h-6 bg-gray-600 mr-4" />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}