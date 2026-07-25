"use client";

import { useMemo, useState } from "react";
import { InvitationPagePreview } from "@/components/app/InvitationPagePreview";
import {
  INVITATION_TEMPLATES,
  TEMPLATE_CATEGORIES,
  getTemplatesByCategory,
  searchTemplates,
  templatePreviewPage,
  type InvitationTemplate,
  type TemplateCategoryId,
} from "@/lib/data/invitation-templates";

interface ToolTemplatesPanelProps {
  onApplyTemplate: (template: InvitationTemplate) => void;
}

/**
 * Canva-style Templates browser: search, categories, apply to current design.
 */
export function ToolTemplatesPanel({ onApplyTemplate }: ToolTemplatesPanelProps) {
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState<TemplateCategoryId | "all">(
    "all",
  );

  const results = useMemo(() => {
    const searched = query.trim()
      ? searchTemplates(query)
      : categoryId === "all"
        ? INVITATION_TEMPLATES
        : getTemplatesByCategory(categoryId);
    return searched;
  }, [query, categoryId]);

  const categories = TEMPLATE_CATEGORIES.filter((c) => c.id !== "other");

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="sr-only">Search templates</span>
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value.trim()) setCategoryId("all");
          }}
          placeholder="Search templates…"
          className="w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none placeholder:text-grey/70 focus:border-signature/40 focus:ring-2 focus:ring-signature/20"
        />
      </label>

      {!query.trim() ? (
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setCategoryId("all")}
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              categoryId === "all"
                ? "bg-black text-white"
                : "border border-black/10 text-grey hover:text-black"
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setCategoryId(category.id)}
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                categoryId === category.id
                  ? "bg-black text-white"
                  : "border border-black/10 text-grey hover:text-black"
              }`}
            >
              {category.title}
            </button>
          ))}
        </div>
      ) : null}

      {results.length === 0 ? (
        <p className="text-sm text-grey">
          {query.trim()
            ? `No templates match “${query.trim()}”.`
            : "No templates in this category yet."}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          {results.map((template) => (
            <TemplateTile
              key={template.id}
              template={template}
              onApply={() => onApplyTemplate(template)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TemplateTile({
  template,
  onApply,
}: {
  template: InvitationTemplate;
  onApply: () => void;
}) {
  const preview = templatePreviewPage(template);

  return (
    <button
      type="button"
      onClick={onApply}
      className="group flex flex-col overflow-hidden rounded-xl border border-black/8 bg-white text-left transition-colors hover:border-signature/40"
      title={`Use ${template.title}`}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-[#f3f1ef]">
        <div className="absolute inset-0 flex items-center justify-center p-2.5">
          <div className="relative aspect-[9/16] h-full overflow-hidden rounded-sm shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-transform duration-300 group-hover:scale-[1.03]">
            <InvitationPagePreview page={preview} className="h-full w-full" />
          </div>
        </div>
      </div>
      <div className="space-y-0.5 px-2 py-2">
        <p className="truncate text-xs font-semibold text-black">
          {template.title}
        </p>
        <p className="truncate text-[10px] text-grey">
          {template.pages.length} pages
        </p>
      </div>
    </button>
  );
}
