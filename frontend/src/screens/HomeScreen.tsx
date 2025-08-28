import { useState } from "@lynx-js/react";
import { COLORS, SIZES, FONTS } from "../styles/theme";
import { Card } from "../components/Card";
import { PlusButton } from "../components/PlusButton";

export default function HomeScreen({ onUpload }: { onUpload: () => void }) {
  return (
    <view style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', background: `radial-gradient(circle at 60% 40%, ${COLORS.accentLight} 0%, ${COLORS.background} 80%)`, display: 'flex', flexDirection: 'column', zIndex: 0 }}>
      <view style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <text style={{ color: COLORS.text, fontSize: FONTS.title, fontWeight: 'bold', marginBottom: 12, textShadow: '0 2px 12px #ff0050' }}>TikTok</text>
        <text style={{ color: COLORS.text, fontSize: FONTS.subtitle, opacity: 0.7, marginBottom: 32, textShadow: '0 1px 8px #ff7f50' }}>Discover trending videos</text>
        <Card>
          <image
            src={require('../assets/road.png')}
            style={{ width: '100%', height: '100%', borderRadius: SIZES.borderRadius * 1.5, objectFit: 'cover', filter: 'brightness(1.1) drop-shadow(0 2px 8px #ff0050)' }}
          />
        </Card>
      </view>
      <view style={{ padding: SIZES.buttonPadding, backgroundColor: 'transparent', display: 'flex', justifyContent: 'center' }}>
        <PlusButton onClick={onUpload} />
      </view>
    </view>
  );
}
