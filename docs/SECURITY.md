# Cybersecurity & Data Protection Policy

---

## 1. Authentication & Session Security
- Supabase Auth provides password hashing (bcrypt) and session JWTs.
- Access tokens expire periodically with automated client-side refresh.
- Passwords require a minimum length of 8 characters.

---

## 2. Row Level Security & Storage Isolation
- All tables have RLS enabled.
- Storage objects are stored in the private bucket `research-documents`.
- User isolation guarantees that user A cannot view, query, or delete user B's records.

---

## 3. Server-Side Security
- Express uses `helmet` for HTTP security headers (CSP, HSTS, X-Content-Type-Options, etc.).
- `cors` allowlist restricts incoming origins.
- `express-rate-limit` prevents brute-force abuse and API flooding.
- Request payload limits are capped at 20MB.

---

## 4. AI Security & Guardrails
- API keys reside solely on the backend environment.
- Prompt injection protection: documents and web text are treated as untrusted research data and isolated from system directives.
- Structured output is parsed through strict Zod schemas before being saved or displayed.

