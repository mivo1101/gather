import { ComingSoon } from "@/components/app/AppTopBar";

export const metadata = { title: "Invitation · Gather" };

export default async function InvitationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <ComingSoon
      title="Invitation details"
      description={`A full view for invitation ${id} will live here soon.`}
    />
  );
}
