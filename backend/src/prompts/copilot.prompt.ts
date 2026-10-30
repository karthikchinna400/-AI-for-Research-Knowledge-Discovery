export function getCopilotPrompt(
  question: string,
  evidenceClaims: any[],
  sources: any[],
  chunks: any[],
  conversationHistory: any[]
): string {
  return `Answer the user's question using only the supplied retrieved evidence.

Include supporting citations.

Clearly distinguish:
- Direct evidence.
- Interpretation.
- Uncertainty.
- Missing information.

If the evidence is insufficient, say so explicitly.

Return structured JSON only matching:
{
  "answer": "string",
  "keyPoints": ["string"],
  "evidenceClaims": [
    {
      "claimId": "uuid",
      "sourceIds": ["uuid"],
      "explanation": "string"
    }
  ],
  "limitations": ["string"],
  "uncertainties": ["string"],
  "followUpQuestions": ["string"],
  "evidenceSufficient": true
}

User Question: "${question}"

Conversation Context:
${JSON.stringify(conversationHistory.slice(-4), null, 2)}

Retrieved Evidence Claims:
${JSON.stringify(evidenceClaims, null, 2)}

Retrieved Sources:
${JSON.stringify(sources, null, 2)}

Document Passages:
${JSON.stringify(chunks, null, 2)}`;
}

