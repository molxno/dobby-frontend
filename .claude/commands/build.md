Run the full project build pipeline:

1. Run `npm run typecheck` to verify TypeScript types
2. If there are type errors, analyze them and suggest concrete fixes
3. If types pass, run `npm run build` for a production build
4. Report the result: bundle size, warnings, and errors if any
5. If the build fails, diagnose the root cause and propose the solution

Report format:
- ✅/❌ TypeScript check
- ✅/❌ Vite build
- Total bundle size
- Relevant warnings (ignore trivial ones)
