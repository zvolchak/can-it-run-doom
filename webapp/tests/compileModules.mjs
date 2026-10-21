import { mkdtempSync, readFileSync, writeFileSync, mkdirSync, symlinkSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { createRequire } from "node:module"
import ts from "typescript"

/** Execute the actual TypeScript utilities with the existing compiler on Node 20. */
export function compileModules(files) {
    const root = join(dirname(fileURLToPath(import.meta.url)), "..")
    const temporary = mkdtempSync(join(tmpdir(), "doom-archive-tests-"))
    symlinkSync(join(root, "node_modules"), join(temporary, "node_modules"), "dir")
    for (const file of files) {
        const target = join(temporary, file.replace(/\.tsx?$/, ".js"))
        mkdirSync(dirname(target), { recursive: true })
        writeFileSync(target, ts.transpileModule(readFileSync(join(root, file), "utf8"), {
            compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
        }).outputText)
    }
    const loadCompiled = createRequire(import.meta.url)
    return {
        load: file => loadCompiled(join(temporary, file.replace(/\.tsx?$/, ".js"))),
        dispose: () => rmSync(temporary, { recursive: true, force: true }),
    }
}
