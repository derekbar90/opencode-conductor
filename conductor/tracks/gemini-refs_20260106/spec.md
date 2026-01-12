# Specification: Update Gemini CLI References to OpenCode Terminology

## Overview

This track addresses a critical branding and user experience issue: the OpenCode Conductor plugin still contains multiple references to "Gemini CLI" throughout its codebase, prompts, and user-facing messages. Since the plugin has been migrated to work with OpenCode, all references to the legacy Gemini CLI system must be updated to use correct OpenCode terminology to avoid user confusion and maintain brand consistency.

## User Stories

### Story 1: As a Developer Using OpenCode
**As a** developer using the OpenCode Conductor plugin  
**I want** all messages and prompts to reference OpenCode (not Gemini CLI)  
**So that** I'm not confused about which tool I'm actually using and can trust the documentation

**Acceptance Criteria:**
- All interactive prompts use "OpenCode" terminology
- Error messages reference OpenCode tools and paths
- No mentions of "Gemini CLI" appear in user-facing text

### Story 2: As a New User Reading Documentation
**As a** new user exploring the Conductor plugin  
**I want** consistent terminology throughout all documentation  
**So that** I can understand the plugin's ecosystem without encountering contradictory references

**Acceptance Criteria:**
- Setup messages reference OpenCode configuration paths
- Examples use OpenCode command patterns
- Help text mentions OpenCode-specific features

### Story 3: As a Plugin Maintainer
**As a** maintainer of the Conductor plugin  
**I want** a clear audit trail of all legacy references  
**So that** future updates don't reintroduce Gemini CLI terminology

**Acceptance Criteria:**
- All TOML prompt files are updated
- All Markdown documentation is updated
- Code comments referencing Gemini are updated or removed

## Requirements

### Functional Requirements

**FR1: Update Prompt Files**
- Update all `.toml` files in `src/prompts/` to replace "Gemini CLI" with "OpenCode"
- Update interactive messages that mention "Gemini CLI built-in option"
- Ensure prompts reference OpenCode-specific features (e.g., "external editor" instead of "Modify with external editor")

**FR2: Update Command Documentation**
- Review all `.md` files in `src/prompts/commands/` for Gemini references
- Update setup instructions to reference OpenCode configuration
- Correct file path examples (e.g., `~/.config/opencode/` not `~/.config/gemini/`)

**FR3: Update Command Handlers**
- Search TypeScript files in `src/commands/` for hardcoded strings mentioning Gemini
- Update any user-facing messages in command handlers
- Review error messages and warnings for legacy terminology

**FR4: Update Legacy Documentation**
- Check `legacy/` directory for any documentation that should be updated or archived
- Add deprecation notices if legacy Gemini files are kept for reference

**FR5: Update Templates**
- Review workflow and style guide templates for Gemini CLI references
- Ensure templates use OpenCode terminology consistently

### Non-Functional Requirements

**NFR1: Backward Compatibility**
- Changes should not break existing Conductor workflows
- Track metadata format remains unchanged
- State management files maintain compatibility

**NFR2: Consistency**
- All terminology changes follow the same pattern
- "OpenCode" capitalization is consistent (not "opencode" or "Open Code")
- File paths use correct OpenCode config locations

**NFR3: Completeness**
- All user-facing text is updated
- Internal comments are updated or clarified
- No half-updated messages remain

## Acceptance Criteria

### Primary Acceptance Criteria

1. **Zero Gemini CLI References in User-Facing Text**
   - Run global search for "Gemini CLI" in all prompt files
   - Verify no results in `.toml`, `.md` prompt files
   - Check interactive Q&A messages during setup phase

2. **Correct OpenCode Terminology**
   - All messages reference "OpenCode" when discussing the platform
   - Configuration paths use `~/.config/opencode/` format
   - Examples and help text mention OpenCode features

3. **Updated Legacy Directory**
   - `legacy/` directory files are reviewed
   - Deprecation notices added where appropriate
   - Clear separation between archived and active code

4. **Documentation Consistency**
   - README.md uses consistent terminology
   - INSTALL.md references correct configuration paths
   - CONTRIBUTING.md mentions OpenCode development workflow

5. **Code Comment Updates**
   - Internal comments clarify the Gemini → OpenCode migration
   - No misleading comments referencing Gemini CLI remain
   - Future maintainers understand the historical context

### Verification Methods

**Manual Testing:**
1. Run `/c-setup` and verify all messages reference OpenCode
2. Trigger an error condition and check error message terminology
3. Review generated workflow.md and other artifacts for legacy references

**Code Review:**
1. Grep for "Gemini" case-insensitive across entire codebase
2. Review each result to determine if it needs updating
3. Distinguish between historical references (comments) vs user-facing text

**Documentation Review:**
1. Read through README.md as a new user
2. Follow INSTALL.md instructions and verify paths are correct
3. Check that all examples work with OpenCode

## Dependencies and Constraints

### Dependencies
- None - this is a documentation and messaging update with no external dependencies

### Constraints

**Constraint 1: Preserve Historical Context**
- Some references to Gemini may need to remain in comments for historical context
- The `legacy/` directory specifically documents the Gemini CLI version
- Commit messages and CHANGELOG.md should retain historical Gemini mentions

**Constraint 2: No Breaking Changes**
- This track should not alter any APIs, file formats, or command behavior
- Only user-facing strings and documentation change
- Existing conductor/ directories and state files remain compatible

**Constraint 3: Brand Guidelines Compliance**
- All updates must follow the product-guidelines.md prose style
- Use the "Professional and Authoritative" tone for protocol messages
- Use the "Conversational and Friendly" tone for interactive guidance

## Out of Scope

The following items are explicitly **not** included in this track:

❌ Renaming any files or directories  
❌ Changing the plugin's functional behavior  
❌ Updating the plugin's npm package name  
❌ Modifying the Git commit history or CHANGELOG.md  
❌ Adding new features or functionality  
❌ Refactoring code structure or architecture  

## Success Metrics

**Quantitative:**
- Zero instances of "Gemini CLI" in user-facing prompts and messages
- All 5+ command prompts updated and verified
- 100% of setup flow messages use OpenCode terminology

**Qualitative:**
- New users report no confusion about which tool they're using
- Documentation reads consistently throughout
- Brand identity is strengthened through consistent terminology
