# 📘 Pull Request Guide

Complete guide for Pull Request conventions and best practices for this project.

---

## 📋 Table of Contents

1. [Branch Naming](#-branch-naming)
2. [Pull Request Naming](#-pull-request-naming)
3. [Commits - Conventional Commits](#-commits---conventional-commits)
4. [Pull Request Size](#-pull-request-size)
5. [Complete Workflow](#-complete-workflow)
6. [Pre-submission Checklist](#-pre-submission-checklist)
7. [Review Process](#-review-process)
8. [Practical Examples](#-practical-examples)

---

## 🌿 Branch Naming

### Format

```
<type>/<issue-number>-<descriptive-slug>
```

### Branch Types (Full Names Required)

| Type             | Usage                                       | Example                                  |
| ---------------- | ------------------------------------------- | ---------------------------------------- |
| `feature/`       | New features and functionality              | `feature/42-vertex-ai-integration`       |
| `bugfix/`        | Bug fixes and patches                       | `bugfix/15-api-timeout-error`            |
| `hotfix/`        | Critical production fixes                   | `hotfix/88-security-patch`               |
| `documentation/` | Documentation updates                       | `documentation/23-api-endpoint-docs`     |
| `refactor/`      | Code refactoring without functional changes | `refactor/56-cleanup-agent-service`      |
| `performance/`   | Performance optimizations                   | `performance/34-reduce-api-latency`      |
| `security/`      | Security improvements                       | `security/67-add-input-validation`       |
| `accessibility/` | Accessibility enhancements                  | `accessibility/12-screen-reader-support` |
| `maintenance/`   | Maintenance and cleanup tasks               | `maintenance/45-update-dependencies`     |
| `ci/`            | Continuous integration updates              | `ci/78-add-github-actions`               |
| `test/`          | Test additions or improvements              | `test/91-add-unit-tests-agent`           |

### Best Practices

✅ **Good:**

```bash
feature/42-add-gemini-endpoint
bugfix/15-fix-cloud-run-deployment
documentation/23-update-readme-setup
```

❌ **Bad:**

```bash
feat/my-feature          # Use full type name
fix-bug                  # Missing issue number
feature/add-stuff        # Missing issue number, vague description
```

### Creating a Branch

```bash
# From main/develop
git checkout main
git pull origin main
git checkout -b feature/42-add-gemini-endpoint
```

---

## 🏷️ Pull Request Naming

### Format

```
M[milestone-number] - Issue [issue-number]: [optional description]
```

### Structure Breakdown

- **M[milestone-number]**: The milestone this PR belongs to
- **Issue [issue-number]**: The issue number being addressed
- **[optional description]**: Brief description for context (optional but recommended)

### Examples

✅ **Good:**

```
M1 - Issue 42: Add Vertex AI Gemini integration
M2 - Issue 15: Fix Cloud Run timeout on /agent endpoint
M1 - Issue 23: Update README with deployment instructions
M3 - Issue 67
```

❌ **Bad:**

```
Add feature                    # Missing milestone and issue
M1 - Added some stuff         # Missing issue reference
Issue 42                       # Missing milestone
Fix bug in API                # Missing milestone and issue number
```

### Special Cases

**Multiple Issues (Avoid if possible):**

```
M1 - Issue 42, Issue 43: Refactor agent service
```

_Note: Try to keep PRs focused on a single issue. If multiple issues are related, consider grouping them into a single larger issue._

**Hotfixes:**

```
M2 - Issue 88: HOTFIX - Critical security patch
```

---

## 📝 Commits - Conventional Commits

We use **Conventional Commits** specification **without the footer**.

### Format

```
<type>(<scope>): <description>

[optional body]
```

**No footer required** (no "BREAKING CHANGE:", "Refs:", etc.)

### Commit Types

| Type       | Description                               | Example                                  |
| ---------- | ----------------------------------------- | ---------------------------------------- |
| `feat`     | New feature                               | `feat(api): add /agent endpoint`         |
| `fix`      | Bug fix                                   | `fix(deploy): resolve Cloud Run timeout` |
| `docs`     | Documentation only                        | `docs(readme): add setup instructions`   |
| `style`    | Code style (formatting, semicolons, etc.) | `style(api): format with black`          |
| `refactor` | Code refactoring                          | `refactor(agent): extract prompt logic`  |
| `perf`     | Performance improvement                   | `perf(api): optimize Vertex AI calls`    |
| `test`     | Adding or updating tests                  | `test(agent): add unit tests for prompt` |
| `build`    | Build system or dependencies              | `build: add fastapi dependency`          |
| `ci`       | CI/CD changes                             | `ci: add Cloud Run deployment workflow`  |
| `chore`    | Other changes (maintenance)               | `chore: update .gitignore`               |

### Scope (Optional but Recommended)

The scope is the module/component affected:

- `api`, `agent`, `frontend`, `deploy`, `infra`, `docs`, `prompts`

### Description Guidelines

- Use imperative mood: "add" not "added" or "adds"
- Don't capitalize first letter
- No period at the end
- Keep it concise (max 72 characters)

### Body (Optional)

Add more context if needed. Wrap at 72 characters per line.

### Examples

✅ **Good:**

```bash
feat(api): add /agent endpoint with Gemini integration

fix(deploy): increase Cloud Run timeout to 300s

docs(readme): add local development setup guide

refactor(agent): extract prompt templates to separate file

perf(api): cache Vertex AI client initialization

test(agent): add integration tests for Gemini responses
```

❌ **Bad:**

```bash
Added feature                           # Not imperative, no type
Fix.                                    # Too vague, period at end
feat(api): Added the new endpoint.     # Not imperative, period at end
Updated some files                      # No type, too vague
BREAKING CHANGE: new API               # No footer allowed
```

### Atomic Commits

Make commits **atomic** - each commit should represent a single logical change:

✅ **Good:**

```bash
git commit -m "feat(api): add FastAPI router"
git commit -m "feat(api): add /agent endpoint handler"
git commit -m "test(api): add tests for /agent endpoint"
```

❌ **Bad:**

```bash
git commit -m "feat(api): add FastAPI, create endpoints, add tests, update docs"
```

---

## 📏 Pull Request Size

### The 400 Lines Rule

**Maximum 400 lines modified per PR** (excluding documentation files)

This ensures:

- ✅ Faster and more thorough code reviews
- ✅ Easier to understand and test changes
- ✅ Reduced risk of bugs
- ✅ Better Git history
- ✅ Anti "vibe coding" outside of documentation

### What Counts Toward the Limit?

**Counted:**

- Python, JavaScript, TypeScript code
- Configuration files (YAML, JSON, TOML)
- Dockerfiles
- Shell scripts

**Excluded:**

- `*.md` files (documentation)
- Files in `docs/` directory
- `README.md`
- License files
- Generated files (lock files, build outputs)

### Checking Your PR Size

```bash
# Count lines changed (excluding docs)
git diff main --stat | grep -v '\.md$' | grep -v 'docs/'

# Or use GitHub's PR interface
```

### What If You Exceed 400 Lines?

1. **Split into multiple PRs** - Break down into logical, sequential changes
2. **Justify in PR description** - Explain why it can't be split (rare cases)
3. **Ask for guidance** - Discuss with the team before opening the PR

### Example: Splitting a Large PR

**❌ Bad (800 lines):**

```
M1 - Issue 42: Complete Vertex AI integration with tests and docs
```

**✅ Good (4 smaller PRs):**

```
M1 - Issue 42: Add Vertex AI client configuration (100 lines)
M1 - Issue 42: Implement agent service with Gemini (200 lines)
M1 - Issue 42: Add /agent API endpoint (150 lines)
M1 - Issue 42: Add integration tests for agent (200 lines)
```

---

## 🔄 Complete Workflow

### 1. Before Starting Work

```bash
# Ensure you're on main and up to date
git checkout main
git pull origin main

# Create your branch
git checkout -b feature/42-add-gemini-endpoint
```

### 2. During Development

```bash
# Make atomic commits regularly
git add src/api/agent.py
git commit -m "feat(api): add agent endpoint handler"

git add tests/test_agent.py
git commit -m "test(api): add tests for agent endpoint"

# Keep your branch updated
git fetch origin
git rebase origin/main
```

### 3. Before Creating PR

```bash
# Final rebase on main
git fetch origin
git rebase origin/main

# Ensure tests pass
pytest
flake8
black --check .

# Push your branch
git push origin feature/42-add-gemini-endpoint
```

### 4. Creating the PR

1. Go to GitHub and create a new Pull Request
2. Use the template that auto-populates
3. Fill in all sections thoroughly
4. Ensure title follows: `M[n] - Issue [n]: [description]`
5. Request reviewers
6. Link the issue (`Closes #42`)

### 5. During Review

- Respond to all comments
- Make requested changes in new commits (don't force push)
- Re-request review after changes
- Keep the conversation constructive

### 6. Merging

```bash
# Once approved, squash and merge (preferred) or merge
# Delete branch after merging
git branch -d feature/42-add-gemini-endpoint
git push origin --delete feature/42-add-gemini-endpoint
```

---

## ✅ Pre-submission Checklist

Before opening your PR, verify:

### Code Quality

- [ ] Code follows project conventions
- [ ] No linting errors (`flake8`, `eslint`)
- [ ] Code is formatted (`black`, `prettier`)
- [ ] No commented-out code blocks
- [ ] No debug print statements
- [ ] No hardcoded values (use env vars)

### Testing

- [ ] All tests pass locally
- [ ] New tests added for new functionality
- [ ] Edge cases covered
- [ ] Manual testing performed

### Security & Privacy

- [ ] No secrets or API keys in code
- [ ] User inputs validated
- [ ] No sensitive data logged
- [ ] GDPR considerations addressed

### Documentation

- [ ] README updated if needed
- [ ] Code comments for complex logic
- [ ] API docs updated (if applicable)

### Git Hygiene

- [ ] Branch is up to date with main
- [ ] Commit messages follow Conventional Commits
- [ ] No merge conflicts
- [ ] Less than 400 lines modified (excluding docs)

### PR Description

- [ ] Title follows naming convention
- [ ] All template sections filled
- [ ] Milestone and issue referenced
- [ ] Test scenarios described
- [ ] Screenshots added (if UI changes)

---

## 👁️ Review Process

### For Authors

**Be responsive:**

- Respond to comments within 24 hours
- Ask for clarification if feedback is unclear
- Don't take feedback personally - it's about the code

**Making changes:**

```bash
# Make requested changes
git add <files>
git commit -m "fix(api): address review comments"
git push origin feature/42-add-gemini-endpoint

# Re-request review on GitHub
```

### For Reviewers

**Review checklist:**

- [ ] Code logic is correct and efficient
- [ ] Tests are adequate
- [ ] No security vulnerabilities
- [ ] Follows project conventions
- [ ] Documentation is clear
- [ ] PR size is reasonable
- [ ] Commit history is clean

**Providing feedback:**

- Be constructive and specific
- Explain the "why" behind suggestions
- Use GitHub's suggestion feature for minor fixes
- Approve if minor changes needed, request changes for major issues

**Review priorities:**

1. **P0 (Blocker)**: Security issues, critical bugs, broken functionality
2. **P1 (Required)**: Logic errors, missing tests, convention violations
3. **P2 (Suggested)**: Optimizations, style improvements, nice-to-haves

---

## 📚 Practical Examples

### Example 1: Simple Feature

**Scenario:** Adding a new endpoint to the API

**Branch:**

```bash
feature/42-add-health-check-endpoint
```

**Commits:**

```bash
feat(api): add health check endpoint
test(api): add tests for health check
docs(api): document health check endpoint
```

**PR Title:**

```
M1 - Issue 42: Add health check endpoint
```

**PR Size:** ~80 lines (well under 400)

---

### Example 2: Bug Fix

**Scenario:** Fixing a timeout issue on Cloud Run

**Branch:**

```bash
bugfix/15-fix-cloud-run-timeout
```

**Commits:**

```bash
fix(deploy): increase Cloud Run timeout to 300s
fix(api): add request timeout handling
test(api): add timeout integration test
```

**PR Title:**

```
M2 - Issue 15: Fix Cloud Run timeout on agent endpoint
```

**PR Size:** ~120 lines

---

### Example 3: Large Feature (Split)

**Scenario:** Complete Vertex AI integration (would be 600+ lines)

**Split into 3 PRs:**

**PR 1:**

```
Branch: feature/42-vertex-ai-config
Title: M1 - Issue 42: Add Vertex AI client configuration
Size: ~150 lines
```

**PR 2:**

```
Branch: feature/42-vertex-ai-agent-service
Title: M1 - Issue 42: Implement agent service with Gemini
Size: ~250 lines
Depends on: PR 1
```

**PR 3:**

```
Branch: feature/42-vertex-ai-api-endpoint
Title: M1 - Issue 42: Add /agent API endpoint
Size: ~180 lines
Depends on: PR 2
```

---

### Example 4: Documentation Update

**Scenario:** Updating README with new deployment steps

**Branch:**

```bash
documentation/23-update-deployment-docs
```

**Commits:**

```bash
docs(readme): add Cloud Run deployment section
docs(readme): add environment variables guide
docs(infra): document Dockerfile configuration
```

**PR Title:**

```
M1 - Issue 23: Update README with deployment instructions
```

**PR Size:** ~400 lines (docs excluded from count)

---

### Example 5: Refactoring

**Scenario:** Extracting prompt logic into a separate module

**Branch:**

```bash
refactor/56-extract-prompt-service
```

**Commits:**

```bash
refactor(agent): create prompts service module
refactor(agent): migrate prompts to new service
test(agent): update tests for prompt service
docs(prompts): add prompt engineering guidelines
```

**PR Title:**

```
M2 - Issue 56: Extract prompt logic to dedicated service
```

**PR Size:** ~280 lines

---

## 🎯 Hackathon-Specific Reminders

Always consider the evaluation criteria when working on PRs:

### Human Experience

- Does this improve user interaction?
- Is the API intuitive?
- Are error messages helpful?

### Data Management

- How is data processed and stored?
- Is data flow efficient?
- Are we handling data correctly?

### Privacy by Design

- No PII in logs
- Data minimization principle
- User consent mechanisms
- Secure data transmission

### Scalability

- Will this scale on Cloud Run?
- Resource usage optimized?
- Caching strategies considered?
- Can handle increased load?

---

## 📞 Getting Help

If you're unsure about:

- Branch naming → Check the examples above
- PR size → Ask in the team chat before starting
- Commit messages → Use the type tables as reference
- Review feedback → Ask the reviewer for clarification

**Remember:** Good PRs make everyone's life easier. Take the time to do it right! 🚀

---

## 🔗 Additional Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Effective Pull Requests](https://www.pullrequest.com/blog/writing-a-great-pull-request-description/)
- [GitHub Best Practices](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests)

---

**Last updated:** October 2025  
**Maintained by:** Erreur 404 - Hackathon Team
