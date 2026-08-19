"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type FeatureId =
  | "workspace"
  | "editor"
  | "interactive"
  | "guests"
  | "links"
  | "email"
  | "rsvps";

const features: {
  id: FeatureId;
  number: string;
  eyebrow: string;
  title: string;
  description: string;
}[] = [
  {
    id: "workspace",
    number: "01",
    eyebrow: "Event workspace",
    title: "Everything begins in one place",
    description:
      "Keep the invitation, event details, guests, email campaign and responses together from the first idea to the final RSVP.",
  },
  {
    id: "editor",
    number: "02",
    eyebrow: "Canvas editor",
    title: "Design without being boxed in",
    description:
      "Start with a template or a blank canvas, add pages, and make every detail yours with type, imagery, shapes and backgrounds.",
  },
  {
    id: "interactive",
    number: "03",
    eyebrow: "Interactive blocks",
    title: "Make the invitation do more",
    description:
      "Place guest names, maps, attendance buttons, open answers and custom choices directly inside the design.",
  },
  {
    id: "guests",
    number: "04",
    eyebrow: "Guest list",
    title: "Bring everyone in, beautifully",
    description:
      "Add guests directly or import a prepared CSV, then use the exact display name you want each person to see.",
  },
  {
    id: "links",
    number: "05",
    eyebrow: "Personalised links",
    title: "One invitation, made personal",
    description:
      "Gather creates a private link for every guest, ready to copy, preview or include in their invitation email.",
  },
  {
    id: "email",
    number: "06",
    eyebrow: "Invitation email",
    title: "Send it with the same care",
    description:
      "Write the message, choose an image, preview it for a real guest and send yourself a test before it goes out.",
  },
  {
    id: "rsvps",
    number: "07",
    eyebrow: "RSVP overview",
    title: "Know exactly who is coming",
    description:
      "See who is attending, who declined and who still needs to respond without piecing together messages and spreadsheets.",
  },
];

function WindowShell({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="w-full min-w-0 overflow-hidden rounded-[26px] border border-white/15 bg-[#f7f7f7] shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
      <div className="flex h-11 items-center justify-between border-b border-black/[0.06] bg-white px-4">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="h-2 w-2 rounded-full bg-signature" />
          <span className="h-2 w-2 rounded-full bg-black/15" />
          <span className="h-2 w-2 rounded-full bg-black/15" />
        </div>
        <p className="text-[10px] font-semibold text-black/55">{label}</p>
        <span className="rounded-full bg-black px-2.5 py-1 text-[8px] font-semibold text-white">
          Gather +
        </span>
      </div>
      <div className="h-[clamp(330px,48vh,430px)]">{children}</div>
    </div>
  );
}

