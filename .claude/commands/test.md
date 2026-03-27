Act as a testing agent specialized in React + TypeScript.

Task: $ARGUMENTS

## Testing strategy for this project

### Calculation engines (src/engines/) — HIGH PRIORITY
Engines are pure functions, ideal for unit tests:
- `financialDiagnosis.ts` → test with different profiles (no debts, heavily indebted, balanced)
- `debtStrategy.ts` → test avalanche vs snowball, edge cases (0 debts, 1 debt, many)
- `phaseGenerator.ts` → test that it generates correct phases based on the situation
- `budgetOptimizer.ts` → test that the budget does not exceed income
- `biweeklyPlanner.ts` → test that biweekly distribution sums correctly
- `goalPlanner.ts` → test sequential vs parallel, coherent dates
- `emergencyFundCalculator.ts` → test projection and levels

### Business rules — CRITICAL
- Debts >1.5%/month are prioritized before savings
- Emergency fund after high debt, before goals
- Never suggest paying less than the minimum
- Buffer of 3-5% of income always present

### Store (src/store/) — MEDIUM PRIORITY
- Test that recalculate() is triggered on each mutation
- Test that persist excludes financialState
- Test rehydration from localStorage

### Components — LOW PRIORITY (only if requested)
- Test rendering without errors
- Test key interactions (onboarding flow, adding debt, etc.)

## Testing setup
If no test configuration exists:
1. Suggest installing Vitest (compatible with Vite) + @testing-library/react
2. Configure vitest in vite.config.ts
3. Create test files alongside source files (colocation)
4. Naming: `*.test.ts` for engines, `*.test.tsx` for components

## Test format
```typescript
import { describe, it, expect } from 'vitest'

describe('ModuleName', () => {
  describe('functionName', () => {
    it('should [expected behavior] when [condition]', () => {
      // Arrange → Act → Assert
    })
  })
})
```

Always run the tests after writing them to verify they pass.
