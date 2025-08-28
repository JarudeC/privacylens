// PlusButton.tsx
import { COLORS, SIZES, FONTS } from "../styles/theme";

export function PlusButton({ onClick }: { onClick: () => void }) {
  return (
    <view
      style={{
        width: SIZES.buttonHeight * 1.1,
        height: SIZES.buttonHeight * 1.1,
        borderRadius: SIZES.buttonHeight * 1.1 / 2,
        background: `radial-gradient(circle at 60% 40%, ${COLORS.accentLight} 0%, ${COLORS.accent} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 32px rgba(255,0,80,0.25), 0 2px 8px #c63211ff',
        cursor: 'pointer',
        border: `6px solid ${COLORS.border}`,
        margin: '0 auto',
      }}
      bindtap={onClick}
    >
      <text style={{ color: COLORS.text, fontSize: FONTS.plus * 1.1, fontWeight: 'bold', lineHeight: `${FONTS.plus * 1.1}px`, textShadow: '0 2px 12px #ff0050' }}>+</text>
    </view>
  );
}
