"use client";

import { getCalApi } from "@calcom/embed-react";
import { CalendarClock } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

// Cal.com link: https://cal.com/<username>[/<event-slug>]. With just the
// username the popup lists all event types; append "/<event-slug>" (e.g.
// "/30min") to open one specific event directly.
const CAL_LINK = "sanju-dinesh969-eospzn";
const CAL_NAMESPACE = "intro-call";

/**
 * "Schedule a call" button that opens a Cal.com booking popup.
 * Cal.com's embed script reads the `data-cal-*` attributes; the effect only
 * re-themes the popup (light/dark) to match the site via `next-themes`.
 */
export default function CalBooking({
  variant = "outline",
  className = "btn-inner-shadow mt-6",
}: {
  variant?: React.ComponentProps<typeof Button>["variant"];
  className?: string;
}) {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    (async function initCal() {
      const cal = await getCalApi({ namespace: CAL_NAMESPACE });
      cal("ui", {
        theme: resolvedTheme === "dark" ? "dark" : "light",
        hideEventTypeDetails: false,
        layout: "month_view",
      });
    })();
  }, [resolvedTheme]);

  return (
    <Button
      type="button"
      variant={variant}
      className={className}
      data-cal-namespace={CAL_NAMESPACE}
      data-cal-link={CAL_LINK}
      data-cal-config={`{"layout":"month_view"}`}
    >
      <CalendarClock />
      Schedule a call
    </Button>
  );
}
