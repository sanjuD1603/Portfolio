import dynamic from "next/dynamic";
import { PageHeader, Section } from "@/components/section";
import videoGalleryEvents from "@/data/gallery-videos.json";
import { galleryEvents } from "@/lib/data";

const GalleryCarousel = dynamic(() => import("@/components/gallery-carousel"), {
  loading: () => (
    <div className="aspect-video w-full animate-pulse rounded-xl bg-muted" />
  ),
});

/** Gallery: photo carousels per event plus a videos section. */
export default function GalleryPage() {
  return (
    <main className="flex-1">
      <PageHeader
        eyebrow="Moments"
        title="Gallery"
        subtitle="Moments from events, competitions and life."
      />
      <Section
        eager
        title="Photos"
        description="Pictures from events and competitions."
      >
        <div className="grid gap-6 sm:grid-cols-2">
          {galleryEvents.map((event) => (
            <GalleryCarousel
              key={event.title}
              title={event.title}
              description={event.description}
              images={event.images}
            />
          ))}
        </div>
      </Section>
      <Section title="Videos" description="Short clips from the same events.">
        <div className="grid gap-6 sm:grid-cols-2">
          {videoGalleryEvents.map((event) => (
            <GalleryCarousel
              key={event.title}
              title={event.title}
              description={event.description}
              images={event.videos}
              type="video"
            />
          ))}
        </div>
      </Section>
    </main>
  );
}
