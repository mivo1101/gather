"use client";

import type { WidgetKind } from "@/lib/data/canvas-elements";

const WIDGETS: {
  kind: WidgetKind;
  label: string;
  hint: string;
}[] = [
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
          Add a block, then style it on the right.
        </p>
      </div>
      <div className="space-y-2">
        {WIDGETS.map((item) => (
          <button
            key={item.kind}
            type="button"
            onClick={() => onAddWidget(item.kind)}
            className="flex w-full flex-col items-start rounded-xl border border-black/10 bg-white px-3 py-3 text-left transition-colors hover:border-signature/40 hover:bg-soft-grey/60"
          >
            <span className="text-sm font-semibold text-black">{item.label}</span>
            <span className="mt-0.5 text-[11px] text-grey">{item.hint}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
