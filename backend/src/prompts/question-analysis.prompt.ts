export function getQuestionAnalysisPrompt(question: string, domain: string, scope: string): string {
  return `Analyze the research question.

Identify its domain, objectives, concepts, keywords, limitations, and possible refinements.

Do not answer the research question yet.

Return structured JSON only matching this schema:
{
  "originalQuestion": "${question.replace(/"/g, '\\"')}",
  "refinedQuestion": "string",
  "primaryDomain": "${domain}",
  "secondaryDomains": ["string"],
  "objectives": ["string"],
  "keywords": ["string"],
  "relatedConcepts": ["string"],
  "suggestedSearchQueries": ["string"],
  "scopeConcerns": ["string"],
  "clarificationNeeded": false,
  "clarificationQuestions": ["string"]
}

Target Scope: ${scope}
User Question: "${question}"`;
}

