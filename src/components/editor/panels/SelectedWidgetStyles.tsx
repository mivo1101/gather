"use client";

import type {
  WidgetChoiceOption,
  WidgetChromeStyle,
  WidgetConfig,
  WidgetKind,
} from "@/lib/data/canvas-elements";
import { widgetKindLabel } from "@/lib/data/canvas-elements";
import { ColourField, EditableNumberInput, PanelSection } from "./shared";

interface SelectedWidgetStylesProps {
  widget: WidgetConfig;
  onChange: (widget: WidgetConfig) => void;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-1.5 block text-[11px] font-medium tracking-wide text-grey">
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

function NumberInput({
  value,
  onChange,
  min = 0,
  max = 999,
  step = 1,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <EditableNumberInput
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={onChange}
      className="w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-signature/40 focus:ring-2 focus:ring-signature/20"
    />
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between py-1"
    >
      <span className="text-sm font-medium text-black">{label}</span>
      <span
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
          checked ? "bg-signature" : "bg-black/15"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-[18px]" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );
}

function optionId() {
  return `opt_${Math.random().toString(36).slice(2, 9)}`;
}

const KIND_LABEL: Record<WidgetKind, string> = {
  guest_name: widgetKindLabel("guest_name"),
  map: widgetKindLabel("map"),
  attend: widgetKindLabel("attend"),
  short_text: widgetKindLabel("short_text"),
  single_choice: widgetKindLabel("single_choice"),
  multi_choice: widgetKindLabel("multi_choice"),
};

function ChromeFields({
  title,
  chrome,
  onChange,
  includeTextColor = true,
}: {
  title: string;
  chrome: WidgetChromeStyle;
  onChange: (chrome: WidgetChromeStyle) => void;
  includeTextColor?: boolean;
}) {
  const patch = (partial: Partial<WidgetChromeStyle>) =>
    onChange({ ...chrome, ...partial });

  return (
    <PanelSection title={title}>
      <div className="space-y-3">
        <div>
          <ColourField
            label="Background"
            value={
              chrome.background === "transparent" ? "#ffffff" : chrome.background
            }
            onChange={(background) => patch({ background })}
          />
          <button
            type="button"
            onClick={() => patch({ background: "transparent" })}
            className={`mt-1.5 text-xs font-semibold ${
              chrome.background === "transparent"
                ? "text-signature"
                : "text-grey hover:text-black"
            }`}
          >
            {chrome.background === "transparent"
              ? "Transparent ✓"
              : "Use transparent"}
          </button>
        </div>
        {includeTextColor ? (
          <ColourField
            label="Text colour"
            value={chrome.textColor || "#1F2D22"}
            onChange={(textColor) => patch({ textColor })}
          />
        ) : null}
        <div>
          <FieldLabel>Border style</FieldLabel>
          <div className="flex flex-wrap gap-1.5">
            {(["none", "solid", "dashed"] as const).map((style) => (
              <button
                key={style}
                type="button"
                onClick={() =>
                  patch({
                    borderStyle: style,
                    borderWidth:
                      style === "none" ? 0 : Math.max(1, chrome.borderWidth),
                  })
                }
                className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                  chrome.borderStyle === style
                    ? "bg-black text-white"
                    : "border border-black/10 text-grey hover:text-black"
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>
        {chrome.borderStyle !== "none" ? (
          <>
            <label className="block">
              <FieldLabel>Border width</FieldLabel>
              <NumberInput
                value={chrome.borderWidth}
                min={0}
                max={8}
                step={0.5}
                onChange={(borderWidth) => patch({ borderWidth })}
              />
            </label>
            <ColourField
              label="Border colour"
              value={chrome.borderColor}
              onChange={(borderColor) => patch({ borderColor })}
            />
          </>
        ) : null}
        <label className="block">
          <FieldLabel>Corner radius</FieldLabel>
          <NumberInput
            value={chrome.radius}
            onChange={(radius) => patch({ radius })}
          />
        </label>
      </div>
    </PanelSection>
  );
}

function WidgetStyleBody({
  widget,
  patch,
}: {
  widget: WidgetConfig;
  patch: (partial: Partial<WidgetConfig>) => void;
}) {
  if (widget.kind === "map") {
    return (
      <>
        <PanelSection title="Location">
          <label className="block">
            <FieldLabel>Address or place</FieldLabel>
            <TextInput
              value={widget.mapsQuery}
              onChange={(mapsQuery) => patch({ mapsQuery })}
              placeholder="Venue name, city"
            />
          </label>
        </PanelSection>
        <PanelSection title="Map">
          <label className="block">
            <FieldLabel>Corner radius</FieldLabel>
            <NumberInput
              value={widget.radius}
              onChange={(radius) => patch({ radius })}
            />
          </label>
        </PanelSection>
        <PanelSection title="Open in Google Maps button">
          <div className="space-y-3">
            <Toggle
              label="Show button"
              checked={widget.showButton}
              onChange={(showButton) => patch({ showButton })}
            />
            {widget.showButton ? (
              <label className="block">
                <FieldLabel>Button text</FieldLabel>
                <TextInput
                  value={widget.buttonLabel}
                  onChange={(buttonLabel) => patch({ buttonLabel })}
                  placeholder="Open in Google Maps"
                />
              </label>
            ) : null}
          </div>
        </PanelSection>
        {widget.showButton ? (
          <ChromeFields
            title="Button style"
            chrome={widget.buttonStyle}
            onChange={(buttonStyle) => patch({ buttonStyle })}
          />
        ) : null}
      </>
    );
  }

  if (widget.kind === "attend") {
    return (
      <>
        <PanelSection title="Copy">
          <div className="space-y-3">
            <label className="block">
              <FieldLabel>Label</FieldLabel>
              <TextInput
                value={widget.label}
                onChange={(label) => patch({ label })}
              />
            </label>
            <label className="block">
              <FieldLabel>Yes button</FieldLabel>
              <TextInput
                value={widget.yesLabel}
                onChange={(yesLabel) => patch({ yesLabel })}
              />
            </label>
            <label className="block">
              <FieldLabel>No button</FieldLabel>
              <TextInput
                value={widget.noLabel}
                onChange={(noLabel) => patch({ noLabel })}
              />
            </label>
          </div>
        </PanelSection>
        <PanelSection title="Label colour">
          <ColourField
            label="Text"
            value={widget.labelStyle.color}
            onChange={(color) =>
              patch({ labelStyle: { ...widget.labelStyle, color } })
            }
          />
        </PanelSection>
        <ChromeFields
          title="Button style"
          chrome={widget.buttonStyle}
          onChange={(buttonStyle) => patch({ buttonStyle })}
        />
      </>
    );
  }

  if (widget.kind === "short_text") {
    return (
      <>
        <PanelSection title="Copy">
          <div className="space-y-3">
            <label className="block">
              <FieldLabel>Label</FieldLabel>
              <TextInput
                value={widget.label}
                onChange={(label) => patch({ label })}
              />
            </label>
            <label className="block">
              <FieldLabel>Placeholder</FieldLabel>
              <TextInput
                value={widget.placeholder}
                onChange={(placeholder) => patch({ placeholder })}
              />
            </label>
          </div>
        </PanelSection>
        <PanelSection title="Label colour">
          <ColourField
            label="Text"
            value={widget.labelStyle.color}
            onChange={(color) =>
              patch({ labelStyle: { ...widget.labelStyle, color } })
            }
          />
        </PanelSection>
        <ChromeFields
          title="Answer field style"
          chrome={widget.fieldStyle}
          onChange={(fieldStyle) => patch({ fieldStyle })}
        />
      </>
    );
  }

  if (widget.kind === "single_choice" || widget.kind === "multi_choice") {
    return (
      <>
        <PanelSection title="Choices">
          <div className="space-y-3">
            <label className="block">
              <FieldLabel>Label</FieldLabel>
              <TextInput
                value={widget.label}
                onChange={(label) => patch({ label })}
              />
            </label>
            <div className="space-y-1.5">
              {widget.options.map((option, index) => (
                <div key={option.id} className="flex items-center gap-1.5">
                  <TextInput
                    value={option.label}
                    onChange={(label) => {
                      const options = widget.options.map((o) =>
                        o.id === option.id ? { ...o, label } : o,
                      );
                      patch({ options });
                    }}
                    placeholder={`Option ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const options = widget.options.filter(
                        (o) => o.id !== option.id,
                      );
                      patch({ options });
                    }}
                    disabled={widget.options.length <= 1}
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
                  const options: WidgetChoiceOption[] = [
                    ...widget.options,
                    {
                      id: optionId(),
                      label: `Option ${widget.options.length + 1}`,
                    },
                  ];
                  patch({ options });
                }}
                className="text-xs font-semibold text-signature hover:underline"
              >
                + Add option
              </button>
            </div>
          </div>
        </PanelSection>
        <PanelSection title="Label colour">
          <ColourField
            label="Text"
            value={widget.labelStyle.color}
            onChange={(color) =>
              patch({ labelStyle: { ...widget.labelStyle, color } })
            }
          />
        </PanelSection>
        <ChromeFields
          title="Option style"
          chrome={widget.optionStyle}
          onChange={(optionStyle) => patch({ optionStyle })}
        />
      </>
    );
  }

  return null;
}

export function SelectedWidgetStyles({
  widget,
  onChange,
}: SelectedWidgetStylesProps) {
  const patch = (partial: Partial<WidgetConfig>) =>
    onChange({ ...widget, ...partial } as WidgetConfig);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold text-black">
          {KIND_LABEL[widget.kind]}
        </p>
      </div>
      <WidgetStyleBody widget={widget} patch={patch} />
    </div>
  );
}
