export const BULK_INVITE_HEADERS = [
  "email_address",
  "first_name",
  "middle_name",
  "last_name",
  "staff_id",
] as const;
const REQUIRED_HEADERS = ["email_address", "first_name", "last_name"] as const;

export interface BulkInviteRecord {
  row: number;
  email: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  staffId?: string;
}

function normalizeHeader(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function assertRequiredHeaders(headers: string[]) {
  const missing = REQUIRED_HEADERS.filter(
    (header) => !headers.includes(header),
  );
  if (missing.length > 0)
    throw new Error(`Missing required column(s): ${missing.join(", ")}`);
}

function toRecord(
  row: number,
  values: Record<string, unknown>,
): BulkInviteRecord {
  const middleName = String(values.middle_name ?? "").trim();
  const staffId = String(values.staff_id ?? "").trim();
  return {
    row,
    email: String(values.email_address ?? "").trim(),
    firstName: String(values.first_name ?? "").trim(),
    ...(middleName ? { middleName } : {}),
    lastName: String(values.last_name ?? "").trim(),
    ...(staffId ? { staffId } : {}),
  };
}

async function parseCsv(file: File): Promise<BulkInviteRecord[]> {
  const Papa = await import("papaparse");
  const result = Papa.parse<Record<string, unknown>>(await file.text(), {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: normalizeHeader,
  });
  const parseError = result.errors[0];
  if (parseError) {
    throw new Error(
      `CSV row ${(parseError.row ?? 0) + 2}: ${parseError.message}`,
    );
  }
  assertRequiredHeaders((result.meta.fields ?? []).map(normalizeHeader));
  return result.data.map((values, index) => toRecord(index + 2, values));
}

async function parseXlsx(file: File): Promise<BulkInviteRecord[]> {
  const ExcelJS = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(await file.arrayBuffer());
  const worksheet = workbook.getWorksheet("Invites") ?? workbook.worksheets[0];
  if (!worksheet) throw new Error("The workbook does not contain a worksheet");

  const headers: string[] = [];
  worksheet.getRow(1).eachCell({ includeEmpty: true }, (cell, column) => {
    headers[column - 1] = normalizeHeader(cell.text);
  });
  assertRequiredHeaders(headers);

  const records: BulkInviteRecord[] = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const values = Object.fromEntries(
      headers.map((header, index) => [
        header,
        row.getCell(index + 1).text.trim(),
      ]),
    );
    if (Object.values(values).every((value) => !value)) return;
    records.push(toRecord(rowNumber, values));
  });
  return records;
}

export async function parseBulkInviteFile(
  file: File,
): Promise<BulkInviteRecord[]> {
  const fileName = file.name.toLowerCase();
  if (fileName.endsWith(".csv")) return parseCsv(file);
  if (fileName.endsWith(".xlsx")) return parseXlsx(file);
  throw new Error("Please upload a CSV or XLSX file");
}
