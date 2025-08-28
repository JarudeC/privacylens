import React, { useState, useRef, useCallback } from 'react';
import { View, FlatList, Dimensions, StatusBar } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import VideoCard from '../../components/features/VideoCard';
import { mockVideos } from '../../lib/data/mockVideos';
import { VideoData } from '../../lib/types';

const { height: screenHeight } = Dimensions.get('window');

export default function HomeScreen() {
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('light-content');
      StatusBar.setBackgroundColor('#000000');
    }, [])
  );

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveVideoIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 80,
  }).current;

  const renderVideoItem = ({ item, index }: { item: VideoData; index: number }) => (
    <VideoCard
      video={item}
      isActive={index === activeVideoIndex}
    />
  );

  const getItemLayout = (_: any, index: number) => ({
    length: screenHeight,
    offset: screenHeight * index,
    index,
  });

  return (
    <View className="flex-1 bg-black">
      <FlatList
        ref={flatListRef}
        data={mockVideos}
        renderItem={renderVideoItem}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={screenHeight}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={getItemLayout}
        removeClippedSubviews={true}
        maxToRenderPerBatch={3}
        updateCellsBatchingPeriod={100}
        windowSize={5}
        initialNumToRender={2}
      />
    </View>
  );
}
