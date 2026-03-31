Refactor the indicated code: $ARGUMENTS

Principles:
1. Read ALL the context before touching anything — understand the dependencies
2. Keep the same public interface (exports, props, types) unless the user asks to change it
3. Verify that the 7 calculation engines still receive the same inputs
4. Ensure the store still calls recalculate() correctly
5. Run `npm run typecheck` after each significant change

Rules:
- Do NOT rename exports without updating all imports
- Do NOT move files without updating all references
- Do NOT add unnecessary abstractions — less code > more code
- Keep engine functions as pure functions
- If the refactor touches types.ts, verify ALL files that import from it
