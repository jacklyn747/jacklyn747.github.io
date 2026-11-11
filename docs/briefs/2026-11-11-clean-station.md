# Brief: Clean Station sample course (from Jacklyn, 2026-11-11)

Build a new sample course in this repo by copying the Digital Literacy course and changing the topic. Do not change anything in /digital-literacy/ or /_build/digital-literacy/. Do not commit to main, because main is the live site at work.jackiemiller.co. Work on a new branch named esthetics-sample and open a draft pull request when it's done.

## What exists
- Source: /_build/digital-literacy (Vite + React). Course.tsx holds a screen manifest: 6 lessons, each with a title screen and gated interactive "Stage" screens (tap, drag, type, reveal), plus per-lesson help content. Capstone.tsx + MacSim.tsx are a working simulated desktop with step prompts at the top and a "?" for hints. Built output goes to /digital-literacy/.
- Copy it to /_build/clean-station and build to /clean-station/. Keep the same structure, interaction patterns, lesson pips, help panel, gating and visual style. Change the content and the capstone scene only.

## New course
Title: "Clean Station: Infection Control for Estheticians"
Sub: "How to keep every client safe, one station at a time."
Note: "Six lessons · about 30 minutes · go at your own pace"
Audience: esthetics students in a beauty school. Plain language, grandma test.

Lesson 1: Why this matters
- Motivation stage: learner picks their trade (Esthetics, Nails, Barbering, Massage, Lash). Echo their pick back later in the course.

Lesson 2: Clean, disinfect, sterilize
- Tap-to-reveal: what each word means. Cleaning removes dirt and debris. Disinfecting kills most germs on hard, nonporous surfaces. Sterilizing kills all microbial life and is mostly for medical settings.
- Ordering stage: put "clean" before "disinfect". Disinfectant doesn't work on a dirty surface.

Lesson 3: Toss it or disinfect it
- Drag-to-sort: single-use items to the trash (wooden spatula, cotton round, gauze, disposable gloves, sponge, single-use applicator). Hard nonporous tools to the disinfect tray (metal extractor, metal tweezers, stainless bowl).
- Rule: if it's porous and can't be disinfected, it's single-use.

Lesson 4: Read the label
- Show a made-up disinfectant label ("Brand X Surface Disinfectant"). The learner taps the contact time on it.
- Contact time stage: the surface has to stay wet for the full contact time on the label. If it dries early, apply again. Use a short demo timer, not real minutes.
- Keep it general: "Always follow the label on the product you use." No real brand names.

Lesson 5: Hands and gloves
- Ordering stage: handwashing steps (wet, soap, scrub at least 20 seconds, rinse, dry with a clean towel).
- Tap-to-reveal: when to change gloves (between clients, if torn, after touching anything not clean).

Lesson 6: Capstone: reset the treatment room
- Replace the simulated desktop with a simulated treatment room, top-down, simple flat shapes. Same step prompts at the top, same "?" hints, untimed, nothing scored or recorded.
- Tasks in order:
  1. Throw away used single-use items.
  2. Bag used linens.
  3. Clean the bed and counter.
  4. Disinfect them and wait out the contact time.
  5. Clean, then disinfect the used metal tools.
  6. Wash hands.
  7. Lay out fresh linens and disinfected tools for the next client.
- Wrong moves get a kind hint, never an error.
- Complete screen: "Station ready. Your next client walks into a clean room."

## Rules
- Write in first person singular ("I"), never "we" or "us". Change the original's "tell us" to "tell me".
- No em dashes anywhere.
- Never mention TDLR, any state agency or any state rule. Never use the words "approved", "state-approved", "certified" or "accredited".
- Keep the facts general. If unsure a claim is true everywhere, cut it or soften it to "follow your school and the product label".
- Footer on every screen: "Sample course by Jackie Miller. Follow your school's procedures and your product labels."
- Images: black-and-white only, or flat shapes. Accent red only on light/bone backgrounds, never red text on black.
- Page title: "Clean Station · Jackie Miller".

## Also
- Add a card for Clean Station to /index.html (the work hub) next to the others. Category: "Beauty schools". One line: "A six-lesson infection control course for esthetics students, ending in a hands-on treatment room."
- Leave the Legal OS and Digital Literacy cards as they are.
- Add a short README in /_build/clean-station explaining how to build it and copy the output to /clean-station/.

## Done means
- npm run build passes, and /clean-station/index.html opens locally and runs start to finish.
- Search the new files for "TDLR", "approved", "we ", "us " and "—" and confirm none remain.
- Draft PR open from esthetics-sample with a Before/After description. Do not merge.
