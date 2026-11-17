"use client";

import { createContext, useCallback, useContext, useReducer } from "react";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatState = {
  open: boolean;
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
};

type ChatAction =
  | { type: "toggle" }
  | { type: "open" }
  | { type: "close" }
  | { type: "send"; message: ChatMessage }
  | { type: "receive"; message: ChatMessage }
  | { type: "loading"; loading: boolean }
  | { type: "error"; error: string | null };

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "toggle":
      return { ...state, open: !state.open };
    case "open":
      return { ...state, open: true };
    case "close":
      return { ...state, open: false };
    case "send":
      return {
        ...state,
        messages: [...state.messages, action.message],
        error: null,
      };
    case "receive":
      return {
        ...state,
        messages: [...state.messages, action.message],
        loading: false,
      };
    case "loading":
      return { ...state, loading: action.loading };
    case "error":
      return { ...state, error: action.error, loading: false };
    default:
      return state;
  }
}

const initialState: ChatState = {
  open: false,
  messages: [],
  loading: false,
  error: null,
};

type ChatContextValue = ChatState & {
  toggle: () => void;
  openChat: () => void;
  closeChat: () => void;
  sendMessage: (content: string) => Promise<void>;
};

const ChatContext = createContext<ChatContextValue | null>(null);

const WORKER_API_URL = process.env.NEXT_PUBLIC_WORKER_API_URL;

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  const sendMessage = useCallback(async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;

    dispatch({ type: "send", message: { role: "user", content: trimmed } });
    dispatch({ type: "loading", loading: true });

    if (!WORKER_API_URL) {
      dispatch({
        type: "error",
        error:
          "The assistant isn't connected yet — NEXT_PUBLIC_WORKER_API_URL is not set.",
      });
      return;
    }

    try {
      const res = await fetch(`${WORKER_API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data = (await res.json()) as { reply: string };
      dispatch({
        type: "receive",
        message: { role: "assistant", content: data.reply },
      });
    } catch {
      dispatch({
        type: "error",
        error:
          "Couldn't reach the assistant right now. Please try again shortly.",
      });
    }
  }, []);

  return (
    <ChatContext.Provider
      value={{
        ...state,
        toggle: () => dispatch({ type: "toggle" }),
        openChat: () => dispatch({ type: "open" }),
        closeChat: () => dispatch({ type: "close" }),
        sendMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within a ChatProvider");
  return ctx;
}
