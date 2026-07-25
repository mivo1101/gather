"use client";

import {
  BackgroundToolIcon,
  BrandToolIcon,
  ElementsToolIcon,
  HelpIcon,
  ImagesToolIcon,
  InteractiveToolIcon,
  LayoutToolIcon,
  QrToolIcon,
  TemplatesToolIcon,
  TextToolIcon,
  UploadsToolIcon,
} from "./editor-icons";
import { EDITOR_TOOLS, type EditorToolId } from "./editor-types";

const toolIcons: Record<
  EditorToolId,
  (props: { className?: string }) => React.ReactNode
> = {
  templates: TemplatesToolIcon,
  layout: LayoutToolIcon,
  elements: ElementsToolIcon,
  text: TextToolIcon,
  images: ImagesToolIcon,
  uploads: UploadsToolIcon,
  interactive: InteractiveToolIcon,
  background: BackgroundToolIcon,
  qr: QrToolIcon,
  brand: BrandToolIcon,
};

interface EditorToolNavProps {
  activeTool: EditorToolId;
  onToolChange: (tool: EditorToolId) => void;
  onHelp?: () => void;
}

export function EditorToolNav({
  activeTool,
  onToolChange,
  onHelp,
}: EditorToolNavProps) {
  return (
    <nav
      className="flex w-[72px] shrink-0 flex-col overflow-hidden rounded-2xl border border-black/[0.04] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)]"
      aria-label="Editor tools"
    >
      <ul className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-1.5 py-3">
        {EDITOR_TOOLS.map((tool) => {
          const Icon = toolIcons[tool.id];
          const active = activeTool === tool.id;
          return (
            <li key={tool.id}>
              <button
                type="button"
                onClick={() => onToolChange(tool.id)}
                className={`flex w-full flex-col items-center gap-1 rounded-xl px-1 py-2 transition-colors ${
                  active
                    ? "bg-signature/10 text-signature"
                    : "text-grey hover:bg-soft-grey hover:text-black"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[9px] font-semibold leading-tight">
                  {tool.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="border-t border-black/5 p-2">
        <button
          type="button"
          onClick={onHelp}
          className="flex w-full flex-col items-center gap-1 rounded-xl px-1 py-2 text-grey transition-colors hover:bg-soft-grey hover:text-black"
          aria-label="Help"
        >
          <HelpIcon />
          <span className="text-[9px] font-semibold">Help</span>
        </button>
      </div>
    </nav>
  );
}
