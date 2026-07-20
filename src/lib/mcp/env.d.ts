// Runtime env shim for MCP tool files.
// These modules are bundled by the mcp-js Vite plugin into a Deno Edge Function
// where `process.env` is polyfilled. This ambient declaration keeps the source
// typecheck happy in the Vite/browser tsconfig without pulling in @types/node.
declare const process: {
  env: Record<string, string | undefined>;
};

export {};
