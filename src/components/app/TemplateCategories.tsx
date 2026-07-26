"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { createInvitationFromTemplateAction } from "@/lib/actions/invitations";
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

function TemplateCard({ template }: { template: InvitationTemplate }) {
  const [isPending, startTransition] = useTransition();
  const [previewOpen, setPreviewOpen] = useState(false);
  const preview = templatePreviewPage(template);

  return (
    <>
      <article className="group flex flex-col overflow-hidden rounded-2xl border border-black/8 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-shadow hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)]">
        <button
          type="button"
          onClick={() => setPreviewOpen(true)}
          className="relative aspect-[4/5] overflow-hidden bg-[#f3f1ef] text-left outline-none focus-visible:ring-2 focus-visible:ring-signature/40 focus-visible:ring-inset"
          aria-label={`Preview ${template.title}`}
        >
          <div className="absolute inset-0 flex items-center justify-center p-5">
            <div className="relative aspect-[9/16] h-full overflow-hidden rounded-sm shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-transform duration-500 group-hover:scale-[1.02]">
              <InvitationPagePreview page={preview} className="h-full w-full" />
            </div>
          </div>
          <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/35 to-transparent px-4 pb-3 pt-10 text-center text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
            Quick preview
          </span>
        </button>
        <div className="flex flex-1 flex-col gap-1 p-4">
          <h3 className="text-base font-semibold text-black">{template.title}</h3>
          <p className="text-sm text-grey">{template.description}</p>
          <p className="text-xs font-medium text-grey">
            {template.pages.length} pages
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="inline-flex rounded-full border border-black/10 bg-white px-3.5 py-1.5 text-sm font-medium text-black transition-colors hover:bg-soft-grey"
            >
              Preview
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() =>
                startTransition(() => {
                  void createInvitationFromTemplateAction(template.id);
                })
              }
              className="inline-flex rounded-full bg-black px-3.5 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-black/90 disabled:opacity-50"
            >
              {isPending ? "Creating…" : "Use template"}
            </button>
          </div>
        </div>
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

  return (
    <section
      id={`category-${category.id}`}
      aria-labelledby={`heading-${category.id}`}
      className="scroll-mt-8"
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2
            id={`heading-${category.id}`}
            className="text-2xl font-semibold tracking-tight text-black"
          >
            {category.title}
          </h2>
          <p className="mt-1 text-sm text-grey">{category.description}</p>
        </div>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {templates.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
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
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-black">
            Browse by event
          </h2>
          <p className="mt-1 text-sm text-grey">
            Pick a starter design with cover, details, Google Maps, and interactive RSVP.
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
        <nav aria-label="Event categories" className="flex flex-wrap gap-2">
          {TEMPLATE_CATEGORIES.map((category) => (
            <a
              key={category.id}
              href={`#category-${category.id}`}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${category.tint} text-black hover:opacity-90`}
            >
              {category.title}
            </a>
          ))}
        </nav>
      )}

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
