export function getSearchQueryPrompt(refinedQuestion: string, keywords: string[], domain: string): string {
  return `Generate diverse academic and professional search queries.

Use synonyms, related concepts, alternative terminology, and relevant research terminology.

Do not invent research sources.

Return structured JSON only matching:
{
  "queries": [
    {
      "query": "string",
      "purpose": "string",
      "domain": "string",
      "priority": "high"
    }
  ]
}

Refined Question: "${refinedQuestion}"
Keywords: ${JSON.stringify(keywords)}
Domain: ${domain}`;
}

