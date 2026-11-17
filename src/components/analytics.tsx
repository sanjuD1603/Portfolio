import Script from "next/script";
import { getUmamiConfig } from "@/lib/analytics";

/**
 * Loads Umami (privacy-friendly, cookie-less page-view analytics) after the page
 * becomes interactive. Renders nothing unless `NEXT_PUBLIC_UMAMI_WEBSITE_ID` is set.
 */
export default function Analytics() {
  const config = getUmamiConfig();
  if (!config) return null;
  return (
    <Script
      src={config.src}
      data-website-id={config.websiteId}
      strategy="afterInteractive"
    />
  );
}
