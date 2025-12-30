# C Style Guide Summary

This document summarizes key rules and best practices for C development, based on the GNU Coding Standards and common industrial practices.

## 1. Naming Conventions
- **Files**: `snake_case.c` and `snake_case.h`.
- **Functions**: `snake_case()` (e.g., `calculate_total`).
- **Variables**: `snake_case` (e.g., `user_id`).
- **Constants**: `UPPER_CASE_WITH_UNDERSCORES` (e.g., `BUFFER_SIZE`).
- **Types (typedefs)**: `snake_case_t` (e.g., `config_t`).

## 2. Formatting
- **Indentation**: 2 or 4 spaces (be consistent).
- **Braces**: Use the standard K&R style or Allman style, as long as it is consistent throughout the project.
- **Line Length**: Limit lines to 80 characters.

## 3. Programming Practices
- **Header Guards**: Always use `#ifndef HEADER_NAME_H` guards.
- **Memory Management**: Always check the return value of `malloc`, `calloc`, and `realloc`. Always `free` dynamically allocated memory.
- **Pointers**: Initialize pointers to `NULL` if they are not immediately assigned a valid address.
- **Error Handling**: Use return codes (e.g., `int` with `0` for success) for error propagation.

## 4. Documentation
- Use `/* ... */` for block comments.
- Use `//` for short, single-line comments (C99 and later).
- Document function parameters and return values in the header file.

*Source: [GNU Coding Standards](https://www.gnu.org/prep/standards/)*
