# 💊 RxReady — Pharmacy Arcade

A retro-arcade training game for retail pharmacy. Behind the CRT scanlines and pixel
sprites is a full bench-skills trainer: work a live counter against the clock, run a
whole CVS-style shift, or drill the individual stations that feed it. Responsive —
plays on desktop and phone.

> ⚠️ **Training tool only.** Drug facts, schedules, reject codes, DEA-checksum logic,
> and Virginia rules are for study/practice. Defer to current references, package
> labeling, your pharmacy's policies, and the Virginia Board of Pharmacy / DHP in real
> practice. Pill imprints, NDCs, and DEA numbers shown are illustrative.

## 🎮 Stations

**Pharmacist station** — Type the Script (QT data entry) · QV1 Check Entry ·
DUR Screen · QV2 Final Check · **Full Run**

**Tech bench** — Product Knowledge (300+ drug database) · Build the Label (sig builder) ·
Count & Fill · Reject Codes (NCPDP third-party billing)

**Patient window** — Pickup Counter (branching role-play) · VA Board Rules · Speed Drill

**Full shift** — Floor Shift (live sprite queue, tips, combos, reputation) ·
Run the Queue · Career Mode (multi-day shifts, promotion track, metrics, safe audit)

**NAPLEX prep** — 30 calculation questions with worked solutions: CrCl, IV rates,
alligation, pharmacokinetics, pediatric dosing, mEq, TPN, drip rates.

**After Hours** — an RPG meta-layer over the drills, with its own save, ranks, and
narrator.

### Type the Script (QT)

The deep one. Pick the product and NDC from look-alike strengths, pick the prescriber
out of a set of sound-alike names, type the sig with a live system-style expander and
shorthand autocomplete, take the auto days-supply suggestion (it handles tablets, mL,
insulin units, inhaler puffs, and topicals), and set refills, DAW, and the NCPDP origin
code. Controlled scripts also require the prescriber's DEA number, validated live
against the real checksum. Drag the queue to reprioritize, or insert your own custom Rx
to practice a specific case.

### Full Run

One prescription, all three stages in the order they actually happen: key the entry,
check the technician's fill against the reference pill and label, then make the final
clinical call.

## 🚀 Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
```

Requires Node.js 18+.

## 📦 Deploy to GitHub Pages

Includes `.github/workflows/deploy.yml`, which builds and pushes `dist/` to the
`gh-pages` branch. After your first push: **Settings → Pages → Source: Deploy from a
branch → gh-pages**. Site goes live at `https://<you>.github.io/<repo>/`.

## 🧪 Also in this repo

`pharmacypov-standalone.html` is a separate, self-contained POV pharmacy simulator —
open it directly in a browser for a first-person counter view with the bench, medication
shelves, bottles, ID and insurance cards, a scanner, label printer, and a visual check
tray. It focuses on keying prescriptions and catching verification mismatches, and
deliberately leaves out the filling, counting, and bagging workflows that the main
RxReady app covers.

## 📄 License

MIT — see [LICENSE](LICENSE).
