"use client";

import Cal, { getCalApi } from "@calcom/embed-react";
import { CalendarClock, ExternalLink } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// Cal.com link: https://cal.com/<username>[/<event-slug>]. With just the
// username the booker lists all event types; append "/<event-slug>" (e.g.
// "/30min") to open one specific event directly.
const CAL_LINK = "sanju-dinesh969-eospzn";
const CAL_NAMESPACE = "intro-call";

/** How long to wait for the embed before offering a plain link instead. */
const LOAD_TIMEOUT_MS = 10_000;

/** The site's brand violet, handed to Cal.com so its buttons and highlights match. */
const BRAND_VARS = {
  light: {
    "cal-brand": "#7c3aed",
    "cal-brand-emphasis": "#6d28d9",
    "cal-brand-text": "#ffffff",
  },
  dark: {
    "cal-brand": "#a78bfa",
    "cal-brand-emphasis": "#c4b5fd",
    "cal-brand-text": "#100f0f",
  },
};

/** Shimmering stand-in shaped like Cal's booker (details column, month grid, time slots). */
function BookerSkeleton() {
  return (
    <div
      className="absolute inset-0 grid animate-pulse gap-4 bg-popover p-5 sm:grid-cols-[14rem_1fr_9rem]"
      aria-hidden="true"
    >
      <div className="hidden flex-col gap-3 sm:flex">
        <div className="size-9 rounded-full bg-muted" />
        <div className="h-4 w-3/4 rounded bg-muted" />
        <div className="h-6 w-full rounded bg-muted" />
        <div className="h-4 w-1/2 rounded bg-muted" />
      </div>
      <div className="grid grid-cols-7 content-start gap-2">
        {Array.from({ length: 35 }, (_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static placeholders, never reordered
          <div key={i} className="aspect-square rounded-lg bg-muted" />
        ))}
      </div>
      <div className="hidden flex-col gap-2 sm:flex">
        {Array.from({ length: 6 }, (_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static placeholders, never reordered
          <div key={i} className="h-9 rounded-lg bg-muted" />
        ))}
      </div>
    </div>
  );
}

/**
 * The booking calendar inside the dialog. Mounted only while the dialog is open, so the
 * Cal.com iframe is never fetched for visitors who don't ask for it.
 *
 * While the embed loads (until Cal.com reports `linkReady`) a skeleton covers it; if that takes
 * longer than `LOAD_TIMEOUT_MS` (offline, blocked by an extension) a plain link to the
 * booking page appears so the visitor is never stuck on an endless loader.
 *
 * @param className - Sizing for the wrapper. The default suits the dialog; pass e.g. `h-full`
 *   to fill a container that already has a height (the chat panel does).
 */
export function Booker({
  className = "h-[min(34rem,calc(100dvh-11rem))]",
}: {
  className?: string;
}) {
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === "dark" ? "dark" : "light";
  const [ready, setReady] = useState(false);
  const [slow, setSlow] = useState(false);

  // Brand the embed, and follow the site's light/dark switch while the dialog is open.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const cal = await getCalApi({ namespace: CAL_NAMESPACE });
      if (cancelled) return;
      cal("ui", {
        theme,
        hideEventTypeDetails: false,
        layout: "month_view",
        cssVarsPerTheme: BRAND_VARS,
      });
      cal("on", { action: "linkReady", callback: () => setReady(true) });
    })();
    return () => {
      cancelled = true;
    };
  }, [theme]);

  useEffect(() => {
    if (ready) return;
    const t = setTimeout(() => setSlow(true), LOAD_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [ready]);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <Cal
        namespace={CAL_NAMESPACE}
        calLink={CAL_LINK}
        style={{ width: "100%", height: "100%", overflow: "auto" }}
        config={{ layout: "month_view", theme }}
      />
      {!ready && <BookerSkeleton />}
      {!ready && slow && (
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 border-t bg-popover/95 px-5 py-3 text-sm backdrop-blur">
          <span className="text-muted-foreground">
            Taking longer than expected.
          </span>
          <Button
            size="sm"
            variant="outline"
            render={
              // biome-ignore lint/a11y/useAnchorContent: content is supplied via Button's children through the render prop
              <a
                href={`https://cal.com/${CAL_LINK}`}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
            nativeButton={false}
          >
            Open booking page
            <ExternalLink />
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * "Schedule a call" button that opens a Cal.com booking calendar in a dialog styled like
 * the rest of the site: header with context, brand-coloured embed that follows light/dark,
 * a skeleton while it loads, and a plain-link fallback if it can't load.
 *
 * @param variant - Button variant (defaults to the outline style used on the About page).
 * @param className - Classes for the trigger button.
 */
export default function CalBooking({
  variant = "outline",
  className = "btn-inner-shadow mt-6",
}: {
  variant?: React.ComponentProps<typeof Button>["variant"];
  className?: string;
}) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button type="button" variant={variant} className={className} />
        }
      >
        <CalendarClock />
        Schedule a call
      </DialogTrigger>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="flex-row items-center gap-3 border-b px-5 py-4 pr-14">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-brand-1 to-brand-2 text-white shadow-md shadow-brand-2/25">
            <CalendarClock className="size-5" />
          </span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <DialogTitle className="text-base font-semibold">
              Schedule a call
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed">
              Pick a time that suits you. Times are shown in your own time zone
              and you&apos;ll get a confirmation by email.
            </DialogDescription>
          </div>
        </DialogHeader>
        <Booker />
      </DialogContent>
    </Dialog>
  );
}
