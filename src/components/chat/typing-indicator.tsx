import { Sparkles } from "lucide-react";
import { Message, MessageContent } from "@/components/ui/message";
import { Trace, TraceIcon, TraceLine, TraceTitle } from "@/components/ui/trace";
import { AssistantAvatar } from "./message-bubble";

/** Shown while waiting for the assistant's reply: a running Trace step with a shimmering title. */
export function TypingIndicator() {
  return (
    <Message>
      <AssistantAvatar />
      <MessageContent>
        <Trace role="status">
          <TraceLine status="running">
            <TraceIcon>
              <Sparkles />
            </TraceIcon>
            <TraceTitle>Looking through the portfolio…</TraceTitle>
          </TraceLine>
        </Trace>
      </MessageContent>
    </Message>
  );
}
