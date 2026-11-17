"use client";

import { getCalApi } from "@calcom/embed-react";
import { CalendarClock } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

// TODO: replace with the portfolio owner's real Cal.com username/event once
// an account is set up — https://cal.com/<username>/<event-slug>.
const CAL_LINK = "your-username/intro-call";
const CAL_NAMESPACE = "intro-call";

export default function CalBooking() {
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
      variant="outline"
      className="btn-inner-shadow mt-6"
      data-cal-namespace={CAL_NAMESPACE}
      data-cal-link={CAL_LINK}
      data-cal-config={`{"layout":"month_view"}`}
    >
      <CalendarClock />
      Schedule a call
    </Button>
  );
}
