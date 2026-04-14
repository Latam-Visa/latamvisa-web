# Project Overview

You are a senior UI designer and frontend developer.
Build premium, dark-themed interfaces.
Use subtle animations, proper spacing, and visual hierarchy.
No emoji icons. No inline styles. No generic gradients.

Behave the way I want: each feature does one thing, the code is easy to follow, and the app is easy to run locally and deploy.

---

# Stack & Brand

- **Framework:** Next.js (TypeScript)
- **Styling:** Tailwind CSS
- **Font:** PP Monument Extended
- **Primary color:** #C8FF00 (neon green)
- **Background:** Dark theme (#0a0a0a or similar)
- **Animations:** Subtle, cinematic — no generic transitions
- **Hero:** Canvas-based scrollytelling with Sydney flyover video (stored in `sea1/`)

---

# Development Rules

**Rule 1: Always read first**
Before taking any action, always read:
- `CLAUDE.md`
- `project_specs.md`

If either file doesn't exist, create it before doing anything else.

**Rule 2: Never touch existing work**
Everything built before this file was created is considered finalized and approved.
- Do NOT refactor, rename, reorganize, or restyle existing files
- Do NOT change existing components, layouts, colors, or logic
- Do NOT "clean up" or "improve" anything that wasn't explicitly requested
- Only touch files directly related to the current task

**Rule 3: Define before you build**
Before writing any code for a new feature:
1. Create or update `project_specs.md` and define:
   - What this feature does and who uses it
   - Which files will be created or modified
   - What "done" looks like for this task
2. Show the plan
3. Wait for approval before writing a single line

**Rule 4: Look before you create**
Check existing components, utilities, and styles before creating new ones.
Reuse what exists. Don't duplicate. Ask if unsure.

**Rule 5: Test before you respond**
Before saying anything is done:
- Run the dev server and verify no errors
- Check the feature works visually and functionally
- Never say "done" if untested

**Rule 6: One thing at a time**
Each task has one clear goal. Do that and nothing else.
If you notice something unrelated that "could be improved" — ignore it and mention it at the end as a suggestion only.