Act as a deployment agent specialized in Vercel + Vite + React.

Task: $ARGUMENTS

## Vercel configuration for this project

### Deploy stack
- **Framework**: Vite (detected automatically by Vercel)
- **Build command**: `npm run build` (tsc + vite build)
- **Output directory**: `dist`
- **Node version**: 22 (defined in .nvmrc)
- **Install command**: `npm install`

### Pre-deploy checklist
1. `npm run typecheck` — no TypeScript errors
2. `npm run build` — successful build without critical warnings
3. Verify that `.gitignore` includes: node_modules, dist, .env*
4. Verify that there are no native dependencies that fail on Linux (Vercel uses Linux)
5. Verify that `lightningcss` is in devDependencies (required for Tailwind v4 on Vercel)

### Known issues with Vercel
- **lightningcss**: Needs to be explicit in devDependencies because Vercel uses Linux and native binaries differ from Windows
- **Node version**: .nvmrc must match the Vercel config
- **Vite v8**: If there are issues, verify compatibility with the Vercel environment

### Diagnosing deploy failures
If the deploy fails:
1. Check the Vercel build log (`vercel logs` or dashboard)
2. Common causes:
   - **Install fails**: Peer dependency conflicts → check package.json
   - **Build fails**: TypeScript errors → run typecheck locally
   - **Runtime fails**: Missing environment variables → check Vercel env vars
   - **Native bindings**: lightningcss/esbuild → verify they are in deps

### Recommended configurations

#### vercel.json (if needed)
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

#### SPA Routing
React Router requires all routes to redirect to index.html. Vercel handles this automatically for Vite projects, but if there are 404 issues on direct routes, add the rewrite above.

### Operations
- **Verify deploy**: Run a local build and report if it's ready for deploy
- **Diagnose failure**: Analyze error logs and propose a fix
- **Optimize bundle**: Analyze build size and suggest optimizations
- **Configure headers**: Add security and cache headers
