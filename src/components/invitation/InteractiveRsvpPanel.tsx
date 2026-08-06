"use client";

import { useState, useTransition } from "react";
import type { RsvpConfig, RsvpQuestion } from "@/lib/data/invitation-content";
import type { RsvpAnswerValue } from "@/lib/data/rsvp-responses";

const DEFAULT_CONFIG: RsvpConfig = {
  eyebrow: "RSVP",
  title: "Will you be joining us?",
  note: "Please respond soon",
  theme: {
    background: "#ffffff",
    surface: "#f6f6f6",
    accent: "#1F2D22",
    text: "#1F2D22",
    muted: "#8E8E93",
    buttonStyle: "pill",
    headingFont: "playfair",
    bodyFont: "urbanist",
  },
  questions: [
    {
      id: "attend",
      type: "attend",
      label: "Your reply",
      yesLabel: "Yes, I'll be there",
      noLabel: "Sorry, I can't make it",
    },
  ],
};

function fontClass(font: RsvpConfig["theme"]["headingFont"]) {
  switch (font) {
    case "caveat":
      return "font-[family-name:var(--font-cursive)]";
    case "urbanist":
      return "font-sans";
    default:
      return "font-[family-name:var(--font-playfair)]";
  }
}

function radiusFor(style: RsvpConfig["theme"]["buttonStyle"]) {
  switch (style) {
    case "square":
      return "rounded-md";
    case "outline":
      return "rounded-xl";
    case "chip":
      return "rounded-full";
    default:
      return "rounded-full";
  }
}

interface InteractiveRsvpPanelProps {
  config?: RsvpConfig | null;
  /** Legacy fallbacks when config is missing */
  prompt?: string;
  note?: string;
  interactive?: boolean;
  className?: string;
  /** Prefill from a saved response */
  initialAnswers?: Record<string, RsvpAnswerValue>;
  /** When set, show a real submit control instead of preview-only copy */
  onSubmit?: (
    answers: Record<string, RsvpAnswerValue>,
  ) => Promise<{ ok: true } | { error: string }>;
  alreadySubmitted?: boolean;
}

