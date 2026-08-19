import { Button, PlusIcon } from "@/components/ui/Button";

export function FinalCTA() {
  return (
    <section
      id="create"
      className="bg-black py-20 text-white md:py-28"
      aria-labelledby="final-cta-heading"
    >
      <div className="mx-auto max-w-3xl px-6 text-center">
        <span
          className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-2xl font-bold text-signature"
          aria-hidden="true"
        >
          +
        </span>
        <h2
          id="final-cta-heading"
          className="mt-6 text-3xl font-bold tracking-tight md:text-4xl"
        >
          Ready to bring people together?
        </h2>
        <p className="mt-2 font-[family-name:var(--font-cursive)] text-xl text-signature sm:text-2xl md:text-3xl">
          Every guest is your +1
        </p>
        <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-white/70">
          Set up the event, shape the guest experience and keep every response
          in one calm, organised place.
        </p>
        <div className="mt-8">
          <Button href="/signin" variant="secondary" size="lg">
            <PlusIcon />
            Create Your First Event
          </Button>
        </div>
      </div>
    </section>
  );
}
