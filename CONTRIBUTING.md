# Contributing to D&D LazyDM

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Security Guidelines](#security-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Keep discussions professional

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Git
- Basic understanding of Next.js, React, and TypeScript

### Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR-USERNAME/dnd-lazydm.git
   cd dnd-lazydm
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create a branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

5. Start development server:
   ```bash
   npm run dev
   ```

## Development Workflow

### Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Adding tests
- `security/` - Security fixes

Examples:
- `feature/add-spell-slots`
- `fix/dice-roller-crash`
- `security/sanitize-campaign-names`

### Commit Messages

Follow conventional commits:

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance
- `security`: Security fix

Example:
```
feat(vtt): add token rotation feature

- Add rotation control to token editor
- Implement rotation rendering on canvas
- Add keyboard shortcut (R key)

Closes #123
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define interfaces for props and state
- Avoid `any` type - use proper types
- Use strict mode

### React

- Use functional components with hooks
- Prefer composition over inheritance
- Keep components small and focused
- Use proper dependency arrays in useEffect

### Naming Conventions

- Components: `PascalCase` (e.g., `DiceWidget.tsx`)
- Files: `kebab-case` (e.g., `dice-roller.ts`)
- Variables/functions: `camelCase` (e.g., `rollDice`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `MAX_DICE_ROLLS`)

### File Organization

```
src/
├── app/              # Next.js pages and routes
├── components/       # React components
│   └── feature/      # Group by feature
├── lib/              # Utilities and helpers
│   ├── stores/       # State management
│   ├── utils/        # Helper functions
│   └── validation/   # Validation schemas
└── types/            # TypeScript types
```

### Code Style

- Use 2 spaces for indentation
- Max line length: 100 characters
- Use semicolons
- Single quotes for strings
- Trailing commas in objects/arrays

```typescript
// Good
const character = {
  name: 'Gandalf',
  level: 20,
}

// Bad
const character = {
  name: "Gandalf",
  level: 20
};
```

## Security Guidelines

**CRITICAL:** All contributions must follow security best practices.

### Required Security Checks

1. **Input Validation**
   - Use Zod schemas from `src/lib/validation/schemas.ts`
   - Validate ALL user input
   - Never trust client data

   ```typescript
   import { CampaignSchema } from '@/lib/validation/schemas'

   const result = CampaignSchema.safeParse(data)
   if (!result.success) {
     return NextResponse.json({ error: result.error }, { status: 400 })
   }
   ```

2. **Path Sanitization**
   - Use utilities from `src/lib/utils/sanitize.ts`
   - NEVER use user input directly in file paths

   ```typescript
   import { sanitizeSlug } from '@/lib/utils/sanitize'

   const safePath = path.join(baseDir, sanitizeSlug(userInput))
   ```

3. **Authentication**
   - Check authentication on all protected routes
   - Verify ownership before modifying data
   - Use server-side sessions

4. **No Secrets in Code**
   - Never commit API keys, passwords, tokens
   - Use environment variables
   - Add to `.gitignore`

### Security Checklist

Before submitting a PR:

- [ ] Input validation added for all user inputs
- [ ] Path sanitization used for file operations
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities
- [ ] No CSRF vulnerabilities
- [ ] Authentication checks in place
- [ ] No secrets in code
- [ ] Error messages don't leak sensitive info

## Pull Request Process

### Before Submitting

1. **Test your changes**
   ```bash
   npm run dev     # Test locally
   npm run build   # Ensure it builds
   npm run lint    # Fix linting errors
   ```

2. **Update documentation**
   - Update README.md if needed
   - Add JSDoc comments for functions
   - Update DEPLOY.md if deployment changes

3. **Write descriptive PR description**
   - What problem does this solve?
   - How does it work?
   - Any breaking changes?
   - Screenshots for UI changes

### PR Requirements

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings or errors
- [ ] Security checklist completed
- [ ] Tested locally
- [ ] Linked to related issues

### Review Process

1. Automated checks must pass (linting, build)
2. Security review for any API/data changes
3. Code review by maintainer
4. Approval required before merge

## Testing

### Manual Testing

Required for all PRs:

1. Test the happy path
2. Test edge cases
3. Test error handling
4. Test on different browsers (Chrome, Firefox, Safari)
5. Test on mobile (if UI changes)

### Future: Automated Tests

We plan to add:
- Unit tests (Jest)
- Integration tests (Testing Library)
- E2E tests (Playwright)

Help us get there!

## Areas Needing Help

### High Priority

1. **Authentication Implementation**
   - NextAuth.js integration
   - User management
   - Session handling

2. **Security Hardening**
   - Apply validation to all API routes
   - Add rate limiting
   - Implement CSRF protection

3. **Testing**
   - Set up test framework
   - Write unit tests for utilities
   - Add integration tests for API routes

### Medium Priority

4. **Accessibility**
   - Improve screen reader support
   - Add keyboard navigation
   - ARIA labels

5. **Performance**
   - Optimize bundle size
   - Add caching
   - Lazy loading

6. **Documentation**
   - Video tutorials
   - API documentation
   - More examples

## Questions?

- Open an issue for discussion
- Review existing issues and PRs
- Check `PRODUCTION_AUDIT.md` for security context

## Recognition

Contributors will be:
- Listed in the project README
- Mentioned in release notes
- Credited in commit history

Thank you for making D&D LazyDM better! 🎲
