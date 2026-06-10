<!--
  PR title MUST start with one of these tags (drives the auto version bump):
    [FIX]         — Bug fix                        → patch
    [ENHANCEMENT] — Small improvement              → patch
    [PERF]        — Performance improvement        → patch
    [QA]          — Test / tooling instrumentation → patch
    [FEATURE]     — New feature                     → minor
    [CLEANUP]     — Code cleanup                    → minor
    [REFACTOR]    — Refactor / breaking change      → major

  Example: [FIX] Drain pending queue when register() runs before ready
-->

## Description

<!-- Describe what this PR does and why. -->

## Related Issues

<!-- Link issues closed or addressed by this PR (one per line, 0 or more). -->
<!-- Example: Closes #42 -->

## Changelog

<!-- AUTOFILL:CHANGELOG:START -->
<!-- Required. Auto-filled from your CHANGELOG.md ## [Unreleased] entries (technical detail). -->
<!-- AUTOFILL:CHANGELOG:END -->

## Release Notes

<!-- AUTOFILL:RELEASE_NOTES:START -->
<!-- Required. Auto-filled from your RELEASE_NOTES.md ## [Unreleased] entries (user-facing). -->
<!-- Release bodies are extracted from this file at tag time. -->
<!-- AUTOFILL:RELEASE_NOTES:END -->

## Type of Change

<!-- At least ONE of the first three rows MUST be checked. -->

- [ ] Refactor / breaking change (`[REFACTOR]`)
- [ ] New feature / Code cleanup (`[FEATURE]`, `[CLEANUP]`)
- [ ] Bug fix / Enhancement / QA / Performance (`[FIX]`, `[ENHANCEMENT]`, `[QA]`, `[PERF]`)
- [ ] Documentation update
- [ ] Build / CI change

## Checklist

- [ ] My PR title starts with `[FIX]`, `[ENHANCEMENT]`, `[PERF]`, `[QA]`, `[REFACTOR]`, `[CLEANUP]`, or `[FEATURE]`.
- [ ] I added my changes to `CHANGELOG.md` and `RELEASE_NOTES.md` under `## [Unreleased]`.
- [ ] I have read [CONTRIBUTING.md](../CONTRIBUTING.md).
- [ ] My code follows the project's code style (2 spaces, semicolons, double quotes).
- [ ] I ran `pnpm run check` (typecheck + lint + test) with no errors.
- [ ] I ran `pnpm run build` with no errors.

## Additional Notes

<!-- Anything else reviewers should know. -->
