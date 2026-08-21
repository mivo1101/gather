"use client";

import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";

function StarIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z" />
    </svg>
  );
}

function PinIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-5.2 7-11a7 7 0 10-14 0c0 5.8 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function EnvelopeIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7l9 7 9-7" />
    </svg>
  );
}

function HeartIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 21s-6.7-4.2-9.2-8.1C1.1 10.4 1.8 6.8 5 5.4c1.9-.8 4-.2 5.2 1.4C11.4 5.2 13.5 4.6 15.4 5.4c3.2 1.4 3.9 5 2.2 7.5C18.7 16.8 12 21 12 21z" />
    </svg>
  );
}

function GlobeIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" d="M3 12h18M12 3c2.5 2.8 3.8 5.8 3.8 9S14.5 18.2 12 21c-2.5-2.8-3.8-5.8-3.8-9S9.5 5.8 12 3z" />
    </svg>
  );
}

function ClockIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 2" />
    </svg>
  );
}

function CalendarIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path strokeLinecap="round" d="M8 3v4M16 3v4M3 10h18" />
    </svg>
  );
}

function ChevronIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function ChevronLeftIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function CardShell({
  children,
  tone = "cream",
}: {
  children: ReactNode;
  tone?: "cream" | "forest" | "berry" | "blush";
}) {
  const backgrounds = {
    cream:
      "radial-gradient(circle at 92% 5%, rgba(255, 96, 170, 0.13), transparent 34%), linear-gradient(145deg, #ffffff 0%, #fff8f4 100%)",
    forest:
      "radial-gradient(circle at 92% 8%, rgba(255, 96, 170, 0.24), transparent 36%), linear-gradient(145deg, #191919 0%, #000000 100%)",
    berry:
      "radial-gradient(circle at 84% 8%, rgba(255, 96, 170, 0.3), transparent 32%), radial-gradient(circle at 12% 88%, rgba(255, 96, 170, 0.12), transparent 38%), linear-gradient(150deg, #211019 0%, #120d11 48%, #050505 100%)",
    blush:
      "radial-gradient(circle at 0% 100%, rgba(255,255,255,0.42), transparent 42%), linear-gradient(145deg, #ff9dcc 0%, #ff60aa 100%)",
  };
  const dark = tone === "forest" || tone === "berry";

  return (
    <div
      className={`relative flex h-full w-full flex-col overflow-hidden rounded-[1.75rem] border shadow-[0_22px_55px_rgba(0,0,0,0.16)] ${dark ? "border-white/10" : "border-black/5"}`}
      style={{ background: backgrounds[tone] }}
    >
      {children}
    </div>
  );
}

function formatInviteDateTime(date: Date) {
  const weekday = date.toLocaleDateString("en-AU", { weekday: "long" });
  const fullDate = date.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const time = date.toLocaleTimeString("en-AU", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return { weekday, fullDate, time };
}

function LiveTime() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  if (!now) {
    return (
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-signature">
          <ClockIcon />
        </span>
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-signature">
            Time
          </p>
          <p className="mt-0.5 h-5 text-sm font-medium text-black" aria-hidden="true" />
        </div>
      </div>
    );
  }

  const { time } = formatInviteDateTime(now);

  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-signature">
        <ClockIcon />
      </span>
      <div>
        <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-signature">
          Time
        </p>
        <p className="mt-0.5 text-sm font-medium tabular-nums text-black">{time}</p>
      </div>
    </div>
  );
}

function LiveDateRow() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-signature">
        <CalendarIcon />
      </span>
      <div>
        <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-signature">
          Date
        </p>
        <p className="mt-0.5 text-sm font-medium text-black">
          {now ? formatInviteDateTime(now).fullDate : "\u00A0"}
        </p>
      </div>
    </div>
  );
}

