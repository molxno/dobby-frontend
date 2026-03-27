Act as a versioning and release management agent.

Task: $ARGUMENTS

## Versioning conventions

### Commits — Conventional Commits
```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New user-facing functionality
- `fix`: Bug fix
- `refactor`: Code change that neither adds a feature nor fixes a bug
- `perf`: Performance improvement
- `style`: Formatting/style changes (not CSS — code formatting)
- `docs`: Documentation
- `test`: Add or modify tests
- `chore`: Maintenance, deps, config
- `ci`: CI/CD changes

**Suggested scopes:**
- `engine`: Calculation engines
- `store`: Zustand store
- `ui`: Visual components
- `onboarding`: Onboarding wizard
- `dashboard`, `budget`, `debts`, `goals`, `biweekly`, `emergency`, `transactions`, `insights`, `settings`: Specific pages
- `deps`: Dependencies

### Branches
- `main`: Production (deployed on Vercel)
- `feat/<name>`: New features
- `fix/<name>`: Bug fixes
- `refactor/<name>`: Refactors

### Semantic versioning (package.json)
- MAJOR: Changes that break the localStorage structure (require migration)
- MINOR: New features, new pages, new engines
- PATCH: Bug fixes, UI improvements, optimizations

## Available operations

### Create release
1. Review commits since the last tag
2. Generate changelog grouped by type
3. Suggest the new version according to semver
4. Update version in package.json
5. Create release commit and tag

### Review history
1. Show recent commits organized by type
2. Identify if there are breaking changes
3. Suggest whether it's time to create a release

### Verify status
1. Verify current branch and working directory state
2. Show differences with main
3. Suggest actions (merge, rebase, squash)
