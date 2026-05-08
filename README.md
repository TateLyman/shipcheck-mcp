# shipcheck-mcp

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
      "args": ["--yes", "shipcheck-mcp"]
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
