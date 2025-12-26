import fs from "node:fs"
import path from "node:path"
import { pathToFileURL } from "node:url"

export type ContractifyConfig = {
	contractsDir?: string // default: "contracts"
	generatedFile?: string // default: "_generated.ts"
	include?: string[] // default: ["**/*.contract.ts"]
	exclude?: string[] // default: ["**/_generated.ts", "**/*.d.ts"]
}

const DEFAULTS: Required<ContractifyConfig> = {
	contractsDir: "contracts",
	generatedFile: "_generated.ts",
	include: ["**/*.contract.ts", "**/*.contracts.ts", "**/*.contract.tsx", "**/*.ts"],
	exclude: ["**/_generated.ts", "**/*.d.ts"],
}

export async function loadConfig(projectRoot: string): Promise<Required<ContractifyConfig>> {
	const tsPath = path.join(projectRoot, "contractify.config.ts")
	const jsonPath = path.join(projectRoot, "contractify.config.json")

	if (fs.existsSync(tsPath)) {
		const mod = await import(pathToFileURL(tsPath).href)
		return { ...DEFAULTS, ...(mod.default ?? {}) }
	}

	if (fs.existsSync(jsonPath)) {
		const raw = fs.readFileSync(jsonPath, "utf8")
		const parsed = JSON.parse(raw)
		return { ...DEFAULTS, ...(parsed ?? {}) }
	}

	return DEFAULTS
}
