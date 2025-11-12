export type LLMParams = { model: string; system?: string; user: string; jsonSchema?: any; };
export interface LLMClient {
    completeJSON(p: LLMParams): Promise<any>;
    embed(input: string[]): Promise<number[][]>;
}

export function buildPrompt(jsonSchema?: any) {
    return jsonSchema
        ? `You must ONLY output JSON matching this JSON Schema:\n${JSON.stringify(jsonSchema)}`
        : '';
}
