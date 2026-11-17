"use client";

import { gsap } from "gsap";
import { MessageCircle, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { profile } from "@/lib/data";
import { useChat } from "./chat-provider";
import { MessageBubble } from "./message-bubble";
import { TypingIndicator } from "./typing-indicator";

export function ChatWidget() {
  const { open, messages, loading, error, toggle, sendMessage } = useChat();
  const [input, setInput] = useState("");
  const [leadMode, setLeadMode] = useState(false);
  const [leadStatus, setLeadStatus] = useState<
    "idle" | "sending" | "sent" | "failed"
  >("idle");
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messageCountRef = useRef(0);

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

  useEffect(() => {
    if (messages.length > messageCountRef.current && scrollRef.current) {
      const lastChild = scrollRef.current.lastElementChild;
      if (lastChild) {
        gsap.fromTo(
          lastChild,
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.2, ease: "power1.out" },
        );
      }
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
    messageCountRef.current = messages.length;
  }, [messages]);

  function handleSend() {
    if (!input.trim() || loading) return;
    const value = input;
    setInput("");
    void sendMessage(value);
  }

  async function handleSendToOwner(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      name: form.get("name")?.toString() || undefined,
      email: form.get("email")?.toString() || undefined,
      message: form.get("message")?.toString() || "",
    };
    if (!payload.message.trim()) return;

    setLeadStatus("sending");
    const workerApiUrl = process.env.NEXT_PUBLIC_WORKER_API_URL;
    if (!workerApiUrl) {
      setLeadStatus("failed");
      return;
    }

    try {
      const res = await fetch(`${workerApiUrl}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("failed");
      setLeadStatus("sent");
      e.currentTarget.reset();
    } catch {
      setLeadStatus("failed");
    }
  }

  return (
    <div className="fixed bottom-4 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div
          ref={panelRef}
          className="flex h-[28rem] w-80 flex-col overflow-hidden rounded-xl border bg-background shadow-xl sm:w-96"
        >
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <p className="text-sm font-semibold">
                Ask about {profile.name.split(" ")[0]}
              </p>
              <p className="text-secondary text-xs">
                {leadMode
                  ? "Send a message directly"
                  : "Answers grounded in this portfolio"}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => setLeadMode((v) => !v)}
              >
                {leadMode ? "Back to chat" : "Message me"}
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

          {leadMode ? (
            <form
              onSubmit={handleSendToOwner}
              className="flex flex-1 flex-col gap-3 overflow-y-auto p-4"
            >
              <p className="text-secondary text-xs leading-relaxed">
                Prefer to leave a message instead of chatting? This goes
                straight to {profile.name.split(" ")[0]}.
              </p>
              <input
                name="name"
                placeholder="Your name (optional)"
                className="border-input rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              />
              <input
                name="email"
                type="email"
                placeholder="Your email (optional)"
                className="border-input rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              />
              <Textarea
                name="message"
                placeholder="Your message"
                required
                className="flex-1"
              />
              <Button type="submit" disabled={leadStatus === "sending"}>
                {leadStatus === "sending" ? "Sending…" : "Send message"}
              </Button>
              {leadStatus === "sent" && (
                <p className="text-xs text-green-600 dark:text-green-500">
                  Sent — thanks, I&apos;ll get back to you.
                </p>
              )}
              {leadStatus === "failed" && (
                <p className="text-destructive text-xs">
                  Couldn&apos;t send that right now — try the Contact popup
                  instead.
                </p>
              )}
            </form>
          ) : (
            <>
              <div
                ref={scrollRef}
                className="flex-1 space-y-3 overflow-y-auto p-4"
              >
                {messages.length === 0 && (
                  <p className="text-secondary text-sm">
                    Ask me anything about {profile.name.split(" ")[0]}&apos;s
                    projects, skills or experience.
                  </p>
                )}
                {messages.map((m, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: message list is append-only, index is stable
                  <MessageBubble key={i} message={m} />
                ))}
                {loading && <TypingIndicator />}
                {error && <p className="text-destructive text-xs">{error}</p>}
              </div>
              <div className="flex items-center gap-2 border-t p-3">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type a message…"
                  className="min-h-9 flex-1 resize-none py-2"
                  rows={1}
                />
                <Button
                  type="button"
                  size="icon-sm"
                  aria-label="Send"
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                >
                  <Send />
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      <Button
        type="button"
        size="icon-lg"
        className="btn-inner-shadow rounded-full shadow-lg"
        aria-label={open ? "Close chat" : "Open chat"}
        onClick={toggle}
      >
        {open ? <X /> : <MessageCircle />}
      </Button>
    </div>
  );
}
