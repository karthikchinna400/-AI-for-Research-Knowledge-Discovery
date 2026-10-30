export function getEvidenceExtractionPrompt(sources: Array<{ id: string; title: string; abstract?: string | null; venue?: string | null }>): string {
  return `Extract research evidence from the supplied source content.

Only extract information explicitly supported by the content.

Do not infer missing sample sizes, statistics, methods, or findings.

Provide source and page references only when supplied.

Return structured JSON only matching:
{
  "claims": [
    {
      "claim": "string",
      "finding": "string",
      "supportingExcerpt": null,
      "pageNumber": null,
      "sectionName": null,
      "methodology": null,
      "population": null,
      "sampleSize": null,
      "datasetDescription": null,
      "evidenceCategory": "supporting",
      "evidenceType": "empirical",
      "limitations": ["string"],
      "confidence": 0.85,
      "sourceId": "uuid"
    }
  ]
}

Supplied Sources:
${JSON.stringify(sources, null, 2)}`;
}

