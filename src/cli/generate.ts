import fs from "node:fs"
import path from "node:path"
import { loadConfig } from "./config.js"
import { findContractFiles, resolveContractsDir, resolveGeneratedFile } from "./paths.js"
import { renderGeneratedTs } from "./templates.js"

function toImportName(fileAbs: string) {
	const base = path.basename(fileAbs).replace(/\.[^.]+$/, "") // remove extensão
	const safe = base.replace(/[^a-zA-Z0-9_$]/g, "_")
	return `${safe}Contract`
}

function toImportPath(contractsDir: string, fileAbs: string) {
	const rel = path.relative(contractsDir, fileAbs).replaceAll(path.sep, "/")
	const withoutExt = rel.replace(/\.[^.]+$/, "")
	return `./${withoutExt}`
}

export async function generate(projectRoot: string) {
	const cfg = await loadConfig(projectRoot)
	const contractsDir = resolveContractsDir(projectRoot, cfg)
	const outFile = resolveGeneratedFile(contractsDir, cfg)

	const files = await findContractFiles(contractsDir, cfg)
	const filtered = files.filter((f) => path.resolve(f) !== path.resolve(outFile))

	if (!filtered.length) {
		throw new Error(`Nenhum contract encontrado em: ${contractsDir}`)
	}

	const importEntries = filtered.map((fileAbs) => ({
		importName: toImportName(fileAbs),
		importPath: toImportPath(contractsDir, fileAbs),
	}))

	const content = renderGeneratedTs({
		contractsDir,
		contractFiles: filtered,
		importEntries,
	})

	fs.mkdirSync(path.dirname(outFile), { recursive: true })
	fs.writeFileSync(outFile, content, "utf8")

	return { outFile, count: filtered.length }
}
