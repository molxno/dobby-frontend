Run TypeScript type verification:

1. Run `npm run typecheck`
2. If there are errors:
   - Group them by file
   - For each error, show the line, the error, and a fix suggestion
   - If they are simple type errors (missing types, wrong assignments), fix them directly
   - If they are design errors (incompatible types between modules), explain the problem and propose options
3. If there are no errors, confirm the project is clean

Do not modify `tsconfig.json` to silence errors. Fix the code, not the config.
