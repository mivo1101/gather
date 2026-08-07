"use client";

import {
  googleMapsEmbedUrl,
  googleMapsOpenUrl,
} from "@/lib/data/invitation-content";
import { normalizeRadius } from "@/lib/data/canvas-elements";
import type {
  ElementStyle,
  WidgetChromeStyle,
  WidgetConfig,
} from "@/lib/data/canvas-elements";
import {
  fillBoxStyle,
  fillTextStyle,
  contrastingInk,
  isGradient,
  isLightColor,
  isTransparent,
  parseCssColor,
  rgbToHex,
} from "@/lib/color-utils";
import { canvasFontFamilyClass } from "@/lib/canvas-fonts";

import type { RsvpAnswerValue } from "@/lib/data/rsvp-responses";

interface CanvasWidgetViewProps {
  widget: WidgetConfig;
  elementStyle?: ElementStyle;
  personalizedName?: string;
  /** Page / card surface behind translucent widget chrome. */
  surfaceColor?: string | null;
  /** Editor: no navigation / no answering. Preview/guest: interactive. */
  interactive?: boolean;
  /** Stable question id used when saving RSVP answers (usually the element id). */
  questionId?: string;
  answer?: RsvpAnswerValue;
  onAnswerChange?: (questionId: string, value: RsvpAnswerValue) => void;
  /** Editor: inline-edit labels / placeholders / options. */
  editing?: boolean;
  onChange?: (widget: WidgetConfig) => void;
  onStopEdit?: () => void;
  className?: string;
}

/**
 * Resolve chrome fill against the invitation surface so translucent option
 * boxes on dark cards don't get mistaken for light surfaces.
 */
function effectiveChromeSurface(
  background: string,
  surface: string | null | undefined,
): string {
  const page = surface || "#ffffff";
  if (!background || isTransparent(background)) return page;
  if (isGradient(background)) return background;

  const parsed = parseCssColor(background);
  if (!parsed) return page;
  if (parsed.a >= 0.92) return background;

  const back = parseCssColor(page) || { r: 255, g: 255, b: 255, a: 1 };
  const a = Math.min(1, Math.max(0, parsed.a));
  return rgbToHex(
    Math.round(parsed.r * a + back.r * (1 - a)),
    Math.round(parsed.g * a + back.g * (1 - a)),
    Math.round(parsed.b * a + back.b * (1 - a)),
  );
}

/** Prefer configured text colour when it contrasts with the fill; otherwise flip. */
function readableChromeText(
  chrome: WidgetChromeStyle,
  surface?: string | null,
): string {
  const effective = effectiveChromeSurface(chrome.background, surface);
  const fallback = contrastingInk(effective).ink;
  const raw = chrome.textColor || fallback;
  if (isGradient(raw) || isTransparent(raw)) return fallback;
  if (isLightColor(raw) === isLightColor(effective)) return fallback;
  return raw;
}

function mutedChromeText(
  chrome: WidgetChromeStyle,
  surface?: string | null,
): string {
  const ink = readableChromeText(chrome, surface);
  return isLightColor(ink) ? "rgba(255,255,255,0.58)" : "rgba(31,45,34,0.48)";
}

export function chromeBoxStyle(
  chrome: WidgetChromeStyle,
  surface?: string | null,
): React.CSSProperties {
  const borderWidth =
    chrome.borderStyle === "none" ? 0 : Math.max(0, chrome.borderWidth);
  const fill = fillBoxStyle(chrome.background);
  return {
    ...fill,
    borderColor: chrome.borderColor,
    borderWidth,
    borderStyle: borderWidth > 0 ? chrome.borderStyle : "none",
    borderRadius: normalizeRadius(chrome.radius),
    color: readableChromeText(chrome, surface),
  };
}

const editInputClass =
  "w-full bg-transparent outline outline-1 outline-dashed outline-signature/50 outline-offset-1 rounded-sm";

