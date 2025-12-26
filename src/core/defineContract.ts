import type { ContractShape } from "./types.js"

/**
 * Helper pra preservar literais (route e métodos) e garantir o shape do contrato.
 * Por enquanto ele só retorna o input, mas ele "trava" o tipo corretamente.
 */
export function defineContract<const T extends ContractShape>(contract: T): T {
    return contract
}