function WorkspacePreview() {
  return (
    <WindowShell label="Gather Together · Overview">
      <div className="flex h-full min-h-0 flex-col bg-[#fff8f7] p-3 sm:p-5">
        <div className="flex items-end justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[7px] text-grey sm:text-[8px]">
              <span className="rounded-full bg-signature/10 px-2 py-1 font-semibold text-signature">Live</span>
              <span>Updated just now</span>
            </div>
            <h4 className="mt-1.5 text-base font-bold leading-none text-black sm:text-xl">Gather Together</h4>
            <p className="mt-1 text-[7px] text-grey sm:text-[8px]">Sep 12, 2026&nbsp; · &nbsp;Gather House, Melbourne</p>
          </div>
          <div className="hidden shrink-0 gap-1.5 sm:flex">
            <span className="rounded-full border border-black/10 bg-white px-2.5 py-1.5 text-[7px] font-semibold text-black">Edit design</span>
            <span className="rounded-full bg-black px-2.5 py-1.5 text-[7px] font-semibold text-white">Continue setup</span>
          </div>
        </div>

        <div className="mt-3 flex gap-5 border-b border-black/[0.07] text-[7px] font-medium text-grey sm:mt-4 sm:text-[8px]">
          {["Overview", "Guests  2,480", "Email", "RSVPs  1,936"].map((tab, index) => (
            <span key={tab} className={`pb-2 ${index === 0 ? "border-b-2 border-signature font-semibold text-black" : ""}`}>{tab}</span>
          ))}
        </div>

        <div className="mt-3 grid min-h-0 min-w-0 flex-1 grid-cols-[minmax(0,1.55fr)_minmax(105px,.68fr)] gap-2 sm:gap-3">
          <div className="flex min-h-0 min-w-0 flex-col rounded-2xl border border-black/[0.07] bg-white p-3 sm:p-4">
            <div className="flex items-start justify-between">
              <div><p className="text-[9px] font-bold text-black sm:text-[11px]">Invitation Design</p><p className="mt-0.5 text-[7px] text-grey">4 pages</p></div>
              <span className="rounded-full border border-black/10 px-2 py-1 text-[6px] font-semibold text-black sm:text-[7px]">Continue editing</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[7px] text-grey">
              <span>Page 1 of 4</span><span className="rounded-full border border-black/10 px-2 py-1 text-black">As&nbsp; Jordan Lee⌄</span>
            </div>
            <div className="mt-2 flex min-h-0 flex-1 items-center justify-center rounded-xl bg-[#f1efee]">
              <div className="relative flex aspect-[4/3] h-[92%] items-center justify-center overflow-hidden rounded-md bg-[#171214] text-white shadow-lg">
                <div className="absolute -right-5 -top-5 h-20 w-20 rounded-full border-[12px] border-signature/25" />
                <div className="absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-signature/35" />
                <div className="absolute inset-3 border border-white/15" />
                <div className="absolute inset-x-[16%] top-[18%] text-center">
                  <p className="text-[5px] font-semibold uppercase tracking-[0.24em] text-signature">A private invitation for you</p>
                  <p className="mt-1.5 font-[family-name:var(--font-instrument-serif)] text-sm leading-[0.9] sm:text-lg">COME EXPERIENCE<br /><span className="italic text-signature">GATHER</span></p>
                  <div className="mx-auto mt-1.5 h-px w-8 bg-white/35" />
                  <p className="mt-1.5 text-[4px] uppercase leading-relaxed tracking-[0.13em] text-white/65">Design · Connect · Celebrate</p>
                </div>
                <p className="absolute bottom-4 left-4 text-[5px] font-semibold uppercase tracking-[0.16em] text-black">12 · 09 · 26</p>
                <p className="absolute bottom-4 right-5 text-[4px] uppercase tracking-[0.14em] text-white/55">Gather House · Melbourne</p>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between text-[6px] text-grey"><span>Previous</span><span className="tracking-[3px] text-black">● <span className="text-black/20">● ● ●</span></span><span className="font-semibold text-black">Next</span></div>
          </div>

          <div className="min-w-0">
            <div className="rounded-2xl border border-black/[0.07] bg-white p-3 sm:p-4">
              <div className="flex items-center justify-between"><p className="text-[8px] font-bold text-black sm:text-[10px]">Event Setup</p><span className="text-[7px] text-signature">100%</span></div>
              <div className="mt-2 h-1 rounded-full bg-signature" />
              <div className="mt-2.5 space-y-2 sm:mt-3 sm:space-y-2.5">
                {["Invitation Design", "Event Details", "Guest List", "Email and Send"].map((step) => (
                  <div key={step} className="flex items-center gap-2">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-signature text-[7px] text-white">✓</span>
                    <div className="min-w-0"><p className="truncate text-[6px] font-semibold text-black sm:text-[7px]">{step}</p><p className="hidden truncate text-[5px] text-grey sm:block">Complete and ready</p></div>
                  </div>
                ))}
              </div>
              <div className="mt-3 border-t border-black/[0.07] pt-2">
                <div className="flex items-end justify-between gap-1">
                  <div><p className="text-[5px] uppercase tracking-wider text-grey">Responses received</p><p className="mt-0.5 text-[10px] font-bold text-black sm:text-xs">1,936</p></div>
                  <p className="pb-0.5 text-right text-[5px] leading-relaxed text-grey">1,742 attending<br />194 declined</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </WindowShell>
  );
}

