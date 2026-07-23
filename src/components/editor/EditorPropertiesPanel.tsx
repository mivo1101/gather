"use client";

import { useEffect, useState } from "react";
import type {
  CanvasElement,
  ElementStyle,
  ImageFrame,
} from "@/lib/data/canvas-elements";
import type { InvitationPage } from "@/lib/data/invitation-content";
import type { LibraryElement } from "@/lib/data/element-library";
import type { EditorToolId, PropertiesTab } from "./editor-types";
import {
  SelectedCardStyles,
  SelectedDividerStyles,
  SelectedImageStyles,
  SelectedShapeStyles,
  SelectedTextStyles,
  ToolTextIdle,
} from "./panels/SelectedStyles";
import { PositionPanel } from "./panels/PositionPanel";
import { EmptyHint } from "./panels/shared";
import {
  ToolBackgroundPanel,
  ToolElementsPanel,
  ToolImagesPanel,
  ToolPlaceholder,
  ToolUploadsPanel,
} from "./panels/ToolPanels";

interface EditorPropertiesPanelProps {
  activeTool: EditorToolId;
  selected: CanvasElement | null;
  canvasSelected: boolean;
  elements: CanvasElement[];
  pages: InvitationPage[];
  activePage: InvitationPage;
  defaultElementColor: string;
  onDefaultElementColorChange: (color: string) => void;
  onChangeStyle: (patch: Partial<ElementStyle>) => void;
  onChangeContent: (content: string) => void;
  onChangeBackground: (color: string) => void;
  onChangePattern: (
    pattern: NonNullable<InvitationPage["backgroundPattern"]>,
  ) => void;
  onChangeBorder: (border: InvitationPage["border"]) => void;
  onAddLibraryElement: (item: LibraryElement) => void;
  onAddImageSrc: (src: string, frame?: ImageFrame) => void;
  onPickImageFrame: (frame: ImageFrame) => void;
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

function ToolView(props: EditorPropertiesPanelProps) {
  switch (props.activeTool) {
    case "elements":
      return (
        <ToolElementsPanel
          defaultColor={props.defaultElementColor}
          onDefaultColorChange={props.onDefaultElementColorChange}
          onAddLibraryElement={props.onAddLibraryElement}
        />
      );
    case "text":
      return <ToolTextIdle />;
    case "images":
      return (
        <ToolImagesPanel
          onAddImageSrc={props.onAddImageSrc}
          onPickFrame={props.onPickImageFrame}
        />
      );
    case "uploads":
      return (
        <ToolUploadsPanel onAddImageSrc={(src) => props.onAddImageSrc(src)} />
      );
    case "background":
      return (
        <ToolBackgroundPanel
          page={props.activePage}
          onChangeBackground={props.onChangeBackground}
          onChangePattern={props.onChangePattern}
          onChangeBorder={props.onChangeBorder}
        />
      );
    case "layout":
      return <ToolPlaceholder title="Layout" />;
    case "templates":
      return <ToolPlaceholder title="Templates" />;
    case "qr":
      return <ToolPlaceholder title="QR Code" />;
    case "brand":
      return <ToolPlaceholder title="Brand Kit" />;
    default:
      return <ToolPlaceholder title="Editor" />;
  }
}

function SelectedContent({
  selected,
  onChangeContent,
}: {
  selected: CanvasElement;
  onChangeContent: (content: string) => void;
}) {
  if (selected.type === "text") {
    return (
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-grey">
          Text
        </span>
        <textarea
          value={selected.content}
          onChange={(e) => onChangeContent(e.target.value)}
          className="min-h-[140px] w-full resize-y rounded-xl border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-signature/40 focus:ring-2 focus:ring-signature/20"
        />
      </label>
    );
  }
  if (selected.type === "divider") {
    return (
      <SelectedDividerStyles
        selected={selected}
        onChangeStyle={() => undefined}
        onChangeContent={onChangeContent}
      />
    );
  }
  return (
    <EmptyHint>
      This {selected.type} doesn&apos;t have editable content. Use Style or
      Position instead.
    </EmptyHint>
  );
}

function SelectedStyleBody(props: EditorPropertiesPanelProps) {
  const { selected } = props;
  if (!selected) return null;
  if (selected.type === "text") {
    return (
      <SelectedTextStyles
        selected={selected}
        onChangeStyle={props.onChangeStyle}
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
  return (
    <SelectedDividerStyles
      selected={selected}
      onChangeStyle={props.onChangeStyle}
      onChangeContent={props.onChangeContent}
    />
  );
}

/**
 * Right panel: Style / Position / Content tabs always visible.
 * Selection drives Style/Position/Content bodies; otherwise Style shows the active tool.
 */
export function EditorPropertiesPanel(props: EditorPropertiesPanelProps) {
  const { selected, canvasSelected, elements } = props;
  const [tab, setTab] = useState<PropertiesTab>("style");

  useEffect(() => {
    // Keep Style as the default when switching tools or selection
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
    { id: "content", label: "Content" },
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
  } else if (tab === "content") {
    body = selected ? (
      <SelectedContent
        selected={selected}
        onChangeContent={props.onChangeContent}
      />
    ) : (
      <EmptyHint>Select an element to edit its content.</EmptyHint>
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
          onChangeBorder={props.onChangeBorder}
        />
      ) : (
        <SelectedCardStyles
          backgroundColor={props.activePage.backgroundColor}
          onChangeBackground={props.onChangeBackground}
        />
      );
  } else {
    body = <ToolView {...props} />;
  }

  return (
    <aside className="flex w-80 shrink-0 flex-col border-l border-black/5 bg-white">
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
