export * from './navigation';
export * from './api';

export interface VideoData {
  id: string;
  uri: any;
  thumbnail?: string;
  duration: number;
  caption: string;
  likes: number;
  comments: number;
  shares: number;
  author: {
    id: string;
    username: string;
    avatar?: string;
    verified: boolean;
  };
  isLiked: boolean;
  isBookmarked: boolean;
}

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  verified: boolean;
  followers: number;
  following: number;
  likes: number;
}