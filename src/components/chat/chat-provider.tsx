"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from "react";
import { createPacer, readSse } from "./chat-stream";

/**
 * Chat state management.
 *
 * State is held with `useReducer` and shared through a React context scoped to
 * the chat widget. A reducer is a deliberate fit here: four related fields
 * (open, messages, loading, error) change together in a handful of well-defined
 * transitions, and a pure reducer is trivially unit-testable. A global state
 * library would be over-engineering for one component tree.
 */

/** A lookup the assistant made to answer (e.g. "Browsed projects"), shown as a Trace step. */
export type ChatStep = { tool: string; label: string };

/** A single turn in the conversation. */
export type ChatMessage = {
  role: "user" | "assistant";
  /** Markdown for assistant turns; plain text for the visitor's. */
  content: string;
  /** Only on live assistant replies - the transcript restored after a reload has no steps. */
  steps?: ChatStep[];
  /** True while the reply is still arriving; the text grows token by token. */
  streaming?: boolean;
};

/** The visitor a chat session belongs to (the bearer token itself never enters React state). */
export type ChatSession = { name: string };

/** Everything the chat UI needs to render. */
export type ChatState = {
  open: boolean;
  /** Null until the visitor has given a name and email and a session exists. */
  session: ChatSession | null;
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
};

/** The only ways chat state can change. */
export type ChatAction =
  | { type: "toggle" }
  | { type: "open" }
  | { type: "close" }
  | { type: "session"; session: ChatSession | null }
  | { type: "restore"; session: ChatSession; messages: ChatMessage[] }
  | { type: "send"; message: ChatMessage }
  | { type: "receive"; message: ChatMessage }
  | { type: "stream"; delta?: string; step?: ChatStep }
  | { type: "stream-end" }
  | { type: "loading"; loading: boolean }
  | { type: "error"; error: string | null };

/**
 * Pure reducer for {@link ChatState}.
 *
 * - `session` sets (or, with null, ends) the visitor's session and clears any error.
 * - `restore` rehydrates a session and its transcript after a page reload.
 * - `send` appends the visitor's message and clears any previous error.
 * - `receive` appends a complete assistant reply and ends the loading state.
 * - `stream` grows the in-flight assistant reply (creating it on the first event) with a
 *   lookup step and/or more text; `stream-end` finishes it.
 * - `error` records a message and also ends the loading state, so the UI can
 *   never get stuck on the typing indicator after a failed request. A reply that had not
 *   produced anything yet is dropped; one cut short keeps the text it already showed.
 */

/** Ends any in-flight reply: clears the streaming flag, and drops it if nothing arrived. */
function settle(messages: ChatMessage[]): ChatMessage[] {
  const last = messages[messages.length - 1];
  if (!last?.streaming) return messages;
  const { streaming: _streaming, ...rest } = last;
  if (!rest.content && !rest.steps?.length) return messages.slice(0, -1);
  return [...messages.slice(0, -1), rest];
}

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "toggle":
      return { ...state, open: !state.open };
    case "open":
      return { ...state, open: true };
    case "close":
      return { ...state, open: false };
    case "session":
      return {
        ...state,
        session: action.session,
        messages: action.session ? state.messages : [],
        loading: false,
        error: null,
      };
    case "restore":
      return {
        ...state,
        session: action.session,
        messages: action.messages,
        loading: false,
        error: null,
      };
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
    case "stream": {
      const last = state.messages[state.messages.length - 1];
      const base = last?.role === "assistant" && last.streaming ? last : null;
      const next: ChatMessage = {
        role: "assistant",
        content: (base?.content ?? "") + (action.delta ?? ""),
        streaming: true,
        ...(base?.steps || action.step
          ? {
              steps: [
                ...(base?.steps ?? []),
                ...(action.step ? [action.step] : []),
              ],
            }
          : {}),
      };
      return {
        ...state,
        messages: base
          ? [...state.messages.slice(0, -1), next]
          : [...state.messages, next],
      };
    }
    case "stream-end":
      return { ...state, messages: settle(state.messages), loading: false };
    case "loading":
      return { ...state, loading: action.loading };
    case "error":
      return {
        ...state,
        messages: settle(state.messages),
        error: action.error,
        loading: false,
      };
    default:
      return state;
  }
}

/** Closed panel, empty history, nothing in flight. */
export const initialState: ChatState = {
  open: false,
  session: null,
  messages: [],
  loading: false,
  error: null,
};

/** State plus the actions exposed by {@link useChat}. */
type ChatContextValue = ChatState & {
  toggle: () => void;
  openChat: () => void;
  closeChat: () => void;
  /** Creates a session from the visitor's name and email; resolves true on success. */
  startSession: (name: string, email: string) => Promise<boolean>;
  sendMessage: (content: string) => Promise<void>;
};

const ChatContext = createContext<ChatContextValue | null>(null);

/** Base URL of the Cloudflare Worker API, inlined at build time (see `.env.local.example`). */
const WORKER_API_URL = process.env.NEXT_PUBLIC_WORKER_API_URL;

const TOKEN_KEY = "portfolio-chat-token";

