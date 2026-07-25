"use client";

import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { saveInvitationAction } from "@/lib/actions/invitations";
import {
  createImageElement,
  createTextElement,
  createWidgetElement,
  type CanvasElement,
  type ElementStyle,
  type ImageFrame,
  type WidgetConfig,
  type WidgetKind,
} from "@/lib/data/canvas-elements";
import {
  createElementFromLibrary,
  isPatternGraphicSrc,
  type LibraryElement,
} from "@/lib/data/element-library";
import {
  createBlankPage,
  type InvitationContent,
  type InvitationPage,
} from "@/lib/data/invitation-content";
import {
  contentFromTemplate,
  type InvitationTemplate,
} from "@/lib/data/invitation-templates";
import type { Invitation } from "@/lib/data/types";
import { collectDocumentColors } from "@/lib/color-utils";
import { invitationEditPath } from "@/lib/invitation-paths";
import { shortcutLabel } from "@/lib/shortcut-label";
import {
  cardAspectRatio,
  photoElementSize,
  isSquareFrame,
  squareElementSize,
} from "./CanvasImageContent";
import { ConfirmDialog } from "./ConfirmDialog";
import { EditorCanvas } from "./EditorCanvas";
import { EditorLeftPanel } from "./EditorLeftPanel";
import { EditorPageStrip } from "./EditorPageStrip";
import { EditorPreviewModal } from "./EditorPreviewModal";
import { EditorPropertiesPanel } from "./EditorPropertiesPanel";
import { EditorToolbar } from "./EditorToolbar";
import { EditorToolNav } from "./EditorToolNav";
import { DocumentColorsProvider } from "./panels/shared";
import { ChevronRightIcon } from "./editor-icons";
import type {
  EditorToolId,
  InvitationShape,
  PreviewDevice,
  CustomCanvasSize,
} from "./editor-types";
import { CANVAS_SELECTION_ID, DEFAULT_CUSTOM_SIZE } from "./editor-types";
import { useHistory } from "./useHistory";
import { saveElementRecent } from "./ElementsBrowser";

interface InvitationEditorProps {
  invitation: Invitation;
}

type EditorSnapshot = {
  title: string;
  pages: InvitationPage[];
  activePageId: string;
  shape: InvitationShape;
  customSize: CustomCanvasSize;
};

function clonePages(pages: InvitationPage[]): InvitationPage[] {
  return pages.map((page) => ({
    ...page,
    kind: page.kind || "design",
    backgroundPattern: page.backgroundPattern || "none",
    border: page.border ? { ...page.border } : null,
    location: page.location ? { ...page.location } : null,
    rsvpConfig: page.rsvpConfig
      ? {
          ...page.rsvpConfig,
          theme: { ...page.rsvpConfig.theme },
          questions: page.rsvpConfig.questions.map((q) => ({
            ...q,
            options: q.options?.map((o) => ({ ...o })),
          })),
        }
      : null,
    elements: page.elements.map((el) => ({
      ...el,
      href: el.href ?? null,
      style: { ...el.style, effects: { ...el.style.effects } },
      widget: el.widget
        ? {
            ...el.widget,
            ...("options" in el.widget && el.widget.options
              ? {
                  options: el.widget.options.map((o) => ({ ...o })),
                }
              : {}),
          }
        : null,
    })),
  }));
}

function activeElements(pages: InvitationPage[], activePageId: string) {
  return pages.find((page) => page.id === activePageId)?.elements ?? [];
}

function withUpdatedPage(
  pages: InvitationPage[],
  activePageId: string,
  elements: CanvasElement[],
): InvitationPage[] {
  return pages.map((page) =>
    page.id === activePageId ? { ...page, elements } : page,
  );
}

function buildContent(
  base: InvitationContent,
  pages: InvitationPage[],
  activePageId: string,
): InvitationContent {
  const elements = activeElements(pages, activePageId);
  return {
    ...base,
    pages: clonePages(pages),
    activePageId,
    elements,
  };
}

function serializeSavePayload(
  title: string,
  pages: InvitationPage[],
  activePageId: string,
) {
  return JSON.stringify({
    title: title.trim() || "Untitled Invitation",
    activePageId,
    pages: clonePages(pages),
  });
}

