import { HomeHub } from "@/components/app/HomeHub";
import { TemplateCategories } from "@/components/app/TemplateCategories";
import { getCurrentUser, getGreeting } from "@/lib/data/user";

export const metadata = {
  title: "Templates · Gather",
  description: "Browse invitation templates by event category.",
};

export default async function TemplatesPage() {
  const user = await getCurrentUser();

  return (
    <HomeHub user={user} greeting={getGreeting()} active="templates">
      <TemplateCategories />
    </HomeHub>
  );
}