function EditableLine({
  value,
  onChange,
  onStopEdit,
  className = "",
  style,
  placeholder,
  autoFocus,
}: {
  value: string;
  onChange: (value: string) => void;
  onStopEdit?: () => void;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  return (
    <input
      type="text"
      autoFocus={autoFocus}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Escape") onStopEdit?.();
        e.stopPropagation();
      }}
      onPointerDown={(e) => e.stopPropagation()}
      className={`${editInputClass} ${className}`}
      style={style}
    />
  );
}

/** Renders a placeable interactive widget on the invitation canvas. */
export function CanvasWidgetView({
  widget,
  elementStyle,
  personalizedName = "Guest name",
  surfaceColor = null,
  interactive = false,
  questionId,
  answer,
  onAnswerChange,
  editing = false,
  onChange,
  onStopEdit,
  className = "",
}: CanvasWidgetViewProps) {
  const patch = (partial: Partial<WidgetConfig>) => {
    if (!onChange) return;
    onChange({ ...widget, ...partial } as WidgetConfig);
  };
  const qid = questionId || widget.kind;
  const chromeSurface = surfaceColor;

  if (widget.kind === "guest_name") {
    const style = elementStyle;
    const verticalAlign = style?.verticalAlign ?? "middle";
    return (
      <div
        className={`flex h-full w-full ${
          verticalAlign === "bottom"
            ? "items-end"
            : verticalAlign === "top"
              ? "items-start"
              : "items-center"
        } ${className}`}
      >
        <span
          data-canvas-text
          className={`w-full whitespace-pre-wrap break-words ${
            style ? canvasFontFamilyClass(style.fontFamily) : ""
          }`}
          style={
            style
              ? {
                  fontSize: `${style.fontSize}px`,
                  fontWeight:
                    style.bold || style.fontWeight === "bold"
                      ? 700
                      : style.fontWeight === "medium"
                        ? 500
                        : 400,
                  ...fillTextStyle(style.color),
                  textAlign: style.textAlign,
                  lineHeight: style.lineHeight,
                  letterSpacing: `${style.letterSpacing}px`,
                  fontStyle: style.italic ? "italic" : "normal",
                  textDecoration: [
                    style.underline ? "underline" : "",
                    style.strike ? "line-through" : "",
                  ]
                    .filter(Boolean)
                    .join(" "),
                }
              : undefined
          }
        >
          {personalizedName}
        </span>
      </div>
    );
  }

  if (widget.kind === "map") {
    const query = widget.mapsQuery.trim() || "Melbourne, Australia";
    const embedUrl = googleMapsEmbedUrl(query);
    const openUrl = googleMapsOpenUrl(query);
    const mapRadius = normalizeRadius(widget.radius);
    const buttonStyle = chromeBoxStyle(widget.buttonStyle, chromeSurface);
    const buttonLabel = widget.buttonLabel.trim() || "Open in Google Maps";

    return (
      <div className={`flex h-full w-full flex-col gap-2 ${className}`}>
        <div
          className="relative min-h-0 flex-1 overflow-hidden"
          style={{ borderRadius: mapRadius }}
        >
          <iframe
            title={`Map of ${query}`}
            src={embedUrl}
            className="h-full min-h-[80px] w-full border-0"
            style={{ borderRadius: mapRadius }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            tabIndex={interactive ? undefined : -1}
          />
          {!interactive ? (
            <div className="absolute inset-0 z-10" aria-hidden="true" />
          ) : null}
          {editing ? (
            <div
              className="absolute inset-x-2 top-2 z-20"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <EditableLine
                value={widget.mapsQuery}
                onChange={(mapsQuery) => patch({ mapsQuery })}
                onStopEdit={onStopEdit}
                autoFocus
                placeholder="Venue name, city"
                className="rounded-lg bg-white/95 px-2 py-1.5 text-[11px] font-medium text-black shadow"
              />
            </div>
          ) : null}
        </div>
        {widget.showButton ? (
          editing ? (
            <EditableLine
              value={widget.buttonLabel}
              onChange={(buttonLabel) => patch({ buttonLabel })}
              onStopEdit={onStopEdit}
              placeholder="Open in Google Maps"
              className="shrink-0 px-3 py-2 text-center text-[11px] font-semibold placeholder:opacity-55"
              style={buttonStyle}
            />
          ) : interactive ? (
            <a
              href={openUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 px-3 py-2 text-center text-[11px] font-semibold"
              style={buttonStyle}
            >
              {buttonLabel}
            </a>
          ) : (
            <span
              className="shrink-0 px-3 py-2 text-center text-[11px] font-semibold"
              style={buttonStyle}
            >
              {buttonLabel}
            </span>
          )
        ) : null}
      </div>
    );
  }

  if (widget.kind === "attend") {
    const buttonStyle = chromeBoxStyle(widget.buttonStyle, chromeSurface);
    const btnClass = "block w-full px-3 py-2 text-center text-[11px] font-semibold";
    return (
      <div
        className={`flex h-full w-full flex-col justify-center gap-2 ${className}`}
      >
        {editing ? (
          <EditableLine
            value={widget.label}
            onChange={(label) => patch({ label })}
            onStopEdit={onStopEdit}
            autoFocus
            placeholder="Add question…"
            className="text-center text-[12px] font-semibold"
            style={{ color: widget.labelStyle.color }}
          />
        ) : widget.label ? (
          <p
            className="text-center text-[12px] font-semibold"
            style={{ color: widget.labelStyle.color }}
          >
            {widget.label}
          </p>
        ) : null}
        {editing ? (
          <>
            <EditableLine
              value={widget.yesLabel}
              onChange={(yesLabel) => patch({ yesLabel })}
              onStopEdit={onStopEdit}
              className={btnClass}
              style={buttonStyle}
            />
            <EditableLine
              value={widget.noLabel}
              onChange={(noLabel) => patch({ noLabel })}
              onStopEdit={onStopEdit}
              className={btnClass}
              style={buttonStyle}
            />
          </>
        ) : interactive ? (
          <>
            {(["yes", "no"] as const).map((value) => {
              const selected = answer === value;
              const hasAnswer = answer === "yes" || answer === "no";
              const label =
                value === "yes" ? widget.yesLabel : widget.noLabel;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => onAnswerChange?.(qid, value)}
                  className={`${btnClass} transition-opacity`}
                      style={{
                    ...buttonStyle,
                    ...(hasAnswer && !selected
                      ? {
                          opacity: 0.38,
                        }
                      : null),
                  }}
                >
                  {label}
                </button>
              );
            })}
          </>
        ) : (
          <>
            <div className={btnClass} style={buttonStyle}>
              {widget.yesLabel}
            </div>
            <div className={btnClass} style={buttonStyle}>
              {widget.noLabel}
            </div>
          </>
        )}
      </div>
    );
  }

  if (widget.kind === "short_text") {
    const fieldStyle = chromeBoxStyle(widget.fieldStyle, chromeSurface);
    const placeholderColor = mutedChromeText(widget.fieldStyle, chromeSurface);
    return (
      <div
        className={`flex h-full w-full flex-col justify-center gap-1.5 ${className}`}
      >
        {editing ? (
          <EditableLine
            value={widget.label}
            onChange={(label) => patch({ label })}
            onStopEdit={onStopEdit}
            autoFocus
            placeholder="Add question…"
            className="text-[12px] font-semibold"
            style={{ color: widget.labelStyle.color }}
          />
        ) : widget.label ? (
          <p
            className="text-[12px] font-semibold"
            style={{ color: widget.labelStyle.color }}
          >
            {widget.label}
          </p>
        ) : null}
        {editing ? (
          <EditableLine
            value={widget.placeholder}
            onChange={(placeholder) => patch({ placeholder })}
            onStopEdit={onStopEdit}
            placeholder="Placeholder…"
            className="w-full px-3 py-2 text-[11px] placeholder:opacity-55"
            style={fieldStyle}
          />
        ) : interactive ? (
          <input
            type="text"
            value={typeof answer === "string" ? answer : ""}
            onChange={(e) => onAnswerChange?.(qid, e.target.value)}
            placeholder={widget.placeholder || "Type here…"}
            className="w-full px-3 py-2 text-[11px] outline-none [&::placeholder]:text-[var(--widget-placeholder)]"
            style={{
              ...fieldStyle,
              ["--widget-placeholder" as string]: placeholderColor,
            }}
          />
        ) : (
          <div className="w-full px-3 py-2 text-[11px]" style={fieldStyle}>
            <span style={{ color: placeholderColor }}>
              {widget.placeholder || "Type here…"}
            </span>
          </div>
        )}
      </div>
    );
  }

  if (
    widget.kind !== "single_choice" &&
    widget.kind !== "multi_choice"
  ) {
    return null;
  }

  const optionStyle = chromeBoxStyle(widget.optionStyle, chromeSurface);
  const optionPlaceholder = mutedChromeText(widget.optionStyle, chromeSurface);
  const options = widget.options ?? [];
  return (
    <div
      className={`flex h-full w-full flex-col justify-center gap-1.5 ${className}`}
    >
      {editing ? (
        <EditableLine
          value={widget.label}
          onChange={(label) => patch({ label })}
          onStopEdit={onStopEdit}
          autoFocus
          placeholder="Add question…"
          className="text-[12px] font-semibold"
          style={{ color: widget.labelStyle.color }}
        />
      ) : widget.label ? (
        <p
          className="text-[12px] font-semibold"
          style={{ color: widget.labelStyle.color }}
        >
          {widget.label}
        </p>
      ) : null}
      <div className="flex flex-col gap-1">
        {options.map((option) => {
          const selected =
            widget.kind === "multi_choice"
              ? Array.isArray(answer) && answer.includes(option.id)
              : answer === option.id;
          const hasChoiceAnswer =
            widget.kind === "multi_choice"
              ? Array.isArray(answer) && answer.length > 0
              : typeof answer === "string" && answer.length > 0;

          if (editing) {
            return (
              <div
                key={option.id}
                className="flex items-center gap-2 px-2.5 py-1.5 text-[11px]"
                style={optionStyle}
              >
                <span
                  className={`inline-block h-3 w-3 shrink-0 border border-current ${
                    widget.kind === "multi_choice"
                      ? "rounded-[2px]"
                      : "rounded-full"
                  }`}
                  aria-hidden="true"
                />
                <EditableLine
                  value={option.label}
                  onChange={(label) => {
                    const nextOptions = options.map((o) =>
                      o.id === option.id ? { ...o, label } : o,
                    );
                    patch({ options: nextOptions });
                  }}
                  onStopEdit={onStopEdit}
                  placeholder="Option"
                  className="flex-1 text-[11px] placeholder:opacity-55"
                  style={{ color: "inherit" }}
                />
              </div>
            );
          }

          if (interactive) {
            return (
              <label
                key={option.id}
                className="flex items-center gap-2 px-2.5 py-1.5 text-[11px] transition-opacity"
                style={{
                  ...optionStyle,
                  ...(hasChoiceAnswer && !selected
                    ? {
                        opacity: 0.38,
                      }
                    : null),
                }}
              >
                <input
                  type={widget.kind === "multi_choice" ? "checkbox" : "radio"}
                  name={
                    widget.kind === "single_choice"
                      ? `choice-${qid}`
                      : undefined
                  }
                  className="accent-current"
                  checked={selected}
                  onChange={() => {
                    if (widget.kind === "multi_choice") {
                      const current = Array.isArray(answer) ? answer : [];
                      const next = current.includes(option.id)
                        ? current.filter((id) => id !== option.id)
                        : [...current, option.id];
                      onAnswerChange?.(qid, next);
                    } else {
                      onAnswerChange?.(qid, option.id);
                    }
                  }}
                />
                <span style={{ color: "inherit" }}>{option.label}</span>
              </label>
            );
          }

          return (
            <div
              key={option.id}
              className="flex items-center gap-2 px-2.5 py-1.5 text-[11px]"
              style={optionStyle}
            >
              <span
                className={`inline-block h-3 w-3 shrink-0 border border-current ${
                  widget.kind === "multi_choice"
                    ? "rounded-[2px]"
                    : "rounded-full"
                }`}
                aria-hidden="true"
              />
              <span style={{ color: option.label.trim() ? "inherit" : optionPlaceholder }}>
                {option.label.trim() || "Option"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
