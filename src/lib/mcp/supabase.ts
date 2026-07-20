import { createClient } from "@supabase/supabase-js";
import type { ToolContext } from "@lovable.dev/mcp-js";

// Bundled and executed by Deno at runtime — `process.env` is polyfilled there.
// Access via globalThis to avoid needing @types/node in the Vite tsconfig.
const env = (globalThis as unknown as { process: { env: Record<string, string | undefined> } }).process.env;

export function supabaseForUser(ctx: ToolContext) {
  return createClient(env.SUPABASE_URL!, env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