/** Themed, multi-question RSVP card — style follows each template. */
export function InteractiveRsvpPanel({
  config,
  prompt,
  note,
  interactive = true,
  className = "",
  initialAnswers = {},
  onSubmit,
  alreadySubmitted = false,
}: InteractiveRsvpPanelProps) {
  const resolved: RsvpConfig = config
    ? config
    : {
        ...DEFAULT_CONFIG,
        title: prompt || DEFAULT_CONFIG.title,
        note: note || DEFAULT_CONFIG.note,
      };

  const { theme, questions } = resolved;
  const [answers, setAnswers] =
    useState<Record<string, RsvpAnswerValue>>(initialAnswers);
  const [submitted, setSubmitted] = useState(alreadySubmitted);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const canEdit = interactive && (!submitted || Boolean(onSubmit));

  const setAttend = (questionId: string, value: "yes" | "no") => {
    if (!canEdit) return;
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setError(null);
  };

  const setText = (questionId: string, value: string) => {
    if (!canEdit) return;
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setError(null);
  };

  const toggleChoice = (
    question: RsvpQuestion,
    optionId: string,
    multi: boolean,
  ) => {
    if (!canEdit) return;
    setAnswers((prev) => {
      if (!multi) return { ...prev, [question.id]: optionId };
      const current = Array.isArray(prev[question.id])
        ? (prev[question.id] as string[])
        : [];
      const next = current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId];
      return { ...prev, [question.id]: next };
    });
    setError(null);
  };

  const handleSubmit = () => {
    if (!onSubmit) return;
    setError(null);
    startTransition(async () => {
      const result = await onSubmit(answers);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setSubmitted(true);
    });
  };

  const radius = radiusFor(theme.buttonStyle);
  const headingFont = fontClass(theme.headingFont);
  const bodyFont = fontClass(theme.bodyFont);

  return (
    <div
      className={`flex h-full w-full flex-col overflow-y-auto ${className}`}
      style={{ background: theme.background, color: theme.text }}
    >
      <div className="flex flex-1 flex-col px-6 pb-6 pt-5">
        <div className="text-center">
          {resolved.eyebrow ? (
            <p
              className={`text-[10px] font-semibold uppercase tracking-[0.1em] ${bodyFont}`}
              style={{ color: theme.accent }}
            >
              {resolved.eyebrow}
            </p>
          ) : null}
          <h3
            className={`mt-2 text-[1.65rem] font-bold leading-tight ${headingFont}`}
            style={{ color: theme.text }}
          >
            {resolved.title}
          </h3>
          <div
            className="mx-auto mt-2 h-0.5 w-10"
            style={{ backgroundColor: theme.accent }}
            aria-hidden="true"
          />
          {resolved.note ? (
            <p
              className={`mt-3 text-xs ${bodyFont}`}
              style={{ color: theme.muted }}
            >
              {resolved.note}
            </p>
          ) : null}
        </div>

        <div className="mt-5 flex flex-col gap-5">
          {questions.map((question) => {
            const answer = answers[question.id];

            if (question.type === "attend") {
              const yesLabel = question.yesLabel || "Yes";
              const noLabel = question.noLabel || "No";
              return (
                <div key={question.id}>
                  {question.label ? (
                    <p
                      className={`mb-2 text-xs font-semibold ${bodyFont}`}
                      style={{ color: theme.muted }}
                    >
                      {question.label}
                    </p>
                  ) : null}
                  <div className="flex flex-col gap-2">
                    {(["yes", "no"] as const).map((value) => {
                      const selected = answer === value;
                      const hasAnswer = answer === "yes" || answer === "no";
                      const label = value === "yes" ? yesLabel : noLabel;
                      // Keep designed chrome; blur options the guest didn't pick.
                      const designedStyle = {
                        backgroundColor: theme.surface || "transparent",
                        color: theme.accent,
                        border: `1px solid ${theme.accent}`,
                        ...(hasAnswer && !selected
                          ? {
                              opacity: 0.38,
                            }
                          : { opacity: 1 }),
                      };
                      return (
                        <button
                          key={value}
                          type="button"
                          disabled={!canEdit || pending}
                          onClick={() => setAttend(question.id, value)}
                          className={`${radius} px-4 py-2.5 text-sm font-medium transition-opacity disabled:cursor-default ${bodyFont}`}
                          style={designedStyle}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            }

            if (question.type === "short_text") {
              return (
                <div key={question.id}>
                  <p className={`text-sm font-semibold ${bodyFont}`}>
                    {question.label}
                  </p>
                  {question.hint ? (
                    <p
                      className={`mt-1 text-xs ${bodyFont}`}
                      style={{ color: theme.muted }}
                    >
                      {question.hint}
                    </p>
                  ) : null}
                  {canEdit ? (
                    <input
                      type="text"
                      value={typeof answer === "string" ? answer : ""}
                      onChange={(event) =>
                        setText(question.id, event.target.value)
                      }
                      placeholder={question.placeholder || "Type here..."}
                      disabled={pending}
                      className={`mt-2 w-full border bg-transparent px-3 py-2.5 text-sm outline-none ${radius} ${bodyFont}`}
                      style={{
                        borderColor: `${theme.accent}55`,
                        color: theme.text,
                      }}
                    />
                  ) : (
                    <div
                      className={`mt-2 border px-3 py-2.5 text-sm ${radius} ${bodyFont}`}
                      style={{
                        borderColor: `${theme.accent}40`,
                        color: theme.text,
                        backgroundColor: theme.surface || "transparent",
                      }}
                    >
                      {typeof answer === "string" && answer
                        ? answer
                        : question.placeholder || "Type here..."}
                    </div>
                  )}
                </div>
              );
            }

            const multi = question.type === "multi_choice";
            const selectedIds = multi
              ? Array.isArray(answer)
                ? answer
                : []
              : typeof answer === "string"
                ? [answer]
                : [];

            return (
              <div key={question.id}>
                <p className={`text-sm font-semibold ${bodyFont}`}>
                  {question.label}
                </p>
                {question.hint ? (
                  <p
                    className={`mt-1 text-xs ${bodyFont}`}
                    style={{ color: theme.muted }}
                  >
                    {question.hint}
                  </p>
                ) : null}
                <div className="mt-2 flex flex-wrap gap-2">
                  {(question.options || []).map((option) => {
                    const selected = selectedIds.includes(option.id);
                    const hasChoice = selectedIds.length > 0;
                    const designedStyle = {
                      backgroundColor: theme.surface || "transparent",
                      color: theme.text,
                      border: `1px solid ${theme.accent}55`,
                      ...(hasChoice && !selected
                        ? {
                            opacity: 0.38,
                          }
                        : { opacity: 1 }),
                    };
                    return (
                      <button
                        key={option.id}
                        type="button"
                        disabled={!canEdit || pending}
                        onClick={() =>
                          toggleChoice(question, option.id, multi)
                        }
                        className={`${radius} px-3 py-1.5 text-xs font-medium transition-opacity disabled:cursor-default ${bodyFont}`}
                        style={designedStyle}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {onSubmit ? (
          <div className="mt-6 space-y-3">
            {error ? (
              <p
                className={`text-center text-xs ${bodyFont}`}
                style={{ color: "#9a2a2a" }}
              >
                {error}
              </p>
            ) : null}
            {submitted ? (
              <p
                className={`text-center text-xs font-medium ${bodyFont}`}
                style={{ color: theme.accent }}
              >
                Thanks - your RSVP is saved. You can update it anytime.
              </p>
            ) : null}
            <button
              type="button"
              disabled={pending || Object.keys(answers).length === 0}
              onClick={handleSubmit}
              className={`${radius} w-full px-4 py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-40 ${bodyFont}`}
              style={{ backgroundColor: theme.accent }}
            >
              {pending
                ? "Saving..."
                : submitted
                  ? "Update RSVP"
                  : "Submit RSVP"}
            </button>
          </div>
        ) : interactive && Object.keys(answers).length > 0 ? (
          <p
            className={`mt-5 text-center text-xs font-medium ${bodyFont}`}
            style={{ color: theme.accent }}
          >
            Preview only - responses aren&apos;t saved yet
          </p>
        ) : null}
      </div>
    </div>
  );
}
