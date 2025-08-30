import React, { useState } from 'react';
import { View, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/ui/Button';
import Typography from '../../components/ui/Typography';
import { UploadedVideo } from '../../lib/types/upload';

export default function UploadVideoScreen() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);

  const goHome = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace('/(tabs)');
  };

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'We need access to your photo library to select videos.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const selectFromGallery = async () => {
    if (isUploading) return;
    
    try {
      // Request permissions BEFORE launching picker
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: false, // Don't force editing, let user choose their video as-is
        quality: 1.0, // Keep original quality
        videoMaxDuration: 60,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const video: UploadedVideo = {
          id: Date.now().toString(),
          uri: asset.uri,
          duration: asset.duration || 0,
          width: asset.width || 0,
          height: asset.height || 0,
          size: asset.fileSize || 0,
          fileName: asset.fileName || `video_${Date.now()}.mp4`,
          mimeType: asset.mimeType || 'video/mp4',
        };

        // Navigate to preview immediately - no blocking upload
        router.push({
          pathname: '/upload/preview',
          params: { videoData: JSON.stringify(video) },
        });
      }
    } catch (error) {
      console.error('Error selecting from gallery:', error);
      Alert.alert('Error', 'Failed to select video from gallery');
    }
  };

  const recordVideo = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'We need access to your camera to record videos.',
          [{ text: 'OK' }]
        );
        return;
      }

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
        videoMaxDuration: 60,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const video: UploadedVideo = {
          id: Date.now().toString(),
          uri: asset.uri,
          duration: asset.duration || 0,
          width: asset.width || 0,
          height: asset.height || 0,
          size: asset.fileSize || 0,
          fileName: asset.fileName || `recorded_${Date.now()}.mp4`,
          mimeType: asset.mimeType || 'video/mp4',
        };

        // Navigate to preview immediately - no blocking upload
        router.push({
          pathname: '/upload/preview',
          params: { videoData: JSON.stringify(video) },
        });
      }
    } catch (error) {
      console.error('Error recording video:', error);
      Alert.alert('Error', 'Failed to record video');
    }
  };

  return (
    <View className="flex-1 bg-black">
      {/* Close Button - Floating */}
      <View className="absolute top-12 left-4 z-10">
        <TouchableOpacity 
          onPress={goHome} 
          className="bg-black/50 rounded-full p-3"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 5,
          }}
        >
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View className="flex-1 items-center justify-center px-6">
        <View className="items-center mb-12">
          <Ionicons name="videocam" size={80} color="#FE2C55" />
          <Typography variant="h2" weight="bold" className="mt-6 mb-3">
            Upload Video
          </Typography>
          <Typography variant="body" color="gray" className="text-center">
            Select a video to upload
          </Typography>
        </View>

        <View className="w-full space-y-4" style={{ gap: 16 }}>
          <Button
            title={isUploading ? "Uploading..." : "Choose from Gallery"}
            onPress={selectFromGallery}
            variant="primary"
            size="lg"
            disabled={isUploading}
          />
          
          <Button
            title={isUploading ? "Uploading..." : "Record Video"}
            onPress={recordVideo}
            variant="secondary"
            size="lg"
            disabled={isUploading}
          />
        </View>

        <View className="mt-8">
          <Typography variant="caption" color="gray" className="text-center">
            Max duration: 60 seconds
          </Typography>
        </View>
      </View>
    </View>
  );
}