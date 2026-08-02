"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import {
  buildLinearGradient,
  fillBoxStyle,
  hexToHsv,
  hsvToHex,
  isGradient,
  normalizeHex,
  parseLinearGradient,
} from "@/lib/color-utils";

const DocumentColorsContext = createContext<string[]>([]);

/** Provides only colours that are currently used by the invitation. */
export function DocumentColorsProvider({
  colors,
  children,
}: {
  colors: string[];
  /** Kept for call-site compatibility when switching invitations. */
  resetKey?: string;
  children: React.ReactNode;
}) {
  return (
    <DocumentColorsContext.Provider value={colors.slice(0, 24)}>
      {children}
    </DocumentColorsContext.Provider>
  );
}

function useDocumentColors() {
  return useContext(DocumentColorsContext);
}

function EyedropperIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.5 4.5l4 4M14 6l-1.2 1.2 4 4L18 10M4 20l5.2-1.3a2 2 0 0 0 1-.5l7.3-7.3a2.1 2.1 0 0 0 0-3l-1.4-1.4a2.1 2.1 0 0 0-3 0L5.8 13.8a2 2 0 0 0-.5 1L4 20z"
      />
    </svg>
  );
}

async function pickFromScreen(): Promise<string | null> {
  const EyeDropperCtor = (
    window as Window & {
      EyeDropper?: new () => { open: () => Promise<{ sRGBHex: string }> };
    }
  ).EyeDropper;
  if (!EyeDropperCtor) return null;
  try {
    const result = await new EyeDropperCtor().open();
    return normalizeHex(result.sRGBHex);
  } catch {
    return null;
  }
}

