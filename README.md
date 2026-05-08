# shipcheck-mcp

[![npm version](https://img.shields.io/npm/v/shipcheck-mcp.svg)](https://www.npmjs.com/package/shipcheck-mcp)
[![ci](https://github.com/TateLyman/shipcheck-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/TateLyman/shipcheck-mcp/actions/workflows/ci.yml)
[![Shipcheck Action](https://img.shields.io/badge/Shipcheck-Action-2ea44f)](https://github.com/marketplace/actions/shipcheck-ai-app-scanner)

MCP server that lets AI coding agents run [Shipcheck](https://www.npmjs.com/package/shipcheck-cli) on local JavaScript and TypeScript repositories.

Shipcheck scans AI-built apps for launch risks such as exposed private-looking env vars, unsigned Stripe webhooks, missing Supabase/Firebase rule evidence, debug routes, missing AI usage guardrails, missing CI, loose dependencies, and thin release docs.

Tool page: https://tatelyman.github.io/tate-web-services/shipcheck.html

Demo repo with GitHub code scanning alerts: https://github.com/TateLyman/shipcheck-demo-ai-app

## Install

Run directly with `npx`:

```bash
npx --yes shipcheck-mcp
```

## MCP Config

Add this server to an MCP client that supports stdio servers:

```json
{
  "mcpServers": {
    "shipcheck": {
      "command": "npx",
      "args": ["--yes", "--package", "shipcheck-mcp", "shipcheck-mcp"]
    }
  }
}
```

## Tool

`scan_repository`

```json
{
  "root": ".",
  "format": "markdown",
  "failOn": "medium",
  "strict": true
}
```

Formats: `text`, `markdown`, `json`, or `sarif`.

Severities: `info`, `low`, `medium`, or `high`.

Shipcheck is defensive static analysis, not a penetration test. Run it only on repos you own or are authorized to inspect.

## Development

```bash
npm install
npm run check
```