/** Fully interactive Gather invitation editor */
export function InvitationEditor({ invitation }: InvitationEditorProps) {
  const router = useRouter();
  const initialSnapshot = useMemo<EditorSnapshot>(
    () => ({
      title:
        invitation.title === "Untitled invitation"
          ? "Untitled Invitation"
          : invitation.title,
      pages: clonePages(invitation.content.pages),
      activePageId: invitation.content.activePageId,
      shape: "portrait",
      customSize: DEFAULT_CUSTOM_SIZE,
    }),
    [invitation],
  );

  const history = useHistory<EditorSnapshot>(initialSnapshot);
  const { title, pages, activePageId, shape, customSize } = history.present;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [contentMeta, setContentMeta] = useState(invitation.content);
  const [status, setStatus] = useState(invitation.status);
  const [savedAt, setSavedAt] = useState(invitation.updatedAt);
  const [activeTool, setActiveTool] = useState<EditorToolId>("layout");
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>("desktop");
  const [showGrid, setShowGrid] = useState(false);
  const [pagesCollapsed, setPagesCollapsed] = useState(false);
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [saveLabel, setSaveLabel] = useState("Save");
  const [toast, setToast] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [defaultElementColor, setDefaultElementColor] = useState("#1F2D22");
  const [pendingImageFrame, setPendingImageFrame] =
    useState<ImageFrame>("none");
  const [pendingTemplate, setPendingTemplate] =
    useState<InvitationTemplate | null>(null);

  const savingRef = useRef(false);
  const pendingAutosaveRef = useRef(false);
  const lastSavedPayloadRef = useRef(
    serializeSavePayload(
      initialSnapshot.title,
      initialSnapshot.pages,
      initialSnapshot.activePageId,
    ),
  );
  const autosaveTimerRef = useRef<number | null>(null);

  const elements = activeElements(pages, activePageId);
  const activePage = pages.find((page) => page.id === activePageId) ?? {
    id: activePageId,
    name: "Page",
    kind: "design" as const,
    elements,
    backgroundColor: "#fff8f4",
    backgroundPattern: "none" as const,
    border: null,
    location: null,
  };
  const backgroundColor = activePage.backgroundColor ?? "#fff8f4";
  const documentColors = useMemo(
    () => collectDocumentColors(pages),
    [pages],
  );
  const canvasSelected = selectedId === CANVAS_SELECTION_ID;
  const selected = canvasSelected
    ? null
    : (elements.find((el) => el.id === selectedId) ?? null);

  useEffect(() => {
    history.reset({
      title:
        invitation.title === "Untitled invitation"
          ? "Untitled Invitation"
          : invitation.title,
      pages: clonePages(invitation.content.pages),
      activePageId: invitation.content.activePageId,
      shape: "portrait",
      customSize: DEFAULT_CUSTOM_SIZE,
    });
    setContentMeta(invitation.content);
    setStatus(invitation.status);
    setSavedAt(invitation.updatedAt);
    lastSavedPayloadRef.current = serializeSavePayload(
      invitation.title === "Untitled invitation"
        ? "Untitled Invitation"
        : invitation.title,
      invitation.content.pages,
      invitation.content.activePageId,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invitation.id, invitation.updatedAt]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  };

  const commit = useCallback(
    (recipe: (current: EditorSnapshot) => EditorSnapshot) => {
      history.replace(recipe(history.present));
    },
    [history],
  );

  const snapshotBeforeChange = useCallback(() => {
    history.replace(history.present);
  }, [history]);

  const setElementsOnActivePage = useCallback(
    (
      updater: (prev: CanvasElement[]) => CanvasElement[],
      options?: { record?: boolean },
    ) => {
      const apply = (current: EditorSnapshot): EditorSnapshot => {
        const currentElements = activeElements(
          current.pages,
          current.activePageId,
        );
        const nextElements = updater(currentElements);
        return {
          ...current,
          pages: withUpdatedPage(
            current.pages,
            current.activePageId,
            nextElements,
          ),
        };
      };

      if (options?.record === false) {
        history.setPresentSilent(apply(history.present));
      } else {
        history.replace(apply(history.present));
      }
    },
    [history],
  );

  const updateElement = useCallback(
    (id: string, patch: Partial<CanvasElement>, record = false) => {
      setElementsOnActivePage(
        (prev) => prev.map((el) => (el.id === id ? { ...el, ...patch } : el)),
        { record },
      );
    },
    [setElementsOnActivePage],
  );

  const duplicateElement = useCallback(
    (id: string) => {
      setElementsOnActivePage((prev) => {
        const source = prev.find((el) => el.id === id);
        if (!source) return prev;
        const copy: CanvasElement = {
          ...source,
          id: `${source.type}_${Math.random().toString(36).slice(2, 9)}`,
          x: source.x + 3,
          y: source.y + 3,
          style: { ...source.style },
        };
        setSelectedId(copy.id);
        return [...prev, copy];
      });
    },
    [setElementsOnActivePage],
  );

  const deleteElement = useCallback(
    (id: string) => {
      setElementsOnActivePage((prev) => prev.filter((el) => el.id !== id));
      setSelectedId((current) => (current === id ? null : current));
      setEditingId((current) => (current === id ? null : current));
    },
    [setElementsOnActivePage],
  );

  const addElement = useCallback(
    (el: CanvasElement, edit = false) => {
      setElementsOnActivePage((prev) => [...prev, el]);
      setSelectedId(el.id);
      setEditingId(edit ? el.id : null);
    },
    [setElementsOnActivePage],
  );

  const handleUndo = useCallback(() => {
    const prev = history.undo();
    setSelectedId(null);
    setEditingId(null);
    return prev;
  }, [history]);

  const handleRedo = useCallback(() => {
    const next = history.redo();
    setSelectedId(null);
    setEditingId(null);
    return next;
  }, [history]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      const mod = event.metaKey || event.ctrlKey;
      if (mod && event.key.toLowerCase() === "z" && !event.shiftKey) {
        if (typing && editingId) return;
        event.preventDefault();
        handleUndo();
      }
      if (
        mod &&
        (event.key.toLowerCase() === "y" ||
          (event.key.toLowerCase() === "z" && event.shiftKey))
      ) {
        if (typing && editingId) return;
        event.preventDefault();
        handleRedo();
      }
      if (mod && event.key.toLowerCase() === "s") {
        event.preventDefault();
        document.getElementById("editor-save-trigger")?.click();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [editingId, handleRedo, handleUndo]);

  const persist = useCallback(
    (options?: {
      nextStatus?: Invitation["status"];
      quiet?: boolean;
      force?: boolean;
    }) => {
      const nextStatus = options?.nextStatus;
      const quiet = options?.quiet ?? false;
      const payload = serializeSavePayload(title, pages, activePageId);

      if (
        !options?.force &&
        !nextStatus &&
        payload === lastSavedPayloadRef.current
      ) {
        return;
      }

      if (savingRef.current) {
        if (quiet) pendingAutosaveRef.current = true;
        return;
      }

      savingRef.current = true;
      setSaveLabel("Saving…");

      startTransition(async () => {
        const content = buildContent(contentMeta, pages, activePageId);
        const result = await saveInvitationAction({
          invitationId: invitation.id,
          title: title.trim() || "Untitled Invitation",
          eventDate: invitation.eventDate,
          location: invitation.location,
          content,
          status: nextStatus,
        });

        savingRef.current = false;

        if ("error" in result) {
          setSaveLabel("Retry");
          if (!quiet) showToast(result.error);
          else showToast("Autosave failed — click Save to retry");
          return;
        }

        lastSavedPayloadRef.current = serializeSavePayload(
          result.invitation.title,
          result.invitation.content.pages,
          result.invitation.content.activePageId,
        );
        setContentMeta(result.invitation.content);
        setStatus(result.invitation.status);
        setSavedAt(result.invitation.updatedAt);
        setSaveLabel("Saved");

        if (!quiet) {
          showToast(
            nextStatus === "published"
              ? "Invitation published"
              : nextStatus === "draft"
                ? "Reverted to draft"
                : "Changes saved",
          );
        }

        router.replace(invitationEditPath(result.invitation), { scroll: false });
        window.setTimeout(() => setSaveLabel("Save"), 1800);

        if (pendingAutosaveRef.current) {
          pendingAutosaveRef.current = false;
          window.setTimeout(() => {
            persist({ quiet: true });
          }, 400);
        }
      });
    },
    // showToast is stable enough via closure; include deps that affect save body
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      activePageId,
      contentMeta,
      invitation.eventDate,
      invitation.id,
      invitation.location,
      pages,
      router,
      title,
    ],
  );

  // Debounced autosave after edits settle
  useEffect(() => {
    const payload = serializeSavePayload(title, pages, activePageId);
    if (payload === lastSavedPayloadRef.current) return;

    if (autosaveTimerRef.current) {
      window.clearTimeout(autosaveTimerRef.current);
    }
    autosaveTimerRef.current = window.setTimeout(() => {
      persist({ quiet: true });
    }, 1500);

    return () => {
      if (autosaveTimerRef.current) {
        window.clearTimeout(autosaveTimerRef.current);
      }
    };
  }, [activePageId, pages, persist, title]);

  const onChangeStyle = (patch: Partial<ElementStyle>) => {
    if (!selectedId || canvasSelected || !selected) return;
    snapshotBeforeChange();
    const nextStyle = {
      ...selected.style,
      ...patch,
      effects: patch.effects
        ? { ...selected.style.effects, ...patch.effects }
        : selected.style.effects,
    };
    const sizePatch =
      selected.type === "image" &&
      patch.frame !== undefined &&
      isSquareFrame(patch.frame)
        ? squareElementSize(
            selected.width,
            selected.height || selected.width,
            cardAspectRatio(shape, customSize),
          )
        : null;
    updateElement(
      selectedId,
      {
        style: nextStyle,
        ...(sizePatch ?? {}),
      },
      false,
    );
  };

  const onChangeBackground = (color: string) => {
    snapshotBeforeChange();
    history.setPresentSilent({
      ...history.present,
      pages: history.present.pages.map((page) =>
        page.id === history.present.activePageId
          ? { ...page, backgroundColor: color }
          : page,
      ),
    });
  };

  const onChangePattern = (
    pattern: NonNullable<InvitationPage["backgroundPattern"]>,
  ) => {
    snapshotBeforeChange();
    history.setPresentSilent({
      ...history.present,
      pages: history.present.pages.map((page) =>
        page.id === history.present.activePageId
          ? { ...page, backgroundPattern: pattern }
          : page,
      ),
    });
  };

  const onChangeBorder = (border: InvitationPage["border"]) => {
    snapshotBeforeChange();
    history.setPresentSilent({
      ...history.present,
      pages: history.present.pages.map((page) =>
        page.id === history.present.activePageId
          ? { ...page, border }
          : page,
      ),
    });
  };

  const addTextPreset = (preset?: "heading" | "subheading" | "body") => {
    if (preset === "heading") {
      addElement(
        createTextElement({
          content: "Heading",
          style: {
            fontFamily: "playfair",
            fontSize: 36,
            fontWeight: "bold",
            color: defaultElementColor,
            textAlign: "center",
            lineHeight: 1.15,
            letterSpacing: 0,
            bold: true,
            italic: false,
            underline: false,
            strike: false,
          },
        }),
        true,
      );
      return;
    }
    if (preset === "subheading") {
      addElement(
        createTextElement({
          content: "Subheading",
          style: {
            fontFamily: "urbanist",
            fontSize: 20,
            fontWeight: "medium",
            color: defaultElementColor,
            textAlign: "center",
            lineHeight: 1.3,
            letterSpacing: 1,
            bold: false,
            italic: false,
            underline: false,
            strike: false,
          },
        }),
        true,
      );
      return;
    }
    if (preset === "body") {
      addElement(
        createTextElement({
          content: "Body text",
          style: {
            fontFamily: "urbanist",
            fontSize: 14,
            fontWeight: "regular",
            color: defaultElementColor,
            textAlign: "center",
            lineHeight: 1.5,
            letterSpacing: 0,
            bold: false,
            italic: false,
            underline: false,
            strike: false,
          },
        }),
        true,
      );
      return;
    }
    addElement(
      createTextElement({
        style: {
          fontFamily: "playfair",
          fontSize: 20,
          fontWeight: "regular",
          color: defaultElementColor,
          textAlign: "center",
          lineHeight: 1.2,
          letterSpacing: 0,
          bold: false,
          italic: false,
          underline: false,
          strike: false,
        },
      }),
      true,
    );
  };

  const addImageWithOptions = (src: string, frame?: ImageFrame) => {
    const nextFrame = frame ?? pendingImageFrame;
    const base = createImageElement(
      src,
      isPatternGraphicSrc(src) ? defaultElementColor : "#000000",
    );
    const withFrame = {
      ...base,
      style: {
        ...base.style,
        frame: nextFrame,
      },
    };

    if (isPatternGraphicSrc(src)) {
      addElement(withFrame);
      return;
    }

    const probe = new window.Image();
    probe.onload = () => {
      const aspect = cardAspectRatio(shape, customSize);
      let size = photoElementSize(
        probe.naturalWidth,
        probe.naturalHeight,
        aspect,
      );
      if (isSquareFrame(nextFrame)) {
        size = squareElementSize(size.width, size.height, aspect);
      }
      addElement({ ...withFrame, ...size });
    };
    probe.onerror = () => {
      addElement({ ...withFrame, width: 52, height: 28 });
    };
    probe.src = src;
  };

  const reorderSelected = (
    recipe: (list: CanvasElement[], index: number) => CanvasElement[],
  ) => {
    if (!selectedId || canvasSelected) return;
    snapshotBeforeChange();
    setElementsOnActivePage((prev) => {
      const index = prev.findIndex((el) => el.id === selectedId);
      if (index < 0) return prev;
      return recipe(prev, index);
    }, { record: false });
  };

  const onBringForward = () =>
    reorderSelected((prev, index) => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });

  const onSendBackward = () =>
    reorderSelected((prev, index) => {
      if (index <= 0) return prev;
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });

  const onBringToFront = () =>
    reorderSelected((prev, index) => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.push(item);
      return next;
    });

  const onSendToBack = () =>
    reorderSelected((prev, index) => {
      if (index <= 0) return prev;
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.unshift(item);
      return next;
    });

  const onAlignToPage = (
    edge: "top" | "middle" | "bottom" | "left" | "center" | "right",
  ) => {
    if (!selected) return;
    snapshotBeforeChange();
    const height = selected.height ?? 12;
    const width = selected.width;
    const patch: Partial<CanvasElement> = {};
    if (edge === "left") patch.x = 0;
    if (edge === "center") patch.x = Math.max(0, (100 - width) / 2);
    if (edge === "right") patch.x = Math.max(0, 100 - width);
    if (edge === "top") patch.y = 0;
    if (edge === "middle") patch.y = Math.max(0, (100 - height) / 2);
    if (edge === "bottom") patch.y = Math.max(0, 100 - height);
    updateElement(selected.id, patch, false);
  };

  const onChangeTransform = (patch: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    rotation?: number;
  }) => {
    if (!selected) return;
    snapshotBeforeChange();
    updateElement(selected.id, patch, false);
  };

  const onAddPage = () => {
    commit((current) => {
      const page = createBlankPage(current.pages.length + 1);
      return {
        ...current,
        pages: [...current.pages, page],
        activePageId: page.id,
      };
    });
    setSelectedId(null);
    setEditingId(null);
    showToast("Page added");
  };

  const applyTemplate = (template: InvitationTemplate) => {
    const content = contentFromTemplate(template);
    commit((current) => ({
      ...current,
      pages: clonePages(content.pages),
      activePageId: content.activePageId,
    }));
    setSelectedId(null);
    setEditingId(null);
    setPendingTemplate(null);
    showToast(`Applied “${template.title}”`);
  };

  const onApplyTemplate = (template: InvitationTemplate) => {
    const hasContent = pages.some((page) => page.elements.length > 0);
    if (hasContent) {
      setPendingTemplate(template);
      return;
    }
    applyTemplate(template);
  };

  const onAddWidget = (kind: WidgetKind) => {
    const el = createWidgetElement(kind, undefined, backgroundColor);
    if (kind !== "map") {
      el.style = { ...el.style, color: defaultElementColor };
    }
    addElement(el);
    setActiveTool("interactive");
    showToast(
      kind === "map"
        ? "Map added — drag to place"
        : "Interactive block added — drag to place",
    );
  };

  const onChangeWidget = (widget: WidgetConfig) => {
    if (!selectedId || canvasSelected || !selected || selected.type !== "widget") {
      return;
    }
    snapshotBeforeChange();
    updateElement(selectedId, { widget, content: widget.kind }, false);
  };

  return (
    <DocumentColorsProvider colors={documentColors} resetKey={invitation.id}>
    <div className="flex h-dvh flex-col overflow-hidden bg-white">
      <EditorToolbar
        title={title}
        onTitleChange={(value) =>
          history.setPresentSilent({ ...history.present, title: value })
        }
        status={status}
        savedAt={savedAt}
        previewDevice={previewDevice}
        previewOpen={previewOpen}
        onOpenDevicePreview={(device) => {
          setPreviewDevice(device);
          setPreviewOpen(true);
        }}
        canUndo={history.canUndo}
        canRedo={history.canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onSave={() => persist({ force: true })}
        onPublish={(mode) => persist({ nextStatus: mode, force: true })}
        isSaving={isPending}
        saveLabel={saveLabel}
      />
      {/* Hidden save trigger for ⌘S */}
      <button
        id="editor-save-trigger"
        type="button"
        className="sr-only"
        onClick={() => persist({ force: true })}
      >
        Save
      </button>

      <div className="flex min-h-0 flex-1 gap-3 bg-soft-grey p-3">
        <EditorToolNav
          activeTool={activeTool}
          onHelp={() =>
            showToast("⌘Z undo · ⌘⇧Z redo · ⌘S save · ⌘D duplicate · Del delete")
          }
          onToolChange={(tool) => {
            setActiveTool(tool);
            setEditingId(null);
            setLeftPanelCollapsed(false);
            // Left = add features; right = style selection.
            // Background selects the card; other tools keep the current selection.
            if (tool === "background") {
              setSelectedId(CANVAS_SELECTION_ID);
            } else if (selectedId === CANVAS_SELECTION_ID) {
              setSelectedId(null);
            }
          }}
        />
        {leftPanelCollapsed ? (
          <button
            type="button"
            onClick={() => setLeftPanelCollapsed(false)}
            className="flex w-10 shrink-0 flex-col items-center justify-center rounded-2xl border border-black/[0.04] bg-white text-grey shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] hover:text-black"
            aria-label="Show sidebar"
            title="Show sidebar"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg">
              <ChevronRightIcon />
            </span>
          </button>
        ) : (
          <EditorLeftPanel
            activeTool={activeTool}
            selectedShape={shape}
            customSize={customSize}
            pages={pages}
            defaultElementColor={defaultElementColor}
            onDefaultElementColorChange={setDefaultElementColor}
            onShapeChange={(next) =>
              commit((current) => ({ ...current, shape: next }))
            }
            onCustomSizeChange={(next) =>
              commit((current) => ({ ...current, customSize: next }))
            }
            onAddText={addTextPreset}
            onAddLibraryElement={(item: LibraryElement) => {
              saveElementRecent(item.id);
              const el = createElementFromLibrary(item);
              addElement({
                ...el,
                style: { ...el.style, color: defaultElementColor },
              });
            }}
            onAddImageSrc={(src, frame) => addImageWithOptions(src, frame)}
            onPickImageFrame={setPendingImageFrame}
            onAddWidget={onAddWidget}
            onApplyTemplate={onApplyTemplate}
            onCollapse={() => setLeftPanelCollapsed(true)}
          />
        )}

        <div className="relative flex min-w-0 flex-1 flex-col">
          <EditorCanvas
            shape={shape}
            customSize={customSize}
            elements={elements}
            selectedId={canvasSelected ? null : selectedId}
            editingId={editingId}
            showGrid={showGrid}
            zoom={zoom}
            backgroundColor={backgroundColor}
            backgroundPattern={activePage.backgroundPattern || "none"}
            border={activePage.border ?? null}
            canvasSelected={canvasSelected}
            onToggleGrid={() => setShowGrid((v) => !v)}
            onSelect={setSelectedId}
            onSelectCanvas={() => setSelectedId(CANVAS_SELECTION_ID)}
            onClearSelection={() => setSelectedId(null)}
            onStartEdit={(id) => {
              snapshotBeforeChange();
              setEditingId(id);
            }}
            onStopEdit={() => setEditingId(null)}
            onChangeElement={(id, patch) => updateElement(id, patch, false)}
            onDuplicate={duplicateElement}
            onDelete={deleteElement}
            onToggleLock={(id) => {
              const el = elements.find((item) => item.id === id);
              if (!el) return;
              snapshotBeforeChange();
              updateElement(id, { locked: !el.locked }, false);
            }}
            onRotate={(id) => {
              const el = elements.find((item) => item.id === id);
              if (!el) return;
              snapshotBeforeChange();
              updateElement(id, { rotation: (el.rotation + 15) % 360 }, false);
            }}
            onBeforeChange={snapshotBeforeChange}
          />
          <EditorPageStrip
            collapsed={pagesCollapsed}
            onToggleCollapse={() => setPagesCollapsed((v) => !v)}
            zoom={zoom}
            onZoomChange={setZoom}
            onFullscreenPreview={() => {
              setPreviewDevice("fullscreen");
              setPreviewOpen(true);
            }}
            pages={pages}
            activePageId={activePageId}
            onSelectPage={(pageId) => {
              commit((current) => ({ ...current, activePageId: pageId }));
              setSelectedId(null);
              setEditingId(null);
            }}
            onAddPage={onAddPage}
            onDeletePage={(pageId) => {
              if (pages.length <= 1) {
                showToast("Keep at least one page");
                return;
              }
              commit((current) => {
                const nextPages = current.pages.filter(
                  (page) => page.id !== pageId,
                );
                const nextActive =
                  current.activePageId === pageId
                    ? nextPages[0].id
                    : current.activePageId;
                return {
                  ...current,
                  pages: nextPages,
                  activePageId: nextActive,
                };
              });
              setSelectedId(null);
              showToast("Page deleted");
            }}
          />
        </div>

        <EditorPropertiesPanel
          activeTool={activeTool}
          selected={selected}
          canvasSelected={canvasSelected}
          elements={elements}
          activePage={activePage}
          onChangeStyle={onChangeStyle}
          onChangeBackground={onChangeBackground}
          onChangePattern={onChangePattern}
          onChangeBorder={onChangeBorder}
          onChangeWidget={onChangeWidget}
          onBringForward={onBringForward}
          onSendBackward={onSendBackward}
          onBringToFront={onBringToFront}
          onSendToBack={onSendToBack}
          onAlignToPage={onAlignToPage}
          onChangeTransform={onChangeTransform}
          onChangeContent={(value) => {
            if (!selectedId || canvasSelected) return;
            updateElement(selectedId, { content: value }, false);
          }}
          onChangeHref={(href) => {
            if (!selectedId || canvasSelected) return;
            snapshotBeforeChange();
            updateElement(selectedId, { href }, false);
          }}
        />
      </div>

      <EditorPreviewModal
        open={previewOpen}
        device={previewDevice}
        onDeviceChange={setPreviewDevice}
        pages={pages}
        activePageId={activePageId}
        title={title}
        shape={shape}
        customSize={customSize}
        rsvp={contentMeta.rsvp}
        onClose={() => setPreviewOpen(false)}
      />

      <ConfirmDialog
        open={pendingTemplate !== null}
        title="Replace design?"
        description={
          pendingTemplate
            ? `Replace your current design with “${pendingTemplate.title}”? You can undo with ${shortcutLabel("Z")}.`
            : ""
        }
        confirmLabel="Replace"
        onConfirm={() => {
          if (pendingTemplate) applyTemplate(pendingTemplate);
        }}
        onCancel={() => setPendingTemplate(null)}
      />

      {toast && (
        <div className="pointer-events-none fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-full bg-black px-4 py-2 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
    </DocumentColorsProvider>
  );
}
