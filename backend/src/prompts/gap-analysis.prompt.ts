export function getGapAnalysisPrompt(sources: any[], claims: any[]): string {
  return `Identify potential research gaps in the collected evidence.

Do not claim exhaustive coverage of all existing literature.

Explain the evidence supporting each potential gap.

Suggest future research questions.

Return structured JSON only matching:
{
  "gaps": [
    {
      "title": "string",
      "description": "string",
      "relatedThemes": ["string"],
      "supportingSourceIds": ["uuid"],
      "supportingClaimIds": ["uuid"],
      "rationale": "string",
      "suggestedResearchQuestion": "string",
      "confidence": 0.80,
      "limitations": ["string"]
    }
  ]
}

Supplied Sources:
${JSON.stringify(sources, null, 2)}

Supplied Claims:
${JSON.stringify(claims, null, 2)}`;
}