function CoverCard() {
  return (
    <CardShell tone="berry">
      <div className="pointer-events-none absolute inset-3 rounded-[1.35rem] border border-signature/45" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-5 rounded-[1.1rem] border border-white/[0.06]" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 text-signature" aria-hidden="true">
        <StarIcon className="absolute left-8 top-9 h-3.5 w-3.5 opacity-75" />
        <StarIcon className="absolute right-9 top-14 h-2.5 w-2.5 opacity-55" />
        <StarIcon className="absolute bottom-16 left-7 h-2 w-2 opacity-45" />
        <StarIcon className="absolute bottom-9 right-8 h-4 w-4 opacity-65" />
        <span className="absolute right-16 top-8 h-1.5 w-1.5 rounded-full bg-white/35" />
        <span className="absolute bottom-24 left-11 h-1 w-1 rounded-full bg-white/35" />
      </div>

      <div className="relative z-20 flex flex-1 flex-col px-8 pb-6 pt-10 text-center">
        <p className="text-sm font-semibold tracking-tight text-white/80">
          Gather represents
        </p>
        <div className="mx-auto mt-3 flex items-center gap-2 text-signature/80">
          <span className="h-px w-7 bg-current" aria-hidden="true" />
          <StarIcon className="h-3 w-3" />
          <span className="h-px w-7 bg-current" aria-hidden="true" />
        </div>
        <p className="mt-3 text-[10px] uppercase tracking-[0.16em] text-white/55">
          A private invitation for
        </p>
        <p className="mt-0.5 font-[family-name:var(--font-windsong)] text-[2.6rem] leading-none text-signature">
          You
        </p>
        <h4 className="mt-3 font-[family-name:var(--font-instrument-serif)] text-[1.85rem] leading-[0.96] text-white">
          Come experience
          <span className="mt-1 block italic text-signature">Gather</span>
        </h4>
        <p className="mt-3 text-[8px] font-semibold uppercase tracking-[0.22em] text-white/45">
          Design · Connect · Celebrate
        </p>
        <div className="mt-auto flex flex-col items-center gap-2">
          <p className="text-[8px] uppercase tracking-[0.18em] text-white/45">
            Melbourne · 21 August 2026
          </p>
          <span className="rounded-full border border-white/15 bg-signature px-4 py-2 text-[8px] font-semibold uppercase tracking-[0.17em] text-white shadow-[0_8px_22px_rgba(255,96,170,0.3)]">
            Open invitation&nbsp; →
          </span>
        </div>
      </div>

    </CardShell>
  );
}

function InviteCard() {
  return (
    <CardShell tone="cream">
      <div className="pointer-events-none absolute inset-3 rounded-[1.35rem] border border-signature/20" aria-hidden="true" />
      <div className="relative z-20 flex flex-1 flex-col px-8 pb-7 pt-8 text-center">
        <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-signature">
          You&apos;re invited
        </p>
        <div className="mx-auto mt-2 h-px w-12 bg-signature/70" aria-hidden="true" />
        <h4 className="mt-3 font-[family-name:var(--font-instrument-serif)] text-[2rem] leading-[0.96] text-black">
          A beautiful way
          <span className="mt-1 block italic text-signature">to gather</span>
        </h4>
        <p className="mx-auto mt-3 max-w-[13.5rem] text-[11px] leading-relaxed text-grey">
          Join us for a first look at invitations designed to feel personal,
          thoughtful and genuinely memorable.
        </p>
        <div className="relative mt-auto h-28" aria-hidden="true">
          <Image
            src="/images/graphics/wedding/watercolour/champagne-toast.png"
            alt=""
            fill
            sizes="220px"
            className="object-contain object-bottom drop-shadow-[0_7px_12px_rgba(91,68,47,0.12)]"
          />
        </div>
        <p className="mt-1 font-[family-name:var(--font-windsong)] text-2xl leading-none text-signature">
          We&apos;d love you there
        </p>
      </div>
      <span className="pointer-events-none absolute right-5 top-10 text-signature/60" aria-hidden="true">
        <StarIcon className="h-4 w-4" />
      </span>
    </CardShell>
  );
}

function DetailsCard() {
  return (
    <CardShell tone="cream">
      <div className="pointer-events-none absolute inset-3 rounded-[1.35rem] border border-signature/20" aria-hidden="true" />
      <Image
        src="/images/graphics/wedding/watercolour/botanical-corner.png"
        alt=""
        width={1200}
        height={1200}
        sizes="176px"
        className="pointer-events-none absolute -bottom-12 -left-14 w-44 select-none opacity-70"
        aria-hidden="true"
      />
      <div className="relative z-20 flex flex-1 flex-col px-8 pb-7 pt-5">
        <div className="text-center">
          <span className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-black text-signature">
            <PinIcon className="h-4 w-4" />
          </span>
          <p className="mt-2 text-[9px] font-semibold uppercase tracking-[0.25em] text-signature">
            When & where
          </p>
          <h4 className="mt-1 font-[family-name:var(--font-instrument-serif)] text-3xl leading-none text-black">
            Gather House
          </h4>
          <p className="mt-1 text-[11px] text-grey">Melbourne, Australia</p>
        </div>

        <div className="mt-4 space-y-2 rounded-2xl border border-black/5 bg-white/80 p-4 shadow-[0_8px_25px_rgba(0,0,0,0.06)] backdrop-blur-sm">
          <LiveDateRow />
          <div className="h-px bg-black/10" aria-hidden="true" />
          <LiveTime />
          <div className="h-px bg-black/10" aria-hidden="true" />
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-signature">
              <GlobeIcon />
            </span>
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-signature">
                Online
              </p>
              <p className="mt-0.5 text-sm font-medium text-black">
                gather.com
              </p>
            </div>
          </div>
        </div>
        <span className="mt-auto self-end rounded-full bg-black px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white">
          Open location
        </span>
      </div>
    </CardShell>
  );
}

