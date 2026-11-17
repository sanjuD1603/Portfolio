import { Reveal } from "@/components/common/reveal";
import { cn } from "@/lib/utils";

/** Page-width wrapper (max 80rem, centred, side padding) that slides up and fades in as it scrolls into view. */
export default function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Reveal className={cn("mx-auto w-full max-w-7xl px-6", className)}>
      {children}
    </Reveal>
  );
}
