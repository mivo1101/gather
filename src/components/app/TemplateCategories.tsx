"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  TEMPLATE_CATEGORIES,
  getTemplatesByCategory,
  templatePreviewPage,
  type InvitationTemplate,
  type TemplateCategory,
} from "@/lib/data/invitation-templates";
import { useHubSearch } from "./HubSearchContext";
import { InvitationPagePreview } from "./InvitationPagePreview";
import { TemplatePreviewModal } from "./TemplatePreviewModal";

type CategoryIconProps = { className?: string };

function WeddingIcon({ className = "h-6 w-6" }: CategoryIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BirthdayIcon({ className = "h-6 w-6" }: CategoryIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 11h14v9H5v-9zM4 15h16M9 11V8m6 3V8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 5.5c0-1 1-1.7 1-2.5 1.2.8 1.5 1.7 1.1 2.5A1.1 1.1 0 019 5.5zm6 0c0-1 1-1.7 1-2.5 1.2.8 1.5 1.7 1.1 2.5A1.1 1.1 0 0115 5.5z"
        fill="currentColor"
      />
    </svg>
  );
}

function BabyIcon({ className = "h-6 w-6" }: CategoryIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 12h16a8 8 0 01-16 0zM12 12V4a8 8 0 018 8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="20" r="1.2" fill="currentColor" />
      <circle cx="17" cy="20" r="1.2" fill="currentColor" />
    </svg>
  );
}

