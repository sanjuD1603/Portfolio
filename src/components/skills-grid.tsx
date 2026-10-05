import { Blocks, Code2, Database, Layers, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { skills } from "@/lib/data";

const ICONS: Record<string, LucideIcon> = {
  Languages: Code2,
  Frameworks: Layers,
  Web3: Blocks,
  Databases: Database,
};

export default function SkillsGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {skills.map((g) => {
        const Icon = ICONS[g.group] ?? Code2;
        return (
          <div
            key={g.group}
            className="skill-inner-shadow group/skill flex flex-col gap-4 rounded-xl p-5 ring-1 ring-foreground/10 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:ring-foreground/25"
          >
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover/skill:bg-primary group-hover/skill:text-primary-foreground">
                <Icon className="size-4" />
              </span>
              <h3 className="font-semibold">{g.group}</h3>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {g.items.map((i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="tag-inner-shadow font-normal"
                >
                  {i}
                </Badge>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
