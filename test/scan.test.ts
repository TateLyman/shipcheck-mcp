import assert from "node:assert/strict";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { runShipcheck } from "../src/scan.js";

test("runs Shipcheck and returns formatted output", async () => {
  const root = await fixture({
    "package.json": JSON.stringify({
      scripts: {
        build: "tsc -p tsconfig.json",
        lint: "tsc -p tsconfig.json --noEmit",
        test: "node --test"
      },
      dependencies: {
        "@supabase/supabase-js": "^2.43.0",
        openai: "^5.0.0"
      },
      devDependencies: {
        typescript: "^5.8.3"
      },
      packageManager: "npm@11.8.0",
      license: "MIT"
    }),
    "package-lock.json": "{}",
    ".gitignore": "node_modules/\n.env\n",
    ".env.example": "NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co\nOPENAI_API_KEY=placeholder\n",
    "README.md": "# Demo\n\nThis fixture has enough documentation to pass the README length check while still containing a debug route for Shipcheck to report.\n\n## Usage\n\nRun tests and inspect the report before launch.",
    "LICENSE": "MIT",
    "tsconfig.json": "{}",
    ".github/workflows/ci.yml": "name: ci\non: [push]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps: []\n",
    "src/lib/supabase.ts": "import { createClient } from '@supabase/supabase-js';\nexport const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, 'anon');\n",
    "src/app/api/debug/route.ts": "export function GET() { return Response.json({ ok: true }); }\n"
  });

  const result = await runShipcheck({ root, format: "json", failOn: "high", strict: true });
  const parsed = JSON.parse(result.formatted) as { findings: Array<{ id: string }> };

  assert.equal(result.report.ok, true);
  assert.equal(parsed.findings.some((finding) => finding.id === "debug-api-route"), true);
});

async function fixture(files: Record<string, string>): Promise<string> {
  const root = await mkdtemp(path.join(tmpdir(), "shipcheck-mcp-"));

  for (const [relativePath, contents] of Object.entries(files)) {
    const fullPath = path.join(root, relativePath);
    await mkdir(path.dirname(fullPath), { recursive: true });
    await writeFile(fullPath, contents);
  }

  return root;
}
