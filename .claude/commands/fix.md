Diagnose and fix the problem described by the user: $ARGUMENTS

Process:
1. Reproduce the context — read the files relevant to the problem
2. Identify the root cause (not just the symptom)
3. Verify if the fix can break other parts of the system:
   - Does it affect the Zustand store? → Verify recalculate()
   - Does it affect a calculation engine? → Verify engine inputs/outputs
   - Does it affect a component? → Verify props and state
4. Apply the minimum necessary fix
5. Run `npm run typecheck` to verify no errors were introduced
6. Explain what changed and why

IMPORTANT: Do not refactor code that is not related to the bug.