function RsvpCard() {
  return (
    <CardShell tone="cream">
      <Image
        src="/images/graphics/wedding/watercolour/botanical-corner.png"
        alt=""
        width={1200}
        height={1200}
        sizes="176px"
        className="pointer-events-none absolute -right-16 -top-16 w-44 rotate-180 select-none opacity-45"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-3 rounded-[1.35rem] border border-signature/20" aria-hidden="true" />
      <div className="relative z-20 flex flex-1 flex-col px-8 pb-7 pt-5">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-signature">
            <EnvelopeIcon className="h-4 w-4" />
          </span>
          <p className="mt-2 text-[9px] font-semibold uppercase tracking-[0.25em] text-black/65">
            Kindly respond
          </p>
          <h4 className="mt-1 max-w-[14rem] font-[family-name:var(--font-instrument-serif)] text-[1.85rem] leading-[1.02] text-black">
            Will you be joining us?
          </h4>
          <p className="mt-2 text-[10px] leading-relaxed text-black/65">
            Choose a response below - we&apos;ll save it instantly.
          </p>
        </div>

        <div className="mt-4 flex flex-col gap-2.5">
          <button
            type="button"
            tabIndex={-1}
            className="rounded-full bg-black px-4 py-2.5 text-sm font-medium text-white shadow-[0_6px_15px_rgba(0,0,0,0.18)] transition-transform hover:scale-[1.02]"
          >
            ✓ Yes, can&apos;t wait!
          </button>
          <button
            type="button"
            tabIndex={-1}
            className="rounded-full border border-black/20 bg-signature/10 px-4 py-2.5 text-sm font-medium text-black transition-colors hover:bg-signature/15"
          >
            ✕ Sorry, can&apos;t make it
          </button>
        </div>

        <div className="mt-auto pt-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-black/70">
            Leave us a message (optional)
          </p>
          <div className="mt-2 rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-sm text-black/55 backdrop-blur-sm">
            Write something lovely…
          </div>
        </div>
      </div>
    </CardShell>
  );
}

function ThanksCard() {
  return (
    <CardShell tone="forest">
      <div className="pointer-events-none absolute inset-3 rounded-[1.35rem] border border-signature/35" aria-hidden="true" />
      <Image
        src="/images/graphics/wedding/editorial/romantic-botanical.png"
        alt=""
        width={1100}
        height={1100}
        sizes="208px"
        className="pointer-events-none absolute -bottom-20 left-1/2 w-52 -translate-x-1/2 select-none opacity-90 drop-shadow-[0_8px_18px_rgba(0,0,0,0.2)]"
        aria-hidden="true"
      />
      <div className="relative z-20 flex flex-1 flex-col px-8 pb-7 pt-5 text-center">
        <span className="mx-auto flex h-8 w-8 items-center justify-center rounded-full border border-signature/55 bg-signature/10 text-signature">
          <HeartIcon className="h-4 w-4" />
        </span>
        <p className="mt-3 text-[9px] font-semibold uppercase tracking-[0.28em] text-white/75">
          Your response is in
        </p>
        <h4 className="mt-3 font-[family-name:var(--font-instrument-serif)] text-[2rem] leading-[0.98] text-white">
          We can&apos;t wait
          <span className="mt-1 block italic text-signature">to gather</span>
        </h4>
        <p className="mx-auto mt-3 max-w-[13rem] text-[11px] leading-relaxed text-white/65">
          Thank you for being part of the moments that matter.
        </p>
        <div className="mt-3 flex items-center justify-center gap-2 text-signature/70">
          <span className="h-px w-8 bg-current" aria-hidden="true" />
          <StarIcon className="h-3 w-3" />
          <span className="h-px w-8 bg-current" aria-hidden="true" />
        </div>
        <p className="mt-2 text-[10px] text-white/55">With love,</p>
        <p className="font-[family-name:var(--font-windsong)] text-3xl leading-none text-signature">
          Gather Team
        </p>
        <span className="mx-auto mt-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[8px] font-semibold uppercase tracking-[0.18em] text-white/75">
          Every guest is your +1
        </span>
      </div>
    </CardShell>
  );
}

const cards = [
  { id: "cover", label: "Cover", content: <CoverCard /> },
  { id: "invite", label: "Invitation", content: <InviteCard /> },
  { id: "details", label: "Event Details", content: <DetailsCard /> },
  { id: "rsvp", label: "RSVP", content: <RsvpCard /> },
  { id: "thanks", label: "Thank You", content: <ThanksCard /> },
];

