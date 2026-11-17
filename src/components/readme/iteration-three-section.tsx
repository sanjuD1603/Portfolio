import { Section } from "@/components/section";
import { Badge } from "@/components/ui/badge";
import { ITERATION_THREE_HIGHLIGHTS } from "@/data/readme";

/** `/readme` page section: Iteration 3. Content is defined in `src/data/readme.ts`. */
export default function IterationThreeSection() {
  return (
    <Section title="Development (Iteration 3)">
      <p className="mb-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        The third stage was about turning the site from a set of pages into
        something that talks back. The biggest piece is an AI chat assistant,
        answered by its own small server rather than the site itself, so it
        can run questions through a real AI model and look up my actual
        project, skill and experience data instead of guessing. The same
        panel can also pull up my booking calendar, so a visitor can go from
        asking a question to booking a call without leaving the chat.
      </p>
      <p className="mb-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Because that server can be reached by anyone on the internet, not
        just visitors to this site, I had to think about misuse as well as
        features. It now limits how many new chats and messages one visitor
        can start in an hour, caps the total across every visitor combined
        in a day, and checks that a request actually came from this site
        before answering it.
      </p>
      <p className="mb-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Alongside that, sections now animate into view as you scroll instead
        of sitting static, a video gallery joined the photo one, and every
        push of new code runs through an automatic check, formatting, type
        safety, a full test suite and a trial build, before the site or the
        chat server is allowed to go live. That test suite now covers 151
        checks on the site and 78 on the chat server, including the new
        limits above actually doing their job.
      </p>
      <div className="flex flex-wrap gap-1.5">
        {ITERATION_THREE_HIGHLIGHTS.map((h) => (
          <Badge key={h} variant="secondary" className="tag-inner-shadow">
            {h}
          </Badge>
        ))}
      </div>
    </Section>
  );
}
