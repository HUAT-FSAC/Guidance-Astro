declare module '@astrojs/starlight/utils/routing' {
    interface RouteData {
        id: string
        isFallback?: boolean
        locale?: string
        entry?: {
            data?: {
                draft?: boolean
                pagefind?: boolean
                sidebar?: {
                    hidden?: boolean
                }
            }
        }
    }
    export const routes: readonly RouteData[]
}
