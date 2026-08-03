import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { Logo } from "@/components/ui/Logo";

export const metadata = {
  title: "Sign in · Gather",
  description: "Sign in to Gather to create and manage your invitations.",
};

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  const callbackUrl = params.callbackUrl || "/home";

  if (session?.user) {
    redirect(callbackUrl);
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#211916]">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      >
        <source src="/videos/login-background.mp4" type="video/mp4" />
      </video>

      <div
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(14,10,9,0.28),rgba(14,10,9,0.44))]"
        aria-hidden="true"
      />

      <header className="absolute inset-x-0 top-0 z-20 px-5 py-5 sm:px-8 sm:py-7">
        <Logo className="rounded-full border border-white/55 bg-white/90 px-3.5 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.14)] backdrop-blur-xl" />
      </header>

      <main className="relative z-10 flex min-h-screen items-center justify-center px-5 py-28 sm:px-8">
        <section className="w-full max-w-lg rounded-[34px] border border-white/75 bg-white/[0.95] px-7 py-10 text-center shadow-[0_36px_110px_rgba(0,0,0,0.4),0_10px_30px_rgba(0,0,0,0.16)] backdrop-blur-2xl sm:px-12 sm:py-12">
          <span
            className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-black text-2xl font-bold text-signature"
            aria-hidden="true"
          >
            +
          </span>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-black">
            Welcome to Gather
          </h1>
          <p className="mt-3 text-base text-grey sm:whitespace-nowrap">
            Sign in to create invitations and manage your events.
          </p>

          {params.error ? (
            <p
              className="mt-6 rounded-xl border border-signature/20 bg-sugar-milk px-4 py-3 text-sm text-black"
              role="alert"
            >
              Sign in failed. Please try again.
            </p>
          ) : null}

          <form
            className="mt-8"
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: callbackUrl });
            }}
          >
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-3 rounded-full border border-black/10 bg-white px-5 py-3.5 text-sm font-semibold text-black shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:border-black/20 hover:bg-soft-grey focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signature/40"
            >
              <GoogleIcon />
              Continue with Google
            </button>
          </form>

          <p className="mt-6 text-xs leading-relaxed text-grey">
            By continuing, you agree to Gather&apos;s Terms and Privacy Policy.
          </p>
        </section>
      </main>
    </div>
  );
}
