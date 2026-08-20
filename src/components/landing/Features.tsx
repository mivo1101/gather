"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type FeatureId =
  | "workspace"
  | "editor"
  | "interactive"
  | "guests"
  | "email"
  | "rsvps";

const features: {
  id: FeatureId;
  number: string;
  eyebrow: string;
  title: string;
  description: string;
}[] = [
  {
    id: "workspace",
    number: "01",
    eyebrow: "Event workspace",
    title: "Everything begins in one place",
    description:
      "Keep the invitation, event details, guests, email campaign and responses together from the first idea to the final RSVP.",
  },
  {
    id: "editor",
    number: "02",
    eyebrow: "Canvas editor",
    title: "Design without being boxed in",
    description:
      "Start with a template or a blank canvas, add pages, and make every detail yours with type, imagery, shapes and backgrounds.",
  },
  {
    id: "interactive",
    number: "03",
    eyebrow: "Interactive blocks",
    title: "Make the invitation do more",
    description:
      "Place guest names, maps, attendance buttons, open answers and custom choices directly inside the design.",
  },
  {
    id: "guests",
    number: "04",
    eyebrow: "Guest list",
    title: "Bring everyone in, beautifully",
    description:
      "Add guests directly or import a prepared CSV, then use the exact display name you want each person to see.",
  },
  {
    id: "email",
    number: "05",
    eyebrow: "Invitation email",
    title: "Send it with the same care",
    description:
      "Write the message, choose an image, preview it for a real guest and send yourself a test before it goes out.",
  },
  {
    id: "rsvps",
    number: "06",
    eyebrow: "RSVP overview",
    title: "Know exactly who is coming",
    description:
      "See who is attending, who declined and who still needs to respond without piecing together messages and spreadsheets.",
  },
];

const previewImages: Record<FeatureId, { src: string; alt: string }> = {
  workspace: {
    src: "/images/landing/product-tour/workspace.webp",
    alt: "Gather event workspace with invitation design, setup progress and response totals",
  },
  editor: {
    src: "/images/landing/product-tour/editor.webp",
    alt: "Gather invitation editor with design tools, canvas, page strip and style controls",
  },
  interactive: {
    src: "/images/landing/product-tour/interactive.webp",
    alt: "Gather invitation editor showing personalised interactive invitation blocks",
  },
  guests: {
    src: "/images/landing/product-tour/guests.webp",
    alt: "Gather guest list showing display names and CSV import",
  },
  email: {
    src: "/images/landing/product-tour/email.webp",
    alt: "Gather email composer with a branded invitation preview",
  },
  rsvps: {
    src: "/images/landing/product-tour/rsvps.webp",
    alt: "Gather RSVP overview with attendance totals for a large event",
  },
};

function ProductPreview({ active }: { active: FeatureId }) {
  return (
    <div className="relative">
      <div
        className="absolute -inset-10 rounded-full bg-signature/10 blur-3xl"
        aria-hidden="true"
      />
      <div className="relative aspect-[1.84] overflow-hidden rounded-[26px] border border-white/15 bg-[#f7f7f7] shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
        {features.map((feature, index) => {
          const image = previewImages[feature.id];
          const isActive = feature.id === active;

          return (
            <Image
              key={feature.id}
              src={image.src}
              alt={isActive ? image.alt : ""}
              fill
              priority={index === 0}
              unoptimized
              sizes="(min-width: 1024px) 670px, (min-width: 640px) 90vw, calc(100vw - 40px)"
              className={`object-cover object-top transition-[opacity,transform] duration-300 ease-out ${
                isActive
                  ? "scale-100 opacity-100"
                  : "pointer-events-none scale-[1.008] opacity-0"
              }`}
              aria-hidden={!isActive}
            />
          );
        })}
      </div>
    </div>
  );
}

