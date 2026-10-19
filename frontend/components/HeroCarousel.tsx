"use client";

import { useEffect, useState } from "react";

const SLIDE_INTERVAL_MS = 6000;

export type HeroImage = { src: string; alt: string };

export default function HeroCarousel({ images }: { images: HeroImage[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (images.length <= 1 || paused) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, SLIDE_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [images.length, paused, index]);

  return (
    <div
      className="hero-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {images.map((image, i) => (
        <div
          key={image.src}
          className={`hero-slide${i === index ? " active" : ""}`}
          aria-hidden={i !== index}
        >
          <img src={image.src} alt={image.alt} fetchPriority={i === 0 ? "high" : "auto"} />
        </div>
      ))}

      {images.length > 1 && (
        <div className="hero-dots">
          {images.map((image, i) => (
            <button
              key={image.src}
              type="button"
              className={`hero-dot${i === index ? " active" : ""}`}
              aria-label={`${i + 1}枚目を表示`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
