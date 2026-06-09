# 💊 RxReady — Pharmacy Arcade

A retro-arcade training game for retail pharmacists. Behind the CRT scanlines and
pixel sprites is a full bench-skills trainer: work a live counter against the clock,
or drill the individual skills that feed it.

> ⚠️ **Training tool only.** Drug facts, schedules, NCPDP reject codes, and Virginia
> rules are for study and practice. Always defer to current references, package
> labeling, your pharmacy's policies, and the Virginia Board of Pharmacy / DHP in
> real practice. Pill imprints and NDCs shown in Fill Check are illustrative — use a
> real pill-ID reference on the job.

## 🎮 What's inside

**Story mode — The Shift:** patients line up at your counter (with 8-bit sprites)
carrying real tasks. Keep the line moving, earn tips, build combos, and protect your
reputation before the clock runs out. Ranks climb from Pharmacy Intern to Legend of
the Bench.

**Stage select — the drills:**

| Stage | What you practice |
|------|-------------------|
| Rapid Refill | Timed multiple-choice across every skill area |
| Fill the Rx | Step-by-step prescription workflow |
| At the Counter | Patient-scenario role-play |
| Drug Mastery | Brand ↔ generic, class, indication, counseling, schedules (300+ drug DB) |
| Rx Verification | Clinical/DUR review — verify, clarify, or reject |
| Script Lab | Build the sig (tap-to-build or free-type with a live expander) |
| Insurance Desk | Real NCPDP reject codes — refill-too-soon, PA, DAW, compound, Part D 569… |
| Virginia Law | VA Board of Pharmacy rules (Schedule VI, refills, statewide protocols) |
| Verify Bench | Data verification — compare the entry to the original hard copy |
| Data Entry | Key the script in yourself from the hard copy |
| Fill Check | Verify the technician's completed fill (stock, count, pills, label) |

Plus a searchable **Drug Reference** of 300+ commonly dispensed medications and a
controlled-substance schedule quick reference.

## 🚀 Run it locally

```bash
npm install
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # production build into dist/
npm run preview  # preview the production build
```

Requires [Node.js](https://nodejs.org) 18+.

## 🛠 Tech

Single-component React app built with [Vite](https://vitejs.dev). No CSS framework —
all styling is self-contained. The only runtime dependency is React.

## 📦 Deploy to GitHub Pages

This repo includes a workflow (`.github/workflows/deploy.yml`) that builds and
publishes to GitHub Pages on every push to `main`. After your first push:

1. Go to **Settings → Pages** and set **Source: GitHub Actions**.
2. Push to `main`; the site goes live at `https://<you>.github.io/<repo>/`.

(`base: './'` in `vite.config.js` keeps asset paths relative so it works under any
repo subpath.)

## 📄 License

MIT — see [LICENSE](LICENSE).
