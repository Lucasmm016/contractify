import axios, { type AxiosInstance } from "axios"
import { z } from "zod"
import type { HttpMethod } from "../core/types.js"

type ContractsRuntime = Record<
	string,
	{
		route: string
		methods: Partial<
			Record<
				HttpMethod,
				{
					query?: z.ZodTypeAny
					body?: z.ZodTypeAny
					params?: z.ZodTypeAny
					response: { success: z.ZodTypeAny; error: z.ZodTypeAny }
				}
			>
		>
	}
>

type CommonOptions = {
	headers?: Record<string, string>
	signal?: AbortSignal
}

// helpers: incluir key somente se existir schema
type WithQuery<Q> = Q extends z.ZodTypeAny ? { query: z.infer<Q> } : Record<never, never>
type WithBody<B> = B extends z.ZodTypeAny ? { body: z.infer<B> } : Record<never, never>
type WithParams<P> = P extends z.ZodTypeAny ? { params: z.infer<P> } : Record<never, never>

type RouteOf<C extends ContractsRuntime> = keyof C & string
type MethodOf<C extends ContractsRuntime, R extends RouteOf<C>> =
	keyof C[R]["methods"] & HttpMethod

type MethodSpec<
	C extends ContractsRuntime,
	R extends RouteOf<C>,
	M extends HttpMethod
> =
	R extends RouteOf<C>
	? M extends keyof C[R]["methods"]
	? NonNullable<C[R]["methods"][M]>
	: never
	: never

type QuerySchema<C extends ContractsRuntime, R extends RouteOf<C>, M extends HttpMethod> =
	MethodSpec<C, R, M> extends { query?: infer Q } ? Q : undefined

type BodySchema<C extends ContractsRuntime, R extends RouteOf<C>, M extends HttpMethod> =
	MethodSpec<C, R, M> extends { body?: infer B } ? B : undefined

type ParamsSchema<C extends ContractsRuntime, R extends RouteOf<C>, M extends HttpMethod> =
	MethodSpec<C, R, M> extends { params?: infer P } ? P : undefined

type SuccessSchema<C extends ContractsRuntime, R extends RouteOf<C>, M extends HttpMethod> =
	MethodSpec<C, R, M> extends { response: { success: infer S } } ? S : never

export type ApiOptions<
	C extends ContractsRuntime,
	R extends RouteOf<C>,
	M extends HttpMethod
> =
	CommonOptions &
	WithQuery<QuerySchema<C, R, M>> &
	WithBody<BodySchema<C, R, M>> &
	WithParams<ParamsSchema<C, R, M>>

export type ApiClient<C extends ContractsRuntime> = {
	get<R extends RouteOf<C>>(route: R, options: ApiOptions<C, R, "GET">): Promise<z.infer<SuccessSchema<C, R, "GET">>>
	post<R extends RouteOf<C>>(route: R, options: ApiOptions<C, R, "POST">): Promise<z.infer<SuccessSchema<C, R, "POST">>>
	put<R extends RouteOf<C>>(route: R, options: ApiOptions<C, R, "PUT">): Promise<z.infer<SuccessSchema<C, R, "PUT">>>
	patch<R extends RouteOf<C>>(route: R, options: ApiOptions<C, R, "PATCH">): Promise<z.infer<SuccessSchema<C, R, "PATCH">>>
	delete<R extends RouteOf<C>>(route: R, options: ApiOptions<C, R, "DELETE">): Promise<z.infer<SuccessSchema<C, R, "DELETE">>>

	request<R extends RouteOf<C>, M extends MethodOf<C, R>>(
		route: R,
		method: M,
		options: ApiOptions<C, R, M>
	): Promise<z.infer<SuccessSchema<C, R, M>>>
}

export function createApi<const C extends ContractsRuntime>(args: {
	axios: AxiosInstance
	contracts: C
	validateResponses?: boolean // default: dev only
}): ApiClient<C> {
	const validateResponses =
		args.validateResponses ?? process.env.NODE_ENV !== "production"

	async function request<R extends RouteOf<C>, M extends MethodOf<C, R>>(
		route: R,
		method: M,
		options: ApiOptions<C, R, M>
	): Promise<any> {
		const contract = args.contracts[route]
		const spec = contract?.methods?.[method] as any
		if (!spec) throw new Error(`Contract method not found: ${String(route)} ${String(method)}`)

		// validar inputs
		const query = spec.query ? spec.query.parse((options as any).query) : undefined
		const body = spec.body ? spec.body.parse((options as any).body) : undefined
		const params = spec.params ? spec.params.parse((options as any).params) : undefined

		// axios: query -> params
		const res = await args.axios.request({
			url: route,
			method,
			params: query,
			data: body,
			headers: (options as any).headers,
			signal: (options as any).signal,
		})

		const data = res.data
		const successSchema: z.ZodTypeAny = spec.response.success

		return validateResponses ? successSchema.parse(data) : data
	}

	return {
		request,
		get: (route, options) => request(route, "GET" as any, options as any),
		post: (route, options) => request(route, "POST" as any, options as any),
		put: (route, options) => request(route, "PUT" as any, options as any),
		patch: (route, options) => request(route, "PATCH" as any, options as any),
		delete: (route, options) => request(route, "DELETE" as any, options as any),
	} as ApiClient<C>
}