/** sessionStorage can throw (private mode, blocked storage); the in-memory ref still works then. */
function storeToken(token: string | null) {
  try {
    if (token) sessionStorage.setItem(TOKEN_KEY, token);
    else sessionStorage.removeItem(TOKEN_KEY);
  } catch {}
}

function loadToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

const STREAM_ERROR =
  "The assistant is temporarily unavailable. Please try again shortly.";

const SESSION_EXPIRED =
  "Your chat session expired. Please enter your details again.";

/**
 * Provides chat state and actions to its subtree.
 *
 * Chatting needs a session: `startSession` POSTs the visitor's name and email
 * to `/sessions` and keeps the returned bearer token (in memory and
 * sessionStorage, so a reload keeps the chat). `sendMessage` then POSTs
 * `{ message }` to `/chat` with that token and expects `{ reply }` back; the
 * Worker keeps the history, so none is sent. If the URL is unset or a request
 * fails, a user-readable `error` is dispatched instead of throwing.
 */
export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const tokenRef = useRef<string | null>(null);

  // Resume a chat after a reload: restore the transcript for a stored token.
  useEffect(() => {
    const stored = loadToken();
    if (!stored || !WORKER_API_URL) return;
    tokenRef.current = stored;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${WORKER_API_URL}/chat/history`, {
          headers: { Authorization: `Bearer ${stored}` },
        });
        if (cancelled) return;
        if (!res.ok) throw new Error("expired");
        const data = (await res.json()) as {
          name: string;
          messages: ChatMessage[];
        };
        dispatch({
          type: "restore",
          session: { name: data.name },
          messages: data.messages,
        });
      } catch {
        if (cancelled) return;
        tokenRef.current = null;
        storeToken(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const startSession = useCallback(async (name: string, email: string) => {
    if (!WORKER_API_URL) {
      dispatch({
        type: "error",
        error:
          "The assistant isn't connected yet — NEXT_PUBLIC_WORKER_API_URL is not set.",
      });
      return false;
    }
    dispatch({ type: "loading", loading: true });
    try {
      const res = await fetch(`${WORKER_API_URL}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });
      if (res.status === 429) {
        dispatch({
          type: "error",
          error: "Too many chats started recently. Please try again later.",
        });
        return false;
      }
      if (res.status === 400) {
        dispatch({
          type: "error",
          error: "Please enter your name and a valid email address.",
        });
        return false;
      }
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data = (await res.json()) as { sessionToken: string };
      tokenRef.current = data.sessionToken;
      storeToken(data.sessionToken);
      dispatch({ type: "session", session: { name: name.trim() } });
      return true;
    } catch {
      dispatch({
        type: "error",
        error: "Couldn't start the chat right now. Please try again shortly.",
      });
      return false;
    }
  }, []);

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

    if (!tokenRef.current) {
      dispatch({ type: "session", session: null });
      dispatch({ type: "error", error: SESSION_EXPIRED });
      return;
    }

    try {
      const res = await fetch(`${WORKER_API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Ask for a token-by-token stream; a server that can't stream replies with plain JSON.
          Accept: "text/event-stream",
          Authorization: `Bearer ${tokenRef.current}`,
        },
        body: JSON.stringify({ message: trimmed }),
      });
      if (res.status === 401) {
        tokenRef.current = null;
        storeToken(null);
        dispatch({ type: "session", session: null });
        dispatch({ type: "error", error: SESSION_EXPIRED });
        return;
      }
      if (res.status === 429) {
        dispatch({
          type: "error",
          error:
            'This chat has reached its message limit. Use "Message me" to reach out directly.',
        });
        return;
      }
      if (!res.ok) throw new Error(`Request failed (${res.status})`);

      if (
        res.body &&
        res.headers.get("content-type")?.includes("text/event-stream")
      ) {
        // Text is revealed at a steady pace rather than as it arrives: the model's tokens come
        // in bursts, which would otherwise look like the reply stalling and lurching.
        const pacer = createPacer((delta) =>
          dispatch({ type: "stream", delta }),
        );
        let failed = false;
        try {
          for await (const { event, data } of readSse(res.body)) {
            const payload = (data ?? {}) as {
              text?: string;
              tool?: string;
              label?: string;
              error?: string;
            };
            if (event === "delta" && payload.text) {
              pacer.push(payload.text);
            } else if (event === "step" && payload.tool && payload.label) {
              dispatch({
                type: "stream",
                step: { tool: payload.tool, label: payload.label },
              });
            } else if (event === "error") {
              pacer.flush();
              dispatch({ type: "error", error: payload.error ?? STREAM_ERROR });
              failed = true;
              break;
            }
          }
        } catch (err) {
          pacer.flush();
          throw err;
        }
        if (!failed) {
          await pacer.drain();
          dispatch({ type: "stream-end" });
        }
        return;
      }

      const data = (await res.json()) as {
        reply: string;
        steps?: ChatStep[];
      };
      dispatch({
        type: "receive",
        message: {
          role: "assistant",
          content: data.reply,
          ...(data.steps?.length ? { steps: data.steps } : {}),
        },
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
        startSession,
        sendMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

/**
 * Access the chat state and actions.
 * @throws Error if called outside a {@link ChatProvider}.
 */
export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within a ChatProvider");
  return ctx;
}
