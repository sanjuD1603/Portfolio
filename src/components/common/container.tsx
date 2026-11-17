import { cn } from "@/lib/utils";

/** Horizontal-padding wrapper with the shared fade-in entrance animation. */
export default function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("animate-fade-in-blur px-6", className)}>{children}</div>
  );
}
