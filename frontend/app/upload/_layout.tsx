import { Stack } from 'expo-router';
import React from 'react';

export default function UploadLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: 'card',
        animation: 'slide_from_right',
        gestureEnabled: false,
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{
          title: 'Upload Video',
        }}
      />
      <Stack.Screen 
        name="preview" 
        options={{
          title: 'Preview',
        }}
      />
      <Stack.Screen 
        name="processing" 
        options={{
          title: 'Processing',
        }}
      />
      <Stack.Screen 
        name="review" 
        options={{
          title: 'Review',
        }}
      />
      <Stack.Screen 
        name="blurred-preview" 
        options={{
          title: 'Blurred Preview',
        }}
      />
      <Stack.Screen 
        name="success" 
        options={{
          title: 'Success',
        }}
      />
    </Stack>
  );
}