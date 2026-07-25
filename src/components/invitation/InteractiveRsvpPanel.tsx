"use client";

import { useState } from "react";
import type { RsvpConfig, RsvpQuestion } from "@/lib/data/invitation-content";

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
}

/** Themed, multi-question RSVP card — style follows each template. */
export function InteractiveRsvpPanel({
  config,
  prompt,
  note,
  interactive = true,
  className = "",
}: InteractiveRsvpPanelProps) {
  const resolved: RsvpConfig = config
    ? config
    : {
        ...DEFAULT_CONFIG,
        title: prompt || DEFAULT_CONFIG.title,
        note: note || DEFAULT_CONFIG.note,
      };

  const { theme, questions } = resolved;
  const [answers, setAnswers] = useState<Record<string, string | string[]>>(
    {},
  );

  const setAttend = (questionId: string, value: "yes" | "no") => {
    if (!interactive) return;
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const setText = (questionId: string, value: string) => {
    if (!interactive) return;
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const toggleChoice = (
    question: RsvpQuestion,
    optionId: string,
    multi: boolean,
  ) => {
    if (!interactive) return;
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
              className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${bodyFont}`}
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
                      const label = value === "yes" ? yesLabel : noLabel;
                      return (
                        <button
                          key={value}
                          type="button"
                          disabled={!interactive}
                          onClick={() => setAttend(question.id, value)}
                          className={`${radius} px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-default ${bodyFont}`}
                          style={
                            selected
                              ? {
                                  backgroundColor: theme.accent,
                                  color: "#ffffff",
                                  border: `1px solid ${theme.accent}`,
                                }
                              : {
                                  backgroundColor: theme.surface || "transparent",
                                  color: theme.accent,
                                  border: `1px solid ${theme.accent}`,
                                }
                          }
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
                  {interactive ? (
                    <input
                      type="text"
                      value={typeof answer === "string" ? answer : ""}
                      onChange={(event) =>
                        setText(question.id, event.target.value)
                      }
                      placeholder={question.placeholder || "Type here..."}
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
                        color: theme.muted,
                        backgroundColor: theme.surface || "transparent",
                      }}
                    >
                      {question.placeholder || "Type here..."}
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
                    return (
                      <button
                        key={option.id}
                        type="button"
                        disabled={!interactive}
                        onClick={() =>
                          toggleChoice(question, option.id, multi)
                        }
                        className={`${radius} px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-default ${bodyFont}`}
                        style={
                          selected
                            ? {
                                backgroundColor: theme.accent,
                                color: "#ffffff",
                                border: `1px solid ${theme.accent}`,
                              }
                            : {
                                backgroundColor:
                                  theme.surface || "transparent",
                                color: theme.text,
                                border: `1px solid ${theme.accent}55`,
                              }
                        }
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

        {interactive && Object.keys(answers).length > 0 ? (
          <p
            className={`mt-5 text-center text-xs font-medium ${bodyFont}`}
            style={{ color: theme.accent }}
          >
            Preview only — responses aren&apos;t saved yet
          </p>
        ) : null}
      </div>
    </div>
  );
}
