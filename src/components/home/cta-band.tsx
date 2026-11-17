import { ArrowUpRight, Download } from "lucide-react";
import CalBooking from "@/components/cal-booking";
import Container from "@/components/common/container";
import { Button } from "@/components/ui/button";
import { assetPath } from "@/lib/assets";
import { profile } from "@/lib/data";

/** Closing call-to-action on the Home page, framed by a rotating gradient border. */
export default function CtaBand() {
  return (
    <Container className="py-16 lg:py-24">
      <div className="gradient-frame rounded-3xl p-[2px]">
        <div className="relative overflow-hidden rounded-[calc(1.5rem-2px)] bg-background px-6 py-12 text-center sm:px-12 lg:py-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 left-1/2 size-80 -translate-x-1/2 rounded-full bg-brand-2/20 blur-3xl"
          />
          <p className="eyebrow relative mb-4">Get in touch</p>
          <h2 className="relative mx-auto max-w-2xl text-3xl font-semibold tracking-tight sm:text-5xl">
            Have something to build?{" "}
            <span className="text-gradient">Let&apos;s talk.</span>
          </h2>
          <p className="text-secondary relative mx-auto mt-4 max-w-xl text-base leading-relaxed">
            Book a short intro call, send an email, or ask the chat in the
            corner anything about my work.
          </p>
          <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button
              size="lg"
              className="btn-inner-shadow shine h-11 px-5 text-base"
              // biome-ignore lint/a11y/useAnchorContent: Button injects its children into the rendered <a>.
              render={<a href={`mailto:${profile.email}`} />}
              nativeButton={false}
            >
              Email me
              <ArrowUpRight />
            </Button>
            <CalBooking
              variant="outline"
              className="btn-inner-shadow mt-0 h-11 px-5 text-base"
            />
            {profile.resumeUrl && (
              <Button
                size="lg"
                variant="ghost"
                className="h-11 px-5 text-base"
                // biome-ignore lint/a11y/useAnchorContent: Button injects its children into the rendered <a>.
                render={<a href={assetPath(profile.resumeUrl)} download />}
                nativeButton={false}
              >
                <Download />
                Resume
              </Button>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}
