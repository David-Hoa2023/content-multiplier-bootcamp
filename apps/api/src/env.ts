export const env = {
    DATABASE_URL: process.env.DATABASE_URL!,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
    OPENAI_MODEL: process.env.OPENAI_MODEL || process.env.LLM_MODEL || 'gpt-4o-mini',
    OPENAI_EMBEDDING_MODEL: process.env.OPENAI_EMBEDDING_MODEL || process.env.EMBEDDING_MODEL || 'text-embedding-3-small',
    EMBEDDING_MODEL: process.env.EMBEDDING_MODEL || 'text-embedding-3-small',
    LLM_MODEL: process.env.LLM_MODEL || 'gpt-4o-mini',
    PORT: process.env.PORT || '3001'
};
