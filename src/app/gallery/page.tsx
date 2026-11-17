import GalleryCarousel from "@/components/gallery-carousel";
import { PageHeader, Section } from "@/components/section";
import videoGalleryEvents from "@/data/gallery-videos.json";
import { galleryEvents } from "@/lib/data";

export default function GalleryPage() {
  return (
    <main className="flex-1">
      <PageHeader
        title="Gallery"
        subtitle="Moments from events, competitions and life."
      />
      <Section title="Photos">
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
      <Section title="Videos">
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
