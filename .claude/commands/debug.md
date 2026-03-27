Act as an expert debugging agent for React + Zustand + TypeScript.

Diagnose the problem: $ARGUMENTS

## Debugging methodology

### 1. Gather context
- Read the files relevant to the reported problem
- Identify the data flow: Component → Store → Engine → Store → Component
- Verify the store state (which fields are involved)

### 2. Hypotheses and verification
- Formulate the 3 most likely hypotheses ordered by probability
- For each hypothesis, identify what to verify
- Systematically rule out hypotheses

### 3. Common failure points in this project
- **Store does not recalculate**: Is `recalculate()` called after the mutation?
- **Stale data in localStorage**: Did the store structure change but localStorage has the old version?
- **Engine receives undefined**: Did the onboarding not complete all required fields?
- **Incorrect type**: Is a string passed where a number is expected? (common in form inputs)
- **Recharts NaN**: Does the formatter receive a value that is not a number?
- **React Router**: Is the route registered in App.tsx?
- **Tailwind v4**: Is v3 syntax being used that doesn't work in v4?

### 4. Diagnosis
- Identify the exact root cause (file, line, condition)
- Explain WHY it happens, not just WHERE
- Propose the minimum necessary fix
- Verify that the fix does not break other flows

### 5. Verification
- Run `npm run typecheck` to ensure the fix compiles
- If the fix touches an engine, verify with sample data that the output is correct
- List the modified files and the impact of the change

Do NOT apply the fix without first explaining the diagnosis to the user.
