Act as a UI/UX agent specialized in financial applications with dark mode.

Review or implement UI changes: $ARGUMENTS

## Project design principles
- **Dark mode first**: bg-gray-950 as the base background, text-gray-100 for main text
- **Semantic colors**: green=positive/income, red=danger/debts, yellow=warning, blue=info, purple=goals
- **Visual hierarchy**: Cards with bg-gray-900 over the background, subtle borders with border-gray-800
- **Consistency**: All shared components in `src/components/shared/`
- **Responsive**: Mobile-first, functional from 320px to 1920px
- **Accessibility**: Minimum AA contrast, labels on all inputs, visible focus states

## Checklist for new components
1. Use Tailwind v4 classes (NOT v3)
2. Dark mode by default — do not use `dark:` prefix, the design is already dark
3. Use `formatCurrency()` from utils/formatters.ts for amounts
4. Use `nanoid()` from components/shared/nanoid.ts for IDs
5. Use existing shared/ components (Card, ProgressBar, Alert, Modal)
6. Verify on mobile (use Tailwind responsive utilities)
7. Maintain consistency with the existing design of other pages

## Checklist for UI review
1. Color contrast — is it readable on bg-gray-950?
2. Consistent spacing — does it use the project's standard gap/padding?
3. Empty states — what is shown when there is no data?
4. Loading states — is there visual feedback during calculations?
5. Overflow — do long texts or large numbers break the layout?
6. Responsive — does it work on mobile, tablet, and desktop?
7. Recharts — do charts adapt to the container and use semantic colors?

## For implementation
- Read existing similar components before creating something new
- Reuse UI patterns already established in the project
- Do not install new UI dependencies without justification
- Run `npm run typecheck` after the changes
