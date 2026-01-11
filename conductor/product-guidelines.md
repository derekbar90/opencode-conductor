# Product Guidelines: OpenCode Conductor Plugin

## Brand Identity

### Core Messaging Pillars

Conductor's brand messaging encompasses three interconnected themes that speak to different aspects of the development workflow:

#### 1. Discipline and Rigor
**Message**: "Measure twice, code once."

Conductor enforces structured processes, formal specifications, and controlled development. We emphasize:
- The value of planning before implementation
- Preventing technical debt through disciplined workflows
- The cost savings of catching issues during specification vs. implementation
- Mandatory protocols that cannot be bypassed

#### 2. Empowerment and Confidence
**Message**: "Build with certainty."

Conductor gives developers confidence through better planning and persistent context awareness. We highlight:
- Reduced cognitive load through maintained project context
- Clear roadmaps that eliminate "What was I building?" moments
- Autonomous implementation that follows the plan you approved
- Smart revert capabilities that make experimentation safe

#### 3. Team Alignment and Consistency
**Message**: "One team, one standard."

Conductor helps teams maintain shared standards and collaborative practices. We focus on:
- Consistent development workflows across all team members
- Shared project constitution that everyone follows
- Clear audit trail for architectural decisions
- Synchronized context that persists across team member sessions

### Positioning Statement

"Conductor transforms OpenCode from a reactive coding assistant into a proactive project architect. For development teams who need consistent architectural standards and rigorous specification protocols, Conductor enforces a Context-Driven Development lifecycle where every code change is driven by formal specifications and tracked implementation plans."

## Prose Style Guidelines

### Adaptive Tone Strategy

Conductor uses different tones based on context:

#### Professional and Authoritative (Protocol Enforcement)
Use when enforcing workflows, validating specifications, or announcing architectural decisions:
- Clear, directive language
- Technical precision
- Confident assertions
- Example: "Specification validation complete. Proceeding to plan generation."
- Example: "Protocol enforcement: Test coverage must reach 80% before task completion."

#### Conversational and Friendly (Interactive Guidance)
Use during Q&A sessions, setup wizards, and collaborative planning:
- Approachable language
- Helpful explanations
- Encouraging feedback
- Example: "Great! Now let's define your tech stack. I've detected TypeScript and Node.js. Is this correct?"
- Example: "That's a solid choice. This workflow will help ensure your tests are written before implementation."

#### Neutral and Efficient (Information Collection)
Use when simply gathering structured input without commentary:
- Concise questions
- Clear options
- Minimal embellishment
- Example: "Select workflow preference: A) Commit after each task, B) Commit after each phase."
- Example: "Tech stack confirmation required. Enter: A) Confirmed, B) Modify."

### Voice Characteristics

**Do:**
- Use active voice: "Conductor generates the plan" not "The plan is generated"
- Be specific: "Add 3 user stories" not "Add more detail"
- Use present tense for current actions: "Creating track artifacts..."
- Use imperative for commands: "Review the specification below"

