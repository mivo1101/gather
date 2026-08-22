"use client";

import type { ReactNode } from "react";
import type {
  CanvasElement,
  DividerStyle,
  ElementEffects,
  ElementStyle,
  EffectKind,
  VerticalAlign,
} from "@/lib/data/canvas-elements";
import {
  CANVAS_FONT_GROUPS,
  canvasFontCssFamily,
} from "@/lib/canvas-fonts";
import {
  isDecorativeGraphicSrc,
  isPatternGraphicSrc,
  isWeddingSilhouetteSrc,
} from "@/lib/data/element-library";
import {
  effectParams,
  resolveEffectKind,
  withEffectKind,
} from "@/lib/element-effects";
import {
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  AlignRightIcon,
} from "../editor-icons";
import { ImageFramePicker } from "../ImageFramePicker";
import {
  frameOrnamentColor,
  isDecorativeFrame,
} from "../image-frames";
import { Select } from "@/components/ui/Select";
import {
  ColourField,
  EditableNumberInput,
  EmptyHint,
  PanelSection,
  ThinSlider,
} from "./shared";

const DIVIDER_STYLES: { id: DividerStyle; label: string }[] = [
  { id: "solid", label: "Solid" },
  { id: "dashed", label: "Dashed" },
  { id: "dotted", label: "Dotted" },
  { id: "double", label: "Double" },
  { id: "thick", label: "Thick" },
  { id: "dots", label: "Dots" },
  { id: "diamond", label: "Diamond" },
];

interface StyleHandlers {
  onChangeStyle: (patch: Partial<ElementStyle>) => void;
  onChangeContent: (content: string) => void;
}

export function SelectedGuestNameStyles({
  selected,
  onChangeStyle,
}: {
  selected: CanvasElement;
  onChangeStyle: (patch: Partial<ElementStyle>) => void;
}) {
  const style = selected.style;

  return (
    <div className="space-y-5">
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium tracking-wide text-grey">
          Font
        </span>
        <Select
          variant="compact"
          wrapperClassName="block w-full"
          className="w-full"
          value={style.fontFamily}
          onChange={(e) =>
            onChangeStyle({
              fontFamily: e.target.value as ElementStyle["fontFamily"],
            })
          }
          style={{ fontFamily: canvasFontCssFamily(style.fontFamily) }}
        >
          {CANVAS_FONT_GROUPS.map((group) => (
            <optgroup key={group.label} label={group.label}>
              {group.fonts.map((font) => (
                <option
                  key={font.id}
                  value={font.id}
                  style={{ fontFamily: font.cssFamily }}
                >
                  {font.label}
                </option>
              ))}
            </optgroup>
          ))}
        </Select>
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs font-medium tracking-wide text-grey">
          Size
        </span>
        <div className="flex items-center rounded-xl border border-black/10 px-3 py-2">
          <EditableNumberInput
            value={style.fontSize}
            min={8}
            max={400}
            onChange={(fontSize) => onChangeStyle({ fontSize })}
            className="w-full bg-transparent text-sm outline-none"
            ariaLabel="Guest name font size"
          />
          <span className="text-xs text-grey">px</span>
        </div>
      </label>

      <ColourField
        label="Colour"
        value={style.color}
        onChange={(color) => onChangeStyle({ color })}
      />
    </div>
  );
}

