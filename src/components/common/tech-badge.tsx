import TechLogo from "@/components/effects/tech-logo";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Chip for a technology: its logo (when there is one) followed by the name. Slightly taller
 * than a plain `Badge` so the logo is legible; the base badge style would squeeze it to 12px.
 *
 * @param name - Technology label, as written in the site's content.
 * @param className - Extra classes merged onto the chip.
 */
export default function TechBadge({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "tag-inner-shadow h-6 gap-1.5 px-2.5 font-normal [&>svg]:size-3.5!",
        className,
      )}
    >
      <TechLogo name={name} className="size-3.5" />
      {name}
    </Badge>
  );
}
