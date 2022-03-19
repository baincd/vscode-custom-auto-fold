export interface AutoFoldConfig {
    rules?: AutoFoldRule[],
    delay: number,
    betweenCommandsDelay: number
}

export interface AutoFoldRule {
    linePattern: string,
    fileGlob?: string,
    firstMatchOnly: boolean
}
