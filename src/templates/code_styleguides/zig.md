# Zig Style Guide Summary

This document summarizes key rules and best practices for Zig development, based on the official Zig documentation and common community patterns.

## 1. Naming Conventions
- **Functions**: `camelCase` (e.g., `initStack`).
- **Variables**: `camelCase` (e.g., `userCounter`).
- **Types (Structs, Enums, Unions)**: `PascalCase` (e.g., `MemoryPool`).
- **Files**: `snake_case.zig` (e.g., `array_list.zig`).
- **Constants**: `Screaming_Snake_Case` is avoided; prefer `camelCase` or `PascalCase` depending on if it's a value or a type.

## 2. Formatting
- **Indentation**: 4 spaces.
- **Line Length**: 100 characters limit.
- **Braces**: Opening brace on the same line.

## 3. Idiomatic Zig
- **Error Handling**: Use `error` sets and the `!` operator. Prefer `try` and `catch` for explicit error handling.
- **Memory Management**: Use `Allocator` explicitly. Avoid global allocators.
- **Comptime**: Use `comptime` for generic programming and compile-time logic.
- **Optionals**: Use `?T` for values that can be null. Use `if (maybe_value) |value|` to unwrap.

## 4. Documentation
- Use `///` for doc comments.
- Use `//!` for top-level module documentation.

*Source: [Zig Documentation](https://ziglang.org/documentation/master/)*
