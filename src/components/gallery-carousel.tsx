"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function GalleryCarousel({
  title,
  description,
  images,
}: {
  title: string;
  description: string;
  images: string[];
}) {
  const [index, setIndex] = useState(0);

  function prev() {
    setIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  }

  function next() {
    setIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  }

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-video w-full bg-muted">
        <Image
          src={images[index]}
          alt={`${title} photo ${index + 1}`}
          fill
          className="object-cover"
          priority={index === 0}
        />
        <Button
          type="button"
          variant="secondary"
          size="icon-sm"
          onClick={prev}
          aria-label="Previous photo"
          className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full"
        >
          <ChevronLeft />
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="icon-sm"
          onClick={next}
          aria-label="Next photo"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full"
        >
          <ChevronRight />
        </Button>
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {images.map((image, i) => (
            <button
              key={image}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to photo ${i + 1}`}
              className={`size-1.5 rounded-full transition-all ${
                i === index ? "w-4 bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
      <CardContent>
        <h3 className="font-heading text-lg font-medium">{title}</h3>
        <p className="text-secondary text-sm">{description}</p>
      </CardContent>
    </Card>
  );
}
