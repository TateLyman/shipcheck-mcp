#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { runShipcheck } from "./scan.js";

const server = new McpServer({
  name: "shipcheck-mcp",
  version: readPackageVersion()
});

server.registerTool(
  "scan_repository",
  {
    title: "Scan repository with Shipcheck",
    description: "Run Shipcheck on a local JavaScript or TypeScript repo the user owns or is authorized to inspect.",
    inputSchema: {
      root: z.string().default(".").describe("Local path to the repository root."),
      format: z.enum(["text", "markdown", "json", "sarif"]).default("text").describe("Report format to return."),
      failOn: z.enum(["info", "low", "medium", "high"]).default("high").describe("Lowest severity that should mark the report as failing."),
      strict: z.boolean().default(false).describe("Enable stricter release-readiness checks.")
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
