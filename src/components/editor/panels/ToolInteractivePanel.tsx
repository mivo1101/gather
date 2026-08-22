"use client";

import type { WidgetKind } from "@/lib/data/canvas-elements";
import {
  clearInsertDragData,
  setInsertDragData,
} from "@/lib/editor-insert-dnd";

const WIDGETS: {
  kind: WidgetKind;
  label: string;
  hint: string;
}[] = [
  {
    kind: "guest_name",
    label: "Guest name",
    hint: "Personalised automatically for each guest",
  },
  { kind: "map", label: "Map", hint: "Venue map + open link" },
  { kind: "attend", label: "Yes / No", hint: "Attend reply buttons" },
  { kind: "short_text", label: "Open answer", hint: "Free-text guest answer" },
  { kind: "single_choice", label: "Single choice", hint: "Pick one option" },
  { kind: "multi_choice", label: "Multi choice", hint: "Pick many options" },
];

interface ToolInteractivePanelProps {
  onAddWidget: (kind: WidgetKind) => void;
}

/** Left-panel catalog of placeable interactive widgets. */
export function ToolInteractivePanel({ onAddWidget }: ToolInteractivePanelProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-black">Interactive</h2>
        <p className="mt-1 text-sm text-grey">
          Click or drag a block onto the canvas, then style it on the right.
        </p>
      </div>
      <div className="space-y-2">
        {WIDGETS.map((item) => (
          <button
            key={item.kind}
            type="button"
            draggable
            onClick={() => onAddWidget(item.kind)}
            onDragStart={(event) => {
              setInsertDragData(event.dataTransfer, {
                type: "widget",
                kind: item.kind,
              });
            }}
            onDragEnd={() => clearInsertDragData()}
            className={`flex w-full cursor-grab flex-col items-start rounded-xl border px-3 py-3 text-left transition-colors hover:border-signature/40 active:cursor-grabbing ${
              item.kind === "guest_name"
                ? "border-signature/25 bg-signature/5 hover:bg-signature/10"
                : "border-black/10 bg-white hover:bg-soft-grey/60"
            }`}
          >
            <span className="text-sm font-semibold text-black">{item.label}</span>
            <span className="mt-0.5 text-xs text-grey">{item.hint}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