export function SelectedTextStyles({
  selected,
  onChangeStyle,
  onChangeHref,
}: {
  selected: CanvasElement;
  onChangeStyle: (patch: Partial<ElementStyle>) => void;
  onChangeHref?: (href: string | null) => void;
}) {
  const style = selected.style;
  const effects = style.effects ?? {};

  return (
    <div className="space-y-5">
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium tracking-wide text-grey">
          Font
        </span>
        <Select
          variant="compact"
          wrapperClassName="block w-full"
          className="w-full"
          value={style.fontFamily}
          onChange={(e) =>
            onChangeStyle({
              fontFamily: e.target.value as ElementStyle["fontFamily"],
            })
          }
          style={{ fontFamily: canvasFontCssFamily(style.fontFamily) }}
        >
          {CANVAS_FONT_GROUPS.map((group) => (
            <optgroup key={group.label} label={group.label}>
              {group.fonts.map((font) => (
                <option
                  key={font.id}
                  value={font.id}
                  style={{ fontFamily: font.cssFamily }}
                >
                  {font.label}
                </option>
              ))}
            </optgroup>
          ))}
        </Select>
      </label>

      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium tracking-wide text-grey">
            Weight
          </span>
          <Select
            variant="compact"
            wrapperClassName="block w-full"
            className="w-full"
            value={style.fontWeight}
            onChange={(e) =>
              onChangeStyle({
                fontWeight: e.target.value as ElementStyle["fontWeight"],
              })
            }
          >
            <option value="regular">Regular</option>
            <option value="medium">Medium</option>
            <option value="bold">Bold</option>
          </Select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium tracking-wide text-grey">
            Size
          </span>
          <div className="flex items-center rounded-xl border border-black/10 px-3 py-2">
            <EditableNumberInput
              value={style.fontSize}
              min={8}
              max={400}
              onChange={(fontSize) => onChangeStyle({ fontSize })}
              className="w-full bg-transparent text-sm outline-none"
              ariaLabel="Font size"
            />
            <span className="text-xs text-grey">px</span>
          </div>
        </label>
      </div>

      <ColourField
        label="Colour"
        value={style.color}
        onChange={(color) => onChangeStyle({ color })}
      />

      <PanelSection title="Text style">
        <div className="grid grid-cols-4 gap-1">
          {(
            [
              ["bold", "B", "font-bold"],
              ["italic", "I", "italic"],
              ["underline", "U", "underline"],
              ["strike", "S", "line-through"],
            ] as const
          ).map(([key, label, className]) => (
            <button
              key={key}
              type="button"
              onClick={() => onChangeStyle({ [key]: !style[key] })}
              className={`rounded-xl border px-2 py-2 text-sm ${className} ${
                style[key]
                  ? "border-signature bg-signature/10 text-signature"
                  : "border-black/10 text-black hover:bg-soft-grey"
              }`}
              aria-pressed={style[key]}
            >
              {label}
            </button>
          ))}
        </div>
      </PanelSection>

      <PanelSection title="Text align">
        <div className="grid grid-cols-4 gap-1 rounded-xl bg-soft-grey p-1">
          {(
            [
              ["left", AlignLeftIcon],
              ["center", AlignCenterIcon],
              ["right", AlignRightIcon],
              ["justify", AlignJustifyIcon],
            ] as const
          ).map(([id, Icon]) => (
            <button
              key={id}
              type="button"
              onClick={() => onChangeStyle({ textAlign: id })}
              className={`flex h-9 items-center justify-center rounded-lg transition-colors ${
                style.textAlign === id
                  ? "bg-signature/15 text-signature"
                  : "text-grey hover:text-black"
              }`}
              aria-label={`Align ${id}`}
            >
              <Icon />
            </button>
          ))}
        </div>
      </PanelSection>

      <ThinSlider
        label="Line Spacing"
        value={style.lineHeight}
        min={0.8}
        max={2.4}
        step={0.1}
        display={style.lineHeight.toFixed(1)}
        onChange={(lineHeight) => onChangeStyle({ lineHeight })}
      />

      <ThinSlider
        label="Letter Spacing"
        value={style.letterSpacing}
        min={-4}
        max={20}
        step={1}
        display={String(style.letterSpacing)}
        onChange={(letterSpacing) => onChangeStyle({ letterSpacing })}
      />

      <PanelSection title="Anchor text box">
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-soft-grey p-1">
          {(
            [
              ["top", "Top"],
              ["middle", "Middle"],
              ["bottom", "Bottom"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() =>
                onChangeStyle({ verticalAlign: id as VerticalAlign })
              }
              className={`rounded-lg px-2 py-2 text-xs font-semibold ${
                (style.verticalAlign ?? "top") === id
                  ? "bg-white text-signature shadow-sm"
                  : "text-grey hover:text-black"
              }`}
              aria-label={`Anchor ${label}`}
            >
              {label}
            </button>
          ))}
        </div>
      </PanelSection>

      <EffectsPicker
        effects={effects}
        onChange={(next) => onChangeStyle({ effects: next })}
      />

      {onChangeHref ? (
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium tracking-wide text-grey">
            Link
          </span>
          <input
            type="url"
            value={selected.href || ""}
            onChange={(e) => onChangeHref(e.target.value.trim() || null)}
            placeholder="https://…"
            className="w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-signature/40 focus:ring-2 focus:ring-signature/20"
          />
        </label>
      ) : null}
    </div>
  );
}

