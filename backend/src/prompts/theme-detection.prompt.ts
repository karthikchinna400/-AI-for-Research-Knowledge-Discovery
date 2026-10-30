export function getThemeDetectionPrompt(sources: any[], claims: any[]): string {
  return `Group related claims and sources into meaningful research themes.

Use the actual supplied research evidence.

Do not create unsupported themes.

Return structured JSON only matching:
{
  "themes": [
    {
      "name": "string",
      "description": "string",
      "keywords": ["string"],
      "sourceIds": ["uuid"],
      "claimIds": ["uuid"]
    }
  ]
}

Supplied Sources:
${JSON.stringify(sources, null, 2)}

Supplied Claims:
${JSON.stringify(claims, null, 2)}`;
}

