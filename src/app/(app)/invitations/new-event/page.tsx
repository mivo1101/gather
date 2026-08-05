import Link from "next/link";
import { CreateEventForm } from "@/components/app/CreateEventForm";

export const metadata = { title: "Create event · Gather" };

export default function CreateEventPage() {
  return (
    <div className="mx-auto max-w-xl animate-fade-up">
      <Link
        href="/invitations"
        className="text-sm font-semibold text-grey transition-colors hover:text-black"
      >
        ← All invitations
      </Link>
      <div className="mt-6 rounded-[30px] border border-black/[0.07] bg-white p-7 shadow-[0_18px_50px_rgba(0,0,0,0.07)] sm:p-9">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-signature">
          New event
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-black">
          What are you celebrating?
        </h1>
        <p className="mt-3 text-sm leading-6 text-grey">
          Create an event and connect an invitation design.
        </p>

        <CreateEventForm />
      </div>
    </div>
  );
}
