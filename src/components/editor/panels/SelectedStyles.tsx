"use client";

import type {
  CanvasElement,
  DividerStyle,
  ElementEffects,
  ElementStyle,
  ImageFrame,
  VerticalAlign,
} from "@/lib/data/canvas-elements";
import { isPatternGraphicSrc } from "@/lib/data/element-library";
import {
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  AlignRightIcon,
} from "../editor-icons";
import { ColourField, EmptyHint, PanelSection, ThinSlider } from "./shared";

const DIVIDER_STYLES: { id: DividerStyle; label: string }[] = [
  { id: "solid", label: "Solid" },
  { id: "dashed", label: "Dashed" },
  { id: "dotted", label: "Dotted" },
  { id: "double", label: "Double" },
  { id: "thick", label: "Thick" },
  { id: "dots", label: "Dots" },
  { id: "diamond", label: "Diamond" },
];

const FRAMES: { id: ImageFrame; label: string }[] = [
  { id: "none", label: "None" },
  { id: "square", label: "Square" },
  { id: "circle", label: "Circle" },
  { id: "heart", label: "Heart" },
  { id: "rounded", label: "Rounded" },
];

interface StyleHandlers {
  onChangeStyle: (patch: Partial<ElementStyle>) => void;
  onChangeContent: (content: string) => void;
}

export function SelectedTextStyles({
  selected,
  onChangeStyle,
}: {
  selected: CanvasElement;
  onChangeStyle: (patch: Partial<ElementStyle>) => void;
}) {
  const style = selected.style;
  const effects = style.effects ?? {};

  return (
    <div className="space-y-5">
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-grey">
          Font
        </span>
        <select
          value={style.fontFamily}
          onChange={(e) =>
            onChangeStyle({
              fontFamily: e.target.value as ElementStyle["fontFamily"],
            })
          }
          className="w-full appearance-none rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-signature/40 focus:ring-2 focus:ring-signature/20"
        >
          <option value="playfair">Playfair Display</option>
          <option value="urbanist">Urbanist</option>
          <option value="caveat">Caveat</option>
        </select>
      </label>

      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-grey">
            Weight
          </span>
          <select
            value={style.fontWeight}
            onChange={(e) =>
              onChangeStyle({
                fontWeight: e.target.value as ElementStyle["fontWeight"],
              })
            }
            className="w-full appearance-none rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-signature/40"
          >
            <option value="regular">Regular</option>
            <option value="medium">Medium</option>
            <option value="bold">Bold</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-grey">
            Size
          </span>
          <div className="flex items-center rounded-xl border border-black/10 px-3 py-2">
            <input
              type="number"
              value={style.fontSize}
              onChange={(e) =>
                onChangeStyle({ fontSize: Number(e.target.value) || 8 })
              }
              className="w-full bg-transparent text-sm outline-none"
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
        showInset={false}
      />
    </div>
  );
}

function EffectsPicker({
  effects,
  onChange,
  showInset,
}: {
  effects: ElementEffects;
  onChange: (effects: ElementEffects) => void;
  showInset: boolean;
}) {
  const items: { key: keyof ElementEffects; label: string }[] = [
    { key: "shadow", label: showInset ? "Shadow out" : "Drop" },
    { key: "glow", label: "Glow" },
    { key: "outline", label: "Outline" },
  ];
  if (showInset) {
    items.splice(1, 0, { key: "shadowInset", label: "Shadow in" });
  }

  return (
    <PanelSection title="Effects">
      <div className="grid grid-cols-2 gap-1.5">
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() =>
              onChange({ ...effects, [item.key]: !effects[item.key] })
            }
            className={`rounded-xl border px-2.5 py-2 text-left text-xs font-semibold ${
              effects[item.key]
                ? "border-signature bg-signature/10 text-signature"
                : "border-black/10 text-black hover:bg-soft-grey"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </PanelSection>
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

  return (
    <div className="space-y-5">
      {isPattern && (
        <>
          <ColourField
            label="Colour"
            value={style.color}
            onChange={(color) => onChangeStyle({ color })}
          />
          <p className="text-xs text-grey">
            Colour tints line-art patterns to match your invitation.
          </p>
        </>
      )}

      <PanelSection title="Frames">
        <div className="grid grid-cols-2 gap-1.5">
          {FRAMES.map((frame) => (
            <button
              key={frame.id}
              type="button"
              onClick={() => onChangeStyle({ frame: frame.id })}
              className={`rounded-xl border px-2.5 py-2 text-left text-xs font-semibold ${
                (style.frame ?? "none") === frame.id
                  ? "border-signature bg-signature/10 text-signature"
                  : "border-black/10 text-black hover:bg-soft-grey"
              }`}
            >
              {frame.label}
            </button>
          ))}
        </div>
      </PanelSection>

      <EffectsPicker
        effects={effects}
        onChange={(next) => onChangeStyle({ effects: next })}
        showInset
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
      <EffectsPicker
        effects={selected.style.effects ?? {}}
        onChange={(effects) => onChangeStyle({ effects })}
        showInset={false}
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
