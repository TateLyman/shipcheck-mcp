import { formatReport, type ReportFormat } from "shipcheck-cli/dist/src/format.js";
import { scanRepository, type ScanReport, type Severity } from "shipcheck-cli/dist/src/index.js";

export type ScanRepositoryInput = {
  root?: string;
  format?: ReportFormat;
  failOn?: Severity;
  strict?: boolean;
};

export type ScanRepositoryOutput = {
  report: ScanReport;
  formatted: string;
};

const formats = new Set<ReportFormat>(["text", "markdown", "json", "sarif"]);
const severities = new Set<Severity>(["info", "low", "medium", "high"]);

export async function runShipcheck(input: ScanRepositoryInput): Promise<ScanRepositoryOutput> {
  const root = input.root?.trim() || ".";
  const format = normalizeFormat(input.format);
  const failOn = normalizeSeverity(input.failOn);

  const report = await scanRepository({
    root,
    failOn,
    strict: input.strict ?? false
  });

  return {
    report,
    formatted: formatReport(report, format)
  };
}

function normalizeFormat(format: ReportFormat | undefined): ReportFormat {
  if (!format) {
    return "text";
  }

  if (!formats.has(format)) {
    throw new Error(`Unsupported format: ${format}`);
  }

  return format;
}

function normalizeSeverity(severity: Severity | undefined): Severity {
  if (!severity) {
    return "high";
  }

  if (!severities.has(severity)) {
    throw new Error(`Unsupported failOn severity: ${severity}`);
  }

  return severity;
}
