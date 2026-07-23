"use client";

import Image from "next/image";
import { useState } from "react";

/** Shared size so cards align with the triangle vertical edges */
const TRIANGLE_W = 24;
const TRIANGLE_H = 14;

/**
 * Invitation content - same as the earlier envelope letter
 */
function InvitationCard() {
  return (
    <div className="relative flex h-full w-full overflow-hidden rounded-t-xl bg-gradient-to-r from-white to-[#fdebeb] shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
      <div className="relative z-10 flex w-full flex-col justify-start px-4 pt-5 text-left sm:px-7 sm:pt-8 md:px-9 md:pt-10">
        <p className="text-[10px] text-grey sm:text-xs">You&apos;re invited to</p>
        <h3 className="mt-0.5 text-base font-bold leading-tight text-black sm:mt-1 sm:text-xl md:text-2xl">
          Experience <span className="text-signature">Gather</span>
        </h3>
        <div className="mt-1.5 h-0.5 w-8 bg-signature sm:mt-2 sm:w-10" aria-hidden="true" />
        <p className="mt-2 max-w-sm text-[10px] font-semibold leading-snug text-black sm:mt-3 sm:text-[11px] md:text-xs">
          Welcome to a better way to create and share invitations.
        </p>
        <p className="mt-2 font-[family-name:var(--font-cursive)] text-sm text-signature sm:mt-4 sm:text-lg md:text-xl">
          Let&apos;s make every gathering unforgettable.{" "}
          <span aria-hidden="true">♡</span>
        </p>
      </div>

      <span
        className="absolute right-3 top-3 text-xs font-bold text-signature sm:right-4 sm:top-4 sm:text-sm"
        aria-hidden="true"
      >
        +
      </span>
    </div>
  );
}

/**
 * Pocket front - flat top edge (no top radius), rounded bottom only
 */
function PocketFront() {
  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-b-xl shadow-[0_8px_28px_rgba(0,0,0,0.1)] sm:rounded-b-2xl"
      style={{
        background:
          "linear-gradient(to right, #fff8f4 0%, #fff8f4 45%, #ffd0e4 75%, #ff60aa 100%)",
      }}
    >
      <div className="absolute inset-y-0 left-0 z-10 flex w-[62%] flex-col justify-between p-3.5 text-left sm:w-[58%] sm:p-5 md:p-6 lg:p-7">
        <div>
          <p className="text-xs text-black/80 sm:text-sm md:text-base">
            Hey there,
          </p>
          <h3 className="mt-1 text-[1.35rem] font-bold leading-[1.1] tracking-tight text-black sm:mt-2 sm:text-3xl md:text-4xl lg:text-[2.75rem]">
            you have an
            <br />
            <span className="text-signature">invitation</span>
            <span className="text-black">+</span>
          </h3>
          <div
            className="mt-2.5 h-0.5 w-8 rounded-full bg-signature sm:mt-4 sm:h-1 sm:w-11"
            aria-hidden="true"
          />
        </div>
        <p className="text-[10px] text-black/70 sm:text-xs md:text-sm">
          Created with{" "}
          <span className="font-semibold text-signature">Gather</span>
        </p>
      </div>

      <div
        className="pointer-events-none absolute bottom-2 right-2 h-[58%] w-[30%] sm:bottom-3 sm:right-3 sm:h-[68%] sm:w-[32%]"
        aria-hidden="true"
      >
        <Image
          src="/images/flowers/flower-8.png"
          alt=""
          fill
          unoptimized
          sizes="(max-width: 640px) 90px, 140px"
          className="object-contain object-bottom opacity-80"
        />
      </div>

      <span
        className="absolute right-3 top-3 text-sm font-bold text-signature sm:right-4 sm:top-4 sm:text-lg"
        aria-hidden="true"
      >
        +
      </span>
    </div>
  );
}

function PocketMouth() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 z-40"
      aria-hidden="true"
    >
      <div
        className="absolute left-0"
        style={{
          top: -TRIANGLE_H,
          width: TRIANGLE_W,
          height: TRIANGLE_H,
          backgroundColor: "#f0e6dc",
          clipPath: "polygon(100% 0, 0 100%, 100% 100%)",
        }}
      />
      <div
        className="absolute right-0"
        style={{
          top: -TRIANGLE_H,
          width: TRIANGLE_W,
          height: TRIANGLE_H,
          backgroundColor: "#e84d96",
          clipPath: "polygon(0 0, 0 100%, 100% 100%)",
        }}
      />
    </div>
  );
}

/**
 * Pocket holding cards.
 * On open: pocket shifts down, invitation card rises to reveal content.
 */
export function EnvelopePreview({ className = "" }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`relative mx-auto w-full ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative w-full cursor-pointer rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signature focus-visible:ring-offset-2 sm:rounded-2xl sm:focus-visible:ring-offset-4"
        aria-label={
          isOpen ? "Put invitation card back" : "Pull invitation card up"
        }
        aria-pressed={isOpen}
      >
        {/* Fixed stage - room above for the raised card */}
        <div className="relative w-full pt-[14%] sm:pt-[18%]">
          {/* Peeking cards (closed only) */}
          <div
            className="absolute transition-all duration-500"
            style={{
              left: TRIANGLE_W,
              right: TRIANGLE_W,
              top: isOpen ? "12%" : "7%",
              height: "70%",
              opacity: isOpen ? 0 : 1,
            }}
            aria-hidden="true"
          >
            <div
              className="absolute inset-x-0 top-0 h-full rounded-t-lg sm:rounded-t-xl"
              style={{ backgroundColor: "#000000" }}
            />
            <div
              className="absolute inset-x-0 top-[7%] h-full rounded-t-lg shadow-sm sm:rounded-t-xl"
              style={{
                background: "linear-gradient(to right, #ffffff, #fdebeb)",
              }}
            />
          </div>

          {/*
            Invitation card - rises high on open (independent of pocket).
            Bottom stays tucked behind the shifted-down pocket.
          */}
          <div
            className="absolute z-10 transition-all duration-700 ease-out"
            style={{
              left: TRIANGLE_W,
              right: TRIANGLE_W,
              top: isOpen ? "-8%" : "30%",
              height: isOpen ? "95%" : "70%",
              opacity: isOpen ? 1 : 0,
              transitionDelay: isOpen ? "80ms" : "0ms",
            }}
          >
            <InvitationCard />
          </div>

          {/* Pocket - shifts DOWN on open */}
          <div
            className="relative z-20 aspect-[5/3] w-full transition-transform duration-650 ease-out"
            style={{
              transform: isOpen ? "translateY(22%)" : "translateY(0)",
            }}
          >
            <PocketMouth />
            <PocketFront />
          </div>
        </div>
      </button>

      <p
        className={`mt-2 text-center text-xs text-grey transition-opacity duration-300 sm:mt-3 sm:text-sm ${
          isOpen ? "opacity-0" : "opacity-100"
        }`}
      >
        Tap to pull the card
      </p>
    </div>
  );
}
