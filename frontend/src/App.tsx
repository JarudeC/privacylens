// src/App.tsx
import { useState, useCallback } from "@lynx-js/react";

export function App() {
  const [count, setCount] = useState(0);
  const [color, setColor] = useState('#ff0000');
  const [message, setMessage] = useState('HELLO LYNX');

  const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
  
  const handleTap = useCallback(() => {
    const newCount = count + 1;
    setCount(newCount);
    setColor(colors[newCount % colors.length]);
    
    if (newCount === 20) {
      setMessage(`jared small penis`);
    } else if (newCount > 20) {
      setMessage(`Amazing! ${newCount} taps and counting!`);
    } else {
      setMessage(`Tapped ${newCount} times!`);
    }
  }, [count]);

  return (
    <page>
      <view style={{ 
        backgroundColor: color, 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        transition: 'background-color 0.3s ease'
      }}>
        <text style={{ 
          color: '#ffffff', 
          fontSize: '24px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          {message}
        </text>
        
        <view 
          style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            padding: '15px 30px',
            borderRadius: '10px',
            border: '2px solid #fff'
          }}
          bindtap={handleTap}
        >
          <text style={{ 
            color: '#ffffff', 
            fontSize: '18px',
            fontWeight: 'bold'
          }}>
            TAP ME! ({count})
          </text>
        </view>
      </view>
    </page>
  );
}
