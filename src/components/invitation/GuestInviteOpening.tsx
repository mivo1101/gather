"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";

const TRIANGLE_W = 24;
const TRIANGLE_H = 14;

function PocketFront({ guestFirstName }: { guestFirstName: string }) {
  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-b-xl shadow-[0_8px_28px_rgba(0,0,0,0.18)] sm:rounded-b-2xl"
      style={{
        background:
          "linear-gradient(to right, #fff8f4 0%, #fff8f4 45%, #ffd0e4 75%, #ff60aa 100%)",
      }}
    >
      <div className="absolute inset-y-0 left-0 z-10 flex w-[62%] flex-col justify-between p-3.5 text-left sm:w-[58%] sm:p-5 md:p-6 lg:p-7">
        <div>
          <p className="text-xs text-black/80 sm:text-sm md:text-base">
            Hey {guestFirstName},
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
          <span className="font-semibold text-black">Gather</span>
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

interface GuestInviteOpeningProps {
  guestFirstName: string;
  /** Real invitation cover - fills the pocket mouth width. */
  inviteCard: ReactNode;
  inviteAspectRatio: number;
  onOpened: () => void;
}

/**
 * Card-holder opening: hover raises the invite (tucked behind the pocket);
 * click opens fullscreen. Bottom of the card never sticks out below the holder.
 */
export function GuestInviteOpening({
  guestFirstName,
  inviteCard,
  inviteAspectRatio,
  onOpened,
}: GuestInviteOpeningProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative mx-auto w-full max-w-xl px-4">
      {/*
        No overflow clip on the stage - that was cutting off the pocket when it
        shifts down. The invite stays tucked behind the pocket via z-index + bottom.
        Extra padding-bottom reserves room for the open-state translate.
      */}
      <div
        className="relative w-full pt-[16%] transition-[padding-bottom] duration-500 ease-out sm:pt-[18%]"
        style={{ paddingBottom: isOpen ? "16%" : "2%" }}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <div
          className="absolute z-10 overflow-hidden rounded-t-lg transition-all duration-500 ease-out sm:rounded-t-xl"
          style={{
            left: TRIANGLE_W,
            right: TRIANGLE_W,
            top: isOpen ? "2%" : "12%",
            // End behind the pocket face so red never shows under the holder.
            bottom: isOpen ? "48%" : "52%",
            boxShadow: "0 8px 28px rgba(0,0,0,0.22)",
          }}
        >
          <button
            type="button"
            onClick={(event) => {
              if (!isOpen) {
                event.preventDefault();
                setIsOpen(true);
                return;
              }
              onOpened();
            }}
            className="relative block h-full w-full overflow-hidden text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signature"
            aria-label={isOpen ? "Open invitation" : "Pull invitation card"}
          >
            <div
              className="absolute left-0 right-0 top-0 w-full"
              style={{ aspectRatio: String(inviteAspectRatio) }}
            >
              {inviteCard}
            </div>
          </button>
        </div>

        <div
          className="relative z-20 aspect-[5/3] w-full transition-transform duration-500 ease-out"
          style={{
            transform: isOpen ? "translateY(14%)" : "translateY(0)",
          }}
        >
          <PocketMouth />
          <PocketFront guestFirstName={guestFirstName} />
        </div>
      </div>

      <p className="mt-3 text-center text-sm text-white/55 sm:mt-4">
        {isOpen ? "Click the card to open" : "Hover to pull the card"}
      </p>
    </div>
  );
}
