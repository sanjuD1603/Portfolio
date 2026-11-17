import { Blocks, Database, FileCode2, Hammer } from "lucide-react";
import { findTechIcon, needsThemeColor, techKey } from "@/lib/tech-icons";
import { cn } from "@/lib/utils";

/** Neutral stand-ins (keyed by `techKey`) for technologies that have no brand logo. */
const FALLBACKS: Record<string, typeof Database> = {
  sql: Database,
  hardhat: Hammer,
  truffle: Blocks,
  ganache: Blocks,
  smartcontracts: FileCode2,
};

/**
 * Small logo for a technology: its brand mark in brand colour (or the text colour when the
 * brand colour would be invisible on one of the themes), a neutral icon for the few that
 * have no logo, and nothing at all for an unknown label. Decorative: the label next to it
 * carries the meaning, so it is hidden from assistive tech.
 *
 * @param name - Technology label, in any spelling `findTechIcon` understands.
 * @param className - Size/colour classes; defaults to a 20px icon.
 */
export default function TechLogo({
  name,
  className = "size-5",
}: {
  name: string;
  className?: string;
}) {
  const icon = findTechIcon(name);
  if (icon) {
    return (
      <svg
        viewBox="0 0 24 24"
        className={cn("shrink-0", className)}
        fill={needsThemeColor(icon.hex) ? "currentColor" : `#${icon.hex}`}
        aria-hidden="true"
        data-tech-logo=""
      >
        <path d={icon.path} />
      </svg>
    );
  }
  const Fallback = FALLBACKS[techKey(name)];
  if (!Fallback) return null;
  return (
    <Fallback
      className={cn("shrink-0 text-muted-foreground", className)}
      aria-hidden
      data-tech-logo=""
    />
  );
}
