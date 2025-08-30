import React, { useState } from 'react';
import { View, TouchableOpacity, Dimensions } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { VideoData } from '../../lib/types';
import Typography from '../ui/Typography';

const { height: screenHeight } = Dimensions.get('window');

interface VideoCardProps {
  video: VideoData;
  isActive: boolean;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, isActive }) => {
  const [isLiked, setIsLiked] = useState(video.isLiked);
  const [isBookmarked, setIsBookmarked] = useState(video.isBookmarked);
  
  const player = useVideoPlayer(video.uri, (player) => {
    player.loop = true;
    player.muted = false;
  });

  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  // Control playback based on active state
  React.useEffect(() => {
    if (isActive) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive, player]);

  return (
    <View className="flex-1 bg-black" style={{ height: screenHeight }}>
      <VideoView
        style={{ flex: 1 }}
        player={player}
        allowsFullscreen={false}
        allowsPictureInPicture={false}
        contentFit="cover"
        showsTimecodes={false}
        requiresLinearPlayback={false}
      />

      {/* Overlay Controls */}
      <View className="absolute inset-0 flex-1 justify-end">
        {/* Right side action buttons */}
        <View className="absolute right-4 bottom-36 flex-col items-center" style={{ gap: 10 }}>
          {/* Like button */}
          <TouchableOpacity
            className="items-center "
            style={{ minHeight: 50, minWidth: 50, justifyContent: 'center' }}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setIsLiked(!isLiked);
            }}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isLiked ? "heart" : "heart"}
              size={36}
              color={isLiked ? "#FE2C55" : "#FFFFFF"}
            />
            <Typography variant="caption" weight="semibold" className="mt-1 text-white">
              {formatCount(video.likes + (isLiked && !video.isLiked ? 1 : 0))}
            </Typography>
          </TouchableOpacity>

          {/* Comment button */}
          <TouchableOpacity 
            className="items-center " 
            style={{ minHeight: 50, minWidth: 50, justifyContent: 'center' }}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            activeOpacity={0.7}
          >
            <Ionicons name="chatbubble" size={34} color="#FFFFFF" />
            <Typography variant="caption" weight="semibold" className="mt-1 text-white">
              {formatCount(video.comments)}
            </Typography>
          </TouchableOpacity>

          {/* Bookmark button */}
          <TouchableOpacity
            className="items-center "
            style={{ minHeight: 50, minWidth: 50, justifyContent: 'center' }}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setIsBookmarked(!isBookmarked);
            }}
            activeOpacity={0.7}
          >
            <Ionicons
              name="bookmark"
              size={34}
              color={isBookmarked ? "#FFD700" : "#FFFFFF"}
            />
          </TouchableOpacity>

          {/* Share button */}
          <TouchableOpacity 
            className="items-center " 
            style={{ minHeight: 50, minWidth: 50, justifyContent: 'center' }}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-redo" size={34} color="#FFFFFF" />
            <Typography variant="caption" weight="semibold" className="mt-1 text-white">
              {formatCount(video.shares)}
            </Typography>
          </TouchableOpacity>
        </View>

        {/* Bottom content */}
        <View className="px-4 pb-24" style={{ gap: 12 }}>
          {/* Author info */}
          <View className="flex-row items-center" style={{ gap: 8 }}>
            <Typography variant="body" weight="bold">
              @{video.author.username}
            </Typography>
            {video.author.verified && (
              <Ionicons name="checkmark-circle" size={16} color="#00E5FF" />
            )}
          </View>

          {/* Caption */}
          <View className="max-w-[80%]">
            <Typography variant="caption" className="leading-5">
              {video.caption}
            </Typography>
          </View>
        </View>
      </View>
    </View>
  );
};

export default VideoCard;