import { VideoData } from '../types';

export const mockVideos: VideoData[] = [
  {
    id: '1',
    uri: require('../../assets/videos/tiktok1.mp4'),
    thumbnail: require('../../assets/images/react-logo.png'),
    duration: 15000,
    caption: 'Had so much fun making this! Check out the sunset vibes 🌅',
    likes: 12400,
    comments: 234,
    shares: 89,
    author: {
      id: 'user1',
      username: 'sunsetdreamer',
      avatar: require('../../assets/images/adaptive-icon.png'),
      verified: true
    },
    isLiked: false,
    isBookmarked: false
  },
  {
    id: '2',
    uri: require('../../assets/videos/tiktok2.mp4'),
    thumbnail: require('../../assets/images/react-logo.png'),
    duration: 23000,
    caption: 'This took me 3 hours to edit but totally worth it! What do you think? 🎬',
    likes: 8900,
    comments: 156,
    shares: 67,
    author: {
      id: 'user2',
      username: 'creativemind',
      avatar: require('../../assets/images/adaptive-icon.png'),
      verified: false
    },
    isLiked: true,
    isBookmarked: false
  },
  {
    id: '3',
    uri: require('../../assets/videos/tiktok3.mp4'),
    thumbnail: require('../../assets/images/react-logo.png'),
    duration: 18000,
    caption: 'Just discovered this amazing spot! You have to check it out ✨📍',
    likes: 15600,
    comments: 312,
    shares: 145,
    author: {
      id: 'user3',
      username: 'wanderlust_vida',
      avatar: require('../../assets/images/adaptive-icon.png'),
      verified: true
    },
    isLiked: false,
    isBookmarked: true
  }
];