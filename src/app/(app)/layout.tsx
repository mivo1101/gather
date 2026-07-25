import { AppSidebar } from "@/components/app/AppSidebar";
import { getCurrentUser } from "@/lib/data/user";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-soft-grey">
      <AppSidebar user={user} />
      <div className="lg:pl-[17.5rem]">
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
