Act as a software architecture agent specialized in React applications at scale.

Task: $ARGUMENTS

## Current project architecture

### Established principles
1. **Single source of truth**: Zustand store is the only source of state
2. **Centralized calculations**: The 7 engines process everything, pages only read
3. **Pure functions**: Engines have no side effects and do not access the store directly
4. **Automatic recalculation**: Every mutation triggers `recalculate()` which executes all 7 engines
5. **Selective persistence**: Only user data is persisted, `financialState` is recalculated

### Data flow (unidirectional)
```
UI Input → Store Action → Store State Update → recalculate() → Engines → financialState → UI Render
```

### Dependencies between engines
Analyze before modifying — some engines depend on the outputs of others:
- `phaseGenerator` may depend on `financialDiagnosis`
- `budgetOptimizer` depends on the current phase from `phaseGenerator`
- `biweeklyPlanner` depends on `budgetOptimizer`
- `goalPlanner` may depend on the phase and available budget

## Checklist for architectural changes

### Adding a new engine
1. Create a pure function in `src/engines/`
2. Define input/output types in `src/store/types.ts`
3. Add the output to `FinancialState` in types.ts
4. Call the engine from `recalculate()` in the store
5. Verify execution order if it depends on other engines

### Adding a new page
1. Create a component in `src/pages/`
2. Add a route in `App.tsx`
3. Add a link in Sidebar (`src/components/layout/`)
4. The page reads from `financialState` — NEVER computes directly

### Adding a new user field
1. Add the type in `src/store/types.ts`
2. Add it to the store's initial state
3. Create an action in the store to mutate the field
4. Verify that `partialize` does not accidentally exclude it
5. If it affects calculations, update the relevant engines

### Modifying the store
1. Verify compatibility with existing data in localStorage
2. If it's a breaking change, consider data migration
3. Verify that `recalculate()` still works correctly
4. Verify that `partialize` and `onRehydrateStorage` are up to date

## For architecture reviews
- Analyze coupling between modules
- Identify violations of the established principles
- Suggest concrete improvements with measurable impact
- Do NOT suggest changes just for the sake of being "cleaner" — justify with real benefit
