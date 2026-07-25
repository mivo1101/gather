"use client";

import {
  createRsvpChoiceOption,
  createRsvpQuestion,
  type RsvpConfig,
  type RsvpQuestion,
  type RsvpQuestionType,
  type RsvpTheme,
} from "@/lib/data/invitation-content";
import { ColourField, PanelSection } from "./shared";

const QUESTION_TYPES: { type: RsvpQuestionType; label: string }[] = [
  { type: "attend", label: "Yes / No" },
  { type: "short_text", label: "Short text" },
  { type: "single_choice", label: "Single choice" },
  { type: "multi_choice", label: "Multi choice" },
];

const BUTTON_STYLES: RsvpTheme["buttonStyle"][] = [
  "pill",
  "square",
  "outline",
  "chip",
];

const FONTS: RsvpTheme["headingFont"][] = ["playfair", "urbanist", "caveat"];

interface RsvpBuilderPanelProps {
  config: RsvpConfig;
  onChange: (config: RsvpConfig) => void;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-grey">
      {children}
    </span>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-signature/40 focus:ring-2 focus:ring-signature/20"
    />
  );
}

function questionTypeLabel(type: RsvpQuestionType) {
  return QUESTION_TYPES.find((item) => item.type === type)?.label ?? type;
}

export function RsvpBuilderPanel({ config, onChange }: RsvpBuilderPanelProps) {
  const patch = (partial: Partial<RsvpConfig>) =>
    onChange({ ...config, ...partial });

  const patchTheme = (partial: Partial<RsvpTheme>) =>
    onChange({ ...config, theme: { ...config.theme, ...partial } });

  const updateQuestion = (id: string, partial: Partial<RsvpQuestion>) => {
    onChange({
      ...config,
      questions: config.questions.map((q) =>
        q.id === id ? { ...q, ...partial } : q,
      ),
    });
  };

  const moveQuestion = (index: number, direction: -1 | 1) => {
    const next = index + direction;
    if (next < 0 || next >= config.questions.length) return;
    const questions = [...config.questions];
    const [item] = questions.splice(index, 1);
    questions.splice(next, 0, item);
    onChange({ ...config, questions });
  };

  const removeQuestion = (id: string) => {
    if (config.questions.length <= 1) return;
    onChange({
      ...config,
      questions: config.questions.filter((q) => q.id !== id),
    });
  };

  const addQuestion = (type: RsvpQuestionType) => {
    onChange({
      ...config,
      questions: [...config.questions, createRsvpQuestion(type)],
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-black">RSVP page</p>
        <p className="mt-1 text-xs text-grey">
          Build questions guests answer. Preview updates live.
        </p>
      </div>

      <PanelSection title="Header">
        <div className="space-y-3">
          <label className="block">
            <FieldLabel>Eyebrow</FieldLabel>
            <TextInput
              value={config.eyebrow ?? ""}
              onChange={(eyebrow) => patch({ eyebrow })}
              placeholder="RSVP"
            />
          </label>
          <label className="block">
            <FieldLabel>Title</FieldLabel>
            <TextInput
              value={config.title}
              onChange={(title) => patch({ title })}
              placeholder="Will you be joining us?"
            />
          </label>
          <label className="block">
            <FieldLabel>Note</FieldLabel>
            <TextInput
              value={config.note ?? ""}
              onChange={(note) => patch({ note })}
              placeholder="Please respond soon"
            />
          </label>
        </div>
      </PanelSection>

      <PanelSection title="Questions">
        <div className="space-y-3">
          {config.questions.map((question, index) => (
            <div
              key={question.id}
              className="rounded-xl border border-black/10 bg-soft-grey/40 p-3"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-black">
                  {index + 1}. {questionTypeLabel(question.type)}
                </span>
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => moveQuestion(index, -1)}
                    disabled={index === 0}
                    className="rounded px-1.5 py-0.5 text-xs text-grey hover:bg-white hover:text-black disabled:opacity-30"
                    aria-label="Move up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveQuestion(index, 1)}
                    disabled={index === config.questions.length - 1}
                    className="rounded px-1.5 py-0.5 text-xs text-grey hover:bg-white hover:text-black disabled:opacity-30"
                    aria-label="Move down"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeQuestion(question.id)}
                    disabled={config.questions.length <= 1}
                    className="rounded px-1.5 py-0.5 text-xs text-grey hover:bg-white hover:text-signature disabled:opacity-30"
                    aria-label="Remove question"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <TextInput
                  value={question.label}
                  onChange={(label) => updateQuestion(question.id, { label })}
                  placeholder="Question label"
                />

                {question.type === "attend" && (
                  <>
                    <TextInput
                      value={question.yesLabel ?? ""}
                      onChange={(yesLabel) =>
                        updateQuestion(question.id, { yesLabel })
                      }
                      placeholder="Yes label"
                    />
                    <TextInput
                      value={question.noLabel ?? ""}
                      onChange={(noLabel) =>
                        updateQuestion(question.id, { noLabel })
                      }
                      placeholder="No label"
                    />
                  </>
                )}

                {question.type === "short_text" && (
                  <TextInput
                    value={question.placeholder ?? ""}
                    onChange={(placeholder) =>
                      updateQuestion(question.id, { placeholder })
                    }
                    placeholder="Input placeholder"
                  />
                )}

                {(question.type === "single_choice" ||
                  question.type === "multi_choice") && (
                  <div className="space-y-1.5">
                    {(question.options ?? []).map((option, optIndex) => (
                      <div key={option.id} className="flex items-center gap-1.5">
                        <TextInput
                          value={option.label}
                          onChange={(label) => {
                            const options = (question.options ?? []).map((o) =>
                              o.id === option.id ? { ...o, label } : o,
                            );
                            updateQuestion(question.id, { options });
                          }}
                          placeholder={`Option ${optIndex + 1}`}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const options = (question.options ?? []).filter(
                              (o) => o.id !== option.id,
                            );
                            updateQuestion(question.id, { options });
                          }}
                          disabled={(question.options ?? []).length <= 1}
                          className="shrink-0 rounded px-1.5 py-2 text-xs text-grey hover:text-signature disabled:opacity-30"
                          aria-label="Remove option"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const options = [
                          ...(question.options ?? []),
                          createRsvpChoiceOption(
                            `Option ${(question.options?.length ?? 0) + 1}`,
                          ),
                        ];
                        updateQuestion(question.id, { options });
                      }}
                      className="text-xs font-semibold text-signature hover:underline"
                    >
                      + Add option
                    </button>
                  </div>
                )}

                <label className="flex items-center gap-2 pt-1 text-xs text-grey">
                  <input
                    type="checkbox"
                    checked={Boolean(question.required)}
                    onChange={(e) =>
                      updateQuestion(question.id, {
                        required: e.target.checked,
                      })
                    }
                    className="accent-signature"
                  />
                  Required
                </label>
              </div>
            </div>
          ))}

          <div className="flex flex-wrap gap-1.5">
            {QUESTION_TYPES.map((item) => (
              <button
                key={item.type}
                type="button"
                onClick={() => addQuestion(item.type)}
                className="rounded-full border border-black/10 bg-white px-2.5 py-1 text-xs font-semibold text-black hover:border-signature/40 hover:text-signature"
              >
                + {item.label}
              </button>
            ))}
          </div>
        </div>
      </PanelSection>

      <PanelSection title="Theme">
        <div className="space-y-3">
          <ColourField
            label="Accent"
            value={config.theme.accent}
            onChange={(accent) => patchTheme({ accent })}
          />
          <ColourField
            label="Background"
            value={config.theme.background}
            onChange={(background) => patchTheme({ background })}
          />
          <ColourField
            label="Text"
            value={config.theme.text}
            onChange={(text) => patchTheme({ text })}
          />
          <ColourField
            label="Muted"
            value={config.theme.muted}
            onChange={(muted) => patchTheme({ muted })}
          />

          <div>
            <FieldLabel>Button style</FieldLabel>
            <div className="flex flex-wrap gap-1.5">
              {BUTTON_STYLES.map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => patchTheme({ buttonStyle: style })}
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                    config.theme.buttonStyle === style
                      ? "bg-black text-white"
                      : "border border-black/10 text-grey hover:text-black"
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          <div>
            <FieldLabel>Heading font</FieldLabel>
            <div className="flex flex-wrap gap-1.5">
              {FONTS.map((font) => (
                <button
                  key={font}
                  type="button"
                  onClick={() => patchTheme({ headingFont: font })}
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                    config.theme.headingFont === font
                      ? "bg-black text-white"
                      : "border border-black/10 text-grey hover:text-black"
                  }`}
                >
                  {font}
                </button>
              ))}
            </div>
          </div>

          <div>
            <FieldLabel>Body font</FieldLabel>
            <div className="flex flex-wrap gap-1.5">
              {FONTS.map((font) => (
                <button
                  key={font}
                  type="button"
                  onClick={() => patchTheme({ bodyFont: font })}
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                    config.theme.bodyFont === font
                      ? "bg-black text-white"
                      : "border border-black/10 text-grey hover:text-black"
                  }`}
                >
                  {font}
                </button>
              ))}
            </div>
          </div>
        </div>
      </PanelSection>
    </div>
  );
}
