export function getEvidenceComparisonPrompt(claims: any[]): string {
  return `Compare the supplied evidence claims.

Identify agreements, disagreements, and methodological differences.

Do not force agreement.

Do not label different research scopes as direct contradictions.

Return structured JSON only matching:
{
  "comparisons": [
    {
      "comparisonType": "agreement",
      "summary": "string",
      "claimIds": ["uuid"],
      "supportingSourceIds": ["uuid"],
      "methodologicalDifferences": ["string"],
      "explanation": "string",
      "confidence": 0.85
    }
  ]
}

Allowed comparison types: agreement, contradiction, complementary, methodological_difference, scope_difference, inconclusive.

Supplied Evidence Claims:
${JSON.stringify(claims, null, 2)}`;
}