**Don't:**
- Use uncertain language: "maybe", "possibly", "might want to"
- Over-explain during protocol execution (save education for errors)
- Use jargon without context (define terms on first use)
- Apologize for enforcing protocols (that's the product value)

## Error Messages and Validation Feedback

Conductor uses a tiered approach to error messaging based on context and severity:

### Tier 1: Instructive and Actionable (Critical Path Blockers)
For errors that block workflow progression, provide immediate fix instructions:

```
❌ Specification validation failed.

**Missing Required Sections:**
- User Stories (minimum 1 required)
- Acceptance Criteria

**Action Required:**
Run `/c-new` to regenerate the specification, or manually add these sections to `conductor/tracks/<track_id>/spec.md` and re-run validation.
```

### Tier 2: Contextual and Educational (Learning Opportunities)
For errors related to protocol understanding or first-time setup issues:

```
⚠️ Test coverage below threshold (current: 65%, required: 80%)

**Why This Matters:**
The workflow.md file specifies 80% test coverage to ensure code quality and reduce regression risk. Higher coverage gives the team confidence during refactoring and prevents production bugs.

**How to Fix:**
Add tests for the following uncovered functions:
- `parseTrackMetadata()` in utils/stateManager.ts
- `validateSpecification()` in commands/newTrack.ts

Then re-run the test suite: `npm test`
```

### Tier 3: Brief with References (Minor Issues or Repeated Errors)
For non-critical issues or when users have seen the educational version:

```
⚠️ Spec validation warning: Missing user stories.
See workflow.md § 3.2 for specification requirements.
```

### Error Message Structure
All error messages should follow this structure when appropriate:
1. **Status indicator** (❌ for blocking, ⚠️ for warnings)
2. **What went wrong** (one clear sentence)
3. **Why it matters** (educational context when using Tier 2)
4. **How to fix** (specific actionable steps)
5. **Reference** (link to relevant documentation)

## Visual and Formatting Standards

### Document Structure Hierarchy

All Conductor-generated documents follow consistent markdown hierarchy:

```markdown
# Document Title (H1 - used once per document)

## Major Section (H2 - primary divisions)

### Subsection (H3 - detailed breakdowns)

#### Minor Detail (H4 - rarely used, only for deep nesting)
```

### Formatting Conventions

**Separators:**
Use `---` to create visual breaks between major sections:
```markdown
## Section 1
Content here...

---

## Section 2
Content here...
```

**Lists:**
- Use bullet points for unordered items
- Use numbered lists only for sequential steps
- Maintain consistent indentation (2 spaces)
- Use checkboxes `- [ ]` for tasks in plan.md

**Code Blocks:**
Always specify language for syntax highlighting:
```markdown
\`\`\`typescript
// Good: Language specified
const example = "hello";
\`\`\`

\`\`\`
// Avoid: No language specified
const example = "hello";
\`\`\`
```

**Emphasis:**
- Use **bold** for key terms, actions, or emphasis
- Use *italics* for secondary emphasis or file paths
- Use `code formatting` for file names, commands, or technical terms

**Tables:**
Use markdown tables for structured comparisons:
```markdown
| Command | Description |
| :--- | :--- |
| `/c-setup` | Initialize project |
| `/c-new` | Create new track |
```

**Links:**
Use descriptive link text, not raw URLs:
- Good: `See the [workflow documentation](./workflow.md) for details.`
- Avoid: `See ./workflow.md for details.`

### Status Indicators

Use consistent symbols for status across all outputs:

- ✅ **Completed** - Tasks, phases, or tracks that are done
- ❌ **Failed/Blocked** - Critical errors that prevent progression
- ⚠️ **Warning** - Non-blocking issues that need attention
- 🚀 **In Progress** - Currently executing work
- 📋 **Pending** - Queued work not yet started
- 🔄 **Modified** - Changed or updated items
- 💡 **Info/Tip** - Helpful suggestions or context

### File Naming Conventions

All Conductor artifacts use consistent naming:
- `product.md` - Product vision and features (lowercase, no underscores)
- `product-guidelines.md` - Style and brand guidelines (hyphens for multi-word)
- `tech-stack.md` - Technology stack documentation
- `workflow.md` - Development workflow rules
- `tracks.md` - Master track index
- `spec.md` - Track specification (within track directory)
- `plan.md` - Implementation plan (within track directory)
- `metadata.json` - Track metadata (lowercase extension)

## Documentation Standards

### README and User-Facing Docs
- Lead with value proposition in first paragraph
- Use emoji sparingly in headings for visual navigation (🚀, 🛠️, 📦)
- Include code examples for every feature
- Provide "Quick Start" section within first 3 sections

### Technical Documentation
- Assume reader has intermediate development knowledge
- Define domain-specific terms (e.g., "Track", "Phase", "Protocol")
- Include file paths as examples: `conductor/tracks/<track_id>/spec.md`
- Reference related sections: "See Section 2.3 for details"

### Specification Documents (spec.md)
Required sections in order:
1. Overview
2. User Stories
3. Requirements (Functional and Non-Functional)
4. Acceptance Criteria
5. Dependencies and Constraints

### Implementation Plans (plan.md)
Required structure:
```markdown
# Implementation Plan: [Track Title]

## Phase 1: [Phase Name]
- [ ] Task 1: Description
- [ ] Task 2: Description
- [ ] Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2: [Phase Name]
...
```

## Interaction Design

### Interactive Q&A Sessions

During setup, specification, and planning phases, Conductor uses structured interactions:

**Question Format:**
```markdown
**Question N: [Clear question text]** (Select all that apply)

A) [Option A with brief explanation]
B) [Option B with brief explanation]
C) [Option C with brief explanation]
D) Type your own answer
E) Autogenerate and review [document name]

Please respond with your choice(s).
```

**Response Handling:**
- **Guide tone** when introducing new concepts or asking complex questions
- **Neutral tone** when collecting simple structured data
- Always confirm user's choice before proceeding: "Perfect! You've selected: [choice]"
- Summarize multi-select responses clearly

### Progress Communication

Keep users informed during automated processes:

```markdown
🚀 Generating implementation plan...
✅ Plan generated: 3 phases, 12 tasks

📋 Writing artifacts...
✅ Created: conductor/tracks/auth_20260106/spec.md
✅ Created: conductor/tracks/auth_20260106/plan.md
✅ Created: conductor/tracks/auth_20260106/metadata.json

✅ Track "User Authentication Flow" is ready for implementation.
```

## Brand Voice Examples

### Example 1: Welcome Message (Guide Tone)
```
Welcome to Conductor. I will guide you through the following steps to set up your project:

1. **Project Discovery:** Analyze the current directory to determine if this is a new or existing project.
2. **Product Definition:** Collaboratively define the product's vision, design guidelines, and technology stack.
3. **Configuration:** Select appropriate code style guides and customize your development workflow.
4. **Track Generation:** Define the initial track and automatically generate a detailed plan.

Let's get started!
```

### Example 2: Protocol Enforcement (Professional Tone)
```
Protocol enforcement: Test-Driven Development required.

Each feature task will be structured as:
1. Write tests first
2. Implement feature to pass tests
3. Verify coverage meets 80% threshold

This workflow is defined in conductor/workflow.md and cannot be bypassed.
```

### Example 3: Error with Education (Contextual Tone)
```
⚠️ Specification incomplete: Missing acceptance criteria

**Why This Matters:**
Acceptance criteria define "done" for your feature. Without them, the implementation phase lacks clear success conditions, leading to scope creep and ambiguous completion status.

**What to Include:**
- Observable outcomes that indicate the feature works
- Edge cases and error conditions
- Performance or quality thresholds

**Example:**
- User can log in with valid credentials within 2 seconds
- Invalid credentials show error message within 1 second
- Session persists for 24 hours

Please add acceptance criteria to the specification.
```

## Consistency Checklist

Before publishing any user-facing content, verify:

- [ ] Tone matches context (professional/conversational/neutral)
- [ ] Brand messaging aligns with one of three pillars
- [ ] Error messages include actionable fix instructions
- [ ] Markdown follows hierarchy and formatting standards
- [ ] Status indicators use consistent symbols
- [ ] File names follow conventions
- [ ] Links use descriptive text, not raw URLs
- [ ] Code blocks specify language
- [ ] No uncertain language ("maybe", "possibly")
- [ ] Active voice used throughout
