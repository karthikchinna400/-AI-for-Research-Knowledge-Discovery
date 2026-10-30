export function getReportGenerationPrompt(investigation: any, sources: any[], claims: any[], comparisons: any[], gaps: any[], themes: any[]): string {
  return `Generate a professional research report using the supplied investigation data.

Preserve factual accuracy.

Do not invent references or unsupported findings.

Include citations linked to actual source records.

Return structured JSON only matching:
{
  "title": "string",
  "executiveSummary": "string",
  "researchQuestion": "string",
  "objectives": ["string"],
  "methodology": "string",
  "sourcesReviewed": ["uuid"],
  "keyFindings": ["string"],
  "evidenceComparisons": ["string"],
  "contradictions": ["string"],
  "researchThemes": ["string"],
  "potentialResearchGaps": ["string"],
  "limitations": ["string"],
  "futureResearchDirections": ["string"],
  "references": [
    {
      "sourceId": "uuid",
      "citationText": "string"
    }
  ]
}

Investigation:
${JSON.stringify(investigation, null, 2)}

Sources:
${JSON.stringify(sources, null, 2)}

Evidence Claims:
${JSON.stringify(claims, null, 2)}

Comparisons:
${JSON.stringify(comparisons, null, 2)}

Themes:
${JSON.stringify(themes, null, 2)}

Gaps:
${JSON.stringify(gaps, null, 2)}`;
}

