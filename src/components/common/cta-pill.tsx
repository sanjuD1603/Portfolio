import { ArrowUpRight } from "lucide-react";
import { Link } from "next-view-transitions";
import { profile } from "@/lib/data";

export default function CtaPill({
  label = "Let's talk",
  href = `mailto:${profile.email}`,
}: {
  label?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className="group btn-inner-shadow inline-flex items-center gap-2 rounded-full border bg-secondary px-4 py-2 text-sm font-medium transition-all duration-300 hover:gap-8"
    >
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
        MD
      </span>
      <span>{label}</span>
      <span className="flex -translate-x-full items-center gap-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
        Say hi
        <ArrowUpRight className="size-4" />
      </span>
    </Link>
  );
}