function EditorPreview() {
  const editorTools = ["Templates", "Layout", "Background", "Text", "Elements", "Images", "Uploads", "Interactive", "QR Code", "Brand Kit"];

  return (
    <WindowShell label="Invitation editor">
      <div className="grid h-full min-w-0 grid-cols-[33px_78px_minmax(0,1fr)] bg-[#f1f1f1] sm:grid-cols-[38px_104px_minmax(0,1fr)_104px]">
        <div className="min-w-0 border-r border-black/5 bg-white px-1 py-2">
          {editorTools.map((tool, index) => (
            <div key={tool} className={`mb-0.5 rounded-md px-0.5 py-1 text-center text-[4px] font-medium leading-tight sm:text-[5px] ${index === 3 ? "bg-signature/10 text-signature" : "text-grey"}`}>
              <span className="mx-auto mb-0.5 block h-2.5 w-2.5 rounded-sm border border-current opacity-50" />{tool}
            </div>
          ))}
        </div>

        <div className="min-w-0 border-r border-black/5 bg-white p-2 sm:p-3">
          <div className="flex justify-between text-[6px] text-grey"><span>Text</span><span>‹</span></div>
          <p className="mt-4 text-[8px] font-semibold text-black sm:text-[10px]">Text</p>
          <p className="mt-1 text-[5px] leading-relaxed text-grey sm:text-[6px]">Click or drag a text box onto the canvas.</p>
          <div className="mt-2 rounded-full bg-black px-1 py-1.5 text-center text-[5px] font-semibold text-white sm:text-[6px]">+ Add text</div>
          <p className="mt-3 text-[5px] uppercase tracking-wider text-grey">Presets</p>
          {["Heading", "Subheading", "Body"].map((preset, index) => (
            <div key={preset} className={`mt-1.5 rounded-md border border-black/10 px-2 py-2 text-black ${index === 0 ? "font-[family-name:var(--font-instrument-serif)] text-[9px] sm:text-[11px]" : "text-[6px] sm:text-[7px]"}`}>{preset}</div>
          ))}
        </div>

        <div className="grid min-w-0 grid-rows-[minmax(0,1fr)_54px] sm:grid-rows-[minmax(0,1fr)_62px]">
          <div className="relative flex min-w-0 items-center justify-center overflow-hidden p-3 sm:p-4">
            <div className="relative aspect-[4/3] w-full max-w-[310px] overflow-hidden rounded-md bg-gradient-to-br from-[#9c0802] via-[#820000] to-[#a80b05] text-white shadow-[0_10px_24px_rgba(0,0,0,.2)]">
              <div className="absolute inset-0 opacity-20 [background:repeating-linear-gradient(135deg,transparent_0_8px,#540000_9px_11px)]" />
              <div className="absolute bottom-[8%] left-[4%] top-[5%] w-[62%] bg-[#f7f5f4] shadow-sm" />
              <p className="absolute left-[17%] top-[13%] font-[family-name:var(--font-windsong)] text-[8px] text-[#8e0000] sm:text-[11px]">You&apos;re Invited</p>
              <div className="absolute left-[13%] top-[30%] h-[40%] w-[44%] rounded-t-full bg-gradient-to-b from-[#ffeaf3] to-[#f6a8c8] shadow-md">
                <div className="absolute -top-2 left-[12%] right-[12%] h-3 rounded-full bg-white shadow-sm" />
                <div className="absolute inset-x-0 bottom-0 h-[30%] bg-[#f363a6]" />
                <span className="absolute -top-3 left-[28%] h-3 w-1 rounded-full bg-[#c80032]" /><span className="absolute -top-3 right-[28%] h-3 w-1 rounded-full bg-[#c80032]" />
              </div>
              <div className="absolute right-[3%] top-[52%] text-[5px] leading-[2] sm:text-[6px]"><p>▣ Saturday, August 1st 2026</p><p>◷ 5.00 PM – Midnight</p><p>▱ Dress code: ○ ● ●</p></div>
              <div className="absolute right-[3%] top-[43%] flex gap-1 rounded-full bg-white px-2 py-1 text-[4px] text-black shadow-md sm:text-[5px]"><span className="text-signature">Text</span><span>Edit</span><span>Link</span><span>•••</span></div>
              <div className="absolute right-1 top-[18%] flex flex-col gap-1 rounded-full bg-white px-1 py-2 text-[5px] text-grey shadow-md"><span>▦</span><span>▢</span><span>↻</span><span>⌫</span></div>
            </div>
          </div>
          <div className="flex min-w-0 items-center gap-1.5 border-t border-black/5 bg-white px-2 sm:gap-2 sm:px-3">
            <span className="text-[8px] text-grey">‹</span>
            {["Rosie.", "You're invited", "Let's meet", "Can't wait"].map((page, index) => (
              <div key={page} className={`flex h-9 min-w-0 flex-1 items-center justify-center rounded bg-[#920400] px-0.5 text-center text-[4px] text-white ${index === 1 ? "ring-2 ring-signature" : ""}`}>{page}</div>
            ))}
            <div className="flex h-9 w-8 shrink-0 items-center justify-center rounded border border-dashed border-black/20 text-[10px] text-grey">+</div>
            <span className="ml-auto hidden text-[6px] text-black sm:block">− &nbsp;100%&nbsp; +</span>
          </div>
        </div>

        <div className="hidden min-w-0 border-l border-black/5 bg-white p-2.5 sm:block">
          <div className="flex border-b border-black/10 text-center text-[6px]"><span className="flex-1 border-b-2 border-signature pb-2 text-black">Style</span><span className="flex-1 pb-2 text-grey">Position</span></div>
          <p className="mt-3 text-[5px] text-grey">Font</p><div className="mt-1 rounded-md border border-black/10 px-2 py-2 text-[6px] text-black">Urbanist⌄</div>
          <div className="mt-2 grid grid-cols-2 gap-1"><div><p className="text-[5px] text-grey">Weight</p><div className="mt-1 rounded-md border border-black/10 p-1.5 text-[5px]">Medium</div></div><div><p className="text-[5px] text-grey">Size</p><div className="mt-1 rounded-md border border-black/10 p-1.5 text-[5px]">12 px</div></div></div>
          <p className="mt-3 text-[5px] text-grey">Colour</p><div className="mt-1 flex gap-1"><span className="h-4 w-4 rounded-full bg-black" /><span className="h-4 w-4 rounded-full border-2 border-signature bg-white" /></div>
          <div className="mt-3 rounded-lg bg-[#f6f6f6] p-2"><p className="text-[6px] font-semibold text-black">Text style</p><div className="mt-2 grid grid-cols-4 gap-1 text-center text-[6px]"><span>B</span><span className="italic">I</span><span className="underline">U</span><span>S</span></div></div>
          <div className="mt-2 rounded-lg bg-[#f6f6f6] p-2"><p className="text-[6px] font-semibold text-black">Text align</p><div className="mt-2 flex justify-between text-[7px] text-grey"><span className="text-signature">≡</span><span>≡</span><span>≡</span></div></div>
        </div>
      </div>
    </WindowShell>
  );
}

