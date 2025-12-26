import process from "node:process"
import { generate } from "./cli/generate.js"

const cmd = process.argv[2]

async function main() {
	if (cmd === "generate") {
		const projectRoot = process.cwd()
		const { outFile, count } = await generate(projectRoot)
		console.log(`contractify: gerado ${outFile} (${count} contract(s))`)
		return
	}

	console.log(`contractify

Uso:
  contractify generate
`)
	process.exitCode = 1
}

main().catch((err) => {
	console.error(err)
	process.exitCode = 1
})
