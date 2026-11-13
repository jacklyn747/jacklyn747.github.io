# Clean Station: source

The sample course "Clean Station: Infection Control for Estheticians". Vite + React, copied from `_build/digital-literacy` and rewritten.

## Build

```
cd _build/clean-station
npm install
npm run build
```

That writes the finished course to `dist/`.

## Publish

Copy everything inside `dist/` to `/clean-station/course/` at the repo root, replacing what is there. Leave `/clean-station/index.html` alone: it's the hand-written story page.

```
rm -rf ../../clean-station/course && cp -R dist ../../clean-station/course
```

The course is then `/clean-station/course/` on work.jackiemiller.co once the branch is merged.

## Where things live

- `src/Course.tsx`: the screen list (six lessons), lesson stages and help text.
- `src/Capstone.tsx` + `src/TreatmentRoom.tsx`: the Lesson 6 treatment room, step list and hints.
- `src/course.css`, `src/room.css`: styles.
