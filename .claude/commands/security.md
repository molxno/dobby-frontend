Act as a security agent specialized in React/TypeScript web applications.

Perform a security audit of the Financial Tutor project:

## Security checklist

### 1. Sensitive data on the client
- Look for financial data that should not be in localStorage without sanitization
- Verify that `tutor-financiero-store` does not store data that should be encrypted
- Look for tokens, API keys, or hardcoded secrets in the source code
- Review `.env` files and verify that `.gitignore` excludes them

### 2. XSS and sanitization
- Look for usage of `dangerouslySetInnerHTML` — if it exists, verify that the input is sanitized
- Verify that user inputs (amounts, names, notes) are sanitized before rendering
- Look for `eval()`, `Function()`, `document.write()`, or script injection

### 3. Dependencies
- Run `npm audit` to look for known vulnerabilities
- Review dependencies in package.json for versions with known CVEs
- Verify that there are no unnecessary dependencies that widen the attack surface

### 4. Financial data validation
- Verify that engines validate numeric inputs (no NaN, no Infinity, no negatives where not applicable)
- Look for potential division by zero in the calculation engines
- Verify that amounts are handled with adequate precision (no floating point issues with money)

### 5. Build configuration
- Verify that source maps are not included in production
- Review vite.config.ts for insecure configurations
- Verify recommended security headers for deployment

## Report format
For each finding:
- 🔴 Critical / 🟡 Medium / 🟢 Info
- File and line
- Risk description
- Recommended solution with code

At the end, provide a security score 0-100 and the top 3 priorities to resolve.
