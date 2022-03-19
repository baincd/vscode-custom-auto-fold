export interface AutoFoldConfig {
    rules?: AutoFoldRule[],
    betweenCommandsDelay: number
}

export interface AutoFoldRule {
    linePattern: string,
    fileGlob?: string
}
