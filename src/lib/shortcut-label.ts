/** Platform-aware modifier key label for shortcut hints in the UI. */
export function modKeyLabel(): string {
  if (typeof navigator === "undefined") return "⌘";
  const platform = navigator.platform || "";
  const ua = navigator.userAgent || "";
  const isApple =
    /Mac|iPhone|iPad|iPod/i.test(platform) || /Mac OS X/i.test(ua);
  return isApple ? "⌘" : "Ctrl";
}

/** e.g. "⌘Z" on Mac, "Ctrl+Z" on Windows/Linux */
export function shortcutLabel(...keys: string[]): string {
  const mod = modKeyLabel();
  const joiner = mod === "⌘" ? "" : "+";
  return [mod, ...keys].join(joiner);
}
