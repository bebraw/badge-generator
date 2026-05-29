import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export function ensureGeneratedStylesheet(): void {
  mkdirSync(".generated", { recursive: true });
  writeFileSync(join(".generated", "styles.css"), ":root{--color-paper:#f5f2ec;}", "utf8");
}

export function ensureGeneratedClientScript(): void {
  mkdirSync(".generated", { recursive: true });
  writeFileSync(join(".generated", "badge-app.client.js"), "document.documentElement.dataset.badgeAppLoaded = 'true';", "utf8");
}
