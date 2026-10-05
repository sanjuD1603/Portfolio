import { ArrowUpRight, FolderGit2 } from "lucide-react";
import { Link } from "next-view-transitions";
import { GithubIcon } from "@/components/icons/github";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAllProjects } from "@/lib/project";

export default function ProjectGrid({ limit }: { limit?: number }) {
  const projects = getAllProjects().slice(0, limit);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {projects.map((p) => (
        <Card
          key={p.slug}
          className="group/project transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:ring-foreground/25"
        >
          <CardHeader>
            <div className="mb-3 flex items-center justify-between">
              <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover/project:bg-primary group-hover/project:text-primary-foreground">
                <FolderGit2 className="size-4" />
              </span>
              <div className="flex items-center gap-3">
                {p.github && (
                  <a
                    href={p.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="View source on GitHub"
                    className="text-secondary hover:text-foreground transition-colors"
                  >
                    <GithubIcon className="size-4" />
                  </a>
                )}
                {p.link && (
                  <a
                    href={p.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Open live site"
                    className="text-secondary hover:text-foreground transition-colors"
                  >
                    <ArrowUpRight className="size-4" />
                  </a>
                )}
              </div>
            </div>
            <CardTitle className="text-lg">
              <Link
                href={`/projects/${p.slug}`}
                className="group-hover/project:text-primary inline-flex items-center gap-1 hover:underline"
              >
                {p.name}
              </Link>
            </CardTitle>
            <CardDescription className="leading-relaxed">
              {p.summary}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1" />
          <CardFooter className="flex flex-wrap gap-1.5 border-t-0 bg-transparent pt-0">
            {p.stack.map((s) => (
              <Badge
                key={s}
                variant="secondary"
                className="tag-inner-shadow font-normal"
              >
                {s}
              </Badge>
            ))}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
