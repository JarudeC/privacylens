import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  Modal, 
  KeyboardAvoidingView, 
  Platform,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Typography from '../ui/Typography';
import Button from '../ui/Button';

const { height: screenHeight } = Dimensions.get('window');

interface CaptionModalProps {
  visible: boolean;
  initialCaption: string;
  onSave: (caption: string) => void;
  onCancel: () => void;
}

export default function CaptionModal({ visible, initialCaption, onSave, onCancel }: CaptionModalProps) {
  const [caption, setCaption] = useState(initialCaption);
  const textInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setCaption(initialCaption);
      // Auto-focus with slight delay for smooth animation
      setTimeout(() => {
        textInputRef.current?.focus();
      }, 100);
    }
  }, [visible, initialCaption]);

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSave(caption);
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onCancel();
  };

  const handleClear = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCaption('');
    textInputRef.current?.focus();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onCancel}
    >
      <KeyboardAvoidingView 
        className="flex-1 bg-black"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 pt-12 pb-4 border-b border-gray-800">
          <TouchableOpacity onPress={handleCancel} className="p-2">
            <Typography variant="body" color="gray">
              Cancel
            </Typography>
          </TouchableOpacity>
          
          <Typography variant="body" weight="semibold">
            Add Caption
          </Typography>
          
          <TouchableOpacity onPress={handleSave} className="p-2">
            <Typography variant="body" color="primary" weight="semibold">
              Done
            </Typography>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View className="flex-1 p-4">
          <View className="flex-1">
            <TextInput
              ref={textInputRef}
              className="text-white text-lg leading-6"
              placeholder="Write a caption..."
              placeholderTextColor="#8A8A8A"
              value={caption}
              onChangeText={setCaption}
              multiline
              maxLength={150}
              selectionColor="#FE2C55"
              style={{
                fontSize: 18,
                lineHeight: 24,
                minHeight: screenHeight * 0.3,
                textAlignVertical: 'top',
              }}
              autoFocus={false}
            />
          </View>

          {/* Bottom Section */}
          <View className="pb-4">
            {/* Character Count */}
            <View className="flex-row items-center justify-between mb-4">
              <TouchableOpacity 
                onPress={handleClear}
                className="flex-row items-center"
                disabled={caption.length === 0}
              >
                <Ionicons 
                  name="close-circle" 
                  size={20} 
                  color={caption.length > 0 ? "#8A8A8A" : "#444"} 
                />
                <Typography 
                  variant="caption" 
                  color={caption.length > 0 ? "gray" : undefined}
                  className="ml-2"
                  style={{ opacity: caption.length > 0 ? 1 : 0.5 }}
                >
                  Clear
                </Typography>
              </TouchableOpacity>
              
              <Typography 
                variant="caption" 
                color={caption.length > 140 ? "primary" : "gray"}
              >
                {caption.length}/150
              </Typography>
            </View>

            {/* Action Buttons */}
            <View className="space-y-3" style={{ gap: 12 }}>
              <Button
                title="Save Caption"
                onPress={handleSave}
                variant="primary"
                size="lg"
              />
              
              <Button
                title="Skip Caption"
                onPress={() => onSave('')}
                variant="ghost"
                size="md"
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}