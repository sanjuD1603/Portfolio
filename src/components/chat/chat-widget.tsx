"use client";

import { gsap } from "gsap";
import { ArrowUp, CalendarClock, MessageCircle, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Booker } from "@/components/cal-booking";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Message, MessageContent } from "@/components/ui/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { Textarea } from "@/components/ui/textarea";
import { profile } from "@/lib/data";
import { useChat } from "./chat-provider";
import { AssistantAvatar, getInitials, MessageBubble } from "./message-bubble";
import { TypingIndicator } from "./typing-indicator";

/** One-tap starters shown before the first message. */
const SUGGESTIONS = [
  "What has he built?",
  "Which skills does he have?",
  "Where has he worked?",
];

/**
 * Floating chat launcher and panel, mounted once in the root layout.
 *
 * Two modes: an AI assistant (answers grounded in portfolio data via the
 * Worker API's `/chat`) and "Book a call", which swaps the transcript for the
 * Cal.com booking calendar inline in the panel. The calendar mounts only while
 * that mode is open, so its iframe is never fetched for visitors who don't ask.
 * GSAP animates the panel opening and each new message; failures to reach
 * the API are shown inline rather than thrown.
 */
export function ChatWidget() {
  const {
    open,
    session,
    messages,
    loading,
    error,
    toggle,
    startSession,
    sendMessage,
  } = useChat();
  const [input, setInput] = useState("");
  const [bookMode, setBookMode] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const firstName = profile.name.split(" ")[0];

  useEffect(() => {
    if (!panelRef.current) return;
    if (open) {
      gsap.fromTo(
        panelRef.current,
        { opacity: 0, scale: 0.92, y: 12 },
        { opacity: 1, scale: 1, y: 0, duration: 0.25, ease: "power2.out" },
      );
    }
  }, [open]);

  async function handleStartSession(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await startSession(
      form.get("name")?.toString() ?? "",
      form.get("email")?.toString() ?? "",
    );
  }

  function handleSend() {
    if (!input.trim() || loading) return;
    const value = input;
    setInput("");
    void sendMessage(value);
  }

  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-3 sm:right-6">
      {open && (
        <div
          ref={panelRef}
          className="flex h-[min(38rem,calc(100dvh-6.5rem))] w-[min(26rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl"
        >
          <div className="flex items-center gap-3 border-b px-4 py-3">
            <Avatar>
              <AvatarFallback className="text-xs font-semibold">
                {getInitials(profile.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                Ask about {profile.name.split(" ")[0]}
              </p>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span
                  aria-hidden="true"
                  className="size-1.5 shrink-0 rounded-full bg-emerald-500"
                />
                <span className="truncate">
                  {bookMode
                    ? "Pick a time for a call"
                    : session
                      ? `Chatting as ${session.name}`
                      : "Answers about his work, instantly"}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => setBookMode((v) => !v)}
              >
                {bookMode ? (
                  "Back to chat"
                ) : (
                  <>
                    <CalendarClock />
                    Book a call
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Close chat"
                onClick={toggle}
              >
                <X />
              </Button>
            </div>
          </div>

          {bookMode ? (
            <div className="min-h-0 flex-1">
              <Booker className="h-full" />
            </div>
          ) : !session ? (
            <form
              onSubmit={handleStartSession}
              className="flex flex-1 flex-col gap-3 overflow-y-auto p-4"
            >
              <p className="text-sm font-medium">Before we chat</p>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Tell me who you are so {profile.name.split(" ")[0]} can follow
                up if you have to leave mid-conversation. Your name, email and
                this chat are stored for that purpose only.
              </p>
              <Input
                name="name"
                placeholder="Your name"
                required
                maxLength={100}
                autoComplete="name"
              />
              <Input
                name="email"
                type="email"
                placeholder="Your email"
                required
                maxLength={254}
                autoComplete="email"
              />
              <Button type="submit" disabled={loading}>
                {loading ? "Starting…" : "Start chat"}
              </Button>
              {error && <p className="text-destructive text-xs">{error}</p>}
            </form>
          ) : (
            <>
              <div className="min-h-0 flex-1">
                <MessageScrollerProvider autoScroll>
                  <MessageScroller>
                    <MessageScrollerViewport>
                      <MessageScrollerContent
                        className="gap-5 p-4"
                        aria-busy={loading}
                      >
                        {messages.length === 0 && (
                          <MessageScrollerItem messageId="greeting">
                            <Message>
                              <AssistantAvatar />
                              <MessageContent>
                                <Bubble variant="ghost" className="max-w-full">
                                  <BubbleContent className="overflow-visible">
                                    Hi {session.name.split(" ")[0]}! Ask me
                                    anything about {firstName}&apos;s projects,
                                    skills, experience or education.
                                  </BubbleContent>
                                </Bubble>
                                <div className="flex flex-wrap gap-1.5">
                                  {SUGGESTIONS.map((q) => (
                                    <Button
                                      key={q}
                                      type="button"
                                      variant="outline"
                                      size="xs"
                                      disabled={loading}
                                      onClick={() => void sendMessage(q)}
                                    >
                                      {q}
                                    </Button>
                                  ))}
                                </div>
                              </MessageContent>
                            </Message>
                          </MessageScrollerItem>
                        )}
                        {messages.map((m, i) => (
                          <MessageScrollerItem
                            // biome-ignore lint/suspicious/noArrayIndexKey: message list is append-only, index is stable
                            key={i}
                            messageId={`message-${i}`}
                            // No scrollAnchor: anchoring pins the visitor's message to the top of the
                            // panel on send, which reads as the transcript jumping upward. Following
                            // the bottom (autoScroll) is the behaviour a chat needs.
                          >
                            <MessageBubble
                              message={m}
                              userName={session.name}
                            />
                          </MessageScrollerItem>
                        ))}
                        {/* Until the first piece of the reply arrives; after that the reply itself shows progress. */}
                        {loading && messages.at(-1)?.role === "user" && (
                          <MessageScrollerItem messageId="typing">
                            <TypingIndicator />
                          </MessageScrollerItem>
                        )}
                        {error && (
                          <MessageScrollerItem messageId="error">
                            <Message>
                              <AssistantAvatar />
                              <MessageContent>
                                <Bubble variant="destructive">
                                  <BubbleContent role="alert">
                                    {error}
                                  </BubbleContent>
                                </Bubble>
                              </MessageContent>
                            </Message>
                          </MessageScrollerItem>
                        )}
                      </MessageScrollerContent>
                    </MessageScrollerViewport>
                    <MessageScrollerButton />
                  </MessageScroller>
                </MessageScrollerProvider>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="border-t p-3"
              >
                <div className="flex items-end gap-2 rounded-xl border bg-background p-1.5 transition-shadow focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder={`Ask about ${firstName}…`}
                    aria-label="Your message"
                    maxLength={2000}
                    rows={1}
                    className="max-h-32 min-h-9 flex-1 resize-none border-0 bg-transparent px-2 py-2 shadow-none [field-sizing:content] focus-visible:ring-0"
                  />
                  <Button
                    type="submit"
                    size="icon-sm"
                    className="rounded-lg"
                    aria-label="Send"
                    disabled={loading || !input.trim()}
                  >
                    <ArrowUp />
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
      )}

      <Button
        type="button"
        size="icon-lg"
        className="chat-launcher btn-inner-shadow relative size-14 rounded-full shadow-lg transition-transform duration-200 hover:scale-105 motion-reduce:transition-none motion-reduce:hover:scale-100 [&_svg:not([class*='size-'])]:size-6"
        data-open={open}
        aria-label={open ? "Close chat" : "Open chat"}
        onClick={toggle}
      >
        {open ? <X /> : <MessageCircle />}
        {!open && (
          <span
            aria-hidden="true"
            className="absolute top-0 right-0 size-4 rounded-full bg-red-500 ring-2 ring-background"
          />
        )}
      </Button>
    </div>
  );
}
