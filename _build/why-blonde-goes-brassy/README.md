# Why Blonde Goes Brassy

A 10-minute interactive lesson for cosmetology students and newer stylists. It's a standalone React app (Vite) that builds to plain static files for a Webflow iframe.

**Learning objective:** Given a starting level and a target level, the learner can (1) name the underlying pigment that will be exposed and (2) choose the toner that neutralizes it.

Four screens: Hook → Level Lab → Fix it (color wheel, drag or tap) → Prove it (3 client scenarios, scored out of 6).

## Fixing a color fact (no code needed)

Every fact lives in **`public/lesson.json`**: levels, pigments, toners, developer volumes, callouts and scenarios. Each one has `"needs_stylist_review": true`. Once a stylist has checked an entry, set it to `false`.

- Change the words and numbers. Leave the `id` values alone, because they connect things.
- `hex` values are the on-screen swatch colors. They're illustrations, not formulas.
- Entries with a `review_note` weren't in the original brief and were inferred from the color wheel. Check those first.

The built copy at `why-blonde-goes-brassy/lesson.json` (at the repo root) is read when the page loads. You can edit that file directly, but the next build will overwrite it, so make the same edit here too.

## Build

```bash
npm install
npm run build
```

The build writes to `../../why-blonde-goes-brassy/`, so GitHub Pages serves it at `https://work.jackiemiller.co/why-blonde-goes-brassy/` once it's merged to main. The output uses relative paths, so the folder also works on any other static host.

`npm run dev` runs a local preview with hot reload.

## Embed in Webflow

Add an **Embed** element with:

```html
<iframe
  id="brassy-lesson"
  src="https://work.jackiemiller.co/why-blonde-goes-brassy/"
  title="Why Blonde Goes Brassy: an interactive hair color lesson"
  style="width:100%;height:1100px;border:0;"
  loading="lazy"
></iframe>
<script>
  // Optional: grow the iframe to fit the lesson as it changes height.
  window.addEventListener("message", function (e) {
    if (e.data && e.data.type === "brassy-lesson:height") {
      document.getElementById("brassy-lesson").style.height = e.data.height + "px";
    }
  });
</script>
```

## What it does not do

No backend, no tracking, no login, no cookies, no certificate. No brand names or product formulas.
