import TechLogo from "@/components/effects/tech-logo";
import { cn } from "@/lib/utils";

/**
 * Endless horizontal ticker. The list is rendered twice and the track slides by exactly one
 * copy's width, which makes the loop seamless. The second copy is `aria-hidden` so assistive
 * tech reads each item once; it pauses on hover; and with reduced motion it collapses to one
 * static, wrapped list (see `.marquee` in globals.css).
 *
 * Items are small boxes with softly squared corners. With `logos`, each box starts with the
 * technology's logo. The scroll speed stays constant however many items there are, because
 * the loop duration scales with the item count.
 *
 * @param items - Labels to show.
 * @param reverse - Scroll the other way.
 * @param logos - Show a technology logo before each label (labels must match `TECH_ICONS`).
 */
export default function Marquee({
  items,
  reverse = false,
  logos = false,
  className,
}: {
  items: string[];
  reverse?: boolean;
  logos?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn("marquee", className)}
      data-reverse={reverse ? "true" : "false"}
      style={
        {
          "--marquee-duration": `${items.length * 3.4}s`,
        } as React.CSSProperties
      }
    >
      {[false, true].map((hidden) => (
        <ul
          key={hidden ? "copy" : "original"}
          className="marquee-track"
          aria-hidden={hidden ? "true" : undefined}
        >
          {items.map((item) => (
            <li
              key={item}
              className={cn(
                "flex items-center gap-2.5 rounded-lg border border-border bg-card/70 text-sm whitespace-nowrap text-foreground/80",
                logos ? "px-4 py-2.5" : "px-4 py-1.5",
              )}
            >
              {logos && <TechLogo name={item} />}
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ))}
    </div>
  );
}
