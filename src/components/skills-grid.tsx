import { Blocks, Code2, Database, Layers, type LucideIcon } from "lucide-react";
import { cardSurface } from "@/components/common/card-styles";
import { Reveal } from "@/components/common/reveal";
import TechBadge from "@/components/common/tech-badge";
import { skills } from "@/lib/data";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  Languages: Code2,
  Frameworks: Layers,
  Web3: Blocks,
  Databases: Database,
};

/**
 * Grid of skill groups from `skills.json`, one card per group.
 * Group names are `h3`s, so render it inside a titled (`h2`) section.
 */
export default function SkillsGrid() {
  return (
    <Reveal stagger className="grid gap-5 sm:grid-cols-2">
      {skills.map((g) => {
        const Icon = ICONS[g.group] ?? Code2;
        return (
          <div
            key={g.group}
            className={cn(cardSurface, "group/skill flex flex-col gap-4 p-5")}
          >
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover/skill:bg-primary group-hover/skill:text-primary-foreground">
                <Icon className="size-4" />
              </span>
              <h3 className="font-semibold">{g.group}</h3>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {g.items.map((i) => (
                <TechBadge key={i} name={i} />
              ))}
            </div>
          </div>
        );
      })}
    </Reveal>
  );
}
