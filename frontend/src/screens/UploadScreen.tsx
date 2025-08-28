import { useState } from "@lynx-js/react";
import { COLORS, SIZES, FONTS } from "../styles/theme";

export default function UploadScreen({ onBack }: { onBack: () => void }) {
  return (
    <page>
  <view style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: COLORS.card, position: 'relative' }}>
        <view style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <text style={{ color: COLORS.text, fontSize: FONTS.uploadTitle, fontWeight: 'bold', marginBottom: 24 }}>Upload Photo</text>
          <view style={{ width: SIZES.uploadPhoto, height: SIZES.uploadPhoto, backgroundColor: COLORS.photoBg, borderRadius: 16, marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <text style={{ color: COLORS.textSecondary, fontSize: FONTS.photoPreview }}>Photo Preview</text>
          </view>
          <view style={{ marginBottom: 24 }}>
            <view
              style={{ padding: '12px 32px', borderRadius: 8, backgroundColor: COLORS.accent, color: COLORS.text, fontWeight: 'bold', fontSize: FONTS.button, textAlign: 'center', cursor: 'pointer' }}
            >
              Choose Photo
            </view>
          </view>
        </view>
        <view
          style={{ position: 'absolute', bottom: 32, left: '10%', width: '80%', padding: '20px 0', borderRadius: 999, backgroundColor: COLORS.accent, color: COLORS.text, fontWeight: 'bold', fontSize: FONTS.button, textAlign: 'center', cursor: 'pointer', boxShadow: '0 4px 16px rgba(255,0,80,0.25)' }}
          bindtap={onBack}
        >
          <text style={{ color: COLORS.text, fontSize: FONTS.button, fontWeight: 'bold', textAlign: 'center' }}>Back to Homepage</text>
        </view>
      </view>
    </page>
  );
}
