import type { Metadata } from "next";
import {
  Bodoni_Moda,
  Caveat,
  Cinzel_Decorative,
  Forum,
  Great_Vibes,
  Instrument_Serif,
  Italiana,
  Lovers_Quarrel,
  Playfair_Display,
  Urbanist,
  WindSong,
} from "next/font/google";
import "./globals.css";

const urbanist = Urbanist({
  subsets: ["latin"],
  variable: "--font-urbanist",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-cursive",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  // Canvas-only serif: never above the fold, so skip the preload request.
  preload: false,
});

const windsong = WindSong({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-windsong",
  display: "swap",
  preload: false,
});

const loversQuarrel = Lovers_Quarrel({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-lovers-quarrel",
  display: "swap",
  preload: false,
});

const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-great-vibes",
  display: "swap",
  preload: false,
});

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  display: "swap",
  preload: false,
});

const bodoniModa = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-bodoni-moda",
  display: "swap",
  preload: false,
});

const italiana = Italiana({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-italiana",
  display: "swap",
  preload: false,
});

const forum = Forum({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-forum",
  display: "swap",
  preload: false,
});

const cinzelDecorative = Cinzel_Decorative({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-cinzel-decorative",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "Gather",
  description:
    "Design interactive digital invitations, organise guests, send personalised invitation emails and track RSVPs in one event workspace.",
  keywords: [
    "digital invitations",
    "event invitations",
    "RSVP",
    "wedding invitations",
    "party invitations",
    "event guest management",
    "personalised invitations",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${urbanist.variable} ${caveat.variable} ${playfair.variable} ${windsong.variable} ${loversQuarrel.variable} ${greatVibes.variable} ${instrumentSerif.variable} ${bodoniModa.variable} ${italiana.variable} ${forum.variable} ${cinzelDecorative.variable}`}
    >
      {/* suppressHydrationWarning: browser extensions (e.g. Grammarly) inject
          attributes on <body> before React hydrates, which is harmless */}
      <body className="font-sans antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
