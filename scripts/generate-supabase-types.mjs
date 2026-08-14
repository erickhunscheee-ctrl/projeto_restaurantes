import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL não configurada.");
const projectRef = new URL(url).hostname.split(".")[0];
if (!projectRef) throw new Error("Não foi possível identificar o projeto Supabase.");

const executable = process.platform === "win32" ? "npx.cmd" : "npx";
const result = spawnSync(executable, ["--yes", "supabase", "gen", "types", "typescript", "--project-id", projectRef, "--schema", "public"], {
  encoding: "utf8",
  shell: process.platform === "win32",
});
if (result.status !== 0) {
  process.stderr.write(result.stderr || result.stdout || result.error?.message || "Falha ao gerar os tipos do Supabase. Faça login com npx supabase login.\n");
  process.exit(result.status ?? 1);
}
writeFileSync("lib/supabase/database.types.ts", result.stdout, "utf8");
process.stdout.write("Tipos gerados em lib/supabase/database.types.ts\n");