function Swatch({
  value,
  selected,
  onClick,
  title,
  size = "md",
}: {
  value: string;
  selected?: boolean;
  onClick: () => void;
  title?: string;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? "h-7 w-7" : "h-8 w-8";
  const fill = isGradient(value)
    ? { backgroundImage: value, backgroundSize: "100% 100%", backgroundRepeat: "no-repeat" as const }
    : { backgroundColor: normalizeHex(value || "#FFFFFF") };

  return (
    <button
      type="button"
      title={title || value}
      onClick={onClick}
      className={`${dim} relative shrink-0 overflow-hidden rounded-full p-0 transition-transform hover:scale-105 ${
        selected
          ? "outline outline-2 outline-offset-2 outline-signature"
          : "shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]"
      }`}
      aria-label={title || value}
    >
      <span className="absolute inset-0 block rounded-full" style={fill} />
    </button>
  );
}

function SolidPane({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const solid = isGradient(value) ? "#FDF4ED" : normalizeHex(value);
  const hsv = hexToHsv(solid);
  const [hue, setHue] = useState(hsv.h);
  const [sat, setSat] = useState(hsv.s);
  const [val, setVal] = useState(hsv.v);
  const [hexInput, setHexInput] = useState(solid);
  const fieldRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const lastInternalValue = useRef<string | null>(null);

  useEffect(() => {
    if (isGradient(value)) return;
    const next = normalizeHex(value);
    if (lastInternalValue.current === next) {
      lastInternalValue.current = null;
      setHexInput(next);
      return;
    }
    lastInternalValue.current = null;
    const parsed = hexToHsv(next);
    // Hue is undefined for greys. Keep the user's last hue so moving back
    // into the saturation field does not jump to red.
    if (parsed.s > 0.001) setHue(parsed.h);
    setSat(parsed.s);
    setVal(parsed.v);
    setHexInput(next);
  }, [value]);

  const commitHsv = useCallback(
    (h: number, s: number, v: number) => {
      const hex = hsvToHex(h, s, v);
      lastInternalValue.current = hex;
      setHexInput(hex);
      onChange(hex);
    },
    [onChange],
  );

  const setFromPointer = (clientX: number, clientY: number) => {
    const el = fieldRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const s = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const v = 1 - Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
    setSat(s);
    setVal(v);
    commitHsv(hue, s, v);
  };

  const hueColor = hsvToHex(hue, 1, 1);

  return (
    <div className="space-y-3">
      <div
        ref={fieldRef}
        data-colour-saturation-field
        className="relative h-36 w-full cursor-crosshair overflow-hidden rounded-xl"
        style={{
          backgroundColor: hueColor,
          backgroundImage:
            "linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent)",
        }}
        onPointerDown={(e) => {
          dragging.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          setFromPointer(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => {
          if (!dragging.current) return;
          setFromPointer(e.clientX, e.clientY);
        }}
        onPointerUp={() => {
          dragging.current = false;
        }}
      >
        <span
          className="pointer-events-none absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
          style={{ left: `${sat * 100}%`, top: `${(1 - val) * 100}%` }}
        />
      </div>

      <input
        type="range"
        min={0}
        max={360}
        value={hue}
        onChange={(e) => {
          const h = Number(e.target.value);
          setHue(h);
          commitHsv(h, sat, val);
        }}
        className="h-3 w-full cursor-pointer appearance-none rounded-full"
        style={{
          background:
            "linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)",
        }}
        aria-label="Hue"
      />

      <div className="flex items-center gap-2">
        <span
          className="h-8 w-8 shrink-0 rounded-full border border-black/10"
          style={fillBoxStyle(solid)}
        />
        <input
          type="text"
          value={hexInput}
          onChange={(e) => {
            const next = e.target.value;
            setHexInput(next);
            if (/^#?[0-9a-f]{3,8}$/i.test(next.trim())) {
              onChange(normalizeHex(next));
            }
          }}
          onBlur={() => setHexInput(normalizeHex(hexInput, solid))}
          className="flex-1 rounded-xl border border-black/10 px-3 py-2 text-sm uppercase outline-none focus:border-signature/40 focus:ring-2 focus:ring-signature/20"
          spellCheck={false}
        />
        <button
          type="button"
          onClick={async () => {
            const picked = await pickFromScreen();
            if (picked) onChange(picked);
          }}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/10 text-black hover:bg-soft-grey"
          title="Eyedropper"
          aria-label="Pick colour from screen"
        >
          <EyedropperIcon />
        </button>
      </div>
    </div>
  );
}

function GradientPane({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const parsed =
    parseLinearGradient(value) ??
    ({ angle: 90, start: "#FDF4ED", end: "#FF60AA" } as const);
  const [angle, setAngle] = useState(parsed.angle);
  const [start, setStart] = useState(parsed.start);
  const [end, setEnd] = useState(parsed.end);

  useEffect(() => {
    const next = parseLinearGradient(value);
    if (!next) return;
    setAngle(next.angle);
    setStart(next.start);
    setEnd(next.end);
  }, [value]);

  const commit = (nextAngle: number, nextStart: string, nextEnd: string) => {
    onChange(buildLinearGradient(nextAngle, nextStart, nextEnd));
  };

  const preview = buildLinearGradient(angle, start, end);

  return (
    <div className="space-y-3">
      <div
        className="h-20 w-full rounded-xl border border-black/10"
        style={fillBoxStyle(preview)}
      />
      <label className="block">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-xs font-medium text-grey">Angle</span>
          <span className="text-xs text-grey">{Math.round(angle)}°</span>
        </div>
        <input
          type="range"
          min={0}
          max={360}
          value={angle}
          onChange={(e) => {
            const next = Number(e.target.value);
            setAngle(next);
            commit(next, start, end);
          }}
          className="h-1 w-full appearance-none rounded-full bg-black/10 accent-signature"
        />
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-grey">
            Start
          </span>
          <div className="flex items-center gap-1.5">
            <input
              type="color"
              value={normalizeHex(start)}
              onChange={(e) => {
                setStart(e.target.value);
                commit(angle, e.target.value, end);
              }}
              className="h-8 w-8 cursor-pointer rounded-lg border border-black/10 bg-white p-0.5"
            />
            <input
              type="text"
              value={start}
              onChange={(e) => {
                const next = e.target.value;
                setStart(next);
                if (/^#?[0-9a-f]{3,8}$/i.test(next.trim())) {
                  commit(angle, normalizeHex(next), end);
                }
              }}
              className="w-full rounded-lg border border-black/10 px-2 py-1.5 text-xs uppercase outline-none focus:border-signature/40"
            />
          </div>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-grey">
            End
          </span>
          <div className="flex items-center gap-1.5">
            <input
              type="color"
              value={normalizeHex(end)}
              onChange={(e) => {
                setEnd(e.target.value);
                commit(angle, start, e.target.value);
              }}
              className="h-8 w-8 cursor-pointer rounded-lg border border-black/10 bg-white p-0.5"
            />
            <input
              type="text"
              value={end}
              onChange={(e) => {
                const next = e.target.value;
                setEnd(next);
                if (/^#?[0-9a-f]{3,8}$/i.test(next.trim())) {
                  commit(angle, start, normalizeHex(next));
                }
              }}
              className="w-full rounded-lg border border-black/10 px-2 py-1.5 text-xs uppercase outline-none focus:border-signature/40"
            />
          </div>
        </label>
      </div>
    </div>
  );
}

export function ColourField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const documentColors = useDocumentColors();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"solid" | "gradient">(
    isGradient(value) ? "gradient" : "solid",
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    setTab(isGradient(value) ? "gradient" : "solid");
  }, [value]);

  const isSameColor = (a: string, b: string) =>
    a.trim().toLowerCase() === b.trim().toLowerCase();

  return (
    <div ref={rootRef} className="relative">
      <span className="mb-1.5 block text-[11px] font-medium tracking-wide text-grey">
        {label}
      </span>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-lg font-bold leading-none text-signature transition-transform hover:scale-105"
          aria-expanded={open}
          aria-controls={panelId}
          title="Colour picker"
          aria-label="Open colour picker"
        >
          +
        </button>

        <button
          type="button"
          onClick={async () => {
            const picked = await pickFromScreen();
            if (picked) onChange(picked);
          }}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 text-black hover:bg-soft-grey"
          title="Eyedropper"
          aria-label="Pick colour from screen"
        >
          <EyedropperIcon className="h-3.5 w-3.5" />
        </button>

        <Swatch
          value={value}
          selected
          onClick={() => setOpen((v) => !v)}
          title="Current colour"
          size="sm"
        />
      </div>

      {open ? (
        <>
          <div
            className="fixed inset-0 z-[45]"
            aria-hidden="true"
            onPointerDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setOpen(false);
            }}
          />
          <div
            id={panelId}
            className="absolute left-0 z-50 mt-2 w-[280px] rounded-2xl border border-black/10 bg-white p-3 shadow-[0_16px_40px_rgba(0,0,0,0.16)]"
            onPointerDown={(event) => event.stopPropagation()}
          >
            {documentColors.length > 0 ? (
              <div className="mb-3">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-grey">
                  Document colours
                </p>
                <div className="flex flex-wrap gap-2">
                  {documentColors.slice(0, 12).map((color) => (
                    <Swatch
                      key={color}
                      value={color}
                      selected={isSameColor(color, value)}
                      onClick={() => onChange(color)}
                      size="sm"
                    />
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mb-3 flex gap-4 border-b border-black/8">
              {(
                [
                  ["solid", "Solid colour"],
                  ["gradient", "Gradient"],
                ] as const
              ).map(([id, title]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setTab(id);
                    if (id === "gradient" && !isGradient(value)) {
                      onChange(buildLinearGradient(90, "#FDF4ED", "#FF60AA"));
                    }
                    if (id === "solid" && isGradient(value)) {
                      const parsed = parseLinearGradient(value);
                      onChange(parsed?.start || "#FDF4ED");
                    }
                  }}
                  className={`relative pb-2 text-sm font-semibold transition-colors ${
                    tab === id ? "text-black" : "text-grey hover:text-black"
                  }`}
                >
                  {title}
                  {tab === id ? (
                    <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-signature" />
                  ) : null}
                </button>
              ))}
            </div>

            {tab === "solid" ? (
              <SolidPane value={value} onChange={onChange} />
            ) : (
              <GradientPane value={value} onChange={onChange} />
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
