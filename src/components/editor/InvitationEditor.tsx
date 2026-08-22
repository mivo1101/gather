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
  type ShapeKind,
  type WidgetConfig,
  type WidgetKind,
} from "@/lib/data/canvas-elements";
import {
  createElementFromLibrary,
  isDecorativeGraphicSrc,
  isLibraryGraphicSrc,
  isPatternGraphicSrc,
  type LibraryElement,
} from "@/lib/data/element-library";
import {
  createBlankPage,
  enforceInvitationPageRoles,
  type InvitationContent,
  type InvitationPage,
} from "@/lib/data/invitation-content";
import {
  contentFromTemplate,
  type InvitationTemplate,
} from "@/lib/data/invitation-templates";
import type { Invitation } from "@/lib/data/types";
import { collectDocumentColors } from "@/lib/color-utils";
import {
  invitationContinuePath,
  invitationEditPath,
} from "@/lib/invitation-paths";
import { shortcutLabel } from "@/lib/shortcut-label";
import {
  photoElementSize,
  isSquareFrame,
  squareElementSize,
} from "./CanvasImageContent";
import { cardAspectRatio } from "./canvas-metrics";
import { ConfirmDialog } from "./ConfirmDialog";
import {
  CompletedEventNotice,
  type CompletedEventInfo,
} from "./CompletedEventNotice";
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
import { EMPTY_IMAGE_FRAME_SRC } from "./image-frames";
import { designCanvasSize } from "./canvas-metrics";
import {
  clientPointToCanvasPercent,
  type EditorInsertPayload,
} from "@/lib/editor-insert-dnd";

type CanvasPoint = { x: number; y: number };
type DropAnchor = {
  canvas: HTMLElement;
  clientX: number;
  clientY: number;
};

interface InvitationEditorProps {
  invitation: Invitation;
  /** Open the custom size modal once on mount (e.g. from Home → Custom). */
  openCustomSize?: boolean;
  /** Set when the linked event has finished, making this design view-only. */
  completedEvent?: CompletedEventInfo | null;
}

type EditorSnapshot = {
  title: string;
  pages: InvitationPage[];
  activePageId: string;
  shape: InvitationShape;
  customSize: CustomCanvasSize;
};

type ElementClipboard = {
  elements: CanvasElement[];
  sourcePageId: string;
};

