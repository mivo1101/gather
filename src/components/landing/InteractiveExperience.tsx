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

function BuildingArt() {
  return (
    <svg className="mx-auto h-20 w-36 text-signature" viewBox="0 0 160 96" fill="none" aria-hidden="true">
      <path stroke="currentColor" strokeWidth="1.4" d="M28 88V42l52-26 52 26v46" />
      <path stroke="currentColor" strokeWidth="1.4" d="M48 88V54h64v34" />
      <path stroke="currentColor" strokeWidth="1.2" d="M64 88V66h32v22M72 72h4M84 72h4M72 80h4M84 80h4" />
      <path stroke="currentColor" strokeWidth="1.2" d="M20 88h120M36 42h88" />
      <circle cx="80" cy="34" r="3" fill="currentColor" />
      <path stroke="currentColor" strokeWidth="1.2" d="M18 70c6-10 14-10 20 0M122 70c6-10 14-10 20 0" />
    </svg>
  );
}

function CardShell({
  step,
  total,
  children,
}: {
  step: number;
  total: number;
  children: ReactNode;
}) {
  return (
    <div
      className="relative flex h-full w-full flex-col overflow-hidden rounded-[1.75rem] border border-black/5 shadow-[0_16px_40px_rgba(0,0,0,0.08)]"
      style={{
        background:
          "linear-gradient(180deg, #ffffff 0%, #fff8f4 55%, #ffe4f0 100%)",
      }}
    >
      <div className="relative z-10 flex gap-1.5 px-6 pt-4" aria-hidden="true">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={`h-1 flex-1 rounded-full ${
              i <= step ? "bg-signature" : "bg-signature/20"
            }`}
          />
        ))}
      </div>
      {children}
    </div>
  );
}

const CARD_TOTAL = 5;

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

function TodayLabel() {
  return (
    <div className="mt-auto pt-6 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-signature">
        Today
      </p>
    </div>
  );
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
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-signature">
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
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-signature">
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
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-signature">
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
    <CardShell step={0} total={CARD_TOTAL}>
      <div className="relative z-10 flex flex-1 flex-col px-7 pb-6 pt-4">
        <div className="flex flex-1 flex-col items-center justify-start pt-6 text-center">
          <span className="text-signature">
            <StarIcon className="h-5 w-5" />
          </span>
          <p className="mt-4 text-sm text-grey">From the Gather Team,</p>
          <p className="mt-2 text-sm text-grey">
            To{" "}
            <span className="font-[family-name:var(--font-cursive)] text-3xl font-normal leading-none text-signature">
              You
            </span>
          </p>
          <div className="mt-3 h-0.5 w-10 bg-signature" aria-hidden="true" />
          <p className="mt-4 max-w-[16rem] text-3xl font-bold leading-snug text-black">
            Open your{" "}
            <span className="text-signature">first invitation</span>
          </p>
        </div>

        <TodayLabel />
      </div>

      <Image
        src="/images/flowers/flower-2.png"
        alt=""
        width={110}
        height={110}
        className="pointer-events-none absolute -bottom-1 -right-2 w-24 select-none"
        aria-hidden="true"
      />
    </CardShell>
  );
}

function InviteCard() {
  return (
    <CardShell step={1} total={CARD_TOTAL}>
      <div className="relative z-10 flex flex-1 flex-col px-7 pb-6 pt-4">
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <span className="text-signature">
            <StarIcon className="h-5 w-5" />
          </span>
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-signature">
            You&apos;re invited
          </p>
          <h4 className="mt-2 text-2xl font-bold leading-tight text-black">
            Experience <span className="text-signature">Gather</span>
          </h4>
          <div className="mt-2 h-0.5 w-10 bg-signature" aria-hidden="true" />
          <p className="mt-3 max-w-[15rem] text-sm leading-relaxed text-grey">
            We help you create beautifully crafted, interactive invitations for
            every event, gathering, and meaningful occasion.
          </p>
          <p className="mt-4 font-[family-name:var(--font-cursive)] text-2xl text-signature">
            Create Yours Now!
          </p>
        </div>
      </div>
    </CardShell>
  );
}

