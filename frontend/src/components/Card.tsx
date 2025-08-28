// Card.tsx
import { COLORS, SIZES } from "../styles/theme";

export function Card({ children }: { children: React.ReactNode }) {
  return (
    <view
      style={{
        width: SIZES.cardWidth,
        height: SIZES.cardHeight,
        background: `linear-gradient(135deg, ${COLORS.card} 60%, ${COLORS.accentLight} 100%)`,
        borderRadius: SIZES.borderRadius * 1.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(255,0,80,0.15), 0 2px 8px #ff7f50',
      }}
    >
      {children}
    </view>
  );
}
