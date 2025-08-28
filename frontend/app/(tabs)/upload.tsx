import React from 'react';
import { View, Text } from 'react-native';

const UploadScreen: React.FC = () => {
  return (
    <View style={{ flex: 1, backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' }}>Upload Flow</Text>
      <Text style={{ color: '#8A8A8A', fontSize: 14, marginTop: 8 }}>Coming Soon</Text>
    </View>
  );
};

export default UploadScreen;