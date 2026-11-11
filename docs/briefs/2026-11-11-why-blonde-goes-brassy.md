# Brief: publish "Why Blonde Goes Brassy" to the work hub (from Jacklyn, 2026-11-11)

Jacklyn asked for this lesson to go live on jackiemiller.co. Put it on work.jackiemiller.co the same way Clean Station is: source in /_build, built output in its own folder, and a card on the hub page. Don't commit to main directly, because main is the live site. Work on a new branch named brassy-lesson and open a pull request. Merge only when Jacklyn says so.

## What exists
- A finished, tested Vite + React lesson (4 screens: hook, Level Lab, color wheel with drag/tap, 3 scored client scenarios). Already styled to match the live site: black #0A0A0A, Humane from the Webflow CDN, IBM Plex Sans and Mono self-hosted via @fontsource. No tracking, no backend.
- Source: the JackieMiller.co repo, branch feature/lxd-portfolio-core, folder lessons/why-blonde-goes-brassy/ (locally ~/Claude/Projects/JackieMiller.co/lessons/why-blonde-goes-brassy). Copy src/, public/, index.html, package.json, package-lock.json, vite.config.js, README.md. Skip node_modules.
- All color facts live in public/lesson.json and are flagged needs_stylist_review: true. Don't change the content.

## Steps
1. Copy the source to /_build/why-blonde-goes-brassy.
2. In vite.config.js, change build.outDir from "../../public/lessons/why-blonde-goes-brassy" to "../../why-blonde-goes-brassy" (keep base: "./" and emptyOutDir: true).
3. npm install && npm run build inside /_build/why-blonde-goes-brassy. Output lands in /why-blonde-goes-brassy/.
4. Add a hub card in index.html, first in the list, same markup as the others, and renumber the rest:
   <a class="item" href="/why-blonde-goes-brassy/"><div><small>01 / Beauty schools</small><h2>Why Blonde Goes Brassy</h2><p>A ten-minute lesson for cosmetology students: predict the warmth any lift exposes, then pick the toner that cancels it.</p></div><span class="go">Try it</span></a>
5. Preview locally, click through all 4 screens on phone and desktop width, confirm the quiz scores (answers yellow/violet, orange/blue, yellow-orange/blue-violet = 6 of 6).
6. Open a PR. Once merged it's live at https://work.jackiemiller.co/why-blonde-goes-brassy/

## Optional, ask Jacklyn first
Embedding it on the main Webflow site (jackiemiller.co) as an iframe. The embed code is in the lesson's README.md; point it at https://work.jackiemiller.co/why-blonde-goes-brassy/.
