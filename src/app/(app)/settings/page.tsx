import { SettingsPage } from "@/components/app/SettingsPage";
import { getCurrentUser } from "@/lib/data/user";
import { getUserSettings } from "@/lib/data/user-settings";

export const metadata = { title: "Settings · Gather" };

export default async function SettingsRoute() {
  const user = await getCurrentUser();
  const settings = await getUserSettings(user.id);

  return <SettingsPage user={user} settings={settings} />;
}