function CorporateIcon({ className = "h-6 w-6" }: CategoryIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect
        x="3"
        y="7"
        width="18"
        height="13"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M9 7V5h6v2M3 12h18M10 12v2h4v-2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DinnerIcon({ className = "h-6 w-6" }: CategoryIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 3v8m-3-8v5a3 3 0 006 0V3M7 11v10M16 3v18M16 3c3 1 4 4 4 7h-4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function OtherEventsIcon({ className = "h-6 w-6" }: CategoryIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3zM18.5 15l.7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7.7-2.3zM5 14l.7 2.1 2.1.7-2.1.7L5 19.6l-.7-2.1-2.1-.7 2.1-.7L5 14z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const categoryIcons: Record<
  TemplateCategory["id"],
  (props: CategoryIconProps) => React.ReactNode
> = {
  wedding: WeddingIcon,
  birthday: BirthdayIcon,
  baby: BabyIcon,
  corporate: CorporateIcon,
  dinner: DinnerIcon,
  other: OtherEventsIcon,
};

function TemplateCard({ template }: { template: InvitationTemplate }) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const preview = templatePreviewPage(template);
  const isLandscape = template.shape === "landscape";
  const isSquare = template.shape === "square";
  const aspectClass = isLandscape
    ? "aspect-video"
    : isSquare
      ? "aspect-square"
      : "aspect-[9/16]";

  return (
    <>
      <article
        data-template-card={template.id}
        className={`group h-40 shrink-0 sm:h-[17.75rem] ${aspectClass}`}
      >
        <button
          type="button"
          onClick={() => setPreviewOpen(true)}
          className="relative block h-full w-full overflow-hidden rounded-lg border border-black/10 bg-white text-left shadow-[0_2px_10px_rgba(0,0,0,0.06)] outline-none transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(0,0,0,0.12)] focus-visible:ring-2 focus-visible:ring-signature/40"
          aria-label={`Preview ${template.title}`}
        >
          <InvitationPagePreview
            page={preview}
            shape={template.shape ?? "portrait"}
            className="h-full w-full transition-transform duration-500 group-hover:scale-[1.015]"
          />
          <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-black/70 via-black/25 to-transparent px-4 pb-3 pt-12 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
            <span className="truncate text-sm font-semibold">
              {template.title}
            </span>
            <span className="shrink-0 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-black shadow-sm">
              Preview
            </span>
          </span>
        </button>
      </article>

      {previewOpen && (
        <TemplatePreviewModal
          template={template}
          onClose={() => setPreviewOpen(false)}
        />
      )}
    </>
  );
}

function CategorySection({
  category,
  templates,
}: {
  category: TemplateCategory;
  templates: InvitationTemplate[];
}) {
  const [expanded, setExpanded] = useState(false);
  const [canScrollBackward, setCanScrollBackward] = useState(false);
  const [canScrollForward, setCanScrollForward] = useState(false);
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail || expanded) {
      setCanScrollBackward(false);
      setCanScrollForward(false);
      return;
    }
    const update = () => {
      setCanScrollBackward(rail.scrollLeft > 2);
      setCanScrollForward(
        rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 2,
      );
    };
    update();
    rail.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(rail);
    return () => {
      rail.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, [expanded, templates.length]);

  if (templates.length === 0) return null;

  if (category.id === "other") {
    return (
      <section
        id={`category-${category.id}`}
        aria-labelledby={`heading-${category.id}`}
        className="scroll-mt-8"
      >
        <div className="rounded-2xl border border-dashed border-black/10 bg-white px-5 py-8">
          <h2
            id={`heading-${category.id}`}
            className="text-lg font-semibold text-black"
          >
            {category.title}
          </h2>
          <p className="mt-1 max-w-lg text-sm text-grey">
            {category.description}. Templates for this category are coming
            soon — start blank for now if you need something custom.
          </p>
          <Link
            href="/invitations/new"
            className="mt-4 inline-flex text-sm font-semibold text-signature transition-opacity hover:opacity-80"
          >
            Start blank →
          </Link>
        </div>
      </section>
    );
  }

  const portraitTemplates = templates.filter(
    (template) =>
      template.shape !== "landscape" && template.shape !== "square",
  );
  const squareTemplates = templates.filter(
    (template) => template.shape === "square",
  );
  const landscapeTemplates = templates.filter(
    (template) => template.shape === "landscape",
  );
  const galleryTemplates = [
    ...squareTemplates,
    ...landscapeTemplates,
    ...portraitTemplates,
  ];

  return (
    <section
      id={`category-${category.id}`}
      aria-labelledby={`heading-${category.id}`}
      className="scroll-mt-8"
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2
            id={`heading-${category.id}`}
            className="text-2xl font-semibold tracking-tight text-black"
          >
            {category.title}
          </h2>
          <p className="mt-1 text-sm text-grey">{category.description}</p>
        </div>
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((current) => !current)}
          className="shrink-0 text-sm font-semibold text-signature transition-opacity hover:opacity-75"
        >
          {expanded ? "Show less" : "See more"}
        </button>
      </div>

      <div className="relative mt-5">
        <div
          ref={railRef}
          data-template-rail={category.id}
          className={`flex items-start gap-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
            expanded
              ? "flex-wrap overflow-visible"
              : "flex-nowrap overflow-x-auto scroll-smooth pr-12"
          }`}
        >
          {galleryTemplates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>

        {!expanded && canScrollBackward && (
          <>
            <div
              className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-sugar-milk via-sugar-milk/80 to-transparent"
              aria-hidden="true"
            />
            <button
              type="button"
              onClick={() =>
                railRef.current?.scrollBy({
                  left: -railRef.current.clientWidth * 0.72,
                  behavior: "smooth",
                })
              }
              aria-label={`Show previous ${category.title} templates`}
              className="absolute left-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white text-black shadow-[0_4px_16px_rgba(0,0,0,0.14)] transition-transform hover:scale-105"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M12.5 4.5 7 10l5.5 5.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </>
        )}

        {!expanded && canScrollForward && (
          <>
            <div
              className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-sugar-milk via-sugar-milk/80 to-transparent"
              aria-hidden="true"
            />
            <button
              type="button"
              onClick={() =>
                railRef.current?.scrollBy({
                  left: railRef.current.clientWidth * 0.72,
                  behavior: "smooth",
                })
              }
              aria-label={`Show more ${category.title} templates`}
              className="absolute right-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white text-black shadow-[0_4px_16px_rgba(0,0,0,0.14)] transition-transform hover:scale-105"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M7.5 4.5 13 10l-5.5 5.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </>
        )}
      </div>
    </section>
  );
}

/** Templates hub: event categories with starter designs. */
export function TemplateCategories() {
  const { query } = useHubSearch();
  const search = query.trim().toLowerCase();

  const sections = useMemo(() => {
    return TEMPLATE_CATEGORIES.map((category) => {
      const templates = getTemplatesByCategory(category.id).filter(
        (template) => {
          if (!search) return true;
          const haystack = [
            template.title,
            template.description,
            category.title,
          ]
            .join(" ")
            .toLowerCase();
          return haystack.includes(search);
        },
      );
      return { category, templates };
    }).filter(({ category, templates }) =>
      category.id === "other" ? !search : templates.length > 0,
    );
  }, [search]);

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-black">
              Browse by event
            </h2>
            <p className="mt-1 text-sm text-grey">
              Pick a starter design with cover, details, Google Maps, and
              interactive RSVP.
            </p>
          </div>
          <Link
            href="/invitations/new"
            className="mt-3 text-sm font-semibold text-signature transition-opacity hover:opacity-80 sm:mt-0"
          >
            Start blank instead →
          </Link>
        </div>

        {!search && (
          <nav
            aria-label="Event categories"
            className="flex flex-wrap items-start gap-x-3 gap-y-4"
          >
            {TEMPLATE_CATEGORIES.map((category) => {
              const Icon = categoryIcons[category.id];

              return (
                <a
                  key={category.id}
                  href={`#category-${category.id}`}
                  className="group flex w-24 flex-col items-center gap-1.5 text-center text-black"
                >
                  <span
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-signature/10 text-signature transition-all duration-200 group-hover:-translate-y-0.5 group-hover:bg-signature/15"
                  >
                    <Icon />
                  </span>
                  <span className="whitespace-nowrap text-xs font-medium leading-tight group-hover:font-semibold">
                    {category.title}
                  </span>
                </a>
              );
            })}
          </nav>
        )}
      </div>

      {sections.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-black/10 bg-white px-6 py-16 text-center">
          <p className="text-base font-semibold text-black">
            No matching templates
          </p>
          <p className="mt-2 text-sm text-grey">
            Nothing matched “{query.trim()}”. Try another title or category.
          </p>
        </div>
      ) : (
        sections.map(({ category, templates }) => (
          <CategorySection
            key={category.id}
            category={category}
            templates={templates}
          />
        ))
      )}
    </div>
  );
}
