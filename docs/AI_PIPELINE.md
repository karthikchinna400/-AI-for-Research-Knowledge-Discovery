# AI Pipeline & Epistemic Traceability

The AI pipeline is designed around **Intellectual Traceability** rather than open-ended ungrounded text generation.

---

## 1. Google Gemini SDK Integration
- Official SDK: `@google/genai`
- Models:
  - Generative Reasoning: `gemini-2.0-flash`
  - Semantic Embeddings: `text-embedding-004` (768 dimensions)

---

## 2. 10 Core AI Tasks & Structured Zod Schemas

1. **Question Analysis:**
   - Input: Natural language query, target domain, and scope.
   - Output: Refined research question, domain keywords, scope boundaries, and clarification needs.
2. **Search Query Generation:**
   - Generates diverse Boolean and keyword queries targeting Crossref, OpenAlex, Semantic Scholar, and Tavily.
3. **Source Normalization:**
   - Normalizes heterogeneous provider formats while preserving DOIs, venues, and author lists.
4. **Evidence Extraction:**
   - Extracts structured empirical claims, findings, methods, sample sizes, and limitations.
5. **Evidence Comparison:**
   - Identifies agreements, genuine contradictions, and differences in scope or measurement.
6. **Research Gap Identification:**
   - Identifies potential gaps bounded strictly by the reviewed evidence corpus.
7. **Research Theme Detection:**
   - Clusters related findings into thematic concepts.
8. **Knowledge Graph Generation:**
   - Generates typed entities and relationships for visual rendering.
9. **Copilot RAG Answer:**
   - Retrieves document chunks and claims to provide citation-backed conversational answers.
10. **Report Generation:**
    - Generates complete synthesis reports with executive summary and real bibliographic citations.

---

## 3. Strict Rules Against Fabrication
- Real DOIs and provider source IDs only.
- Peer-review status is only declared when verifiable in provider metadata.
- Preprints are explicitly distinguished from peer-reviewed works.
- Research gaps are explicitly framed as absences within the reviewed collection rather than universal scientific claims.

