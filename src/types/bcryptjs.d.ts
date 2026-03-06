declare module 'bcryptjs' {
    export function hash(s: string, salt: number | string): Promise<string>
    export function hashSync(s: string, salt: number | string): string
    export function compare(s: string, hash: string): Promise<boolean>
    export function compareSync(s: string, hash: string): boolean
    export function genSalt(rounds?: number): Promise<string>
    export function genSaltSync(rounds?: number): string
}
