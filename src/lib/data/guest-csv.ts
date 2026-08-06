import {
  createEmptyGuestDraft,
  type GuestDraft,
} from "@/lib/data/guests";

/** Built-in guest import template (Prefix | Display name | Email). */
export const GUEST_CSV_HEADERS = ["Prefix", "Display name", "Email"] as const;

export const GUEST_TEMPLATE_FILENAME = "gather-guest-template.csv";

export function buildGuestTemplateCsv(): string {
  const lines = [
    GUEST_CSV_HEADERS.join(","),
    "Ms,Emily,emily@example.com",
    ",Mi & Andre,mi@example.com",
  ];
  return `${lines.join("\n")}\n`;
}

export function downloadGuestTemplateCsv() {
  const blob = new Blob([buildGuestTemplateCsv()], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = GUEST_TEMPLATE_FILENAME;
  anchor.click();
  URL.revokeObjectURL(url);
}

function normaliseHeader(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (char === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  cells.push(current.trim());
  return cells;
}

export interface GuestCsvParseResult {
  guests: GuestDraft[];
  errors: string[];
  skippedEmptyRows: number;
}

/** Parse a CSV using Gather's guest template columns. */
export function parseGuestCsv(text: string): GuestCsvParseResult {
  const errors: string[] = [];
  const guests: GuestDraft[] = [];
  let skippedEmptyRows = 0;

  const normalised = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalised
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line, index, all) => {
      // Keep header even if blank-looking; drop trailing blanks.
      if (index === 0) return true;
      return line.trim().length > 0 || all.slice(index + 1).some((l) => l.trim());
    });

  if (lines.length === 0 || !lines[0]?.trim()) {
    return {
      guests: [],
      errors: ["This file looks empty. Download the Gather template and try again."],
      skippedEmptyRows: 0,
    };
  }

  const headerCells = splitCsvLine(lines[0] ?? "").map(normaliseHeader);
  const prefixIndex = headerCells.findIndex(
    (h) => h === "prefix" || h === "title",
  );
  const nameIndex = headerCells.findIndex(
    (h) =>
      h === "display name" ||
      h === "displayname" ||
      h === "name" ||
      h === "guest name",
  );
  const emailIndex = headerCells.findIndex(
    (h) => h === "email" || h === "email address" || h === "e mail",
  );

  if (nameIndex < 0 || emailIndex < 0) {
    return {
      guests: [],
      errors: [
        "Couldn’t find the required columns. Use headers: Prefix, Display name, Email.",
      ],
      skippedEmptyRows: 0,
    };
  }

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]?.trim();
    if (!line) {
      skippedEmptyRows += 1;
      continue;
    }
    const cells = splitCsvLine(line);
    const prefix =
      prefixIndex >= 0 ? (cells[prefixIndex] ?? "").trim() : "";
    const displayName = (cells[nameIndex] ?? "").trim();
    const email = (cells[emailIndex] ?? "").trim();

    if (!prefix && !displayName && !email) {
      skippedEmptyRows += 1;
      continue;
    }

    guests.push({
      ...createEmptyGuestDraft(),
      prefix,
      displayName,
      email,
    });
  }

  if (guests.length === 0) {
    errors.push("No guest rows found under the header.");
  }

  return { guests, errors, skippedEmptyRows };
}
