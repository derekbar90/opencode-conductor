# Testing

This project uses [Vitest](https://vitest.dev/) for testing.

## Setup

Install dependencies:

```bash
npm install
```

## Running Tests

Run all tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Run tests with coverage:

```bash
npm run test:coverage
```

## Test Structure

Tests are located alongside the source files with the `.test.ts` extension:

- `src/tools/commands.test.ts` - Tests for command tools

## Writing Tests

Tests use Vitest's API with TypeScript support. Example:

```typescript
import { describe, it, expect, vi } from "vitest"

describe("MyFeature", () => {
  it("should work correctly", () => {
    expect(true).toBe(true)
  })
})
```
