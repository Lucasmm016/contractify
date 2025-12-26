import path from "node:path"

export function renderGeneratedTs(args: {
	contractsDir: string
	// paths absolutos dos contracts
	contractFiles: string[]
	// imports relativos (./x)
	importEntries: { importName: string; importPath: string }[]
}) {
	const { importEntries } = args

	const importLines = importEntries
		.map((e) => `import ${e.importName} from "${e.importPath}"`)
		.join("\n")

	return `// ⚠️ Arquivo gerado automaticamente. Não edite manualmente.

${importLines}

export const contracts = {
${importEntries.map((e) => `  [${e.importName}.route]: ${e.importName},`).join("\n")}
} as const

export type ContractsMap = typeof contracts
export type Route = keyof ContractsMap

export type MethodsOf<R extends Route> = Extract<keyof ContractsMap[R]["methods"], string>

// Tipos distributivos: robustos quando R é genérico/unions
export type MethodSpec<R extends Route, M extends string> =
  R extends Route
    ? M extends keyof ContractsMap[R]["methods"]
      ? NonNullable<ContractsMap[R]["methods"][M]>
      : never
    : never

export type QuerySchema<R extends Route, M extends string> =
  MethodSpec<R, M> extends { query?: infer Q } ? Q : undefined

export type BodySchema<R extends Route, M extends string> =
  MethodSpec<R, M> extends { body?: infer B } ? B : undefined

export type ParamsSchema<R extends Route, M extends string> =
  MethodSpec<R, M> extends { params?: infer P } ? P : undefined

export type SuccessSchema<R extends Route, M extends string> =
  MethodSpec<R, M> extends { response: { success: infer S } } ? S : never

export type ErrorSchema<R extends Route, M extends string> =
  MethodSpec<R, M> extends { response: { error: infer E } } ? E : never
`
}
