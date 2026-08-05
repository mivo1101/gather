"use client";

import { useEffect, useState } from "react";
import type {
  CanvasElement,
  ElementStyle,
  WidgetConfig,
} from "@/lib/data/canvas-elements";
import type { InvitationPage } from "@/lib/data/invitation-content";
import type { EditorToolId, PropertiesTab } from "./editor-types";
import {
  SelectedCardStyles,
  SelectedDividerStyles,
  SelectedGuestNameStyles,
  SelectedImageStyles,
  SelectedShapeStyles,
  SelectedTextStyles,
  ToolTextIdle,
} from "./panels/SelectedStyles";
import { PositionPanel } from "./panels/PositionPanel";
import { SelectedWidgetStyles } from "./panels/SelectedWidgetStyles";
import { EmptyHint } from "./panels/shared";
import { ToolBackgroundPanel } from "./panels/ToolPanels";

interface EditorPropertiesPanelProps {
  activeTool: EditorToolId;
  selected: CanvasElement | null;
  canvasSelected: boolean;
  elements: CanvasElement[];
  activePage: InvitationPage;
  onChangeStyle: (patch: Partial<ElementStyle>) => void;
  onChangeContent: (content: string) => void;
  onChangeBackground: (color: string) => void;
  onChangePattern: (
    pattern: NonNullable<InvitationPage["backgroundPattern"]>,
  ) => void;
  onChangeTexture: (
    patch: Partial<
      Pick<
        InvitationPage,
        | "backgroundTexture"
        | "backgroundTextureOpacity"
        | "backgroundTextureTint"
        | "backgroundTextureBlend"
      >
    >,
  ) => void;
  onChangeBorder: (border: InvitationPage["border"]) => void;
  onChangeWidget: (widget: WidgetConfig) => void;
  onChangeHref: (href: string | null) => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onAlignToPage: (
    edge: "top" | "middle" | "bottom" | "left" | "center" | "right",
  ) => void;
  onChangeTransform: (patch: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    rotation?: number;
  }) => void;
}

/** Idle state for the right panel when nothing is selected — never duplicate left add UIs. */
function ToolIdle({ activeTool }: { activeTool: EditorToolId }) {
  switch (activeTool) {
    case "text":
      return <ToolTextIdle />;
    case "interactive":
      return (
        <EmptyHint>
          Select an interactive block on the canvas, or add one from the left
          panel.
        </EmptyHint>
      );
    case "elements":
      return (
        <EmptyHint>
          Select a shape, pattern, or divider on the canvas, or add one from the
          left panel.
        </EmptyHint>
      );
    case "images":
      return (
        <EmptyHint>
          Select a photo on the canvas, or add one from the left panel.
        </EmptyHint>
      );
    case "uploads":
      return (
        <EmptyHint>
          Select an uploaded image on the canvas, or add one from the left
          panel.
        </EmptyHint>
      );
    case "templates":
      return (
        <EmptyHint>
          Choose a template on the left to apply it. Select an element on the
          canvas to style it.
        </EmptyHint>
      );
    case "layout":
      return (
        <EmptyHint>
          Change card size on the left. Select an element to style it here.
        </EmptyHint>
      );
    case "background":
      return (
        <EmptyHint>
          Click the card background on the canvas to edit colour, pattern, and
          border.
        </EmptyHint>
      );
    case "qr":
      return <EmptyHint>QR Code tools coming soon.</EmptyHint>;
    case "brand":
      return <EmptyHint>Brand Kit coming soon.</EmptyHint>;
    default:
      return (
        <EmptyHint>
          Select an element on the canvas to edit its style.
        </EmptyHint>
      );
  }
}

