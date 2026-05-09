# shipcheck-mcp

[![npm version](https://img.shields.io/npm/v/shipcheck-mcp.svg)](https://www.npmjs.com/package/shipcheck-mcp)
[![ci](https://github.com/TateLyman/shipcheck-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/TateLyman/shipcheck-mcp/actions/workflows/ci.yml)
[![MCP Registry](https://img.shields.io/badge/MCP%20Registry-active-2ea44f)](https://registry.modelcontextprotocol.io/v0/servers?search=shipcheck)
[![shipcheck-mcp MCP server](https://glama.ai/mcp/servers/TateLyman/shipcheck-mcp/badges/score.svg)](https://glama.ai/mcp/servers/TateLyman/shipcheck-mcp)
[![Shipcheck Action](https://img.shields.io/badge/Shipcheck-Action-2ea44f)](https://github.com/marketplace/actions/shipcheck-ai-app-scanner)

MCP server that lets coding agents run [Shipcheck](https://www.npmjs.com/package/shipcheck-cli) on authorized local JavaScript and TypeScript repositories.

Shipcheck scans apps and MCP servers for launch risks such as exposed private-looking env vars, unsigned Stripe webhooks, missing Supabase/Firebase rule evidence, debug routes, missing usage-cost guardrails, missing CI, loose dependencies, and thin release docs.

Tool page: https://tatelyman.github.io/tate-web-services/shipcheck.html

Free MCP launch self-check: https://tatelyman.github.io/tate-web-services/mcp-self-check.html

Paid MCP launch check: https://tatelyman.github.io/tate-web-services/mcp-launch-review.html

Official MCP Registry: https://registry.modelcontextprotocol.io/v0/servers?search=shipcheck

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

Shipcheck is defensive static analysis, not a penetration test. It reads local project files, does not modify the repository, does not execute project code, and does not require network access. Run it only on repos you own or are authorized to inspect.

## Development

```bash
npm install
npm run check
```
