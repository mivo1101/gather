import { createInvitationAction } from "@/lib/actions/invitations";
import { Button, PlusIcon } from "@/components/ui/Button";

export const metadata = { title: "New Invitation · Gather" };

export default function NewInvitationPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-start justify-center">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-signature">
        New invitation
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-black">
        Create an invitation
      </h1>
      <p className="mt-3 max-w-lg text-base text-grey">
        Start with a blank design and make it your own.
      </p>

      <form action={createInvitationAction} className="mt-8">
        <Button type="submit" size="lg">
          <PlusIcon />
          Start designing
        </Button>
      </form>
    </div>
  );
}