function clonePages(pages: InvitationPage[]): InvitationPage[] {
  return pages.map((page, index) => ({
    ...page,
    role:
      index === 0
        ? "cover"
        : page.role === "cover"
          ? "details"
          : page.role || "details",
    kind: page.kind || "design",
    backgroundPattern: page.backgroundPattern || "none",
    backgroundTexture: page.backgroundTexture || "none",
    backgroundTextureOpacity: page.backgroundTextureOpacity ?? 22,
    backgroundTextureTint: page.backgroundTextureTint || "#ffffff",
    backgroundTextureBlend: page.backgroundTextureBlend || "soft-light",
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
  shape: InvitationShape,
  customSize: CustomCanvasSize,
): InvitationContent {
  const elements = activeElements(pages, activePageId);
  return {
    ...base,
    pages: clonePages(pages),
    activePageId,
    elements,
    shape,
    customSize,
  };
}

function serializeSavePayload(
  title: string,
  pages: InvitationPage[],
  activePageId: string,
  shape: InvitationShape,
  customSize: CustomCanvasSize,
) {
  return JSON.stringify({
    title: title.trim() || "Untitled Invitation",
    activePageId,
    pages: clonePages(pages),
    shape,
    customSize,
  });
}

const WIDE_SHAPE_KINDS = new Set<ShapeKind>([
  "rectangle",
  "oval",
  "parallelogram",
  "trapezoid",
  "semicircle",
]);

function sizeNewShapeForCard(
  element: CanvasElement,
  cardAspect: number,
): CanvasElement {
  if (element.type !== "shape") return element;
  const kind = element.content as ShapeKind;
  if (
    kind === "line" ||
    kind === "line_dashed" ||
    kind === "line_dotted" ||
    kind === "arrow" ||
    kind === "arrow_thin"
  ) {
    return element;
  }

  const visualRatio = WIDE_SHAPE_KINDS.has(kind) ? 1.6 : 1;
  const height = Math.min(
    82,
    Math.max(6, Math.round(((element.width * cardAspect) / visualRatio) * 10) / 10),
  );
  return {
    ...element,
    x: Math.round(((100 - element.width) / 2) * 10) / 10,
    y: Math.round(((100 - height) / 2) * 10) / 10,
    height,
  };
}

/** Fully interactive Gather invitation editor */
export function InvitationEditor({
  invitation,
  openCustomSize = false,
  completedEvent = null,
}: InvitationEditorProps) {
  const router = useRouter();
  const initialSnapshot = useMemo<EditorSnapshot>(
    () => ({
      title:
        invitation.title === "Untitled invitation"
          ? "Untitled Invitation"
          : invitation.title,
      pages: clonePages(invitation.content.pages),
      activePageId: invitation.content.activePageId,
      shape: invitation.content.shape ?? "portrait",
      customSize: invitation.content.customSize ?? DEFAULT_CUSTOM_SIZE,
    }),
    [invitation],
  );

  const history = useHistory<EditorSnapshot>(initialSnapshot);
  const { title, pages, activePageId, shape, customSize } = history.present;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
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
  const [isContinuing, setIsContinuing] = useState(false);
  const defaultElementColor = "#1F2D22";
  const [pendingTemplate, setPendingTemplate] =
    useState<InvitationTemplate | null>(null);
  const [customSizeModalOpen, setCustomSizeModalOpen] =
    useState(openCustomSize);

  const savingRef = useRef(false);
  const pendingAutosaveRef = useRef(false);
  const lastSavedPayloadRef = useRef(
    serializeSavePayload(
      initialSnapshot.title,
      initialSnapshot.pages,
      initialSnapshot.activePageId,
      initialSnapshot.shape,
      initialSnapshot.customSize,
    ),
  );
  const autosaveTimerRef = useRef<number | null>(null);
  const latestSnapshotRef = useRef(history.present);
  const contentMetaRef = useRef(contentMeta);
  const elementClipboardRef = useRef<ElementClipboard | null>(null);
  latestSnapshotRef.current = history.present;
  contentMetaRef.current = contentMeta;

  const elements = activeElements(pages, activePageId);
  const activePage = pages.find((page) => page.id === activePageId) ?? {
    id: activePageId,
    name: "Page",
    role: "cover" as const,
    kind: "design" as const,
    elements,
    backgroundColor: "#fff8f4",
    backgroundPattern: "none" as const,
    backgroundTexture: "none" as const,
    backgroundTextureOpacity: 22,
    backgroundTextureTint: "#ffffff",
    backgroundTextureBlend: "soft-light" as const,
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
    if (!selectedId || selectedId === CANVAS_SELECTION_ID) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds((current) =>
      current.includes(selectedId) ? current : [selectedId],
    );
  }, [selectedId]);

  useEffect(() => {
    if (!selected || selectedIds.length > 1) return;
    const matchingTool: EditorToolId =
      selected.type === "text"
        ? "text"
        : selected.type === "image"
          ? isDecorativeGraphicSrc(selected.content)
            ? "elements"
            : "images"
          : selected.type === "widget"
            ? "interactive"
            : "elements";
    setActiveTool(matchingTool);
    setLeftPanelCollapsed(false);
  }, [selected, selectedIds.length]);

  useEffect(() => {
    history.reset({
      title:
        invitation.title === "Untitled invitation"
          ? "Untitled Invitation"
          : invitation.title,
      pages: clonePages(invitation.content.pages),
      activePageId: invitation.content.activePageId,
      shape: invitation.content.shape ?? "portrait",
      customSize: invitation.content.customSize ?? DEFAULT_CUSTOM_SIZE,
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
      invitation.content.shape ?? "portrait",
      invitation.content.customSize ?? DEFAULT_CUSTOM_SIZE,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invitation.id]);

  useEffect(() => {
    if (!openCustomSize) return;
    setCustomSizeModalOpen(true);
    setActiveTool("layout");
    setLeftPanelCollapsed(false);
    router.replace(invitationEditPath(invitation), { scroll: false });
  }, [openCustomSize, invitation, router]);

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

  useEffect(() => {
    if (
      !selected ||
      selected.type !== "image" ||
      !isLibraryGraphicSrc(selected.content) ||
      !selected.height
    ) {
      return;
    }

    const selectedHeight = selected.height;
    const probe = new window.Image();
    probe.onload = () => {
      const cardAspect = cardAspectRatio(shape, customSize);
      const imageAspect = probe.naturalWidth / Math.max(1, probe.naturalHeight);
      let height = selectedHeight;
      let width = (height * imageAspect) / cardAspect;
      if (width > 90) {
        width = 90;
        height = (width * cardAspect) / imageAspect;
      }
      width = Math.max(4, Math.round(width * 10) / 10);
      height = Math.max(4, Math.round(height * 10) / 10);
      if (
        Math.abs(width - selected.width) < 0.5 &&
        Math.abs(height - selectedHeight) < 0.5
      ) {
        return;
      }
      const centreX = selected.x + selected.width / 2;
      const centreY = selected.y + selectedHeight / 2;
      updateElement(
        selected.id,
        {
          x: Math.max(0, Math.min(100 - width, centreX - width / 2)),
          y: Math.max(0, Math.min(100 - height, centreY - height / 2)),
          width,
          height,
        },
        false,
      );
    };
    probe.src = selected.content;
  }, [customSize, selected, shape, updateElement]);

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

  const deleteElements = useCallback(
    (ids: string[]) => {
      if (ids.length === 0) return;
      const removing = new Set(ids);
      setElementsOnActivePage((prev) =>
        prev.filter((el) => !removing.has(el.id)),
      );
      setSelectedId(null);
      setSelectedIds([]);
      setEditingId(null);
    },
    [setElementsOnActivePage],
  );

  const selectedElementsForClipboard = useCallback(() => {
    const ids =
      selectedIds.length > 1
        ? new Set(selectedIds)
        : selectedId && selectedId !== CANVAS_SELECTION_ID
          ? new Set([selectedId])
          : new Set<string>();
    return elements.filter((element) => ids.has(element.id));
  }, [elements, selectedId, selectedIds]);

  const copySelectedElements = useCallback(() => {
    const selectedElements = selectedElementsForClipboard();
    if (selectedElements.length === 0) return false;
    elementClipboardRef.current = {
      elements: structuredClone(selectedElements),
      sourcePageId: activePageId,
    };
    return true;
  }, [activePageId, selectedElementsForClipboard]);

  const cutSelectedElements = useCallback(() => {
    const selectedElements = selectedElementsForClipboard();
    if (selectedElements.length === 0) return false;
    elementClipboardRef.current = {
      elements: structuredClone(selectedElements),
      sourcePageId: activePageId,
    };
    deleteElements(selectedElements.map((element) => element.id));
    return true;
  }, [activePageId, deleteElements, selectedElementsForClipboard]);

  const pasteElements = useCallback(() => {
    const clipboard = elementClipboardRef.current;
    if (!clipboard || clipboard.elements.length === 0) return false;
    const offset = clipboard.sourcePageId === activePageId ? 3 : 0;
    const pasted = clipboard.elements.map((source) => ({
      ...structuredClone(source),
      id: `${source.type}_${Math.random().toString(36).slice(2, 9)}`,
      x: Math.min(95, source.x + offset),
      y: Math.min(95, source.y + offset),
    }));
    elementClipboardRef.current = {
      elements: structuredClone(pasted),
      sourcePageId: activePageId,
    };
    setElementsOnActivePage((current) => [...current, ...pasted]);
    const ids = pasted.map((element) => element.id);
    setSelectedIds(ids);
    setSelectedId(ids[0] ?? null);
    setEditingId(null);
    return true;
  }, [activePageId, setElementsOnActivePage]);

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
      if (typing || !mod) return;
      const key = event.key.toLowerCase();
      if (key === "c" && copySelectedElements()) {
        event.preventDefault();
      }
      if (key === "x" && cutSelectedElements()) {
        event.preventDefault();
      }
      if (key === "v" && pasteElements()) {
        event.preventDefault();
      }
      if (key === "a" && elements.length > 0) {
        event.preventDefault();
        const ids = elements.map((element) => element.id);
        setSelectedIds(ids);
        setSelectedId(ids[0] ?? null);
        setEditingId(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    copySelectedElements,
    cutSelectedElements,
    editingId,
    elements,
    handleRedo,
    handleUndo,
    pasteElements,
  ]);

  const persist = useCallback(
    (options?: {
      nextStatus?: Invitation["status"];
      quiet?: boolean;
      force?: boolean;
    }): Promise<Invitation | null> => {
      const nextStatus = options?.nextStatus;
      const quiet = options?.quiet ?? false;
      const current = latestSnapshotRef.current;
      const payload = serializeSavePayload(
        current.title,
        current.pages,
        current.activePageId,
        current.shape,
        current.customSize,
      );

      if (
        !options?.force &&
        !nextStatus &&
        payload === lastSavedPayloadRef.current
      ) {
        return Promise.resolve(invitation);
      }

      if (savingRef.current) {
        if (quiet) pendingAutosaveRef.current = true;
        return Promise.resolve(null);
      }

      savingRef.current = true;
      setSaveLabel("Saving…");

      return new Promise((resolve) => {
        startTransition(async () => {
          let savedSuccessfully = false;
          try {
            const content = buildContent(
              contentMetaRef.current,
              current.pages,
              current.activePageId,
              current.shape,
              current.customSize,
            );
            const result = await saveInvitationAction({
              invitationId: invitation.id,
              title: current.title.trim() || "Untitled Invitation",
              eventDate: invitation.eventDate,
              location: invitation.location,
              content,
              status: nextStatus,
            });

            if ("error" in result) {
              setSaveLabel("Retry");
              if (!quiet) showToast(result.error);
              else showToast("Autosave failed - click Save to retry");
              resolve(null);
              return;
            }

            lastSavedPayloadRef.current = serializeSavePayload(
              result.invitation.title,
              result.invitation.content.pages,
              result.invitation.content.activePageId,
              result.invitation.content.shape ?? "portrait",
              result.invitation.content.customSize ?? DEFAULT_CUSTOM_SIZE,
            );
            setContentMeta(result.invitation.content);
            setStatus(result.invitation.status);
            setSavedAt(result.invitation.updatedAt);
            setSaveLabel("Saved");
            savedSuccessfully = true;

            if (!quiet) {
              showToast(
                nextStatus === "published"
                  ? "Invitation published"
                  : nextStatus === "draft"
                    ? "Reverted to draft"
                    : "Changes saved",
              );
            }

            const nextPath = invitationEditPath(result.invitation);
            if (window.location.pathname !== nextPath) {
              router.replace(nextPath, { scroll: false });
            }
            window.setTimeout(() => setSaveLabel("Save"), 1800);
            resolve(result.invitation);
          } catch (error) {
            setSaveLabel("Retry");
            showToast(
              error instanceof Error
                ? error.message
                : "Autosave failed - click Save to retry",
            );
            resolve(null);
          } finally {
            savingRef.current = false;
            if (savedSuccessfully && pendingAutosaveRef.current) {
              pendingAutosaveRef.current = false;
              window.setTimeout(() => {
                void persist({ quiet: true });
              }, 400);
            } else if (!savedSuccessfully) {
              pendingAutosaveRef.current = false;
            }
          }
        });
      });
    },
    // Editor state is read from refs so queued saves always use the latest snapshot.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      invitation,
      router,
    ],
  );

  const handleContinue = useCallback(async () => {
    if (isContinuing) return;
    setIsContinuing(true);
    try {
      const saved = await persist({ force: true, quiet: true });
      if (!saved) {
        showToast("Save your design before continuing");
        return;
      }
      router.push(invitationContinuePath(saved));
    } finally {
      setIsContinuing(false);
    }
  }, [isContinuing, persist, router]);

  // Debounced autosave after edits settle
  useEffect(() => {
    const payload = serializeSavePayload(
      title,
      pages,
      activePageId,
      shape,
      customSize,
    );
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
  }, [activePageId, customSize, pages, persist, shape, title]);

  const onChangeStyle = (patch: Partial<ElementStyle>) => {
    if (!selectedId || canvasSelected || !selected) return;
    const targetIds = new Set(
      selectedIds.length > 1 ? selectedIds : [selectedId],
    );
    setElementsOnActivePage(
      (current) =>
        current.map((element) => {
          if (!targetIds.has(element.id)) return element;
          const nextStyle = {
            ...element.style,
            ...patch,
            effects: patch.effects
              ? { ...element.style.effects, ...patch.effects }
              : element.style.effects,
          };
          const sizePatch =
            element.type === "image" &&
            patch.frame !== undefined &&
            isSquareFrame(patch.frame)
              ? squareElementSize(
                  element.width,
                  element.height || element.width,
                  cardAspectRatio(shape, customSize),
                )
              : null;
          return {
            ...element,
            style: nextStyle,
            ...(sizePatch ?? {}),
          };
        }),
      { record: true },
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

  const onChangeTexture = (
    patch: Partial<
      Pick<
        InvitationPage,
        | "backgroundTexture"
        | "backgroundTextureOpacity"
        | "backgroundTextureTint"
        | "backgroundTextureBlend"
      >
    >,
  ) => {
    snapshotBeforeChange();
    history.setPresentSilent({
      ...history.present,
      pages: history.present.pages.map((page) =>
        page.id === history.present.activePageId
          ? { ...page, ...patch }
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

  const addTextPreset = (
    preset?: "heading" | "subheading" | "body",
    position?: CanvasPoint,
  ) => {
    const placed = (el: CanvasElement) =>
      position ? { ...el, x: position.x, y: position.y } : el;

    if (preset === "heading") {
      addElement(
        placed(
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
        ),
        true,
      );
      return;
    }
    if (preset === "subheading") {
      addElement(
        placed(
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
        ),
        true,
      );
      return;
    }
    if (preset === "body") {
      addElement(
        placed(
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
        ),
        true,
      );
      return;
    }
    addElement(
      placed(
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
      ),
      true,
    );
  };

  const addImageWithOptions = (
    src: string,
    frame?: ImageFrame,
    drop?: DropAnchor,
  ) => {
    // Drop placement always inserts a new image; click may fill an empty frame.
    const emptyFrame =
      !drop &&
      selected?.type === "image" &&
      selected.content === EMPTY_IMAGE_FRAME_SRC
        ? selected
        : null;
    const nextFrame = frame ?? emptyFrame?.style.frame ?? "none";
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

    const placeImage = (size?: { width: number; height: number }) => {
      if (emptyFrame) {
        snapshotBeforeChange();
        updateElement(
          emptyFrame.id,
          {
            content: src,
            ...(size ?? {}),
            style: {
              ...emptyFrame.style,
              frame: nextFrame,
              imageScale: 1,
              imageOffsetX: 0,
              imageOffsetY: 0,
            },
          },
          false,
        );
        setSelectedId(emptyFrame.id);
        return;
      }
      const sized = size ? { ...withFrame, ...size } : withFrame;
      if (drop) {
        const width = sized.width ?? 50;
        const height = sized.height ?? 28;
        const position = clientPointToCanvasPercent(
          drop.canvas,
          drop.clientX,
          drop.clientY,
          width,
          height,
        );
        addElement({
          ...sized,
          ...position,
          width,
          height,
        });
        return;
      }
      addElement(sized);
    };

    if (isPatternGraphicSrc(src)) {
      placeImage();
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
      placeImage(size);
    };
    probe.onerror = () => {
      const aspect = cardAspectRatio(shape, customSize);
      placeImage(
        emptyFrame
          ? undefined
          : isSquareFrame(nextFrame)
            ? squareElementSize(46, 46, aspect)
            : {
                width: 52,
                height: 28,
              },
      );
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

  useEffect(() => {
    const onLayerShortcut = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (
        !(event.metaKey || event.ctrlKey) ||
        !selectedId ||
        canvasSelected
      ) {
        return;
      }
      if (event.code === "BracketLeft") {
        event.preventDefault();
        if (event.altKey) onSendToBack();
        else onSendBackward();
      }
      if (event.code === "BracketRight") {
        event.preventDefault();
        if (event.altKey) onBringToFront();
        else onBringForward();
      }
    };
    window.addEventListener("keydown", onLayerShortcut);
    return () => window.removeEventListener("keydown", onLayerShortcut);
  });

  const onAlignToPage = (
    edge: "top" | "middle" | "bottom" | "left" | "center" | "right",
  ) => {
    if (!selected) return;
    const targetIds = new Set(
      selectedIds.length > 1 ? selectedIds : [selected.id],
    );
    const targets = elements.filter((element) => targetIds.has(element.id));
    if (targets.length === 0) return;

    const bounds = targets.map((element) => {
      const node = document.querySelector<HTMLElement>(
        `[data-canvas-element-id="${CSS.escape(element.id)}"]`,
      );
      const canvas = node?.parentElement;
      if (node && canvas) {
        const nodeRect = node.getBoundingClientRect();
        const canvasRect = canvas.getBoundingClientRect();
        if (canvasRect.width > 0 && canvasRect.height > 0) {
          return {
            left: ((nodeRect.left - canvasRect.left) / canvasRect.width) * 100,
            right:
              ((nodeRect.right - canvasRect.left) / canvasRect.width) * 100,
            top: ((nodeRect.top - canvasRect.top) / canvasRect.height) * 100,
            bottom:
              ((nodeRect.bottom - canvasRect.top) / canvasRect.height) * 100,
          };
        }
      }
      const height =
        element.height ??
        (element.type === "text"
          ? Math.max(2, element.content.split("\n").length * 4)
          : 12);
      return {
        left: element.x,
        right: element.x + element.width,
        top: element.y,
        bottom: element.y + height,
      };
    });
    const group = {
      left: Math.min(...bounds.map((item) => item.left)),
      right: Math.max(...bounds.map((item) => item.right)),
      top: Math.min(...bounds.map((item) => item.top)),
      bottom: Math.max(...bounds.map((item) => item.bottom)),
    };
    const delta = { x: 0, y: 0 };
    if (edge === "left") delta.x = -group.left;
    if (edge === "center") {
      delta.x = 50 - (group.left + group.right) / 2;
    }
    if (edge === "right") delta.x = 100 - group.right;
    if (edge === "top") delta.y = -group.top;
    if (edge === "middle") {
      delta.y = 50 - (group.top + group.bottom) / 2;
    }
    if (edge === "bottom") delta.y = 100 - group.bottom;

    setElementsOnActivePage(
      (current) =>
        current.map((element) =>
          targetIds.has(element.id)
            ? {
                ...element,
                x: element.x + delta.x,
                y: element.y + delta.y,
              }
            : element,
        ),
      { record: true },
    );
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
      const source = current.pages.find(
        (page) => page.id === current.activePageId,
      );
      const blank = createBlankPage(current.pages.length + 1);
      const page: InvitationPage = source
        ? {
            ...blank,
            backgroundColor: source.backgroundColor,
            backgroundPattern: source.backgroundPattern || "none",
            backgroundTexture: source.backgroundTexture || "none",
            backgroundTextureOpacity:
              source.backgroundTextureOpacity ?? 22,
            backgroundTextureTint:
              source.backgroundTextureTint || "#ffffff",
            backgroundTextureBlend:
              source.backgroundTextureBlend || "soft-light",
            border: source.border ? { ...source.border } : null,
          }
        : blank;
      return {
        ...current,
        pages: [...current.pages, page],
        activePageId: page.id,
      };
    });
    setSelectedId(null);
    setSelectedIds([]);
    setEditingId(null);
    showToast("Page added with the same background");
  };

  const applyTemplate = (template: InvitationTemplate) => {
    const content = contentFromTemplate(template);
    commit((current) => ({
      ...current,
      // Templates are laid out for one canvas shape - a landscape suite dropped
      // into a portrait card would crop every page.
      shape: content.shape,
      customSize: { ...content.customSize },
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

  const onAddWidget = (kind: WidgetKind, position?: CanvasPoint) => {
    const el = createWidgetElement(kind, undefined, backgroundColor);
    if (kind === "guest_name") {
      const designSize = designCanvasSize(cardAspectRatio(shape, customSize));
      const naturalWidth =
        ((el.style.fontSize * 5.6 + 12) / designSize.width) * 100;
      const naturalHeight =
        ((el.style.fontSize * el.style.lineHeight + 4) / designSize.height) *
        100;
      el.width = Math.min(80, Math.max(18, naturalWidth));
      el.height = Math.min(24, Math.max(6, naturalHeight));
      if (!position) {
        el.x = (100 - el.width) / 2;
        el.y = (100 - el.height) / 2;
      }
    }
    if (position) {
      el.x = position.x;
      el.y = position.y;
    }
    if (kind !== "map") {
      el.style = { ...el.style, color: defaultElementColor };
    }
    addElement(el);
    setActiveTool("interactive");
    showToast(
      kind === "guest_name"
        ? "Guest name added - place and style it"
        : kind === "map"
        ? "Map added - drag to place"
        : "Interactive block added - drag to place",
    );
  };

  const onAddLibraryElement = (
    item: LibraryElement,
    position?: CanvasPoint,
  ) => {
    saveElementRecent(item.id);
    const baseElement = sizeNewShapeForCard(
      createElementFromLibrary(item),
      cardAspectRatio(shape, customSize),
    );
    const colour =
      item.shapeKind?.startsWith("icon_colour_")
        ? "#FF60AA"
        : defaultElementColor;
    const placeElement = (el: CanvasElement) => {
      const centred = position
        ? {
            x: position.x + (baseElement.width - el.width) / 2,
            y:
              position.y +
              ((baseElement.height ?? 28) - (el.height ?? 28)) / 2,
          }
        : {
            x: (100 - el.width) / 2,
            y: (100 - (el.height ?? 28)) / 2,
          };
      addElement({
        ...el,
        ...centred,
        style: { ...el.style, color: colour },
      });
    };

    if (baseElement.type === "image" && isLibraryGraphicSrc(item.preview)) {
      const probe = new window.Image();
      probe.onload = () => {
        const size = photoElementSize(
          probe.naturalWidth,
          probe.naturalHeight,
          cardAspectRatio(shape, customSize),
        );
        placeElement({ ...baseElement, ...size });
      };
      probe.onerror = () => placeElement(baseElement);
      probe.src = item.preview;
      return;
    }

    placeElement(baseElement);
  };

  const onInsertDrop = (
    payload: EditorInsertPayload,
    drop: DropAnchor,
  ) => {
    const place = (width: number, height: number) =>
      clientPointToCanvasPercent(
        drop.canvas,
        drop.clientX,
        drop.clientY,
        width,
        height,
      );

    if (payload.type === "library") {
      const el = sizeNewShapeForCard(
        createElementFromLibrary(payload.item),
        cardAspectRatio(shape, customSize),
      );
      onAddLibraryElement(
        payload.item,
        place(el.width, el.height ?? 12),
      );
      return;
    }

    if (payload.type === "text") {
      addTextPreset(payload.preset, place(60, 10));
      return;
    }

    if (payload.type === "image") {
      addImageWithOptions(payload.src, undefined, drop);
      return;
    }

    if (payload.type === "stock") {
      void (async () => {
        try {
          const response = await fetch("/api/stock-images/download", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              downloadLocation: payload.downloadLocation,
            }),
          });
          const result = (await response.json()) as { error?: string };
          if (!response.ok) {
            throw new Error(
              result.error || "Could not add this Unsplash photograph.",
            );
          }
          addImageWithOptions(payload.imageUrl, undefined, drop);
        } catch (error) {
          showToast(
            error instanceof Error
              ? error.message
              : "Could not add this Unsplash photograph.",
          );
        }
      })();
      return;
    }

    if (payload.type === "widget") {
      const draft = createWidgetElement(
        payload.kind,
        undefined,
        backgroundColor,
      );
      if (payload.kind === "guest_name") {
        const designSize = designCanvasSize(
          cardAspectRatio(shape, customSize),
        );
        const naturalWidth =
          ((draft.style.fontSize * 5.6 + 12) / designSize.width) * 100;
        const naturalHeight =
          ((draft.style.fontSize * draft.style.lineHeight + 4) /
            designSize.height) *
          100;
        draft.width = Math.min(80, Math.max(18, naturalWidth));
        draft.height = Math.min(24, Math.max(6, naturalHeight));
      }
      onAddWidget(
        payload.kind,
        place(draft.width, draft.height ?? 14),
      );
    }
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
        onSave={() => {
          void persist({ force: true });
        }}
        onContinue={() => {
          void handleContinue();
        }}
        isSaving={isPending}
        isContinuing={isContinuing}
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
            customSizeOpen={customSizeModalOpen}
            onCustomSizeOpenChange={setCustomSizeModalOpen}
            pages={pages}
            onShapeChange={(next) =>
              commit((current) => ({ ...current, shape: next }))
            }
            onCustomSizeChange={(next) =>
              commit((current) => ({
                ...current,
                shape: "custom",
                customSize: next,
              }))
            }
            onAddText={addTextPreset}
            onAddLibraryElement={(item) => onAddLibraryElement(item)}
            onAddImageSrc={(src) => addImageWithOptions(src)}
            onAddWidget={(kind) => onAddWidget(kind)}
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
            selectedIds={canvasSelected ? [] : selectedIds}
            editingId={editingId}
            showGrid={showGrid}
            zoom={zoom}
            backgroundColor={backgroundColor}
            backgroundPattern={activePage.backgroundPattern || "none"}
            backgroundTexture={activePage.backgroundTexture || "none"}
            backgroundTextureOpacity={
              activePage.backgroundTextureOpacity ?? 22
            }
            backgroundTextureTint={
              activePage.backgroundTextureTint || "#ffffff"
            }
            backgroundTextureBlend={
              activePage.backgroundTextureBlend || "soft-light"
            }
            border={activePage.border ?? null}
            canvasSelected={canvasSelected}
            onToggleGrid={() => setShowGrid((v) => !v)}
            onSelect={setSelectedId}
            onToggleSelect={(id) => {
              setSelectedIds((current) => {
                const base =
                  current.length > 0
                    ? current
                    : selectedId && selectedId !== CANVAS_SELECTION_ID
                      ? [selectedId]
                      : [];
                const next = base.includes(id)
                  ? base.filter((selected) => selected !== id)
                  : [...base, id];
                setSelectedId(next[0] ?? null);
                return next;
              });
              setEditingId(null);
            }}
            onSelectMany={(ids) => {
              setSelectedIds(ids);
              setSelectedId(ids[0] ?? null);
            }}
            onSelectCanvas={() => setSelectedId(CANVAS_SELECTION_ID)}
            onClearSelection={() => setSelectedId(null)}
            onStartEdit={(id) => {
              snapshotBeforeChange();
              setEditingId(id);
            }}
            onStopEdit={() => setEditingId(null)}
            onChangeElement={(id, patch) => updateElement(id, patch, false)}
            onChangeElements={(updates) => {
              const patches = new Map(
                updates.map((update) => [update.id, update.patch]),
              );
              setElementsOnActivePage(
                (current) =>
                  current.map((element) => {
                    const patch = patches.get(element.id);
                    return patch ? { ...element, ...patch } : element;
                  }),
                { record: false },
              );
            }}
            onDuplicate={duplicateElement}
            onDelete={deleteElement}
            onDeleteMany={deleteElements}
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
            onInsertDrop={onInsertDrop}
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
            shape={shape}
            customSize={customSize}
            onSelectPage={(pageId) => {
              commit((current) => ({ ...current, activePageId: pageId }));
              setSelectedId(null);
              setSelectedIds([]);
              setEditingId(null);
            }}
            onAddPage={onAddPage}
            onDeletePage={(pageId) => {
              if (pages.length <= 1) {
                showToast("Keep at least one page");
                return;
              }
              commit((current) => {
                const nextPages = enforceInvitationPageRoles(
                  current.pages.filter((page) => page.id !== pageId),
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
              setSelectedIds([]);
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
          onChangeTexture={onChangeTexture}
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

      {completedEvent && <CompletedEventNotice event={completedEvent} />}
    </div>
    </DocumentColorsProvider>
  );
}
