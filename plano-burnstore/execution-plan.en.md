# Step-by-Step Execution Plan — Burnstore (Course Area)

> Operational document. The vision document is `plano-burnstore.md`.
> Portuguese version (source of truth): `plano-execucao.md`.

## Execution principles (apply to every step)

1. **Bilingual from day one.** No hardcoded strings. Every new string goes into `src/locales/pt.json` and `src/locales/en.json` in the same step the screen is built. Portuguese is the default; English is produced alongside (falls back to PT when empty).
2. **Do not reinvent the wheel.** Use mature, permissively licensed libraries (MIT/Apache) before writing anything custom. Approved list: `react-player`, `i18next` + `react-i18next`, `@dnd-kit`, `Tiptap`, `subtitle`/`webvtt-parser`, `shadcn/ui`, `TanStack Query`, `zod`.
3. **"Jellyflix" look.** Dark catalog with horizontal scrolling rows, 16:9 covers that scale on hover revealing title/duration, hero spotlight at the top, keyboard navigation, short transitions. Inside a lesson, an app-like layout (sidebar + centered player). The site's sage/cream palette is kept, with a dark variant specific to the course area.
4. **Every step ships something usable.** No step exists only to enable the next one; each one ends with something testable in the preview.
5. **Secure by default.** Every new table ships with RLS + GRANTs + policies in the same migration.

---

## Step 0 — Foundation (half a day)
- Install `react-player`, `i18next`, `react-i18next`, `@dnd-kit/core`, `@dnd-kit/sortable`.
- Set up i18n (`src/i18n.ts`, `pt.json`, `en.json`) and the PT/EN switcher in the header, persisted in the browser.
- Add the course-area design tokens (dark Jellyflix variant) in `index.css` without touching the rest of the site.
- Add the **Course** tab to the menu pointing to `/curso` (translated "coming soon" page for now).

**Done when:** the Course tab opens and the language switcher really swaps PT/EN.

---

## Step 1 — Data model (1 day)
- Migration creating `courses`, `modules`, `lessons`, `videos`, `lesson_materials` with RLS, GRANTs and policies (public read only for published; writes for `admin` only).
- Bilingual text fields (`title_pt`/`title_en`, `description_pt`/`description_en`).
- `videos` table with `provider` (vimeo/youtube/hls/file), `ref`, `duration`, `is_free`, `source_path`, `source_note`, `status` (idea/recorded/edited/subtitled/published).
- Seed one sample course with two modules and three lessons.

**Done when:** sample data reads back and security is locked down.

---

## Step 2 — Jellyflix catalog (1–2 days)
- `/curso` — hero spotlight plus horizontal rows ("Start here", "Free", "All modules").
- Course card with 16:9 cover, hover scale, 🔓 Free / 🔒 Paid badge.
- `/curso/:courseSlug` — course page with description, modules and lessons.
- Skeleton loading states and empty-state handling.

**Done when:** a visitor browses from catalog to lesson list, in PT and EN.

---

## Step 3 — Player and lesson page (1–2 days)
- `/curso/:courseSlug/:moduleSlug/:lessonSlug` with a three-column layout (playlist / player / side tabs) and a tabbed mobile version.
- Multi-source player via `react-player`, auto-detecting Vimeo, YouTube, HLS or file.
- Side tabs: **Handout** (materials) plus placeholders for Tutor and Voice.
- "Mark as complete" button (local storage at this stage).
- Paid lessons show an "exclusive content" lock screen.

**Done when:** a free lesson plays end to end and a paid one is properly locked.

---

## Step 4 — Creator Dashboard (2–3 days) — *operational milestone*
- `/curso/admin`, restricted to the `admin` role (reuses the hidden profile-photo access).
- Dashboard cards (courses, published lessons, drafts) and a "New course" button.
- Course editor: Course → Modules → Lessons tree with drag and drop (`@dnd-kit`).
- Tabbed lesson editor: **Video** (paste link, instant preview; "Original file" path and note with copy button), **Content** (Tiptap, PT | EN tabs), **Materials** (Storage upload), **Access** (Free/Paid toggle saved instantly).
- **Edit | Preview** switch and a "View as" selector (Guest / Free student / Paid student).
- Autosave with a status indicator and a "Publish" button separate from draft saving.

**Done when:** you can build a full course without touching code.

---

## Step 5 — Panel A: Video library (half a day)
- Single table of all videos: source, duration, status, free/paid one-click toggle, "used in", and the original file path with a copy button.
- Search across title, path and note; filters by status and source.

**Done when:** any video is findable in under ten seconds.

---

## Step 6 — Subtitles and English content (1–2 days)
- `subtitles` table (video, language, WebVTT).
- Edge Function for automatic transcription (Lovable AI Gateway) producing PT WebVTT.
- Automatic PT → EN translation of the track, with manual review.
- Simple subtitle editor in the dashboard (cue, timing, text).
- CC button in the player with PT/EN track switching.

**Done when:** a lesson has working PT and EN subtitles.

---

## Step 7 — Accounts, enrollments and paid access (2 days)
- `enrollments` and `lesson_progress` tables with per-user RLS.
- Student login (email/password + Google), separate from the hidden admin access.
- Paid lesson access verified server-side; the paid `video_ref` is only returned to enrolled users.
- "My lessons" page with progress and resume-where-you-left-off.
- Payments (Stripe or Paddle) land at the end of this step, after access is validated with manual enrollment.

**Done when:** a student pays, gets enrolled and unlocks the content.

---

## Step 8 — Per-module AI tutor (1–2 days)
- `module_tutor_context`, `chat_threads`, `chat_messages` tables.
- Tutor Edge Function via Lovable AI Gateway, answering only about that module, in the student's language.
- Chat in the lesson side tab with per-student history.
- Dashboard button: "Generate context from transcript" (reuses Step 6).

**Done when:** the tutor answers module questions and declines off-topic ones.

---

## Step 9 — Voice questions (1 day)
- `useAudioRecorder` hook (getUserMedia + MediaRecorder + VU meter) adapted from Meutranscritor.
- `VoiceRecorder` component with button, timer and waveform.
- `transcribe-audio` Edge Function (key on the backend, never in the browser).
- Transcribed text lands in the tutor input for review before sending.

**Done when:** a student can ask by voice and get a tutor answer.

---

## Step 10 — Panel B (Production) and Panel C (Numbers) (1–2 days)
- **Panel B:** kanban Idea → Recorded → Edited → Subtitled → Published, draggable, fed by the `videos` table.
- **Panel C:** page/lesson visits (Umami or Plausible), most-watched lessons, monthly enrollments. Read-only.

**Done when:** production and numbers live on one screen.

---

## Step 11 — Polish and launch (1 day)
- Full PT/EN review (no strings outside the locale files).
- Course-area SEO: titles, descriptions, `Course` JSON-LD, canonicals and PT/EN `hreflang`.
- Performance: lazy-loaded course and dashboard routes, lazy images.
- Test all three profiles (guest, free student, paid student) and review security policies.
- Publish.

---

## Summary order

```text
0 Foundation → 1 Data → 2 Catalog → 3 Lesson → 4 Creator Dashboard  ← already operational
        → 5 Library → 6 Subtitles/EN → 7 Payments → 8 AI Tutor
        → 9 Voice → 10 Panels B/C → 11 Launch
```

**Minimum viable product:** Steps 0–4.
**Minimum to sell:** + Step 7.
**Competitive edge:** Steps 8 and 9.
