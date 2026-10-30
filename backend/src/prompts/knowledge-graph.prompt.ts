export function getKnowledgeGraphPrompt(sources: any[], claims: any[], themes: any[], gaps: any[]): string {
  return `Create a knowledge graph from the supplied sources, claims, themes, and gaps.

Only create relationships supported by metadata or explicitly identified inference.

Return structured JSON only matching:
{
  "entities": [
    {
      "entityType": "research_theme",
      "name": "string",
      "description": "string",
      "metadata": {}
    }
  ],
  "relationships": [
    {
      "sourceEntityId": "uuid",
      "targetEntityId": "uuid",
      "relationshipType": "supports",
      "explanation": "string",
      "supportingSourceIds": ["uuid"],
      "confidence": 0.85
    }
  ]
}

Entity types: research_question, publication, author, research_theme, claim, method, dataset, research_gap, concept.
Relationship types: supports, contradicts, extends, evaluates, utilizes, authored_by, identifies_gap, belongs_to, relates_to.

Input Data:
${JSON.stringify({ sources, claims, themes, gaps }, null, 2)}`;
}

