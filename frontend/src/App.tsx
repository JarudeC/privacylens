<<<<<<< HEAD
// src/App.tsx
import { useState, useCallback } from "@lynx-js/react";
import tiktokVideo from "./assets/tiktokvid.mp4";

export function App() {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showPrivacyAlert, setShowPrivacyAlert] = useState(false);
  
  const videos = [
    { 
      id: 1, 
      src: tiktokVideo, 
      user: "@privacy_user", 
      description: "Privacy analysis with AI detection #PrivacyLens #Security", 
      likes: "2.3K", 
      comments: "89", 
      shares: "12" 
    },
  ];
  
  const currentVideo = videos[currentVideoIndex];
  
  const handleLike = useCallback(() => {
    setIsLiked(!isLiked);
  }, [isLiked]);
  
  const handleFollow = useCallback(() => {
    setIsFollowing(!isFollowing);
  }, [isFollowing]);
  
  const handlePrivacyCheck = useCallback(() => {
    setShowPrivacyAlert(true);
    // Simulate AI privacy analysis
    setTimeout(() => setShowPrivacyAlert(false), 3000);
  }, []);

  return (
    <page className="bg-black">
      {/* TikTok-style For You Page */}
      <view className="relative h-screen w-full bg-black">
        
        {/* Top Navigation */}
        <view className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center px-4 pt-12 pb-4">
          <text className="text-white/70 text-lg font-medium">Live</text>
          <text className="text-white text-lg font-bold border-b-2 border-white pb-1">For You</text>
          <text className="text-white/70 text-lg font-medium">Following</text>
        </view>
        
        {/* Main Video Container */}
        <view className="relative h-full w-full">
          <image 
            src={currentVideo.src}
            className="absolute inset-0 w-full h-full"
            mode="aspectFill"
            autoplay={true}
            loop-count={0}
          />
          
          {/* Video Overlay Gradient */}
          <view className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
          
          {/* Right Side Actions */}
          <view className="absolute right-3 bottom-20 flex flex-col items-center space-y-6">
            {/* Profile Picture */}
            <view className="relative">
              <view className="w-14 h-14 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 p-0.5">
                <view className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center">
                  <text className="text-white text-lg font-bold">P</text>
                </view>
              </view>
              <view 
                className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                  isFollowing ? 'bg-gray-600' : 'bg-red-500 hover:bg-red-600'
                }`}
                bindtap={handleFollow}
              >
                <text className="text-white text-xs font-bold">{isFollowing ? '✓' : '+'}</text>
              </view>
            </view>
            
            {/* Like Button */}
            <view className="flex flex-col items-center" bindtap={handleLike}>
              <view className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                isLiked ? 'bg-red-500' : 'bg-gray-800/50 hover:bg-gray-700/50'
              }`}>
                <text className={`text-2xl ${isLiked ? 'text-white' : 'text-white'}`}>♥</text>
              </view>
              <text className="text-white text-xs mt-1 font-medium">{currentVideo.likes}</text>
            </view>
            
            {/* Comment Button */}
            <view className="flex flex-col items-center">
              <view className="w-12 h-12 rounded-full bg-gray-800/50 flex items-center justify-center hover:bg-gray-700/50">
                <view className="w-6 h-6 rounded bg-white/20 flex items-center justify-center">
                  <text className="text-white text-xs font-bold">C</text>
                </view>
              </view>
              <text className="text-white text-xs mt-1 font-medium">{currentVideo.comments}</text>
            </view>
            
            {/* Share Button */}
            <view className="flex flex-col items-center">
              <view className="w-12 h-12 rounded-full bg-gray-800/50 flex items-center justify-center hover:bg-gray-700/50">
                <text className="text-white text-xl font-bold">↗</text>
              </view>
              <text className="text-white text-xs mt-1 font-medium">{currentVideo.shares}</text>
            </view>
            
            {/* Privacy Check Button - Our unique feature */}
            <view className="flex flex-col items-center" bindtap={handlePrivacyCheck}>
              <view className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
                <view className="w-6 h-6 rounded bg-white/30 flex items-center justify-center">
                  <text className="text-white text-xs font-bold">AI</text>
                </view>
              </view>
              <text className="text-white text-xs mt-1 font-medium">Privacy</text>
            </view>
          </view>
          
          {/* Bottom Content Info */}
          <view className="absolute bottom-20 left-4 right-20">
            <text className="text-white font-bold text-base mb-2">{currentVideo.user}</text>
            <text className="text-white text-sm leading-5 mb-3 opacity-90">{currentVideo.description}</text>
            
            {/* Music Bar */}
            <view className="flex items-center bg-black/20 rounded-full px-3 py-1 backdrop-blur-sm">
              <view className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mr-2">
                <text className="text-white text-xs font-bold">♪</text>
              </view>
              <text className="text-white text-xs font-medium">PrivacyLens - AI Detection System</text>
            </view>
          </view>
          
        </view>
        
        {/* Privacy Alert Overlay */}
        {showPrivacyAlert && (
          <view className="absolute inset-0 bg-black/90 flex items-center justify-center z-30 backdrop-blur-sm">
            <view className="bg-white rounded-3xl p-8 mx-8 max-w-sm shadow-2xl">
              <view className="flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-100 to-blue-100 rounded-full mx-auto mb-6">
                <view className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <text className="text-white text-lg font-bold">AI</text>
                </view>
              </view>
              <text className="text-gray-900 text-xl font-bold text-center mb-3">Privacy Analysis</text>
              <text className="text-gray-600 text-sm text-center mb-6 leading-relaxed">AI scanning content for potential privacy risks and sensitive information...</text>
              <view className="w-full bg-gray-200 rounded-full h-3 mb-6 overflow-hidden">
                <view className="bg-gradient-to-r from-green-500 to-blue-500 h-full rounded-full transition-all duration-1000" style={{width: '85%'}} />
              </view>
              <view className="bg-green-50 rounded-xl p-4 border border-green-200">
                <text className="text-green-700 text-sm font-semibold text-center">✓ Analysis Complete: No privacy concerns detected</text>
              </view>
            </view>
          </view>
        )}
        
        {/* Bottom Navigation */}
        <view className="absolute bottom-0 left-0 right-0 bg-black/30 backdrop-blur-md border-t border-white/10">
          <view className="flex justify-around items-center py-3 px-4">
            <view className="flex flex-col items-center">
              <view className="w-6 h-6 bg-white/20 rounded flex items-center justify-center">
                <text className="text-white text-sm font-bold">H</text>
              </view>
              <text className="text-white/70 text-xs mt-1">Home</text>
            </view>
            <view className="flex flex-col items-center">
              <view className="w-6 h-6 bg-white/20 rounded flex items-center justify-center">
                <text className="text-white text-sm font-bold">D</text>
              </view>
              <text className="text-white/70 text-xs mt-1">Discover</text>
            </view>
            <view className="flex flex-col items-center">
              <view className="w-8 h-6 bg-white rounded-sm flex items-center justify-center">
                <text className="text-black text-lg font-bold">+</text>
              </view>
              <text className="text-white/70 text-xs mt-1">Upload</text>
            </view>
            <view className="flex flex-col items-center">
              <view className="w-6 h-6 bg-white/20 rounded flex items-center justify-center">
                <text className="text-white text-sm font-bold">I</text>
              </view>
              <text className="text-white/70 text-xs mt-1">Inbox</text>
            </view>
            <view className="flex flex-col items-center">
              <view className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                <text className="text-white text-sm font-bold">P</text>
              </view>
              <text className="text-white/70 text-xs mt-1">Profile</text>
            </view>
          </view>
        </view>
        
      </view>
    </page>
  );
=======
import { useState } from "@lynx-js/react";
import HomeScreen from "./screens/HomeScreen";
import UploadScreen from "./screens/UploadScreen";

function App() {
  const [page, setPage] = useState('home');

  return page === 'home'
    ? <HomeScreen onUpload={() => setPage('upload')} />
    : <UploadScreen onBack={() => setPage('home')} />;
>>>>>>> ab22c039d5ab0d1f1c2fb7b54431e02164d04a63
}

export default App;
