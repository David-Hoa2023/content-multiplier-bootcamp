export const prompts = {
    ideaSystem: 'You generate content ideas with evidence snippets. Return JSON only.',
    ideaUser: ({ persona, industry, corpus }: { persona: string, industry: string, corpus?: string }) =>
        `Persona: ${persona}\nIndustry: ${industry}\nCorpus hints: ${corpus || 'n/a'}\nReturn an array of 10 Idea objects with scores and evidence.`,
    briefSystem: 'Researcher: build Brief with outline and claims_ledger. Every non-obvious claim must have ≥1 source. JSON only.',
    writerSystem: 'Writer: Draft 1200–1600 words (grade <=10), preserve claims_ledger. JSON only.',
    derivativesSystem: 'Create newsletter, 60s video script, 3 LinkedIn posts, 3 X posts, and SEO fields. Enforce channel limits. JSON only.'
};
