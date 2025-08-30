import { VideoData } from '../types';

export const mockVideos: VideoData[] = [
  {
    id: '1',
    uri: require('../../assets/videos/tiktok1.mp4'),
    duration: 15000,
    caption: 'Buy now, regret later… if you steal my card…',
    likes: 12400,
    comments: 234,
    shares: 89,
    author: {
      id: 'user1',
      username: 'swipe_king',
      verified: true
    },
    isLiked: false,
    isBookmarked: false
  },
  {
    id: '2',
    uri: require('../../assets/videos/tiktok2.mp4'),
    duration: 23000,
    caption: 'I think privacylens will win too!',
    likes: 8900,
    comments: 156,
    shares: 67,
    author: {
      id: 'user2',
      username: 'privacylensfan',
      verified: false
    },
    isLiked: true,
    isBookmarked: false
  },
  {
    id: '3',
    uri: require('../../assets/videos/tiktok3.mp4'),
    duration: 18000,
    caption: 'Secure vibes only… kinda 🔒😂',
    likes: 15600,
    comments: 312,
    shares: 145,
    author: {
      id: 'user3',
      username: 'studystruggle',
      verified: true
    },
    isLiked: false,
    isBookmarked: true
  }
];