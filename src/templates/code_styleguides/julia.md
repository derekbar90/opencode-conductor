# Julia Style Guide Summary

This document summarizes key rules and best practices for Julia development, based on the official Julia Style Guide and common community patterns.

## 1. Naming Conventions
- **Variables**: `snake_case` (e.g., `user_id`).
- **Functions**: `snake_case` (e.g., `calculate_sum`).
- **Types (Modules, Types)**: `PascalCase` (e.g., `MemoryManager`).
- **Files**: `snake_case.jl` (e.g., `data_processing.jl`).
- **Mutating Functions**: Functions that modify their arguments should end with an exclamation mark (e.g., `sort!`).

## 2. Formatting
- **Indentation**: 4 spaces.
- **Line Length**: 92 characters limit is often recommended.
- **Braces**: Opening brace on the same line.

## 3. Idiomatic Julia
- **Type Annotations**: Avoid over-specifying types in function signatures unless needed for multiple dispatch.
- **Global Variables**: Avoid global variables where possible. Use `const` if globals are necessary.
- **Performance**: Use type-stable functions and avoid type-unstable constructs (like `Any` in performance-critical sections).
- **Arrays**: Indexing is 1-based. Use `eachindex(A)` for efficient iteration.

## 4. Documentation
- Use `""" ... """` for docstrings before function/type definitions.
- Document arguments, return values, and include examples.

*Source: [Official Julia Documentation - Style Guide](https://docs.julialang.org/en/v1/manual/style-guide/)*