/** Card stack preview demonstrating the no-scroll invitation experience */
function CardStackPreview() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const goNext = () => setActiveIndex((i) => (i + 1) % cards.length);
  const goPrev = () =>
    setActiveIndex((i) => (i - 1 + cards.length) % cards.length);

  return (
    <div className="relative mx-auto w-full max-w-[280px] sm:max-w-xs">
      <div
        className="mb-4 flex justify-center gap-2"
        role="tablist"
        aria-label="Invitation card navigation"
      >
        {cards.map((card, index) => (
          <button
            key={card.id}
            type="button"
            role="tab"
            aria-selected={activeIndex === index}
            aria-controls={`card-panel-${card.id}`}
            onClick={() => setActiveIndex(index)}
            className={`h-2 rounded-full transition-all ${
              activeIndex === index
                ? "w-6 bg-signature"
                : "w-2 bg-black/10 hover:bg-black/20"
            }`}
            aria-label={`View ${card.label} card`}
          />
        ))}
      </div>

      <div
        className="relative aspect-[3/4] w-full"
        onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchStartX === null) return;
          const delta = e.changedTouches[0].clientX - touchStartX;
          if (delta < -40) goNext();
          if (delta > 40) goPrev();
          setTouchStartX(null);
        }}
      >
        {cards.map((card, index) => (
          <div
            key={card.id}
            id={`card-panel-${card.id}`}
            role="tabpanel"
            aria-hidden={activeIndex !== index}
            className={`absolute inset-0 transition-all duration-500 ${
              activeIndex === index
                ? "z-10 translate-x-0 opacity-100"
                : index < activeIndex
                  ? "z-0 -translate-x-6 opacity-0"
                  : "z-0 translate-x-6 opacity-0"
            }`}
          >
            {card.content}
          </div>
        ))}

        {activeIndex > 0 && (
          <button
            type="button"
            onClick={goPrev}
            className="absolute -left-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-signature shadow-md transition-transform hover:scale-105"
            aria-label="Previous card"
          >
            <ChevronLeftIcon />
          </button>
        )}

        {activeIndex < cards.length - 1 && (
          <button
            type="button"
            onClick={goNext}
            className="absolute -right-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-signature shadow-md transition-transform hover:scale-105"
            aria-label="Next card"
          >
            <ChevronIcon />
          </button>
        )}
      </div>
    </div>
  );
}

const highlights = [
  {
    text: "Tap or swipe to open a beautifully animated envelope",
    icon: (
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7l9 7 9-7" />
      </svg>
    ),
  },
  {
    text: "One focused page at a time, with no long invitation page to scroll",
    icon: (
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <rect x="7" y="3" width="10" height="18" rx="2" />
        <circle cx="12" cy="8" r="1.5" />
      </svg>
    ),
  },
  {
    text: "Add guest names, maps, attendance buttons and custom questions",
    icon: (
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 20s-6.2-3.9-8.5-7.5C1.8 9.8 2.6 6.6 5.5 5.4c1.7-.7 3.6-.1 4.7 1.3C11.3 5.3 13.2 4.7 14.9 5.4c2.9 1.2 3.7 4.4 2 7.1C18.2 16.1 12 20 12 20z" />
      </svg>
    ),
  },
  {
    text: "Works seamlessly on mobile, tablet, laptop, and desktop",
    icon: (
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <rect x="4" y="4" width="9" height="16" rx="1.5" />
        <rect x="11" y="4" width="9" height="16" rx="1.5" />
      </svg>
    ),
  },
];

export function InteractiveExperience() {
  return (
    <section id="guest-experience" className="bg-soft-grey py-14 sm:py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,0.75fr)] lg:gap-8">
          <div className="min-w-0">
            <h2 className="text-2xl font-bold tracking-tight text-black sm:text-3xl md:text-4xl">
              An invitation experience,{" "}
              <span className="mt-1 block text-3xl text-signature sm:text-4xl md:text-5xl">
                designed to be opened
              </span>
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-grey sm:text-base">
              Every guest opens an invitation made for them, then moves through
              your event one beautifully{" "}
              <br className="hidden md:block" />
              designed page at a time. They can view the location, answer your
              questions and RSVP without leaving the invitation.
            </p>
            <ul className="mt-8 flex flex-col gap-4">
              {highlights.map((item) => (
                <li key={item.text} className="flex items-start gap-3">
                  <span
                    className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-signature/10 text-signature"
                    aria-hidden="true"
                  >
                    {item.icon}
                  </span>
                  <span className="text-base leading-relaxed text-black">
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-center px-4 lg:justify-end lg:px-0 lg:pl-2">
            <CardStackPreview />
          </div>
        </div>
      </div>
    </section>
  );
}
