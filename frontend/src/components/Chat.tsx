// src/components/Chat.tsx
import { useCallback, useState } from "@lynx-js/react";

type Msg = { id: string; role: "user" | "ai"; text: string };

export default function Chat() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");

  const handleInput = useCallback((e: any) => {
    // Lynx Explorer emits e.detail.value; Web may emit e.target.value.
    const val = e?.detail?.value ?? e?.target?.value ?? "";
    setInput(val);
  }, []);

  const send = useCallback(() => {
    const text = input.trim();
    if (!text) return;

    const userMsg: Msg = { id: `${Date.now()}-u`, role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // --- mock AI reply (replace with your real API later) ---
    setTimeout(() => {
      const aiMsg: Msg = {
        id: `${Date.now()}-a`,
        role: "ai",
        text: `🤖 Echo: ${text}`,
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 500);
  }, [input]);

  const sendOnEnter = useCallback((e: any) => {
    // Works in Web preview; safe to ignore on mobile if not fired
    if (e?.key === "Enter") send();
  }, [send]);

  return (
    <view className="ChatRoot">
      <scroll-view className="ChatList">
        {messages.map((m) => (
          <view
            key={m.id}
            className={`Bubble ${m.role === "user" ? "Bubble--user" : "Bubble--ai"}`}
          >
            <text className="BubbleText">{m.text}</text>
          </view>
        ))}
      </scroll-view>

      <view className="InputRow">
        <view className="ChatInput">
          <text>Type a message… (Input not implemented yet)</text>
        </view>
        <view className="SendBtn" bindtap={() => {
          // Add a test message for now
          const testMsg = { id: `${Date.now()}-test`, role: "user" as const, text: "Test message" };
          setMessages(prev => [...prev, testMsg]);
        }}>
          <text className="SendBtnText">Test</text>
        </view>
      </view>
    </view>
  );
}