function InteractivePreview() {
  return (
    <WindowShell label="Invitation editor · Interactive">
      <div className="grid h-full grid-cols-[42%_58%] bg-[#eeeeee]">
        <div className="border-r border-black/5 bg-white p-4 sm:p-5">
          <p className="text-sm font-bold text-black">Interactive</p>
          <p className="mt-1 text-[9px] leading-relaxed text-grey">Click or drag a block onto the canvas.</p>
          <div className="mt-4 space-y-2">
            {["Guest name", "Map", "Yes / No", "Open answer", "Multi choice"].map((item, index) => (
              <div key={item} className={`rounded-xl border px-3 py-2.5 ${index === 0 ? "border-signature/30 bg-signature/5" : "border-black/10"}`}>
                <p className="text-[10px] font-semibold text-black">{item}</p>
                <p className="mt-0.5 text-[7px] text-grey">Drag into your design</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-center p-5">
          <div className="aspect-[3/4] h-[88%] rounded-xl bg-black p-4 text-center text-white shadow-xl">
            <p className="mt-8 text-[8px] uppercase tracking-[0.2em] text-white/50">Made especially for</p>
            <p className="mt-1 font-[family-name:var(--font-windsong)] text-3xl text-signature">Emily</p>
            <p className="mt-8 font-[family-name:var(--font-instrument-serif)] text-xl">Will you join us?</p>
            <div className="mt-5 space-y-2">
              <div className="rounded-full bg-signature px-3 py-2 text-[9px] font-semibold">Yes, can&apos;t wait</div>
              <div className="rounded-full border border-white/25 px-3 py-2 text-[9px]">Sorry, can&apos;t make it</div>
            </div>
          </div>
        </div>
      </div>
    </WindowShell>
  );
}

function GuestsPreview() {
  const rows = [
    ["Ms", "Emily Harper", "emily@example.com"],
    ["", "Mi & Andre", "mi@example.com"],
    ["Mr", "James Chen", "james@example.com"],
  ];
  return (
    <WindowShell label="The Garden Party · Guests">
      <div className="h-full bg-white p-5 sm:p-7">
        <div className="flex items-start justify-between">
          <div><p className="text-lg font-bold text-black">Guest list</p><p className="mt-1 text-[9px] text-grey">2,480 recipients</p></div>
          <span className="rounded-full bg-black px-3 py-2 text-[9px] font-semibold text-white">Upload CSV</span>
        </div>
        <div className="mt-5 overflow-hidden rounded-2xl border border-black/[0.07]">
          <div className="grid grid-cols-[44px_1fr_1.25fr] bg-[#f6f6f6] px-4 py-3 text-[8px] font-semibold uppercase tracking-[0.12em] text-grey">
            <span>Prefix</span><span>Display name</span><span>Email</span>
          </div>
          {rows.map(([prefix, name, email]) => (
            <div key={name} className="grid grid-cols-[44px_1fr_1.25fr] border-t border-black/[0.06] px-4 py-4 text-[10px]">
              <span className="text-grey">{prefix || "—"}</span><span className="font-semibold text-black">{name}</span><span className="truncate text-grey">{email}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between rounded-xl bg-signature/10 px-4 py-3 text-[9px]">
          <span className="font-semibold text-black">Every name personalises the invitation</span>
          <span className="text-signature">Ready</span>
        </div>
      </div>
    </WindowShell>
  );
}

function LinksPreview() {
  return (
    <WindowShell label="The Garden Party · Personalised links">
      <div className="h-full bg-[#fff8f4] p-5 sm:p-7">
        <p className="text-lg font-bold text-black">Guest invitation links</p>
        <p className="mt-1 text-[9px] text-grey">A private invitation for every recipient.</p>
        <div className="mt-5 space-y-3">
          {["Emily Harper", "Mi & Andre", "James Chen"].map((name, index) => (
            <div key={name} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-signature/10 text-[10px] font-bold text-signature">{index + 1}</span>
                  <div className="min-w-0"><p className="text-[10px] font-semibold text-black">{name}</p><p className="mt-0.5 truncate text-[8px] text-grey">gather.com/invite/garden/{name.toLowerCase().split(" ")[0]}</p></div>
                </div>
                <span className="rounded-full border border-black/10 px-2.5 py-1.5 text-[8px] font-semibold text-black">Copy link</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-2xl bg-black p-4 text-white">
          <p className="text-[8px] uppercase tracking-[0.15em] text-signature">Previewing as</p>
          <p className="mt-1 font-[family-name:var(--font-windsong)] text-2xl">Emily</p>
        </div>
      </div>
    </WindowShell>
  );
}

function EmailPreview() {
  return (
    <WindowShell label="The Garden Party · Email">
      <div className="grid h-full grid-cols-[43%_57%] bg-[#f2f2f2]">
        <div className="border-r border-black/5 bg-white p-4 sm:p-5">
          <p className="text-sm font-bold text-black">Compose email</p>
          <div className="mt-4 space-y-3">
            {[["Subject", "You’re invited, Emily"], ["Sender", "Mia from Gather"]].map(([label, value]) => (
              <div key={label}><p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-grey">{label}</p><div className="mt-1 rounded-lg border border-black/10 px-3 py-2 text-[8px] text-black">{value}</div></div>
            ))}
            <div><p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-grey">Message</p><div className="mt-1 h-20 rounded-lg border border-black/10 p-3 text-[8px] leading-relaxed text-grey">We’d love you to join us for an evening made to bring people together.</div></div>
          </div>
          <span className="mt-4 inline-block rounded-full bg-black px-3 py-2 text-[8px] font-semibold text-white">Send a test</span>
        </div>
        <div className="flex items-center justify-center p-4">
          <div className="w-full max-w-[210px] overflow-hidden rounded-xl bg-white shadow-lg">
            <div className="h-20 bg-gradient-to-br from-black to-[#4a102c] p-4 text-white"><p className="text-[7px] uppercase tracking-[0.18em] text-signature">Gather</p><p className="mt-2 font-[family-name:var(--font-instrument-serif)] text-lg">The Garden Party</p></div>
            <div className="p-4"><p className="text-[9px] font-semibold text-black">Dear Emily,</p><p className="mt-2 text-[8px] leading-relaxed text-grey">Your invitation is ready to open.</p><div className="mt-4 rounded-full bg-signature px-3 py-2 text-center text-[8px] font-semibold text-white">Open invitation</div></div>
          </div>
        </div>
      </div>
    </WindowShell>
  );
}

function RsvpsPreview() {
  return (
    <WindowShell label="The Garden Party · RSVPs">
      <div className="h-full bg-white p-5 sm:p-7">
        <p className="text-lg font-bold text-black">RSVP overview</p>
        <p className="mt-1 text-[9px] text-grey">Responses from personalised invitations.</p>
        <div className="mt-5 grid grid-cols-3 gap-2.5 text-center">
          {[["1,742", "Attending", "bg-signature/10"], ["194", "Declined", "bg-[#fff1f1]"], ["544", "Awaiting", "bg-[#f6f6f6]"]].map(([value, label, colour]) => (
            <div key={label} className={`rounded-2xl px-2 py-4 ${colour}`}><p className="text-xl font-bold text-black">{value}</p><p className="mt-1 text-[8px] text-grey">{label}</p></div>
          ))}
        </div>
        <div className="mt-5 divide-y divide-black/[0.06] overflow-hidden rounded-2xl border border-black/[0.07]">
          {[["Emily Harper", "Attending", "bg-signature/15 text-signature"], ["Mi & Andre", "Attending", "bg-signature/15 text-signature"], ["James Chen", "Awaiting", "bg-[#f6f6f6] text-grey"]].map(([name, status, colour]) => (
            <div key={name} className="flex items-center justify-between px-4 py-3"><div><p className="text-[10px] font-semibold text-black">{name}</p><p className="mt-0.5 text-[8px] text-grey">Invitation delivered</p></div><span className={`rounded-full px-2.5 py-1 text-[8px] font-semibold ${colour}`}>{status}</span></div>
          ))}
        </div>
      </div>
    </WindowShell>
  );
}

function ProductPreview({ active }: { active: FeatureId }) {
  const preview = {
    workspace: <WorkspacePreview />,
    editor: <EditorPreview />,
    interactive: <InteractivePreview />,
    guests: <GuestsPreview />,
    links: <LinksPreview />,
    email: <EmailPreview />,
    rsvps: <RsvpsPreview />,
  }[active];

  return (
    <div className="relative">
      <div className="absolute -inset-10 rounded-full bg-signature/10 blur-3xl" aria-hidden="true" />
      <div key={active} className="relative animate-fade-up">{preview}</div>
    </div>
  );
}

export function Features() {
  const [active, setActive] = useState<FeatureId>(features[0].id);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let frame = 0;

    const updateActiveStory = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const section = sectionRef.current;
        if (!section) return;

        const rect = section.getBoundingClientRect();
        const travel = Math.max(rect.height - window.innerHeight, 1);
        const progress = Math.min(0.9999, Math.max(0, -rect.top / travel));
        const nextIndex = Math.min(features.length - 1, Math.round(progress * (features.length - 1)));
        setActive(features[nextIndex].id);
      });
    };

    updateActiveStory();
    window.addEventListener("scroll", updateActiveStory, { passive: true });
    window.addEventListener("resize", updateActiveStory);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateActiveStory);
      window.removeEventListener("resize", updateActiveStory);
    };
  }, []);

  const activeIndex = features.findIndex((feature) => feature.id === active);
  const activeFeature = features[activeIndex];
  const storyItemHeight = 230;
  const storyTrackOffset = -(storyItemHeight / 2 + activeIndex * storyItemHeight);

  return (
    <section
      ref={sectionRef}
      id="features"
      className="relative h-[220vh] overflow-x-clip bg-black"
    >
      <div className="sticky top-0 flex h-screen items-center overflow-hidden pb-0 pt-[68px]">
        <div className="mx-auto w-full max-w-6xl px-5 sm:px-6">
          <div className="max-w-3xl">
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl xl:text-5xl">
              Plan it. Design it. Send it.
              <span className="block text-signature">Gather everyone.</span>
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-grey md:text-base">
              Follow one event from the first design decision to the final guest response.
            </p>
          </div>

          <div className="mt-6 grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1.28fr)_minmax(300px,0.72fr)] lg:items-center lg:gap-14">
            <div className="min-w-0">
              <ProductPreview active={active} />
              <div className="mt-3 flex items-center justify-between text-[9px] font-semibold uppercase tracking-[0.15em] text-white/35">
                <span className="hidden sm:inline">Gather product tour</span>
                <span className="truncate pr-4 sm:hidden">{activeFeature.title}</span>
                <span>{activeIndex + 1} / {features.length}</span>
              </div>
            </div>

            <div
              className="relative hidden h-[calc(clamp(330px,48vh,430px)_+_44px)] min-w-0 overflow-hidden lg:block"
              style={{
                maskImage: "linear-gradient(to bottom, transparent 0%, black 14%, black 86%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 14%, black 86%, transparent 100%)",
              }}
            >
              <span className="absolute bottom-0 left-2 top-0 w-px bg-white/10" aria-hidden="true" />
              <ol
                className="absolute inset-x-0 top-1/2 transition-transform duration-500 ease-out will-change-transform"
                style={{ transform: `translate3d(0, ${storyTrackOffset}px, 0)` }}
              >
                {features.map((feature, index) => {
                  const distance = Math.abs(index - activeIndex);
                  return (
                    <li
                      key={feature.id}
                      className="relative h-[230px] pl-10 pr-2 transition-all duration-500"
                      style={{ opacity: distance === 0 ? 1 : distance === 1 ? 0.2 : 0.05 }}
                    >
                      <span className={`absolute left-[3px] top-[110px] h-2.5 w-2.5 rounded-full border-2 border-black transition-all duration-500 ${distance === 0 ? "bg-signature shadow-[0_0_0_6px_rgba(255,96,170,0.14)]" : "bg-white/20"}`} aria-hidden="true" />
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-signature">{feature.number}</span>
                        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/75">{feature.eyebrow}</span>
                      </div>
                      <h3 className="mt-3 text-2xl font-semibold leading-tight text-white md:text-3xl">{feature.title}</h3>
                      <p className="mt-3 max-w-md text-sm leading-6 text-grey">{feature.description}</p>
                      <span className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-signature">Explore feature <span aria-hidden="true">→</span></span>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
