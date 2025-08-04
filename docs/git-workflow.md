# Git Workflow & Commit Standards

This document defines the git workflow, commit message standards, and development practices that must be followed for all stories and features in this project.

## Commit Message Format

### Required Format
```
(type)[feature-name] Brief summary of changes

Optional detailed description explaining:
- What was changed
- Why it was changed
- Any breaking changes or important notes
```

### Examples
```bash
# Good commit messages
git commit -m "(feat)[coin-list-view] Add CoinCard component with TypeScript interfaces"
git commit -m "(feat)[coin-list-view] Implement useCoins hook with SWR integration"
git commit -m "(test)[coin-list-view] Add unit tests for CoinCard component rendering"
git commit -m "(fix)[coin-list-view] Handle null data gracefully in coin price display"
git commit -m "(style)[coin-list-view] Apply Tailwind responsive styles to coin cards"
git commit -m "(refactor)[coin-list-view] Extract pagination logic into reusable hook"

# With detailed description
git commit -m "(feat)[coin-list-view] Add Pagination component with state management

- Implements next/previous navigation
- Handles edge cases for first/last page
- Integrates with useCoins hook for data fetching
- Includes responsive Tailwind styling for mobile/desktop"
```

## Commit Types

| Type | Description | When to Use |
|------|-------------|-------------|
| `feat` | New feature implementation | Adding new functionality, components, hooks |
| `fix` | Bug fixes | Fixing errors, handling edge cases, correcting logic |
| `test` | Testing related | Adding tests, updating test configuration |
| `style` | Code styling/formatting | CSS/Tailwind changes, code formatting |
| `refactor` | Code refactoring | Improving code structure without changing functionality |
| `docs` | Documentation | README updates, code comments, documentation files |
| `config` | Configuration changes | Package.json, tsconfig, eslint, prettier setup |
| `chore` | Maintenance tasks | Dependency updates, build configuration |

## Feature Names Convention

Feature names should match the story/epic being worked on:

- **Story 1.1 (Coin List View)**: `[coin-list-view]`
- **Story 1.2 (Search Bar)**: `[search-bar]`
- **Story 1.3 (Market Cap Filter)**: `[market-cap-filter]`
- **Story 1.4 (Pagination)**: `[pagination-controls]`
- **Story 1.5 (Coin Detail)**: `[coin-detail-view]`
- **Epic 2 (Charting)**: `[price-charts]`, `[history-range]`
- **Epic 3 (UI/State)**: `[theme-toggle]`, `[error-handling]`

## Commit Frequency

### Required Practices
- **Commit early and often**: Don't wait until a feature is complete
- **Logical units**: Each commit should represent one logical change
- **Working state**: Each commit should leave the code in a working state
- **Atomic commits**: One concept per commit (don't mix feature work with bug fixes)

### Recommended Commit Points
- ✅ After setting up initial configuration (TypeScript, ESLint, Prettier)
- ✅ After creating each component/hook file structure
- ✅ After implementing core functionality for a component
- ✅ After adding styling to a component
- ✅ After writing tests for a component/hook
- ✅ After fixing any bugs or issues discovered
- ✅ After completing integration between components

### Example Commit Sequence for Story 1.1
```bash
git commit -m "(config)[coin-list-view] Set up TypeScript, ESLint, and Prettier configuration"
git commit -m "(feat)[coin-list-view] Create basic CoinCard component structure with TypeScript interfaces"
git commit -m "(feat)[coin-list-view] Add coin data display logic to CoinCard component"
git commit -m "(style)[coin-list-view] Apply Tailwind responsive styling to CoinCard"
git commit -m "(feat)[coin-list-view] Implement useCoins hook with SWR integration"
git commit -m "(test)[coin-list-view] Add unit tests for CoinCard component"
git commit -m "(test)[coin-list-view] Add unit tests for useCoins hook with SWR mocking"
git commit -m "(feat)[coin-list-view] Create Pagination component with state management"
git commit -m "(feat)[coin-list-view] Integrate components in main page with error/loading states"
git commit -m "(test)[coin-list-view] Add integration tests for complete coin list view"
git commit -m "(fix)[coin-list-view] Handle edge cases in pagination for empty data sets"
```

## Quality Requirements

### Pre-commit Validation
Every commit must pass:
- ✅ ESLint rules (`npm run lint`)
- ✅ Prettier formatting (`npm run format:check`)
- ✅ TypeScript compilation (`npm run type-check`)
- ✅ Unit tests (`npm run test`)

### Commit Message Validation
- ✅ Must follow the required format: `(type)[feature-name] summary`
- ✅ Feature name must match current story/epic
- ✅ Summary must be descriptive and clear
- ✅ Should not exceed 72 characters for the summary line

## Branch Strategy

### Development Flow
- **Main Branch**: `main` - Production-ready code
- **Feature Branches**: `feature/story-1.1-coin-list-view` - Individual story development
- **Hot Fixes**: `hotfix/fix-description` - Critical production fixes

### Branch Naming Convention
```bash
# Story branches
feature/story-1.1-coin-list-view
feature/story-1.2-search-bar
feature/story-2.1-price-charts

# Epic branches (if needed)
feature/epic-1-core-browsing
feature/epic-2-charting

# Bug fix branches
fix/pagination-edge-case
fix/api-error-handling
```

## Tools & Automation

### Required Setup
- **Husky**: Git hooks for pre-commit validation
- **lint-staged**: Run linters on staged files only
- **Conventional Commits**: Validate commit message format
- **Commitizen**: Optional tool for guided commit messages

### Recommended Package.json Scripts
```json
{
  "scripts": {
    "commit": "cz",
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "type-check": "tsc --noEmit",
    "pre-commit": "lint-staged"
  }
}
```

---

**Last Updated**: 2025-08-04  
**Version**: 1.0  
**Applies to**: All stories and epics in this project