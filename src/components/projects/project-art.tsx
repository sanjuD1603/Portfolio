import Image from "next/image";
import TechLogo from "@/components/effects/tech-logo";
import { assetPath } from "@/lib/assets";
import type { ProjectEntry } from "@/lib/content";
import { findTechIcon } from "@/lib/tech-icons";

/** Brand-colour pairs the generated artwork cycles through, one per project position. */
const PALETTES = [
  ["--brand-1", "--brand-2"],
  ["--brand-2", "--brand-3"],
  ["--brand-3", "--brand-1"],
  ["--brand-1", "--brand-3"],
] as const;

/**
 * Visual panel for a project row. Uses the project's `cover` image when it has one;
 * otherwise draws artwork from the project itself: a brand-coloured gradient with a dotted
 * grid and the logos of its main technologies on glass tiles. Because it is built from the
 * `stack`, every project gets distinct art with no image files to maintain.
 *
 * @param project - The project to illustrate.
 * @param index - Position in the list; picks the colour palette.
 */
export default function ProjectArt({
  project,
  index,
}: {
  project: ProjectEntry;
  index: number;
}) {
  if (project.cover) {
    return (
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl border bg-muted">
        <Image
          src={assetPath(project.cover)}
          alt={`${project.name} preview`}
          fill
          sizes="(min-width: 1024px) 28rem, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover/project:scale-105 motion-reduce:transition-none"
        />
      </div>
    );
  }

  const [a, b] = PALETTES[index % PALETTES.length];
  // Prefer technologies that have a real logo; fall back to whatever is listed.
  const withLogo = project.stack.filter((s) => findTechIcon(s));
  const logos = (withLogo.length > 0 ? withLogo : project.stack).slice(0, 4);

  return (
    <div
      aria-hidden="true"
      className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl border"
      style={{
        backgroundImage: `linear-gradient(135deg, color-mix(in oklab, var(${a}) 38%, transparent), color-mix(in oklab, var(${b}) 22%, transparent))`,
      }}
    >
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(circle, color-mix(in oklab, var(--foreground) 22%, transparent) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
          maskImage:
            "radial-gradient(ellipse at center, #000 30%, transparent 75%)",
        }}
      />
      <div className="relative grid grid-cols-2 gap-3 transition-transform duration-500 ease-out group-hover/project:scale-105 motion-reduce:transition-none">
        {logos.map((name, i) => (
          <span
            key={name}
            className="flex size-16 items-center justify-center rounded-2xl border bg-background/70 shadow-lg shadow-black/5 backdrop-blur-sm sm:size-20"
            style={{ translate: i % 2 === 0 ? "0 -6px" : "0 6px" }}
          >
            <TechLogo name={name} className="size-8 sm:size-9" />
          </span>
        ))}
      </div>
    </div>
  );
}
