import { Logo } from "@/components/ui/Logo";

const productLinks = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Guest Experience", href: "#guest-experience" },
  { label: "Features", href: "#features" },
  { label: "Templates", href: "#templates" },
];

const accountLinks = [
  { label: "Sign In", href: "/signin" },
  { label: "Create an Event", href: "/signin" },
];

function FooterLinkGroup({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-black">{title}</h3>
      <ul className="mt-4 flex flex-col gap-3">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              className="text-sm text-grey transition-colors hover:text-black"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-black/5 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-grey">
              Design interactive digital invitations, organise guests, send
              personalised emails and keep every response in one place.
            </p>
          </div>

          <FooterLinkGroup title="Product" links={productLinks} />
          <FooterLinkGroup title="Account" links={accountLinks} />
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-black/5 pt-8 sm:flex-row">
          <p className="text-sm text-grey">
            &copy; {new Date().getFullYear()} Gather. All rights reserved.
          </p>
          <p className="text-sm text-grey">
            Every guest is your{" "}
            <span className="font-semibold text-signature">+1</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