function SelectedStyleBody(props: EditorPropertiesPanelProps) {
  const { selected } = props;
  if (!selected) return null;
  if (selected.type === "widget" && selected.widget) {
    if (selected.widget.kind === "guest_name") {
      return (
        <div className="space-y-5">
          <div className="rounded-xl bg-signature/5 px-3 py-3 text-xs leading-relaxed text-grey">
            Guest names are added automatically when invitations are sent. The
            placeholder copy cannot be edited.
          </div>
          <SelectedGuestNameStyles
            selected={selected}
            onChangeStyle={props.onChangeStyle}
          />
        </div>
      );
    }
    return (
      <SelectedWidgetStyles
        widget={selected.widget}
        onChange={props.onChangeWidget}
      />
    );
  }
  if (selected.type === "text") {
    return (
      <SelectedTextStyles
        selected={selected}
        onChangeStyle={props.onChangeStyle}
        onChangeHref={props.onChangeHref}
      />
    );
  }
  if (selected.type === "image") {
    return (
      <SelectedImageStyles
        selected={selected}
        onChangeStyle={props.onChangeStyle}
      />
    );
  }
  if (selected.type === "shape") {
    return (
      <SelectedShapeStyles
        selected={selected}
        onChangeStyle={props.onChangeStyle}
      />
    );
  }
  if (selected.type === "divider") {
    return (
      <SelectedDividerStyles
        selected={selected}
        onChangeStyle={props.onChangeStyle}
        onChangeContent={props.onChangeContent}
      />
    );
  }
  return null;
}

/**
 * Right panel: Style / Position for the selected canvas element.
 * Copy edits happen on-canvas; interactive details live under Style.
 */
export function EditorPropertiesPanel(props: EditorPropertiesPanelProps) {
  const { selected, canvasSelected, elements } = props;
  const [tab, setTab] = useState<PropertiesTab>("style");

  useEffect(() => {
    setTab("style");
  }, [selected?.id, canvasSelected, props.activeTool]);

  const selectedIndex = selected
    ? elements.findIndex((el) => el.id === selected.id)
    : -1;
  const canMoveForward =
    selectedIndex >= 0 && selectedIndex < elements.length - 1;
  const canMoveBackward = selectedIndex > 0;

  const tabs: { id: PropertiesTab; label: string }[] = [
    { id: "style", label: "Style" },
    { id: "position", label: "Position" },
  ];

  let body: React.ReactNode;

  if (tab === "position") {
    body = selected ? (
      <PositionPanel
        selected={selected}
        canMoveForward={canMoveForward}
        canMoveBackward={canMoveBackward}
        onBringForward={props.onBringForward}
        onSendBackward={props.onSendBackward}
        onBringToFront={props.onBringToFront}
        onSendToBack={props.onSendToBack}
        onAlign={props.onAlignToPage}
        onChangeTransform={props.onChangeTransform}
      />
    ) : (
      <EmptyHint>Select an element on the canvas to arrange it.</EmptyHint>
    );
  } else if (selected) {
    body = <SelectedStyleBody {...props} />;
  } else if (canvasSelected) {
    body =
      props.activeTool === "background" ? (
        <ToolBackgroundPanel
          page={props.activePage}
          onChangeBackground={props.onChangeBackground}
          onChangePattern={props.onChangePattern}
          onChangeTexture={props.onChangeTexture}
          onChangeBorder={props.onChangeBorder}
        />
      ) : (
        <SelectedCardStyles
          backgroundColor={props.activePage.backgroundColor}
          onChangeBackground={props.onChangeBackground}
        />
      );
  } else {
    body = <ToolIdle activeTool={props.activeTool} />;
  }

  return (
    <aside className="relative z-10 flex w-80 shrink-0 flex-col overflow-hidden rounded-2xl border border-black/[0.04] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)]">
      <div className="flex border-b border-black/5 px-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`relative flex-1 px-2 py-3 text-sm font-semibold transition-colors ${
              tab === item.id ? "text-black" : "text-grey hover:text-black"
            }`}
          >
            {item.label}
            {tab === item.id && (
              <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-signature" />
            )}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">{body}</div>
    </aside>
  );
}