function EffectsPicker({
  effects,
  onChange,
}: {
  effects: ElementEffects;
  onChange: (effects: ElementEffects) => void;
}) {
  const params = effectParams(effects);
  const kind = resolveEffectKind(effects);
  const presets: {
    id: EffectKind;
    label: string;
    preview: ReactNode;
  }[] = [
    {
      id: "drop",
      label: "Drop",
      preview: (
        <span
          className="block h-8 w-8 rounded-lg bg-signature"
          style={{
            boxShadow: "4px 5px 8px rgba(0,0,0,0.28)",
          }}
        />
      ),
    },
    {
      id: "glow",
      label: "Glow",
      preview: (
        <span
          className="block h-8 w-8 rounded-lg bg-signature"
          style={{
            boxShadow: "0 0 10px rgba(0,0,0,0.35), 0 0 4px rgba(0,0,0,0.2)",
          }}
        />
      ),
    },
    {
      id: "echo",
      label: "Echo",
      preview: (
        <span className="relative block h-8 w-8">
          <span className="absolute left-1.5 top-1.5 h-8 w-8 rounded-lg bg-signature/25" />
          <span className="absolute left-0.5 top-0.5 h-8 w-8 rounded-lg bg-signature/45" />
          <span className="absolute left-0 top-0 h-8 w-8 rounded-lg bg-signature" />
        </span>
      ),
    },
  ];

  const patch = (partial: Partial<ElementEffects>) =>
    onChange({ ...effects, kind, ...partial });

  return (
    <PanelSection title="Effects">
      <div className="grid grid-cols-3 gap-2">
        {presets.map((preset) => {
          const active = kind === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() =>
                onChange(
                  withEffectKind(effects, active ? "none" : preset.id),
                )
              }
              className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-2.5 transition-colors ${
                active
                  ? "border-signature bg-signature/10"
                  : "border-black/10 hover:border-black/20"
              }`}
            >
              <span className="flex h-12 w-full items-center justify-center rounded-lg bg-soft-grey/80">
                {preset.preview}
              </span>
              <span
                className={`text-xs font-semibold ${
                  active ? "text-signature" : "text-black"
                }`}
              >
                {preset.label}
              </span>
            </button>
          );
        })}
      </div>

      {kind !== "none" ? (
        <div className="mt-4 space-y-3">
          {kind !== "glow" ? (
            <EffectSlider
              label="Direction"
              value={params.direction}
              min={-180}
              max={180}
              onChange={(direction) => patch({ direction })}
            />
          ) : null}
          {kind !== "glow" ? (
            <EffectSlider
              label="Offset"
              value={params.offset}
              min={0}
              max={60}
              onChange={(offset) => patch({ offset })}
            />
          ) : null}
          <EffectSlider
            label="Blur"
            value={params.blur}
            min={0}
            max={40}
            onChange={(blur) => patch({ blur })}
          />
          <EffectSlider
            label="Transparency"
            value={params.transparency}
            min={0}
            max={100}
            onChange={(transparency) => patch({ transparency })}
          />
        </div>
      ) : null}
    </PanelSection>
  );
}

function EffectSlider({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  const step = 1;
  return (
    <div>
      <span className="mb-1.5 block text-xs font-medium tracking-wide text-grey">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-1.5 min-w-0 flex-1 appearance-none rounded-full bg-black/10 accent-signature [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-black/10 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow"
        />
        <div className="flex h-8 shrink-0 items-center overflow-hidden rounded-lg border border-black/10 bg-white">
          <button
            type="button"
            aria-label={`Decrease ${label}`}
            onClick={() => onChange(Math.max(min, value - step))}
            className="px-2 text-sm text-grey hover:bg-soft-grey hover:text-black"
          >
            −
          </button>
          <EditableNumberInput
            min={min}
            max={max}
            value={value}
            onChange={onChange}
            className="w-10 border-x border-black/10 bg-transparent py-1.5 text-center text-xs font-semibold outline-none"
            ariaLabel={label}
          />
          <button
            type="button"
            aria-label={`Increase ${label}`}
            onClick={() => onChange(Math.min(max, value + step))}
            className="px-2 text-sm text-grey hover:bg-soft-grey hover:text-black"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

export function SelectedImageStyles({
  selected,
  onChangeStyle,
}: {
  selected: CanvasElement;
  onChangeStyle: (patch: Partial<ElementStyle>) => void;
}) {
  const style = selected.style;
  const effects = style.effects ?? {};
  const isPattern = isPatternGraphicSrc(selected.content);
  const isWeddingSilhouette = isWeddingSilhouetteSrc(selected.content);
  const isDecorativeGraphic = isDecorativeGraphicSrc(selected.content);
  const decorativeFrame = isDecorativeFrame(style.frame);

  return (
    <div className="space-y-5">
      {(isPattern || isWeddingSilhouette) && (
        <>
          <ColourField
            label="Colour"
            value={style.color}
            onChange={(color) => onChangeStyle({ color })}
          />
          <p className="text-xs text-grey">
            {isWeddingSilhouette
              ? "Colour fills the silhouette interior. Choose transparent to reveal the card texture."
              : "Colour tints line-art patterns to match your invitation."}
          </p>
          {isWeddingSilhouette && (
            <button
              type="button"
              onClick={() => onChangeStyle({ color: "transparent" })}
              className="rounded-lg border border-black/10 px-3 py-2 text-xs font-semibold text-black hover:bg-soft-grey"
            >
              Transparent interior
            </button>
          )}
        </>
      )}

      {!isDecorativeGraphic && (
        <PanelSection title="Frames">
          <ImageFramePicker
            value={style.frame ?? "none"}
            onChange={(frame) => onChangeStyle({ frame })}
            frameColor={style.frameColor}
          />
          {decorativeFrame && (
            <div className="mt-4 space-y-2">
              <ColourField
                label="Frame colour"
                value={frameOrnamentColor(style.frame, style.frameColor)}
                onChange={(frameColor) => onChangeStyle({ frameColor })}
              />
              <p className="text-xs text-grey">
                The ornament recolours on its own, so the frame can follow the
                invitation rather than the photo.
              </p>
            </div>
          )}
        </PanelSection>
      )}

      <EffectsPicker
        effects={effects}
        onChange={(next) => onChangeStyle({ effects: next })}
      />
    </div>
  );
}

export function SelectedShapeStyles({
  selected,
  onChangeStyle,
}: {
  selected: CanvasElement;
  onChangeStyle: (patch: Partial<ElementStyle>) => void;
}) {
  return (
    <div className="space-y-5">
      <ColourField
        label="Colour"
        value={selected.style.color}
        onChange={(color) => onChangeStyle({ color })}
      />
      <PanelSection title="Border">
        <ColourField
          label="Border colour"
          value={selected.style.shapeBorderColor ?? "#1F2D22"}
          onChange={(shapeBorderColor) =>
            onChangeStyle({ shapeBorderColor })
          }
        />
        <ThinSlider
          label="Weight"
          value={selected.style.shapeBorderWidth ?? 0}
          min={0}
          max={12}
          step={0.5}
          display={`${selected.style.shapeBorderWidth ?? 0}px`}
          onChange={(shapeBorderWidth) =>
            onChangeStyle({ shapeBorderWidth })
          }
        />
      </PanelSection>
      <EffectsPicker
        effects={selected.style.effects ?? {}}
        onChange={(effects) => onChangeStyle({ effects })}
      />
    </div>
  );
}

export function SelectedDividerStyles({
  selected,
  onChangeStyle,
  onChangeContent,
}: {
  selected: CanvasElement;
} & StyleHandlers) {
  return (
    <div className="space-y-5">
      <PanelSection title="Divider style">
        <div className="grid grid-cols-2 gap-1.5">
          {DIVIDER_STYLES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onChangeContent(item.id)}
              className={`rounded-xl border px-2.5 py-2 text-left text-xs font-semibold ${
                (selected.content || "solid") === item.id
                  ? "border-signature bg-signature/10 text-signature"
                  : "border-black/10 text-black hover:bg-soft-grey"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </PanelSection>
      <ColourField
        label="Colour"
        value={selected.style.color}
        onChange={(color) => onChangeStyle({ color })}
      />
    </div>
  );
}

export function SelectedCardStyles({
  backgroundColor,
  onChangeBackground,
}: {
  backgroundColor: string;
  onChangeBackground: (color: string) => void;
}) {
  return (
    <div className="space-y-5">
      <EmptyHint>
        Card selected. Use the Background tool for patterns and borders, or
        change the fill colour below.
      </EmptyHint>
      <ColourField
        label="Background colour"
        value={backgroundColor}
        onChange={onChangeBackground}
      />
    </div>
  );
}

export function ToolTextIdle() {
  return (
    <EmptyHint>
      Select a text box on the canvas, or add one from the left panel presets.
    </EmptyHint>
  );
}
