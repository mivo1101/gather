import Image from "next/image";
import {
  updateNotificationSettingsAction,
  updateProfileAction,
  updateRegionalSettingsAction,
} from "@/lib/actions/settings";
import { signOutAction } from "@/lib/actions/auth";
import type { User } from "@/lib/data/types";
import type { UserSettings } from "@/lib/data/user-settings";
import { Button } from "@/components/ui/Button";
import { SettingsSectionNav } from "./SettingsSectionNav";
import { SettingsForm } from "./SettingsForm";

const inputClass =
  "mt-2 w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm text-black outline-none transition focus:border-signature/50 focus:ring-2 focus:ring-signature/15";

function SectionCard({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-8 rounded-2xl border border-black/[0.06] bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:p-6"
    >
      <div className="border-b border-black/[0.06] pb-4">
        <h2 className="text-lg font-semibold text-black">{title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-grey">{description}</p>
      </div>
      {children}
    </section>
  );
}

function NotificationOption({
  name,
  title,
  description,
  defaultChecked,
}: {
  name: string;
  title: string;
  description: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-5 py-4 first:pt-0 last:pb-0">
      <span>
        <span className="block text-sm font-semibold text-black">{title}</span>
        <span className="mt-1 block max-w-xl text-sm leading-relaxed text-grey">
          {description}
        </span>
      </span>
      <span className="relative mt-0.5 shrink-0">
        <input
          type="checkbox"
          name={name}
          defaultChecked={defaultChecked}
          className="peer sr-only"
        />
        <span className="block h-6 w-11 rounded-full bg-black/15 transition peer-checked:bg-signature peer-focus-visible:ring-2 peer-focus-visible:ring-signature/30 peer-focus-visible:ring-offset-2" />
        <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

export function SettingsPage({
  user,
  settings,
}: {
  user: User;
  settings: UserSettings;
}) {
  const initials = `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}` || "?";

  return (
    <div className="pb-16">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">
          Settings
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-grey sm:text-base">
          Keep your profile, regional defaults, and Gather emails working the
          way you prefer.
        </p>
      </header>

      <SettingsSectionNav />

      <div className="mx-auto max-w-4xl space-y-6">
          <SectionCard id="profile" title="Profile" description="This name appears around your Gather workspace. Your Google profile photo stays connected to your sign-in.">
            <SettingsForm action={updateProfileAction} refreshOnSuccess>
              <div className="flex flex-col gap-5 pt-5 sm:flex-row sm:items-center">
                {user.avatarUrl ? (
                  <Image src={user.avatarUrl} alt="" width={72} height={72} className="h-18 w-18 rounded-full object-cover" />
                ) : (
                  <span className="flex h-18 w-18 items-center justify-center rounded-full bg-black text-xl font-semibold uppercase text-signature">{initials}</span>
                )}
                <div className="grid flex-1 gap-4 sm:grid-cols-2">
                  <label className="text-sm font-medium text-black">
                    First name
                    <input className={inputClass} name="firstName" defaultValue={user.firstName === "there" ? "" : user.firstName} required maxLength={60} autoComplete="given-name" />
                  </label>
                  <label className="text-sm font-medium text-black">
                    Last name
                    <input className={inputClass} name="lastName" defaultValue={user.lastName} maxLength={80} autoComplete="family-name" />
                  </label>
                </div>
              </div>
            </SettingsForm>
          </SectionCard>

          <SectionCard id="regional" title="Language & Region" description="Set sensible defaults for dates and times across your events and invitations.">
            <SettingsForm action={updateRegionalSettingsAction}>
              <div className="grid gap-4 pt-5 sm:grid-cols-2">
                <label className="text-sm font-medium text-black">
                  Timezone
                  <select className={inputClass} name="timezone" defaultValue={settings.timezone}>
                    <option value="Australia/Melbourne">Melbourne (AEST/AEDT)</option>
                    <option value="Australia/Sydney">Sydney (AEST/AEDT)</option>
                    <option value="Asia/Ho_Chi_Minh">Ho Chi Minh City (ICT)</option>
                    <option value="Asia/Singapore">Singapore (SGT)</option>
                    <option value="Europe/London">London (GMT/BST)</option>
                    <option value="America/New_York">New York (ET)</option>
                    <option value="America/Los_Angeles">Los Angeles (PT)</option>
                  </select>
                </label>
                <label className="text-sm font-medium text-black">
                  Language
                  <select className={inputClass} name="language" defaultValue={settings.language}>
                    <option value="en-AU">English (Australia)</option>
                    <option value="en-US">English (United States)</option>
                    <option value="vi-VN">Tiếng Việt</option>
                  </select>
                </label>
                <label className="text-sm font-medium text-black sm:col-span-2">
                  Date format
                  <select className={inputClass} name="dateFormat" defaultValue={settings.dateFormat}>
                    <option value="day_month_year">13 August 2026</option>
                    <option value="month_day_year">August 13, 2026</option>
                    <option value="iso">2026-08-13</option>
                  </select>
                </label>
              </div>
            </SettingsForm>
          </SectionCard>

          <SectionCard id="notifications" title="Email Notifications" description={`Choose which account emails Gather sends to ${user.email}. Essential security emails are always on.`}>
            <SettingsForm action={updateNotificationSettingsAction} label="Save preferences">
              <div className="divide-y divide-black/[0.06] pt-5">
                <NotificationOption name="emailRsvpUpdates" title="RSVP Updates" description="Hear when a guest responds or changes their attendance." defaultChecked={settings.emailRsvpUpdates} />
                <NotificationOption name="emailDeliveryIssues" title="Invitation Delivery Issues" description="Know when an invitation email cannot be delivered." defaultChecked={settings.emailDeliveryIssues} />
                <NotificationOption name="emailEventReminders" title="Event Reminders" description="Receive useful reminders as your event date approaches." defaultChecked={settings.emailEventReminders} />
                <NotificationOption name="emailProductUpdates" title="Gather Product News" description="Occasional updates about new design tools, templates, and features." defaultChecked={settings.emailProductUpdates} />
              </div>
            </SettingsForm>
          </SectionCard>

          <SectionCard id="account" title="Account" description="Your Google account securely manages your sign-in details.">
            <div className="divide-y divide-black/[0.06] pt-2">
              <div className="flex flex-col justify-between gap-2 py-4 sm:flex-row sm:items-center">
                <div>
                  <p className="text-sm font-semibold text-black">Email address</p>
                  <p className="mt-1 text-sm text-grey">{user.email}</p>
                </div>
                <span className="w-fit rounded-full bg-soft-grey px-3 py-1 text-xs font-semibold text-grey">Managed by Google</span>
              </div>
              <div className="flex flex-col justify-between gap-3 py-4 sm:flex-row sm:items-center">
                <div>
                  <p className="text-sm font-semibold text-black">Sign out of Gather</p>
                  <p className="mt-1 text-sm text-grey">You can sign back in at any time with Google.</p>
                </div>
                <form action={signOutAction}>
                  <Button type="submit" variant="secondary" size="sm">Sign out</Button>
                </form>
              </div>
            </div>
          </SectionCard>
      </div>
    </div>
  );
}
