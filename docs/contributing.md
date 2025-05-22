
# Contributing Guidelines

Thank you for considering contributing to the ENGIE Energy Data Platform. This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Submitting Changes](#submitting-changes)
- [Code Review Process](#code-review-process)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

Our team is committed to providing a welcoming and inspiring community for all. We expect all contributors to adhere to the following principles:

- **Respect**: Treat everyone with respect and kindness
- **Openness**: Be open to collaboration and different perspectives
- **Responsibility**: Take responsibility for your work and actions
- **Community**: Support and mentor others in the community

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- Read the [Technical Documentation](./technical-documentation.md)
- Set up your local development environment per the [Installation Guide](./installation.md)
- Familiarized yourself with the [Database Setup](./database-setup.md)

### Setting Up for Development

1. Fork the repository
2. Clone your fork locally
3. Install dependencies
4. Set up local Supabase instance
5. Run the development server

## Development Workflow

We follow a feature branch workflow:

1. **Create a Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**: Implement your feature or fix

3. **Write Tests**: Add tests for your changes

4. **Update Documentation**: Update relevant documentation

5. **Commit Changes**:
   ```bash
   git commit -m "Description of changes"
   ```
   
   Follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation changes
   - `style:` for formatting changes
   - `refactor:` for code refactoring
   - `perf:` for performance improvements
   - `test:` for tests
   - `chore:` for build/CI tasks

6. **Push Changes**:
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create Pull Request**: Open a PR against the main branch

## Coding Standards

### General Guidelines

- Write clean, readable, and maintainable code
- Follow consistent naming conventions
- Keep functions small and focused
- Use TypeScript types to ensure type safety
- Document complex logic or algorithms

### React Guidelines

- Use functional components with hooks
- Keep components small and focused
- Use React Query for data fetching
- Separate UI from business logic
- Use proper error handling

### TypeScript Guidelines

- Use explicit types when inference is not clear
- Avoid `any` type when possible
- Create interfaces for component props
- Use TypeScript strictness features

### CSS/Styling Guidelines

- Use Tailwind CSS utility classes
- Follow consistent class naming
- Use responsive design principles
- Ensure accessibility of UI elements

## Submitting Changes

### Pull Request Process

1. Update the README or documentation if needed
2. Ensure all tests pass
3. Ensure code follows style guidelines
4. Request review from team members
5. Address review comments

### Pull Request Template

```markdown
## Description
[Description of the changes]

## Related Issue
[Link to related issue]

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## How Has This Been Tested?
[Description of testing process]

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
```

## Code Review Process

### Review Criteria

Reviewers will evaluate:
- Code quality and readability
- Test coverage
- Documentation completeness
- Performance considerations
- Security implications
- Accessibility

### Review Process

1. Reviewer examines code changes
2. Reviewer provides feedback
3. Contributor addresses feedback
4. Reviewer approves when issues are resolved

## Testing

### Test Requirements

All code changes should be accompanied by:
- Unit tests for individual functions
- Component tests for React components
- Integration tests for complex features

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- src/components/YourComponent.test.tsx

# Run tests with coverage
npm test -- --coverage
```

## Documentation

### Code Documentation

- Use JSDoc comments for functions
- Document complex algorithms
- Add inline comments for non-obvious code

### User Documentation

- Update [User Guide](./user-guide.md) for UI/UX changes
- Update [Technical Documentation](./technical-documentation.md) for architectural changes
- Update [Database Setup](./database-setup.md) for database changes

### Example Documentation

```typescript
/**
 * Calculates the total energy consumption for a given site and date range.
 * 
 * @param {string} siteId - UUID of the site
 * @param {Date} startDate - Start of the date range
 * @param {Date} endDate - End of the date range
 * @returns {Promise<number>} - Total energy consumption in kWh
 */
async function calculateTotalConsumption(siteId, startDate, endDate) {
  // Implementation
}
```

Thank you for contributing to the ENGIE Energy Data Platform!
