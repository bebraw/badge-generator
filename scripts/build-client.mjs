import { mkdir, readFile, writeFile } from "node:fs/promises";
import ts from "typescript";

const sourcePath = new URL("../src/client/badge-app.ts", import.meta.url);
const outputPath = new URL("../.generated/badge-app.client.js", import.meta.url);

const source = await readFile(sourcePath, "utf8");
const output = ts.transpileModule(source, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ES2022,
    strict: true,
    removeComments: false,
  },
  fileName: "badge-app.ts",
});

await mkdir(new URL("../.generated/", import.meta.url), { recursive: true });
await writeFile(outputPath, output.outputText);
