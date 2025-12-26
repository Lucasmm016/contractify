import { z } from 'zod'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD'

// Mais flexível: permite response ser objeto, array, union, etc.
export type ContractMethodSpec = {
    query?: z.ZodTypeAny
    body?: z.ZodTypeAny
    params?: z.ZodTypeAny
    response: {
        success: z.ZodTypeAny
        error: z.ZodTypeAny
    }
}

export type ContractShape = {
    route: string
    methods: Partial<Record<HttpMethod, ContractMethodSpec>>
}