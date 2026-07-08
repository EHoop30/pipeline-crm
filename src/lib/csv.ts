import { formatMoney, formatDate } from "./format";
import { STAGE_LABELS, type Deal } from "./types";

function escapeCell(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function dealsToCsv(deals: Deal[]): string {
  const header = [
    "Title",
    "Company",
    "Stage",
    "Value",
    "Expected Close",
    "Updated",
  ];
  const rows = deals.map((d) =>
    [
      d.title,
      d.company?.name ?? "",
      STAGE_LABELS[d.stage],
      formatMoney(d.value_cents),
      formatDate(d.expected_close),
      formatDate(d.updated_at),
    ]
      .map(escapeCell)
      .join(","),
  );
  return [header.join(","), ...rows].join("\n");
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
