"use client";

import { useFormStatus } from "react-dom";
import { createEventAction } from "@/lib/actions/events";
import { Button, PlusIcon } from "@/components/ui/Button";

function CreateEventSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      size="md"
    >
      <PlusIcon />
      {pending ? "Creating…" : "Create event"}
    </Button>
  );
}

export function CreateEventForm() {
  return (
    <form action={createEventAction} className="mt-8">
      <label className="block">
        <span className="text-sm font-semibold text-black">Event name</span>
        <input
          name="name"
          required
          autoFocus
          maxLength={90}
          placeholder="e.g. Jessie & Mathew's wedding"
          className="mt-2 w-full rounded-2xl border border-black/10 bg-soft-grey/60 px-4 py-3.5 text-base text-black outline-none placeholder:text-grey focus:border-signature/40 focus:bg-white focus:ring-2 focus:ring-signature/15"
        />
      </label>
      <div className="mt-7 flex items-center justify-end">
        <CreateEventSubmitButton />
      </div>
    </form>
  );
}
