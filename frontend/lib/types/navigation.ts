import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

export type TabParamList = {
  Home: undefined;
  Discover: undefined;
  Upload: undefined;
  Inbox: undefined;
  Profile: undefined;
};

export type UploadStackParamList = {
  VideoSelect: undefined;
  VideoPreview: { videoUri: string };
  Caption: { videoUri: string };
  Processing: { videoUri: string; caption: string };
  VideoGallery: { videoUri: string; caption: string };
  Review: { videoUri: string; caption: string; flaggedItems: FlaggedItem[] };
  FlaggedItem: { item: FlaggedItem };
  Success: undefined;
  Error: { error: string };
};

export interface FlaggedItem {
  id: string;
  type: 'credit_card' | 'identity_card' | 'address';
  severity: 'low' | 'medium' | 'high';
  description: string;
  timestamp: number;
  thumbnailUrl?: string;
}

export type UploadStackScreenProps<T extends keyof UploadStackParamList> = {
  navigation: StackNavigationProp<UploadStackParamList, T>;
  route: RouteProp<UploadStackParamList, T>;
};

export type TabScreenProps<T extends keyof TabParamList> = {
  navigation: StackNavigationProp<TabParamList, T>;
  route: RouteProp<TabParamList, T>;
};