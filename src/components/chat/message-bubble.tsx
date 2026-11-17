import {
  BriefcaseBusiness,
  FolderGit2,
  GraduationCap,
  type LucideIcon,
  Search,
  Sparkles,
  UserRound,
  Wrench,
} from "lucide-react";
import { memo } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import {
  Message,
  MessageAvatar,
  MessageContent,
} from "@/components/ui/message";
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "@/components/ui/trace";
import { ChatMarkdown } from "./chat-markdown";
import type { ChatMessage, ChatStep } from "./chat-provider";

const TOOL_ICONS: Record<string, LucideIcon> = {
  getProfile: UserRound,
  getProjects: FolderGit2,
  getSkills: Wrench,
  getExperience: BriefcaseBusiness,
  getEducation: GraduationCap,
  searchContent: Search,
};

/** "Ada Lovelace" -> "AL", "ada" -> "A": the first letters of the first and last words of a name. */
export function getInitials(name?: string | null) {
  const words = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  const first = words[0][0];
  const last = words.length > 1 ? words[words.length - 1][0] : "";
  return `${first}${last}`.toUpperCase();
}

/** Assistant avatar, shared by replies, the greeting and the "working" indicator. */
export function AssistantAvatar() {
  return (
    <MessageAvatar>
      <Avatar size="sm">
        <AvatarFallback className="text-[10px] font-semibold">
          MD
        </AvatarFallback>
      </Avatar>
    </MessageAvatar>
  );
}

function StepLine({ step }: { step: ChatStep }) {
  const Icon = TOOL_ICONS[step.tool] ?? Search;
  return (
    <TraceLine>
      <TraceIcon>
        <Icon />
      </TraceIcon>
      <TraceTitle>{step.label}</TraceTitle>
    </TraceLine>
  );
}

/** What the assistant looked up to answer: one inline line, or a collapsible list for several. */
function Steps({ steps }: { steps: ChatStep[] }) {
  if (steps.length === 1) {
    return (
      <Trace>
        <StepLine step={steps[0]} />
      </Trace>
    );
  }
  return (
    <Trace>
      <TraceCollapsible>
        <TraceCollapsibleTrigger>
          <TraceLine>
            <TraceIcon>
              <Search />
            </TraceIcon>
            <TraceTitle>Looked through {steps.length} sources</TraceTitle>
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent>
          <Trace>
            {steps.map((step, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: steps are static once received
              <StepLine key={i} step={step} />
            ))}
          </Trace>
        </TraceCollapsibleContent>
      </TraceCollapsible>
    </Trace>
  );
}

/** One chat turn: visitor messages align right in a primary bubble, assistant replies left as formatted Markdown. */
export const MessageBubble = memo(function MessageBubble({
  message,
  userName,
}: {
  message: ChatMessage;
  /** The visitor's name; their avatar shows its initials. */
  userName?: string;
}) {
  const isUser = message.role === "user";
  const waiting = !isUser && message.streaming && !message.content;

  return (
    <Message align={isUser ? "end" : "start"}>
      {isUser ? (
        <MessageAvatar>
          <Avatar size="sm">
            <AvatarFallback className="bg-primary text-[10px] font-semibold text-primary-foreground">
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>
        </MessageAvatar>
      ) : (
        <AssistantAvatar />
      )}
      <MessageContent>
        {!isUser && message.steps && message.steps.length > 0 && (
          <Steps steps={message.steps} />
        )}
        {waiting ? (
          <Trace role="status">
            <TraceLine status="running">
              <TraceIcon>
                <Sparkles />
              </TraceIcon>
              <TraceTitle>Writing a reply…</TraceTitle>
            </TraceLine>
          </Trace>
        ) : (
          // Assistant replies sit on the page (ghost) so long lists and links get the full width;
          // the visitor's own messages stay in a compact primary bubble.
          <Bubble
            variant={isUser ? "default" : "ghost"}
            align={isUser ? "end" : "start"}
            className={isUser ? undefined : "max-w-full"}
          >
            <BubbleContent
              className={isUser ? undefined : "overflow-visible"}
              aria-busy={message.streaming || undefined}
            >
              {isUser ? (
                <span className="whitespace-pre-wrap">{message.content}</span>
              ) : (
                <ChatMarkdown>{message.content}</ChatMarkdown>
              )}
            </BubbleContent>
          </Bubble>
        )}
      </MessageContent>
    </Message>
  );
});
