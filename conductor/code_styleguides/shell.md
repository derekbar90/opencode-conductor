# Shell Style Guide Summary (Bash)

This document outlines best practices for writing clean, safe, and maintainable shell scripts, based on the Google Shell Style Guide and common idiomatic patterns.

## 1. General Principles
- **Shebang**: Use `#!/bin/bash` or `#!/usr/bin/env bash`.
- **Portability**: If you don't need Bash-specific features, use `#!/bin/sh`.
- **Fail Fast**: Use `set -euo pipefail` at the beginning of scripts to exit on errors, unset variables, and pipeline failures.

## 2. Naming Conventions
- **Files**: `snake_case` with `.sh` extension.
- **Variables**: `snake_case` for local variables. `UPPERCASE` for constants and environment variables.
- **Functions**: `snake_case`.

## 3. Formatting
- **Indentation**: 2 spaces.
- **Line Length**: Limit to 80 characters where possible.
- **Functions**: Use the standard `function_name() { ... }` syntax.

## 4. Safety and Robustness
- **Quoting**: Always quote variables that contain filenames or user input (e.g., `"$file"`) to prevent word splitting and globbing.
- **Command Substitution**: Use `$(command)` instead of backticks.
- **Conditionals**: Use `[[ ... ]]` instead of `[ ... ]` or `test` for Bash scripts.
- **Local Variables**: Always use the `local` keyword inside functions.

## 5. Idiomatic Patterns
- **Main Function**: Put the script logic in a `main` function and call it at the bottom.
- **Logging**: Use a dedicated `log` or `error` function for consistent output.
- **Check for Existence**: Always check if a command exists before using it (e.g., `command -v git >/dev/null 2>&1`).

## 6. Documentation
- **Header**: Include a brief description, usage examples, and author information at the top of the script.
- **Comments**: Use `#` to explain *why* complex commands are used.

*Source: [Google Shell Style Guide](https://google.github.io/styleguide/shellguide.html)*
