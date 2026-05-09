#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { runShipcheck } from "./scan.js";

const severitySchema = z.enum(["info", "low", "medium", "high"]);
const findingSchema = z.object({
  id: z.string().describe("Stable finding identifier."),
  title: z.string().describe("Short finding title."),
  severity: severitySchema.describe("Finding severity."),
  message: z.string().describe("Why the finding matters."),
  remediation: z.string().describe("Practical fix or verification step."),
  file: z.string().optional().describe("Relative file path tied to the finding, when available.")
});

const scanReportSchema = z.object({
  root: z.string().describe("Scanned repository root."),
  score: z.number().describe("Launch-readiness score from 0 to 100."),
  ok: z.boolean().describe("Whether the scan passed the selected failOn threshold."),
  failOn: severitySchema.describe("Severity threshold used for the pass/fail decision."),
  totals: z.object({
    info: z.number(),
    low: z.number(),
    medium: z.number(),
    high: z.number()
  }).describe("Finding counts by severity."),
  findings: z.array(findingSchema).describe("Ordered launch-risk findings.")
});

const server = new McpServer({
  name: "shipcheck-mcp",
  version: readPackageVersion()
});

server.registerTool(
  "scan_repository",
  {
    title: "Scan repository with Shipcheck",
    description: [
      "Run read-only Shipcheck static analysis on an authorized local JavaScript, TypeScript, or MCP repository.",
      "Use before launch, directory submission, or client handoff to find exposed environment values, unsigned webhook handlers, missing database-rule evidence, debug leftovers, dependency risk, weak CI/docs, and usage-cost guardrail gaps.",
      "The tool reads project files, does not modify the repository, does not execute project code, and does not require network access.",
      "It returns both a formatted report and structured findings with severity, file path, and remediation."
    ].join(" "),
    inputSchema: {
      root: z.string().default(".").describe("Absolute or relative path to the authorized local repository. Defaults to the current working directory."),
      format: z.enum(["text", "markdown", "json", "sarif"]).default("text").describe("Report rendering: text for terminals, markdown for review notes, json for automation, or sarif for code-scanning upload."),
      failOn: severitySchema.default("high").describe("Pass/fail threshold. high fails only high findings; medium fails medium and high; low fails low through high; info fails on any finding."),
      strict: z.boolean().default(false).describe("When true, enables extra release-readiness checks for launch handoff, directory submission, and production review.")
    },
    outputSchema: scanReportSchema.shape,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false
    }
  },
  async ({ root, format, failOn, strict }) => {
    const output = await runShipcheck({ root, format, failOn, strict });

    return {
      content: [
        {
          type: "text",
          text: output.formatted
        }
      ],
      structuredContent: output.report
    };
  }
);

server.registerResource(
  "usage",
  "shipcheck://usage",
  {
    title: "Shipcheck MCP usage",
    description: "How to use the Shipcheck MCP server safely.",
    mimeType: "text/markdown"
  },
  async (uri) => ({
    contents: [
      {
        uri: uri.href,
        text: [
          "# Shipcheck MCP",
          "",
          "Use `scan_repository` on JavaScript or TypeScript repos you own or are authorized to inspect.",
          "",
          "Typical inputs:",
          "",
          "```json",
          "{\"root\":\".\",\"format\":\"markdown\",\"failOn\":\"medium\",\"strict\":true}",
          "```",
          "",
          "Shipcheck is a defensive static scanner, not a penetration test."
        ].join("\n")
      }
    ]
  })
);

function readPackageVersion(): string {
  const packageJsonUrl = new URL("../../package.json", import.meta.url);
  const packageJson = JSON.parse(readFileSync(packageJsonUrl, "utf8")) as { version?: unknown };

  return typeof packageJson.version === "string" ? packageJson.version : "unknown";
}

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