function DetailsCard() {
  return (
    <CardShell step={2} total={CARD_TOTAL}>
      <div className="relative z-10 flex flex-1 flex-col px-7 pb-6 pt-4">
        <div className="flex flex-col items-center text-center">
          <span className="text-signature">
            <PinIcon className="h-5 w-5" />
          </span>
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-signature">
            Event details
          </p>
          <h4 className="mt-2 text-2xl font-bold leading-tight text-black">
            Gather
          </h4>
          <p className="mt-1 text-sm text-grey">Melbourne, Australia</p>
          <div className="mt-2 h-0.5 w-10 bg-signature" aria-hidden="true" />
        </div>

        <div className="mt-4">
          <BuildingArt />
        </div>

        <div className="mt-auto space-y-3 pt-3">
          <LiveTime />
          <LiveDateRow />
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-signature">
              <GlobeIcon />
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-signature">
                Website
              </p>
              <p className="mt-0.5 text-sm font-medium text-black">
                www.gather.com
              </p>
            </div>
          </div>
        </div>
      </div>

      <Image
        src="/images/flowers/flower-5.png"
        alt=""
        width={100}
        height={100}
        className="pointer-events-none absolute bottom-1 right-3 w-20 select-none"
        aria-hidden="true"
      />
    </CardShell>
  );
}

function RsvpCard() {
  return (
    <CardShell step={3} total={CARD_TOTAL}>
      <div className="relative z-10 flex flex-1 flex-col px-7 pb-6 pt-4">
        <div className="flex flex-col items-center text-center">
          <span className="text-signature">
            <EnvelopeIcon className="h-5 w-5" />
          </span>
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-signature">
            Kindly respond
          </p>
          <h4 className="mt-2 text-2xl font-bold leading-tight text-black">
            Will you be joining us?
          </h4>
          <div className="mt-2 h-0.5 w-10 bg-signature" aria-hidden="true" />
        </div>

        <div className="mt-6 flex flex-col gap-2.5">
          <button
            type="button"
            tabIndex={-1}
            className="rounded-full border border-signature px-4 py-2.5 text-sm font-medium text-signature transition-colors hover:bg-signature hover:text-white"
          >
            ✓ Yes, can&apos;t wait!
          </button>
          <button
            type="button"
            tabIndex={-1}
            className="rounded-full border border-signature px-4 py-2.5 text-sm font-medium text-signature transition-colors hover:bg-signature hover:text-white"
          >
            ✕ Sorry, can&apos;t make it
          </button>
        </div>

        <div className="mt-auto pt-5">
          <p className="text-xs font-medium text-black">
            Leave us a message (optional)
          </p>
          <div className="mt-2 rounded-2xl border border-signature/40 bg-soft-grey/60 px-4 py-3 text-sm text-grey">
            Type here...
          </div>
        </div>
      </div>
    </CardShell>
  );
}

function ThanksCard() {
  return (
    <CardShell step={4} total={CARD_TOTAL}>
      <div className="relative z-10 flex flex-1 flex-col px-7 pb-6 pt-4">
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <span className="text-signature">
            <HeartIcon className="h-5 w-5" />
          </span>
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-signature">
            Thank you!
          </p>
          <h4 className="mt-2 max-w-[14rem] text-2xl font-bold leading-tight text-black">
            We can&apos;t wait to be part of your next event
          </h4>
          <div className="mt-2 h-0.5 w-10 bg-signature" aria-hidden="true" />
          <span className="mt-6 text-signature">
            <StarIcon className="h-4 w-4" />
          </span>
          <p className="mt-3 text-sm text-signature">With love,</p>
          <p className="mt-1 font-[family-name:var(--font-cursive)] text-3xl text-black">
            Gather Team
          </p>
        </div>
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
    text: "Event details shown through individual cards - no scrolling required",
    icon: (
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <rect x="7" y="3" width="10" height="18" rx="2" />
        <circle cx="12" cy="8" r="1.5" />
      </svg>
    ),
  },
  {
    text: "Cards can include details, location, schedule, RSVP, and personal messages",
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
    <section className="bg-soft-grey py-14 sm:py-20 md:py-28">
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
              Recipients open a personalised envelope, then explore your event
              through beautifully{" "}
              <br className="hidden md:block" />
              designed cards - each one fitting perfectly on screen without any
              scrolling.
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
