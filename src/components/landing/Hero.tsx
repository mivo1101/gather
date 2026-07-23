"use client";

import { Button, PlusIcon } from "@/components/ui/Button";
import { EnvelopePreview } from "@/components/landing/EnvelopePreview";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-sugar-milk">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-12 sm:gap-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:gap-14 lg:py-24 xl:py-32">
        {/* Copy */}
        <div className="flex flex-col items-center gap-5 text-center sm:gap-6 lg:items-start lg:text-left">
          <h1 className="text-[1.75rem] font-bold leading-[1.15] tracking-tight text-black sm:text-4xl md:text-5xl lg:text-[3.25rem] xl:text-6xl">
            Create invitations worth
            <br className="sm:hidden" />{" "}
            <span
              className="inline-block whitespace-nowrap text-signature"
              aria-label="opening"
            >
              {"opening".split("").map((letter, i) => (
                <span
                  key={`${letter}-${i}`}
                  aria-hidden="true"
                  className="inline-block animate-letter-bounce"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  {letter}
                </span>
              ))}
            </span>
          </h1>
          <p className="font-[family-name:var(--font-cursive)] text-xl text-signature sm:text-2xl md:text-3xl">
            Every guest is your +1
          </p>
          <p className="max-w-md text-sm leading-relaxed text-grey sm:text-base">
            Design beautiful, interactive digital invitations that feel like
            receiving a real envelope. Personalise every detail, share with a
            link, and track RSVPs - all in one place.
          </p>
          <div className="flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 lg:justify-start">
            <Button href="/signin" size="lg" className="w-full sm:w-auto">
              <PlusIcon />
              Create Your Invitation
            </Button>
            <Button
              href="#templates"
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
            >
              Explore Templates
            </Button>
          </div>
        </div>

        {/* Envelope preview */}
        <div className="mx-auto flex w-full max-w-md items-center justify-center sm:max-w-lg lg:mx-0 lg:max-w-none lg:justify-end">
          <EnvelopePreview className="w-full max-w-xl lg:max-w-2xl" />
        </div>
      </div>
    </section>
  );
}
