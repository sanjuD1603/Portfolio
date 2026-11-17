import { ArrowRight, MapPin } from "lucide-react";
import Image from "next/image";
import { Link } from "next-view-transitions";
import TiltCard from "@/components/effects/tilt-card";
import SocialLinks from "@/components/social-links";
import { Button } from "@/components/ui/button";
import { assetPath } from "@/lib/assets";
import { profile } from "@/lib/data";

/** Inline style carrying an animation delay into the `.rise` / `.word-inner` CSS. */
function delay(ms: number) {
  return { "--d": `${ms}ms` } as React.CSSProperties;
}

/**
 * Home-page hero: a two-column, full-width intro. Left: location chip, the name revealed
 * word by word, role, short bio, calls to action and social links. Right: the avatar in
 * a rotating gradient frame that tilts towards the cursor. All entrance motion is CSS-only
 * (see globals.css), so the text is on screen before JavaScript loads and respects reduced
 * motion.
 */
export default function Hero() {
  const words = profile.name.split(" ");

  return (
    <section className="relative overflow-x-clip">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-14 px-6 pt-14 pb-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-10 lg:pt-24 lg:pb-24">
        <div className="flex flex-col items-start gap-6">
          <p
            className="rise inline-flex items-center gap-2 rounded-full border bg-card/70 px-3.5 py-1.5 text-sm text-foreground/80"
            style={delay(0)}
          >
            <MapPin className="size-3.5 text-brand-2" />
            {profile.location}
          </p>

          <div>
            <p className="rise text-secondary mb-2 text-lg" style={delay(60)}>
              Hi, I&apos;m
            </p>
            <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
              {words.map((word, i) => (
                <span key={word}>
                  <span className="inline-block overflow-hidden pb-[0.12em] align-bottom">
                    <span
                      className={
                        i === 0
                          ? "word-inner inline-block"
                          : "word-inner text-gradient inline-block"
                      }
                      style={delay(120 + i * 110)}
                    >
                      {word}
                    </span>
                  </span>
                  {i < words.length - 1 ? " " : ""}
                </span>
              ))}
            </h1>
          </div>

          <p
            className="rise text-xl font-medium text-foreground/90 sm:text-2xl"
            style={delay(480)}
          >
            {profile.role}
          </p>
          <p
            className="rise text-secondary max-w-xl text-base leading-relaxed sm:text-lg"
            style={delay(560)}
          >
            {profile.intro}
          </p>

          <div
            className="rise flex flex-wrap items-center gap-3"
            style={delay(640)}
          >
            <Button
              size="lg"
              className="btn-inner-shadow shine h-11 px-5 text-base"
              render={<Link href="/experience" />}
              nativeButton={false}
            >
              View experience
              <ArrowRight />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="btn-inner-shadow h-11 px-5 text-base"
              render={<Link href="/about" />}
              nativeButton={false}
            >
              About me
            </Button>
          </div>

          <div className="rise" style={delay(720)}>
            <SocialLinks />
          </div>
        </div>

        <div
          className="rise relative mx-auto w-full max-w-sm lg:max-w-md"
          style={delay(300)}
        >
          <TiltCard>
            <div className="gradient-ring rounded-[2rem] p-[3px] shadow-2xl shadow-brand-2/20">
              <div className="relative aspect-square overflow-hidden rounded-[calc(2rem-3px)] bg-card">
                {profile.avatar ? (
                  <Image
                    src={assetPath(profile.avatar)}
                    alt={profile.name}
                    fill
                    sizes="(min-width: 1024px) 28rem, 24rem"
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-6xl font-semibold text-muted-foreground">
                    MD
                  </div>
                )}
              </div>
            </div>
          </TiltCard>
        </div>
      </div>
    </section>
  );
}
