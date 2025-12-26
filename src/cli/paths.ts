import path from "node:path"
import { globby } from "globby"
import type { ContractifyConfig } from "./config.js"

export function resolveContractsDir(projectRoot: string, cfg: Required<ContractifyConfig>) {
	return path.resolve(projectRoot, cfg.contractsDir)
}

export function resolveGeneratedFile(contractsDir: string, cfg: Required<ContractifyConfig>) {
	return path.join(contractsDir, cfg.generatedFile)
}

export async function findContractFiles(contractsDir: string, cfg: Required<ContractifyConfig>) {
	const patterns = cfg.include.length ? cfg.include : ["**/*.contract.ts"]
	const ignore = cfg.exclude ?? ["**/_generated.ts", "**/*.d.ts"]

	const files = await globby(patterns, {
		cwd: contractsDir,
		absolute: true,
		ignore,
	})

	return files
}
