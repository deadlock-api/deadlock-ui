---
name: pr-visual-summary
description: Create concise screenshot-backed PR summaries for frontend/UI changes. Use when asked to compare a PR or branch against main, identify visual consequences of the diff, build a tiny playground, capture before/after screenshots, and write a pr_summary.html.
---

# PR Visual Summary

Motivation: help reviewers see what a UI PR actually changes without making them run the app or decode screenshots by guesswork. Start from the diff, find the user-visible consequences, then prove each one with the smallest real example. Put explanation in `pr_summary.html`; keep screenshots as clean evidence of the UI state.

Prefer high-signal artifacts over procedural ceremony.

1. Update `main`, switch to the target PR/branch, and inspect the diff against the correct base. Preserve unrelated local work.
2. Understand each meaningful UI/style change before designing examples. Pick real, targeted cases that make the consequence visible; use actual data/items/routes when possible.
3. Build both versions. Clone the base branch for comparison into a temp dir or otherwise keep base/PR artifacts separate.
4. Create a minimal capture harness, usually under `visual-regression/`, that renders only the element/state being compared. No explanatory copy inside screenshots.
5. Use the requested browser tool, commonly `agent-browser`, to capture paired screenshots. Hover/click/set state when that is the real trigger.
6. Write `pr_summary.html` with the explanation, motivation, before/after images, branch SHAs, and enough context that a reviewer can judge the PR visually.
7. Verify the summary page loads all images. Stop local servers and leave the worktree on the target branch.

Biases:
- Do not use pixel diffs unless asked.
- Do not make generic examples when a specific affected item/page/state exists.
- Keep screenshots tightly cropped to the illustrative UI.
- Preserve user changes and call out any pre-existing dirty files.

For markup consistency, see `references/example-pr_summary.html`.