export function Features() {
  const [active, setActive] = useState<FeatureId>(features[0].id);
  const [storyPosition, setStoryPosition] = useState(0);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let frame = 0;

    const updateActiveStory = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const section = sectionRef.current;
        if (!section) return;

        const rect = section.getBoundingClientRect();
        const travel = Math.max(rect.height - window.innerHeight, 1);
        const progress = Math.min(0.9999, Math.max(0, -rect.top / travel));
        const lastIndex = features.length - 1;
        const rawPosition = progress * lastIndex;
        let nextPosition = lastIndex;

        if (rawPosition < lastIndex) {
          const baseIndex = Math.floor(rawPosition);
          const localProgress = rawPosition - baseIndex;
          const transitionProgress = Math.min(
            1,
            Math.max(0, (localProgress - 0.18) / 0.64),
          );
          const easedProgress =
            transitionProgress *
            transitionProgress *
            (3 - 2 * transitionProgress);
          nextPosition = baseIndex + easedProgress;
        }

        const nextIndex = Math.min(lastIndex, Math.round(nextPosition));
        setStoryPosition(nextPosition);
        setActive(features[nextIndex].id);
      });
    };

    updateActiveStory();
    window.addEventListener("scroll", updateActiveStory, { passive: true });
    window.addEventListener("resize", updateActiveStory);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateActiveStory);
      window.removeEventListener("resize", updateActiveStory);
    };
  }, []);

  const activeIndex = features.findIndex((feature) => feature.id === active);
  const activeFeature = features[activeIndex];
  const storyItemHeight = 230;
  const storyTrackOffset =
    -(storyItemHeight / 2 + storyPosition * storyItemHeight);

  return (
    <section
      ref={sectionRef}
      id="features"
      className="relative h-[200vh] overflow-x-clip bg-black"
    >
      <div className="sticky top-0 flex h-screen items-center overflow-hidden pb-0 pt-[68px]">
        <div className="mx-auto w-full max-w-6xl px-5 sm:px-6">
          <div className="max-w-3xl">
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl xl:text-5xl">
              Plan it. Design it. Send it.
              <span className="block text-signature">Gather everyone.</span>
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-grey md:text-base">
              Follow one event from the first design decision to the final guest
              response.
            </p>
          </div>

          <div className="mt-6 grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1.28fr)_minmax(300px,0.72fr)] lg:items-center lg:gap-14">
            <div className="min-w-0">
              <ProductPreview active={active} />
              <div className="mt-3 flex items-center justify-between text-[9px] font-semibold uppercase tracking-[0.15em] text-white/35">
                <span className="hidden sm:inline">Gather product tour</span>
                <span className="truncate pr-4 sm:hidden">
                  {activeFeature.title}
                </span>
                <span>
                  {activeIndex + 1} / {features.length}
                </span>
              </div>
            </div>

            <div
              className="relative hidden h-[calc(clamp(330px,48vh,430px)_+_44px)] min-w-0 overflow-hidden lg:block"
              style={{
                maskImage:
                  "linear-gradient(to bottom, transparent 0%, black 14%, black 86%, transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(to bottom, transparent 0%, black 14%, black 86%, transparent 100%)",
              }}
            >
              <span
                className="absolute bottom-0 left-4 top-0 w-px bg-white/10"
                aria-hidden="true"
              />
              <ol
                className="absolute inset-x-0 top-1/2 transition-transform duration-100 ease-out will-change-transform"
                style={{
                  transform: `translate3d(0, ${storyTrackOffset}px, 0)`,
                }}
              >
                {features.map((feature, index) => {
                  const distance = Math.abs(index - storyPosition);
                  const isCurrent = Math.abs(index - activeIndex) < 0.5;
                  return (
                    <li
                      key={feature.id}
                      className="relative h-[230px] pl-10 pr-2 transition-opacity duration-100"
                      style={{ opacity: Math.max(0.05, 1 - distance * 0.82) }}
                    >
                      <span
                        className={`absolute left-[7px] top-[106px] flex h-[18px] w-[18px] items-center justify-center rounded-full border border-white/10 transition-colors duration-200 ${
                          isCurrent ? "bg-signature/20" : "bg-black"
                        }`}
                        aria-hidden="true"
                      >
                        <span
                          className={`h-2 w-2 rounded-full transition-colors duration-200 ${
                            isCurrent ? "bg-signature" : "bg-white/20"
                          }`}
                        />
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-signature">
                          {feature.number}
                        </span>
                        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/75">
                          {feature.eyebrow}
                        </span>
                      </div>
                      <h3 className="mt-3 text-2xl font-semibold leading-tight text-white md:text-3xl">
                        {feature.title}
                      </h3>
                      <p className="mt-3 max-w-md text-sm leading-6 text-grey">
                        {feature.description}
                      </p>
                      <span className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-signature">
                        Explore feature <span aria-hidden="true">→</span>
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
