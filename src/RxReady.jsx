import React, { useState, useEffect, useRef } from "react";
import { loadSave, recordShiftResult, recordDrillResult, recordActivity, earnAchievement, recordStars, getRank, getStatLevel } from './afterhours/save.js';
import { getQuip, NARRATOR_NAME, ZIPPO_GRID, ZIPPO_COLORS } from './afterhours/narrator.js';
import AfterHours from './afterhours/AfterHours.jsx';
import AgeGate from './afterhours/AgeGate.jsx';
import Settings from './afterhours/Settings.jsx';

/* ============================================================
   RxReady — Retail Pharmacy Bench Trainer
   3 game modes · 6 skill areas · 4 difficulty levels
   ============================================================ */

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,900&family=Spline+Sans:wght@400;500;600;700&family=Spline+Sans+Mono:wght@400;500;600&family=Caveat:wght@500;600;700&family=Press+Start+2P&display=swap');
`;

/* ---------- palette ---------- */
const C = {
  paper: "#F2E9D6",
  paper2: "#ECE1C9",
  card: "#FBF6EA",
  ink: "#22302A",
  pine: "#1F4A3F",
  pineSoft: "#2C6353",
  amber: "#C0781E",
  amberSoft: "#E2A552",
  clay: "#B23A24",
  green: "#2E8B57",
  muted: "#6E7C70",
  line: "rgba(31,74,63,0.16)",
};

/* ---------- skills ---------- */
const SKILLS = [
  { id: "sig", label: "Sig Codes & Abbreviations", short: "Sig Codes", icon: "℞" },
  { id: "interact", label: "Drug Interactions & Safety", short: "Interactions", icon: "⚠" },
  { id: "calc", label: "Pharmacy Calculations / Dosing", short: "Calculations", icon: "∑" },
  { id: "counsel", label: "Patient Counseling", short: "Counseling", icon: "✦" },
  { id: "error", label: "Catching Rx Errors", short: "Rx Errors", icon: "⊘" },
  { id: "otc", label: "OTC Recommendations", short: "OTC", icon: "+" },
];

const LEVELS = [
  { n: 1, name: "Intern", blurb: "Foundations & quick recall" },
  { n: 2, name: "New Grad", blurb: "Day-to-day bench work" },
  { n: 3, name: "Staff Pharmacist", blurb: "Clinical judgment" },
  { n: 4, name: "PIC / Curveballs", blurb: "Edge cases & hard calls" },
];

const MODES = [
  {
    id: 1,
    title: "Speed Drill",
    tag: "Rapid Fire",
    desc: "Beat the clock. Multiple-choice across every skill area — sig codes, interactions, counseling, law — with a combo multiplier and three lives.",
    icon: "⏱",
  },
  {
    id: 2,
    title: "Count & Fill",
    tag: "Tech Bench",
    desc: "You're the tech at the fill bench. Read the label, pull the right stock bottle, count to the correct quantity, and make sure the label matches the script before sending to QV2.",
    icon: "℞",
  },
  {
    id: 3,
    title: "Pickup Counter",
    tag: "Patient Window",
    desc: "Patients are at the counter or the drive-thru window. Handle pickups, new-therapy counseling, OTC questions, and the hard situations — the hostile patient, the allergic reaction, the controlled-substance red flag.",
    icon: "☺",
  },
  {
    id: 4,
    title: "Product Knowledge",
    tag: "Drug Cards",
    desc: "Brand ↔ generic, drug class, indication, counseling points, and controlled-substance schedules — the same drugs that fill your will-call bags every day.",
    icon: "✚",
  },
  {
    id: 5,
    title: "DUR Screen",
    tag: "Clinical Review",
    desc: "A script hits your queue with a DUR alert. Check it against the patient's profile — allergies, current meds, conditions — catch the real problem, and make the call: verify, call the prescriber, or reject.",
    icon: "⊕",
  },
  {
    id: 6,
    title: "Build the Label",
    tag: "Sig → Label",
    desc: "The prescriber wrote shorthand. You build the patient-facing directions — translate the sig, set the correct route and frequency, and produce a clean, unambiguous label.",
    icon: "✎",
  },
  {
    id: 7,
    title: "Reject Codes",
    tag: "Third-Party Billing",
    desc: "The claim came back rejected. Read the NCPDP code — refill-too-soon, prior auth required, non-formulary, quantity limit, eligibility — and run the right fix before the patient loses it.",
    icon: "▤",
  },
  {
    id: 8,
    title: "VA Board Rules",
    tag: "Virginia Law",
    desc: "Virginia-specific board rules: Schedule VI, CII/CIII refill and expiration limits, emergency dispensing, collaborative practice, and what you can and can't do under the statewide protocols.",
    icon: "§",
  },
  {
    id: 9,
    title: "Floor Shift",
    tag: "Full CVS Sim",
    desc: "You're on the floor. The counter queue climbs, drive-thru cars stack up, phones ring, and waiters hover. Keep everything moving — this is what a real shift feels like.",
    icon: "▶",
  },
  {
    id: 10,
    title: "QV1 — Check Entry",
    tag: "Pharmacist Verification",
    desc: "A script is waiting in QV1. Compare the system entry to the original hard copy — catch wrong strength, bad quantity, miskeyed sig, DAW violation. This is your legal sign-off.",
    icon: "✓",
  },
  {
    id: 11,
    title: "Type the Script",
    tag: "QT Queue",
    desc: "Scripts are piling up in QT. Read each hard copy and enter it — translate the sig (live expansion shows you the patient label as you type), calculate days supply, set refills, flag DAW.",
    icon: "⌨",
  },
  {
    id: 12,
    title: "QV2 — Final Check",
    tag: "Product Verification",
    desc: "The tech filled it — your job is to verify before it goes to will-call. Does the stock match the drug and strength? Right count? Pills look correct? Label matches the script? Approve or reject.",
    icon: "⊙",
  },
  {
    id: 13,
    title: "Run the Queue",
    tag: "Queue Control",
    desc: "You're the shift lead. Watch QT, QV1, QP, and QV2 lanes from the dashboard — triage production timers, handle drive-thru escalations, and end with the CII safe count.",
    icon: "M",
  },
  {
    id: 14,
    title: "Career Mode",
    tag: "CVS Pharmacist",
    desc: "Work multi-day CVS shifts. Build your stats, chase promotion from Intern to Pharmacist-in-Charge, bank bonuses, and don't let the metrics tank.",
    icon: "$",
  },
];

const ACHIEVEMENTS = [
  { id: "first_clock_in",  icon: "🏥", title: "Punched In",          desc: "Completed your first shift",                          rarity: "common"   },
  { id: "eagle_eye",       icon: "👁", title: "Eagle Eye",            desc: "Caught your first QV1 data entry error",               rarity: "uncommon" },
  { id: "eagle_streak",    icon: "⚡", title: "Error Hunter",         desc: "Caught 3 QV1 errors in one shift",                     rarity: "rare"     },
  { id: "perfect_qv2",     icon: "✓", title: "Zero Defects",         desc: "100% accuracy on QV2 Final Check",                     rarity: "uncommon" },
  { id: "speed_demon",     icon: "⏱", title: "Speed Demon",          desc: "Hit a 10-combo in Speed Drill",                        rarity: "uncommon" },
  { id: "drug_master",     icon: "✚", title: "Drug Master",          desc: "100% on Product Knowledge",                            rarity: "uncommon" },
  { id: "reject_ace",      icon: "▤", title: "Claims Expert",        desc: "90%+ on Reject Codes",                                 rarity: "uncommon" },
  { id: "dur_zero",        icon: "⊕", title: "Zero DUR Misses",      desc: "Perfect on DUR Screen",                                rarity: "uncommon" },
  { id: "patient_champ",   icon: "☺", title: "Patient Advocate",     desc: "100% on Pickup Counter",                               rarity: "uncommon" },
  { id: "week_warrior",    icon: "🔥", title: "Week Warrior",         desc: "7-day training streak",                                rarity: "rare"     },
  { id: "promoted",        icon: "$", title: "Not an Intern Anymore", desc: "Advanced past Intern rank",                           rarity: "rare"     },
  { id: "the_grind",       icon: "℞", title: "The Grind",            desc: "Completed 25 drills total",                            rarity: "epic"     },
  { id: "triple_star",     icon: "★", title: "Three-Star Pharmacist", desc: "Earned ⭐⭐⭐ on any station",                         rarity: "uncommon" },
  { id: "all_stations",    icon: "▶", title: "All Stations Active",  desc: "Played every training station at least once",           rarity: "rare"     },
];

const RARITY_COLOR = { common: "#7EB8C9", uncommon: "#3FB950", rare: "#FFB800", epic: "#CC0000" };

const DAILY_MISSION_POOL = [
  { id: "dm_speed_90",   mode: 1,  title: "Sharp Mind",        desc: "Score 90%+ on Speed Drill",              target: 90,  targetType: "pct"   },
  { id: "dm_drug_100",   mode: 4,  title: "Drug Card Master",  desc: "Score 100% on Product Knowledge",         target: 100, targetType: "pct"   },
  { id: "dm_reject_90",  mode: 7,  title: "Billing Expert",    desc: "Score 90%+ on Reject Codes",              target: 90,  targetType: "pct"   },
  { id: "dm_dur_clean",  mode: 5,  title: "DUR Zero",          desc: "Zero misses on DUR Screen",               target: 100, targetType: "pct"   },
  { id: "dm_pickup_100", mode: 3,  title: "Patient First",     desc: "Perfect score on Pickup Counter",         target: 100, targetType: "pct"   },
  { id: "dm_qv2_clean",  mode: 12, title: "Clean Bench",       desc: "100% accuracy on QV2 Final Check",        target: 100, targetType: "pct"   },
  { id: "dm_entry_85",   mode: 11, title: "Speed Entry",       desc: "Score 85%+ on Type the Script",           target: 85,  targetType: "pct"   },
  { id: "dm_law_80",     mode: 8,  title: "Law Review",        desc: "Score 80%+ on VA Board Rules",            target: 80,  targetType: "pct"   },
  { id: "dm_label_90",   mode: 6,  title: "Label Pro",         desc: "Score 90%+ on Build the Label",           target: 90,  targetType: "pct"   },
  { id: "dm_qv1_run",    mode: 13, title: "Run the Queue",     desc: "Complete a full shift in Run the Queue",  target: 1,   targetType: "play"  },
  { id: "dm_counter_a",  mode: 3,  title: "Front Counter",     desc: "Score an A on Pickup Counter",            target: 90,  targetType: "pct"   },
  { id: "dm_verify_qv1", mode: 10, title: "QV1 Check",         desc: "Complete QV1 — Check Entry",              target: 80,  targetType: "pct"   },
];

function getDailyMissions() {
  const seed = new Date().toDateString().split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const sorted = [...DAILY_MISSION_POOL].sort((a, b) => {
    const ah = (seed * 31 + a.id.charCodeAt(3)) % 97;
    const bh = (seed * 31 + b.id.charCodeAt(3)) % 97;
    return bh - ah;
  });
  // Pick 3 with different modes
  const picked = []; const usedModes = new Set();
  for (const m of sorted) {
    if (!usedModes.has(m.mode)) { picked.push(m); usedModes.add(m.mode); }
    if (picked.length === 3) break;
  }
  return picked;
}

const SHIFT_CONTEXTS = [
  { time: "MON 9:12 AM", mood: "steady",       queue: 11, banner: "Monday morning · 11 scripts in queue · Printer jammed twice already",              npc: "Hey, tech just called out sick. It's just us today." },
  { time: "FRI 4:53 PM", mood: "slammed",       queue: 22, banner: "Friday rush · Drive-through backed up · Phones ringing off the hook",              npc: "Can someone get the phone? I'm still on hold with Caremark." },
  { time: "TUE 1:30 PM", mood: "moderate",      queue:  8, banner: "Lunch wave · 8 scripts in queue · Pharmacist verifying CIIs",                      npc: "Heads-up — patient in will-call says we shorted her by 4 tablets." },
  { time: "SAT 11:00 AM", mood: "slammed",      queue: 19, banner: "Saturday rush · Short-staffed today · Drive-through: 6 cars",                      npc: "District manager is doing a walk-through at noon. Look busy." },
  { time: "WED 3:15 PM", mood: "moderate",      queue:  6, banner: "Mid-afternoon · 6 in queue · Drive-through: clear · Pharmacist on consult",        npc: "New intern starts today — show them where the rejects go." },
  { time: "THU 6:45 PM", mood: "winding-down",  queue:  3, banner: "Closing shift · 3 scripts left · Don't forget end-of-day controlled count",        npc: "Whoever closes last — lock the safe before you leave." },
  { time: "MON 2:00 PM", mood: "moderate",      queue:  9, banner: "Post-lunch wave · 9 in queue · Insurance line on hold for 20 min",                  npc: "Just rejected a script — member ID mismatch. Needs reprocessing." },
  { time: "SUN 12:30 PM", mood: "steady",       queue:  7, banner: "Sunday midday · 7 in queue · Pharmacist solo coverage today",                      npc: "No tech until 2, so you're handling data entry and phones both." },
];

const MODE_GROUPS = [
  {
    id: "career",
    title: "Full Shift",
    tag: "CVS Floor Sim",
    lead: 14,
    modes: [14, 13, 9],
    desc: "Clock in and run a full CVS shift — queues, phones, pickup, drive-thru, waiters, metrics, safe audit.",
  },
  {
    id: "verification",
    title: "Pharmacist Station",
    tag: "QV1 · DUR · QV2",
    lead: 10,
    modes: [11, 10, 5, 12],
    desc: "Your chair at the bench: type incoming scripts (QT), check entries (QV1), screen for DURs, and clear QV2 before will-call.",
  },
  {
    id: "workflow",
    title: "Tech Bench",
    tag: "Fill · Label · Billing",
    lead: 2,
    modes: [2, 6, 7, 8],
    desc: "Tech-side work: count and fill prescriptions, build patient-facing labels, resolve insurance rejects, and know the law.",
  },
  {
    id: "knowledge",
    title: "Patient Window",
    tag: "Counter · Counseling",
    lead: 1,
    modes: [1, 4, 3],
    desc: "The counter is busy. Speed drills keep your reflexes sharp; product knowledge and counseling scenarios cover what patients actually ask.",
  },
];

const modeById = (id) => MODES.find((m) => m.id === id);

const CHAIN_TASKS = [
  {
    id: "phones",
    label: "Phones",
    action: "Answer phone",
    start: 2,
    max: 7,
    xp: 8,
    score: 3,
    reliefMs: 1400,
    note: "Doctor line, refill status, transfer request.",
  },
  {
    id: "pickup",
    label: "Pickup",
    action: "Clear pickup",
    start: 3,
    max: 8,
    xp: 7,
    score: 3,
    reliefMs: 1100,
    note: "Line at register wants ready prescriptions.",
  },
  {
    id: "driveThru",
    label: "Drive-thru",
    action: "Run lane",
    start: 2,
    max: 6,
    xp: 9,
    score: 4,
    reliefMs: 1800,
    note: "Car at the window, insurance card in hand.",
  },
  {
    id: "counsel",
    label: "Counsel",
    action: "Counsel",
    start: 1,
    max: 5,
    xp: 10,
    score: 5,
    reliefMs: 1300,
    note: "New therapy consult waiting for pharmacist.",
  },
  {
    id: "waiters",
    label: "Waiters",
    action: "Prioritize waiter",
    start: 2,
    max: 7,
    xp: 9,
    score: 4,
    reliefMs: 2200,
    note: "Patient is waiting in-store for the fill.",
  },
];

const initialChainTasks = () => Object.fromEntries(CHAIN_TASKS.map((task) => [task.id, task.start]));

/* ============================================================
   QUIZ BANK  (Mode 1)
   ============================================================ */
const QUIZ = [
  // ---- SIG ----
  { skill: "sig", level: 1, q: 'What does the sig abbreviation "PO" mean?', options: ["By mouth", "After meals", "As needed", "Right eye"], answer: 0, explain: "PO = per os = by mouth." },
  { skill: "sig", level: 1, q: '"BID" on a label means the patient takes the dose…', options: ["Once daily", "Twice daily", "Three times daily", "Every other day"], answer: 1, explain: "BID = bis in die = twice a day. TID = 3x, QID = 4x." },
  { skill: "sig", level: 1, q: 'A med ordered "HS" should be taken…', options: ["Before meals", "At bedtime", "In the morning", "With water"], answer: 1, explain: "HS = hora somni = at bedtime. (Watch out — HS can be confused with 'half-strength.')" },
  { skill: "sig", level: 2, q: 'Decode: "i tab PO q6h PRN pain"', options: ["1 tab by mouth every 6 hours as needed for pain", "1 tab by mouth 6 times daily for pain", "1 tab under tongue every 6 hours", "1 tab by mouth before bed for pain"], answer: 0, explain: "q6h = every 6 hours; PRN = as needed. So: 1 tablet by mouth every 6 hours as needed for pain." },
  { skill: "sig", level: 2, q: 'What does "gtt ii OU BID" direct?', options: ["2 drops in both eyes twice daily", "2 drops in right eye twice daily", "2 drops in both ears twice daily", "2 tablets in both eyes daily"], answer: 0, explain: "gtt = drops, ii = two, OU = both eyes (OD right, OS left), BID = twice daily." },
  { skill: "sig", level: 3, q: '"ii gtt AS TID" means place…', options: ["2 drops in the left ear 3x daily", "2 drops in the right ear 3x daily", "2 drops in both eyes 3x daily", "2 drops in the left eye 3x daily"], answer: 0, explain: "AS = auris sinistra = left ear (AD right, AU both). Don't confuse the eye (O_) and ear (A_) codes." },
  { skill: "sig", level: 4, q: "Which abbreviation is on the ISMP 'Do Not Use' list because it's dangerously error-prone?", options: ["BID", "QD", "PO", "TID"], answer: 1, explain: "QD (once daily) is easily misread as QID (4x daily) or QOD. ISMP recommends writing 'daily' instead. 'U' for units and trailing zeros are also banned." },

  // ---- INTERACTIONS ----
  { skill: "interact", level: 2, q: "A patient on warfarin asks which OTC pain reliever is safest. You recommend:", options: ["Ibuprofen", "Naproxen", "Acetaminophen", "Aspirin"], answer: 2, explain: "NSAIDs (ibuprofen, naproxen) and aspirin raise bleeding risk on warfarin. Acetaminophen is the preferred OTC analgesic (keep total ≤3–4 g/day)." },
  { skill: "interact", level: 2, q: "Why must you never dispense sildenafil to a patient also using nitroglycerin?", options: ["Reduced erection quality", "Severe, possibly fatal hypotension", "Liver toxicity", "Tachycardia"], answer: 1, explain: "PDE5 inhibitors + nitrates cause profound vasodilation and life-threatening hypotension. This combination is contraindicated." },
  { skill: "interact", level: 2, q: "Combining an SSRI with a triptan, tramadol, or an MAOI risks which syndrome?", options: ["Serotonin syndrome", "Neuroleptic malignant syndrome", "Stevens-Johnson syndrome", "Cushing syndrome"], answer: 0, explain: "Excess serotonergic activity → serotonin syndrome (agitation, hyperthermia, clonus, autonomic instability)." },
  { skill: "interact", level: 3, q: "Simvastatin + clarithromycin together raise the risk of:", options: ["Hyperkalemia", "Rhabdomyolysis / myopathy", "QT shortening", "Hypoglycemia"], answer: 1, explain: "Clarithromycin is a strong CYP3A4 inhibitor; it raises simvastatin levels → myopathy and rhabdomyolysis. Hold the statin or pick a non-interacting antibiotic." },
  { skill: "interact", level: 3, q: "Lisinopril plus spironolactone most importantly risks:", options: ["Hypokalemia", "Hyperkalemia", "Hypernatremia", "Hypoglycemia"], answer: 1, explain: "ACE inhibitors and potassium-sparing diuretics both raise serum potassium → hyperkalemia. Monitor K⁺ and renal function." },
  { skill: "interact", level: 3, q: "A patient takes ciprofloxacin and a calcium antacid. Your counseling point:", options: ["Take them together for tolerance", "Separate the doses by ~2 hours", "Double the cipro dose", "Stop the antacid forever"], answer: 1, explain: "Di/trivalent cations (Ca, Mg, Al, Fe) chelate fluoroquinolones and tetracyclines, slashing absorption. Separate by 2 h before or 6 h after." },
  { skill: "interact", level: 4, q: "Linezolid is given to a patient on sertraline. The concern is:", options: ["Linezolid has MAOI activity → serotonin syndrome", "Reduced antibiotic effect", "Tendon rupture", "Hyperglycemia"], answer: 0, explain: "Linezolid is a reversible MAOI; combined with an SSRI it can precipitate serotonin syndrome. Flag for the prescriber." },
  { skill: "interact", level: 4, q: "Clopidogrel's antiplatelet effect can be blunted by which acid-reducer?", options: ["Pantoprazole", "Famotidine", "Omeprazole", "Calcium carbonate"], answer: 2, explain: "Omeprazole/esomeprazole inhibit CYP2C19, which activates clopidogrel. Pantoprazole or an H2 blocker (famotidine) is preferred." },

  // ---- CALCULATIONS ----
  { skill: "calc", level: 1, q: "Rx: 60 tablets, take 1 tablet BID. What is the days supply?", options: ["15 days", "30 days", "60 days", "20 days"], answer: 1, explain: "Days supply = quantity ÷ doses per day = 60 ÷ (1×2) = 30 days." },
  { skill: "calc", level: 1, q: "How many mL are in 1 tablespoon?", options: ["5 mL", "10 mL", "15 mL", "30 mL"], answer: 2, explain: "1 tablespoon = 15 mL; 1 teaspoon = 5 mL." },
  { skill: "calc", level: 2, q: "Amoxicillin 250 mg/5 mL. The dose is 500 mg. How many mL per dose?", options: ["5 mL", "10 mL", "2.5 mL", "20 mL"], answer: 1, explain: "500 mg ÷ 250 mg × 5 mL = 10 mL per dose." },
  { skill: "calc", level: 2, q: "Susp dispensed: 150 mL. Sig: 5 mL TID. Days supply?", options: ["10 days", "15 days", "30 days", "5 days"], answer: 0, explain: "Daily volume = 5 mL × 3 = 15 mL/day. 150 mL ÷ 15 = 10 days." },
  { skill: "calc", level: 3, q: "A 20 kg child is dosed amoxicillin 45 mg/kg/day divided BID. mg per dose?", options: ["900 mg", "450 mg", "225 mg", "90 mg"], answer: 1, explain: "Total = 45 × 20 = 900 mg/day. Divided BID = 900 ÷ 2 = 450 mg per dose." },
  { skill: "calc", level: 3, q: "Max acetaminophen is 4000 mg/day. How many 500 mg tablets is that?", options: ["6", "8", "10", "12"], answer: 1, explain: "4000 ÷ 500 = 8 tablets/day max — and that's the ceiling, not a target. Many guidelines cap at 3000 mg." },
  { skill: "calc", level: 4, q: "A 10 mL insulin vial at 100 units/mL. Patient uses 40 units/day. Days supply?", options: ["10 days", "25 days", "40 days", "100 days"], answer: 1, explain: "Vial = 10 mL × 100 u/mL = 1000 units. 1000 ÷ 40 = 25 days." },
  { skill: "calc", level: 4, q: "5 mL eye-drop bottle (~20 drops/mL). Sig: 1 gtt OU BID. Days supply?", options: ["~12 days", "~25 days", "~50 days", "~100 days"], answer: 1, explain: "Bottle ≈ 5 × 20 = 100 drops. Use = 1 drop × 2 eyes × 2x daily = 4 drops/day. 100 ÷ 4 = 25 days (round down)." },

  // ---- COUNSELING ----
  { skill: "counsel", level: 1, q: "Which medication needs 'rinse your mouth after each use'?", options: ["Inhaled corticosteroid", "Albuterol rescue inhaler", "Oral antibiotic", "Insulin pen"], answer: 0, explain: "Rinsing after inhaled corticosteroids (e.g., fluticasone) prevents oral thrush (candidiasis)." },
  { skill: "counsel", level: 1, q: "Counseling for sublingual nitroglycerin chest-pain dosing:", options: ["Take 1, repeat q5min up to 3 doses; call 911 if no relief", "Take all 3 at once", "Swallow with water", "Only use after eating"], answer: 0, explain: "Sit down, place 1 tab under the tongue, may repeat every 5 minutes up to 3 doses; if pain persists after the first, call 911." },
  { skill: "counsel", level: 2, q: "Key counseling for alendronate (a bisphosphonate)?", options: ["Take at bedtime with food", "Take with full glass of water, stay upright 30 min, empty stomach", "Crush and mix in juice", "Take with calcium for absorption"], answer: 1, explain: "Take first thing AM with 6–8 oz plain water, remain upright ≥30 min, nothing else by mouth — prevents esophageal irritation and aids absorption." },
  { skill: "counsel", level: 2, q: "A patient starting metronidazole must avoid:", options: ["Dairy", "Sunlight", "Alcohol", "Grapefruit"], answer: 2, explain: "Alcohol with metronidazole (and tinidazole) causes a disulfiram-like reaction — flushing, nausea, vomiting. Avoid during and ~3 days after." },
  { skill: "counsel", level: 2, q: "Doxycycline counseling should warn about:", options: ["Drowsiness", "Photosensitivity & separating from dairy/antacids", "Weight gain", "Blue urine"], answer: 1, explain: "Tetracyclines cause photosensitivity (use sunscreen) and chelate with calcium/iron/antacids — separate doses. Avoid in pregnancy and children <8." },
  { skill: "counsel", level: 3, q: "The most important diet counseling for a warfarin patient is:", options: ["Eliminate all leafy greens", "Keep vitamin K intake consistent", "Eat extra vitamin K", "Avoid all protein"], answer: 1, explain: "It's about consistency, not avoidance. Sudden swings in vitamin K (leafy greens) shift the INR. Keep intake steady and monitor INR." },
  { skill: "counsel", level: 3, q: "Levothyroxine is best taken:", options: ["With breakfast", "On an empty stomach, separated from calcium/iron", "At bedtime with milk", "With an antacid"], answer: 1, explain: "Take 30–60 min before breakfast on an empty stomach; separate from calcium, iron, and antacids which impair absorption." },
  { skill: "counsel", level: 4, q: "A statin patient should be told to report which symptom promptly?", options: ["Mild headache", "Unexplained muscle pain or weakness", "Dry skin", "Sneezing"], answer: 1, explain: "Unexplained muscle pain/tenderness/weakness can signal myopathy or (rarely) rhabdomyolysis — have it evaluated." },

  // ---- ERRORS ----
  { skill: "error", level: 2, q: "A new amoxicillin Rx arrives for a patient whose profile lists a penicillin allergy. You should:", options: ["Fill it — it's a different drug", "Contact the prescriber before filling", "Cut the dose in half", "Counsel and dispense"], answer: 1, explain: "Amoxicillin is a penicillin. With a documented PCN allergy, hold and contact the prescriber — never assume the allergy was overridden." },
  { skill: "error", level: 2, q: "Which way of writing a dose is unsafe and should be clarified?", options: ["0.5 mg", "5 mg", "1.0 mg", "10 mg"], answer: 2, explain: "Trailing zeros ('1.0 mg') can be misread as 10 mg. Never use trailing zeros; always use a leading zero ('0.5 mg' not '.5 mg')." },
  { skill: "error", level: 3, q: "A patient already on lisinopril gets a new Rx for enalapril. This is:", options: ["A normal combination", "Duplicate therapy (two ACE inhibitors)", "A required taper", "A drug-food interaction"], answer: 1, explain: "Both are ACE inhibitors — duplicate therapy raising hyperkalemia/hypotension/angioedema risk. Verify intent with the prescriber." },
  { skill: "error", level: 3, q: "An Rx reads 'methotrexate 2.5 mg, 1 tab PO DAILY' for rheumatoid arthritis. The red flag:", options: ["Dose too low", "RA methotrexate is dosed WEEKLY, not daily", "Wrong route", "Needs refrigeration"], answer: 1, explain: "Oral methotrexate for RA is once-WEEKLY. Daily dosing is a classic fatal error — verify with the prescriber before dispensing." },
  { skill: "error", level: 4, q: "Prescriber wrote 'hydroxyzine' but the chart shows the visit was for hypertension. You suspect a:", options: ["Correct order", "Look-alike/sound-alike mix-up with hydralazine", "Dosing error", "Duplicate"], answer: 1, explain: "Hydroxyzine (antihistamine) vs hydralazine (antihypertensive) is a known LASA pair. The indication doesn't match — confirm the intended drug." },

  // ---- OTC ----
  { skill: "otc", level: 1, q: "A pregnant patient asks for something for a headache. Best OTC choice:", options: ["Ibuprofen", "Aspirin", "Acetaminophen", "Naproxen"], answer: 2, explain: "Acetaminophen is generally preferred in pregnancy; NSAIDs (esp. 3rd trimester) and aspirin are avoided. Persistent symptoms → refer." },
  { skill: "otc", level: 2, q: "Why avoid aspirin for a child's fever?", options: ["It tastes bad", "Risk of Reye's syndrome", "It's not strong enough", "It stains teeth"], answer: 1, explain: "Aspirin in children/teens with viral illness is linked to Reye's syndrome. Use acetaminophen or age-appropriate ibuprofen instead." },
  { skill: "otc", level: 2, q: "A patient with hypertension wants a decongestant. The safer suggestion:", options: ["Pseudoephedrine", "Phenylephrine at double dose", "Saline spray / refer", "Any decongestant is fine"], answer: 2, explain: "Oral decongestants (pseudoephedrine, phenylephrine) can raise blood pressure. Suggest saline/intranasal options or refer for hypertensives." },
  { skill: "otc", level: 3, q: "An older adult wants diphenhydramine nightly to sleep. Best response:", options: ["Recommend it freely", "Caution — anticholinergic risks in elderly (Beers); suggest alternatives", "Double the dose", "Combine with melatonin and ignore risks"], answer: 1, explain: "Diphenhydramine is on the Beers list — anticholinergic effects (confusion, falls, urinary retention) are riskier in older adults. Suggest safer options or referral." },
  { skill: "otc", level: 3, q: "A patient has diarrhea with bloody stools and fever. Loperamide is:", options: ["Recommended at high dose", "Not appropriate — refer for evaluation", "Fine with food", "Best combined with antibiotics OTC"], answer: 1, explain: "Bloody diarrhea + fever suggests an invasive/infectious cause. Antimotility agents can be harmful — refer rather than self-treat." },
  { skill: "otc", level: 1, q: "For occasional, infrequent heartburn, the fastest-acting OTC class is:", options: ["Proton pump inhibitor", "Antacid", "H2 blocker", "Antibiotic"], answer: 1, explain: "Antacids neutralize acid for fast, short relief. H2 blockers are slower but last longer; PPIs are for frequent (≥2x/week) heartburn." },

  // ---- SIG (continued) ----
  { skill: "sig", level: 1, q: 'What does "AC" mean on a prescription sig?', options: ["After meals", "Before meals", "At bedtime", "Every other day"], answer: 1, explain: "AC = ante cibum = before meals. PC = post cibum = after meals." },
  { skill: "sig", level: 1, q: 'What does the abbreviation "SL" indicate for a medication?', options: ["By mouth", "Under the tongue", "Applied to the skin", "Into the eye"], answer: 1, explain: "SL = sublingual = under the tongue, where the medication dissolves and absorbs directly into the bloodstream." },
  { skill: "sig", level: 1, q: 'On a prescription, "QID" means the patient takes the medication:', options: ["Once daily", "Twice daily", "Three times daily", "Four times daily"], answer: 3, explain: "QID = quater in die = four times a day. Compare: QD (daily), BID (twice), TID (three times)." },
  { skill: "sig", level: 2, q: 'Decode the sig: "ii tab PO TID PC"', options: ["2 tablets by mouth three times daily after meals", "2 tablets by mouth twice daily before meals", "2 tablets under tongue three times daily", "2 tablets by mouth three times daily at bedtime"], answer: 0, explain: "ii = two, PO = by mouth, TID = three times daily, PC = after meals. So: 2 tablets by mouth three times daily after meals." },
  { skill: "sig", level: 2, q: 'What does "NMT" mean in a sig, as in "NMT 4 tabs/day"?', options: ["No more than", "Not mixed together", "Night-morning-time", "Never mix twice"], answer: 0, explain: "NMT = not more than. It defines a maximum dose ceiling, often used for PRN medications." },
  { skill: "sig", level: 2, q: 'A sig reads "i cap PO QID x 7d." How many capsules should be dispensed?', options: ["14", "21", "28", "30"], answer: 2, explain: "1 cap × 4 times/day × 7 days = 28 capsules." },
  { skill: "sig", level: 3, q: 'Decode: "Apply thin film TOP BID to affected area UD"', options: ["Apply a thin film topically twice daily to affected area as directed", "Apply topically by mouth twice daily undiluted", "Apply a thin film to both eyes twice daily as directed", "Apply to affected area twice daily until dry"], answer: 0, explain: "TOP = topically, BID = twice daily, UD = as directed (ut dictum). This is a standard topical sig." },
  { skill: "sig", level: 3, q: '"i tab PO q12h" versus "i tab PO BID" — which statement is true?', options: ["They always mean the same thing", "q12h means strictly every 12 hours; BID is sometimes interpreted more loosely", "BID means strictly every 12 hours; q12h is flexible", "There is no difference in pharmacy practice"], answer: 1, explain: "q12h specifies a strict every-12-hour interval. BID can be interpreted as 'twice during waking hours' in some contexts — important for narrow-therapeutic-index drugs." },
  { skill: "sig", level: 3, q: 'A nasal spray sig reads "ii sprays each nostril QD." Total sprays delivered per day:', options: ["2", "4", "6", "8"], answer: 1, explain: "2 sprays × 2 nostrils × 1 time daily = 4 sprays per day." },
  { skill: "sig", level: 4, q: 'Why is the abbreviation "U" for units on the ISMP error-prone abbreviations list?', options: ["It is not a real abbreviation", "U can be misread as 0, 4, or cc — causing 10-fold dosing errors in insulin orders", "U is only valid for European prescriptions", "U should be spelled out only in pediatric orders"], answer: 1, explain: "U for 'units' is easily mistaken for 0 (zero) or the number 4, turning '10 U insulin' into '100 units.' Always write 'units' in full." },
  { skill: "sig", level: 4, q: 'An Rx says "MS 10 mg IV q4h PRN pain." Which ISMP concern does "MS" raise?', options: ["MS is acceptable for morphine sulfate only", "MS is ambiguous — could mean morphine sulfate or magnesium sulfate", "MS is never used in hospital settings", "MS is only an issue for oral orders"], answer: 1, explain: "MS appears on the ISMP Do Not Use list because it has been confused with magnesium sulfate. Write morphine sulfate or magnesium sulfate in full." },
  { skill: "sig", level: 4, q: 'Which of the following sigs contains an ISMP-flagged dangerous abbreviation?', options: ['"1 tab PO daily"', '"Apply 1 inch ribbon TOP BID"', '"Morphine 2 mg IV q4h PRN"', '"Give 10U insulin subcut before breakfast"'], answer: 3, explain: "'10U' uses 'U' for units — a Do Not Use abbreviation because it can be misread as '100.' Write '10 units' instead." },

  // ---- INTERACTIONS (continued) ----
  { skill: "interact", level: 1, q: "Which common antibiotic can reduce the effectiveness of oral contraceptives by a mechanism debated in the literature, and for which some guidelines still suggest back-up contraception?", options: ["Azithromycin", "Rifampin", "Clindamycin", "Nitrofurantoin"], answer: 1, explain: "Rifampin is a strong CYP3A4 inducer that clearly reduces ethinyl estradiol levels — back-up contraception is firmly recommended. Other antibiotics have less evidence." },
  { skill: "interact", level: 1, q: "Grapefruit juice interacts with many medications primarily by:", options: ["Increasing renal elimination", "Inhibiting intestinal CYP3A4, raising drug levels", "Activating hepatic enzymes to lower drug levels", "Chelating metals in the gut"], answer: 1, explain: "Grapefruit (and Seville orange) inhibit intestinal CYP3A4, reducing first-pass metabolism and raising blood levels of affected drugs such as statins, calcium channel blockers, and cyclosporine." },
  { skill: "interact", level: 2, q: "A patient on warfarin begins taking fluconazole for a vaginal infection. The expected effect on INR is:", options: ["INR decreases — fluconazole induces warfarin metabolism", "INR increases — fluconazole inhibits CYP2C9, raising warfarin levels", "No change — fluconazole does not interact with warfarin", "INR decreases — fluconazole displaces warfarin from albumin"], answer: 1, explain: "Fluconazole is a strong CYP2C9 inhibitor; it raises S-warfarin levels and can significantly increase INR. Monitor closely and consider dose reduction." },
  { skill: "interact", level: 2, q: "Metformin plus IV iodinated contrast media: the recommended precaution is:", options: ["No precaution needed", "Hold metformin at the time of contrast and for 48 hours; reassess renal function before restarting", "Double the metformin dose the day of contrast", "Switch permanently to insulin before the procedure"], answer: 1, explain: "Contrast media can cause transient renal impairment; accumulation of metformin in renal failure risks lactic acidosis. Hold metformin around the procedure per ADA/ACR guidance." },
  { skill: "interact", level: 2, q: "A patient on lithium starts a new course of ibuprofen. The most important concern is:", options: ["Reduced lithium effect", "Elevated lithium levels — NSAIDs reduce renal clearance", "Increased ibuprofen toxicity", "No significant interaction"], answer: 1, explain: "NSAIDs decrease prostaglandin-mediated renal blood flow, reducing lithium excretion. Lithium levels can rise into toxic range — use acetaminophen instead and monitor levels." },
  { skill: "interact", level: 3, q: "Amiodarone added to a regimen containing digoxin will most likely:", options: ["Lower digoxin levels by enzyme induction", "Raise digoxin levels by inhibiting P-glycoprotein and CYP3A4", "Cause serotonin syndrome", "Have no effect on digoxin"], answer: 1, explain: "Amiodarone inhibits P-gp and CYP3A4/2C9, significantly raising digoxin concentrations. Reduce the digoxin dose by ~50% and monitor levels and heart rate." },
  { skill: "interact", level: 3, q: "Combining an ACE inhibitor, ARB, and direct renin inhibitor (aliskiren) in the same patient is called 'dual or triple RAS blockade.' The main risk is:", options: ["Tachycardia and edema", "Hypotension, hyperkalemia, and acute kidney injury", "Hypokalemia and alkalosis", "Thrombocytopenia"], answer: 1, explain: "Triple RAS blockade dramatically increases hypotension, hyperkalemia, and AKI risk. Guidelines recommend against dual/triple combinations (especially ACE+ARB together) in most patients." },
  { skill: "interact", level: 3, q: "A patient on phenytoin is started on valproic acid. The expected interaction is:", options: ["Both drugs double in level — combined toxicity", "Valproic acid displaces phenytoin from protein binding and may inhibit its metabolism — monitor free phenytoin", "Phenytoin induces valproic acid metabolism, reducing valproate levels only", "No significant interaction exists between these two anticonvulsants"], answer: 1, explain: "Valproate displaces phenytoin from albumin (raising free fraction) and inhibits its CYP2C9 metabolism. Total phenytoin may look normal while free phenytoin is toxic — measure free levels." },
  { skill: "interact", level: 3, q: "A patient on tacrolimus (an immunosuppressant) is prescribed fluconazole. The expected change in tacrolimus levels:", options: ["Tacrolimus levels decrease significantly", "Tacrolimus levels increase significantly — fluconazole inhibits CYP3A4", "No change", "Tacrolimus levels decrease due to increased renal clearance"], answer: 1, explain: "Fluconazole strongly inhibits CYP3A4 and CYP2C19; tacrolimus is a CYP3A4 substrate. Levels can double or triple — monitor tacrolimus closely and reduce dose." },
  { skill: "interact", level: 4, q: "A patient on carbamazepine starts oral voriconazole for a fungal infection. The likely outcome:", options: ["Voriconazole levels increase due to CYP inhibition", "Carbamazepine induces CYP3A4/2C19, markedly lowering voriconazole levels — contraindicated", "Carbamazepine levels double", "No interaction expected"], answer: 1, explain: "Carbamazepine is a potent enzyme inducer; it virtually eliminates voriconazole exposure. This combination is listed as contraindicated — an alternative antifungal should be used." },
  { skill: "interact", level: 4, q: "Which statement best describes the interaction between quinolone antibiotics and sucralfate?", options: ["Sucralfate increases quinolone absorption", "Sucralfate's aluminum ions chelate the quinolone, reducing absorption by up to 90%", "Sucralfate delays but does not reduce peak quinolone levels", "There is no clinically relevant interaction"], answer: 1, explain: "Sucralfate releases Al³⁺ ions that chelate ciprofloxacin and other fluoroquinolones, drastically reducing bioavailability. Give the quinolone ≥2 hours before or ≥6 hours after sucralfate." },
  { skill: "interact", level: 4, q: "MAOIs are contraindicated with meperidine (pethidine) primarily because:", options: ["Both cause severe hypertension alone", "The combination can cause severe serotonin syndrome or excitatory toxicity with hyperthermia, rigidity, and cardiovascular collapse", "Both are renally cleared and cause toxic accumulation", "MAOI reduces meperidine metabolism, causing pure opioid overdose"], answer: 1, explain: "Meperidine has serotonergic properties; with an MAOI it can trigger a life-threatening excitatory serotonin reaction. Morphine or other mu-agonists are preferred if an opioid is needed." },
  { skill: "interact", level: 4, q: "A patient on stable warfarin starts cholestyramine for high cholesterol. You anticipate:", options: ["INR increases — cholestyramine inhibits warfarin metabolism", "INR decreases — cholestyramine binds warfarin in the gut, reducing its absorption", "No clinically meaningful change in INR", "INR increases due to vitamin K depletion"], answer: 1, explain: "Bile acid sequestrants like cholestyramine bind warfarin (and many drugs) in the GI tract. Separate doses by at least 4–6 hours and monitor INR closely." },
  { skill: "interact", level: 4, q: "St. John's Wort is most dangerous in transplant patients because:", options: ["It causes nephrotoxicity on its own", "It induces CYP3A4 and P-gp, dramatically lowering cyclosporine/tacrolimus levels and risking organ rejection", "It raises tacrolimus to toxic levels", "It blocks immunosuppressant receptors directly"], answer: 1, explain: "St. John's Wort is a potent CYP3A4/P-gp inducer. Transplant recipients have experienced acute rejection episodes when self-medicating with it. This is a contraindicated combination." },

  // ---- CALCULATIONS (continued) ----
  { skill: "calc", level: 1, q: "How many teaspoons are in 1 fluid ounce?", options: ["3 tsp", "6 tsp", "12 tsp", "15 tsp"], answer: 1, explain: "1 fl oz = 30 mL; 1 tsp = 5 mL; 30 ÷ 5 = 6 teaspoons per fluid ounce." },
  { skill: "calc", level: 1, q: "A patient weighs 176 pounds. What is their weight in kilograms? (1 kg = 2.2 lb)", options: ["60 kg", "70 kg", "80 kg", "88 kg"], answer: 2, explain: "176 ÷ 2.2 = 80 kg. Converting weight is essential for weight-based dosing calculations." },
  { skill: "calc", level: 2, q: "Rx: Amoxicillin 500 mg capsules, 1 cap PO TID × 10 days. Quantity to dispense:", options: ["20 capsules", "30 capsules", "40 capsules", "60 capsules"], answer: 1, explain: "1 cap × 3 times/day × 10 days = 30 capsules." },
  { skill: "calc", level: 2, q: "A drug is dosed at 10 mg/kg for a 65 kg adult. The ordered dose is:", options: ["65 mg", "650 mg", "6.5 mg", "6500 mg"], answer: 1, explain: "10 mg/kg × 65 kg = 650 mg. Always confirm the calculated dose falls within approved dose ranges." },
  { skill: "calc", level: 3, q: "Azithromycin Z-pack: 500 mg day 1, then 250 mg days 2–5. Total mg in the course:", options: ["1000 mg", "1250 mg", "1500 mg", "2000 mg"], answer: 1, explain: "500 mg + (250 mg × 4 days) = 500 + 1000 = 1500 mg total. Days supply = 5 days for 6 tablets." },
  { skill: "calc", level: 3, q: "A patient needs heparin 1200 units/hr. The bag is heparin 25,000 units in 500 mL D5W. Flow rate in mL/hr?", options: ["12 mL/hr", "24 mL/hr", "48 mL/hr", "60 mL/hr"], answer: 1, explain: "Concentration = 25,000 ÷ 500 = 50 units/mL. Rate = 1200 ÷ 50 = 24 mL/hr." },
  { skill: "calc", level: 3, q: "Phenytoin 7 mg/kg loading dose IV for a 70 kg patient. Dose in mg:", options: ["70 mg", "490 mg", "700 mg", "4900 mg"], answer: 1, explain: "7 mg/kg × 70 kg = 490 mg. Standard phenytoin loading doses range from 15–20 mg/kg; verify order appropriateness." },
  { skill: "calc", level: 4, q: "A child weighs 22 kg. Ibuprofen is dosed at 10 mg/kg/dose every 6–8 hours PRN. A 100 mg/5 mL suspension is available. How many mL per dose?", options: ["5.5 mL", "11 mL", "22 mL", "2.2 mL"], answer: 1, explain: "Dose = 10 × 22 = 220 mg. Volume = (220 ÷ 100) × 5 = 11 mL per dose." },
  { skill: "calc", level: 4, q: "Vancomycin 15 mg/kg IV q12h ordered for a 90 kg patient. Dose per administration (round to nearest 250 mg):", options: ["1000 mg", "1250 mg", "1500 mg", "1750 mg"], answer: 2, explain: "15 × 90 = 1350 mg. Rounded to nearest 250 mg = 1250 mg or 1500 mg (clinical practice varies; 1250 is the nearest 250-mg increment below, 1500 is above — many centers round up to 1500 mg)." },
  { skill: "calc", level: 4, q: "A topical cream tube holds 60 g. Sig: Apply BID to a 400 cm² area. Using the Fingertip Unit rule (1 FTU ≈ 0.5 g, covers ~100 cm²), how many days will the tube last?", options: ["~7 days", "~15 days", "~30 days", "~60 days"], answer: 1, explain: "400 cm² ÷ 100 cm²/FTU = 4 FTU per application × 0.5 g = 2 g/application × 2 applications/day = 4 g/day. 60 g ÷ 4 = 15 days." },

  // ---- COUNSELING (continued) ----
  { skill: "counsel", level: 1, q: "When counseling a patient starting a new rescue inhaler (albuterol), you should instruct them to:", options: ["Use it on a scheduled basis every 4 hours regardless of symptoms", "Shake it, exhale fully, inhale slowly while pressing, hold breath 10 seconds", "Breathe in rapidly and forcefully for best delivery", "Store it in the refrigerator between uses"], answer: 1, explain: "Proper MDI technique: shake, exhale fully, slow steady inhale coordinated with actuation, then hold breath ~10 seconds. Rapid inhalation deposits more drug in the throat." },
  { skill: "counsel", level: 1, q: "A patient picking up metformin for new-onset type 2 diabetes should be told the most common side effects are:", options: ["Hypoglycemia and weight gain", "GI upset — nausea, diarrhea, stomach pain — often improved by taking with food", "Frequent urination and thirst", "Severe rash and photosensitivity"], answer: 1, explain: "GI side effects are the most common reason for metformin discontinuation. Taking it with meals and titrating slowly reduces these effects. Metformin itself does not cause hypoglycemia." },
  { skill: "counsel", level: 2, q: "A patient starting isotretinoin must be enrolled in which risk-management program?", options: ["REMS (iPLEDGE) with monthly pregnancy tests and two forms of contraception for females of reproductive potential", "Routine pharmacy refill only — no special monitoring needed", "Liver function tests only, no contraceptive requirements", "MedGuide review only, once per prescription"], answer: 0, explain: "Isotretinoin is a severe teratogen. iPLEDGE requires monthly prescriptions, two forms of contraception, negative pregnancy tests, and prescriber/pharmacist/patient registration." },
  { skill: "counsel", level: 2, q: "A patient picks up sildenafil (Viagra) 50 mg. Which OTC medication should they be specifically warned not to combine with it?", options: ["Loratadine", "Nitroglycerin-containing products (including isosorbide mononitrate)", "Omeprazole", "Cetirizine"], answer: 1, explain: "PDE5 inhibitors combined with any nitrate cause severe potentially fatal hypotension. Patients must understand this includes long-acting nitrates for heart disease, not just SL nitroglycerin." },
  { skill: "counsel", level: 2, q: "The key counseling point about oral fluoroquinolones (e.g., ciprofloxacin, levofloxacin) is that patients should immediately report:", options: ["Mild insomnia and restlessness", "Tendon pain or swelling, especially the Achilles — stop and contact prescriber", "Loose stools on the first day", "Mild nausea with first dose"], answer: 1, explain: "Fluoroquinolones carry an FDA Black Box Warning for tendinopathy and tendon rupture (especially Achilles), which can occur during or weeks after treatment. Risk increases in patients >60, on steroids, or with renal disease." },
  { skill: "counsel", level: 3, q: "A patient is starting clonidine (Catapres) patch for hypertension. Which counseling point is most critical?", options: ["Apply the patch to the face for fastest absorption", "Never stop suddenly — abrupt discontinuation can cause rebound hypertension", "Patch must be applied daily to a new site", "Avoid use in cold weather as patch will not adhere"], answer: 1, explain: "Clonidine acts centrally; abrupt withdrawal causes rebound hypertension that can be severe. Taper the dose and educate patients not to stop without medical guidance." },
  { skill: "counsel", level: 3, q: "A patient starting spironolactone for heart failure asks about diet. The key counseling message is:", options: ["Increase potassium intake from bananas and supplements", "Avoid high-potassium foods and potassium-containing salt substitutes — risk of hyperkalemia", "Decrease sodium intake dramatically", "Take with high-fat meals for best absorption"], answer: 1, explain: "Spironolactone is a potassium-sparing diuretic; hyperkalemia is the main risk. Caution against potassium supplements and salt substitutes (which contain KCl), and counsel on monitoring." },
  { skill: "counsel", level: 3, q: "For a patient starting a fentanyl transdermal patch, the most important safe-storage counseling is:", options: ["Store unused patches in the refrigerator", "Keep all patches (new and used) away from children and pets; dispose of used patches by folding sticky sides together", "Leave the patch on for 48 hours, then replace", "Apply heat pads over the patch to activate the drug faster"], answer: 1, explain: "Even used fentanyl patches contain lethal amounts of drug. Accidental exposure in children has caused deaths. Used patches must be folded adhesive-in and flushed or placed in take-back programs." },
  { skill: "counsel", level: 4, q: "A patient on amiodarone for arrhythmia needs counseling about monitoring. Which of the following is NOT a known long-term adverse effect requiring monitoring?", options: ["Thyroid dysfunction (hypo and hyperthyroidism)", "Pulmonary toxicity", "Hepatotoxicity", "Severe hypoglycemia"], answer: 3, explain: "Amiodarone causes thyroid dysfunction, pulmonary toxicity, hepatotoxicity, corneal microdeposits, and photosensitivity — not hypoglycemia. Baseline and periodic TFTs, LFTs, PFTs, and eye exams are standard." },
  { skill: "counsel", level: 4, q: "A patient starting duloxetine (SNRI) for depression asks when they will see results. The best response:", options: ["Within 24 hours", "Symptom improvement typically takes 2–4 weeks; full effect may take 6–8 weeks", "Exactly one week", "Only after 3 months of consistent use"], answer: 1, explain: "Like all antidepressants, duloxetine's full therapeutic benefit emerges over weeks. Counsel patience, stress adherence, and warn against abrupt discontinuation (discontinuation syndrome)." },
  { skill: "counsel", level: 4, q: "A patient on long-term corticosteroids (prednisone) asks about stopping after 6 months. Your counseling:", options: ["Stop immediately — prolonged use is unsafe", "Taper gradually under physician guidance — HPA axis suppression requires slow tapering to prevent adrenal crisis", "Switch to a stronger steroid before stopping", "Cut the dose by half each day for two days, then stop"], answer: 1, explain: "Prolonged systemic corticosteroids suppress the hypothalamic-pituitary-adrenal axis. Abrupt discontinuation risks adrenal crisis. A physician-supervised taper is essential." },
  { skill: "counsel", level: 4, q: "A patient picking up lithium carbonate for the first time should receive counseling that includes:", options: ["Restrict fluid and salt intake to prevent toxicity", "Maintain consistent fluid and sodium intake; dehydration and low-sodium diets raise lithium levels", "Take only on days when mood is unstable", "Avoid all physical activity while on lithium"], answer: 1, explain: "Sodium and lithium share renal reabsorption pathways. Low Na or dehydration causes lithium retention and toxicity. Maintain steady hydration, and watch for NSAIDs, diuretics, and diet changes." },

  // ---- ERRORS (continued) ----
  { skill: "error", level: 2, q: "A prescription arrives written as '.5 mg' without a leading zero. The concern is:", options: ["The dose is too small to be clinically significant", "The decimal point may be missed, making it look like 5 mg — a 10-fold overdose", "This is acceptable shorthand in pharmacy", "Only an issue for IV medications"], answer: 1, explain: "A naked decimal ('.5 mg') is on the ISMP Do Not Use list. The decimal point can be missed, resulting in a 10-fold overdose. Always write '0.5 mg' with a leading zero." },
  { skill: "error", level: 2, q: "A patient's profile shows they are taking atenolol 25 mg daily. A new prescription arrives for metoprolol 50 mg daily for the same indication. This represents:", options: ["Appropriate therapy switch requiring refill only", "Potential duplicate therapy — two beta-blockers; verify the prescriber intended to discontinue atenolol", "A dangerous class interaction", "Normal combination for resistant hypertension"], answer: 1, explain: "Atenolol and metoprolol are both beta-1 selective blockers. Dispensing both for the same indication is duplicate therapy. Confirm that atenolol is being discontinued." },
  { skill: "error", level: 3, q: "A prescriber orders 'morphine 10 mg IV q4h' using the abbreviation 'MS.' The safety issue is:", options: ["The dose is too high for IV use", "MS is an ambiguous abbreviation — could mean morphine sulfate or magnesium sulfate", "IV morphine must always be ordered in mL", "No issue; MS is universally understood as morphine"], answer: 1, explain: "ISMP lists MS, MSO4, and MgSO4 as error-prone. MS has been dispensed as magnesium sulfate when morphine was intended and vice versa. Write the full drug name." },
  { skill: "error", level: 3, q: "A patient prescribed warfarin 5 mg daily also receives a new Rx for aspirin 325 mg daily without any note from the prescriber. The most appropriate action:", options: ["Dispense both — they are commonly combined", "Counsel and dispense with no call needed", "Hold the aspirin and contact the prescriber — combined use significantly raises bleeding risk without documented indication", "Reduce the warfarin to 2.5 mg and fill the aspirin"], answer: 2, explain: "While warfarin + low-dose aspirin is sometimes intentional (e.g., mechanical heart valve), 325 mg aspirin with warfarin significantly raises bleeding risk. Confirm indication before dispensing." },
  { skill: "error", level: 3, q: "An order reads 'Zantac 150 mg PO BID.' The concern in current practice is:", options: ["Zantac (ranitidine) was recalled due to NDMA carcinogen contamination and is no longer available in the US", "Zantac is too strong for OTC use", "BID dosing is not approved for this drug", "Zantac is only available IV"], answer: 0, explain: "Ranitidine (Zantac) was withdrawn from the US market in 2020 due to unacceptable levels of the probable carcinogen NDMA. Prescriptions should be switched to famotidine or another H2 blocker." },
  { skill: "error", level: 3, q: "A patient on clozapine for schizophrenia needs regular monitoring of which life-threatening adverse effect?", options: ["Hyperglycemia only", "Agranulocytosis — requires mandatory ANC monitoring via REMS program", "Hepatitis — weekly liver function tests required", "Renal failure — requires 48-hour creatinine monitoring"], answer: 1, explain: "Clozapine carries a Black Box Warning for potentially fatal agranulocytosis. It is available only through a REMS requiring regular absolute neutrophil count (ANC) monitoring." },
  { skill: "error", level: 4, q: "An Rx arrives for 'Tegretol 200 mg TID' for a new patient who also takes erythromycin. The most critical safety concern:", options: ["Erythromycin has no effect on carbamazepine", "Erythromycin inhibits CYP3A4, raising carbamazepine to potentially toxic levels — risk of diplopia, ataxia, and seizure worsening", "Carbamazepine renders erythromycin ineffective", "The combination is safe when doses are separated by 2 hours"], answer: 1, explain: "Carbamazepine (Tegretol) is a narrow-therapeutic-index CYP3A4 substrate; erythromycin is a moderate CYP3A4 inhibitor. Combined, carbamazepine levels can rise sharply. Prescriber contact and level monitoring are warranted." },
  { skill: "error", level: 4, q: "An order reads 'heparin 10,000 U/mL, flush 10 mL IV' for a central line. The error risk is:", options: ["No risk — this is standard heparin lock concentration", "Confusion of high-concentration heparin (10,000 U/mL) with heparin flush (10 U/mL or 100 U/mL) — a 100-fold to 1000-fold overdose risk", "Risk only in neonatal units", "The order is ambiguous only if no route is stated"], answer: 1, explain: "Heparin is a high-alert medication. High-concentration heparin vials have been mistakenly used for flushes, causing fatal overdoses. Standardize concentrations and use barcode verification." },
  { skill: "error", level: 4, q: "A prescriber orders 'potassium chloride 40 mEq IV push over 2 minutes' for a hospitalized patient. Your action:", options: ["Prepare and administer as ordered — the prescriber knows best", "This is an immediate intervention — IV KCl push is never appropriate; it causes fatal cardiac arrest. Must be administered diluted via infusion pump only.", "Reduce the dose by half and give the push", "Dilute in 10 mL NS and give over 5 minutes"], answer: 1, explain: "IV potassium chloride push is an absolute contraindication — rapid administration causes fatal ventricular fibrillation. KCl must be diluted (max 10–20 mEq/100 mL) and infused at ≤10–20 mEq/hr with monitoring." },
  { skill: "error", level: 4, q: "A caregiver refills their child's amoxicillin suspension early — only 5 days into a 10-day course. The most likely reason that warrants follow-up:", options: ["The pharmacy made a calculation error — fill as requested", "The child may have stopped the antibiotic early due to feeling better; counsel on completing the course and verify appropriateness of refill", "This is normal — refill anytime", "The prescriber must rewrite the Rx before any refill"], answer: 1, explain: "Stopping antibiotics early promotes resistance and risks relapse. This is a counseling opportunity — confirm the child finished the original supply, clarify the regimen, and involve the prescriber if the course was not completed." },
  { skill: "error", level: 4, q: "A 65-year-old patient with a sulfa allergy is prescribed celecoxib (Celebrex). The appropriate action:", options: ["Fill without question — sulfa and sulfonamide drug allergies are distinct from sulfonamide-derived drugs", "Refuse to fill — celecoxib is always contraindicated with sulfa allergy", "Contact the prescriber to clarify; celecoxib contains a sulfonamide moiety and the clinical significance is debated, warranting prescriber awareness", "Substitute with ibuprofen without notifying the prescriber"], answer: 2, explain: "Celecoxib has a sulfonamide moiety. Cross-reactivity with sulfonamide antibiotic allergy is debated but possible. Inform the prescriber of the allergy; risk-benefit and degree of prior reaction guide the decision." },

  // ---- OTC (continued) ----
  { skill: "otc", level: 1, q: "A patient asks for an OTC product to treat a vaginal yeast infection. Which ingredient is appropriate?", options: ["Miconazole (Monistat)", "Clotrimazole (Lotrimin) — for athlete's foot only", "Terbinafine", "Tolnaftate"], answer: 0, explain: "Miconazole (Monistat) is an FDA-approved OTC antifungal for vaginal candidiasis. Clotrimazole is also OTC-approved for vaginal use, but terbinafine and tolnaftate are for skin fungal infections only." },
  { skill: "otc", level: 1, q: "A patient asks which OTC antihistamine is least likely to cause drowsiness:", options: ["Diphenhydramine (Benadryl)", "Chlorpheniramine", "Loratadine (Claritin)", "Doxylamine"], answer: 2, explain: "Loratadine (and cetirizine, fexofenadine) are second-generation antihistamines — less sedating because they do not readily cross the blood-brain barrier." },
  { skill: "otc", level: 2, q: "A parent asks about giving OTC cough-and-cold products to their 2-year-old. The correct guidance is:", options: ["Use half the adult dose", "Give children's formulas freely — they are specially designed", "FDA advises against OTC cough/cold products in children under 4; do not recommend", "Only liquid forms are safe for toddlers"], answer: 2, explain: "FDA issued a public health advisory: OTC cough/cold products should not be used in children under age 4 due to serious adverse effects. Non-pharmacological options (saline, humidifier) are preferred." },
  { skill: "otc", level: 2, q: "A patient taking an MAOI antidepressant asks for an OTC cold remedy. Which ingredient is most dangerous in this context?", options: ["Guaifenesin", "Dextromethorphan (DXM)", "Sodium bicarbonate", "Vitamin C"], answer: 1, explain: "Dextromethorphan has serotonergic activity; with MAOIs it can trigger serotonin syndrome. Also avoid pseudoephedrine (hypertensive crisis risk). Guaifenesin alone is the safest OTC expectorant with MAOIs." },
  { skill: "otc", level: 2, q: "A patient with chronic kidney disease (CKD stage 4) asks for an OTC NSAID for joint pain. The best guidance:", options: ["Recommend ibuprofen at the lowest dose", "NSAIDs should generally be avoided — they can worsen renal function; recommend acetaminophen", "Naproxen is safer than ibuprofen in CKD", "Any NSAID is acceptable if taken with plenty of water"], answer: 1, explain: "NSAIDs reduce renal prostaglandin synthesis, decreasing glomerular filtration rate — dangerous in CKD. Acetaminophen (at appropriate doses) is the preferred analgesic for these patients." },
  { skill: "otc", level: 3, q: "A patient asks about using an OTC proton pump inhibitor (omeprazole 20 mg) daily for months because it 'works great.' Your response:", options: ["This is safe indefinitely — continue as needed", "OTC PPIs are approved for 14-day courses (up to 3 per year); long-term unsupervised use risks vitamin B12/magnesium deficiency and C. diff — refer to the prescriber", "Increase the dose to 40 mg daily instead", "Switch to an H2 blocker at double the dose for better long-term safety"], answer: 1, explain: "OTC omeprazole is intended for self-limited 14-day courses. Chronic uninvestigated symptoms can mask peptic ulcer disease, malignancy, or H. pylori. Long-term PPI use is associated with B12, Mg, and Ca deficiency and higher C. diff risk." },
  { skill: "otc", level: 3, q: "A patient who takes warfarin asks about topical OTC products for a skin rash. Which ingredient warrants the most caution?", options: ["Hydrocortisone 1%", "Zinc oxide", "Calamine lotion", "Topical salicylates (e.g., in some joint creams)"], answer: 3, explain: "Topical salicylates can be systemically absorbed in meaningful amounts, potentially raising bleeding risk in warfarin patients. Topical hydrocortisone, zinc oxide, and calamine are generally lower-risk choices." },
  { skill: "otc", level: 3, q: "Which OTC product is absolutely contraindicated in a patient taking a monoamine oxidase inhibitor (MAOI)?", options: ["Saline nasal spray", "Phenylephrine nasal decongestant", "Polyethylene glycol (MiraLax)", "Docusate sodium (Colace)"], answer: 1, explain: "Phenylephrine and pseudoephedrine (sympathomimetics) taken with an MAOI can cause a severe hypertensive crisis due to enhanced norepinephrine release. Saline, laxatives, and stool softeners have no such interaction." },
  { skill: "otc", level: 4, q: "A patient on dialysis with end-stage renal disease asks about OTC magnesium-containing antacids (e.g., Mylanta). The concern:", options: ["No concern — antacids are always safe OTC", "Magnesium is renally cleared; patients with renal failure can develop hypermagnesemia — use calcium-based antacids instead", "Magnesium antacids cause hypomagnesemia in renal failure", "Only aluminum-containing antacids are safe in renal failure"], answer: 1, explain: "Magnesium and aluminum both accumulate in renal failure. Magnesium → hypermagnesemia (respiratory depression, cardiac arrest); aluminum → aluminum toxicity. Calcium carbonate-based antacids are safer in ESRD." },
  { skill: "otc", level: 4, q: "A patient with G6PD (glucose-6-phosphate dehydrogenase) deficiency asks about OTC rasburicase — actually asks about high-dose vitamin C supplements. The concern:", options: ["No concern — vitamin C is safe regardless of G6PD status", "High-dose vitamin C can trigger hemolytic anemia in G6PD-deficient patients due to oxidative stress", "Vitamin C improves G6PD function and should be encouraged", "Only IV vitamin C is dangerous in G6PD deficiency"], answer: 1, explain: "G6PD-deficient red blood cells are vulnerable to oxidative stress. High-dose ascorbic acid can trigger hemolysis. Advise staying within normal dietary supplement doses (<500 mg/day) and monitoring." },
];

/* ============================================================
   FILL THE RX  (Mode 2)
   ============================================================ */
const RXCASES = [
  {
    level: 1,
    prescriber: "Dr. A. Reyes, MD",
    patient: "Patient: M. Donovan, 58 y/o",
    drug: "Lisinopril 10 mg tablet",
    sig: "i tab PO QD",
    qty: "#30",
    refills: "Refills: 5",
    steps: [
      { prompt: "Translate the sig for the patient label.", options: ["Take 1 tablet by mouth once daily", "Take 1 tablet by mouth twice daily", "Take 1 tablet under the tongue daily", "Take 1 tablet by mouth as needed"], answer: 0, explain: "i = 1, PO = by mouth, QD = once daily." },
      { prompt: "With #30 dispensed at 1 tab daily, what days supply do you bill?", options: ["15 days", "30 days", "60 days", "90 days"], answer: 1, explain: "30 tablets ÷ 1 per day = 30 days." },
      { prompt: "A useful counseling point for lisinopril is:", options: ["May cause a dry, persistent cough", "Turns urine orange", "Take only with grapefruit", "Causes drowsiness — don't drive"], answer: 0, explain: "ACE inhibitors commonly cause a dry cough; also counsel on angioedema warning signs and rising potassium." },
    ],
  },
  {
    level: 2,
    prescriber: "Dr. P. Nguyen, MD",
    patient: "Patient: L. Carter, 6 y/o · Allergies: Penicillin (hives)",
    drug: "Amoxicillin 250 mg/5 mL suspension",
    sig: "5 mL PO TID × 10 days",
    qty: "150 mL",
    refills: "Refills: 0",
    steps: [
      { prompt: "Before anything else — scan the profile. What do you do?", options: ["Fill it; pediatric dosing looks fine", "STOP — documented penicillin allergy; contact prescriber", "Halve the dose", "Substitute a different strength"], answer: 1, explain: "Amoxicillin is a penicillin. A documented PCN allergy means hold and verify with the prescriber before doing anything else." },
      { prompt: "Assume the prescriber switches to azithromycin and this Rx is voided. For the original, what was the daily volume?", options: ["5 mL/day", "10 mL/day", "15 mL/day", "30 mL/day"], answer: 2, explain: "5 mL × 3 times daily = 15 mL/day (good to verify the 150 mL / 10-day match)." },
      { prompt: "General counseling for an antibiotic suspension:", options: ["Shake well, complete the full course, refrigerate if labeled", "Stop when symptoms improve", "Mix into a hot drink", "Take only at bedtime"], answer: 0, explain: "Shake well for even dosing, finish the entire course to limit resistance, and follow storage instructions on the label." },
    ],
  },
  {
    level: 2,
    prescriber: "Dr. S. Okafor, MD",
    patient: "Patient: R. Singh, 67 y/o · Also buying OTC ibuprofen today",
    drug: "Warfarin 5 mg tablet",
    sig: "i tab PO QD",
    qty: "#30",
    refills: "Refills: 3",
    steps: [
      { prompt: "The patient sets ibuprofen on the counter with this Rx. The interaction is:", options: ["None — they're unrelated", "Increased bleeding risk; suggest acetaminophen & notify", "Reduced warfarin effect", "Liver toxicity"], answer: 1, explain: "NSAIDs add bleeding risk to warfarin (antiplatelet + GI effects). Recommend acetaminophen and flag the prescriber if regular use is planned." },
      { prompt: "Best warfarin counseling point:", options: ["Eat lots of spinach to balance it", "Keep vitamin K intake consistent & watch for unusual bleeding/bruising", "Skip INR checks if you feel fine", "Double up if you miss a dose"], answer: 1, explain: "Consistent vitamin K, regular INR monitoring, and reporting bleeding/bruising are the cornerstones of warfarin counseling." },
      { prompt: "Days supply for #30 at 1 tab daily:", options: ["30 days", "15 days", "45 days", "90 days"], answer: 0, explain: "30 ÷ 1 = 30 days." },
    ],
  },
  {
    level: 3,
    prescriber: "Dr. H. Bauer, MD",
    patient: "Patient: T. Alvarez, 49 y/o · Dx: Rheumatoid arthritis",
    drug: "Methotrexate 2.5 mg tablet",
    sig: "i tab PO DAILY",
    qty: "#30",
    refills: "Refills: 2",
    steps: [
      { prompt: "Review the sig against the diagnosis. What's the critical issue?", options: ["Dose is too low", "RA methotrexate is dosed WEEKLY — daily is a dangerous error", "Wrong route", "Quantity too small"], answer: 1, explain: "Oral methotrexate for RA is once-WEEKLY. Daily dosing causes severe, potentially fatal toxicity. Hold and clarify before dispensing." },
      { prompt: "After the prescriber confirms WEEKLY dosing, a key counseling point is:", options: ["Take folic acid as prescribed; avoid alcohol; keep lab appointments", "Take with grapefruit juice", "Stop all other meds", "Take a double dose if late"], answer: 0, explain: "Methotrexate patients typically take folic acid on non-MTX days, avoid alcohol (hepatotoxicity), and need routine CBC/LFT monitoring." },
    ],
  },
  {
    level: 4,
    prescriber: "Dr. M. Foster, MD",
    patient: "Patient: child, 20 kg · Dx: Otitis media",
    drug: "Amoxicillin 250 mg/5 mL suspension",
    sig: "Dose: 45 mg/kg/day ÷ BID",
    qty: "TBD",
    refills: "Refills: 0",
    steps: [
      { prompt: "First, total daily dose for a 20 kg child at 45 mg/kg/day:", options: ["450 mg/day", "900 mg/day", "225 mg/day", "1800 mg/day"], answer: 1, explain: "45 mg × 20 kg = 900 mg/day." },
      { prompt: "Divided BID, the dose per administration is:", options: ["900 mg", "450 mg", "225 mg", "300 mg"], answer: 1, explain: "900 mg ÷ 2 doses = 450 mg per dose." },
      { prompt: "Using 250 mg/5 mL, how many mL per dose?", options: ["5 mL", "9 mL", "10 mL", "4.5 mL"], answer: 1, explain: "450 mg ÷ 250 mg × 5 mL = 9 mL per dose." },
      { prompt: "For a 10-day course at 9 mL BID, how much to dispense?", options: ["90 mL", "150 mL", "180 mL", "270 mL"], answer: 2, explain: "9 mL × 2 × 10 days = 180 mL." },
    ],
  },

  // ── LEVEL 1 ──────────────────────────────────────────────────────────────
  {
    level: 1,
    prescriber: "Dr. K. Patel, MD",
    patient: "Patient: G. Torres, 54 y/o · Dx: Type 2 diabetes",
    drug: "Metformin 500 mg tablet",
    sig: "i tab PO BID",
    qty: "#60",
    refills: "Refills: 11",
    steps: [
      { prompt: "Translate the sig for the patient label.", options: ["Take 1 tablet by mouth twice daily", "Take 1 tablet by mouth once daily", "Take 1 tablet by mouth three times daily", "Take 2 tablets by mouth twice daily"], answer: 0, explain: "i = 1 tablet, PO = by mouth, BID = twice daily." },
      { prompt: "With #60 at 1 tablet twice daily, what is the days supply?", options: ["15 days", "30 days", "60 days", "90 days"], answer: 1, explain: "60 tablets ÷ 2 per day = 30 days." },
      { prompt: "The most important counseling point for metformin to reduce GI upset is:", options: ["Take on an empty stomach first thing in the morning", "Take with food and increase dose gradually", "Avoid all carbohydrates while on this drug", "Take with a full glass of grapefruit juice"], answer: 1, explain: "Metformin commonly causes nausea and diarrhea; taking with food and titrating the dose slowly significantly reduces GI side effects." },
    ],
  },
  {
    level: 1,
    prescriber: "Dr. L. Huang, MD",
    patient: "Patient: B. Osei, 61 y/o · Dx: Hyperlipidemia",
    drug: "Atorvastatin 40 mg tablet",
    sig: "i tab PO QHS",
    qty: "#30",
    refills: "Refills: 5",
    steps: [
      { prompt: "Translate 'QHS' for the patient label.", options: ["Every morning at breakfast", "At bedtime", "Twice daily", "Every other day"], answer: 1, explain: "QHS = quaque hora somni = at bedtime (hora somni). Statins are often dosed at night to match peak cholesterol synthesis." },
      { prompt: "Days supply for #30 at 1 tablet nightly:", options: ["15 days", "30 days", "60 days", "90 days"], answer: 1, explain: "30 tablets ÷ 1 per day = 30 days." },
      { prompt: "A key counseling point for atorvastatin is:", options: ["Report unexplained muscle pain or weakness promptly", "Take only with grapefruit juice to improve absorption", "Double the dose if cholesterol remains high after one week", "Stop taking it once you feel better"], answer: 0, explain: "Myopathy and rarely rhabdomyolysis are the most important adverse effects. Patients should report unexplained muscle pain, tenderness, or weakness. Grapefruit juice inhibits CYP3A4 and increases statin levels — avoid it." },
    ],
  },
  {
    level: 1,
    prescriber: "Dr. R. Owens, MD",
    patient: "Patient: C. Marsh, 34 y/o · Dx: Major depressive disorder",
    drug: "Sertraline 50 mg tablet",
    sig: "i tab PO QAM",
    qty: "#30",
    refills: "Refills: 5",
    steps: [
      { prompt: "Translate 'QAM' for the patient label.", options: ["Every evening", "Every morning", "Every other morning", "As needed"], answer: 1, explain: "QAM = quaque ante meridiem = every morning. Morning dosing is preferred to reduce insomnia risk." },
      { prompt: "The patient asks, 'How long until this works?' The best answer is:", options: ["It works within hours — you will feel it today", "Full antidepressant effect typically takes 4–6 weeks of consistent use", "If it hasn't worked in 3 days, ask for a higher dose", "It won't work unless you also change your diet"], answer: 1, explain: "SSRIs generally require 4–6 weeks to achieve full antidepressant effect; partial improvement may be seen in 1–2 weeks." },
      { prompt: "The most important safety counseling point about stopping sertraline is:", options: ["Stop immediately if you gain any weight", "Never stop abruptly — taper under prescriber supervision to avoid discontinuation syndrome", "You can stop any time once you feel better", "Stop immediately if you feel too happy"], answer: 1, explain: "Abrupt SSRI discontinuation causes a discontinuation syndrome (dizziness, electric-shock sensations, anxiety, nausea). Always taper with prescriber guidance." },
    ],
  },
  {
    level: 1,
    prescriber: "Dr. F. Dalton, MD",
    patient: "Patient: H. Kwan, 47 y/o · Dx: GERD",
    drug: "Omeprazole 20 mg delayed-release capsule",
    sig: "i cap PO QD AC",
    qty: "#30",
    refills: "Refills: 3",
    steps: [
      { prompt: "What does 'AC' mean in this sig?", options: ["After meals", "Before meals", "At bedtime", "As needed"], answer: 1, explain: "AC = ante cibum = before meals. Omeprazole should be taken 30–60 minutes before a meal for optimal acid suppression." },
      { prompt: "Days supply for #30 at 1 capsule daily:", options: ["15 days", "30 days", "45 days", "60 days"], answer: 1, explain: "30 capsules ÷ 1 per day = 30 days." },
      { prompt: "An important administration counseling point for delayed-release omeprazole capsules is:", options: ["Crush and mix in water for best absorption", "Swallow capsules whole — do not crush or chew", "Take with antacids for extra effect", "Take at bedtime for maximum effectiveness"], answer: 1, explain: "Delayed-release capsules have enteric coating that protects the drug from stomach acid; crushing destroys that protection. Swallow whole, taken before meals." },
    ],
  },

  // ── LEVEL 2 ──────────────────────────────────────────────────────────────
  {
    level: 2,
    prescriber: "Dr. T. Brennan, MD",
    patient: "Patient: M. Voss, 42 y/o · Dx: Hypothyroidism · Profile shows: ferrous sulfate 325 mg daily",
    drug: "Levothyroxine 88 mcg tablet",
    sig: "i tab PO QD AC 30 min before breakfast",
    qty: "#30",
    refills: "Refills: 11",
    steps: [
      { prompt: "Reviewing the profile, you see the patient also takes ferrous sulfate (iron). The key interaction is:", options: ["None — iron has no effect on levothyroxine", "Iron binds levothyroxine in the GI tract and significantly reduces absorption — separate by at least 4 hours", "Iron increases levothyroxine absorption and requires a dose reduction", "Iron causes thyroid toxicity"], answer: 1, explain: "Calcium, iron, antacids, and certain other minerals chelate levothyroxine in the gut, reducing absorption by up to 40%. Separate by at least 4 hours." },
      { prompt: "The correct way for the patient to take levothyroxine is:", options: ["With breakfast and iron supplement together", "On an empty stomach 30–60 minutes before the first meal of the day, separate iron by 4 hours", "With a large glass of milk", "Only at bedtime"], answer: 1, explain: "Empty-stomach administration ensures consistent absorption. Coffee, calcium, and iron all reduce absorption and should be separated." },
      { prompt: "Days supply for #30 at 1 tablet daily:", options: ["15 days", "30 days", "60 days", "90 days"], answer: 1, explain: "30 tablets ÷ 1 per day = 30 days." },
    ],
  },
  {
    level: 2,
    prescriber: "Dr. A. Jones, MD",
    patient: "Patient: W. Ruiz, 29 y/o · Dx: UTI · Profile: no known allergies · Also buying OTC Maalox today",
    drug: "Ciprofloxacin 500 mg tablet",
    sig: "i tab PO BID × 7 days",
    qty: "#14",
    refills: "Refills: 0",
    steps: [
      { prompt: "The patient is also buying Maalox (an antacid). The important counseling point is:", options: ["Antacids enhance ciprofloxacin absorption — take them together", "Antacids containing calcium, magnesium, or aluminum chelate fluoroquinolones and reduce absorption — separate by at least 2 hours", "Only liquid antacids interact with ciprofloxacin", "Maalox is fine; the interaction is not clinically significant"], answer: 1, explain: "Multivalent cations (Mg, Al, Ca) form chelate complexes with fluoroquinolones, reducing oral bioavailability by up to 90%. Take ciprofloxacin 2 hours before or 6 hours after antacids." },
      { prompt: "Days supply for #14 at 1 tablet BID:", options: ["7 days", "14 days", "10 days", "5 days"], answer: 0, explain: "14 tablets ÷ 2 per day = 7 days." },
      { prompt: "Which safety counseling point is most important for ciprofloxacin?", options: ["Report tendon pain or swelling — stop and contact prescriber immediately; also use sunscreen for photosensitivity", "Take with dairy to improve absorption", "It is safe to use at any age, including in children with bone infections", "Drowsiness is common — avoid driving"], answer: 0, explain: "Fluoroquinolones carry a black-box warning for tendinopathy and tendon rupture (especially Achilles). Photosensitivity is also a concern. Avoid concurrent dairy or antacids near dose time." },
    ],
  },
  {
    level: 2,
    prescriber: "Dr. N. Blake, MD",
    patient: "Patient: S. Okonjo, 38 y/o · Dx: Depression · OTC supplements on profile: St. John's Wort 300 mg TID",
    drug: "Fluoxetine 20 mg capsule",
    sig: "i cap PO QAM",
    qty: "#30",
    refills: "Refills: 5",
    steps: [
      { prompt: "Reviewing the profile, the patient takes OTC St. John's Wort. The interaction with fluoxetine is:", options: ["No interaction — it's just an herb", "Potentially serious: combining SSRIs with St. John's Wort increases serotonin and risk of serotonin syndrome — contact prescriber before dispensing", "St. John's Wort boosts fluoxetine's antidepressant effect safely", "St. John's Wort reduces fluoxetine levels, making it less effective only"], answer: 1, explain: "St. John's Wort has serotonergic activity and also induces CYP enzymes. Combined with an SSRI, it raises serotonin syndrome risk (agitation, hyperthermia, clonus). Contact the prescriber." },
      { prompt: "Signs of serotonin syndrome the patient should report include:", options: ["Dry mouth and constipation only", "Agitation, rapid heart rate, fever, muscle twitching or rigidity, diarrhea", "Only a mild headache", "Drowsiness and bradycardia"], answer: 1, explain: "Serotonin syndrome features a triad of mental status changes, autonomic instability, and neuromuscular abnormalities. Severe cases are life-threatening." },
    ],
  },
  {
    level: 2,
    prescriber: "Dr. C. Reeves, MD",
    patient: "Patient: D. Lambert, 55 y/o · Dx: Asthma exacerbation",
    drug: "Prednisone 40 mg tablet",
    sig: "i tab PO QD × 5 days",
    qty: "#5",
    refills: "Refills: 0",
    steps: [
      { prompt: "Days supply for #5 at 1 tablet daily:", options: ["5 days", "10 days", "3 days", "7 days"], answer: 0, explain: "5 tablets ÷ 1 per day = 5 days." },
      { prompt: "The most critical counseling point about stopping a short prednisone burst:", options: ["Stop immediately if you feel better after 2 days", "Complete the full 5-day course as directed — short bursts like this generally do not require a taper", "Stopping early is fine, it leaves your body faster", "Double the dose on the last day to compensate"], answer: 1, explain: "Short bursts (5 days or less) at moderate doses typically do not require a taper, but patients must complete the full course. Incomplete treatment risks undertreated exacerbation and rebound." },
      { prompt: "An important monitoring counseling point for prednisone, especially in this patient's context, is:", options: ["It lowers blood sugar — monitor for hypoglycemia", "It can raise blood glucose — monitor for elevated blood sugar, take with food, and report GI upset", "It has no GI effects and can be taken any time", "It requires dose separation from most other medications by 4 hours"], answer: 1, explain: "Corticosteroids cause hyperglycemia and GI irritation. Take with food. Patients with diabetes need closer glucose monitoring. Also counsel on not sharing medication." },
    ],
  },
  {
    level: 2,
    prescriber: "Dr. P. Hartley, MD",
    patient: "Patient: E. Nwosu, 73 y/o · Dx: Heart failure / hypertension · Profile: spironolactone 25 mg daily, potassium chloride 20 mEq daily",
    drug: "Lisinopril 5 mg tablet",
    sig: "i tab PO QD",
    qty: "#30",
    refills: "Refills: 3",
    steps: [
      { prompt: "Reviewing the full profile, lisinopril + spironolactone + potassium supplementation raises which concern?", options: ["Hypokalemia — too much potassium will be lost", "Hyperkalemia — ACE inhibitors and potassium-sparing diuretics both raise potassium; adding a supplement dramatically increases risk", "Hypocalcemia — these drugs deplete calcium", "No concern — all three are safe together in heart failure"], answer: 1, explain: "ACE inhibitors retain potassium; spironolactone is potassium-sparing; adding KCl supplementation can cause dangerous hyperkalemia. Verify with the prescriber before dispensing." },
      { prompt: "What is the appropriate next step before dispensing?", options: ["Fill it — heart failure patients always need potassium", "Contact the prescriber to review the potassium supplement in context of the new lisinopril and spironolactone", "Advise the patient to stop the spironolactone on their own", "Dispense and hope the patient gets labs soon"], answer: 1, explain: "This combination warrants prescriber review. A DUR flag for hyperkalemia risk requires clinical intervention, not assumption." },
      { prompt: "Days supply for #30 at 1 tablet daily:", options: ["15 days", "30 days", "60 days", "90 days"], answer: 1, explain: "30 tablets ÷ 1 per day = 30 days." },
    ],
  },

  // ── LEVEL 3 ──────────────────────────────────────────────────────────────
  {
    level: 3,
    prescriber: "Dr. J. Simmons, MD",
    patient: "Patient: V. Petrov, 66 y/o · Dx: Bipolar disorder · Profile: lithium carbonate 300 mg TID",
    drug: "Furosemide 40 mg tablet",
    sig: "i tab PO QD",
    qty: "#30",
    refills: "Refills: 3",
    steps: [
      { prompt: "What is the serious interaction between furosemide (a loop diuretic) and lithium?", options: ["Loop diuretics lower lithium levels — increase the dose", "Loop diuretics cause sodium loss, prompting renal lithium reabsorption and raising lithium levels to potentially toxic concentrations", "No interaction — they act on different systems", "Furosemide directly blocks lithium renal clearance via active transport inhibition"], answer: 1, explain: "Loop diuretics deplete sodium; the kidney compensates by reabsorbing both sodium and lithium in the proximal tubule, raising lithium serum levels and risking toxicity. Contact the prescriber before dispensing." },
      { prompt: "Symptoms of lithium toxicity the patient should watch for include:", options: ["Only dry mouth and constipation", "Tremor, nausea, diarrhea, confusion, slurred speech, and seizure at high levels", "Rash and photosensitivity", "Hyperactivity and insomnia only"], answer: 1, explain: "Early lithium toxicity: tremor, nausea, diarrhea. Moderate: confusion, ataxia, drowsiness. Severe: seizures, arrhythmias, coma. Narrow therapeutic index (0.6–1.2 mEq/L) requires close monitoring." },
      { prompt: "Your most appropriate action is:", options: ["Fill and counsel the patient to drink more water", "Hold the fill, contact the prescriber, flag the interaction in the patient record", "Fill but attach a warning label", "Dispense with a note to get lithium levels checked next month"], answer: 1, explain: "This is a major interaction that could precipitate lithium toxicity. The prescriber must be aware and may need to adjust the lithium dose or monitor levels more frequently." },
    ],
  },
  {
    level: 3,
    prescriber: "Dr. G. Fischer, MD",
    patient: "Patient: A. Moreau, 58 y/o · Dx: UTI · Profile: warfarin 5 mg QD (INR 2.3 last week)",
    drug: "Trimethoprim/Sulfamethoxazole DS (800/160 mg) tablet",
    sig: "i tab PO BID × 10 days",
    qty: "#20",
    refills: "Refills: 0",
    steps: [
      { prompt: "TMP/SMX is started in a patient on warfarin. The key interaction mechanism is:", options: ["TMP/SMX increases vitamin K, raising INR", "TMP/SMX inhibits CYP2C9, the primary enzyme metabolizing warfarin's S-enantiomer, causing warfarin accumulation and elevated INR", "TMP/SMX has no effect on warfarin", "TMP/SMX displaces warfarin from binding sites but has no net effect on INR"], answer: 1, explain: "TMP/SMX strongly inhibits CYP2C9, which metabolizes the more potent S-warfarin. INR can rise dramatically within days, increasing bleeding risk. The prescriber must be informed and INR monitoring intensified." },
      { prompt: "Days supply for #20 at 1 tablet BID:", options: ["20 days", "10 days", "5 days", "14 days"], answer: 1, explain: "20 tablets ÷ 2 per day = 10 days." },
      { prompt: "Your most appropriate action is:", options: ["Fill and tell the patient to call if they bleed", "Contact the prescriber to flag the CYP2C9 interaction, recommend more frequent INR monitoring, and counsel the patient to watch for bleeding signs", "Refuse to fill the prescription", "Fill and reduce the warfarin dose yourself"], answer: 1, explain: "This interaction is predictable and clinically significant. Contact the prescriber before or immediately after dispensing to plan INR re-check (often within 3–5 days of starting TMP/SMX)." },
    ],
  },
  {
    level: 3,
    prescriber: "Dr. M. Allen, MD",
    patient: "Patient: P. Linden, 45 y/o · Profile: venlafaxine 150 mg QD, sumatriptan 50 mg PRN migraine",
    drug: "Tramadol 50 mg tablet",
    sig: "i-ii tabs PO Q4-6H PRN pain",
    qty: "#40",
    refills: "Refills: 0",
    steps: [
      { prompt: "Adding tramadol to venlafaxine creates which serious risk?", options: ["Reduced pain control due to competitive binding", "Serotonin syndrome — both agents increase serotonergic tone; tramadol also inhibits serotonin reuptake", "Hypertensive crisis only", "Respiratory depression only — no serotonergic concern"], answer: 1, explain: "Tramadol is a weak opioid that also inhibits serotonin and norepinephrine reuptake. Combined with venlafaxine (SNRI), serotonin syndrome risk is significant. The sumatriptan on the profile adds another serotonergic agent." },
      { prompt: "The presence of sumatriptan on this patient's profile adds concern because:", options: ["Triptans prevent serotonin syndrome when co-administered with tramadol", "Triptans have serotonergic activity (5-HT agonists) and add to the cumulative serotonin burden, raising syndrome risk further", "Sumatriptan and tramadol are incompatible due to renal clearance competition", "It has no additional relevance"], answer: 1, explain: "Triptans activate 5-HT1B/D receptors; in combination with serotonergic drugs like SNRIs and tramadol, the cumulative effect can precipitate serotonin syndrome. Three-drug serotonergic combination warrants prescriber contact." },
      { prompt: "The appropriate action is:", options: ["Fill and send the patient home with a warning leaflet", "Hold the fill and contact the prescriber to discuss the serotonin syndrome risk from tramadol + venlafaxine + sumatriptan", "Fill the tramadol but advise the patient to stop sumatriptan", "Refuse to dispense any opioid on principle"], answer: 1, explain: "Three interacting serotonergic agents require prescriber-level decision-making. The pharmacist should communicate the risk clearly and let the prescriber determine whether an alternative analgesic is appropriate." },
    ],
  },
  {
    level: 3,
    prescriber: "Dr. R. Sampson, MD",
    patient: "Patient: Q. Adeyemi, 62 y/o · Dx: Hypertension, type 2 diabetes (on insulin glargine) · Profile: metoprolol succinate ER 50 mg QD (being discontinued per chart note)",
    drug: "Metoprolol Succinate ER 50 mg tablet",
    sig: "STOP — do not fill",
    qty: "#0",
    refills: "Refills: 0",
    steps: [
      { prompt: "Wait — the patient presents a new Rx for metoprolol succinate ER 50 mg QD (no taper noted), and you see on their chart they were supposed to stop it. The prescriber just wrote a new fill. You notice the patient is diabetic on insulin. Which concern about abrupt beta-blocker discontinuation should you verify?", options: ["Abrupt discontinuation has no cardiac risk", "Abrupt cessation can cause rebound tachycardia, hypertension, and angina; the prescriber may have intended a taper — clarify before dispensing", "Just fill it — continuing the drug is always better than stopping", "Abrupt discontinuation lowers blood pressure safely in hypertensive patients"], answer: 1, explain: "Abrupt beta-blocker cessation causes rebound sympathetic activity: tachycardia, hypertension, and potential angina exacerbation. This always warrants prescriber clarification on intent and taper plan." },
      { prompt: "In this patient's context as an insulin-dependent diabetic, a notable pharmacodynamic concern with beta-blockers is:", options: ["Beta-blockers prevent all hypoglycemia symptoms equally", "Beta-blockers (especially non-selective) blunt tachycardia — the key early warning sign of hypoglycemia — potentially masking a dangerous low blood sugar", "Beta-blockers cause hyperglycemia only, not hypoglycemia masking", "This is only relevant to oral hypoglycemics, not insulin"], answer: 1, explain: "Beta-blockers blunt the adrenergic symptoms of hypoglycemia (especially palpitations/tremor). Diaphoresis is preserved. Insulin-dependent diabetics on beta-blockers need extra vigilance and glucose monitoring." },
    ],
  },

  // ── LEVEL 4 ──────────────────────────────────────────────────────────────
  {
    level: 4,
    prescriber: "Dr. H. Osei, MD",
    patient: "Patient: R. Holloway, 78 y/o · Dx: Atrial fibrillation · Profile: digoxin 0.125 mg QD (serum level 0.9 ng/mL last month)",
    drug: "Clarithromycin 500 mg tablet",
    sig: "i tab PO BID × 14 days",
    qty: "#28",
    refills: "Refills: 0",
    steps: [
      { prompt: "Clarithromycin is added to a patient stabilized on digoxin. The mechanism of the critical interaction is:", options: ["Clarithromycin increases renal clearance of digoxin, lowering levels", "Clarithromycin inhibits P-glycoprotein (P-gp) and CYP3A4, reducing digoxin efflux and increasing serum digoxin levels to potentially toxic concentrations", "The two drugs compete for the same receptor with no net effect", "Clarithromycin alkalinizes urine, reducing digoxin absorption"], answer: 1, explain: "Digoxin is a P-gp substrate. Clarithromycin inhibits P-gp in the gut and kidney, dramatically reducing digoxin efflux and raising serum levels. Digoxin has a narrow therapeutic index (0.5–2 ng/mL); toxicity is life-threatening." },
      { prompt: "Days supply for #28 at 1 tablet BID:", options: ["14 days", "28 days", "7 days", "10 days"], answer: 0, explain: "28 tablets ÷ 2 per day = 14 days." },
      { prompt: "Early signs of digoxin toxicity the patient and caregiver should watch for include:", options: ["Only chest pain and shortness of breath", "Nausea, vomiting, visual disturbances (yellow-green halos, blurry vision), bradycardia, and confusion", "Only insomnia and headache", "Skin rash and joint pain"], answer: 1, explain: "Classic digoxin toxicity: GI (nausea/vomiting), visual disturbances (xanthopsia — yellow-green halos), and cardiac arrhythmias. Narrow therapeutic index means toxicity can occur even within or just above normal range." },
      { prompt: "Your most appropriate action is:", options: ["Fill and say nothing — the prescriber decided", "Hold, contact the prescriber about the P-gp interaction and digoxin toxicity risk, suggest monitoring serum digoxin levels or choosing an alternative antibiotic", "Fill but tell the patient to skip every other digoxin dose", "Refuse to fill the clarithromycin under any circumstances"], answer: 1, explain: "This is a potentially life-threatening drug interaction. Pharmacist intervention — notifying the prescriber and suggesting serum level monitoring or an alternative antibiotic (e.g., azithromycin, though some interaction remains, or amoxicillin if appropriate) — is essential." },
    ],
  },
  {
    level: 4,
    prescriber: "Dr. S. Becker, MD",
    patient: "Patient: I. Romero, 28 y/o · Dx: Epilepsy",
    drug: "Phenytoin 300 mg capsule",
    sig: "i cap PO QHS",
    qty: "#30",
    refills: "Refills: 5",
    steps: [
      { prompt: "What makes phenytoin's pharmacokinetics uniquely dangerous compared to most drugs?", options: ["It follows first-order (linear) kinetics like all other drugs", "Phenytoin follows zero-order (saturable, Michaelis-Menten) kinetics at therapeutic doses — small dose increases cause disproportionately large jumps in serum levels", "Phenytoin has an unusually long half-life but linear kinetics", "It is rapidly cleared and requires dosing every 4 hours"], answer: 1, explain: "Phenytoin's hepatic metabolism saturates within the therapeutic range. Above that point, a small dose increase causes a disproportionately large rise in plasma levels, making toxicity easy to produce inadvertently." },
      { prompt: "Days supply for #30 at 1 capsule nightly:", options: ["30 days", "15 days", "60 days", "90 days"], answer: 0, explain: "30 capsules ÷ 1 per day = 30 days." },
      { prompt: "The patient also takes a daily iron supplement. The important counseling point is:", options: ["Iron supplements are safe to take simultaneously with phenytoin", "Iron can reduce phenytoin absorption — separate by at least 2–4 hours", "Phenytoin raises iron levels and requires dose reduction of the supplement", "There is no interaction between phenytoin and iron"], answer: 1, explain: "Phenytoin bioavailability is reduced by concurrent iron supplementation. Administer phenytoin 2–4 hours before or after iron. Other counseling includes gingival hyperplasia (regular dental care), hirsutism, and not missing doses." },
      { prompt: "A unique long-term adverse effect of phenytoin requiring routine monitoring is:", options: ["Kidney stones", "Gingival (gum) hyperplasia — regular dental hygiene and dental visits are essential", "Cataract formation", "Permanent hair loss"], answer: 1, explain: "Phenytoin causes gingival overgrowth (hyperplasia) in a significant portion of patients. Good oral hygiene and regular dental care reduce severity. Other chronic concerns include osteoporosis and peripheral neuropathy." },
    ],
  },
  {
    level: 4,
    prescriber: "Dr. O. Mbeki, MD",
    patient: "Patient: F. Huang, 66 y/o · Dx: Type 1 diabetes · New patient — profile shows Humulin R (regular insulin) has been dispensed here previously",
    drug: "Insulin glargine 100 units/mL (Lantus) injection",
    sig: "Inject 20 units SQ QHS",
    qty: "1 vial (10 mL)",
    refills: "Refills: 2",
    steps: [
      { prompt: "You notice the patient's previous fills at your pharmacy were for Humulin R (regular insulin). The most important safety check is:", options: ["Make sure the patient knows these are interchangeable and can be mixed freely", "Clarify that insulin glargine and Humulin R are NOT interchangeable — they have different onset/duration profiles; insulin glargine is basal (24-hour) and cannot be mixed with other insulins", "Confirm the same dose is appropriate for both insulins without prescriber input", "No concern — all insulins work the same way"], answer: 1, explain: "Insulin glargine (Lantus) and regular insulin (Humulin R) are LASA (look-alike, sound-alike) drug pair risk. Glargine is long-acting basal insulin; Humulin R is short-acting. Mixing them or confusing doses can cause severe hypoglycemia or hyperglycemia." },
      { prompt: "Regarding storage: how should unopened insulin glargine vials be stored, and once in use?", options: ["Always at room temperature; opened vials last 6 months", "Unopened: refrigerated (36–46°F); once opened (in use): may be kept at room temperature (below 77°F) for up to 28 days, away from heat and light", "Always frozen until the day of use", "In use vials must stay refrigerated at all times"], answer: 1, explain: "Unopened insulin glargine: refrigerator until expiration. In-use vials: room temperature (up to 77°F / 25°C) for up to 28 days. Never freeze insulin — it denatures the protein. Keep away from direct heat and light." },
      { prompt: "An important injection technique counseling point for insulin glargine is:", options: ["Always inject in the same spot to build 'technique memory'", "Rotate injection sites within and between regions (abdomen, thigh, upper arm) to prevent lipohypertrophy, which impairs absorption", "Only inject in the abdomen for all long-acting insulins", "Mix glargine with rapid-acting insulin in the same syringe for convenience"], answer: 1, explain: "Rotating injection sites prevents lipohypertrophy (fatty nodules) — injecting repeatedly into hypertrophic tissue causes unpredictable insulin absorption and poor glycemic control. Insulin glargine must NOT be mixed with other insulins." },
    ],
  },
];

/* ============================================================
   AT THE COUNTER  (Mode 3)
   ============================================================ */
const SCENARIOS = [
  {
    skill: "counsel", level: 1,
    who: "First-time statin patient",
    situation: "A patient picking up their first atorvastatin asks, “Is there anything I should watch out for?”",
    choices: [
      { text: "Mention to report unexplained muscle pain/weakness, and that it's taken long-term.", verdict: "best", fb: "Exactly — muscle symptoms are the key safety counseling point, plus setting the expectation of ongoing therapy." },
      { text: "Say “No, statins are totally safe, nothing to worry about.”", verdict: "bad", fb: "Dismissive and inaccurate — you'd miss the chance to counsel on myopathy warning signs." },
      { text: "Tell them to stop immediately if they feel anything unusual.", verdict: "ok", fb: "Reporting symptoms is right, but advising abrupt self-discontinuation isn't ideal — they should contact the prescriber/pharmacist." },
    ],
  },
  {
    skill: "otc", level: 2,
    who: "Pregnant customer",
    situation: "A visibly pregnant customer asks you to recommend ibuprofen for a tension headache.",
    choices: [
      { text: "Suggest acetaminophen instead and advise checking with her OB if it persists.", verdict: "best", fb: "Right call — acetaminophen is preferred; NSAIDs are generally avoided in pregnancy, especially the 3rd trimester." },
      { text: "Hand her the ibuprofen — it's just one dose.", verdict: "bad", fb: "NSAIDs are generally avoided in pregnancy; don't recommend them without clinician input." },
      { text: "Refuse to help and tell her to ask her doctor.", verdict: "ok", fb: "Deferring to the OB is safe, but you can still offer the appropriate OTC option (acetaminophen) and be helpful." },
    ],
  },
  {
    skill: "interact", level: 3,
    who: "Possible cardiac emergency",
    situation: "A man says he takes sildenafil and is now having chest pain — a bystander offered him a nitroglycerin tablet. He asks if he should take it.",
    choices: [
      { text: "Tell him NOT to take nitro (dangerous drop in blood pressure with sildenafil) and call 911 now.", verdict: "best", fb: "Correct and urgent — nitrates + PDE5 inhibitors can cause fatal hypotension. Chest pain itself needs emergency care." },
      { text: "Say it's fine, nitroglycerin always helps chest pain.", verdict: "bad", fb: "Dangerous — the sildenafil interaction can cause life-threatening hypotension, and you're delaying emergency care." },
      { text: "Tell him to sit down and wait to see if it passes.", verdict: "bad", fb: "Waiting on possible cardiac chest pain is unsafe. This needs emergency activation immediately." },
    ],
  },
  {
    skill: "counsel", level: 2,
    who: "New inhaler user",
    situation: "A patient is starting a fluticasone (inhaled corticosteroid) inhaler and asks how to avoid side effects.",
    choices: [
      { text: "Counsel to rinse and spit after each use to prevent oral thrush; use a spacer if available.", verdict: "best", fb: "Spot on — rinsing reduces oral candidiasis, and a spacer improves delivery." },
      { text: "Tell them to use it only when they feel short of breath.", verdict: "bad", fb: "That's rescue-inhaler logic. Inhaled corticosteroids are controllers used regularly, not PRN." },
      { text: "Say there are no real side effects to worry about.", verdict: "ok", fb: "Misses the thrush counseling — rinsing is the simple, important tip." },
    ],
  },
  {
    skill: "error", level: 3,
    who: "Suspicious pediatric dose",
    situation: "A prescription for a 3-year-old lists an adult-strength dose of a medication. The parent is in a hurry.",
    choices: [
      { text: "Hold the fill and contact the prescriber to verify the dose before dispensing.", verdict: "best", fb: "Always verify a suspected dosing error — patient safety outranks speed, even with an impatient customer." },
      { text: "Fill it as written; the doctor knows best.", verdict: "bad", fb: "Pharmacists are the final safety check. A suspected pediatric overdose must be verified, not assumed correct." },
      { text: "Cut the adult dose down yourself and dispense.", verdict: "bad", fb: "Don't unilaterally change a dose — clarify with the prescriber and document." },
    ],
  },
  {
    skill: "otc", level: 3,
    who: "Older adult, sleep aid",
    situation: "An 80-year-old wants to buy diphenhydramine to take every night for sleep.",
    choices: [
      { text: "Gently caution about confusion/falls in older adults and suggest discussing safer options with their doctor.", verdict: "best", fb: "Diphenhydramine is on the Beers list — anticholinergic risks matter most in older adults. Counsel and suggest alternatives." },
      { text: "Sell it without comment — it's OTC.", verdict: "bad", fb: "Legal to sell, but you'd miss an important safety conversation for an at-risk patient." },
      { text: "Tell them to take a double dose so it lasts all night.", verdict: "bad", fb: "Higher anticholinergic exposure increases harm. Never suggest exceeding labeled dosing." },
    ],
  },
  {
    skill: "counsel", level: 2,
    who: "Antibiotic + party plans",
    situation: "A patient picking up metronidazole mentions they have a wedding this weekend with an open bar.",
    choices: [
      { text: "Warn them to avoid alcohol during treatment and ~3 days after (disulfiram-like reaction).", verdict: "best", fb: "Right — alcohol + metronidazole causes flushing, nausea, and vomiting. Proactive counseling saves them a miserable night." },
      { text: "Say a couple of drinks are fine.", verdict: "bad", fb: "Even small amounts can trigger the reaction. Advise avoidance." },
      { text: "Say nothing — it's not your business.", verdict: "ok", fb: "They volunteered the info — this is exactly when proactive counseling matters." },
    ],
  },
  {
    skill: "otc", level: 2,
    who: "Worried parent",
    situation: "A parent wants aspirin to bring down their 8-year-old's fever from a cold.",
    choices: [
      { text: "Recommend acetaminophen or age-appropriate ibuprofen and explain the Reye's syndrome risk with aspirin.", verdict: "best", fb: "Correct — aspirin is avoided in children with viral illness due to Reye's syndrome." },
      { text: "Hand them children's aspirin.", verdict: "bad", fb: "Aspirin in a febrile child risks Reye's syndrome — avoid it." },
      { text: "Tell them fevers don't need treatment, just wait it out.", verdict: "ok", fb: "Low-grade fevers may not need meds, but you should still steer them away from aspirin and toward safe options." },
    ],
  },
  {
    skill: "counsel", level: 4,
    who: "Frustrated customer, early refill",
    situation: "An angry customer demands you refill their controlled-substance pain med a week early because they're “going on vacation.” They're raising their voice.",
    choices: [
      { text: "Stay calm, empathize, explain you can't fill a controlled substance early per regulations, and offer to check vacation-supply options or contact the prescriber.", verdict: "best", fb: "Balances service with the law — de-escalate, explain clearly, and offer legitimate pathways (vacation override, prescriber contact)." },
      { text: "Fill it early to avoid a scene.", verdict: "bad", fb: "Caving on a controlled substance to avoid conflict is a compliance and safety failure." },
      { text: "Tell them to leave and stop wasting your time.", verdict: "bad", fb: "Hostility escalates the situation and damages trust. Professional de-escalation is the standard." },
    ],
  },
  {
    skill: "interact", level: 2,
    who: "Warfarin patient at the OTC aisle",
    situation: "A regular warfarin patient asks you which cold-and-flu product is okay — they've picked one containing ibuprofen.",
    choices: [
      { text: "Steer them to a product without NSAIDs/aspirin and flag the bleeding-risk interaction.", verdict: "best", fb: "NSAIDs raise bleeding risk on warfarin — guide them to acetaminophen-based options and counsel accordingly." },
      { text: "Say all cold products are fine.", verdict: "bad", fb: "NSAID-containing products add real bleeding risk for warfarin patients." },
      { text: "Tell them to just take half as much.", verdict: "ok", fb: "Reducing dose doesn't eliminate the risk — better to avoid NSAIDs and pick a safer product." },
    ],
  },

  {
    skill: "counsel", level: 2,
    who: "Patient refusing new medication",
    situation: "After you hand over a new prescription for lisinopril, the patient says, 'I looked this up online and I'm not taking it — I read it destroys your kidneys.' They fold the bag closed and cross their arms.",
    choices: [
      { text: "Acknowledge their concern, briefly clarify that lisinopril actually protects kidney function in most patients, and offer to call the prescriber together if they still have doubts.", verdict: "best", fb: "Respecting autonomy while correcting a misconception and connecting them to the prescriber is the ideal pharmacist response — informative, non-coercive, and collaborative." },
      { text: "Tell them they have to take it and hand the bag back.", verdict: "bad", fb: "Patients have the right to refuse treatment. Pressuring them damages trust and is not professional." },
      { text: "Say 'That's your choice' and end the conversation.", verdict: "ok", fb: "Respecting autonomy is correct, but abandoning the conversation without offering accurate information or a path forward misses the pharmacist's counseling role." },
    ],
  },
  {
    skill: "counsel", level: 3,
    who: "Confused elderly warfarin patient",
    situation: "An 82-year-old patient picks up warfarin and says, 'My doctor changed my dose but I don't understand — I've been taking one white tablet, and now you're giving me two different colors. Did something go wrong?' Their hands are shaking slightly as they hold the bag.",
    choices: [
      { text: "Sit with them, confirm the new dose matches the prescriber's order, show them which tablet is which using the pill markings, give a simple written summary (e.g., 'Monday/Wednesday/Friday = 7.5 mg; other days = 5 mg'), and tell them to call if confused at home.", verdict: "best", fb: "Warfarin dosing errors in the elderly are dangerous. Clear, patient-centered communication — including written take-home instructions — is essential for this high-stakes medication." },
      { text: "Hand them an official package insert and tell them to read the dosing table.", verdict: "bad", fb: "Dense package inserts are inappropriate for a confused elderly patient. This sets them up for a dosing error." },
      { text: "Call the prescriber to double-check the dose change, then explain it to the patient.", verdict: "ok", fb: "Verifying is good practice, but you can also do this while showing the patient the current prescription. Taking only this step without patient-friendly counseling is incomplete." },
    ],
  },
  {
    skill: "counsel", level: 3,
    who: "Language barrier",
    situation: "A patient approaches the window for a new metformin prescription. They speak very limited English, and through gestures and a few words it becomes clear they don't understand any of the English instructions you're giving. A family member with them also struggles with English.",
    choices: [
      { text: "Locate an interpreter (telephone interpreter service, bilingual staff, or approved translation app), provide or arrange a translated label, and use demonstration with the tablet and a visual aid to confirm understanding.", verdict: "best", fb: "Language access is a legal and ethical obligation under Title VI. Using interpreter services and visual demonstration ensures informed consent and medication safety." },
      { text: "Speak loudly and slowly in English — they'll get the gist.", verdict: "bad", fb: "Speaking louder doesn't bridge a language gap and can be demeaning. This patient cannot give informed consent to their medication without language support." },
      { text: "Dispense the medication with only the English label and trust the family to figure it out later.", verdict: "ok", fb: "While not ideal, giving family the medication is better than nothing, but the pharmacy has an obligation to ensure the patient understands their regimen — relying on an untrained family interpreter without attempting formal language services falls short." },
    ],
  },
  {
    skill: "error", level: 3,
    who: "Caregiver picking up C-III",
    situation: "A man arrives to pick up a controlled substance (C-III) for his homebound mother who cannot travel. You don't know this person and the prescription is in his mother's name.",
    choices: [
      { text: "Request government-issued photo ID for the person picking up, document the name and relationship in the dispensing record, and verify the mother's identity and address against the prescription. Dispense only after proper documentation.", verdict: "best", fb: "DEA regulations and most state laws require ID verification and documentation when a designated representative picks up a controlled substance. This protects the patient and the pharmacy from diversion." },
      { text: "Hand it over — he says he's her son, that's good enough.", verdict: "bad", fb: "Verbal claims of identity are not sufficient for controlled substance pickups. ID and documentation are required by federal and state law." },
      { text: "Refuse to dispense entirely unless the patient comes in person.", verdict: "ok", fb: "Strictly safe, but unnecessarily burdensome for a homebound patient. Proper ID and documentation allow a designated representative to pick up legally — it's the standard professional approach." },
    ],
  },
  {
    skill: "error", level: 4,
    who: "Suspicious C-II early refill",
    situation: "A patient presents for a Schedule II opioid refill 9 days early. Pulling the dispensing history, you see this is the third time this year they've come in significantly early. Their demeanor is agitated and they are insisting they 'lost' the pills.",
    choices: [
      { text: "Politely explain you cannot dispense a C-II early per federal law, document the encounter, check the state PDMP, note the pattern in the patient record, and consider notifying the pharmacist-in-charge and prescriber without being accusatory toward the patient.", verdict: "best", fb: "Federal law prohibits early refills of CII controlled substances. A PDMP check and prescriber notification — without confronting or accusing the patient — is the professional, legally compliant response to a pattern of concern." },
      { text: "Fill it — they said they lost them, and arguing causes a scene.", verdict: "bad", fb: "Filling a CII early is illegal regardless of the reason given. Lost medication claims require prescriber authorization and cannot override federal dispensing law." },
      { text: "Accuse the patient of drug-seeking behavior and refuse to serve them.", verdict: "bad", fb: "Accusatory language is unprofessional and potentially harmful. The correct approach is firm but non-judgmental: explain policy, document, and notify the prescriber and pharmacist-in-charge." },
    ],
  },
  {
    skill: "interact", level: 3,
    who: "Sertraline patient wants DayQuil",
    situation: "A patient picking up their sertraline refill asks if they can use DayQuil (which contains dextromethorphan/DXM) for their cold.",
    choices: [
      { text: "Explain that DXM combined with an SSRI like sertraline can increase serotonin activity and risk serotonin syndrome, and recommend a DXM-free alternative (e.g., guaifenesin-only cough products).", verdict: "best", fb: "Dextromethorphan inhibits serotonin reuptake and may act on sigma receptors; combined with SSRIs it can precipitate serotonin syndrome. Guaifenesin-only products are a safe alternative for cough." },
      { text: "Say DayQuil is fine — it's just an OTC cold medicine.", verdict: "bad", fb: "DXM is a serotonergic agent. Dismissing this interaction could result in serotonin syndrome." },
      { text: "Tell them to stop sertraline for a few days while they take DayQuil.", verdict: "bad", fb: "Advising self-discontinuation of an SSRI is inappropriate and risks discontinuation syndrome. Recommend a safe OTC alternative instead." },
    ],
  },
  {
    skill: "counsel", level: 1,
    who: "Generic substitution confusion",
    situation: "A patient comes to the counter upset: 'You gave me the wrong pill — the shape and color are completely different from what I had last month.'",
    choices: [
      { text: "Calmly explain that generic medications may look different (different manufacturer) but contain the same active ingredient, same dose, and same FDA-approved standards. Offer to show them the label and compare with the previous fill.", verdict: "best", fb: "Generic substitution confusion is one of the most common counseling moments. A clear, reassuring explanation that focuses on the active ingredient and FDA equivalence builds patient trust and medication adherence." },
      { text: "Shrug and say 'We just give out what we get — it might be wrong, I'd check.'", verdict: "bad", fb: "Expressing doubt about your own dispensing without basis is harmful to patient confidence and adherence. This is a counseling moment, not a disclaimer." },
      { text: "Offer to order the brand name and tell them to come back in a few days.", verdict: "ok", fb: "Accommodating the patient's preference is fine, but skipping the educational explanation leaves them confused and potentially non-adherent in the meantime." },
    ],
  },
  {
    skill: "error", level: 3,
    who: "Husband asking about wife's prescription",
    situation: "A man approaches the counter and says, 'My wife has a prescription here — can you tell me what it's for and if it's ready? Her name is Janet Green.' He seems casual and friendly, not urgent.",
    choices: [
      { text: "Politely explain that you cannot confirm or deny prescription information for another person without their authorization on file, and invite Janet to call or come in to set up access for him.", verdict: "best", fb: "HIPAA prohibits disclosing protected health information without patient authorization. The professional response is to neither confirm nor deny, and to invite the patient to authorize access." },
      { text: "Look up the prescription and tell him what she's taking — he's her husband.", verdict: "bad", fb: "Marriage does not constitute HIPAA authorization. Disclosing a patient's prescription information to a third party without authorization is a federal privacy violation." },
      { text: "Ask him for his wife's date of birth to verify her identity, then tell him if it's ready.", verdict: "bad", fb: "Date of birth is a verification tool for the patient themselves, not a workaround for third-party disclosure. This still violates HIPAA without proper authorization on file." },
    ],
  },
  {
    skill: "counsel", level: 3,
    who: "First aripiprazole fill, anxious young patient",
    situation: "A young man, maybe 20 years old, is picking up aripiprazole for the first time. He's hanging back, glancing around, and when you call his name he whispers. He asks if anyone else can see what he's picking up.",
    choices: [
      { text: "Step aside for a private conversation, reassure him that his information is confidential, counsel him on the medication without using stigmatizing language, and be matter-of-fact and supportive.", verdict: "best", fb: "Mental health stigma is a real barrier to adherence. Creating a private, non-judgmental space and treating the interaction as routine — while still thorough — supports the patient's dignity and engagement with treatment." },
      { text: "Announce the medication name loudly to confirm it's the right person.", verdict: "bad", fb: "Announcing a patient's medication name in a public area is a HIPAA concern and deeply disrespectful of their privacy concerns, especially for a stigmatized medication." },
      { text: "Hand him the bag without counseling — he seems like he just wants to leave quickly.", verdict: "ok", fb: "Reading the social cue is reasonable, but first-time fills always require counseling, especially for antipsychotics. Offer a brief, private, low-pressure exchange — even if he declines in detail, make the offer." },
    ],
  },
  {
    skill: "counsel", level: 4,
    who: "First-time opioid fill, post-surgery",
    situation: "A 45-year-old picks up their first opioid prescription (oxycodone 5 mg #20) after knee surgery. They have never taken an opioid before and seem nervous. Their profile shows they take lorazepam 0.5 mg PRN for anxiety.",
    choices: [
      { text: "Provide comprehensive counseling: take only as needed for pain, never exceed the dose, the CNS depressant interaction with lorazepam increases sedation and respiratory depression risk (avoid combining unless directed), do not drive, store securely away from others, and dispose of unused tablets safely. Mention naloxone availability.", verdict: "best", fb: "First-time opioid patients need comprehensive safety counseling. The benzodiazepine on profile is a critical interaction — opioid + benzo combinations carry a black-box warning for respiratory depression. Naloxone counseling and safe storage are best practice." },
      { text: "Just tell them to take one every 4–6 hours and hand the bag over.", verdict: "bad", fb: "This misses the lorazepam interaction warning, safe use guidance, and secure storage counseling — all critical for a first-time opioid patient." },
      { text: "Warn about the benzo interaction and advise them to stop the lorazepam while on the opioid.", verdict: "ok", fb: "Flagging the interaction is essential, but advising unilateral discontinuation of a benzodiazepine is dangerous (benzo withdrawal can be life-threatening). The prescriber must manage that decision. Counsel on the interaction and tell them to contact their doctor." },
    ],
  },
  {
    skill: "error", level: 2,
    who: "Pseudoephedrine purchase limit",
    situation: "A man approaches the counter to buy a box of pseudoephedrine (Sudafed 12-hour, 20 count). When you scan his ID in the electronic logbook, you see this is his third purchase this month, and the system flags that the monthly gram limit is being approached.",
    choices: [
      { text: "Inform the customer that federal law (Combat Methamphetamine Epidemic Act) limits pseudoephedrine purchases to 3.6 g/day and 9 g per 30-day period; advise him he is near the monthly limit and you cannot sell more than the law allows.", verdict: "best", fb: "CMEA requires electronic logging, ID, and strict quantity limits on pseudoephedrine. The pharmacist must enforce these limits and is the compliance point — explaining the law without accusation is the right approach." },
      { text: "Sell it anyway — he looks legitimate and it's just a cold medicine.", verdict: "bad", fb: "Appearance is not a basis for bypassing federal CMEA limits. The electronic log and gram-limit enforcement exist precisely to prevent sales that appear routine." },
      { text: "Refuse to sell him any pseudoephedrine ever again without saying why.", verdict: "ok", fb: "Refusing is legally safe if limits are exceeded, but you should tell the customer the reason (CMEA limits) — refusing without explanation is unhelpful and potentially disrespectful." },
    ],
  },
  {
    skill: "otc", level: 2,
    who: "Fever in 3-month-old infant",
    situation: "A frantic mother asks you to recommend an OTC fever reducer for her 3-month-old, who has had a fever of 100.8°F since this morning.",
    choices: [
      { text: "Immediately advise her to go to the emergency department or call her pediatrician right away — fever in an infant under 3 months is a medical emergency and OTC medications are not appropriate. Do not recommend a product.", verdict: "best", fb: "Fever in infants under 3 months (rectal temp ≥ 100.4°F / 38°C) requires urgent evaluation to rule out serious bacterial infection. No OTC self-treatment is appropriate — this is a medical emergency." },
      { text: "Recommend infant acetaminophen drops at the labeled dose for her baby's weight.", verdict: "bad", fb: "Acetaminophen is not approved for infants under 3 months (and under 2 months it is absolutely contraindicated) without physician direction. More critically, fever this young requires urgent medical evaluation regardless of how mild it appears." },
      { text: "Tell her to sponge the baby with lukewarm water and come back if the fever gets higher.", verdict: "bad", fb: "Watchful waiting and home remedies are inappropriate for a febrile infant this young. Immediate medical evaluation is the only appropriate guidance — delay risks missing a life-threatening infection." },
    ],
  },

  // ── 20 NEW SCENARIOS ──────────────────────────────────────────────────────

  {
    skill: "error", level: 3,
    who: "Angry early-refill patient",
    situation: "A patient slaps her lisinopril bag on the counter: 'The system is rejecting my Xanax — Reject Code 76, Refill Too Soon — but I lost the bottle at the beach last weekend. I need it now.' She's been a regular patient for two years and her tone is escalating.",
    choices: [
      { text: "Explain that Reject Code 76 (Refill Too Soon) means the insurer won't pay because it's too early by their records; offer to contact the prescriber for an 'early refill due to lost medication' override or have the patient pay cash, then document the loss claim and check the state PDMP before dispensing.", verdict: "best", fb: "Insurance won't waive a Refill Too Soon reject without prescriber involvement or a cash pay option. Documenting the lost-medication claim and running the PDMP first protects the pharmacy legally and is the standard professional approach." },
      { text: "Override the reject yourself in the system and dispense it to help her out.", verdict: "bad", fb: "Technicians and pharmacists cannot override a clinical-edit rejection without a valid prescriber authorization or documented medical necessity. Unauthorized overrides are a compliance violation and potential diversion risk." },
      { text: "Tell her to call her doctor and come back when the reject clears — there's nothing you can do today.", verdict: "ok", fb: "Referring to the prescriber is correct, but abandoning the patient at the counter without offering cash-pay pricing or helping her reach the office is an incomplete response that leaves her without a plan." },
    ],
  },

  {
    skill: "interact", level: 3,
    who: "Prior-auth fury",
    situation: "A patient drops off a prescription for Dupixent (dupilumab) for severe eczema. The system immediately returns a Prior Authorization Required reject. He shouts, 'I've been waiting THREE WEEKS for this — this is insane. That drug costs $3,000 a month!'",
    choices: [
      { text: "Acknowledge his frustration calmly, explain that prior authorization means his insurance requires the prescriber to document medical necessity before it will cover the drug, give him a printed PA rejection notice for the doctor's office, and tell him the pharmacy can fax the request info to the prescriber today so they can start the PA process.", verdict: "best", fb: "A PA reject requires the prescriber to initiate the insurance review — the pharmacy's role is to communicate the reject clearly, give the office everything needed to file quickly, and manage the patient's expectations without dismissing their frustration." },
      { text: "Tell him the insurance company is the problem and there's nothing the pharmacy can do.", verdict: "bad", fb: "While the insurer does require the PA, the pharmacy can and should actively facilitate by faxing the rejection notice to the prescriber and explaining the process. Blaming the insurer without offering next steps leaves the patient helpless." },
      { text: "Suggest he look into manufacturer patient-assistance programs (e.g., Dupixent MyWay) while the PA is processed.", verdict: "ok", fb: "Mentioning co-pay assistance is helpful context, but it should accompany — not replace — explaining the PA process and initiating contact with the prescriber. On its own this doesn't solve the immediate rejection." },
    ],
  },

  {
    skill: "error", level: 4,
    who: "DAW-1 mismatch",
    situation: "A prescription comes in for Synthroid 100 mcg with 'DAW-1' keyed in by the prescriber's fax (Dispense As Written — prescriber required). But when you look at the actual fax, the DAW box is blank and there is no written notation saying brand required. The insurance will only cover generic levothyroxine.",
    choices: [
      { text: "Do not apply DAW-1 on the prescriber's behalf. Call the prescriber's office to clarify whether brand-name Synthroid is truly required; if confirmed, have them send a corrected prescription with DAW-1 explicitly noted. Explain to the patient that brand may cost more out of pocket if the DAW is confirmed.", verdict: "best", fb: "DAW-1 must be an explicit prescriber decision documented on the prescription — the pharmacy cannot assign it on the prescriber's behalf. Billing DAW-1 when the prescriber didn't mark it is insurance fraud and a dispensing error waiting to happen." },
      { text: "Apply DAW-1 since the office probably meant to check it and dispense Synthroid.", verdict: "bad", fb: "Assuming prescriber intent and applying DAW-1 without written authorization is insurance fraud. It also removes the patient's right to a less expensive generic when the prescriber may not have actually required brand." },
      { text: "Dispense generic levothyroxine and bill it without a DAW code since the fax was blank.", verdict: "ok", fb: "Dispensing generic when no DAW is documented is technically correct for the insurance billing, but it bypasses clarification with the prescriber — for narrow-therapeutic-index drugs like levothyroxine, calling to confirm is worth the extra step." },
    ],
  },

  {
    skill: "error", level: 4,
    who: "Returned controlled substance",
    situation: "A patient slides a partially-used 30-count bottle of hydrocodone/APAP 5/325 through the window and says, 'You guys filled the wrong thing — this isn't what my doctor ordered. I want the right one.' The seal is broken and roughly 10 tablets appear to be missing.",
    choices: [
      { text: "Do not accept the returned controlled substance into stock. Explain that federal law prohibits pharmacies from accepting returned Schedule II/III medications once dispensed. Compare the current prescription to what was dispensed; if an error occurred, document it, notify the pharmacist-in-charge, and work with the prescriber on next steps — but the opened CII bottle cannot be returned.", verdict: "best", fb: "DEA regulations prohibit the return of dispensed controlled substances to pharmacy stock. If a dispensing error occurred it must be documented and reported, but the pharmacy cannot retake possession of an opened CII. A new prescription would be needed if an error is confirmed." },
      { text: "Accept the bottle back, recount the tablets, and credit their account if your records confirm an error.", verdict: "bad", fb: "Accepting a returned opened controlled substance is a federal DEA violation regardless of whether an error occurred. Tablets cannot be verified after they leave the pharmacy's custody." },
      { text: "Call the pharmacist over immediately and let them handle it while you help the next patient.", verdict: "ok", fb: "Escalating to the pharmacist is appropriate — this is a complex situation. But you should understand the reason: returned CIIs are prohibited by DEA regulation. The pharmacist will explain the same thing, so understanding the rule yourself is part of your role." },
    ],
  },

  {
    skill: "counsel", level: 2,
    who: "Drive-through rush patient",
    situation: "It's 5:15 PM on a Friday. The drive-through has six cars backed up. A patient pulls up with four prescriptions and says, 'I'll wait — just do all four.' Three of the four haven't been started yet. The queue is at 45 minutes.",
    choices: [
      { text: "Pull up all four prescriptions, run insurance on each, and give the patient an honest estimate: 'We have a 45-minute wait right now — would you prefer to wait, or can I text you when they're all ready?' If they insist on waiting, confirm they understand the time and get them moving through the lane.", verdict: "best", fb: "Transparency about wait times respects the patient's time and keeps the drive-through moving. Offering text notification is a standard retail pharmacy tool that reduces congestion without losing the patient's business." },
      { text: "Tell them to come inside if they want to wait — drive-through is for quick pickups only.", verdict: "ok", fb: "Directing to the front counter is not wrong, but communicating it as a hard rule rather than a helpful suggestion can feel dismissive. The real goal is managing the line honestly and giving the patient a real choice." },
      { text: "Process the prescriptions quickly and tell the patient it'll be just a few minutes so they don't leave.", verdict: "bad", fb: "Giving a false time estimate to keep a customer in line creates frustration, backs up the drive-through, and erodes trust. It also pressures the filling process in ways that increase error risk." },
    ],
  },

  {
    skill: "counsel", level: 2,
    who: "Partial fill request",
    situation: "A patient at the counter says his azithromycin Z-pack costs $28 today because his insurance lapsed. 'Can you just give me two or three tablets to get me started? I'll pay for the rest when I get paid Friday.' The prescription is for azithromycin 250 mg, quantity 6.",
    choices: [
      { text: "Explain that for most non-controlled medications a partial fill is technically possible but creates clinical risk — azithromycin is a 5-day course and partial filling means incomplete treatment. Offer to run GoodRx or discount-card pricing to see if the full $28 can be reduced, and give the full course if at all possible.", verdict: "best", fb: "Partial filling a Z-pack defeats the purpose of the full 5-day course and risks treatment failure and resistance. The better first move is to reduce out-of-pocket cost with a discount card before considering partial dispensing." },
      { text: "Give him just 3 tablets and bill for those — it's better than nothing.", verdict: "ok", fb: "A partial dispensing is better than no treatment, but you should exhaust lower-cost options (GoodRx, manufacturer coupons, $4 programs) before splitting the course. Antibiotics given in sub-therapeutic courses promote resistance." },
      { text: "Tell him you can only dispense the full quantity — he'll have to figure out the payment.", verdict: "bad", fb: "Refusing without exploring discount programs or assistance options is an incomplete response that may leave the patient untreated. Checking discount pricing takes seconds and is part of patient care." },
    ],
  },

  {
    skill: "counsel", level: 3,
    who: "Metoprolol vs. metformin confusion",
    situation: "An 80-year-old woman is picking up refills for both metoprolol succinate 50 mg and metformin 500 mg. She holds up both bottles and says, 'I got confused last week — they sound so alike. Which one is the heart one and which is the sugar one?' Her daughter is with her and both look genuinely puzzled.",
    choices: [
      { text: "Take a moment to clearly differentiate: 'Metoprolol — the one with the letter O near the end — is for your heart and blood pressure; metformin — ends in -formin — is for blood sugar.' Use the label color, pill appearance, and a written note to reinforce the distinction, and suggest they ask the prescriber about pill organizer labels or pharmacy blister packs.", verdict: "best", fb: "Metoprolol/metformin is a classic look-alike, sound-alike (LASA) drug pair. For elderly patients on both, a clear mnemonic, visual cue, and written aid dramatically reduces the risk of mix-up — which could cause hypoglycemia or a missed cardiac dose." },
      { text: "Tell her the bottles are labeled, so just read the label carefully each time.", verdict: "bad", fb: "Telling a confused elderly patient to 'read the label' is inadequate for a LASA pair. She has already demonstrated the need for an active intervention — a brief, memorable distinction is the pharmacist's job here." },
      { text: "Suggest she separate the two bottles on different shelves at home to avoid confusion.", verdict: "ok", fb: "Physical separation is a reasonable home-safety tip, but it doesn't address her existing confusion about which drug does what. The full response should include both the mnemonic/education and the storage advice." },
    ],
  },

  {
    skill: "otc", level: 2,
    who: "Lapsed-insurance patient",
    situation: "A patient arrives for her regular Crestor (rosuvastatin 20 mg) refill and learns her insurance lapsed two weeks ago. The brand-name price is $312. She looks stricken: 'I can't pay that. Is there anything cheaper?'",
    choices: [
      { text: "Check GoodRx or similar discount programs for rosuvastatin — generic rosuvastatin is available and typically costs $10–30 with a discount card. Explain that rosuvastatin is available as a generic, which is therapeutically equivalent, and offer to reach out to the prescriber if a formulary switch (e.g., simvastatin, pravastatin) is needed to fit her budget.", verdict: "best", fb: "Generic rosuvastatin is therapeutically equivalent to Crestor and available at dramatically lower cost with discount programs. Offering concrete pricing options and a path to the prescriber for therapeutic substitution is comprehensive patient-centered care." },
      { text: "Tell her to reapply for insurance and come back when she has coverage.", verdict: "bad", fb: "Leaving a patient without her statin while she navigates insurance re-enrollment creates real cardiovascular risk. The pharmacy has tools — generics, discount cards, patient assistance — that should be offered immediately." },
      { text: "Tell her the generic is available and let her decide, but don't look up pricing.", verdict: "ok", fb: "Mentioning the generic is correct, but providing actual discount-card pricing takes 30 seconds and makes the option concrete and actionable. Stopping at 'a generic exists' is an incomplete response." },
    ],
  },

  {
    skill: "interact", level: 3,
    who: "Public accusation patient",
    situation: "A patient is at the busy front counter during the lunch rush. He shouts loud enough for five other patients to hear: 'You people filled the WRONG medication AGAIN. Last time it was the wrong dose, now it's the wrong quantity — this pharmacy is a disaster!' When you pull up his profile, you see his metformin 500 mg was correctly filled at quantity 90 exactly as written.",
    choices: [
      { text: "Stay calm, lower your voice to de-escalate, and say: 'I want to make sure we get this right — can we step to the side so I can pull up your prescription and go over it together?' Review the label vs. the prescription with him privately, then walk through what was dispensed and what was ordered.", verdict: "best", fb: "De-escalation in a public space starts with lowering your own voice and moving the conversation somewhere private. Reviewing the actual prescription with the patient is the fastest way to resolve a perceived error — and maintaining professional composure protects other patients' experience." },
      { text: "Loudly confirm in front of the other patients that the fill was correct and his reading of the label was wrong.", verdict: "bad", fb: "Correcting a patient publicly is humiliating and escalates conflict. Even if you are 100% correct, the confrontational approach destroys trust and embarrasses the patient in front of others." },
      { text: "Apologize and offer to refill the prescription without reviewing whether an error occurred.", verdict: "ok", fb: "Offering to make it right is good customer service, but apologizing and refilling when no error occurred is clinically incorrect and potentially harmful. Verify first — then respond accordingly." },
    ],
  },

  {
    skill: "error", level: 4,
    who: "CII pickup without authorization",
    situation: "A woman presents to pick up oxycodone ER 20 mg for her father, whose name is on the prescription. There is no authorized designee on file for the patient. She says, 'He's in the car — he's in too much pain to walk in.'",
    choices: [
      { text: "Ask the father to come to the window or door to present ID and confirm the pickup — or have him sign an authorization form from the car. Document the relationship and ID of the person picking up. Do not release the CII without directly verifying with the patient.", verdict: "best", fb: "CII controlled substances require identity verification at the point of dispensing. If the patient is present in the parking lot, asking them to come to the window (even briefly) or having staff bring the form to the car is a reasonable accommodation. Releasing to a third party with no authorization is a DEA compliance issue." },
      { text: "Release the medication since the patient is clearly nearby and she's family.", verdict: "bad", fb: "Proximity and family relationship do not substitute for documented authorization. DEA regulations require verification before dispensing a Schedule II to any third party." },
      { text: "Refuse to dispense at all unless the patient physically enters the building.", verdict: "ok", fb: "Refusing without exploring options is overly rigid. A brief car-window verification or pharmacist-accompanied curbside authorization are reasonable accommodations for a patient in pain — the goal is compliance, not obstruction." },
    ],
  },

  {
    skill: "error", level: 3,
    who: "NPLEx near-limit customer",
    situation: "A man hands you a box of Sudafed 12-hour, 20 count. When you run his ID through the NPLEx electronic log, the system shows he has purchased 8.2 grams of pseudoephedrine in the past 30 days. The federal monthly limit is 9 grams. The current box would bring him to 9.1 grams.",
    choices: [
      { text: "Decline the sale. Explain that the federal Combat Methamphetamine Epidemic Act (CMEA) caps pseudoephedrine at 9 grams per 30 days, and his purchase history means this box would exceed the limit. Do not override the NPLEx flag.", verdict: "best", fb: "When the NPLEx system flags an impending limit breach, the pharmacist or technician must decline the sale. Selling above the CMEA limit is a federal violation regardless of the customer's explanation. State the reason matter-of-factly without accusation." },
      { text: "Sell the box since he's only slightly over the limit and it's probably a coincidence.", verdict: "bad", fb: "The CMEA limit is absolute — there is no 'slightly over' exception. Selling over the gram limit is a federal violation that jeopardizes the pharmacy's DEA registration." },
      { text: "Sell him a smaller box so that the total stays just under 9 grams.", verdict: "ok", fb: "Calculating whether a smaller purchase stays within the limit is technically legal if the math works out, but once the NPLEx flag has been triggered and the cumulative pattern is this high, pharmacist judgment about whether to complete any sale is appropriate. Document the interaction regardless." },
    ],
  },

  {
    skill: "interact", level: 2,
    who: "Medicaid brand demand",
    situation: "A Medicaid patient is picking up atorvastatin 40 mg. He insists he wants brand-name Lipitor and is frustrated when you explain the claim rejected as 'Brand Not Covered — Generic Available.' He says, 'I've been on the brand for years and it works. Just bill it as generic.'",
    choices: [
      { text: "Explain that Medicaid requires generic substitution when a therapeutic equivalent is available and covers the generic at no cost to him; billing brand as generic would be Medicaid fraud. Reassure him that generic atorvastatin and Lipitor are bioequivalent. If he truly wants brand, he must pay the full brand cash price out of pocket.", verdict: "best", fb: "Medicaid will not cover brand-name drugs when a generic is available, and billing brand as generic to a government payer is fraud. Educating the patient on bioequivalence while clearly explaining the coverage rule and the cash-pay option is the correct approach." },
      { text: "Change the DAW code to dispense the brand and see if it goes through.", verdict: "bad", fb: "Manipulating DAW codes to get a Medicaid claim to process for brand when a generic is available is Medicaid fraud — a federal offense that can result in exclusion from federal health programs." },
      { text: "Tell him to call Medicaid directly and complain if he wants the brand covered.", verdict: "ok", fb: "Directing him to Medicaid is not wrong — he does have appeal rights — but skipping the bioequivalence counseling and the explanation of the cash-pay option is an incomplete response. The pharmacist's first job is to make sure he understands the options." },
    ],
  },

  {
    skill: "interact", level: 2,
    who: "Refund demand for returned medication",
    situation: "A woman comes back to the pharmacy with a 30-count bottle of escitalopram 10 mg she picked up four days ago. 'This medication made me feel terrible — nausea, headaches. I don't want it. I need my money back.' The bottle has been opened and about 8 tablets are missing.",
    choices: [
      { text: "Empathize with her side effects, explain that once a prescription leaves the pharmacy it cannot be returned or resold for safety and regulatory reasons, and offer to connect her with the pharmacist who can counsel her on the typical timeline for escitalopram start-up side effects (nausea often resolves in 1–2 weeks) and suggest she contact her prescriber.", verdict: "best", fb: "State pharmacy regulations prohibit the return of dispensed medications for resale. However, the patient needs empathy and clinical context — escitalopram start-up GI side effects are common and usually transient, and the prescriber can advise on whether to continue or switch." },
      { text: "Accept the return and issue a refund to avoid a scene.", verdict: "bad", fb: "Accepting returned dispensed prescription medications violates state pharmacy regulations and USP standards. Returned medications cannot be verified for integrity and cannot legally re-enter inventory." },
      { text: "Refuse the return and tell her to call her doctor, then walk away.", verdict: "ok", fb: "Refusing the return is correct, but the abrupt dismissal misses the counseling opportunity. Escitalopram side-effect education and prescriber follow-up guidance are part of a complete response." },
    ],
  },

  {
    skill: "counsel", level: 4,
    who: "First solo warfarin counseling",
    situation: "The pharmacist calls you over: 'I need you to counsel Mrs. Okafor on her new warfarin prescription — she's your patient.' Your heart rate jumps. Mrs. Okafor is 71, picking up warfarin 5 mg for newly diagnosed atrial fibrillation. This is your first solo counseling.",
    choices: [
      { text: "Take a breath, greet her by name, and cover the key points systematically: what warfarin does (prevents clots), why consistent dosing time matters, the critical vitamin-K dietary interaction (leafy greens), signs of bleeding to watch for, the importance of INR monitoring appointments, and what to do if she misses a dose. Use teach-back: 'Can you tell me in your own words when you'd call the doctor?'", verdict: "best", fb: "Warfarin counseling has defined high-stakes elements: dose timing, dietary consistency (not elimination) of vitamin K, bleeding warning signs, and INR monitoring adherence. Teach-back confirms understanding — for a new anticoagulant patient, that confirmation is essential and potentially life-saving." },
      { text: "Hand her the package insert and tell her to read it and call her doctor with questions.", verdict: "bad", fb: "Package inserts are dense and not patient-friendly. Delegating education to a document and a phone call fails the counseling standard, especially for a high-risk anticoagulant in a new elderly patient." },
      { text: "Cover only the basics (take it at the same time each day) and ask the pharmacist to finish the rest because you're nervous.", verdict: "ok", fb: "Recognizing your limits and escalating is appropriate when needed. However, warfarin counseling is a core competency — if you can cover the critical topics (with the pharmacist nearby), doing your best with supervision builds skill. Handing off entirely should be a last resort." },
    ],
  },

  {
    skill: "counsel", level: 1,
    who: "Alcohol and amoxicillin question",
    situation: "A college student picks up amoxicillin 500 mg TID for a sinus infection. On the way out he turns back and asks, 'Can I still drink this weekend? Like, will it mess up the antibiotic or make me really sick?'",
    choices: [
      { text: "Explain that amoxicillin does not have a direct dangerous interaction with alcohol — unlike metronidazole or tinidazole — but alcohol can impair immune function and worsen recovery. Moderate drinking probably won't make the antibiotic fail, but heavy drinking while sick is counterproductive. Advise completing the full course regardless.", verdict: "best", fb: "Unlike metronidazole (which causes a disulfiram-like reaction with alcohol), amoxicillin has no direct alcohol-drug interaction. Giving accurate information — rather than a reflexive 'no alcohol with antibiotics' — is more credible and educational, and completing the course is the most important adherence message." },
      { text: "Tell him absolutely no alcohol with any antibiotic.", verdict: "ok", fb: "Saying no alcohol is conservative and not harmful, but it's not accurate for amoxicillin specifically and lumps it with drugs like metronidazole that do have serious interactions. Giving accurate, drug-specific counseling builds more trust than a blanket rule." },
      { text: "Say it doesn't matter, antibiotics and alcohol are always fine together.", verdict: "bad", fb: "This is overly broad and wrong for several antibiotics (metronidazole, tinidazole, sulfonamides). Even for amoxicillin where the direct interaction is minimal, alcohol impairs recovery — the blanket 'always fine' statement is clinically inaccurate." },
    ],
  },

  {
    skill: "counsel", level: 3,
    who: "Mixed-up insulin pens",
    situation: "A diabetic patient comes to the counter confused: 'I have two insulin pens — the pharmacist last time said one is for meals and one is at night, but I think I've been using them backwards.' She holds up a Lantus SoloSTAR (glargine, basal) and a Humalog KwikPen (lispro, rapid-acting). Her blood sugars have been running high at night.",
    choices: [
      { text: "Identify both pens for her clearly: Humalog (the clear pen with rapid label) is mealtime insulin — taken within 15 minutes of eating; Lantus (also clear but labeled differently) is the once-daily basal given at the same time each evening. Emphasize they must never be mixed, show her the distinguishing pen labels and caps, and advise her to contact her prescriber about her recent blood sugars.", verdict: "best", fb: "Basal/bolus confusion is a dangerous and common insulin error. Pharmacist intervention to visually differentiate the pens, explain timing with meals vs. bedtime, and prompt prescriber follow-up for out-of-control glucose readings is the standard of care for insulin counseling." },
      { text: "Tell her to call her endocrinologist and sort it out with them.", verdict: "ok", fb: "Prescriber follow-up is appropriate, but the pharmacist can and should clarify the pens right now — the patient is at the counter with both pens in hand. Deferring entirely wastes the immediate opportunity to correct a potentially dangerous error." },
      { text: "Reassure her the mix-up probably isn't a big deal and she'll figure it out.", verdict: "bad", fb: "Using mealtime insulin as basal (or vice versa) is a serious error that can cause hypoglycemia or prolonged hyperglycemia. Dismissing this as 'not a big deal' is clinically negligent." },
    ],
  },

  {
    skill: "interact", level: 4,
    who: "Teen birth control privacy",
    situation: "A 16-year-old girl quietly asks for her oral contraceptive prescription. While you're processing it, you notice her mother is shopping three aisles away. The patient whispers: 'Please don't tell my mom — she's right over there.'",
    choices: [
      { text: "Reassure her that her prescription is confidential under HIPAA and applicable minor-consent laws for reproductive health; speak quietly, keep the transaction discreet, and do not alert or involve the mother. Do not lie to the mother if she directly asks about her daughter's prescriptions — but proactively disclose nothing.", verdict: "best", fb: "Most states grant minors the right to consent to contraceptive services confidentially. HIPAA and minor-consent law protect that privacy. The pharmacist should not proactively disclose the prescription to the parent, but should not actively deceive either if directly questioned." },
      { text: "Step out from behind the counter and let the mother know her daughter is picking up a sensitive prescription.", verdict: "bad", fb: "Proactively disclosing a minor's confidential reproductive health prescription to a parent violates both HIPAA and minor-consent statutes in most states. It also puts the patient at potential risk." },
      { text: "Whisper to the teen that she should come back without her mom to avoid the awkwardness.", verdict: "ok", fb: "This protects her privacy in the moment but does not reassure her of her rights or process her prescription. The teen is legally entitled to pick up her prescription now — send her away without explanation is an unhelpful non-solution." },
    ],
  },

  {
    skill: "interact", level: 2,
    who: "After-hours refill request",
    situation: "A patient comes to the counter at 6:45 PM wanting a refill of her lisinopril 10 mg. The bottle shows 0 refills remaining. She says, 'My doctor's office closed at 5 — can you just call them and get me some?' She has enough tablets to last two more days.",
    choices: [
      { text: "Explain that you can't reach the office until tomorrow morning, but offer to provide an emergency supply (typically 3–7 days depending on state law) to bridge the gap and document the dispensing. Let her know you'll send a refill request to the prescriber first thing tomorrow.", verdict: "best", fb: "Emergency dispensing provisions exist in most states for chronic maintenance medications like antihypertensives when a patient would otherwise run out. A bridge supply with same-day prescriber contact the next morning is the standard professional response." },
      { text: "Refuse any dispensing until you can reach the prescriber — rules are rules.", verdict: "ok", fb: "Waiting for prescriber contact is legally safe, but refusing to provide a bridge supply for a blood-pressure medication when emergency dispensing is permitted could leave the patient without medication and at clinical risk. Check your state's emergency supply rules before refusing outright." },
      { text: "Call the after-hours emergency line for the prescriber's practice to get verbal authorization tonight.", verdict: "ok", fb: "Attempting to reach the on-call line is a reasonable option, but after-hours calls for routine refills of maintenance medications are often inappropriate use of emergency lines. The emergency supply pathway exists exactly for this scenario." },
    ],
  },

  {
    skill: "error", level: 4,
    who: "Potentially altered prescription",
    situation: "A young man presents a paper prescription for oxycodone 30 mg #60. The quantity field has visible scratch-outs — the number looks like it may have been changed from '30' to '60'. The ink color on the quantity appears slightly different from the rest of the prescription.",
    choices: [
      { text: "Do not dispense. Call the prescriber's office directly using a number you independently verify (not one written on the prescription) to confirm the prescription details. Document your findings. If the quantity cannot be verified or the prescriber denies writing it as presented, refuse dispensing and notify the pharmacist-in-charge. Consider reporting to law enforcement per your state's protocol.", verdict: "best", fb: "A prescription with visible alterations to a CII quantity is a major red flag for forgery. Calling the prescriber at a verified number — not any number on the script — is essential. Federal law and most state laws require pharmacists to exercise professional judgment and refuse to fill suspicious CII prescriptions. Documentation and reporting are part of the protocol." },
      { text: "Fill it — the prescription has a DEA number and a real doctor's name, so it's probably fine.", verdict: "bad", fb: "The presence of a DEA number does not validate an altered prescription. Altered CII prescriptions are a common form of fraud. Dispensing without verifying is a professional and legal liability." },
      { text: "Ask the patient about the scratch-out and decide based on their explanation.", verdict: "ok", fb: "Asking the patient is not unreasonable, but a patient presenting an altered prescription has every incentive to explain it away. The definitive verification must be a direct call to the prescriber — not the patient's account." },
    ],
  },

  {
    skill: "interact", level: 2,
    who: "Rage-quit wait-time patient",
    situation: "A customer storms up to the drop-off counter after a 45-minute wait for his atenolol and lisinopril. He throws the paper receipt down and says to you directly: 'This is YOUR fault. Every single time I come here it's a 45-minute wait. You're all incompetent and I'm reporting this to corporate.' The queue behind him has four people.",
    choices: [
      { text: "Stay calm and say: 'I'm sorry the wait was that long today — that's genuinely frustrating. Let me get your prescriptions right now.' De-escalate by focusing on his immediate need, not the argument. Do not match his energy, blame the system back at him, or apologize in a way that promises future fixes you can't guarantee.",
        verdict: "best", fb: "Staying calm and focusing on the patient's immediate need is the single most effective de-escalation tool. Acknowledging the frustration without being defensive and moving to action (getting the prescription) redirects energy from conflict to resolution. Corporate complaints are his right — don't challenge it." },
      { text: "Explain to him that the pharmacy is understaffed and it's not your personal fault.", verdict: "ok", fb: "Context is understandable, but justifying the wait to an angry patient often reads as excuses and escalates the conflict. Acknowledgment first, then if a natural opening exists, brief context can follow — but leading with the explanation inflames rather than resolves." },
      { text: "Tell him if he's going to yell you'll have to step away until he calms down.", verdict: "bad", fb: "Threatening to disengage from an irate patient in a retail pharmacy is likely to escalate the situation further and is not the standard customer-service response. It also leaves the four people behind him waiting longer. Unless there is a safety concern, stay engaged and professional." },
    ],
  },
];

/* ============================================================
   HELPERS
   ============================================================ */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const timePerQ = (lvl) => [0, 22, 18, 14, 11][lvl];

/* shared button styles via inline */
const btn = (bg, color, extra = {}) => ({
  background: bg, color, border: "none", borderRadius: 14,
  padding: "14px 22px", fontFamily: "'Spline Sans', sans-serif",
  fontWeight: 600, fontSize: 16, cursor: "pointer", letterSpacing: "0.2px",
  ...extra,
});

const money = (value) => {
  const sign = value < 0 ? "-" : "";
  return `${sign}$${Math.abs(value).toFixed(2)}`;
};

/* ============================================================
   APP
   ============================================================ */


/* ===== Top-300 retail drug database (most-dispensed outpatient meds) =====
   g generic · b brand · c class · use indication · pearl high-yield pearl · sched schedule · t tier(1-4) */
const DRUGS = [
  // ===== CARDIOVASCULAR: ACE inhibitors =====
  { g: "lisinopril", b: "Zestril / Prinivil", c: "ACE inhibitor", use: "Hypertension, heart failure", pearl: "May cause a dry cough and hyperkalemia; avoid in pregnancy.", t: 1 },
  { g: "enalapril", b: "Vasotec", c: "ACE inhibitor", use: "Hypertension, heart failure", pearl: "Watch for angioedema; monitor potassium and renal function.", t: 2 },
  { g: "benazepril", b: "Lotensin", c: "ACE inhibitor", use: "Hypertension", pearl: "Dry cough is a class effect; avoid in pregnancy.", t: 3 },
  { g: "ramipril", b: "Altace", c: "ACE inhibitor", use: "Hypertension, post-MI, CV risk", pearl: "Avoid in pregnancy; monitor potassium.", t: 2 },
  { g: "quinapril", b: "Accupril", c: "ACE inhibitor", use: "Hypertension, heart failure", pearl: "Class effect dry cough; check renal function.", t: 3 },

  // ===== ARBs =====
  { g: "losartan", b: "Cozaar", c: "ARB", use: "Hypertension, diabetic nephropathy", pearl: "Good ACE alternative if cough; still risks hyperkalemia; avoid in pregnancy.", t: 1 },
  { g: "valsartan", b: "Diovan", c: "ARB", use: "Hypertension, heart failure", pearl: "Avoid in pregnancy; monitor potassium.", t: 2 },
  { g: "olmesartan", b: "Benicar", c: "ARB", use: "Hypertension", pearl: "Rare sprue-like enteropathy (chronic diarrhea).", t: 3 },
  { g: "telmisartan", b: "Micardis", c: "ARB", use: "Hypertension", pearl: "Long-acting; avoid in pregnancy.", t: 3 },
  { g: "irbesartan", b: "Avapro", c: "ARB", use: "Hypertension, diabetic nephropathy", pearl: "Monitor potassium and renal function.", t: 3 },
  { g: "candesartan", b: "Atacand", c: "ARB", use: "Hypertension, heart failure", pearl: "Avoid in pregnancy.", t: 3 },

  // ===== Beta blockers =====
  { g: "metoprolol tartrate", b: "Lopressor", c: "Beta blocker (IR)", use: "Hypertension, angina", pearl: "Immediate-release, usually dosed twice daily; do not stop abruptly.", t: 1 },
  { g: "metoprolol succinate", b: "Toprol XL", c: "Beta blocker (ER)", use: "Hypertension, heart failure", pearl: "Extended-release, once daily; do not stop abruptly.", t: 1 },
  { g: "atenolol", b: "Tenormin", c: "Beta blocker", use: "Hypertension, angina", pearl: "Renally cleared; do not stop abruptly.", t: 2 },
  { g: "carvedilol", b: "Coreg", c: "Alpha/beta blocker", use: "Heart failure, hypertension", pearl: "Take with food to slow absorption and reduce dizziness.", t: 2 },
  { g: "propranolol", b: "Inderal", c: "Nonselective beta blocker", use: "Hypertension, tremor, migraine prophylaxis", pearl: "Also used for performance anxiety; caution in asthma.", t: 2 },
  { g: "bisoprolol", b: "Zebeta", c: "Beta blocker", use: "Hypertension, heart failure", pearl: "Cardioselective; do not stop abruptly.", t: 3 },
  { g: "nebivolol", b: "Bystolic", c: "Beta blocker", use: "Hypertension", pearl: "Cardioselective with vasodilation.", t: 3 },
  { g: "labetalol", b: "Trandate", c: "Alpha/beta blocker", use: "Hypertension (incl. pregnancy)", pearl: "Commonly used in pregnancy-related hypertension.", t: 3 },

  // ===== Calcium channel blockers =====
  { g: "amlodipine", b: "Norvasc", c: "Dihydropyridine CCB", use: "Hypertension, angina", pearl: "Common side effect is peripheral (ankle) edema.", t: 1 },
  { g: "nifedipine ER", b: "Procardia XL", c: "Dihydropyridine CCB", use: "Hypertension, angina", pearl: "Do not crush extended-release; ghost tablet in stool is normal.", t: 2 },
  { g: "diltiazem", b: "Cardizem", c: "Non-DHP CCB", use: "Hypertension, rate control", pearl: "Slows heart rate; CYP3A4 interactions.", t: 2 },
  { g: "verapamil", b: "Calan", c: "Non-DHP CCB", use: "Hypertension, arrhythmia", pearl: "Commonly causes constipation.", t: 2 },
  { g: "felodipine", b: "Plendil", c: "Dihydropyridine CCB", use: "Hypertension", pearl: "Avoid grapefruit juice (raises levels).", t: 3 },

  // ===== Diuretics =====
  { g: "hydrochlorothiazide", b: "Microzide", c: "Thiazide diuretic", use: "Hypertension, edema", pearl: "Can lower potassium/sodium and cause photosensitivity.", t: 1 },
  { g: "chlorthalidone", b: "Thalitone", c: "Thiazide-like diuretic", use: "Hypertension", pearl: "Longer-acting than HCTZ; monitor electrolytes.", t: 2 },
  { g: "furosemide", b: "Lasix", c: "Loop diuretic", use: "Edema, heart failure", pearl: "Can lower potassium; high IV doses risk ototoxicity; sulfa.", t: 1 },
  { g: "torsemide", b: "Demadex", c: "Loop diuretic", use: "Edema, heart failure", pearl: "More predictable absorption than furosemide.", t: 3 },
  { g: "spironolactone", b: "Aldactone", c: "Potassium-sparing diuretic", use: "Heart failure, hypertension, edema", pearl: "Risk of hyperkalemia; can cause gynecomastia.", t: 2 },
  { g: "triamterene/HCTZ", b: "Dyazide / Maxzide", c: "Potassium-sparing combo diuretic", use: "Hypertension", pearl: "Monitor potassium.", t: 3 },

  // ===== Statins & lipids =====
  { g: "atorvastatin", b: "Lipitor", c: "Statin", use: "High cholesterol, CV risk", pearl: "Report unexplained muscle pain or weakness.", t: 1 },
  { g: "rosuvastatin", b: "Crestor", c: "Statin", use: "High cholesterol", pearl: "High-intensity option; report muscle pain.", t: 1 },
  { g: "simvastatin", b: "Zocor", c: "Statin", use: "High cholesterol", pearl: "Take in the evening; many CYP3A4 interactions with dose limits.", t: 1 },
  { g: "pravastatin", b: "Pravachol", c: "Statin", use: "High cholesterol", pearl: "Fewer drug interactions than other statins.", t: 2 },
  { g: "lovastatin", b: "Mevacor", c: "Statin", use: "High cholesterol", pearl: "Take with the evening meal.", t: 3 },
  { g: "pitavastatin", b: "Livalo", c: "Statin", use: "High cholesterol", pearl: "Fewer interactions; report muscle pain.", t: 4 },
  { g: "ezetimibe", b: "Zetia", c: "Cholesterol absorption inhibitor", use: "High cholesterol", pearl: "Often added to a statin.", t: 2 },
  { g: "fenofibrate", b: "Tricor", c: "Fibrate", use: "High triglycerides", pearl: "Monitor liver function; myopathy risk with statins.", t: 3 },
  { g: "gemfibrozil", b: "Lopid", c: "Fibrate", use: "High triglycerides", pearl: "Avoid combining with statins (myopathy risk).", t: 4 },
  { g: "icosapent ethyl", b: "Vascepa", c: "Omega-3 fatty acid", use: "High triglycerides, CV risk", pearl: "Purified EPA; take with food.", t: 4 },

  // ===== Anticoagulants / antiplatelets =====
  { g: "apixaban", b: "Eliquis", c: "DOAC (factor Xa inhibitor)", use: "Atrial fibrillation, VTE", pearl: "Bleeding risk; no routine INR monitoring needed.", t: 1 },
  { g: "rivaroxaban", b: "Xarelto", c: "DOAC (factor Xa inhibitor)", use: "Atrial fibrillation, VTE", pearl: "Take the 15 mg and 20 mg doses with food.", t: 1 },
  { g: "dabigatran", b: "Pradaxa", c: "Direct thrombin inhibitor", use: "Atrial fibrillation, VTE", pearl: "Keep in original bottle; sensitive to moisture.", t: 3 },
  { g: "warfarin", b: "Coumadin / Jantoven", c: "Vitamin K antagonist", use: "Anticoagulation", pearl: "Needs INR monitoring; keep vitamin K intake consistent.", t: 1 },
  { g: "clopidogrel", b: "Plavix", c: "Antiplatelet (P2Y12)", use: "ACS, stroke prevention", pearl: "Avoid omeprazole/esomeprazole (reduce its activation).", t: 1 },
  { g: "ticagrelor", b: "Brilinta", c: "Antiplatelet (P2Y12)", use: "Acute coronary syndrome", pearl: "Keep aspirin dose low (<=100 mg); causes dyspnea.", t: 3 },
  { g: "aspirin", b: "Bayer / Ecotrin", c: "Antiplatelet / NSAID", use: "CV prevention, pain", pearl: "Bleeding risk; avoid in children (Reye's syndrome).", t: 1 },
  { g: "enoxaparin", b: "Lovenox", c: "Low-molecular-weight heparin", use: "VTE treatment/prophylaxis", pearl: "Given subcutaneously; do not expel the air bubble.", t: 3 },

  // ===== Other cardiac =====
  { g: "digoxin", b: "Lanoxin", c: "Cardiac glycoside", use: "Heart failure, atrial fibrillation", pearl: "Narrow therapeutic index; watch for toxicity (nausea, visual changes).", t: 3 },
  { g: "amiodarone", b: "Pacerone", c: "Antiarrhythmic", use: "Arrhythmias", pearl: "Monitor thyroid, lung, liver; many interactions; photosensitivity.", t: 3 },
  { g: "isosorbide mononitrate", b: "Imdur", c: "Nitrate", use: "Angina prevention", pearl: "Needs a nitrate-free interval to avoid tolerance.", t: 3 },
  { g: "nitroglycerin", b: "Nitrostat", c: "Nitrate", use: "Acute angina", pearl: "Sublingual; may repeat q5min x3; call 911 if no relief; never with PDE5 inhibitors.", t: 2 },
  { g: "clonidine", b: "Catapres", c: "Central alpha-2 agonist", use: "Hypertension, ADHD", pearl: "Do not stop abruptly (rebound hypertension).", t: 3 },
  { g: "hydralazine", b: "Apresoline", c: "Vasodilator", use: "Hypertension", pearl: "Often combined with a nitrate in heart failure.", t: 3 },
  { g: "ranolazine", b: "Ranexa", c: "Antianginal", use: "Chronic angina", pearl: "Do not crush ER tablets; QT prolongation.", t: 4 },

  // ===== Diabetes =====
  { g: "metformin", b: "Glucophage", c: "Biguanide", use: "Type 2 diabetes", pearl: "Take with food for GI tolerance; hold around contrast imaging.", t: 1 },
  { g: "glipizide", b: "Glucotrol", c: "Sulfonylurea", use: "Type 2 diabetes", pearl: "Can cause hypoglycemia; take before meals.", t: 2 },
  { g: "glimepiride", b: "Amaryl", c: "Sulfonylurea", use: "Type 2 diabetes", pearl: "Hypoglycemia risk; take with breakfast.", t: 2 },
  { g: "glyburide", b: "DiaBeta", c: "Sulfonylurea", use: "Type 2 diabetes", pearl: "Higher hypoglycemia risk in elderly (Beers).", t: 3 },
  { g: "sitagliptin", b: "Januvia", c: "DPP-4 inhibitor", use: "Type 2 diabetes", pearl: "Weight-neutral; low hypoglycemia risk alone.", t: 2 },
  { g: "linagliptin", b: "Tradjenta", c: "DPP-4 inhibitor", use: "Type 2 diabetes", pearl: "No renal dose adjustment.", t: 3 },
  { g: "empagliflozin", b: "Jardiance", c: "SGLT2 inhibitor", use: "Type 2 diabetes, heart failure", pearl: "Genital yeast infections; rare euglycemic DKA; stay hydrated.", t: 2 },
  { g: "dapagliflozin", b: "Farxiga", c: "SGLT2 inhibitor", use: "Type 2 diabetes, HF, CKD", pearl: "Genital infections; euglycemic DKA risk.", t: 2 },
  { g: "canagliflozin", b: "Invokana", c: "SGLT2 inhibitor", use: "Type 2 diabetes", pearl: "Take before the first meal; amputation/fracture warnings.", t: 3 },
  { g: "pioglitazone", b: "Actos", c: "Thiazolidinedione", use: "Type 2 diabetes", pearl: "Can cause fluid retention; avoid in heart failure.", t: 3 },
  { g: "semaglutide", b: "Ozempic / Wegovy", c: "GLP-1 receptor agonist", use: "Type 2 diabetes, weight loss", pearl: "Nausea is common; thyroid C-cell tumor boxed warning.", t: 1 },
  { g: "dulaglutide", b: "Trulicity", c: "GLP-1 receptor agonist", use: "Type 2 diabetes", pearl: "Weekly subcutaneous injection; GI side effects.", t: 2 },
  { g: "liraglutide", b: "Victoza / Saxenda", c: "GLP-1 receptor agonist", use: "Type 2 diabetes, weight loss", pearl: "Daily injection; nausea common.", t: 3 },
  { g: "tirzepatide", b: "Mounjaro / Zepbound", c: "GIP/GLP-1 receptor agonist", use: "Type 2 diabetes, weight loss", pearl: "Weekly injection; significant GI effects.", t: 2 },
  { g: "insulin glargine", b: "Lantus / Basaglar", c: "Long-acting insulin", use: "Diabetes (basal)", pearl: "Do not mix with other insulins; once daily.", t: 1 },
  { g: "insulin lispro", b: "Humalog", c: "Rapid-acting insulin", use: "Diabetes (mealtime)", pearl: "Dose at or just before meals.", t: 2 },
  { g: "insulin aspart", b: "Novolog", c: "Rapid-acting insulin", use: "Diabetes (mealtime)", pearl: "Onset ~15 min; give with meals.", t: 2 },
  { g: "insulin NPH", b: "Humulin N / Novolin N", c: "Intermediate insulin", use: "Diabetes", pearl: "Cloudy; roll to mix gently before use.", t: 3 },

  // ===== Thyroid / hormones =====
  { g: "levothyroxine", b: "Synthroid / Levoxyl", c: "Thyroid hormone", use: "Hypothyroidism", pearl: "Take on an empty stomach; separate from calcium and iron.", t: 1 },
  { g: "liothyronine", b: "Cytomel", c: "Thyroid hormone (T3)", use: "Hypothyroidism", pearl: "Short-acting T3.", t: 4 },
  { g: "methimazole", b: "Tapazole", c: "Antithyroid agent", use: "Hyperthyroidism", pearl: "Report sore throat/fever (agranulocytosis).", t: 3 },
  { g: "estradiol", b: "Estrace / Climara", c: "Estrogen", use: "Menopausal symptoms", pearl: "VTE risk; use lowest effective dose.", t: 3 },
  { g: "conjugated estrogens", b: "Premarin", c: "Estrogen", use: "Menopausal symptoms", pearl: "Add a progestin if uterus intact.", t: 3 },
  { g: "testosterone", b: "AndroGel", c: "Androgen", use: "Hypogonadism", pearl: "Avoid skin transfer to women/children; controlled.", sched: "C-III", t: 3 },

  // ===== Corticosteroids =====
  { g: "prednisone", b: "Deltasone", c: "Corticosteroid", use: "Inflammation, immune conditions", pearl: "Take with food; do not stop abruptly (taper).", t: 1 },
  { g: "prednisolone", b: "Prelone", c: "Corticosteroid", use: "Inflammation", pearl: "Liquid often used in children; take with food.", t: 3 },
  { g: "methylprednisolone", b: "Medrol", c: "Corticosteroid", use: "Inflammation", pearl: "Dose pack tapers over 6 days.", t: 2 },
  { g: "dexamethasone", b: "Decadron", c: "Corticosteroid", use: "Inflammation, nausea, edema", pearl: "Long-acting, potent.", t: 3 },

  // ===== Urology / BPH / GU =====
  { g: "finasteride", b: "Proscar / Propecia", c: "5-alpha-reductase inhibitor", use: "BPH, hair loss", pearl: "Pregnant women should not handle broken tablets.", t: 2 },
  { g: "tamsulosin", b: "Flomax", c: "Alpha-1 blocker", use: "BPH", pearl: "Orthostatic dizziness; floppy iris during cataract surgery.", t: 1 },
  { g: "sildenafil", b: "Viagra / Revatio", c: "PDE5 inhibitor", use: "Erectile dysfunction, pulmonary HTN", pearl: "Never with nitrates (severe hypotension).", t: 2 },
  { g: "tadalafil", b: "Cialis / Adcirca", c: "PDE5 inhibitor", use: "ED, BPH, pulmonary HTN", pearl: "Long-acting; never with nitrates.", t: 2 },
  { g: "oxybutynin", b: "Ditropan", c: "Anticholinergic", use: "Overactive bladder", pearl: "Dry mouth/constipation; caution in elderly (Beers).", t: 2 },
  { g: "solifenacin", b: "Vesicare", c: "Anticholinergic", use: "Overactive bladder", pearl: "Anticholinergic effects; QT caution.", t: 3 },
  { g: "mirabegron", b: "Myrbetriq", c: "Beta-3 agonist", use: "Overactive bladder", pearl: "Alternative to anticholinergics; can raise blood pressure.", t: 3 },
  { g: "phenazopyridine", b: "Pyridium", c: "Urinary analgesic", use: "UTI dysuria relief", pearl: "Turns urine orange; short-term use only.", t: 2 },

  // ===== Osteoporosis / bone =====
  { g: "alendronate", b: "Fosamax", c: "Bisphosphonate", use: "Osteoporosis", pearl: "Take with water on empty stomach; stay upright 30 minutes.", t: 2 },
  { g: "risedronate", b: "Actonel", c: "Bisphosphonate", use: "Osteoporosis", pearl: "Same upright/empty-stomach precautions as alendronate.", t: 3 },
  { g: "raloxifene", b: "Evista", c: "SERM", use: "Osteoporosis", pearl: "VTE risk; stop before prolonged immobilization.", t: 4 },

  // ===== GI: PPIs / H2 =====
  { g: "omeprazole", b: "Prilosec", c: "Proton pump inhibitor", use: "GERD, ulcers", pearl: "Take 30-60 min before a meal; interacts with clopidogrel.", t: 1 },
  { g: "pantoprazole", b: "Protonix", c: "Proton pump inhibitor", use: "GERD, ulcers", pearl: "Preferred PPI with clopidogrel.", t: 2 },
  { g: "esomeprazole", b: "Nexium", c: "Proton pump inhibitor", use: "GERD", pearl: "Take before meals.", t: 2 },
  { g: "lansoprazole", b: "Prevacid", c: "Proton pump inhibitor", use: "GERD, ulcers", pearl: "Take before eating.", t: 2 },
  { g: "famotidine", b: "Pepcid", c: "H2 receptor antagonist", use: "Heartburn, GERD", pearl: "Faster onset than PPIs; adjust dose in renal impairment.", t: 2 },

  // ===== GI: other =====
  { g: "ondansetron", b: "Zofran", c: "5-HT3 antagonist", use: "Nausea and vomiting", pearl: "Can prolong QT interval.", t: 2 },
  { g: "promethazine", b: "Phenergan", c: "Antihistamine/antiemetic", use: "Nausea, motion sickness", pearl: "Very sedating; avoid in children under 2.", t: 3 },
  { g: "metoclopramide", b: "Reglan", c: "Prokinetic/antiemetic", use: "Gastroparesis, nausea", pearl: "Tardive dyskinesia risk; limit to <12 weeks.", t: 3 },
  { g: "dicyclomine", b: "Bentyl", c: "Antispasmodic (anticholinergic)", use: "Irritable bowel syndrome", pearl: "Anticholinergic side effects.", t: 3 },
  { g: "sucralfate", b: "Carafate", c: "Mucosal protectant", use: "Ulcers", pearl: "Separate from other meds (binds them); take on empty stomach.", t: 3 },
  { g: "polyethylene glycol", b: "MiraLAX", c: "Osmotic laxative", use: "Constipation", pearl: "Mix in 8 oz liquid; gentle, may take 1-3 days.", t: 2 },
  { g: "docusate", b: "Colace", c: "Stool softener", use: "Constipation prevention", pearl: "Softener, not a stimulant; drink plenty of fluids.", t: 2 },
  { g: "loperamide", b: "Imodium", c: "Antidiarrheal", use: "Diarrhea", pearl: "Avoid if fever or bloody stools; high doses risk cardiac events.", t: 2 },
  { g: "mesalamine", b: "Lialda / Asacol", c: "Aminosalicylate", use: "Ulcerative colitis", pearl: "Do not crush delayed-release forms.", t: 3 },
  { g: "dexlansoprazole", b: "Dexilant", c: "Proton pump inhibitor", use: "GERD", pearl: "Dual-release; can take without regard to meals.", t: 4 },

  // ===== Respiratory =====
  { g: "albuterol", b: "ProAir / Ventolin", c: "Short-acting beta-2 agonist", use: "Asthma/COPD rescue", pearl: "Rescue inhaler; may cause tremor and fast heart rate.", t: 1 },
  { g: "levalbuterol", b: "Xopenex", c: "Short-acting beta-2 agonist", use: "Asthma rescue", pearl: "Similar to albuterol with possibly less tremor.", t: 3 },
  { g: "fluticasone/salmeterol", b: "Advair", c: "ICS/LABA combo inhaler", use: "Asthma, COPD maintenance", pearl: "Rinse mouth after use to prevent thrush; not a rescue inhaler.", t: 2 },
  { g: "budesonide/formoterol", b: "Symbicort", c: "ICS/LABA combo inhaler", use: "Asthma, COPD", pearl: "Rinse mouth after use.", t: 2 },
  { g: "fluticasone (inhaled)", b: "Flovent", c: "Inhaled corticosteroid", use: "Asthma maintenance", pearl: "Controller, not rescue; rinse mouth after use.", t: 2 },
  { g: "montelukast", b: "Singulair", c: "Leukotriene receptor antagonist", use: "Asthma, allergic rhinitis", pearl: "Boxed warning for neuropsychiatric effects (mood changes).", t: 2 },
  { g: "tiotropium", b: "Spiriva", c: "Long-acting anticholinergic (LAMA)", use: "COPD maintenance", pearl: "Once daily; not a rescue inhaler.", t: 3 },
  { g: "ipratropium/albuterol", b: "Combivent", c: "SAMA/SABA combo", use: "COPD", pearl: "Caution with narrow-angle glaucoma.", t: 3 },
  { g: "fluticasone nasal", b: "Flonase", c: "Intranasal corticosteroid", use: "Allergic rhinitis", pearl: "Aim away from the septum; takes days for full effect.", t: 2 },
  { g: "benzonatate", b: "Tessalon Perles", c: "Antitussive", use: "Cough", pearl: "Swallow whole; chewing numbs the mouth/throat; toxic in overdose.", t: 3 },
  { g: "guaifenesin", b: "Mucinex", c: "Expectorant", use: "Chest congestion", pearl: "Drink plenty of water to thin mucus.", t: 2 },

  // ===== Antihistamines =====
  { g: "cetirizine", b: "Zyrtec", c: "2nd-gen antihistamine", use: "Allergies", pearl: "Least sedating but can cause mild drowsiness.", t: 1 },
  { g: "loratadine", b: "Claritin", c: "2nd-gen antihistamine", use: "Allergies", pearl: "Non-drowsy; once daily.", t: 1 },
  { g: "fexofenadine", b: "Allegra", c: "2nd-gen antihistamine", use: "Allergies", pearl: "Avoid taking with fruit juice (reduces absorption).", t: 2 },
  { g: "levocetirizine", b: "Xyzal", c: "2nd-gen antihistamine", use: "Allergies", pearl: "Take in the evening.", t: 3 },
  { g: "diphenhydramine", b: "Benadryl", c: "1st-gen antihistamine", use: "Allergies, sleep", pearl: "Sedating and anticholinergic; caution in elderly (Beers).", t: 1 },
  { g: "hydroxyzine", b: "Vistaril / Atarax", c: "Antihistamine", use: "Anxiety, itching", pearl: "Sedating; sound-alike with hydralazine.", t: 2 },
  { g: "meclizine", b: "Antivert", c: "Antihistamine", use: "Vertigo, motion sickness", pearl: "Causes drowsiness.", t: 3 },

  // ===== SSRIs/SNRIs/antidepressants =====
  { g: "sertraline", b: "Zoloft", c: "SSRI", use: "Depression, anxiety", pearl: "Take with food for GI tolerance; full effect in weeks.", t: 1 },
  { g: "escitalopram", b: "Lexapro", c: "SSRI", use: "Depression, anxiety", pearl: "Well tolerated; do not stop abruptly.", t: 1 },
  { g: "citalopram", b: "Celexa", c: "SSRI", use: "Depression", pearl: "Dose-related QT prolongation (max 40 mg, 20 mg if elderly).", t: 2 },
  { g: "fluoxetine", b: "Prozac", c: "SSRI", use: "Depression, OCD", pearl: "Very long half-life; activating.", t: 1 },
  { g: "paroxetine", b: "Paxil", c: "SSRI", use: "Depression, anxiety", pearl: "Most anticholinergic SSRI; notable withdrawal; avoid in pregnancy.", t: 2 },
  { g: "duloxetine", b: "Cymbalta", c: "SNRI", use: "Depression, neuropathic pain", pearl: "Also for fibromyalgia; do not stop abruptly.", t: 1 },
  { g: "venlafaxine", b: "Effexor", c: "SNRI", use: "Depression, anxiety", pearl: "Can raise blood pressure; marked discontinuation symptoms.", t: 2 },
  { g: "desvenlafaxine", b: "Pristiq", c: "SNRI", use: "Depression", pearl: "Do not crush ER tablet.", t: 3 },
  { g: "bupropion", b: "Wellbutrin / Zyban", c: "Aminoketone (NDRI)", use: "Depression, smoking cessation", pearl: "Lowers seizure threshold; avoid in eating disorders; not sexually impairing.", t: 1 },
  { g: "mirtazapine", b: "Remeron", c: "Atypical antidepressant", use: "Depression", pearl: "Sedating and increases appetite; take at bedtime.", t: 2 },
  { g: "trazodone", b: "Desyrel", c: "Serotonin antagonist (SARI)", use: "Insomnia, depression", pearl: "Sedating; rare priapism warning.", t: 1 },
  { g: "amitriptyline", b: "Elavil", c: "Tricyclic antidepressant", use: "Depression, neuropathic pain", pearl: "Anticholinergic; dangerous in overdose.", t: 2 },
  { g: "nortriptyline", b: "Pamelor", c: "Tricyclic antidepressant", use: "Depression, neuropathic pain", pearl: "Fewer anticholinergic effects than amitriptyline.", t: 3 },

  // ===== Benzodiazepines / sleep =====
  { g: "alprazolam", b: "Xanax", c: "Benzodiazepine", use: "Anxiety, panic", pearl: "Dependence and sedation; controlled.", sched: "C-IV", t: 1 },
  { g: "lorazepam", b: "Ativan", c: "Benzodiazepine", use: "Anxiety, seizures", pearl: "No active metabolites; controlled.", sched: "C-IV", t: 1 },
  { g: "clonazepam", b: "Klonopin", c: "Benzodiazepine", use: "Anxiety, seizures", pearl: "Long-acting; controlled.", sched: "C-IV", t: 2 },
  { g: "diazepam", b: "Valium", c: "Benzodiazepine", use: "Anxiety, spasm, seizures", pearl: "Long half-life; controlled.", sched: "C-IV", t: 2 },
  { g: "temazepam", b: "Restoril", c: "Benzodiazepine", use: "Insomnia", pearl: "Controlled; for short-term sleep.", sched: "C-IV", t: 3 },
  { g: "zolpidem", b: "Ambien", c: "Z-hypnotic (sedative)", use: "Insomnia", pearl: "Complex sleep behaviors; take right before bed; controlled.", sched: "C-IV", t: 1 },
  { g: "eszopiclone", b: "Lunesta", c: "Z-hypnotic (sedative)", use: "Insomnia", pearl: "Metallic taste; controlled.", sched: "C-IV", t: 3 },

  // ===== Antipsychotics / mood =====
  { g: "quetiapine", b: "Seroquel", c: "Atypical antipsychotic", use: "Bipolar, schizophrenia", pearl: "Sedating; metabolic monitoring needed.", t: 2 },
  { g: "aripiprazole", b: "Abilify", c: "Atypical antipsychotic", use: "Schizophrenia, bipolar, adjunct", pearl: "Less sedating; impulse-control warning.", t: 2 },
  { g: "risperidone", b: "Risperdal", c: "Atypical antipsychotic", use: "Schizophrenia, bipolar", pearl: "Raises prolactin; EPS at higher doses.", t: 2 },
  { g: "olanzapine", b: "Zyprexa", c: "Atypical antipsychotic", use: "Schizophrenia, bipolar", pearl: "Significant weight gain and metabolic effects.", t: 3 },
  { g: "lithium", b: "Lithobid", c: "Mood stabilizer", use: "Bipolar disorder", pearl: "Narrow therapeutic index; keep hydration/sodium steady; monitor levels.", t: 3 },

  // ===== Anticonvulsants =====
  { g: "gabapentin", b: "Neurontin", c: "Anticonvulsant", use: "Neuropathic pain, seizures", pearl: "Sedation/dizziness; taper to stop.", t: 1 },
  { g: "pregabalin", b: "Lyrica", c: "Anticonvulsant", use: "Neuropathic pain, fibromyalgia", pearl: "Controlled; dizziness and edema.", sched: "C-V", t: 2 },
  { g: "topiramate", b: "Topamax", c: "Anticonvulsant", use: "Seizures, migraine prophylaxis", pearl: "Cognitive fog, kidney stones, tingling, weight loss.", t: 2 },
  { g: "lamotrigine", b: "Lamictal", c: "Anticonvulsant", use: "Seizures, bipolar", pearl: "Titrate slowly; report any rash (Stevens-Johnson).", t: 2 },
  { g: "levetiracetam", b: "Keppra", c: "Anticonvulsant", use: "Seizures", pearl: "Can cause irritability/mood changes.", t: 2 },
  { g: "divalproex", b: "Depakote", c: "Anticonvulsant", use: "Seizures, bipolar, migraine", pearl: "Hepatotoxic and highly teratogenic; monitor levels.", t: 3 },
  { g: "carbamazepine", b: "Tegretol", c: "Anticonvulsant", use: "Seizures, neuralgia", pearl: "HLA-B*1502 testing in at-risk ancestry; many interactions.", t: 3 },
  { g: "phenytoin", b: "Dilantin", c: "Anticonvulsant", use: "Seizures", pearl: "Narrow therapeutic index; gum overgrowth.", t: 3 },
  { g: "oxcarbazepine", b: "Trileptal", c: "Anticonvulsant", use: "Seizures", pearl: "Can cause low sodium (hyponatremia).", t: 3 },

  // ===== ADHD / stimulants =====
  { g: "methylphenidate", b: "Ritalin / Concerta", c: "CNS stimulant", use: "ADHD", pearl: "Controlled; monitor appetite, sleep, blood pressure.", sched: "C-II", t: 2 },
  { g: "amphetamine/dextroamphetamine", b: "Adderall", c: "CNS stimulant", use: "ADHD", pearl: "Controlled; appetite/sleep effects; no early refills.", sched: "C-II", t: 1 },
  { g: "lisdexamfetamine", b: "Vyvanse", c: "CNS stimulant (prodrug)", use: "ADHD, binge eating", pearl: "Controlled; capsule may be opened in water.", sched: "C-II", t: 2 },
  { g: "atomoxetine", b: "Strattera", c: "Non-stimulant (NRI)", use: "ADHD", pearl: "Not controlled; takes weeks to work.", t: 3 },

  // ===== Neuro =====
  { g: "levodopa/carbidopa", b: "Sinemet", c: "Antiparkinson agent", use: "Parkinson's disease", pearl: "Protein-rich meals can reduce absorption; do not stop abruptly.", t: 3 },
  { g: "ropinirole", b: "Requip", c: "Dopamine agonist", use: "Parkinson's, restless legs", pearl: "Can cause sudden sleep onset and impulse-control issues.", t: 3 },
  { g: "donepezil", b: "Aricept", c: "Cholinesterase inhibitor", use: "Alzheimer's dementia", pearl: "GI upset; take at bedtime.", t: 3 },
  { g: "memantine", b: "Namenda", c: "NMDA receptor antagonist", use: "Alzheimer's dementia", pearl: "Often combined with donepezil.", t: 3 },
  { g: "sumatriptan", b: "Imitrex", c: "Triptan", use: "Migraine", pearl: "Not within 24h of ergots/other triptans; CV caution.", t: 2 },
  { g: "rizatriptan", b: "Maxalt", c: "Triptan", use: "Migraine", pearl: "Orally disintegrating option available.", t: 3 },
  { g: "baclofen", b: "Lioresal", c: "Skeletal muscle relaxant", use: "Spasticity", pearl: "Do not stop abruptly (withdrawal).", t: 3 },
  { g: "cyclobenzaprine", b: "Flexeril", c: "Skeletal muscle relaxant", use: "Muscle spasm", pearl: "Sedating and anticholinergic; short-term use.", t: 2 },
  { g: "tizanidine", b: "Zanaflex", c: "Skeletal muscle relaxant", use: "Spasticity", pearl: "Causes dry mouth and low blood pressure.", t: 3 },
  { g: "methocarbamol", b: "Robaxin", c: "Skeletal muscle relaxant", use: "Muscle spasm", pearl: "May cause drowsiness; can discolor urine.", t: 3 },

  // ===== Pain / opioids / gout =====
  { g: "acetaminophen", b: "Tylenol", c: "Analgesic/antipyretic", use: "Pain, fever", pearl: "Max ~3-4 g/day; watch hidden acetaminophen in combo products.", t: 1 },
  { g: "ibuprofen", b: "Advil / Motrin", c: "NSAID", use: "Pain, inflammation, fever", pearl: "Take with food; GI, renal, and CV risks.", t: 1 },
  { g: "naproxen", b: "Aleve / Naprosyn", c: "NSAID", use: "Pain, inflammation", pearl: "Longer-acting NSAID; take with food.", t: 2 },
  { g: "celecoxib", b: "Celebrex", c: "COX-2 selective NSAID", use: "Arthritis pain", pearl: "Lower GI risk; sulfonamide; CV caution.", t: 2 },
  { g: "meloxicam", b: "Mobic", c: "NSAID", use: "Arthritis", pearl: "Once daily; usual NSAID precautions.", t: 2 },
  { g: "diclofenac", b: "Voltaren", c: "NSAID", use: "Arthritis pain", pearl: "Topical gel available OTC for joints.", t: 2 },
  { g: "tramadol", b: "Ultram", c: "Opioid agonist / SNRI", use: "Moderate pain", pearl: "Lowers seizure threshold; serotonin syndrome risk; controlled.", sched: "C-IV", t: 2 },
  { g: "hydrocodone/acetaminophen", b: "Norco / Vicodin", c: "Opioid combination", use: "Moderate-severe pain", pearl: "Controlled; respiratory depression; mind the acetaminophen limit.", sched: "C-II", t: 2 },
  { g: "oxycodone", b: "Roxicodone", c: "Opioid", use: "Severe pain", pearl: "Controlled; sedation/respiratory depression; constipation.", sched: "C-II", t: 2 },
  { g: "oxycodone/acetaminophen", b: "Percocet", c: "Opioid combination", use: "Moderate-severe pain", pearl: "Controlled; acetaminophen ceiling applies.", sched: "C-II", t: 2 },
  { g: "morphine", b: "MS Contin", c: "Opioid", use: "Severe pain", pearl: "Controlled; do not crush ER tablets.", sched: "C-II", t: 3 },
  { g: "buprenorphine/naloxone", b: "Suboxone", c: "Partial opioid agonist", use: "Opioid use disorder", pearl: "Sublingual film; controlled.", sched: "C-III", t: 3 },
  { g: "naloxone", b: "Narcan", c: "Opioid antagonist", use: "Opioid overdose reversal", pearl: "Intranasal; call 911 after giving; effect may wear off.", t: 2 },
  { g: "allopurinol", b: "Zyloprim", c: "Xanthine oxidase inhibitor", use: "Gout prevention", pearl: "Don't start during an acute flare; report rash.", t: 2 },
  { g: "colchicine", b: "Colcrys", c: "Anti-gout agent", use: "Acute gout", pearl: "GI side effects; serious interactions (e.g., clarithromycin).", t: 3 },

  // ===== Antibiotics =====
  { g: "amoxicillin", b: "Amoxil", c: "Penicillin antibiotic", use: "Bacterial infections", pearl: "Avoid with penicillin allergy.", t: 1 },
  { g: "amoxicillin/clavulanate", b: "Augmentin", c: "Penicillin combination antibiotic", use: "Bacterial infections", pearl: "Take with food to reduce diarrhea.", t: 1 },
  { g: "cephalexin", b: "Keflex", c: "1st-gen cephalosporin", use: "Skin, UTI infections", pearl: "Caution if severe penicillin allergy.", t: 1 },
  { g: "cefdinir", b: "Omnicef", c: "3rd-gen cephalosporin", use: "Respiratory infections", pearl: "Can cause reddish stools with iron.", t: 2 },
  { g: "azithromycin", b: "Zithromax", c: "Macrolide antibiotic", use: "Respiratory, STI infections", pearl: "Z-Pak; can prolong QT.", t: 1 },
  { g: "clarithromycin", b: "Biaxin", c: "Macrolide antibiotic", use: "Respiratory infections", pearl: "Strong CYP3A4 inhibitor (many interactions).", t: 3 },
  { g: "ciprofloxacin", b: "Cipro", c: "Fluoroquinolone antibiotic", use: "UTI, GI infections", pearl: "Tendon rupture; separate from calcium/iron/antacids; QT.", t: 2 },
  { g: "levofloxacin", b: "Levaquin", c: "Fluoroquinolone antibiotic", use: "Respiratory, UTI infections", pearl: "Tendon/QT warnings; avoid cations near dose.", t: 2 },
  { g: "doxycycline", b: "Vibramycin", c: "Tetracycline antibiotic", use: "Infections, acne", pearl: "Photosensitivity; avoid in pregnancy/young kids; separate from cations.", t: 1 },
  { g: "minocycline", b: "Minocin", c: "Tetracycline antibiotic", use: "Acne, infections", pearl: "Can cause dizziness and skin discoloration.", t: 3 },
  { g: "sulfamethoxazole/trimethoprim", b: "Bactrim / Septra", c: "Sulfonamide antibiotic", use: "UTI, MRSA infections", pearl: "Sulfa allergy; raises INR and potassium; photosensitivity.", t: 1 },
  { g: "nitrofurantoin", b: "Macrobid", c: "Urinary antibiotic", use: "Uncomplicated UTI", pearl: "Take with food; avoid in significant renal impairment.", t: 2 },
  { g: "metronidazole", b: "Flagyl", c: "Antibiotic/antiprotozoal", use: "Anaerobic and BV infections", pearl: "Avoid alcohol (disulfiram-like reaction).", t: 1 },
  { g: "clindamycin", b: "Cleocin", c: "Lincosamide antibiotic", use: "Skin, dental infections", pearl: "Notable C. difficile risk.", t: 2 },
  { g: "penicillin VK", b: "Penicillin VK", c: "Penicillin antibiotic", use: "Strep throat", pearl: "Take on an empty stomach.", t: 3 },

  // ===== Antifungals / antivirals =====
  { g: "fluconazole", b: "Diflucan", c: "Azole antifungal", use: "Yeast/candida infections", pearl: "CYP interactions; can prolong QT.", t: 2 },
  { g: "nystatin", b: "Nystatin", c: "Antifungal", use: "Oral/skin candidiasis", pearl: "Swish-and-swallow for thrush.", t: 3 },
  { g: "terbinafine", b: "Lamisil", c: "Antifungal", use: "Nail fungus", pearl: "Monitor liver function for long courses.", t: 3 },
  { g: "valacyclovir", b: "Valtrex", c: "Antiviral", use: "Herpes, shingles", pearl: "Start early; stay hydrated.", t: 2 },
  { g: "acyclovir", b: "Zovirax", c: "Antiviral", use: "Herpes infections", pearl: "Stay well hydrated.", t: 3 },
  { g: "oseltamivir", b: "Tamiflu", c: "Antiviral (neuraminidase inhibitor)", use: "Influenza", pearl: "Most effective started within 48 hours of symptoms.", t: 2 },

  // ===== Eye / glaucoma =====
  { g: "latanoprost", b: "Xalatan", c: "Prostaglandin analog (ophthalmic)", use: "Glaucoma", pearl: "Can darken iris and lengthen lashes; refrigerate unopened.", t: 3 },
  { g: "timolol ophthalmic", b: "Timoptic", c: "Beta blocker (ophthalmic)", use: "Glaucoma", pearl: "Systemic absorption possible; caution in asthma.", t: 3 },

  // ===== Women's health / contraception =====
  { g: "ethinyl estradiol/norethindrone", b: "Combined oral contraceptive", c: "Combined oral contraceptive", use: "Contraception", pearl: "VTE risk, especially in smokers over 35.", t: 2 },
  { g: "drospirenone/ethinyl estradiol", b: "Yaz / Yasmin", c: "Combined oral contraceptive", use: "Contraception, acne", pearl: "Can raise potassium.", t: 3 },
  { g: "norethindrone", b: "Camila", c: "Progestin-only pill", use: "Contraception", pearl: "Take at the same time daily (narrow window).", t: 3 },
  { g: "medroxyprogesterone", b: "Provera / Depo-Provera", c: "Progestin", use: "Contraception, bleeding", pearl: "Injectable form can reduce bone density.", t: 3 },

  // ===== DMARDs / biologics =====
  { g: "methotrexate", b: "Trexall", c: "DMARD / antimetabolite", use: "Rheumatoid arthritis, psoriasis", pearl: "Dosed WEEKLY for RA; take folic acid; teratogenic.", t: 3 },
  { g: "hydroxychloroquine", b: "Plaquenil", c: "Antimalarial / DMARD", use: "Lupus, rheumatoid arthritis", pearl: "Needs regular eye exams (retinopathy).", t: 3 },
  { g: "sulfasalazine", b: "Azulfidine", c: "DMARD / aminosalicylate", use: "RA, ulcerative colitis", pearl: "Can turn urine/skin yellow-orange; sulfa.", t: 3 },
  { g: "adalimumab", b: "Humira", c: "TNF inhibitor (biologic)", use: "RA, Crohn's, psoriasis", pearl: "Subcutaneous; serious infection risk; keep refrigerated.", t: 3 },
  { g: "etanercept", b: "Enbrel", c: "TNF inhibitor (biologic)", use: "Rheumatoid arthritis", pearl: "Subcutaneous; increased infection risk.", t: 4 },

  // ===== Supplements / electrolytes / misc =====
  { g: "ferrous sulfate", b: "Feosol", c: "Iron supplement", use: "Iron-deficiency anemia", pearl: "Take on empty stomach with vitamin C; separate from antacids.", t: 2 },
  { g: "cholecalciferol", b: "Vitamin D3", c: "Vitamin D supplement", use: "Vitamin D deficiency", pearl: "Fat-soluble; take with a meal.", t: 2 },
  { g: "potassium chloride", b: "Klor-Con", c: "Electrolyte supplement", use: "Low potassium", pearl: "Take with food; do not crush ER; can irritate the stomach.", t: 2 },
  { g: "cyanocobalamin", b: "Vitamin B12", c: "Vitamin supplement", use: "B12 deficiency", pearl: "Available oral or injectable.", t: 3 },
  { g: "folic acid", b: "Folic acid", c: "Vitamin supplement", use: "Folate deficiency, pregnancy", pearl: "Recommended before/during pregnancy.", t: 3 },
  { g: "varenicline", b: "Chantix", c: "Smoking cessation aid", use: "Smoking cessation", pearl: "Take after eating with water; report mood changes.", t: 3 },
  { g: "phytonadione", b: "Vitamin K1 / Mephyton", c: "Vitamin K", use: "Warfarin reversal", pearl: "Reverses warfarin effect.", t: 4 },
  { g: "lisinopril/hydrochlorothiazide", b: "Zestoretic", c: "ACE inhibitor + thiazide", use: "Hypertension", pearl: "Combination pill; dry cough and hyperkalemia from the ACE, electrolyte loss from the diuretic; take in the morning.", t: 2 },
  { g: "losartan/hydrochlorothiazide", b: "Hyzaar", c: "ARB + thiazide", use: "Hypertension", pearl: "Combo; morning dosing; monitor potassium and renal function.", t: 2 },
  { g: "valsartan/hydrochlorothiazide", b: "Diovan HCT", c: "ARB + thiazide", use: "Hypertension", pearl: "Combo; avoid in pregnancy; photosensitivity from the thiazide.", t: 3 },
  { g: "amlodipine/benazepril", b: "Lotrel", c: "CCB + ACE inhibitor", use: "Hypertension", pearl: "Combo; ankle swelling from amlodipine, dry cough from benazepril.", t: 3 },
  { g: "sacubitril/valsartan", b: "Entresto", c: "ARNI", use: "Heart failure (reduced EF)", pearl: "Do NOT use within 36 hours of an ACE inhibitor; watch for angioedema and hyperkalemia.", t: 3 },
  { g: "doxazosin", b: "Cardura", c: "Alpha-1 blocker", use: "Hypertension, BPH", pearl: "Take the first dose at bedtime—first-dose fainting/dizziness; rise slowly.", t: 2 },
  { g: "terazosin", b: "Hytrin", c: "Alpha-1 blocker", use: "BPH, hypertension", pearl: "First-dose dizziness; take at bedtime; orthostatic hypotension.", t: 3 },
  { g: "prazosin", b: "Minipress", c: "Alpha-1 blocker", use: "Hypertension, PTSD nightmares", pearl: "Often used for PTSD nightmares; orthostatic hypotension—rise slowly.", t: 3 },
  { g: "flecainide", b: "Tambocor", c: "Class IC antiarrhythmic", use: "Atrial fibrillation, SVT", pearl: "Avoid in structural heart disease; report palpitations or fainting.", t: 4 },
  { g: "sotalol", b: "Betapace", c: "Beta blocker / class III antiarrhythmic", use: "Arrhythmias", pearl: "Usually started in the hospital with monitoring; prolongs QT.", t: 4 },
  { g: "isosorbide dinitrate", b: "Isordil", c: "Nitrate", use: "Angina prophylaxis", pearl: "Maintain a daily nitrate-free interval to avoid tolerance; contraindicated with PDE5 inhibitors.", t: 3 },
  { g: "niacin", b: "Niaspan", c: "Antilipemic (vitamin B3)", use: "Dyslipidemia", pearl: "Flushing is common—taking with food and/or aspirin and avoiding alcohol/hot drinks helps.", t: 3 },
  { g: "cholestyramine", b: "Questran", c: "Bile acid sequestrant", use: "High cholesterol", pearl: "Take other medications 1 hour before or 4–6 hours after (it binds them); mix powder in liquid.", t: 3 },
  { g: "evolocumab", b: "Repatha", c: "PCSK9 inhibitor", use: "Dyslipidemia (high CV risk)", pearl: "Subcutaneous injection every 2 weeks or monthly; refrigerate; let it warm before injecting.", t: 4 },
  { g: "eplerenone", b: "Inspra", c: "Aldosterone antagonist", use: "Heart failure, hypertension", pearl: "Potassium-sparing—monitor potassium, especially with ACE/ARB.", t: 4 },
  { g: "bumetanide", b: "Bumex", c: "Loop diuretic", use: "Edema", pearl: "Potent loop diuretic; take early in the day; monitor electrolytes.", t: 4 },
  { g: "prasugrel", b: "Effient", c: "P2Y12 antiplatelet", use: "ACS / post-stent", pearl: "Bleeding risk; contraindicated with prior stroke/TIA; don't stop without guidance.", t: 4 },
  { g: "edoxaban", b: "Savaysa", c: "Factor Xa inhibitor (DOAC)", use: "Atrial fibrillation, VTE", pearl: "Bleeding risk; effectiveness varies with kidney function—follow labeling.", t: 4 },
  { g: "insulin detemir", b: "Levemir", c: "Long-acting (basal) insulin", use: "Diabetes", pearl: "Basal insulin; rotate sites; do not mix with other insulins.", t: 2 },
  { g: "insulin degludec", b: "Tresiba", c: "Ultra-long-acting basal insulin", use: "Diabetes", pearl: "Very long-acting with flexible timing; rotate injection sites.", t: 2 },
  { g: "insulin regular", b: "Humulin R / Novolin R", c: "Short-acting insulin", use: "Diabetes", pearl: "Clear insulin; give about 30 minutes before meals.", t: 2 },
  { g: "repaglinide", b: "Prandin", c: "Meglitinide", use: "Type 2 diabetes", pearl: "Take with meals; skip the dose if you skip the meal (hypoglycemia).", t: 4 },
  { g: "norgestimate/ethinyl estradiol", b: "Ortho Tri-Cyclen / Sprintec", c: "Combined oral contraceptive", use: "Contraception, acne", pearl: "Take at the same time daily; follow missed-dose rules; report leg/chest pain.", t: 2 },
  { g: "levonorgestrel", b: "Plan B One-Step", c: "Emergency contraceptive (progestin)", use: "Emergency contraception", pearl: "Most effective the sooner it's taken; available OTC; may shift the next period.", t: 2 },
  { g: "desmopressin", b: "DDAVP", c: "Vasopressin analog", use: "Diabetes insipidus, bedwetting", pearl: "Follow fluid restriction guidance—risk of low sodium (hyponatremia).", t: 4 },
  { g: "pseudoephedrine", b: "Sudafed", c: "Oral decongestant", use: "Nasal/sinus congestion", pearl: "Kept behind the counter; can raise blood pressure and cause insomnia—caution in hypertension.", t: 2 },
  { g: "phenylephrine", b: "Sudafed PE", c: "Oral decongestant", use: "Nasal congestion", pearl: "Oral effectiveness is limited; still raises blood pressure.", t: 3 },
  { g: "dextromethorphan", b: "Delsym", c: "Antitussive", use: "Cough", pearl: "Avoid with MAOIs or other serotonergic drugs (serotonin syndrome); abuse potential at high doses.", t: 2 },
  { g: "doxylamine/pyridoxine", b: "Diclegis", c: "Antihistamine + vitamin B6", use: "Nausea/vomiting of pregnancy", pearl: "First-line for pregnancy nausea; delayed-release—take preventively; causes drowsiness.", t: 3 },
  { g: "prochlorperazine", b: "Compazine", c: "Antiemetic (D2 antagonist)", use: "Nausea/vomiting", pearl: "Can cause restlessness or muscle stiffness (EPS) and sedation.", t: 3 },
  { g: "scopolamine", b: "Transderm Scop", c: "Anticholinergic", use: "Motion sickness, post-op nausea", pearl: "Apply patch behind the ear hours before travel; wash hands after (don't rub eyes); dry mouth.", t: 3 },
  { g: "bismuth subsalicylate", b: "Pepto-Bismol", c: "Antidiarrheal / antacid", use: "Upset stomach, diarrhea", pearl: "Can darken the tongue and stool (harmless); contains a salicylate—avoid in children with viral illness.", t: 2 },
  { g: "calcium carbonate", b: "Tums", c: "Antacid / calcium supplement", use: "Heartburn, calcium supplement", pearl: "Fast heartburn relief; separate from levothyroxine, iron, and some antibiotics.", t: 2 },
  { g: "magnesium hydroxide", b: "Milk of Magnesia", c: "Osmotic laxative / antacid", use: "Constipation, heartburn", pearl: "Works within hours; caution in kidney disease (magnesium buildup).", t: 2 },
  { g: "bisacodyl", b: "Dulcolax", c: "Stimulant laxative", use: "Constipation", pearl: "Don't crush enteric-coated tablets or take with milk/antacids; works in 6–12 hours.", t: 2 },
  { g: "senna", b: "Senokot", c: "Stimulant laxative", use: "Constipation", pearl: "Commonly paired with a stool softener for opioid-induced constipation.", t: 2 },
  { g: "lactulose", b: "Enulose", c: "Osmotic laxative", use: "Constipation, hepatic encephalopathy", pearl: "Titrate to 2–3 soft stools/day; sweet syrup.", t: 3 },
  { g: "psyllium", b: "Metamucil", c: "Bulk-forming fiber laxative", use: "Constipation", pearl: "Take with a full glass of water to avoid choking/obstruction; separate from other meds.", t: 2 },
  { g: "simethicone", b: "Gas-X", c: "Antiflatulent", use: "Gas / bloating", pearl: "Breaks up gas bubbles; not absorbed; safe OTC option.", t: 2 },
  { g: "linaclotide", b: "Linzess", c: "Guanylate cyclase-C agonist", use: "IBS-C, chronic constipation", pearl: "Take 30 minutes before the first meal of the day; contraindicated in young children.", t: 3 },
  { g: "hyoscyamine", b: "Levsin", c: "Anticholinergic antispasmodic", use: "GI/bladder spasm", pearl: "Dry mouth, blurred vision, constipation; sublingual form available.", t: 3 },
  { g: "misoprostol", b: "Cytotec", c: "Prostaglandin analog", use: "NSAID ulcer prevention", pearl: "Contraindicated in pregnancy (causes contractions/miscarriage); take with food.", t: 4 },
  { g: "azelastine nasal", b: "Astepro", c: "Intranasal antihistamine", use: "Allergic rhinitis", pearl: "Can leave a bitter taste; may cause drowsiness.", t: 3 },
  { g: "budesonide nasal", b: "Rhinocort", c: "Intranasal corticosteroid", use: "Allergic rhinitis", pearl: "OTC; use regularly for best effect; aim away from the septum.", t: 3 },
  { g: "umeclidinium/vilanterol", b: "Anoro Ellipta", c: "LAMA + LABA inhaler", use: "COPD maintenance", pearl: "Once-daily maintenance inhaler—not a rescue inhaler; dry mouth.", t: 3 },
  { g: "theophylline", b: "Theo-24", c: "Methylxanthine bronchodilator", use: "COPD, asthma", pearl: "Narrow therapeutic index—needs blood levels; many drug and smoking interactions.", t: 4 },
  { g: "cefuroxime", b: "Ceftin", c: "2nd-generation cephalosporin", use: "Respiratory, skin infections", pearl: "Take tablets with food; finish the full course.", t: 3 },
  { g: "erythromycin", b: "Ery-Tab", c: "Macrolide antibiotic", use: "Bacterial infections", pearl: "GI upset is common; strong CYP3A4 interactions and QT prolongation.", t: 3 },
  { g: "moxifloxacin", b: "Avelox", c: "Fluoroquinolone antibiotic", use: "Respiratory infections", pearl: "Tendon rupture and QT risks; separate from calcium/iron/antacids.", t: 4 },
  { g: "linezolid", b: "Zyvox", c: "Oxazolidinone antibiotic", use: "Resistant gram-positive (MRSA, VRE)", pearl: "Has MAOI activity—serotonin syndrome with SSRIs/SNRIs; limit tyramine-rich foods.", t: 4 },
  { g: "itraconazole", b: "Sporanox", c: "Azole antifungal", use: "Fungal infections", pearl: "Many drug interactions (CYP3A4); capsules taken with food/acidic drink.", t: 4 },
  { g: "famciclovir", b: "Famvir", c: "Antiviral", use: "Herpes, shingles", pearl: "Start at the first sign of an outbreak; stay hydrated.", t: 4 },
  { g: "ketoconazole topical", b: "Nizoral", c: "Topical antifungal", use: "Fungal skin infections, dandruff", pearl: "Shampoo: lather and leave on ~5 minutes before rinsing; complete the course.", t: 2 },
  { g: "mupirocin", b: "Bactroban", c: "Topical antibiotic", use: "Impetigo, minor skin infection", pearl: "Apply to the affected area; complete the full course.", t: 2 },
  { g: "permethrin", b: "Elimite / Nix", c: "Topical scabicide/pediculicide", use: "Scabies, head lice", pearl: "Apply and wash off per directions; treat close contacts and wash bedding/clothes.", t: 3 },
  { g: "miconazole", b: "Monistat", c: "Topical/vaginal antifungal", use: "Vaginal yeast infection", pearl: "OTC; oil-based forms can weaken latex condoms; complete the full course.", t: 2 },
  { g: "buspirone", b: "Buspar", c: "Anxiolytic (5-HT1A agonist)", use: "Generalized anxiety", pearl: "Take consistently (not as-needed); takes weeks to work; avoid grapefruit; non-habit-forming.", t: 2 },
  { g: "pramipexole", b: "Mirapex", c: "Dopamine agonist", use: "Parkinson's disease, restless legs", pearl: "Can cause sudden sleep attacks and impulse-control behaviors (gambling, shopping).", t: 3 },
  { g: "rivastigmine", b: "Exelon", c: "Cholinesterase inhibitor", use: "Alzheimer's, Parkinson's dementia", pearl: "Patch—rotate sites and remove the old one; GI side effects.", t: 3 },
  { g: "guanfacine", b: "Intuniv", c: "Central alpha-2 agonist", use: "ADHD, hypertension", pearl: "Sedating; don't stop abruptly (rebound hypertension); non-stimulant.", t: 3 },
  { g: "haloperidol", b: "Haldol", c: "Typical antipsychotic", use: "Psychosis, severe agitation", pearl: "Watch for muscle stiffness/tremor (EPS); QT prolongation.", t: 3 },
  { g: "lurasidone", b: "Latuda", c: "Atypical antipsychotic", use: "Schizophrenia, bipolar depression", pearl: "Must be taken with food (at least 350 calories) for absorption.", t: 3 },
  { g: "carisoprodol", b: "Soma", c: "Skeletal muscle relaxant", use: "Acute muscle pain", pearl: "Habit-forming and very sedating; short-term use only.", sched: "C-IV", t: 3 },
  { g: "indomethacin", b: "Indocin", c: "NSAID", use: "Gout, pain/inflammation", pearl: "Take with food; more GI and CNS effects than some NSAIDs.", t: 3 },
  { g: "ketorolac", b: "Toradol", c: "NSAID", use: "Short-term acute pain", pearl: "Limited to 5 days total (oral + injectable); high GI/renal risk.", t: 4 },
  { g: "codeine/acetaminophen", b: "Tylenol #3", c: "Opioid + acetaminophen", use: "Mild-to-moderate pain", pearl: "Drowsiness and constipation; don't add other acetaminophen; variable metabolism—avoid in kids/breastfeeding.", sched: "C-III", t: 2 },
  { g: "fentanyl transdermal", b: "Duragesic", c: "Opioid (patch)", use: "Chronic severe pain (opioid-tolerant)", pearl: "For opioid-tolerant patients only; keep heat off the patch; fold used patches and dispose safely—deadly to children.", sched: "C-II", t: 3 },
  { g: "hydromorphone", b: "Dilaudid", c: "Opioid analgesic", use: "Severe pain", pearl: "Potent opioid; constipation; respiratory depression; secure storage.", sched: "C-II", t: 3 },
  { g: "febuxostat", b: "Uloric", c: "Xanthine oxidase inhibitor", use: "Chronic gout", pearl: "May trigger a flare early (use prophylaxis); carries a cardiovascular warning vs allopurinol.", t: 4 },
  { g: "dutasteride", b: "Avodart", c: "5-alpha-reductase inhibitor", use: "BPH", pearl: "Pregnant women shouldn't handle leaking capsules; lowers PSA (~50%); takes months.", t: 3 },
  { g: "tolterodine", b: "Detrol", c: "Antimuscarinic (bladder)", use: "Overactive bladder", pearl: "Dry mouth, constipation, blurred vision; caution in older adults.", t: 3 },
  { g: "vardenafil", b: "Levitra", c: "PDE5 inhibitor", use: "Erectile dysfunction", pearl: "Contraindicated with nitrates; seek care for an erection lasting over 4 hours.", t: 4 },
  { g: "triamcinolone topical", b: "Kenalog", c: "Mid-potency topical corticosteroid", use: "Eczema, dermatitis, itch", pearl: "Apply a thin layer; avoid the face and skin folds unless directed; not for long-term large-area use.", t: 2 },
  { g: "hydrocortisone topical", b: "Cortizone-10", c: "Low-potency topical corticosteroid (OTC)", use: "Minor itch/rash", pearl: "OTC; thin layer; avoid prolonged use on broken skin.", t: 2 },
  { g: "clobetasol", b: "Temovate", c: "High-potency topical corticosteroid", use: "Psoriasis, severe dermatitis", pearl: "Very potent—use sparingly and short-term; avoid the face; can thin the skin with overuse.", t: 3 },
  { g: "mometasone topical", b: "Elocon", c: "Topical corticosteroid", use: "Eczema, dermatitis", pearl: "Apply a thin layer once daily; avoid the face/folds.", t: 3 },
  { g: "tretinoin", b: "Retin-A", c: "Topical retinoid", use: "Acne, photoaging", pearl: "Apply a pea-sized amount at night; use sunscreen; avoid in pregnancy; expect early dryness.", t: 3 },
  { g: "adapalene", b: "Differin", c: "Topical retinoid (OTC)", use: "Acne", pearl: "OTC retinoid; takes weeks; use sunscreen; start every other night if irritated.", t: 2 },
  { g: "clindamycin topical", b: "Cleocin-T", c: "Topical antibiotic", use: "Acne", pearl: "Often combined with benzoyl peroxide; apply to clean, dry skin.", t: 2 },
  { g: "benzoyl peroxide", b: "PanOxyl", c: "Topical antibacterial", use: "Acne", pearl: "Can bleach fabric/towels; start low to limit dryness.", t: 2 },
  { g: "epinephrine auto-injector", b: "EpiPen / Auvi-Q", c: "Adrenergic agonist (emergency)", use: "Anaphylaxis", pearl: "Inject into the outer thigh (through clothing OK), hold in place, then call 911; carry two; check expiration.", t: 2 },
  { g: "melatonin", b: "Melatonin", c: "Sleep aid (supplement)", use: "Sleep onset / jet lag", pearl: "Take 30–60 minutes before bed; OTC supplement—quality varies by brand.", t: 2 },
  { g: "omega-3 fish oil", b: "Lovaza / OTC", c: "Omega-3 fatty acids", use: "High triglycerides", pearl: "Take with meals; high doses may slightly increase bleeding risk.", t: 3 }
];

/* ============================================================
   DRUG MASTERY  (Mode 4) + DRUG REFERENCE  — powered by DRUGS
   ============================================================ */
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

const QTYPES = [
  { id: "b2g", label: "Brand → Generic" },
  { id: "g2b", label: "Generic → Brand" },
  { id: "class", label: "Drug Class" },
  { id: "use", label: "Indication" },
  { id: "couns", label: "Counseling Pearl" },
  { id: "sched", label: "Controlled Schedule" },
];

const SCHED_OPTS = ["C-II", "C-III", "C-IV", "C-V", "Not a controlled substance"];

function uniq(arr) { return [...new Set(arr)]; }
function sample(arr, n) { return shuffle(arr).slice(0, n); }

/* build one question from the pool */
function buildDrugQ(pool, type) {
  const sameClass = (d) => pool.filter((x) => x.c === d.c && x.g !== d.g);

  if (type === "sched") {
    // 55% chance to pick a controlled drug so schedules actually show up
    const controlled = pool.filter((d) => d.sched);
    const d = (controlled.length && Math.random() < 0.55)
      ? controlled[Math.floor(Math.random() * controlled.length)]
      : pool[Math.floor(Math.random() * pool.length)];
    const correct = d.sched || "Not a controlled substance";
    const options = shuffle(SCHED_OPTS);
    return {
      q: `What is the U.S. controlled-substance schedule of ${cap(d.g)}${d.b ? ` (${d.b})` : ""}?`,
      options, answer: options.indexOf(correct),
      explain: d.sched
        ? `${cap(d.g)} is a Schedule ${d.sched.replace("C-", "")} controlled substance. ${d.pearl}`
        : `${cap(d.g)} is not a controlled substance. ${d.pearl}`,
      tag: "Schedule",
    };
  }

  const d = pool[Math.floor(Math.random() * pool.length)];
  let q, correct, distractorSource, explain, tag;

  if (type === "b2g") {
    q = `Which generic drug is sold under the brand name ${d.b}?`;
    correct = cap(d.g);
    distractorSource = uniq([...sameClass(d), ...pool].map((x) => cap(x.g)));
    explain = `${d.b} = ${cap(d.g)} — ${d.c}, for ${d.use.toLowerCase()}.`;
    tag = "Brand → Generic";
  } else if (type === "g2b") {
    q = `What is a brand name for ${cap(d.g)}?`;
    correct = d.b;
    distractorSource = uniq([...sameClass(d), ...pool].map((x) => x.b));
    explain = `${cap(d.g)} is marketed as ${d.b} — ${d.c}.`;
    tag = "Generic → Brand";
  } else if (type === "class") {
    q = `Which class does ${cap(d.g)} (${d.b}) belong to?`;
    correct = d.c;
    distractorSource = uniq(pool.filter((x) => x.c !== d.c).map((x) => x.c));
    explain = `${cap(d.g)} is a ${d.c}, used for ${d.use.toLowerCase()}.`;
    tag = "Drug Class";
  } else if (type === "use") {
    q = `What is the primary use of ${cap(d.g)} (${d.b})?`;
    correct = d.use;
    distractorSource = uniq(pool.filter((x) => x.use !== d.use).map((x) => x.use));
    explain = `${cap(d.g)} (${d.c}) is used for ${d.use.toLowerCase()}.`;
    tag = "Indication";
  } else { // couns
    q = `Which counseling point best fits ${cap(d.g)} (${d.b})?`;
    correct = d.pearl;
    distractorSource = uniq(pool.filter((x) => x.pearl !== d.pearl).map((x) => x.pearl));
    explain = `${cap(d.g)} — ${d.c} for ${d.use.toLowerCase()}.`;
    tag = "Counseling";
  }

  const distractors = sample(distractorSource.filter((x) => x !== correct), 3);
  const options = shuffle([correct, ...distractors]);
  return { q, options, answer: options.indexOf(correct), explain, tag };
}

function buildDrugSession(pool, types, n) {
  const out = [];
  let guard = 0;
  while (out.length < n && guard < n * 12) {
    guard++;
    const type = types[Math.floor(Math.random() * types.length)];
    const item = buildDrugQ(pool, type);
    if (item.options.length < 4) continue;            // need full set of choices
    if (new Set(item.options).size < item.options.length) continue; // no dup options
    if (out.some((o) => o.q === item.q)) continue;    // avoid exact repeats
    out.push(item);
  }
  return out;
}

/* ---------- Mode 4: Drug Mastery ---------- */
function DrugMastery({ level, types, onFinish, onQuit }) {
  const [session] = useState(() => {
    const pool = DRUGS.filter((d) => d.t <= level);
    const t = (types && types.length) ? types : QTYPES.map((x) => x.id);
    return buildDrugSession(pool, t, 12);
  });
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [locked, setLocked] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [correct, setCorrect] = useState(0);

  if (!session.length) return <Empty onQuit={onQuit} />;
  const q = session[idx];

  function answer(i) {
    if (locked) return;
    setSelected(i); setLocked(true);
    if (i === q.answer) {
      setScore((s) => s + 100 + streak * 25);
      const ns = streak + 1; setStreak(ns); setBest((b) => Math.max(b, ns));
      setCorrect((c) => c + 1);
    } else setStreak(0);
  }
  function next() {
    if (idx + 1 >= session.length) {
      onFinish({ mode: 1, score, correct, total: session.length, bestStreak: best, outOfLives: false });
      return;
    }
    setIdx(idx + 1); setSelected(null); setLocked(false);
  }

  return (
    <div className="rise">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 16 }}>
          <Stat label="Score" value={score} color={C.pine} />
          <Stat label="Streak" value={`×${streak}`} color={C.amber} />
        </div>
        <span className="mono" style={{ fontSize: 12, color: C.muted }}>Q{idx + 1} / {session.length}</span>
      </div>
      <ProgressBar value={(idx / session.length) * 100} />

      <div className="rx-card pop" key={idx} style={{ padding: 20, margin: "16px 0" }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: C.amber, marginBottom: 8 }}>{q.tag}</div>
        <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 16px", lineHeight: 1.35 }}>{q.q}</h3>
        <Options options={q.options} answer={q.answer} selected={selected} onSelect={answer} locked={locked} />
        {locked && <Explain correct={selected === q.answer} text={q.explain} />}
      </div>

      {locked && (
        <button onClick={next} style={btn(C.pine, C.paper, { width: "100%" })}>
          {idx + 1 >= session.length ? "Finish set" : "Next →"}
        </button>
      )}
    </div>
  );
}

/* ---------- Drug Reference (lookup) ---------- */
function DrugReference({ onHome }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(null);
  const [controlledOnly, setControlledOnly] = useState(false);

  const q = query.trim().toLowerCase();
  const list = DRUGS
    .filter((d) => !controlledOnly || d.sched)
    .filter((d) =>
      !q ||
      d.g.toLowerCase().includes(q) ||
      d.b.toLowerCase().includes(q) ||
      d.c.toLowerCase().includes(q) ||
      d.use.toLowerCase().includes(q))
    .sort((a, b) => a.g.localeCompare(b.g));

  return (
    <div className="rise">
      <h2 className="display" style={{ fontSize: 26, fontWeight: 900, margin: "0 0 4px" }}>Drug Reference</h2>
      <p style={{ color: C.muted, fontSize: 14.5, margin: "0 0 16px" }}>
        {DRUGS.length} of the most commonly dispensed outpatient medications. Search by generic, brand, class, or use.
      </p>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search e.g. lisinopril, Lipitor, statin, diabetes…"
        style={{
          width: "100%", padding: "13px 16px", borderRadius: 13, fontSize: 15,
          border: `1.5px solid ${C.line}`, background: C.card, color: C.ink,
          fontFamily: "'Spline Sans', sans-serif", outline: "none",
        }}
      />
      <label style={{ display: "flex", alignItems: "center", gap: 8, margin: "12px 2px", fontSize: 13.5, color: C.muted, cursor: "pointer" }}>
        <input type="checkbox" checked={controlledOnly} onChange={(e) => setControlledOnly(e.target.checked)} />
        Controlled substances only
      </label>

      <div className="mono" style={{ fontSize: 11, color: C.muted, margin: "4px 2px 10px" }}>
        {list.length} result{list.length === 1 ? "" : "s"}
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        {list.slice(0, 80).map((d) => {
          const isOpen = open === d.g;
          return (
            <div key={d.g} className="rx-card" style={{ padding: 0, overflow: "hidden" }}>
              <button onClick={() => setOpen(isOpen ? null : d.g)}
                style={{ width: "100%", textAlign: "left", background: "transparent", border: "none",
                  padding: "13px 16px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <span>
                  <span style={{ fontWeight: 700, fontSize: 15.5 }}>{cap(d.g)}</span>
                  <span style={{ color: C.muted, fontSize: 13.5 }}> · {d.b}</span>
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {d.sched && <span className="mono" style={{ fontSize: 10, fontWeight: 600, color: C.clay, border: `1px solid ${C.clay}`, borderRadius: 6, padding: "2px 6px" }}>{d.sched}</span>}
                  <span style={{ color: C.amber, transform: isOpen ? "rotate(90deg)" : "none", transition: "transform .15s" }}>›</span>
                </span>
              </button>
              {isOpen && (
                <div className="pop" style={{ padding: "0 16px 15px", borderTop: `1px solid ${C.line}` }}>
                  <Row k="Class" v={d.c} />
                  <Row k="Used for" v={d.use} />
                  <Row k="Key point" v={d.pearl} />
                  {d.sched && <Row k="Schedule" v={`Schedule ${d.sched.replace("C-", "")} controlled substance`} />}
                  <Row k="Tier" v={`Tier ${d.t} (1 = most commonly dispensed)`} />
                </div>
              )}
            </div>
          );
        })}
        {list.length > 80 && (
          <div className="mono" style={{ fontSize: 12, color: C.muted, textAlign: "center", padding: 8 }}>
            Showing first 80 — refine your search to see more.
          </div>
        )}
        {list.length === 0 && (
          <div className="rx-card" style={{ padding: 20, textAlign: "center", color: C.muted }}>No matches. Try a different term.</div>
        )}
      </div>

      <button onClick={onHome} style={btn("transparent", C.pine, { border: `1px solid ${C.line}`, width: "100%", marginTop: 18 })}>← Home</button>
    </div>
  );
}
function Row({ k, v }) {
  return (
    <div style={{ display: "flex", gap: 10, paddingTop: 10 }}>
      <span className="mono" style={{ minWidth: 78, fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase", color: C.muted, paddingTop: 2 }}>{k}</span>
      <span style={{ fontSize: 14.5, lineHeight: 1.5 }}>{v}</span>
    </div>
  );
}

/* ============================================================
   RX VERIFICATION  (Mode 5) — patient profile + DUR review
   Each case mirrors real bench verification:
   read the Rx against the profile, catch the alert, make the call.
   ============================================================ */
const VERIFY = [
  {
    level: 1,
    rx: { prescriber: "Dr. K. Lee, MD", patient: "R. Bauman", age: "61 y/o", drug: "Amlodipine 5 mg tablet", sig: "1 tab PO once daily", qty: "#30", refills: "5", daw: "DAW 0 (substitution OK)" },
    profile: { allergies: ["No known drug allergies"], meds: ["Atorvastatin 20 mg daily"], conditions: ["Hypertension", "High cholesterol"] },
    steps: [
      { prompt: "Run your DUR check against the profile. What stands out?", options: ["No significant alert — amlodipine with a statin is a routine combination", "Major drug interaction", "Therapeutic duplication", "Drug-allergy conflict"], answer: 0, explain: "Amlodipine and atorvastatin are commonly co-prescribed with no major conflict. (Note: amlodipine does limit simvastatin dosing — but not atorvastatin.) Not every screen is a problem; over-flagging causes alert fatigue." },
      { prompt: "What's the appropriate action?", options: ["Verify and fill", "Hold and call the prescriber", "Reject the prescription"], answer: 0, explain: "Clean profile, sound dose — verify and fill, then counsel." },
      { prompt: "A good counseling point for amlodipine:", options: ["May cause ankle/leg swelling", "Turns urine orange", "Must be taken at bedtime only", "Causes a chronic cough"], answer: 0, explain: "Peripheral edema is the classic amlodipine side effect (dry cough belongs to ACE inhibitors)." },
    ],
  },
  {
    level: 2,
    rx: { prescriber: "Dr. M. Ortiz, MD", patient: "T. Flynn", age: "34 y/o", drug: "Amoxicillin 500 mg capsule", sig: "1 cap PO three times daily × 10 days", qty: "#30", refills: "0", daw: "DAW 0" },
    profile: { allergies: ["PENICILLIN — hives, lip swelling"], meds: ["Lisinopril 10 mg daily"], conditions: ["Acute sinusitis"] },
    steps: [
      { prompt: "Review the allergy field. What's the alert?", options: ["Drug-allergy conflict — amoxicillin is a penicillin", "Drug interaction with lisinopril", "Dose too high", "No alert"], answer: 0, explain: "Amoxicillin IS a penicillin. A documented penicillin allergy (especially with angioedema features) is a hard stop." },
      { prompt: "Your decision:", options: ["Hold and contact the prescriber for an alternative", "Fill — the reaction was probably mild", "Halve the dose and fill"], answer: 0, explain: "Hold and contact the prescriber. Never assume the allergy was reviewed; document the intervention." },
    ],
  },
  {
    level: 2,
    rx: { prescriber: "Dr. S. Adler, MD", patient: "G. Whitman", age: "72 y/o", drug: "Sulfamethoxazole/Trimethoprim DS", sig: "1 tab PO twice daily × 7 days", qty: "#14", refills: "0", daw: "DAW 0" },
    profile: { allergies: ["No known drug allergies"], meds: ["Warfarin 5 mg daily", "Metoprolol succinate 50 mg daily"], conditions: ["Atrial fibrillation", "UTI"] },
    steps: [
      { prompt: "What DUR alert fires here?", options: ["Major interaction — Bactrim raises warfarin's effect / bleeding risk", "Therapeutic duplication", "Drug-allergy", "No interaction"], answer: 0, explain: "Sulfamethoxazole/trimethoprim significantly potentiates warfarin, raising INR and bleeding risk — a classic, dangerous interaction." },
      { prompt: "Best action?", options: ["Contact the prescriber — flag the interaction and need for closer INR monitoring or an alternative", "Reject outright", "Fill silently"], answer: 0, explain: "It can sometimes be used with close monitoring, so contact the prescriber rather than simply rejecting; document and arrange INR follow-up." },
      { prompt: "Counseling to reinforce:", options: ["Watch for unusual bleeding/bruising and get the INR checked", "Double the warfarin to compensate", "Stop the antibiotic if any bruising"], answer: 0, explain: "Counsel on bleeding signs and prompt INR monitoring during and after the course." },
    ],
  },
  {
    level: 2,
    rx: { prescriber: "Dr. P. Rhodes, MD", patient: "C. Mendez", age: "58 y/o", drug: "Nitroglycerin SL 0.4 mg", sig: "1 tab SL q5min PRN chest pain (max 3)", qty: "#25", refills: "1", daw: "DAW 1" },
    profile: { allergies: ["No known drug allergies"], meds: ["Sildenafil 50 mg PRN", "Atorvastatin 40 mg daily"], conditions: ["Stable angina", "Erectile dysfunction"] },
    steps: [
      { prompt: "What's the safety alert?", options: ["Contraindicated combination — nitrates + a PDE5 inhibitor (sildenafil) can cause fatal hypotension", "Therapeutic duplication", "Allergy conflict", "No alert"], answer: 0, explain: "Nitrates with PDE5 inhibitors cause profound, potentially fatal hypotension — a true contraindication." },
      { prompt: "What do you do?", options: ["Contact the prescriber and counsel: do not take nitro within 24 h of sildenafil (48 h for tadalafil)", "Fill without comment", "Reject and send them away"], answer: 0, explain: "This needs prescriber awareness and clear patient counseling about timing/risk — not a silent fill." },
    ],
  },
  {
    level: 3,
    rx: { prescriber: "Dr. N. Cole, MD", patient: "H. Park", age: "66 y/o", drug: "Clarithromycin 500 mg tablet", sig: "1 tab PO twice daily × 7 days", qty: "#14", refills: "0", daw: "DAW 0" },
    profile: { allergies: ["No known drug allergies"], meds: ["Simvastatin 40 mg at bedtime"], conditions: ["Bronchitis", "High cholesterol"] },
    steps: [
      { prompt: "Identify the interaction.", options: ["Clarithromycin (CYP3A4 inhibitor) raises simvastatin levels → myopathy/rhabdomyolysis", "Reduced antibiotic effect", "Allergy conflict", "No interaction"], answer: 0, explain: "Strong CYP3A4 inhibitors like clarithromycin dramatically raise simvastatin exposure, risking rhabdomyolysis." },
      { prompt: "Appropriate action?", options: ["Contact the prescriber — hold the statin during the course or choose a non-interacting antibiotic", "Fill both as written", "Reject the antibiotic permanently"], answer: 0, explain: "Common fixes: pause simvastatin for the short course, or switch the antibiotic (e.g., azithromycin has less interaction). Clarify with the prescriber." },
    ],
  },
  {
    level: 3,
    rx: { prescriber: "Dr. B. Tran, MD", patient: "E. Daniels", age: "70 y/o", drug: "Lisinopril 20 mg tablet", sig: "1 tab PO once daily", qty: "#30", refills: "5", daw: "DAW 0" },
    profile: { allergies: ["No known drug allergies"], meds: ["Losartan 50 mg daily (Dr. A. Singh)"], conditions: ["Hypertension"] },
    steps: [
      { prompt: "Two prescribers, overlapping therapy. What's the alert?", options: ["Therapeutic duplication — ACE inhibitor + ARB (not recommended together)", "Drug-allergy", "Dose too low", "No alert"], answer: 0, explain: "Combining an ACE inhibitor and an ARB is generally avoided — added hyperkalemia and kidney-injury risk without clear benefit." },
      { prompt: "Your move?", options: ["Contact the prescriber(s) to clarify which agent the patient should be on", "Fill both — more blood pressure control is better", "Reject without contact"], answer: 0, explain: "Reconcile across prescribers and clarify intent — the patient likely should be on one, not both." },
    ],
  },
  {
    level: 3,
    rx: { prescriber: "Dr. L. Greer, MD", patient: "M. Sato", age: "49 y/o", drug: "Methotrexate 2.5 mg tablet", sig: "1 tab PO DAILY", qty: "#30", refills: "2", daw: "DAW 0" },
    profile: { allergies: ["No known drug allergies"], meds: ["Folic acid 1 mg daily"], conditions: ["Rheumatoid arthritis"] },
    steps: [
      { prompt: "Check the sig against the diagnosis. What's wrong?", options: ["Frequency error — RA methotrexate is dosed WEEKLY, not daily", "Dose too low", "Wrong route", "No issue"], answer: 0, explain: "Oral methotrexate for RA is once-WEEKLY. Daily dosing is a well-known fatal error pattern." },
      { prompt: "Action?", options: ["Hold and contact the prescriber to confirm weekly dosing — do not fill as written", "Fill it; the doctor wrote daily", "Change it to weekly yourself and fill"], answer: 0, explain: "Never fill the daily dose, and don't unilaterally rewrite it — clarify and document with the prescriber." },
    ],
  },
  {
    level: 3,
    rx: { prescriber: "Dr. F. Quinn, MD", patient: "D. Abrams", age: "68 y/o", drug: "Spironolactone 25 mg tablet", sig: "1 tab PO once daily", qty: "#30", refills: "3", daw: "DAW 0" },
    profile: { allergies: ["No known drug allergies"], meds: ["Lisinopril 20 mg daily", "Potassium chloride 20 mEq daily"], conditions: ["Heart failure"] },
    steps: [
      { prompt: "What's stacking up here?", options: ["Hyperkalemia risk — spironolactone + ACE inhibitor + potassium supplement", "Hypokalemia risk", "Allergy conflict", "No alert"], answer: 0, explain: "Three potassium-raising influences together substantially increase hyperkalemia risk; monitor potassium and renal function." },
      { prompt: "Best action?", options: ["Contact the prescriber — likely stop or reduce the potassium supplement and monitor labs", "Fill all three as is", "Reject the spironolactone"], answer: 0, explain: "Often the KCl is no longer needed once spironolactone starts; clarify and arrange potassium monitoring." },
    ],
  },
  {
    level: 3,
    rx: { prescriber: "Dr. A. Voss, MD", patient: "J. Iverson", age: "63 y/o", drug: "Omeprazole 20 mg capsule", sig: "1 cap PO once daily before breakfast", qty: "#30", refills: "2", daw: "DAW 0" },
    profile: { allergies: ["No known drug allergies"], meds: ["Clopidogrel 75 mg daily (post-stent)", "Aspirin 81 mg daily"], conditions: ["Coronary artery disease", "GERD"] },
    steps: [
      { prompt: "Which interaction applies?", options: ["Omeprazole inhibits CYP2C19, reducing clopidogrel activation/effectiveness", "Omeprazole increases bleeding directly", "No interaction", "Allergy conflict"], answer: 0, explain: "Omeprazole/esomeprazole blunt clopidogrel's activation, potentially reducing its antiplatelet protection." },
      { prompt: "What do you recommend?", options: ["Contact the prescriber — suggest pantoprazole or famotidine instead", "Fill omeprazole as written", "Stop the clopidogrel"], answer: 0, explain: "Pantoprazole (or an H2 blocker like famotidine) avoids the CYP2C19 interaction — a simple, safer swap." },
    ],
  },
  {
    level: 4,
    rx: { prescriber: "Dr. R. Hahn, MD", patient: "S. Coyle", age: "44 y/o", drug: "Oxycodone 10 mg tablet", sig: "1 tab PO q6h PRN pain", qty: "#120", refills: "0 (C-II)", daw: "DAW 1" },
    profile: { allergies: ["No known drug allergies"], meds: ["Last oxycodone #120 filled 12 days ago (30-day supply)"], conditions: ["Chronic back pain"] },
    steps: [
      { prompt: "Check the fill history. What's the issue?", options: ["Refill too soon — a Schedule II opioid being requested ~18 days early", "Dose too low", "Allergy conflict", "No issue"], answer: 0, explain: "A 30-day supply filled 12 days ago should not run out for ~18 more days. Early controlled-substance fills are a major red flag." },
      { prompt: "Appropriate action?", options: ["Do not fill early — hold per law/policy and contact the prescriber if there's a documented reason", "Fill it to keep the patient happy", "Fill a partial without authorization"], answer: 0, explain: "C-II early fills aren't permitted without a legitimate, documented reason. Verify with the prescriber; follow state law and pharmacy policy — don't cave to pressure." },
    ],
  },
  {
    level: 4,
    rx: { prescriber: "Dr. T. Bishop, MD", patient: "A. Romero", age: "29 y/o", drug: "Lisinopril 10 mg tablet", sig: "1 tab PO once daily", qty: "#30", refills: "5", daw: "DAW 0" },
    profile: { allergies: ["No known drug allergies"], meds: ["Prenatal vitamin daily"], conditions: ["Pregnancy — 2nd trimester", "Gestational hypertension"] },
    steps: [
      { prompt: "What's the critical alert?", options: ["Drug-disease/pregnancy contraindication — ACE inhibitors cause fetal harm", "Dose too low", "Allergy conflict", "No alert"], answer: 0, explain: "ACE inhibitors (and ARBs) are contraindicated in pregnancy — they cause fetal renal damage and other harm, especially in the 2nd/3rd trimesters." },
      { prompt: "Your action?", options: ["Hold and contact the prescriber to switch to a pregnancy-appropriate agent (e.g., labetalol, methyldopa)", "Fill it — blood pressure control matters", "Halve the dose and fill"], answer: 0, explain: "Contact the prescriber for a pregnancy-safe alternative; do not dispense the ACE inhibitor." },
    ],
  },
  {
    level: 4,
    rx: { prescriber: "Dr. C. Espino, MD", patient: "Baby Nolan", age: "10 mo · 12 kg", drug: "Amoxicillin 250 mg/5 mL suspension", sig: "500 mg (10 mL) PO three times daily", qty: "300 mL", refills: "0", daw: "DAW 0" },
    profile: { allergies: ["No known drug allergies"], meds: ["None"], conditions: ["Acute otitis media"] },
    steps: [
      { prompt: "Do the weight-based math. 500 mg TID for a 12 kg child is…", options: ["≈125 mg/kg/day — above the usual high-dose ceiling (~80–90 mg/kg/day)", "≈45 mg/kg/day — standard", "Exactly 90 mg/kg/day", "Too low to treat"], answer: 0, explain: "1500 mg/day ÷ 12 kg ≈ 125 mg/kg/day, well above the ~80–90 mg/kg/day high-dose target for otitis media." },
      { prompt: "Best action?", options: ["Contact the prescriber to verify/adjust the dose for weight", "Fill as written", "Reduce it yourself to 250 mg and fill"], answer: 0, explain: "A dose that high for weight should be verified with the prescriber before dispensing; don't guess at a correction." },
    ],
  },
  {
    level: 4,
    rx: { prescriber: "Dr. W. Hale, MD", patient: "P. Knox", age: "37 y/o", drug: "Sumatriptan 50 mg tablet", sig: "1 tab PO at migraine onset, may repeat once after 2 h", qty: "#9", refills: "2", daw: "DAW 0" },
    profile: { allergies: ["No known drug allergies"], meds: ["Sertraline 100 mg daily"], conditions: ["Migraine", "Depression"] },
    steps: [
      { prompt: "A triptan with an SSRI. The most accurate read is:", options: ["A flagged serotonergic interaction that is usually manageable with counseling/monitoring", "An absolute contraindication — reject", "No interaction whatsoever", "A drug-allergy conflict"], answer: 0, explain: "Triptan + SSRI gets flagged for serotonin syndrome, but the real-world risk is low; it's generally usable with counseling rather than an automatic rejection — a good lesson in not over-rejecting." },
      { prompt: "Reasonable action here?", options: ["Verify and fill, and counsel on serotonin-syndrome warning signs", "Reject because of the interaction", "Tell them to stop the sertraline"], answer: 0, explain: "Fill with counseling: describe serotonin-syndrome symptoms (agitation, rapid heartbeat, sweating, tremor) and when to seek care. Don't reflexively reject a manageable interaction." },
    ],
  },
];

/* ---------- Mode 5: Rx Verification ---------- */
function VerifyMode({ level, onFinish, onQuit }) {
  const [cases] = useState(() => shuffle(VERIFY.filter((c) => c.level <= level)).slice(0, 6));
  const [ci, setCi] = useState(0);
  const [si, setSi] = useState(0);
  const [selected, setSelected] = useState(null);
  const [locked, setLocked] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);

  const c = cases[ci];
  if (!c) return <Empty onQuit={onQuit} />;
  const step = c.steps[si];
  const totalSteps = cases.reduce((n, x) => n + x.steps.length, 0);
  const doneSteps = cases.slice(0, ci).reduce((n, x) => n + x.steps.length, 0) + si;
  const hasAllergy = c.profile.allergies.some((a) => /[A-Z]{3,}/.test(a)); // ALL-CAPS = real allergy

  function answer(i) {
    if (locked) return;
    setSelected(i); setLocked(true); setTotal((t) => t + 1);
    if (i === step.answer) setCorrect((x) => x + 1);
  }
  function next() {
    if (si + 1 < c.steps.length) { setSi(si + 1); setSelected(null); setLocked(false); return; }
    if (ci + 1 < cases.length) { setCi(ci + 1); setSi(0); setSelected(null); setLocked(false); return; }
    onFinish({ mode: 5, correct, total, reviewed: cases.length });
  }

  return (
    <div className="rise">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span className="mono" style={{ fontSize: 12, color: C.muted }}>Verification {ci + 1} of {cases.length}</span>
        <span className="mono" style={{ fontSize: 12, color: C.pine, fontWeight: 600 }}>{correct}/{total} correct</span>
      </div>
      <ProgressBar value={(doneSteps / totalSteps) * 100} />

      {/* Rx label */}
      <div className="rx-card" style={{ padding: 0, marginTop: 16, overflow: "hidden" }}>
        <div style={{ background: C.pine, color: C.paper, padding: "10px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="display" style={{ fontWeight: 900, fontSize: 19 }}>℞ Incoming Prescription</span>
          <span className="mono" style={{ fontSize: 11, opacity: 0.85 }}>{c.rx.daw}</span>
        </div>
        <div style={{ padding: "14px 18px", fontFamily: "'Spline Sans Mono', monospace", fontSize: 13, lineHeight: 1.6 }}>
          <div style={{ color: C.muted }}>{c.rx.patient} · {c.rx.age}</div>
          <div style={{ color: C.muted, marginBottom: 6 }}>{c.rx.prescriber}</div>
          <div style={{ fontSize: 15.5, fontWeight: 600, color: C.ink }}>{c.rx.drug}</div>
          <div style={{ color: C.pineSoft, fontWeight: 600 }}>Sig: {c.rx.sig}</div>
          <div style={{ color: C.muted }}>Disp: {c.rx.qty} · Refills: {c.rx.refills}</div>
        </div>
      </div>

      {/* Patient profile */}
      <div className="rx-card" style={{ padding: "14px 18px", marginTop: 10 }}>
        <div className="mono" style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: C.amber, marginBottom: 8 }}>Patient Profile</div>
        <ProfileRow label="Allergies" items={c.profile.allergies} danger={hasAllergy} />
        <ProfileRow label="Current meds" items={c.profile.meds} />
        <ProfileRow label="Conditions" items={c.profile.conditions} />
      </div>

      {/* step */}
      <div className="rx-card pop" key={`${ci}-${si}`} style={{ padding: 20, marginTop: 12 }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: C.amber, marginBottom: 8 }}>
          Step {si + 1} of {c.steps.length}
        </div>
        <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 16px", lineHeight: 1.35 }}>{step.prompt}</h3>
        <Options options={step.options} answer={step.answer} selected={selected} onSelect={answer} locked={locked} />
        {locked && <Explain correct={selected === step.answer} text={step.explain} />}
      </div>

      {locked && (
        <button onClick={next} style={btn(C.pine, C.paper, { width: "100%", marginTop: 14 })}>
          {ci + 1 >= cases.length && si + 1 >= c.steps.length ? "Finish shift" :
            si + 1 >= c.steps.length ? "Next prescription →" : "Next step →"}
        </button>
      )}
    </div>
  );
}
function ProfileRow({ label, items, danger }) {
  return (
    <div style={{ display: "flex", gap: 10, paddingTop: 6 }}>
      <span className="mono" style={{ minWidth: 92, fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase", color: C.muted, paddingTop: 2 }}>{label}</span>
      <span style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {items.map((it, i) => (
          <span key={i} style={{
            fontSize: 13, padding: "3px 9px", borderRadius: 20,
            background: danger ? "rgba(178,58,36,0.12)" : "rgba(31,74,63,0.06)",
            border: `1px solid ${danger ? C.clay : C.line}`,
            color: danger ? C.clay : C.ink, fontWeight: danger ? 600 : 400,
          }}>{it}</span>
        ))}
      </span>
    </div>
  );
}

/* ============================================================
   SCRIPT LAB  (Mode 6) — build the sig from the prescriber's intent
   Each row's option fragments concatenate into a grammatical label.
   ============================================================ */
const BUILDER = [
  {
    level: 1, drug: "Lisinopril 10 mg tablet",
    goal: "The prescriber wants one tablet by mouth every morning for blood pressure.",
    rows: [
      { label: "Action", options: ["Take", "Apply", "Instill", "Inhale"], answer: 0 },
      { label: "Amount", options: ["1", "2", "1–2", "½"], answer: 0 },
      { label: "Form", options: ["tablet", "capsule", "drop", "puff"], answer: 0 },
      { label: "Route", options: ["by mouth", "under the tongue", "topically", "in each eye"], answer: 0 },
      { label: "Frequency", options: ["every morning", "at bedtime", "twice daily", "as needed"], answer: 0 },
    ],
    note: "Once-daily blood-pressure meds are commonly taken in the morning. Plain, unambiguous wording beats shorthand on the patient label.",
  },
  {
    level: 1, drug: "Amoxicillin 250 mg/5 mL suspension",
    goal: "Give one teaspoonful by mouth three times a day for 10 days.",
    rows: [
      { label: "Action", options: ["Take", "Apply", "Instill"], answer: 0 },
      { label: "Amount", options: ["5 mL (1 teaspoonful)", "15 mL (1 tablespoonful)", "1 mL", "2.5 mL"], answer: 0 },
      { label: "Route", options: ["by mouth", "rectally", "topically"], answer: 0 },
      { label: "Frequency", options: ["three times daily", "twice daily", "four times daily", "once daily"], answer: 0 },
      { label: "Duration", options: ["for 10 days", "for 3 days", "for 30 days"], answer: 0 },
    ],
    note: "1 teaspoonful = 5 mL — always express liquid doses in mL to prevent dosing errors. Counsel to finish the full course.",
  },
  {
    level: 2, drug: "Latanoprost 0.005% ophthalmic",
    goal: "Instill one drop into both eyes at bedtime.",
    rows: [
      { label: "Action", options: ["Instill", "Take", "Apply", "Inhale"], answer: 0 },
      { label: "Amount", options: ["1 drop", "2 drops", "1 mL"], answer: 0 },
      { label: "Route", options: ["in each eye", "in the right eye", "in each ear"], answer: 0 },
      { label: "Frequency", options: ["at bedtime", "every morning", "every hour"], answer: 0 },
    ],
    note: "OU = both eyes (OD right, OS left). Many glaucoma drops are dosed in the evening; counsel to wait ~5 min between different eye drops.",
  },
  {
    level: 2, drug: "Albuterol HFA inhaler",
    goal: "Two puffs inhaled by mouth every 4 to 6 hours as needed for wheezing.",
    rows: [
      { label: "Action", options: ["Inhale", "Take", "Instill"], answer: 0 },
      { label: "Amount", options: ["2 puffs", "1 puff", "2 tablets"], answer: 0 },
      { label: "Route", options: ["by mouth", "through the nose", "under the tongue"], answer: 0 },
      { label: "Frequency", options: ["every 4–6 hours as needed", "once daily", "twice daily"], answer: 0 },
      { label: "Reason", options: ["for shortness of breath or wheezing", "for pain", "for sleep"], answer: 0 },
    ],
    note: "This is a rescue inhaler. If a patient needs it more than twice a week, their asthma may be poorly controlled — flag it.",
  },
  {
    level: 2, drug: "Ibuprofen 400 mg tablet",
    goal: "One tablet by mouth every 6 hours as needed for pain, taken with food.",
    rows: [
      { label: "Action", options: ["Take", "Apply", "Inhale"], answer: 0 },
      { label: "Amount", options: ["1", "3", "2–4"], answer: 0 },
      { label: "Form", options: ["tablet", "capsule", "drop"], answer: 0 },
      { label: "Route", options: ["by mouth", "rectally", "topically"], answer: 0 },
      { label: "Frequency", options: ["every 6 hours as needed", "every hour", "once weekly"], answer: 0 },
      { label: "Instruction", options: ["with food", "on an empty stomach", "at bedtime only"], answer: 0 },
    ],
    note: "NSAIDs are easier on the stomach with food. Note the indication ('for pain') so the patient knows it's PRN, not scheduled.",
  },
  {
    level: 3, drug: "Nitroglycerin 0.4 mg sublingual",
    goal: "Place one tablet under the tongue every 5 minutes as needed for chest pain — and add the safety instruction.",
    rows: [
      { label: "Action", options: ["Place / dissolve", "Swallow", "Chew"], answer: 0 },
      { label: "Amount", options: ["1 tablet", "3 tablets", "1 teaspoonful"], answer: 0 },
      { label: "Route", options: ["under the tongue", "by mouth with water", "in each cheek"], answer: 0 },
      { label: "Frequency", options: ["every 5 minutes as needed for chest pain", "three times daily", "once at bedtime"], answer: 0 },
      { label: "Safety", options: ["max 3 doses — call 911 if pain persists after the first", "no limit", "may repeat hourly"], answer: 0 },
    ],
    note: "Sit down, one under the tongue, may repeat every 5 min up to 3 — but call 911 if chest pain isn't relieved after the first dose. Store in the original glass bottle.",
  },
  {
    level: 3, drug: "Insulin glargine (Lantus)",
    goal: "Inject 20 units subcutaneously once daily at bedtime.",
    rows: [
      { label: "Action", options: ["Inject", "Take", "Inhale"], answer: 0 },
      { label: "Amount", options: ["20 units", "20 mL", "2 units"], answer: 0 },
      { label: "Route", options: ["subcutaneously", "intravenously", "by mouth"], answer: 0 },
      { label: "Frequency", options: ["once daily at bedtime", "three times daily", "with each meal"], answer: 0 },
    ],
    note: "Basal insulin is dosed in units (never mL/'cc'), given subcutaneously once daily; counsel to rotate injection sites and not mix with other insulins.",
  },
  {
    level: 3, drug: "Alendronate 70 mg tablet",
    goal: "One tablet by mouth once weekly, first thing in the morning — and the critical administration instruction.",
    rows: [
      { label: "Action", options: ["Take", "Apply", "Dissolve"], answer: 0 },
      { label: "Amount", options: ["1", "7", "2"], answer: 0 },
      { label: "Form", options: ["tablet", "capsule", "drop"], answer: 0 },
      { label: "Route", options: ["by mouth", "under the tongue", "topically"], answer: 0 },
      { label: "Frequency", options: ["once weekly in the morning", "once daily", "three times daily"], answer: 0 },
      { label: "Instruction", options: ["with a full glass of water; stay upright 30 minutes", "with milk at bedtime", "with food"], answer: 0 },
    ],
    note: "Bisphosphonates: take on an empty stomach with 6–8 oz plain water and remain upright ≥30 minutes to prevent esophageal irritation.",
  },
  {
    level: 4, drug: "Methotrexate 2.5 mg tablet (rheumatoid arthritis)",
    goal: "Six tablets by mouth ONCE WEEKLY (every Monday) — the dosing that prevents a fatal error.",
    rows: [
      { label: "Action", options: ["Take", "Apply", "Inject"], answer: 0 },
      { label: "Amount", options: ["6", "1", "2"], answer: 0 },
      { label: "Form", options: ["tablets", "capsules", "drops"], answer: 0 },
      { label: "Route", options: ["by mouth", "subcutaneously", "topically"], answer: 0 },
      { label: "Frequency", options: ["once weekly (every Monday)", "once daily", "twice daily"], answer: 0 },
    ],
    note: "Oral methotrexate for RA is WEEKLY. Specifying the day ('every Monday') reinforces it. Daily dosing is a classic fatal error.",
  },
  {
    level: 4, drug: "Amoxicillin 400 mg/5 mL suspension (pediatric)",
    goal: "Give 7 mL by mouth twice daily for 10 days.",
    rows: [
      { label: "Action", options: ["Take", "Apply", "Instill"], answer: 0 },
      { label: "Amount", options: ["7 mL", "1 teaspoonful (5 mL)", "1 tablet"], answer: 0 },
      { label: "Route", options: ["by mouth", "rectally", "topically"], answer: 0 },
      { label: "Frequency", options: ["twice daily", "three times daily", "once weekly"], answer: 0 },
      { label: "Duration", options: ["for 10 days", "for 1 day", "as needed"], answer: 0 },
    ],
    note: "Odd volumes like 7 mL should be expressed exactly in mL (not rounded to a teaspoon). Provide an oral syringe and confirm the dose matches the weight-based calculation.",
  },
];

/* ---------- Mode 6: Script Lab (tap-to-build OR free-type) ---------- */
/* Free-type checker: normalize the typed sig (expand common abbreviations),
   then confirm each required concept appears via a synonym table. */
const SIG_ABBR = [
  [/\bpo\b/g, "by mouth"], [/\bp\.o\.\b/g, "by mouth"],
  [/\bbid\b/g, "twice daily"], [/\btid\b/g, "three times daily"], [/\bqid\b/g, "four times daily"],
  [/\bqhs\b/g, "bedtime"], [/\bhs\b/g, "bedtime"], [/\bqd\b/g, "once daily"], [/\bqam\b/g, "every morning"],
  [/\bprn\b/g, "as needed"], [/\bsl\b/g, "under the tongue"], [/\bou\b/g, "both eyes"],
  [/\bsc\b/g, "subcutaneous"], [/\bsq\b/g, "subcutaneous"], [/\bsubq\b/g, "subcutaneous"], [/\bsubcut\b/g, "subcutaneous"],
  [/\btabs?\b/g, "tablet"], [/\bcaps?\b/g, "capsule"], [/\bgtts?\b/g, "drop"],
  [/\btsp\b/g, "teaspoon"], [/\btbsp\b/g, "tablespoon"], [/\bml\b/g, "ml"],
  [/\bq(\d+)h\b/g, "every $1 hours"], [/\bunits?\b/g, "unit"], [/\bx\s*(\d+)\s*d(ays?)?\b/g, "for $1 days"],
];
function normSig(s) {
  let t = " " + s.toLowerCase().replace(/[.,;()/]/g, " ").replace(/\s+/g, " ") + " ";
  SIG_ABBR.forEach(([re, rep]) => { t = t.replace(re, rep); });
  return t.replace(/\s+/g, " ");
}
// acceptance tokens (already in normalized/expanded form) keyed by the correct fragment
const SIG_SYN = {
  "take": ["take", "give"], "instill": ["instill", "place", "put"], "inhale": ["inhale", "puff"],
  "inject": ["inject"], "place / dissolve": ["place", "dissolve", "put", "under the tongue"],
  "1": ["1", "one"], "2": ["2", "two"], "6": ["6", "six"],
  "2 puffs": ["2 puff", "two puff"], "1 drop": ["1 drop", "one drop"], "1 tablet": ["1 tablet", "one tablet"],
  "7 ml": ["7 ml"], "5 ml (1 teaspoonful)": ["5 ml", "teaspoon"], "20 units": ["20 unit"],
  "tablet": ["tablet"], "tablets": ["tablet"], "capsule": ["capsule"],
  "by mouth": ["by mouth", "orally", "oral"], "under the tongue": ["under the tongue", "sublingual"],
  "in each eye": ["each eye", "both eyes"], "subcutaneously": ["subcutaneous", "under the skin"],
  "every morning": ["every morning", "morning", "once daily", "once a day"],
  "at bedtime": ["bedtime", "night"],
  "three times daily": ["three times", "3 times"], "twice daily": ["twice", "two times", "2 times"],
  "every 4–6 hours as needed": ["every 4", "4 to 6", "4-6", "every 6"],
  "every 6 hours as needed": ["every 6", "6 hour"],
  "every 5 minutes as needed for chest pain": ["every 5", "5 minute", "5 min"],
  "once daily at bedtime": ["bedtime", "once daily", "once a day", "night"],
  "once weekly in the morning": ["weekly", "once a week", "every week"],
  "once weekly (every monday)": ["weekly", "monday", "once a week"],
  "for 10 days": ["10 day", "ten day"],
  "with food": ["with food", "with meals", "with a meal", "after eating"],
  "for shortness of breath or wheezing": ["shortness", "wheez", "breath", "sob"],
  "with a full glass of water; stay upright 30 minutes": ["upright", "glass of water", "30 min", "stay up"],
  "max 3 doses — call 911 if pain persists after the first": ["911", "3 dose", "three dose", "emergency"],
};
function conceptOK(fragment, normalizedTyped) {
  const key = fragment.toLowerCase();
  const tokens = SIG_SYN[key] || [key];
  return tokens.some((tok) => normalizedTyped.includes(tok));
}

function ScriptLab({ level, onFinish, onQuit }) {
  const [format, setFormat] = useState("type"); // 'type' | 'build'
  const [cases] = useState(() => shuffle(BUILDER.filter((c) => c.level <= level)).slice(0, 6));
  const [ci, setCi] = useState(0);
  const [picks, setPicks] = useState({});
  const [typed, setTyped] = useState("");
  const [locked, setLocked] = useState(false);
  const [correctScripts, setCorrectScripts] = useState(0);

  if (!cases.length) return <Empty onQuit={onQuit} />;
  const c = cases[ci];
  const correctSig = c.rows.map((r) => r.options[r.answer]).join(" ") + ".";
  const allPicked = c.rows.every((_, i) => picks[i] != null);

  // grading
  const normalized = normSig(typed);
  const rowSatisfied = (ri) => format === "build"
    ? picks[ri] === c.rows[ri].answer
    : conceptOK(c.rows[ri].options[c.rows[ri].answer], normalized);
  const allRight = locked && c.rows.every((_, i) => rowSatisfied(i));

  function pick(ri, oi) { if (locked) return; setPicks((p) => ({ ...p, [ri]: oi })); }
  function submit() {
    if (locked) return;
    if (format === "build" && !allPicked) return;
    if (format === "type" && typed.trim().length < 4) return;
    setLocked(true);
    if (c.rows.every((_, i) => rowSatisfied(i))) setCorrectScripts((x) => x + 1);
  }
  function next() {
    if (ci + 1 >= cases.length) {
      onFinish({ mode: 6, correct: correctScripts, total: cases.length, scripts: cases.length });
      return;
    }
    setCi(ci + 1); setPicks({}); setTyped(""); setLocked(false);
  }

  const buildPreview = c.rows.map((r, i) => (picks[i] != null ? r.options[picks[i]] : "▢")).join(" ");

  return (
    <div className="rise">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span className="mono" style={{ fontSize: 12, color: C.muted }}>Script {ci + 1} of {cases.length}</span>
        <span className="mono" style={{ fontSize: 12, color: C.pine, fontWeight: 600 }}>{correctScripts} clean</span>
      </div>
      <ProgressBar value={(ci / cases.length) * 100} />

      {/* format toggle */}
      <div style={{ display: "flex", gap: 6, marginTop: 14, background: C.paper2, padding: 4, borderRadius: 12 }}>
        {[["type", "✎ Type it"], ["build", "▢ Tap to build"]].map(([f, lbl]) => (
          <button key={f} disabled={locked} onClick={() => setFormat(f)}
            style={{ flex: 1, padding: "9px 0", borderRadius: 9, border: "none", cursor: locked ? "default" : "pointer",
              fontWeight: 600, fontSize: 13.5, fontFamily: "'Spline Sans', sans-serif",
              background: format === f ? C.card : "transparent", color: format === f ? C.pine : C.muted,
              boxShadow: format === f ? "0 2px 8px -4px rgba(31,74,63,0.5)" : "none" }}>
            {lbl}
          </button>
        ))}
      </div>

      <div className="rx-card" style={{ padding: "16px 18px", marginTop: 12 }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: C.amber, marginBottom: 6 }}>{c.drug}</div>
        <p style={{ margin: 0, fontSize: 16, fontWeight: 500, lineHeight: 1.45 }}>{c.goal}</p>
      </div>

      {/* TYPE MODE */}
      {format === "type" && (
        <>
          <textarea value={typed} onChange={(e) => setTyped(e.target.value)} disabled={locked}
            placeholder="Type the patient label directions… (e.g. Take 1 tablet by mouth every morning)"
            rows={3}
            style={{ width: "100%", marginTop: 12, padding: "13px 15px", borderRadius: 13, fontSize: 15,
              border: `1.5px solid ${C.line}`, background: C.card, color: C.ink, resize: "vertical",
              fontFamily: "'Spline Sans Mono', monospace", outline: "none", lineHeight: 1.5 }} />
          <div className="mono" style={{ fontSize: 11, color: C.muted, margin: "6px 2px 0" }}>
            Abbreviations are fine — "1 tab PO qAM" reads the same as "1 tablet by mouth every morning."
          </div>
          {locked && (
            <div className="rx-card pop" style={{ padding: 16, marginTop: 12 }}>
              <div className="mono" style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: C.muted, marginBottom: 8 }}>Concept check</div>
              <div style={{ display: "grid", gap: 7 }}>
                {c.rows.map((r, i) => {
                  const ok = rowSatisfied(i);
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 14 }}>
                      <span style={{ color: ok ? C.green : C.clay, fontWeight: 700 }}>{ok ? "✓" : "✕"}</span>
                      <span style={{ minWidth: 78, color: C.muted, fontSize: 12.5 }}>{r.label}</span>
                      <span style={{ color: ok ? C.ink : C.clay }}>{r.options[r.answer]}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* BUILD MODE */}
      {format === "build" && (
        <>
          <div className="rx-card" style={{ padding: "12px 16px", marginTop: 12, background: C.pine }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: C.amberSoft, marginBottom: 4 }}>Label preview</div>
            <div className="mono" style={{ fontSize: 14.5, color: C.paper, lineHeight: 1.5 }}>{buildPreview}.</div>
          </div>
          <div className="rx-card pop" key={ci} style={{ padding: 18, marginTop: 12 }}>
            {c.rows.map((r, ri) => (
              <div key={ri} style={{ marginBottom: ri === c.rows.length - 1 ? 0 : 16 }}>
                <div className="mono" style={{ fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase", color: C.muted, marginBottom: 7 }}>{r.label}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {r.options.map((opt, oi) => {
                    const chosen = picks[ri] === oi;
                    let bg = "transparent", border = C.line, color = C.ink;
                    if (chosen && !locked) { bg = C.pine; border = C.pine; color = C.paper; }
                    if (locked) {
                      if (oi === r.answer) { bg = "rgba(46,139,87,0.16)"; border = C.green; }
                      else if (chosen) { bg = "rgba(178,58,36,0.12)"; border = C.clay; }
                    }
                    return (
                      <button key={oi} className="opt" disabled={locked} onClick={() => pick(ri, oi)}
                        style={{ background: bg, border: `1.5px solid ${border}`, color, borderRadius: 22,
                          padding: "8px 14px", cursor: locked ? "default" : "pointer", fontSize: 14, fontWeight: 600 }}>
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {locked && (
        <div className="pop rx-card" style={{ padding: "14px 16px", marginTop: 12,
          background: allRight ? "rgba(46,139,87,0.10)" : "rgba(192,120,30,0.10)",
          border: `1px solid ${allRight ? C.green : C.amber}` }}>
          <div style={{ fontWeight: 700, color: allRight ? C.green : C.amber, fontSize: 14, marginBottom: 6 }}>
            {allRight ? "✓ Clean script" : "Here's the standard label"}
          </div>
          <div className="mono" style={{ fontSize: 14, marginBottom: 8 }}>{correctSig}</div>
          <div style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.5 }}>{c.note}</div>
        </div>
      )}

      {!locked ? (
        <button onClick={submit}
          disabled={format === "build" ? !allPicked : typed.trim().length < 4}
          style={btn(C.pine, C.paper, { width: "100%", marginTop: 14,
            opacity: (format === "build" ? allPicked : typed.trim().length >= 4) ? 1 : 0.4 })}>
          Check the script
        </button>
      ) : (
        <button onClick={next} style={btn(C.pine, C.paper, { width: "100%", marginTop: 14 })}>
          {ci + 1 >= cases.length ? "Finish shift" : "Next script →"}
        </button>
      )}
    </div>
  );
}

/* ============================================================
   INSURANCE DESK  (Mode 7) — third-party claim rejections
   Reject codes are real NCPDP telecommunication codes.
   ============================================================ */
const INSURANCE = [
  {
    level: 1, code: "79", reject: "Refill Too Soon",
    claim: { patient: "D. Webb", drug: "Atorvastatin 40 mg #30", plan: "CarePlus Rx", info: "Last fill: 9 days ago (30-day supply)" },
    steps: [
      { prompt: "What is the plan telling you?", options: ["Too much of the supply remains — it's being refilled before the plan allows", "The drug isn't covered", "The patient isn't on file", "Prior authorization is needed"], answer: 0, explain: "Reject 79 means the previous supply isn't used up enough yet (plans typically allow a refill once ~75–85% has elapsed)." },
      { prompt: "Best resolution?", options: ["Tell the patient the date they're eligible; for travel/loss, a vacation or override can be requested from the plan", "Override it at the register", "Resubmit the same claim repeatedly until it pays", "Have the patient pay cash with no other options offered"], answer: 0, explain: "Give the eligible date. Legitimate early needs (vacation supply, lost meds) can sometimes be overridden by the plan — but you don't force it through yourself." },
    ],
  },
  {
    level: 1, code: "07", reject: "M/I Cardholder ID",
    claim: { patient: "L. Frost", drug: "Metformin 500 mg #60", plan: "BlueScript", info: "Member ID entered: keyed at intake" },
    steps: [
      { prompt: "'M/I' means missing or invalid. The likely issue?", options: ["The member ID was mistyped or doesn't match the plan's format", "The drug is non-formulary", "Refill too soon", "Step therapy required"], answer: 0, explain: "Reject 07 = Missing/Invalid Cardholder ID — almost always a data-entry or wrong-card issue, not a clinical one." },
      { prompt: "First thing to do?", options: ["Re-check the insurance card and re-key the ID (and BIN/PCN/group) exactly", "Call the prescriber", "Start a prior authorization", "Tell the patient it's not covered"], answer: 0, explain: "Verify the card details and correct the ID/BIN/PCN/group, then resubmit. Ask for an updated card if needed." },
    ],
  },
  {
    level: 2, code: "75", reject: "Prior Authorization Required",
    claim: { patient: "A. Singh", drug: "Ozempic 1 mg pen", plan: "Optima PBM", info: "Formulary status: PA required" },
    steps: [
      { prompt: "What does reject 75 require before this can be billed?", options: ["The prescriber must get the plan's prior authorization approval", "A second insurance", "A new member ID", "Nothing — just resubmit"], answer: 0, explain: "The plan won't pay until a prior authorization is approved — typically the prescriber documents medical necessity to the PBM." },
      { prompt: "How do you move it forward?", options: ["Notify the prescriber's office to initiate the PA with the plan; tell the patient you'll fill once it's approved", "Approve the PA yourself", "Fill it and bill later", "Reject and tell the patient nothing can be done"], answer: 0, explain: "The pharmacy flags the PA need to the prescriber, who submits it. Offer to notify the patient when it's approved; some plans allow an emergency/bridge supply." },
    ],
  },
  {
    level: 2, code: "70", reject: "Product/Service Not Covered",
    claim: { patient: "M. Cole", drug: "Nexium 40 mg #30", plan: "ValueHealth Rx", info: "Plan/benefit exclusion (non-formulary)" },
    steps: [
      { prompt: "Reject 70 here means…", options: ["The plan doesn't cover this product (non-formulary / excluded)", "Refill too soon", "The prescriber isn't covered", "The quantity is too high"], answer: 0, explain: "Reject 70 = the product isn't a covered benefit on this plan — often because a formulary alternative is preferred." },
      { prompt: "Most efficient resolution?", options: ["Check the formulary for a covered alternative (e.g., omeprazole/pantoprazole) and contact the prescriber to switch — or request a formulary exception", "Bill it as a different drug", "Tell the patient to try again next month", "Override the formulary"], answer: 0, explain: "Identify the preferred covered alternative and get prescriber approval to switch, or pursue a formulary exception/PA if the specific drug is needed." },
    ],
  },
  {
    level: 2, code: "76", reject: "Plan Limitations Exceeded",
    claim: { patient: "R. Nash", drug: "Sumatriptan 100 mg #18", plan: "Meridian PBM", info: "Quantity limit: 9 tablets / 30 days" },
    steps: [
      { prompt: "What kind of limit did this hit?", options: ["A quantity limit — the plan caps how much it covers per period", "An age restriction", "A refill-too-soon block", "An eligibility problem"], answer: 0, explain: "Reject 76 = Plan Limitations Exceeded; here the billed quantity (18) is over the plan's 9-tablet/30-day cap." },
      { prompt: "Resolution options?", options: ["Bill the covered quantity (9), or have the prescriber request a quantity-limit override/PA for the higher amount", "Just resubmit 18 again", "Tell the patient it's not covered at all", "Split into two claims same day"], answer: 0, explain: "Either dispense/bill the allowed quantity, or pursue a quantity-limit exception with prescriber support if more is clinically needed." },
    ],
  },
  {
    level: 2, code: "65", reject: "Patient Is Not Covered",
    claim: { patient: "T. Yates", drug: "Amlodipine 5 mg #30", plan: "UnityCare Rx", info: "Eligibility not found for date of service" },
    steps: [
      { prompt: "Reject 65 suggests…", options: ["The plan has no active coverage on file for this patient on this date", "The drug needs a PA", "Refill too soon", "The dose is wrong"], answer: 0, explain: "Reject 65 = Patient Is Not Covered — eligibility may have lapsed, the plan changed, or the wrong plan/ID is on file." },
      { prompt: "What do you check first?", options: ["Verify eligibility — confirm the ID, look for a newer card or a new plan, and confirm coverage hasn't termed", "Start a prior authorization", "Call the prescriber for a new script", "Change the drug"], answer: 0, explain: "Re-verify the member's eligibility and current plan; coverage often changed at the new year or with a job change. The patient may need to contact their plan/employer." },
    ],
  },
  {
    level: 3, code: "88", reject: "DUR Reject Error",
    claim: { patient: "B. Iqbal", drug: "Fluconazole 150 mg #1", plan: "Optima PBM", info: "DUR: drug-drug interaction with simvastatin on profile" },
    steps: [
      { prompt: "A reject 88 is different from the others because it's…", options: ["A clinical safety alert (here, a drug interaction) the plan wants the pharmacist to review", "A pure billing/eligibility error", "A refill-too-soon block", "A quantity limit"], answer: 0, explain: "Reject 88 = DUR Reject Error — a clinical edit (interaction, duplication, high dose) that requires pharmacist review before it can clear." },
      { prompt: "Appropriate handling?", options: ["Review the interaction clinically; if it's appropriate to proceed, submit the proper DUR codes (reason for service / professional service / result of service) — otherwise contact the prescriber", "Override it without any review", "Always reject the claim and send the patient away", "Ignore the alert and resubmit unchanged"], answer: 0, explain: "DUR rejects are a safety checkpoint. The pharmacist evaluates the conflict and either documents an override with NCPDP DUR codes or intervenes with the prescriber." },
    ],
  },
  {
    level: 3, code: "41", reject: "Submit to Primary Payer",
    claim: { patient: "S. Doyle", drug: "Apixaban 5 mg #60", plan: "SecondaryShield (submitted)", info: "Other coverage indicated — bill primary first" },
    steps: [
      { prompt: "Reject 41 / 'submit to other processor' tells you…", options: ["This plan is secondary — the primary insurance must be billed first", "The patient has no coverage", "The drug isn't covered", "A PA is required"], answer: 0, explain: "The patient has more than one plan (coordination of benefits). The primary payer must process the claim before the secondary." },
      { prompt: "Correct sequence?", options: ["Bill the primary insurance, then submit to the secondary with the primary's payment info (COB)", "Bill the secondary twice", "Pick whichever pays more", "Have the patient pay cash"], answer: 0, explain: "Process the primary first, then coordinate benefits to the secondary using the primary's response — get the primary plan details from the patient if needed." },
    ],
  },
  {
    level: 3, code: "25", reject: "M/I Prescriber ID",
    claim: { patient: "K. Ortega", drug: "Cephalexin 500 mg #28", plan: "BlueScript", info: "Prescriber NPI missing/invalid" },
    steps: [
      { prompt: "What's missing or invalid?", options: ["The prescriber's ID (NPI) on the claim", "The patient's ID", "The days supply", "The drug code"], answer: 0, explain: "Reject 25 = Missing/Invalid Prescriber ID — usually a missing, mistyped, or inactive NPI." },
      { prompt: "Fix?", options: ["Look up / verify the prescriber's correct active NPI and resubmit", "Call the patient", "Start a PA", "Change the medication"], answer: 0, explain: "Confirm the prescriber's valid NPI (NPPES registry or your records), correct it on the claim, and resubmit." },
    ],
  },
  {
    level: 4, code: "60", reject: "Product Not Covered for Patient Age",
    claim: { patient: "Baby Reyes", drug: "Promethazine syrup", plan: "KidsFirst Medicaid", info: "Age edit triggered" },
    steps: [
      { prompt: "Reject 60 fired. What are the two things to consider?", options: ["Either the date of birth on file is wrong, or the drug is genuinely contraindicated/restricted for this age", "Only that the ID is wrong", "Only that it's refill-too-soon", "Only that a PA is needed"], answer: 0, explain: "Reject 60 = Product/Service Not Covered for Patient Age. First rule out a wrong DOB on file; if the age is correct, the drug may be age-restricted for safety." },
      { prompt: "Given promethazine in a very young child, the safest action is…", options: ["Do NOT simply override — promethazine is contraindicated under age 2 (fatal respiratory depression); contact the prescriber", "Override the age edit and dispense", "Halve the dose and dispense", "Tell the family it's a billing glitch"], answer: 0, explain: "Promethazine is contraindicated in children under 2. The age edit is a safety catch — verify the DOB and contact the prescriber rather than forcing it through." },
    ],
  },
  {
    level: 4, code: "75", reject: "Prior Authorization Required (Step Therapy)",
    claim: { patient: "G. Pruitt", drug: "Jardiance 10 mg #30", plan: "Meridian PBM", info: "Step therapy: requires trial of metformin first" },
    steps: [
      { prompt: "This PA reject is specifically a step-therapy edit, meaning…", options: ["The plan wants a preferred first-line drug tried (or documented as failed) before covering this one", "The patient has no coverage", "The quantity is too high", "The prescriber isn't enrolled"], answer: 0, explain: "Step therapy requires stepping through a preferred agent (here metformin) before the plan covers the requested drug, unless an exception is approved." },
      { prompt: "How do you resolve it?", options: ["Contact the prescriber — either switch to the step-1 agent, or document prior trial/failure and request the step-therapy exception/PA", "Override the step-therapy edit yourself", "Tell the patient to switch insurance", "Dispense and bill cash without discussing options"], answer: 0, explain: "Work with the prescriber: use the preferred agent if appropriate, or submit documentation of why it won't work to obtain the exception." },
    ],
  },
  {
    level: 2, code: "22", reject: "M/I Dispense As Written (DAW)",
    claim: { patient: "E. Hollis", drug: "Synthroid 100 mcg #90", plan: "BlueScript", info: "Prescriber noted 'brand medically necessary'; claim sent as DAW 0" },
    steps: [
      { prompt: "Reject 22 points to a problem with which field?", options: ["The Dispense As Written (DAW) / product selection code", "The member ID", "The days supply", "The prescriber NPI"], answer: 0, explain: "Reject 22 = Missing/Invalid DAW/Product Selection Code — the submitted DAW code doesn't fit the situation." },
      { prompt: "The prescriber wrote 'brand medically necessary.' Which DAW code is correct?", options: ["DAW 1 — substitution not allowed by the prescriber", "DAW 0 — no product selection indicated", "DAW 2 — patient requested brand", "DAW 5 — brand dispensed as a generic"], answer: 0, explain: "DAW 0 = no product selection (generic OK); DAW 1 = prescriber requires brand ('dispense as written'); DAW 2 = patient requested brand (patient usually pays the difference). Here the prescriber specified brand, so DAW 1 — correct the code and resubmit." },
    ],
  },
  {
    level: 3, code: "70", reject: "Product/Service Not Covered (compound)",
    claim: { patient: "M. Okeke", drug: "Compounded pain cream (multi-ingredient)", plan: "Meridian PBM", info: "Submitted as a single product" },
    steps: [
      { prompt: "Why do compounds reject when billed like a normal drug?", options: ["Each ingredient must be submitted with its own NDC and a compound code — not as one product", "Compounds are never covered by anyone", "They don't require a prescription", "Only the cheapest ingredient is billed"], answer: 0, explain: "Compounds bill through the multi-ingredient compound segment: every ingredient's NDC and quantity, with the compound code set. Submitting one lumped product rejects." },
      { prompt: "Resubmitted correctly, one ingredient returns 'not covered,' rejecting the whole compound. Best step?", options: ["Contact the prescriber — substitute/remove the non-covered ingredient, have the patient pay for that portion, or pursue an exception", "Bill it as a single covered drug instead", "Tell the patient compounds are never covered", "Override the ingredient yourself"], answer: 0, explain: "A non-covered ingredient can sink the whole claim. Options: reformulate with prescriber input, charge the patient for the excluded ingredient, or request a coverage exception." },
    ],
  },
  {
    level: 2, code: "569", reject: "Provide Notice: Medicare Rx Coverage & Your Rights",
    claim: { patient: "W. Brennan", drug: "Eliquis 5 mg #60", plan: "Medicare Part D (SilverScript)", info: "Not covered at point of sale; outside transition period" },
    steps: [
      { prompt: "Reject 569 is unusual — it isn't a 'fix the claim' error. It tells you to:", options: ["Provide the patient the CMS 'Medicare Prescription Drug Coverage and Your Rights' notice (CMS-10147)", "Re-key the member ID", "Start a refill-too-soon override", "Bill a secondary payer first"], answer: 0, explain: "On a Part D claim that can't be covered at the point of sale, reject 569 requires the pharmacy to give the standardized CMS-10147 notice. At retail it's provided at point of sale; merely posting it on the wall doesn't satisfy the requirement." },
      { prompt: "What does that notice tell the patient they can do?", options: ["Contact their Part D plan to request a coverage determination or exception (and appeal if denied)", "Get the drug for free", "Switch pharmacies to fix it", "Nothing — it's informational only"], answer: 0, explain: "The CMS-10147 notice explains the enrollee's right to ask the plan for a coverage determination/exception and to appeal — the real path to getting the drug covered when it rejects at the counter." },
    ],
  }
];

/* ---------- Mode 7: Insurance Desk ---------- */
function InsuranceDesk({ level, onFinish, onQuit }) {
  const [cases] = useState(() => shuffle(INSURANCE.filter((c) => c.level <= level)).slice(0, 6));
  const [ci, setCi] = useState(0);
  const [si, setSi] = useState(0);
  const [selected, setSelected] = useState(null);
  const [locked, setLocked] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [shift] = useState(() => SHIFT_CONTEXTS[Math.floor(Math.random() * SHIFT_CONTEXTS.length)]);
  const [claimNums] = useState(() => Array.from({ length: 20 }, () => `CLM-${Math.floor(100000 + Math.random() * 899999)}`));

  const c = cases[ci];
  if (!c) return <Empty onQuit={onQuit} />;
  const step = c.steps[si];
  const totalSteps = cases.reduce((n, x) => n + x.steps.length, 0);
  const doneSteps = cases.slice(0, ci).reduce((n, x) => n + x.steps.length, 0) + si;
  const claimResolved = locked && si + 1 >= c.steps.length;

  function answer(i) {
    if (locked) return;
    setSelected(i); setLocked(true); setTotal((t) => t + 1);
    if (i === step.answer) setCorrect((x) => x + 1);
  }
  function next() {
    if (si + 1 < c.steps.length) { setSi(si + 1); setSelected(null); setLocked(false); return; }
    if (ci + 1 < cases.length) { setCi(ci + 1); setSi(0); setSelected(null); setLocked(false); return; }
    onFinish({ mode: 7, correct, total, resolved: cases.length });
  }

  return (
    <div className="rise">
      {/* Shift status bar */}
      <div style={{
        background: "#0B1F3A", color: "#7EB8C9", borderRadius: 10,
        padding: "7px 13px", marginBottom: 10,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        fontFamily: "'Spline Sans Mono', monospace", fontSize: 10.5, gap: 8,
      }}>
        <span style={{ whiteSpace: "nowrap", opacity: 0.75 }}>● {shift.time}</span>
        <span style={{ flex: 1, textAlign: "center", opacity: 0.85, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{shift.banner}</span>
        <span style={{ color: "rgba(126,184,201,0.6)", whiteSpace: "nowrap" }}>INS DESK</span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span className="mono" style={{ fontSize: 12, color: C.muted }}>Claim {ci + 1} of {cases.length}</span>
        <span className="mono" style={{ fontSize: 12, color: C.pine, fontWeight: 600 }}>{correct}/{total} correct</span>
      </div>
      <ProgressBar value={(doneSteps / totalSteps) * 100} />

      {/* PBM terminal card */}
      <div style={{ borderRadius: 13, overflow: "hidden", marginTop: 14, border: "1.5px solid #4A0A0A", boxShadow: "0 4px 18px rgba(90,10,10,0.18)" }}>
        {/* Terminal header */}
        <div style={{
          background: "#1A0808", padding: "8px 14px",
          display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center",
          fontFamily: "'Spline Sans Mono', monospace", fontSize: 10.5,
        }}>
          <span style={{ color: "#FF9A9A", fontWeight: 700, letterSpacing: 0.5 }}>PBM CLAIMS TERMINAL</span>
          <span style={{ color: "rgba(255,154,154,0.45)", textAlign: "center" }}>PHARMACY DESK</span>
          <span style={{ color: "#FF9A9A", textAlign: "right", opacity: 0.7 }}>{claimNums[ci]}</span>
        </div>
        {/* Claim body */}
        <div style={{ background: "#FAFAF7", padding: "13px 16px", fontFamily: "'Spline Sans Mono', monospace" }}>
          <div style={{ display: "grid", gridTemplateColumns: "max-content 1fr", columnGap: 12, rowGap: 3, fontSize: 11.5 }}>
            <span style={{ color: "#5A6A6C", fontWeight: 700, letterSpacing: 0.4 }}>PATIENT</span>
            <span style={{ color: "#1A2A24", fontWeight: 500 }}>{c.claim.patient}</span>
            <span style={{ color: "#5A6A6C", fontWeight: 700, letterSpacing: 0.4 }}>DRUG</span>
            <span style={{ color: "#1A2A24", fontWeight: 700, fontSize: 13 }}>{c.claim.drug}</span>
            <span style={{ color: "#5A6A6C", fontWeight: 700, letterSpacing: 0.4 }}>PLAN</span>
            <span style={{ color: "#1A2A24" }}>{c.claim.plan}</span>
            <span style={{ color: "#5A6A6C", fontWeight: 700, letterSpacing: 0.4 }}>NOTE</span>
            <span style={{ color: "#4A4A4A", fontStyle: "italic", fontSize: 11 }}>{c.claim.info}</span>
          </div>
        </div>
        {/* Reject banner */}
        <div style={{
          background: claimResolved ? "#0a2e14" : "#3A0808",
          borderTop: `1px solid ${claimResolved ? "#2E8B57" : "#8B2020"}`,
          padding: "8px 14px", display: "flex", alignItems: "center", gap: 10,
          fontFamily: "'Spline Sans Mono', monospace",
          transition: "background .4s",
        }}>
          <span style={{ fontSize: 15 }}>{claimResolved ? "✓" : "⛔"}</span>
          <div>
            <span style={{ color: claimResolved ? "#5AE87A" : "#FF6B6B", fontWeight: 700, fontSize: 11 }}>
              {claimResolved ? "RESOLVED — CLAIM REPROCESSING" : `REJECTED · CODE ${c.code} — ${c.reject.toUpperCase()}`}
            </span>
            {!claimResolved && (
              <div style={{ color: "rgba(255,107,107,0.6)", fontSize: 10, marginTop: 1 }}>Action required before resubmission</div>
            )}
          </div>
        </div>
      </div>

      {/* Question card */}
      <div className="rx-card pop" key={`${ci}-${si}`} style={{ padding: 20, marginTop: 12 }}>
        <div className="mono" style={{ fontSize: 10.5, letterSpacing: 1.2, textTransform: "uppercase", color: C.amber, marginBottom: 8 }}>
          ▸ Claims adjudication — step {si + 1} of {c.steps.length}
        </div>
        <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 16px", lineHeight: 1.35 }}>{step.prompt}</h3>
        <Options options={step.options} answer={step.answer} selected={selected} onSelect={answer} locked={locked} />
        {locked && <Explain correct={selected === step.answer} text={step.explain} />}
      </div>

      {locked && (
        <button onClick={next} style={btn(C.pine, C.paper, { width: "100%", marginTop: 14 })}>
          {ci + 1 >= cases.length && si + 1 >= c.steps.length ? "Finish shift" :
            si + 1 >= c.steps.length ? "Next claim →" : "Next step →"}
        </button>
      )}
    </div>
  );
}

/* ============================================================
   VIRGINIA LAW  (Mode 8) — Virginia Board of Pharmacy / Drug Control Act
   Verified against the Virginia Administrative Code & Code of Virginia.
   ============================================================ */
const VIRGINIA = [
  { level: 1, q: "In Virginia, prescription (legend) drugs that are NOT in Schedules I–V are classified as:", options: ["Schedule VI", "Schedule 0", "Unscheduled / exempt", "Schedule I"], answer: 0, explain: "Virginia is distinctive: all other prescription drugs and devices fall into Schedule VI. You'll see 'Schedule III–VI' language throughout Virginia pharmacy law." },
  { level: 1, q: "How long after the date of issue may a Schedule II prescription be dispensed in Virginia?", options: ["No more than 6 months after it was issued", "Up to 1 year", "Up to 2 years", "No limit"], answer: 0, explain: "Per 18VAC110-20-290, a CII is dispensed in good faith but in no case more than six months after the date issued." },
  { level: 1, q: "May a Schedule II prescription be refilled in Virginia?", options: ["No — never refillable (partial fills only)", "Yes, up to 5 times", "Yes, once", "Yes, within 6 months"], answer: 0, explain: "Schedule II prescriptions are never refillable. Partial fills are allowed under specific conditions, but a refill is not." },
  { level: 2, q: "A Schedule III or IV prescription in Virginia may be refilled:", options: ["Up to 5 times within 6 months of the issue date", "Unlimited within 1 year", "Once only", "Up to 11 times within 1 year"], answer: 0, explain: "Per § 54.1-3411, CIII/CIV may not be filled or refilled more than six months after issue, and no more than five times — then it must be renewed by the prescriber." },
  { level: 2, q: "A Schedule VI prescription may not be dispensed or refilled more than ____ after the date issued (unless the prescriber authorizes longer, up to 2 years):", options: ["1 year", "6 months", "90 days", "5 years"], answer: 0, explain: "Per 18VAC110-20-320, a Schedule VI prescription expires 1 year after issue unless the prescriber authorizes a longer period not to exceed two years." },
  { level: 2, q: "A Schedule VI prescription that the prescriber did NOT authorize for refills:", options: ["May not be refilled (except the emergency imminent-danger provision)", "May be refilled 5 times automatically", "May be refilled once", "Never expires"], answer: 0, explain: "Per § 54.1-3411(3), a Schedule VI Rx may not be refilled unless the prescriber authorized it — with one exception (the emergency refill provision)." },
  { level: 2, q: "When may a Virginia pharmacist refill a Schedule VI drug (including insulin) WITHOUT prescriber authorization?", options: ["When reasonable effort to reach the prescriber fails and the patient's health would be in imminent danger without it", "Any time the patient asks", "Only for controlled substances", "Never"], answer: 0, explain: "Per § 54.1-3411(4): after a reasonable effort to contact the prescriber, if they're unavailable and the patient's health would be in imminent danger, the pharmacist may make the refill — then inform the patient and notify the prescriber, documenting the rationale." },
  { level: 3, q: "For an emergency ORAL Schedule II prescription in Virginia, the prescriber must deliver a written prescription within:", options: ["7 days, marked 'Authorization for Emergency Dispensing'", "24 hours", "72 hours", "30 days"], answer: 0, explain: "Per 18VAC110-20-290, the quantity is limited to the emergency need, and the prescriber must deliver a written Rx within 7 days marked 'Authorization for Emergency Dispensing.'" },
  { level: 3, q: "A pharmacist partially fills a CII because they can't supply the full quantity. The remainder must be supplied within:", options: ["72 hours, or notify the prescriber (a new Rx is needed after that)", "7 days", "24 hours", "30 days"], answer: 0, explain: "Under the federal partial-fill rule (21 CFR 1306.13) applied in Virginia, the remaining portion must be filled within 72 hours; otherwise the prescriber is notified and no further quantity may be supplied without a new prescription." },
  { level: 3, q: "An authorized refill may be dispensed EARLY in Virginia provided that:", options: ["The pharmacist documents a valid reason for the early refill", "It's never more than 2 days early", "The patient pays cash", "It's a controlled substance"], answer: 0, explain: "Per 18VAC110-20-320(D), an authorized refill may be dispensed early when the pharmacist documents a valid reason for the necessity." },
  { level: 3, q: "Under a Virginia statewide protocol, a pharmacist may INITIATE which of the following without a patient-specific prescription?", options: ["Naloxone (also hormonal contraceptives, prenatal vitamins, epinephrine, fluoride)", "Any Schedule II opioid", "Insulin glargine", "Warfarin"], answer: 0, explain: "Per 18VAC110-21-46 and the Board's statewide protocols, pharmacists may initiate naloxone, self-administered/injectable hormonal contraceptives, prenatal vitamins, dietary fluoride, and epinephrine — not controlled substances like opioids." },
  { level: 3, q: "Before prescribing self-administered hormonal contraceptives under the Virginia protocol, the pharmacist must:", options: ["Complete an assessment consistent with the U.S. Medical Eligibility Criteria for Contraceptive Use", "Get a physician co-signature", "Wait 48 hours", "Require a recent Pap smear"], answer: 0, explain: "The protocol requires a screening assessment consistent with the US MEC for Contraceptive Use (typically including a blood-pressure check and questionnaire) before initiating." },
  { level: 4, q: "Which 'test-and-treat' conditions may Virginia pharmacists manage by statewide protocol (effective 12/26/2023)?", options: ["COVID-19, influenza, Group A Strep, and uncomplicated UTI in women", "Pneumonia and sepsis", "Any infection at the pharmacist's discretion", "Only COVID-19"], answer: 0, explain: "Virginia's test-and-treat statewide protocols cover COVID-19, influenza, Group A Streptococcus, and acute uncomplicated lower UTI in women." },
  { level: 4, q: "On patient request and using professional judgment, a Virginia pharmacist may dispense a Schedule VI drug in any quantity up to the total authorized — EXCEPT for:", options: ["Psychotherapeutic agents, anxiolytics, sedatives/hypnotics, or 'drugs of concern'", "Antibiotics", "Inhalers", "Topical steroids"], answer: 0, explain: "Per 18VAC110-20-320, this quantity flexibility excludes AHFS-classified psychotherapeutic agents, anxiolytics, sedatives/hypnotics, and 'drugs of concern' under § 54.1-2519." },
  { level: 4, q: "A prescriber may authorize an RN or LPN to approve additional Schedule VI refills (no change in drug/strength/dosage) for up to:", options: ["90 consecutive days under a written protocol", "1 year", "6 months", "30 days"], answer: 0, explain: "Per § 54.1-3303, a nurse may approve additional Schedule VI refills for up to 90 consecutive days under the prescriber's written protocol, with documentation." },
];

/* ---------- Mode 8: Virginia Law ---------- */
function VirginiaLaw({ level, onFinish, onQuit }) {
  const [pool] = useState(() => shuffle(VIRGINIA.filter((q) => q.level <= level)).slice(0, 12));
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [locked, setLocked] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [correct, setCorrect] = useState(0);

  if (!pool.length) return <Empty onQuit={onQuit} />;
  const q = pool[idx];

  function answer(i) {
    if (locked) return;
    setSelected(i); setLocked(true);
    if (i === q.answer) {
      setScore((s) => s + 100 + streak * 25);
      const ns = streak + 1; setStreak(ns); setBest((b) => Math.max(b, ns));
      setCorrect((c) => c + 1);
    } else setStreak(0);
  }
  function next() {
    if (idx + 1 >= pool.length) {
      onFinish({ mode: 1, score, correct, total: pool.length, bestStreak: best, outOfLives: false });
      return;
    }
    setIdx(idx + 1); setSelected(null); setLocked(false);
  }

  return (
    <div className="rise">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 16 }}>
          <Stat label="Score" value={score} color={C.pine} />
          <Stat label="Streak" value={`×${streak}`} color={C.amber} />
        </div>
        <span className="mono" style={{ fontSize: 12, color: C.muted }}>Q{idx + 1} / {pool.length}</span>
      </div>
      <ProgressBar value={(idx / pool.length) * 100} />

      <div className="rx-card pop" key={idx} style={{ padding: 20, margin: "16px 0" }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: C.amber, marginBottom: 8 }}>Commonwealth of Virginia</div>
        <h3 style={{ fontSize: 17.5, fontWeight: 700, margin: "0 0 16px", lineHeight: 1.35 }}>{q.q}</h3>
        <Options options={q.options} answer={q.answer} selected={selected} onSelect={answer} locked={locked} />
        {locked && <Explain correct={selected === q.answer} text={q.explain} />}
      </div>

      {locked && (
        <button onClick={next} style={btn(C.pine, C.paper, { width: "100%" })}>
          {idx + 1 >= pool.length ? "Finish set" : "Next →"}
        </button>
      )}
      {idx === 0 && !locked && (
        <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.5, marginTop: 14 }}>
          Reflects Virginia law as of sources current in early 2026. Laws change — always confirm against the Virginia Board of Pharmacy / DHP and the Code of Virginia before relying on a rule in practice.
        </p>
      )}
    </div>
  );
}

/* ============================================================
   THE SHIFT — live counter simulator (the game layer)
   Patients queue up against the clock; each carries a task drawn
   from every drill (sig, DUR, insurance, drugs, VA law, OTC...).
   ============================================================ */
let _shiftMuted = false;
let _actx = null;
function beep(freq, dur, type, vol) {
  if (_shiftMuted) return;
  try {
    _actx = _actx || new (window.AudioContext || window.webkitAudioContext)();
    const o = _actx.createOscillator(), g = _actx.createGain();
    o.type = type || "sine"; o.frequency.value = freq;
    g.gain.value = vol || 0.06; o.connect(g); g.connect(_actx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, _actx.currentTime + (dur || 0.12));
    o.stop(_actx.currentTime + (dur || 0.12));
  } catch (e) { /* audio unsupported */ }
}

const SHIFT_NAMES = ["Mr. Alvarez", "Ms. Boone", "Dr. Cho", "Mrs. Patel", "Mr. Reyes", "Ms. Nguyen", "Mr. Webb", "Mrs. Khan", "Ms. Flynn", "Mr. Osei", "Mrs. Lund", "Mr. Tran", "Ms. Park", "Mr. Daley", "Mrs. Ruiz", "Mr. Singh", "Ms. Cole", "Mr. Hahn", "Mrs. Ito", "Mr. Brennan"];

function buildShiftPool(level) {
  const items = [];
  QUIZ.filter((q) => q.level <= level).forEach((q) =>
    items.push({ tag: (SKILLS.find((s) => s.id === q.skill) || {}).short || "Rx", q: q.q, options: q.options, answer: q.answer, explain: q.explain, danger: q.skill === "error" || q.skill === "interact" }));
  VIRGINIA.filter((q) => q.level <= level).forEach((q) =>
    items.push({ tag: "VA Law", q: q.q, options: q.options, answer: q.answer, explain: q.explain }));
  INSURANCE.filter((c) => c.level <= level).forEach((c) => {
    const s = c.steps[0];
    items.push({ tag: "Insurance", q: `Reject ${c.code} — ${c.reject}. ${s.prompt}`, options: s.options, answer: s.answer, explain: s.explain });
  });
  VERIFY.filter((c) => c.level <= level).forEach((c) => {
    const s = c.steps[0];
    items.push({ tag: "Safety", q: `${c.rx.drug} — ${s.prompt}`, options: s.options, answer: s.answer, explain: s.explain, danger: true });
  });
  const dpool = DRUGS.filter((d) => d.t <= level);
  const types = ["b2g", "g2b", "class", "use"];
  for (let i = 0; i < 26; i++) {
    const it = buildDrugQ(dpool, types[i % types.length]);
    if (it.options.length >= 4 && new Set(it.options).size === it.options.length)
      items.push({ tag: "Drug", q: it.q, options: it.options, answer: it.answer, explain: it.explain });
  }
  return shuffle(items);
}

/* ---------- 8-bit patient sprites ---------- */
const SP_SKIN = ["#f1c9a5", "#e8b48c", "#c68642", "#8d5524", "#ffd9b8", "#a8744f"];
const SP_HAIR = ["#2b2b2b", "#5a3a22", "#9a6a3a", "#caa83a", "#7a7a7a", "#b05a3a", "#3b2f2f"];
const SP_SHIRT = ["#2C6353", "#C0781E", "#1F4A3F", "#B23A24", "#3a6ea5", "#6E7C70", "#7a5a86", "#427a5c"];
const SP_HAT = ["#B23A24", "#1F4A3F", "#2b2b2b", "#3a6ea5", "#C0781E"];
const SP_STYLES = ["short", "curly", "long", "bun", "bald", "cap", "visor"];

function buildSprite(spec) {
  const W = 12, H = 14;
  const g = Array.from({ length: H }, () => Array(W).fill(null));
  const set = (r, c, v) => { if (r >= 0 && r < H && c >= 0 && c < W) g[r][c] = v; };
  const rect = (r0, r1, c0, c1, v) => { for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) set(r, c, v); };
  rect(3, 8, 3, 8, "skin");
  set(3, 3, null); set(3, 8, null);
  set(8, 3, null); set(8, 8, null);
  set(5, 2, "skin"); set(5, 9, "skin");
  set(5, 4, "eye"); set(5, 7, "eye");
  set(7, 5, "mouth"); set(7, 6, "mouth");
  rect(9, 9, 5, 6, "skin");
  rect(10, 10, 2, 9, "shirt");
  rect(11, 13, 1, 10, "shirt");
  set(11, 1, null); set(11, 10, null);
  set(10, 5, "coll"); set(10, 6, "coll");
  const st = spec.style;
  if (st === "short" || st === "curly" || st === "long" || st === "beard") {
    rect(2, 2, 3, 8, "hair"); set(2, 3, null); set(2, 8, null);
    set(3, 3, "hair"); set(3, 8, "hair"); set(4, 3, "hair"); set(4, 8, "hair");
    if (st === "curly") { set(1, 4, "hair"); set(1, 5, "hair"); set(1, 6, "hair"); set(1, 7, "hair"); set(2, 2, "hair"); set(2, 9, "hair"); }
    if (st === "long") { rect(5, 9, 2, 2, "hair"); rect(5, 9, 9, 9, "hair"); rect(4, 4, 3, 8, "skin"); }
  }
  if (st === "bun") { rect(2, 2, 3, 8, "hair"); set(3, 3, "hair"); set(3, 8, "hair"); set(0, 5, "hair"); set(0, 6, "hair"); set(1, 5, "hair"); set(1, 6, "hair"); }
  if (st === "cap") { rect(1, 2, 3, 8, "hat"); set(1, 3, null); set(1, 8, null); rect(2, 2, 2, 9, "hat"); set(3, 3, "hat"); set(3, 8, "hat"); }
  if (st === "visor") { rect(2, 2, 3, 8, "hat"); rect(3, 3, 2, 9, "hat"); }
  if (spec.beard) { set(6, 3, "hair"); set(6, 8, "hair"); rect(7, 8, 3, 8, "hair"); set(7, 5, "mouth"); set(7, 6, "mouth"); set(8, 3, null); set(8, 8, null); }
  if (spec.glasses) { set(5, 3, "glass"); set(5, 5, "glass"); set(5, 6, "glass"); set(5, 8, "glass"); set(5, 4, "eye"); set(5, 7, "eye"); }
  return g;
}
function randomLook() {
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const style = pick(SP_STYLES);
  const spec = { style, beard: (style === "short" || style === "bald") && Math.random() < 0.3, glasses: Math.random() < 0.28 };
  return {
    grid: buildSprite(spec),
    colors: { skin: pick(SP_SKIN), hair: pick(SP_HAIR), eye: "#23311f", mouth: "rgba(90,55,45,0.5)", shirt: pick(SP_SHIRT), coll: "#EFE5D0", hat: pick(SP_HAT), glass: "#23311f" },
  };
}
function PixelSprite({ grid, colors, px }) {
  const H = grid.length, W = grid[0].length;
  return (
    <svg width={W * px} height={H * px} viewBox={`0 0 ${W} ${H}`} style={{ shapeRendering: "crispEdges", display: "block" }}>
      {grid.map((row, r) => row.map((k, c) => (k ? <rect key={`${r}-${c}`} x={c} y={r} width={1.03} height={1.03} fill={colors[k]} /> : null)))}
    </svg>
  );
}

const SHIFT_LEN = 150;
const tagColor = (t) => t === "Safety" ? C.clay : t === "Insurance" ? C.amber : t === "VA Law" ? C.pineSoft : C.pine;

function TheShift({ level, onHome, best, setBest, onShiftEnd, narratorMode, speedBonus = 0, accuracyBonus = 0 }) {
  const poolRef = useRef(buildShiftPool(level));
  const idxRef = useRef(0);
  const idRef = useRef(1);
  const spawnRef = useRef(2);
  const lockedRef = useRef(false);
  const repRef = useRef(100);
  const queueRef = useRef([]);
  const toRef = useRef(null);

  const getTask = () => { const p = poolRef.current; const t = p[idxRef.current % p.length]; idxRef.current++; return t; };
  const makePatient = () => ({ id: idRef.current++, name: SHIFT_NAMES[Math.floor(Math.random() * SHIFT_NAMES.length)], task: getTask(), patience: 100, look: randomLook() });

  const [queue, setQueue] = useState(() => [makePatient(), makePatient()]);
  const [clock, setClock] = useState(SHIFT_LEN);
  const [cash, setCash] = useState(0);
  const [rep, setRep] = useState(100);
  const [served, setServed] = useState(0);
  const [errors, setErrors] = useState(0);
  const [walkouts, setWalkouts] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [locked, setLocked] = useState(false);
  const [gain, setGain] = useState(0);
  const [phase, setPhase] = useState("play");
  const [muted, setMuted] = useState(false);
  const [narratorQuip, setNarratorQuip] = useState("");

  useEffect(() => { queueRef.current = queue; }, [queue]);
  useEffect(() => { repRef.current = rep; }, [rep]);
  useEffect(() => { _shiftMuted = muted; }, [muted]);

  // Reduced decay (Speed stat perk: each level removes 0.4 patience/sec, max -4)
  const decay = Math.max(1, [0, 4, 5, 7, 9][level] - Math.floor(speedBonus * 0.4));
  const spawnGap = () => { const base = [0, 8, 7, 6, 5][level]; const prog = (SHIFT_LEN - clock) / SHIFT_LEN; return Math.max(3, Math.round((base - prog * 3) + (Math.random() * 2 - 1))); };

  function endShift() { if (toRef.current) clearTimeout(toRef.current); setPhase("over"); }

  useEffect(() => {
    if (phase !== "play") return;
    const iv = setInterval(() => {
      setClock((c) => { if (c <= 1) { endShift(); return 0; } return c - 1; });
      if (repRef.current <= 0) { endShift(); return; }
      spawnRef.current -= 1;
      if (spawnRef.current <= 0) {
        spawnRef.current = spawnGap();
        setQueue((q) => (q.length >= 7 ? q : [...q, makePatient()]));
      }
      if (!lockedRef.current) {
        setQueue((q) => {
          let hit = 0, walk = 0;
          const next = q.map((p) => ({ ...p, patience: p.patience - decay })).filter((p) => {
            if (p.patience <= 0) { hit += 7; walk++; return false; }
            return true;
          });
          if (walk > 0) { setRep((r) => Math.max(0, r - hit)); setCombo(0); setWalkouts((w) => w + walk); setNarratorQuip(getQuip("walkout", narratorMode)); beep(120, 0.25, "sawtooth", 0.05); }
          return next;
        });
      }
    }, 1000);
    return () => clearInterval(iv);
    // eslint-disable-next-line
  }, [phase]);

  useEffect(() => () => { if (toRef.current) clearTimeout(toRef.current); }, []);

  function answer(i) {
    const active = queueRef.current[0];
    if (!active || lockedRef.current || phase !== "play") return;
    const correct = i === active.task.answer;
    lockedRef.current = true; setLocked(true);
    setFeedback({ sel: i, correct, answer: active.task.answer, explain: active.task.explain });
    if (correct) {
      // Accuracy stat perk: +$2 per level on base amount
      const g = Math.round((12 + accuracyBonus * 2) * (1 + combo * 0.15));
      setCash((c) => c + g); setGain(g);
      setRep((r) => Math.min(100, r + 2)); setServed((s) => s + 1);
      setCombo((c) => {
        const n = c + 1; setMaxCombo((m) => Math.max(m, n));
        if (n >= 3) setNarratorQuip(getQuip("combo", narratorMode, { combo: n }));
        else setNarratorQuip(getQuip("correct", narratorMode));
        return n;
      });
      beep(combo >= 4 ? 880 : 660, 0.12, "triangle", 0.06);
    } else {
      setRep((r) => Math.max(0, r - (active.task.danger ? 18 : 8)));
      setCombo(0); setErrors((e) => e + 1);
      setNarratorQuip(getQuip("wrong", narratorMode));
      beep(160, 0.22, "sawtooth", 0.06);
    }
    toRef.current = setTimeout(() => {
      setQueue((q) => q.slice(1));
      lockedRef.current = false; setLocked(false); setFeedback(null); setGain(0); setNarratorQuip("");
      if (repRef.current <= 0) endShift();
    }, 1300);
  }

  // Fire payout callback once when shift ends
  const shiftEndFiredRef = useRef(false);
  useEffect(() => {
    if (phase === "over" && onShiftEnd && !shiftEndFiredRef.current) {
      shiftEndFiredRef.current = true;
      // cash/served/errors/maxCombo are state — read via closure at render time
      onShiftEnd({ cash, served, errors, maxCombo });
    }
  }, [phase]); // eslint-disable-line

  function reset() {
    shiftEndFiredRef.current = false;
    poolRef.current = buildShiftPool(level); idxRef.current = 0; idRef.current = 1;
    spawnRef.current = 2; lockedRef.current = false; repRef.current = 100;
    if (toRef.current) clearTimeout(toRef.current);
    setQueue([makePatient(), makePatient()]);
    setClock(SHIFT_LEN); setCash(0); setRep(100); setServed(0); setErrors(0);
    setWalkouts(0); setCombo(0); setMaxCombo(0); setFeedback(null);
    setLocked(false); setGain(0); setPhase("play");
  }

  /* ---------- SHIFT REPORT ---------- */
  if (phase === "over") {
    const score = served * 10 + cash + maxCombo * 5 + Math.round(rep / 2);
    const total = served + errors;
    const acc = total ? Math.round((served / total) * 100) : 0;
    const ranks = [[0, "Pharmacy Intern"], [120, "New Graduate"], [240, "Staff Pharmacist"], [400, "Senior Pharmacist"], [600, "Pharmacist-in-Charge"], [850, "Legend of the Bench"]];
    let rank = ranks[0][1]; ranks.forEach(([t, n]) => { if (score >= t) rank = n; });
    const newBest = score > (best || 0);
    if (newBest && setBest) setBest(score);
    const pulled = rep <= 0;
    const shiftNarratorQuip = getQuip("shiftEnd", narratorMode, { good: !pulled && acc >= 70 });
    return (
      <div className="rise" style={{ textAlign: "center", paddingTop: 8 }}>
        <div className="pop" style={{ width: 108, height: 108, borderRadius: "50%", margin: "0 auto 14px",
          background: C.card, border: `3px solid ${C.amber}`, display: "grid", placeItems: "center", boxShadow: `0 16px 40px -20px ${C.amber}` }}>
          <span className="display" style={{ fontSize: 40, fontWeight: 900, color: C.pine }}>${cash}</span>
        </div>
        <h2 className="display" style={{ fontSize: 26, fontWeight: 900, margin: "0 0 2px" }}>{pulled ? "Pulled off the floor" : "Shift complete"}</h2>
        <div className="mono" style={{ fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: C.amber, marginBottom: 6 }}>{rank}</div>
        {/* Zippo quip */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 9, marginBottom: 10,
          padding: "8px 14px", borderRadius: 12, background: "rgba(192,120,30,0.1)", border: `1px solid ${C.amberSoft}` }}>
          <svg width={24} height={18} viewBox="0 0 10 11" style={{ shapeRendering: "crispEdges" }}>
            {ZIPPO_GRID.map((row, r) => row.map((k, c) => (
              k ? <rect key={`${r}-${c}`} x={c} y={r} width={1.05} height={1.05} fill={ZIPPO_COLORS[k]} /> : null
            )))}
          </svg>
          <span style={{ fontSize: 12.5, fontStyle: "italic", color: C.ink }}>{shiftNarratorQuip}</span>
        </div>
        <p style={{ color: C.muted, fontSize: 15, maxWidth: 440, margin: "0 auto 20px", lineHeight: 1.5 }}>
          {pulled ? "Your reputation bottomed out — too many errors or walkouts. Shake it off and run it back."
            : newBest ? "New personal best. The line never stood a chance." : "Nice work behind the counter. Beat your best next time."}
        </p>
        <div className="rx-card" style={{ padding: 18, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 12 }}>
          <Stat label="Served" value={served} color={C.pine} />
          <Stat label="Tips" value={"$" + cash} color={C.green} />
          <Stat label="Accuracy" value={acc + "%"} color={C.pine} />
          <Stat label="Best combo" value={"×" + maxCombo} color={C.amber} />
          <Stat label="Walkouts" value={walkouts} color={C.clay} />
          <Stat label="Score" value={score} color={C.ink} />
        </div>
        <div className="mono" style={{ fontSize: 12, color: C.muted, marginBottom: 18 }}>Best this session: {Math.max(best || 0, score)}</div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onHome} style={btn("transparent", C.pine, { border: `1px solid ${C.line}`, flex: 1 })}>Home</button>
          <button onClick={reset} style={btn(C.pine, C.paper, { flex: 1 })}>Work another shift →</button>
        </div>
      </div>
    );
  }

  /* ---------- LIVE SHIFT ---------- */
  const active = queue[0];
  const clockColor = clock <= 20 ? "#FF4444" : clock <= 60 ? "#FFB800" : "#3FB950";
  const repColor = rep >= 60 ? "#3FB950" : rep >= 30 ? "#FFB800" : "#FF4444";
  const mm = Math.floor(clock / 60), ss = String(clock % 60).padStart(2, "0");
  const TF = { fontFamily: "'Spline Sans Mono',monospace" };

  // Simulated station queue counts (shift from real queue length)
  const simQt  = Math.max(0, queue.length + Math.floor(served * 0.6));
  const simQv1 = Math.max(0, Math.floor(served * 0.3));
  const simQp  = Math.max(0, Math.floor(served * 0.2));
  const simQv2 = Math.max(0, Math.floor(served * 0.1));

  return (
    <div style={{ fontFamily: "'Spline Sans',sans-serif" }}>
      {/* ── RXPRO SHIFT HEADER ── */}
      <div style={{ background: "#0B1F3A", borderRadius: "14px 14px 0 0", padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ ...TF, color: "#4A8FA5", fontSize: 8, letterSpacing: 2 }}>RXPRO — SHIFT IN PROGRESS</div>
          <div style={{ ...TF, color: "#E8F4F8", fontSize: 12, fontWeight: 600, marginTop: 2 }}>STORE #{Math.floor(level * 1234 + 2847)} · THE COUNTER</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => setMuted((m) => !m)}
            style={{ ...TF, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(126,184,201,0.2)", borderRadius: 7, padding: "4px 8px", cursor: "pointer", fontSize: 12, color: "#7EB8C9" }}>
            {muted ? "🔇" : "🔊"}
          </button>
          <div style={{ textAlign: "right" }}>
            <div style={{ ...TF, fontSize: 18, fontWeight: 700, color: clockColor, lineHeight: 1 }}>{mm}:{ss}</div>
            <div style={{ ...TF, fontSize: 7, color: "#4A8FA5", letterSpacing: 1, marginTop: 2 }}>SHIFT CLOCK</div>
          </div>
        </div>
      </div>

      {/* ── FLOOR STATUS STRIP ── */}
      <div style={{ background: "#0F2A3F", padding: "10px 16px", borderTop: "1px solid rgba(126,184,201,0.1)", borderRadius: "0 0 12px 12px", marginBottom: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr) 1fr", gap: 7 }}>
          {[
            { k: "QT",  v: simQt,  hi: 12 },
            { k: "QV1", v: simQv1, hi: 6  },
            { k: "QP",  v: simQp,  hi: 5  },
            { k: "QV2", v: simQv2, hi: 4  },
          ].map(({ k, v, hi }) => (
            <div key={k} style={{ background: "rgba(0,0,0,0.3)", borderRadius: 7, padding: "6px 4px", textAlign: "center" }}>
              <div style={{ ...TF, color: v >= hi ? "#FF4444" : "#3FB950", fontSize: 15, fontWeight: 700, lineHeight: 1 }}>{v}</div>
              <div style={{ ...TF, color: "#3A6070", fontSize: 7, letterSpacing: 1, marginTop: 2 }}>{k}</div>
            </div>
          ))}
          <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 7, padding: "6px 8px" }}>
            <div style={{ ...TF, color: rep >= 60 ? "#3FB950" : rep >= 30 ? "#FFB800" : "#FF4444", fontSize: 10, fontWeight: 700, lineHeight: 1 }}>REP</div>
            <div style={{ marginTop: 4, height: 4, background: "rgba(0,0,0,0.4)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${rep}%`, background: repColor, transition: "width .4s ease" }} />
            </div>
          </div>
        </div>

        {/* cash + combo strip */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div>
              <span style={{ ...TF, fontSize: 16, fontWeight: 700, color: "#3FB950", position: "relative" }}>
                ${cash}
                {gain > 0 && <span className="pop" style={{ position: "absolute", left: "100%", top: -2, marginLeft: 6, fontSize: 11, color: "#3FB950", whiteSpace: "nowrap" }}>+${gain}</span>}
              </span>
              <span style={{ ...TF, fontSize: 8, color: "#4A8FA5", marginLeft: 6 }}>TIPS EARNED</span>
            </div>
            {combo > 1 && (
              <div className="pop" key={combo} style={{ ...TF, background: "rgba(255,184,0,0.15)", border: "1px solid rgba(255,184,0,0.4)", borderRadius: 6, padding: "3px 8px", fontSize: 10, color: "#FFB800" }}>
                ×{combo} COMBO
              </div>
            )}
          </div>
          <div style={{ ...TF, fontSize: 9, color: "#4A8FA5" }}>{served} served · {errors} errors</div>
        </div>
      </div>

      {/* ── PATIENT QUEUE ── */}
      <div style={{ background: "#F5F0E8", borderRadius: 12, padding: "10px 14px", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <span style={{ ...TF, fontSize: 8, color: "#6E7C70", letterSpacing: 1.5 }}>COUNTER QUEUE</span>
          <span style={{ ...TF, fontSize: 8, color: queue.length >= 5 ? "#B23A24" : "#6E7C70" }}> · {queue.length} waiting</span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 7, minHeight: 62, flexWrap: "nowrap", overflowX: "auto" }}>
          {queue.length === 0 && <span style={{ fontSize: 12, color: "#6E7C70", fontStyle: "italic", paddingBottom: 14 }}>Counter clear — quiet moment…</span>}
          {queue.map((p, i) => {
            const pc = p.patience > 60 ? C.green : p.patience > 30 ? C.amber : C.clay;
            const px = i === 0 ? 3.6 : 2.4;
            const sw = Math.round(12 * px);
            return (
              <div key={p.id} className="pop" style={{ textAlign: "center", flexShrink: 0, opacity: i === 0 ? 1 : 0.75 }}>
                {i === 0 && <div style={{ fontSize: 10, color: C.amber, lineHeight: 1, marginBottom: 1 }}>▾</div>}
                <div style={{ height: Math.round(14 * px), display: "flex", alignItems: "flex-end", justifyContent: "center",
                  filter: i === 0 ? "drop-shadow(0 2px 0 rgba(192,120,30,0.45))" : "none" }}>
                  <PixelSprite grid={p.look.grid} colors={p.look.colors} px={px} />
                </div>
                <div style={{ width: sw, height: 3, borderRadius: 3, background: "#D9D1C0", margin: "4px auto 0", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.max(0, p.patience)}%`, background: pc, transition: "width 1s linear" }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── COUNTER WINDOW ── */}
      {active ? (
        <div key={active.id} style={{ borderRadius: 10, overflow: "hidden", border: `2px solid ${feedback ? (feedback.correct ? "#3FB950" : C.clay) : "#D0D8E0"}`, background: "#FFFFFF", transition: "border-color .2s" }}>
          {/* Ticket header */}
          <div style={{ background: "#0B1F3A", padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ ...TF, color: "#4A8FA5", fontSize: 9 }}>
                TICKET #{String(active.id).padStart(4,"0")} · COUNTER
              </div>
              <div style={{ ...TF, color: "#E8F4F8", fontSize: 11, fontWeight: 600 }}>
                {active.name.toUpperCase()}
              </div>
            </div>
            <span style={{ ...TF, fontSize: 8, letterSpacing: 1, color: tagColor(active.task.tag), background: `${tagColor(active.task.tag)}25`, border: `1px solid ${tagColor(active.task.tag)}55`, borderRadius: 4, padding: "2px 7px" }}>
              {active.task.tag}
            </span>
          </div>
          {/* Scenario body */}
          <div style={{ padding: "14px 16px 12px", background: feedback ? (feedback.correct ? "rgba(46,139,87,0.04)" : "rgba(178,58,36,0.04)") : "#FAFBFC", borderBottom: "1px solid #E8EDF1" }}>
            <div style={{ ...TF, color: "#5A7080", fontSize: 8, letterSpacing: 1.5, marginBottom: 6 }}>SITUATION</div>
            <p style={{ margin: 0, fontSize: 14.5, fontWeight: 600, lineHeight: 1.45, color: "#1A2A35" }}>{active.task.q}</p>
          </div>
          {/* Action choices */}
          <div style={{ padding: "12px 14px 14px", background: "#F7F9FB" }}>
            <div style={{ ...TF, color: "#5A7080", fontSize: 8, letterSpacing: 1.5, marginBottom: 8 }}>SELECT ACTION</div>
            <div style={{ display: "grid", gap: 6 }}>
              {active.task.options.map((opt, i) => {
                let bg = "#FFFFFF", border = "#D0D8E0", color = "#1A2A35";
                if (feedback) {
                  if (i === feedback.answer) { bg = "rgba(46,139,87,0.10)"; border = "#3FB950"; color = "#1A3020"; }
                  else if (i === feedback.sel) { bg = "rgba(178,58,36,0.10)"; border = C.clay; color = "#3A1010"; }
                }
                return (
                  <button key={i} className="opt" disabled={!!feedback} onClick={() => answer(i)}
                    style={{ textAlign: "left", background: bg, border: `1.5px solid ${border}`, color, borderRadius: 8,
                      padding: "9px 12px", cursor: feedback ? "default" : "pointer", fontSize: 13.5, lineHeight: 1.4,
                      display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <span style={{ ...TF, fontSize: 9, color: feedback ? (i === feedback.answer ? "#3FB950" : i === feedback.sel ? C.clay : "#8A9AAA") : "#8A9AAA", flexShrink: 0, marginTop: 1 }}>[{String.fromCharCode(65+i)}]</span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
            {feedback && (
              <div className="pop" style={{ marginTop: 10, fontSize: 12.5, lineHeight: 1.55, padding: "9px 12px", borderRadius: 7, background: feedback.correct ? "rgba(46,139,87,0.08)" : "rgba(178,58,36,0.07)", border: `1px solid ${feedback.correct ? "#3FB950" : C.clay}44` }}>
                <span style={{ ...TF, fontWeight: 700, color: feedback.correct ? "#3FB950" : C.clay, fontSize: 9, letterSpacing: 1, marginRight: 8 }}>{feedback.correct ? "CORRECT" : "INCORRECT"}</span>
                <span style={{ color: "#2A3A40" }}>{active.task.explain}</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ background: "#0B1F3A", borderRadius: 10, padding: "22px 20px", textAlign: "center" }}>
          <div style={{ ...TF, color: "#3FB950", fontSize: 9, letterSpacing: 2, marginBottom: 6 }}>● COUNTER CLEAR</div>
          <div style={{ ...TF, color: "#4A8FA5", fontSize: 11 }}>Queue processing — next task incoming…</div>
        </div>
      )}

      {/* ── NARRATOR STRIP ── */}
      {narratorQuip && (
        <div className="pop" style={{ display: "flex", alignItems: "flex-start", gap: 10, marginTop: 10,
          padding: "9px 13px", borderRadius: 10, background: "rgba(11,31,58,0.06)", border: `1px dashed ${C.line}` }}>
          <svg width={28} height={20} viewBox="0 0 10 11" style={{ shapeRendering: "crispEdges", flexShrink: 0, marginTop: 1 }}>
            {ZIPPO_GRID.map((row, r) => row.map((k, c) => (
              k ? <rect key={`${r}-${c}`} x={c} y={r} width={1.05} height={1.05} fill={ZIPPO_COLORS[k]} /> : null
            )))}
          </svg>
          <div>
            <span className="pixel" style={{ fontSize: 7, color: C.amber, display: "block", marginBottom: 3 }}>{NARRATOR_NAME}</span>
            <span style={{ fontSize: 12, color: C.ink, fontStyle: "italic", lineHeight: 1.4 }}>{narratorQuip}</span>
          </div>
        </div>
      )}

      <button onClick={endShift} style={btn("transparent", C.muted, { border: `1px solid ${C.line}`, width: "100%", marginTop: 12, fontSize: 13 })}>
        Clock out early
      </button>
    </div>
  );
}

/* ============================================================
   VERIFY BENCH  (Mode 10) — data verification (DV)
   Compare the typed entry against the original hard copy and flag
   the field that doesn't match, the way a pharmacist verifies.
   ============================================================ */
const VBENCH = [
  {
    level: 1, patient: "Roland Reid", dob: "12/26/1986", age: "35", sex: "M", patientAddr: "8766 Crockett St, Dayton, OH",
    prescriber: "Jeremy Roberts, MD", prescriberAddr: "2850 Country Club Rd, Laredo, TX",
    brand: "Isoptin", generic: "verapamil", strength: "80 mg", manufacturer: "Medical Pharma",
    writtenDate: "4/9/2022", qty: "60", refills: "7", daysSupply: "30", dawCode: "0",
    directions: "take one tablet by mouth twice a day",
    orig: { drug: "verapamil", strength: "40 mg", disp: "60", sig: "take 1 tab po BID", refills: "7", dob: "12/26/86", date: "4/9/22", patient: "Roland Reid", dawChecked: false },
    errorField: "strength", note: "The hard copy reads verapamil 40 mg, but 80 mg was entered. Wrong strength — send it back / correct before filling.",
  },
  {
    level: 2, patient: "Donna Pierce", dob: "03/14/1959", age: "66", sex: "F", patientAddr: "412 Maple Ave, Dayton, OH",
    prescriber: "Alan Frost, MD", prescriberAddr: "19 Mercy Blvd, Dayton, OH",
    brand: "Glucophage", generic: "metformin", strength: "500 mg", manufacturer: "Generics Inc",
    writtenDate: "5/2/2025", qty: "90", refills: "5", daysSupply: "30", dawCode: "0",
    directions: "take one tablet by mouth once daily",
    orig: { drug: "metformin", strength: "500 mg", disp: "90", sig: "take 1 tab po TID", refills: "5", dob: "3/14/59", date: "5/2/25", patient: "Donna Pierce", dawChecked: false },
    errorField: "directions", note: "The sig is three times daily (TID), but the directions were entered as once daily. Mistranslated sig — the quantity (90) and 30-day supply match TID, confirming the directions are the error.",
  },
  {
    level: 2, patient: "Marcus Hale", dob: "08/01/1990", age: "34", sex: "M", patientAddr: "77 Birch Ln, Dayton, OH",
    prescriber: "Priya Nair, MD", prescriberAddr: "300 Elm St, Dayton, OH",
    brand: "Amoxil", generic: "amoxicillin", strength: "500 mg", manufacturer: "Generics Inc",
    writtenDate: "5/20/2025", qty: "20", refills: "0", daysSupply: "10", dawCode: "0",
    directions: "take one capsule by mouth three times daily for 10 days",
    orig: { drug: "amoxicillin", strength: "500 mg", disp: "30", sig: "1 cap po TID x10d", refills: "0", dob: "8/1/90", date: "5/20/25", patient: "Marcus Hale", dawChecked: false },
    errorField: "qty", note: "1 capsule three times daily for 10 days = 30 capsules, but 20 was entered. Wrong quantity.",
  },
  {
    level: 3, patient: "Ethel Brooks", dob: "11/09/1948", age: "76", sex: "F", patientAddr: "5 Oak Ct, Dayton, OH",
    prescriber: "Sam Okafor, MD", prescriberAddr: "88 Health Pkwy, Dayton, OH",
    brand: "Prinivil", generic: "lisinopril", strength: "10 mg", manufacturer: "Generics Inc",
    writtenDate: "4/18/2025", qty: "30", refills: "11", daysSupply: "90", dawCode: "0",
    directions: "take one tablet by mouth once daily",
    orig: { drug: "lisinopril", strength: "10 mg", disp: "30", sig: "1 tab po daily", refills: "11", dob: "11/9/48", date: "4/18/25", patient: "Ethel Brooks", dawChecked: false },
    errorField: "daysSupply", note: "30 tablets at one daily = a 30-day supply, but 90 was entered. Wrong days supply (this drives refill-too-soon and billing).",
  },
  {
    level: 2, patient: "Tyrone Banks", dob: "07/22/1972", age: "52", sex: "M", patientAddr: "210 Pine St, Dayton, OH",
    prescriber: "Lena Cho, MD", prescriberAddr: "44 Center Ave, Dayton, OH",
    brand: "Lipitor", generic: "atorvastatin", strength: "20 mg", manufacturer: "Generics Inc",
    writtenDate: "3/30/2025", qty: "90", refills: "11", daysSupply: "90", dawCode: "0",
    directions: "take one tablet by mouth once daily",
    orig: { drug: "atorvastatin", strength: "20 mg", disp: "90", sig: "1 tab po daily", refills: "5", dob: "7/22/72", date: "3/30/25", patient: "Tyrone Banks", dawChecked: false },
    errorField: "refills", note: "The prescriber authorized 5 refills, but 11 were entered. Over-entered refills.",
  },
  {
    level: 3, patient: "Grace Lindqvist", dob: "02/17/1968", age: "57", sex: "F", patientAddr: "9 Willow Dr, Dayton, OH",
    prescriber: "David Mercer, MD", prescriberAddr: "12 Thyroid Way, Dayton, OH",
    brand: "Synthroid", generic: "levothyroxine", strength: "100 mcg", manufacturer: "AbbVie",
    writtenDate: "5/1/2025", qty: "90", refills: "3", daysSupply: "90", dawCode: "0",
    directions: "take one tablet by mouth once daily before breakfast",
    orig: { drug: "levothyroxine", strength: "100 mcg", disp: "90", sig: "1 tab po daily ac breakfast", refills: "3", dob: "2/17/68", date: "5/1/25", patient: "Grace Lindqvist", dawChecked: true },
    errorField: "daw", note: "The prescriber checked 'Dispense As Written' (brand medically necessary), so this should be DAW 1 — but DAW 0 (substitution permissible) was entered. Levothyroxine is narrow-therapeutic-index, so the brand request matters.",
  },
  {
    level: 3, patient: "Howard Kim", dob: "06/05/1955", age: "70", sex: "M", patientAddr: "31 Cedar Rd, Dayton, OH",
    prescriber: "Nadia Salem, MD", prescriberAddr: "501 Vine St, Dayton, OH",
    brand: "—", generic: "hydralazine", strength: "25 mg", manufacturer: "Generics Inc",
    writtenDate: "5/12/2025", qty: "90", refills: "2", daysSupply: "30", dawCode: "0",
    directions: "take one tablet by mouth three times daily",
    orig: { drug: "hydroxyzine", strength: "25 mg", disp: "90", sig: "1 tab po TID", refills: "2", dob: "6/5/55", date: "5/12/25", patient: "Howard Kim", dawChecked: false },
    errorField: "drug", note: "Look-alike/sound-alike error: the hard copy reads hydroxyzine (antihistamine), but hydralazine (an antihypertensive) was entered. Classic LASA mix-up — verify the intended drug.",
  },
  {
    level: 3, patient: "Bianca Flores", dob: "09/30/1986", age: "38", sex: "F", patientAddr: "7 Aspen Ct, Dayton, OH",
    prescriber: "Owen Pratt, MD", prescriberAddr: "62 Spring St, Dayton, OH",
    brand: "Zoloft", generic: "sertraline", strength: "50 mg", manufacturer: "Generics Inc",
    writtenDate: "4/25/2025", qty: "30", refills: "5", daysSupply: "30", dawCode: "0",
    directions: "take one tablet by mouth once daily",
    orig: { drug: "sertraline", strength: "50 mg", disp: "30", sig: "1 tab po daily", refills: "5", dob: "9/30/68", date: "4/25/25", patient: "Bianca Flores", dawChecked: false },
    errorField: "dob", note: "The date of birth was transposed — the hard copy shows 9/30/1986, but 9/30/1968 was entered. A wrong DOB can mismatch the patient and break insurance.",
  },
  {
    level: 4, patient: "Walter Munoz", dob: "01/14/1961", age: "64", sex: "M", patientAddr: "140 Lake Dr, Dayton, OH",
    prescriber: "Iris Tan, MD", prescriberAddr: "9 Summit Ave, Dayton, OH",
    brand: "Lipitor", generic: "simvastatin", strength: "20 mg", manufacturer: "Generics Inc",
    writtenDate: "5/8/2025", qty: "90", refills: "5", daysSupply: "90", dawCode: "0",
    directions: "take one tablet by mouth once daily at bedtime",
    orig: { drug: "atorvastatin (Lipitor)", strength: "20 mg", disp: "90", sig: "1 tab po qHS", refills: "5", dob: "1/14/61", date: "5/8/25", patient: "Walter Munoz", dawChecked: false },
    errorField: "drug", note: "Brand/generic mismatch: Lipitor's generic is atorvastatin, not simvastatin. The wrong generic was paired with the brand.",
  },
  {
    level: 4, patient: "Sofia Reyes", dob: "10/03/1995", age: "29", sex: "F", patientAddr: "23 Field St, Dayton, OH",
    prescriber: "Greg Hale, MD", prescriberAddr: "70 Park Pl, Dayton, OH",
    brand: "Lamictal", generic: "lamotrigine", strength: "100 mg", manufacturer: "Generics Inc",
    writtenDate: "5/15/2025", qty: "60", refills: "2", daysSupply: "30", dawCode: "0",
    directions: "take one tablet by mouth twice daily",
    orig: { drug: "lamotrigine", strength: "25 mg", disp: "60", sig: "1 tab po BID", refills: "2", dob: "10/3/95", date: "5/15/25", patient: "Sofia Reyes", dawChecked: false },
    errorField: "strength", note: "The hard copy reads lamotrigine 25 mg, but 100 mg was entered. Lamotrigine must be titrated slowly — a 4× strength error is dangerous (serious rash risk).",
  },
  {
    level: 1, patient: "Carl Whitman", dob: "12/11/1970", age: "54", sex: "M", patientAddr: "55 River Rd, Dayton, OH",
    prescriber: "Mona Adler, MD", prescriberAddr: "8 Clinic Ct, Dayton, OH",
    brand: "Norvasc", generic: "amlodipine", strength: "5 mg", manufacturer: "Generics Inc",
    writtenDate: "5/19/2025", qty: "30", refills: "5", daysSupply: "30", dawCode: "0",
    directions: "take one tablet by mouth once daily",
    orig: { drug: "amlodipine", strength: "5 mg", disp: "30", sig: "1 tab po daily", refills: "5", dob: "12/11/70", date: "5/19/25", patient: "Carl Whitman", dawChecked: false },
    errorField: null, note: "Everything matches the hard copy — drug, strength, quantity, days supply, refills, DAW, and directions all check out. Verify and fill.",
  },
  {
    level: 2, patient: "Helen Ortiz", dob: "04/28/1952", age: "73", sex: "F", patientAddr: "18 Stone Ave, Dayton, OH",
    prescriber: "Raj Patel, MD", prescriberAddr: "210 Care Dr, Dayton, OH",
    brand: "Coumadin", generic: "warfarin", strength: "5 mg", manufacturer: "Bristol Myers",
    writtenDate: "5/6/2025", qty: "30", refills: "3", daysSupply: "30", dawCode: "1",
    directions: "take one tablet by mouth once daily",
    orig: { drug: "warfarin", strength: "5 mg", disp: "30", sig: "1 tab po daily", refills: "3", dob: "4/28/52", date: "5/6/25", patient: "Helen Ortiz", dawChecked: true },
    errorField: null, note: "Clean: the prescriber checked Dispense As Written and DAW 1 was entered (matches), and every other field agrees with the hard copy. Verify and fill.",
  },
  {
    level: 4, patient: "Derek Foss", dob: "05/19/1983", age: "41", sex: "M", patientAddr: "9 Harbor St, Dayton, OH",
    prescriber: "Tara Wells, MD", prescriberAddr: "14 Bayview Ave, Dayton, OH",
    brand: "Ventolin", generic: "albuterol", strength: "90 mcg", manufacturer: "GSK",
    writtenDate: "5/11/2025", qty: "1 inhaler", refills: "2", daysSupply: "30", dawCode: "0",
    directions: "inhale one puff by mouth every 4 hours as needed",
    orig: { drug: "albuterol HFA", strength: "90 mcg", disp: "1 inhaler", sig: "2 puffs po q4-6h prn SOB", refills: "2", dob: "5/19/83", date: "5/11/25", patient: "Derek Foss", dawChecked: false },
    errorField: "directions", note: "The sig is TWO puffs every 4–6 hours as needed, but the directions were entered as ONE puff every 4 hours. Mistranslated dose and interval.",
  },
  {
    level: 4, patient: "Marta Chen", dob: "02/09/1957", age: "68", sex: "F", patientAddr: "52 Rowan St, Dayton, OH",
    prescriber: "Iris Tan, MD", prescriberAddr: "9 Summit Ave, Dayton, OH",
    brand: "Biaxin", generic: "clarithromycin", strength: "500 mg", manufacturer: "AbbVie",
    writtenDate: "6/10/2026", qty: "14", refills: "0", daysSupply: "7", dawCode: "0",
    directions: "take one tablet by mouth twice daily for 7 days",
    orig: { drug: "clarithromycin", strength: "500 mg", disp: "14", sig: "1 tab po BID x7d", refills: "0", dob: "2/9/57", date: "6/10/26", patient: "Marta Chen", dawChecked: false },
    errorField: null,
    durOverride: {
      code: "M01",
      title: "Severe DUR interaction",
      profile: "Active profile: simvastatin 40 mg nightly.",
      detail: "Clarithromycin is a strong CYP3A4 inhibitor and can sharply raise simvastatin exposure, increasing myopathy/rhabdomyolysis risk.",
    },
    note: "The data entry matches the hard copy, but the clinical DUR lock requires documented pharmacist intervention. M01 records the manager override after the interaction is addressed.",
  },
];

const VFIELD_LABELS = { patient: "Patient name", dob: "Date of birth", prescriber: "Prescriber", brand: "Brand", drug: "Generic", strength: "Strength", qty: "Quantity", refills: "Refills", daysSupply: "Days supply", daw: "DAW code", directions: "Directions" };

/* ---------- Mode 10: Verify Bench ---------- */
function VerifyBench({ level, onFinish, onQuit }) {
  const [cases] = useState(() => shuffle(VBENCH.filter((c) => c.level <= level)).slice(0, 8));
  const [idx, setIdx] = useState(0);
  const [pick, setPick] = useState(undefined);
  const [locked, setLocked] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [overrideCode, setOverrideCode] = useState("");
  const [overrideError, setOverrideError] = useState("");
  const [shift] = useState(() => SHIFT_CONTEXTS[Math.floor(Math.random() * SHIFT_CONTEXTS.length)]);

  if (!cases.length) return <Empty onQuit={onQuit} />;
  const c = cases[idx];
  const overrideRequired = !!c.durOverride;
  const hand = { fontFamily: "'Caveat', cursive", fontSize: 19, color: "#2a2a33", lineHeight: 1.1 };

  function choose(key) {
    if (locked) return;
    setPick(key); setLocked(true);
    const right = key === "__verify__" ? c.errorField === null : key === c.errorField;
    if (right) {
      setScore((s) => s + 100 + streak * 25);
      const ns = streak + 1; setStreak(ns); setBest((b) => Math.max(b, ns));
      setCorrect((x) => x + 1);
    } else setStreak(0);
  }
  function next() {
    if (idx + 1 >= cases.length) {
      onFinish({ mode: 1, score, correct, total: cases.length, bestStreak: best, outOfLives: false });
      return;
    }
    setIdx(idx + 1); setPick(undefined); setLocked(false); setOverrideOpen(false); setOverrideCode(""); setOverrideError("");
  }
  function submitOverride() {
    if (!overrideRequired || locked) return;
    if (overrideCode.trim().toUpperCase() !== c.durOverride.code) {
      setOverrideError("Code rejected. Enter the documented intervention code to release the DUR lock.");
      return;
    }
    setOverrideOpen(false); setOverrideError(""); choose("__verify__");
  }

  // Tappable field cell — styled like a POS data cell
  function F({ k, value }) {
    const isErr = c.errorField === k;
    const picked = pick === k;
    let bg = "#F0F5F8", border = "#C8D8E0", color = "#1A2A34";
    if (!locked) { bg = "#EBF3F8"; border = "#6BA3BC"; }
    if (locked) {
      if (isErr)   { bg = "#FFF3CD"; border = "#C0781E"; color = "#7A4400"; }
      else if (picked) { bg = "#FDECEA"; border = "#B23A24"; color = "#7A1A0A"; }
      else         { bg = "#F0F5F8"; border = "#C8D8E0"; }
    }
    return (
      <button disabled={locked} onClick={() => choose(k)} className="opt"
        style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: 5, padding: "3px 8px",
          cursor: locked ? "default" : "pointer", fontSize: 13.5, color, fontWeight: 600,
          textAlign: "left", lineHeight: 1.3, fontFamily: "'Spline Sans Mono', monospace",
          transition: "background .15s, border-color .15s" }}>
        {value}
      </button>
    );
  }

  const SysRow = ({ label, children }) => (
    <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 6, minHeight: 28 }}>
      <span style={{ minWidth: 80, fontSize: 10, color: "#6A8A9C", fontWeight: 700, letterSpacing: 0.4, fontFamily: "'Spline Sans Mono', monospace", textTransform: "uppercase" }}>{label}</span>
      <span>{children}</span>
    </div>
  );
  const SysSection = ({ label, children }) => (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 9.5, color: "#4A7A94", fontWeight: 700, letterSpacing: 1, fontFamily: "'Spline Sans Mono', monospace", textTransform: "uppercase", marginBottom: 5, paddingBottom: 3, borderBottom: "1px solid #D0E4EC" }}>{label}</div>
      {children}
    </div>
  );

  const isRight = pick !== undefined && (pick === "__verify__" ? c.errorField === null : pick === c.errorField);

  return (
    <div className="rise">
      {/* Shift banner */}
      <div style={{
        background: "#0B1F3A", color: "#7EB8C9", borderRadius: 10,
        padding: "7px 13px", marginBottom: 10,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        fontFamily: "'Spline Sans Mono', monospace", fontSize: 10.5, gap: 8,
      }}>
        <span style={{ whiteSpace: "nowrap", opacity: 0.75 }}>● {shift.time}</span>
        <span style={{ flex: 1, textAlign: "center", opacity: 0.85, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{shift.banner}</span>
        <span style={{ color: "rgba(126,184,201,0.6)", whiteSpace: "nowrap" }}>QV2 BENCH</span>
      </div>

      {/* QV2 workstation header */}
      <div style={{
        background: "#0B1F3A", borderRadius: 10, padding: "8px 14px", marginBottom: 10,
        display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center",
        fontFamily: "'Spline Sans Mono', monospace", fontSize: 10.5,
      }}>
        <span style={{ color: "#7EB8C9", fontWeight: 700, letterSpacing: 0.5 }}>QV2 VERIFICATION BENCH</span>
        <span style={{ color: "rgba(126,184,201,0.45)", textAlign: "center" }}>STATION 1</span>
        <span style={{ color: "#7EB8C9", textAlign: "right", opacity: 0.75 }}>Rx {idx + 1}/{cases.length} · {correct} verified</span>
      </div>

      <ProgressBar value={(idx / cases.length) * 100} />

      {/* DUR lock — red alert banner style */}
      {overrideRequired && (
        <div className="pop" style={{
          background: "#3A0808", borderRadius: 10, margin: "10px 0",
          padding: "10px 14px", border: "1.5px solid #FF6B6B",
          display: "flex", alignItems: "flex-start", gap: 10,
        }}>
          <span style={{ fontSize: 16, lineHeight: 1 }}>⚠</span>
          <div style={{ flex: 1, fontFamily: "'Spline Sans Mono', monospace" }}>
            <div style={{ color: "#FF6B6B", fontWeight: 700, fontSize: 11, letterSpacing: 0.8 }}>[DUR-LOCK] {c.durOverride.title}</div>
            <div style={{ color: "#FFCFC0", fontSize: 11, marginTop: 2 }}>{c.durOverride.profile}</div>
            <div style={{ color: "rgba(255,207,192,0.75)", fontSize: 10.5, marginTop: 2 }}>{c.durOverride.detail}</div>
            <div style={{ color: "rgba(255,107,107,0.55)", fontSize: 10, marginTop: 4 }}>Standard verification disabled — pharmacist DUR override required</div>
          </div>
        </div>
      )}

      {/* Instruction strip */}
      <div style={{
        background: "#EBF5F0", border: "1px solid #B0D4C4", borderRadius: 8,
        padding: "7px 12px", marginBottom: 10,
        fontFamily: "'Spline Sans Mono', monospace", fontSize: 11, color: "#1F4A3F",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <span>▸</span>
        <span><strong>Compare entry to hard copy.</strong> Tap the miskeyed field — or approve if everything checks out.</span>
      </div>

      {/* Main split: System Entry + Hard Copy */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-start" }}>

        {/* LEFT — System Entry (computer screen look) */}
        <div style={{ flex: "1 1 220px", minWidth: 0, borderRadius: 10, overflow: "hidden", border: "1.5px solid #3A6A84" }}>
          <div style={{ background: "#1A3A4A", padding: "7px 12px", fontFamily: "'Spline Sans Mono', monospace", fontSize: 10, fontWeight: 700, color: "#7EB8C9", letterSpacing: 0.8, display: "flex", justifyContent: "space-between" }}>
            <span>▸ SYSTEM ENTRY (QT TYPED)</span>
            <span style={{ opacity: 0.5 }}>PDX</span>
          </div>
          <div style={{ background: "#F2F8FC", padding: "12px 14px" }}>
            <SysSection label="Patient">
              <SysRow label="Name"><F k="patient" value={c.patient} /></SysRow>
              <SysRow label="DOB"><F k="dob" value={c.dob} /></SysRow>
              <SysRow label="Age/Sex"><span style={{ fontSize: 13, color: "#1A2A34", fontFamily: "monospace" }}>{c.age} · {c.sex}</span></SysRow>
            </SysSection>
            <SysSection label="Prescriber">
              <SysRow label="Name"><F k="prescriber" value={c.prescriber} /></SysRow>
              <div style={{ fontSize: 10.5, color: "#6A8A9C", fontFamily: "monospace", paddingLeft: 86 }}>{c.prescriberAddr}</div>
            </SysSection>
            <SysSection label="Product">
              <SysRow label="Brand"><F k="brand" value={c.brand} /></SysRow>
              <SysRow label="Generic"><F k="drug" value={c.generic} /></SysRow>
              <SysRow label="Strength"><F k="strength" value={c.strength} /></SysRow>
              <SysRow label="Mfr"><span style={{ fontSize: 12, color: "#6A8A9C", fontFamily: "monospace" }}>{c.manufacturer}</span></SysRow>
            </SysSection>
            <SysSection label="Fill Details">
              <SysRow label="Written"><span style={{ fontSize: 13, fontFamily: "monospace", color: "#1A2A34" }}>{c.writtenDate}</span></SysRow>
              <SysRow label="Qty"><F k="qty" value={c.qty} /></SysRow>
              <SysRow label="Refills"><F k="refills" value={c.refills} /></SysRow>
              <SysRow label="Day Sply"><F k="daysSupply" value={c.daysSupply} /></SysRow>
              <SysRow label="DAW"><F k="daw" value={c.dawCode} /></SysRow>
              <div style={{ marginTop: 4 }}>
                <div style={{ fontSize: 9.5, color: "#4A7A94", fontWeight: 700, letterSpacing: 0.8, fontFamily: "monospace", textTransform: "uppercase", marginBottom: 4 }}>Directions</div>
                <F k="directions" value={c.directions} />
              </div>
            </SysSection>
          </div>
        </div>

        {/* RIGHT — Original Hard Copy (paper look) */}
        <div style={{ flex: "1 1 220px", minWidth: 0, borderRadius: 10, overflow: "hidden", border: "1.5px solid #5A4A1A" }}>
          <div style={{ background: "#2A2010", padding: "7px 12px", fontFamily: "'Spline Sans Mono', monospace", fontSize: 10, fontWeight: 700, color: "#D4C080", letterSpacing: 0.8, display: "flex", justifyContent: "space-between" }}>
            <span>▸ ORIGINAL HARD COPY</span>
            <span style={{ opacity: 0.5 }}>READ ONLY</span>
          </div>
          <div style={{ background: "#FFFEF5", padding: 0 }}>
            <div style={{ padding: "12px 16px 10px", textAlign: "center", borderBottom: "2px solid #2a2a33", background: "#FDFBEA" }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#2a2a33" }}>{c.prescriber}</div>
              <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>{c.prescriberAddr}</div>
            </div>
            <div style={{ padding: "12px 16px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 9.5, color: "#888", fontFamily: "monospace", textTransform: "uppercase" }}>Patient</div>
                  <div style={hand}>{c.orig.patient}</div>
                  <div style={{ ...hand, fontSize: 15 }}>{c.orig.dob}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 9.5, color: "#888", fontFamily: "monospace", textTransform: "uppercase" }}>Date</div>
                  <div style={hand}>{c.orig.date}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{ fontFamily: "'Fraunces',serif", fontSize: 32, fontWeight: 900, color: "#2a2a33", lineHeight: 0.9 }}>℞</div>
                <div style={{ flex: 1, paddingTop: 4 }}>
                  <div style={{ ...hand, fontSize: 21, marginBottom: 8 }}>{c.orig.drug} {c.orig.strength}</div>
                  <div style={{ marginBottom: 4 }}><span style={{ fontSize: 11.5, color: "#666", fontWeight: 600 }}>Disp: </span><span style={hand}>{c.orig.disp}</span></div>
                  <div style={{ marginBottom: 4 }}><span style={{ fontSize: 11.5, color: "#666", fontWeight: 600 }}>Sig: </span><span style={hand}>{c.orig.sig}</span></div>
                  <div><span style={{ fontSize: 11.5, color: "#666", fontWeight: 600 }}>Refills: </span><span style={hand}>{c.orig.refills}</span></div>
                </div>
              </div>
              <div style={{ marginTop: 12, fontSize: 12, color: "#444" }}>
                <div style={{ marginBottom: 2 }}>{c.orig.dawChecked ? "☑" : "☐"} Dispense As Written</div>
                <div>{c.orig.dawChecked ? "☐" : "☑"} Generic Substitution Permissible</div>
              </div>
              <div style={{ marginTop: 10, borderTop: "1px solid #CCC", paddingTop: 6, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: 10, color: "#888", fontFamily: "monospace" }}>MD SIGNATURE</span>
                <span style={{ ...hand, fontSize: 19 }}>{c.prescriber.replace(", MD", "")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Approve button */}
      {!locked && !overrideRequired && (
        <button onClick={() => choose("__verify__")}
          style={btn(C.green, "#fff", { width: "100%", marginTop: 12 })}>
          ✓ APPROVE — Entry matches hard copy
        </button>
      )}

      {!locked && overrideRequired && (
        <>
          <button disabled style={btn(C.paper2, C.muted, { width: "100%", marginTop: 12, border: `1px solid ${C.line}`, cursor: "not-allowed" })}>
            APPROVE disabled — DUR intervention required
          </button>
          <button onClick={() => { setOverrideOpen(true); setOverrideCode(""); setOverrideError(""); }}
            style={btn(C.clay, "#fff", { width: "100%", marginTop: 8 })}>
            ⚠ Pharmacist DUR Override
          </button>
        </>
      )}

      {locked && (
        <>
          <div className="pop" style={{ marginTop: 14, padding: "13px 15px", borderRadius: 13,
            background: (pick === "__verify__" ? c.errorField === null : pick === c.errorField) ? "rgba(46,139,87,0.10)" : "rgba(178,58,36,0.08)",
            border: `1px solid ${(pick === "__verify__" ? c.errorField === null : pick === c.errorField) ? C.green : C.clay}` }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4,
              color: (pick === "__verify__" ? c.errorField === null : pick === c.errorField) ? C.green : C.clay }}>
              {(pick === "__verify__" ? c.errorField === null : pick === c.errorField)
                ? (c.errorField === null ? "✓ Correctly verified" : `✓ Caught it — ${VFIELD_LABELS[c.errorField]}`)
                : (c.errorField === null ? "✕ This one was actually clean" : `✕ The discrepancy was the ${VFIELD_LABELS[c.errorField]}`)}
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.5 }}>{c.note}</div>
          </div>
          <button onClick={next} style={btn(C.pine, C.paper, { width: "100%", marginTop: 12 })}>
            {idx + 1 >= cases.length ? "Finish set" : "Next prescription →"}
          </button>
        </>
      )}

      {overrideOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(20,28,24,0.58)", display: "grid", placeItems: "center", padding: 18 }}>
          <div className="rx-card pop" style={{ width: "min(480px, 100%)", padding: 20, border: `2px solid ${C.clay}`, background: C.card }}>
            <div className="mono" style={{ fontSize: 10.5, letterSpacing: 1, textTransform: "uppercase", color: C.clay, marginBottom: 8 }}>Locked manager override</div>
            <div className="display" style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Clinical DUR Intervention</div>
            <p style={{ margin: "0 0 12px", fontSize: 13.5, lineHeight: 1.5, color: C.muted }}>
              Standard approval is blocked. Document the intervention, then enter the release code to force this Rx through.
            </p>
            <div className="rx-card" style={{ padding: 12, background: "rgba(178,58,36,0.07)", marginBottom: 12 }}>
              <div style={{ fontWeight: 800, fontSize: 14 }}>{c.durOverride.title}</div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 3 }}>{c.durOverride.detail}</div>
            </div>
            <div className="mono" style={{ fontSize: 10.5, letterSpacing: 0.5, textTransform: "uppercase", color: C.muted, marginBottom: 5 }}>Intervention code</div>
            <input value={overrideCode} onChange={(e) => { setOverrideCode(e.target.value.toUpperCase()); setOverrideError(""); }}
              placeholder="Type M01"
              style={{ padding: "12px 14px", borderRadius: 10, border: `1.5px solid ${overrideError ? C.clay : C.line}`, width: "100%", fontSize: 18, fontFamily: "'Spline Sans Mono', monospace", color: C.ink, background: C.card, outline: "none" }} />
            {overrideError && <div style={{ color: C.clay, fontSize: 12.5, marginTop: 6 }}>{overrideError}</div>}
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button onClick={() => setOverrideOpen(false)}
                style={btn("transparent", C.pine, { border: `1px solid ${C.line}`, flex: 1 })}>
                Cancel
              </button>
              <button onClick={submitOverride}
                style={btn(C.clay, "#fff", { flex: 1, background: C.clay })}>
                Force through
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   DATA ENTRY  (Mode 11) — key the Rx in from the hard copy
   Type the sig (with a live system-style expander), enter quantity,
   compute days supply, set refills and DAW — like intake at the counter.
   ============================================================ */
function expandSig(s) {
  if (!s || !s.trim()) return "";
  let t = " " + s.toLowerCase().replace(/[.,;]/g, " ").replace(/\s+/g, " ") + " ";
  const map = [
    [/\bdaily\b/g, " once daily "],
    [/\bx\s*(\d+)\s*d(ays?)?\b/g, " for $1 days "],
    [/\bq\s*(\d+)\s*h\b/g, " every $1 hours "],
    [/\bbid\b/g, " twice daily "], [/\btid\b/g, " three times daily "], [/\bqid\b/g, " four times daily "],
    [/\bqhs\b/g, " at bedtime "], [/\bhs\b/g, " at bedtime "], [/\bqd\b/g, " once daily "],
    [/\bqam\b/g, " every morning "], [/\bqpm\b/g, " every evening "],
    [/\bprn\b/g, " as needed "], [/\bpo\b/g, " by mouth "], [/\bsl\b/g, " under the tongue "],
    [/\bsc\b/g, " subcutaneously "], [/\bsq\b/g, " subcutaneously "], [/\bsubq\b/g, " subcutaneously "],
    [/\btabs?\b/g, " tablet "], [/\bcaps?\b/g, " capsule "], [/\bgtts?\b/g, " drops "],
    [/\bou\b/g, " in both eyes "], [/\bod\b/g, " in the right eye "], [/\bos\b/g, " in the left eye "],
    [/\bau\b/g, " in both ears "], [/\bac\b/g, " before meals "], [/\bpc\b/g, " after meals "],
    [/\bunits?\b/g, " units "], [/\bpuffs?\b/g, " puffs "],
  ];
  map.forEach(([re, rep]) => { t = t.replace(re, rep); });
  t = t.replace(/\s+/g, " ").trim();
  if (/^\d/.test(t) || /^(tablet|capsule|puff)/.test(t)) t = "take " + t;
  return t.toUpperCase();
}
function dirOK(concepts, typed) {
  const n = normSig(typed);
  return concepts.every((g) => g.some((tok) => n.includes(tok)));
}

const INTAKE = [
  {
    level: 1, drug: "verapamil", strength: "40 mg", prescriber: "Jeremy Roberts, MD", prescriberAddr: "2850 Country Club Rd, Laredo, TX",
    orig: { patient: "Roland Reid", dob: "12/26/86", date: "4/9/22", drug: "verapamil", strength: "40 mg", disp: "60", sig: "1 tab po BID", refills: "7", dawChecked: false },
    ans: { qtyAccept: ["60"], days: "30", refills: "7", daw: "0" },
    dirConcepts: [["1", "one"], ["by mouth", "oral"], ["twice", "two times", "2 times"]],
    dirModel: "Take 1 tablet by mouth twice daily.",
    note: "Days supply = quantity ÷ doses per day = 60 ÷ 2 = 30. The DAW box says substitution permissible, so DAW 0.",
  },
  {
    level: 2, drug: "amoxicillin", strength: "500 mg", prescriber: "Priya Nair, MD", prescriberAddr: "300 Elm St, Dayton, OH",
    orig: { patient: "Marcus Hale", dob: "8/1/90", date: "5/20/25", drug: "amoxicillin", strength: "500 mg", disp: "30", sig: "1 cap po TID x10d", refills: "0", dawChecked: false },
    ans: { qtyAccept: ["30"], days: "10", refills: "0", daw: "0" },
    dirConcepts: [["1", "one"], ["by mouth", "oral"], ["three times", "3 times"], ["10 day", "ten day"]],
    dirModel: "Take 1 capsule by mouth three times daily for 10 days.",
    note: "1 cap TID for 10 days = 30 capsules; days supply 10. Antibiotics are usually no-refill courses.",
  },
  {
    level: 1, drug: "lisinopril", strength: "10 mg", prescriber: "Sam Okafor, MD", prescriberAddr: "88 Health Pkwy, Dayton, OH",
    orig: { patient: "Ethel Brooks", dob: "11/9/48", date: "4/18/25", drug: "lisinopril", strength: "10 mg", disp: "30", sig: "1 tab po daily", refills: "11", dawChecked: false },
    ans: { qtyAccept: ["30"], days: "30", refills: "11", daw: "0" },
    dirConcepts: [["1", "one"], ["by mouth", "oral"], ["once daily", "daily", "once a day"]],
    dirModel: "Take 1 tablet by mouth once daily.",
    note: "30 tabs once daily = 30-day supply. Chronic maintenance meds often carry the max refills (11 + original = 1 year).",
  },
  {
    level: 2, drug: "metformin", strength: "500 mg", prescriber: "Alan Frost, MD", prescriberAddr: "19 Mercy Blvd, Dayton, OH",
    orig: { patient: "Donna Pierce", dob: "3/14/59", date: "5/2/25", drug: "metformin", strength: "500 mg", disp: "60", sig: "1 tab po BID with food", refills: "5", dawChecked: false },
    ans: { qtyAccept: ["60"], days: "30", refills: "5", daw: "0" },
    dirConcepts: [["1", "one"], ["by mouth", "oral"], ["twice", "2 times"], ["with food", "with meals", "with a meal"]],
    dirModel: "Take 1 tablet by mouth twice daily with food.",
    note: "Carry the 'with food' instruction over — it reduces metformin's GI upset. 60 ÷ 2 = 30 days.",
  },
  {
    level: 2, drug: "atorvastatin", strength: "40 mg", prescriber: "Lena Cho, MD", prescriberAddr: "44 Center Ave, Dayton, OH",
    orig: { patient: "Tyrone Banks", dob: "7/22/72", date: "3/30/25", drug: "atorvastatin", strength: "40 mg", disp: "90", sig: "1 tab po qHS", refills: "3", dawChecked: false },
    ans: { qtyAccept: ["90"], days: "90", refills: "3", daw: "0" },
    dirConcepts: [["1", "one"], ["by mouth", "oral"], ["bedtime"]],
    dirModel: "Take 1 tablet by mouth at bedtime.",
    note: "qHS = at bedtime. 90 tabs once daily = 90-day supply.",
  },
  {
    level: 3, drug: "amoxicillin", strength: "250 mg/5 mL", prescriber: "Nadia Salem, MD", prescriberAddr: "501 Vine St, Dayton, OH",
    orig: { patient: "Baby Cruz", dob: "1/5/24", date: "5/12/25", drug: "amoxicillin susp", strength: "250 mg/5 mL", disp: "150 mL", sig: "5 mL po TID x10d", refills: "0", dawChecked: false },
    ans: { qtyAccept: ["150", "150 ml", "150ml"], days: "10", refills: "0", daw: "0" },
    dirConcepts: [["5 ml"], ["by mouth", "oral"], ["three times", "3 times"], ["10 day", "ten day"]],
    dirModel: "Take 5 mL by mouth three times daily for 10 days.",
    note: "Liquid days supply = total volume ÷ daily volume = 150 ÷ (5 × 3) = 10 days. Enter quantity in mL.",
  },
  {
    level: 2, drug: "prednisone", strength: "10 mg", prescriber: "Owen Pratt, MD", prescriberAddr: "62 Spring St, Dayton, OH",
    orig: { patient: "Bianca Flores", dob: "9/30/86", date: "4/25/25", drug: "prednisone", strength: "10 mg", disp: "10", sig: "2 tabs po daily x5d", refills: "0", dawChecked: false },
    ans: { qtyAccept: ["10"], days: "5", refills: "0", daw: "0" },
    dirConcepts: [["2", "two"], ["by mouth", "oral"], ["once daily", "daily"], ["5 day", "five day"]],
    dirModel: "Take 2 tablets by mouth once daily for 5 days.",
    note: "2 tabs/day × 5 days = 10 tablets, days supply 5. Watch the amount — it's 2 tablets, not 1.",
  },
  {
    level: 3, drug: "levothyroxine", strength: "100 mcg", prescriber: "David Mercer, MD", prescriberAddr: "12 Thyroid Way, Dayton, OH",
    orig: { patient: "Grace Lindqvist", dob: "2/17/68", date: "5/1/25", drug: "levothyroxine (Synthroid)", strength: "100 mcg", disp: "90", sig: "1 tab po daily ac breakfast", refills: "3", dawChecked: true },
    ans: { qtyAccept: ["90"], days: "90", refills: "3", daw: "1" },
    dirConcepts: [["1", "one"], ["by mouth", "oral"], ["once daily", "daily"], ["before breakfast", "before meals", "empty stomach", "ac breakfast"]],
    dirModel: "Take 1 tablet by mouth once daily before breakfast.",
    note: "The 'Dispense As Written' box is checked → DAW 1 (brand necessary). Carry the 'before breakfast' timing — it matters for absorption.",
  },
  {
    level: 2, drug: "gabapentin", strength: "300 mg", prescriber: "Raj Patel, MD", prescriberAddr: "210 Care Dr, Dayton, OH",
    orig: { patient: "Helen Ortiz", dob: "4/28/52", date: "5/6/25", drug: "gabapentin", strength: "300 mg", disp: "90", sig: "1 cap po TID", refills: "5", dawChecked: false },
    ans: { qtyAccept: ["90"], days: "30", refills: "5", daw: "0" },
    dirConcepts: [["1", "one"], ["by mouth", "oral"], ["three times", "3 times"]],
    dirModel: "Take 1 capsule by mouth three times daily.",
    note: "90 caps ÷ 3 per day = 30 days.",
  },
  {
    level: 3, drug: "omeprazole", strength: "20 mg", prescriber: "Iris Tan, MD", prescriberAddr: "9 Summit Ave, Dayton, OH",
    orig: { patient: "Walter Munoz", dob: "1/14/61", date: "5/8/25", drug: "omeprazole", strength: "20 mg", disp: "30", sig: "1 cap po daily ac breakfast", refills: "2", dawChecked: false },
    ans: { qtyAccept: ["30"], days: "30", refills: "2", daw: "0" },
    dirConcepts: [["1", "one"], ["by mouth", "oral"], ["once daily", "daily"], ["before breakfast", "before meals", "empty stomach", "ac breakfast"]],
    dirModel: "Take 1 capsule by mouth once daily before breakfast.",
    note: "PPIs work best taken 30–60 min before a meal — carry that over from the sig.",
  },
  {
    level: 4, drug: "warfarin", strength: "5 mg", prescriber: "Tara Wells, MD", prescriberAddr: "14 Bayview Ave, Dayton, OH",
    orig: { patient: "Derek Foss", dob: "5/19/83", date: "5/11/25", drug: "warfarin (Coumadin)", strength: "5 mg", disp: "30", sig: "1 tab po daily", refills: "3", dawChecked: true },
    ans: { qtyAccept: ["30"], days: "30", refills: "3", daw: "1" },
    dirConcepts: [["1", "one"], ["by mouth", "oral"], ["once daily", "daily"]],
    dirModel: "Take 1 tablet by mouth once daily.",
    note: "DAW box is checked → DAW 1. Warfarin is narrow-therapeutic-index, so a brand request is clinically meaningful.",
  },
  {
    level: 1, drug: "amlodipine", strength: "5 mg", prescriber: "Mona Adler, MD", prescriberAddr: "8 Clinic Ct, Dayton, OH",
    orig: { patient: "Carl Whitman", dob: "12/11/70", date: "5/19/25", drug: "amlodipine", strength: "5 mg", disp: "30", sig: "1 tab po daily", refills: "5", dawChecked: false },
    ans: { qtyAccept: ["30"], days: "30", refills: "5", daw: "0" },
    dirConcepts: [["1", "one"], ["by mouth", "oral"], ["once daily", "daily"]],
    dirModel: "Take 1 tablet by mouth once daily.",
    note: "Straightforward maintenance entry — 30 once daily = 30 days, substitution permissible (DAW 0).",
  },
];

function intakeQueueCase(c, i) {
  return {
    ...c,
    id: c.id || `intake-${i}-${c.orig.patient}-${c.orig.drug}`,
    waiter: i === 0 || c.level >= 3,
    source: c.source || "bank",
  };
}

function emptyManualRx() {
  return {
    patient: "",
    dob: "",
    drug: "",
    strength: "",
    sig: "",
    qty: "",
    days: "",
    refills: "0",
    daw: "0",
    prescriber: "",
    position: "1",
    waiter: true,
  };
}

function manualDirConcepts(sig) {
  const synonyms = {
    "1": ["1", "one"],
    "2": ["2", "two"],
    "3": ["3", "three"],
    "4": ["4", "four"],
    tablet: ["tablet", "tab"],
    capsule: ["capsule", "cap"],
    ml: ["ml", "milliliter"],
  };
  return normSig(sig).trim().split(/\s+/).filter(Boolean).map((word) => synonyms[word] || [word]);
}

function makeManualIntakeCase(form, serial) {
  const today = new Date().toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "2-digit" });
  const patient = form.patient.trim() || "Manual Waiter";
  const dob = form.dob.trim() || "1/1/80";
  const drug = form.drug.trim() || "custom medication";
  const strength = form.strength.trim() || "custom strength";
  const sig = form.sig.trim() || "1 tab po daily";
  const qty = form.qty.trim() || "30";
  const days = form.days.trim() || "30";
  const refills = form.refills.trim() || "0";
  const daw = form.daw || "0";
  const prescriber = form.prescriber.trim() || "Manager Added, MD";
  const qtyLower = qty.toLowerCase();

  return {
    id: `manual-${Date.now()}-${serial}`,
    level: 1,
    manual: true,
    waiter: !!form.waiter,
    source: "manual",
    drug,
    strength,
    prescriber,
    prescriberAddr: "Manual queue insert",
    orig: { patient, dob, date: today, drug, strength, disp: qty, sig, refills, dawChecked: daw === "1" },
    ans: { qtyAccept: Array.from(new Set([qtyLower, qtyLower.replace(/\s+/g, "")])), days, refills, daw },
    dirConcepts: manualDirConcepts(sig),
    dirModel: expandSig(sig) || sig,
    note: `Manual queue Rx for ${patient}. Match the custom hard copy values you inserted, then send it to verification.`,
  };
}

/* ---------- Mode 11: Data Entry ---------- */
function IntakeBench({ level, onFinish, onQuit }) {
  const [queue, setQueue] = useState(() => shuffle(INTAKE.filter((c) => c.level <= level)).slice(0, 7).map(intakeQueueCase));
  const [completed, setCompleted] = useState(0);
  const [dragIndex, setDragIndex] = useState(null);
  const [manual, setManual] = useState(() => emptyManualRx());
  const [manualSerial, setManualSerial] = useState(1);
  const [dir, setDir] = useState("");
  const [qty, setQty] = useState("");
  const [days, setDays] = useState("");
  const [refl, setRefl] = useState("");
  const [daw, setDaw] = useState(null);
  const [locked, setLocked] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [correct, setCorrect] = useState(0);

  if (!queue.length) return <Empty onQuit={onQuit} />;
  const c = queue[0];
  const expanded = expandSig(dir);
  const hand = { fontFamily: "'Caveat', cursive", color: "#2a2a33", lineHeight: 1.1 };
  const checks = locked ? {
    dir: dirOK(c.dirConcepts, dir),
    qty: c.ans.qtyAccept.includes(qty.trim().toLowerCase()),
    days: days.trim() === c.ans.days,
    refl: refl.trim() === c.ans.refills,
    daw: daw === c.ans.daw,
  } : null;
  const allOK = checks && Object.values(checks).every(Boolean);
  const canSubmit = dir.trim() && qty.trim() && days.trim() && refl.trim() && daw != null;
  const totalInPlay = completed + queue.length;
  const manualReady = manual.drug.trim() && manual.sig.trim() && manual.qty.trim() && manual.days.trim();

  function resetEntry() {
    setDir(""); setQty(""); setDays(""); setRefl(""); setDaw(null); setLocked(false);
  }

  function moveQueueItem(from, to) {
    if (locked || from == null || to == null || from === to || from < 0 || to < 0) return;
    setQueue((q) => {
      if (from >= q.length || to >= q.length) return q;
      const next = [...q];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
    resetEntry();
  }

  function insertManualRx() {
    if (!manualReady || locked) return;
    const rx = makeManualIntakeCase(manual, manualSerial);
    const pos = Math.max(0, Math.min(queue.length, Number(manual.position || 1) - 1));
    setQueue((q) => {
      const next = [...q];
      next.splice(pos, 0, rx);
      return next;
    });
    setManualSerial((n) => n + 1);
    setManual(emptyManualRx());
    resetEntry();
  }

  function submit() {
    if (locked || !canSubmit) return;
    setLocked(true);
    const ok = dirOK(c.dirConcepts, dir) && c.ans.qtyAccept.includes(qty.trim().toLowerCase())
      && days.trim() === c.ans.days && refl.trim() === c.ans.refills && daw === c.ans.daw;
    if (ok) { setScore((s) => s + 100 + streak * 25); const ns = streak + 1; setStreak(ns); setBest((b) => Math.max(b, ns)); setCorrect((x) => x + 1); }
    else setStreak(0);
  }
  function next() {
    const nextCompleted = completed + 1;
    if (queue.length <= 1) {
      onFinish({ mode: 1, score, correct, total: nextCompleted, bestStreak: best, outOfLives: false });
      return;
    }
    setCompleted(nextCompleted);
    setQueue((q) => q.slice(1));
    resetEntry();
  }

  const inp = (bad) => ({ padding: "10px 12px", borderRadius: 10, fontSize: 15, width: "100%", minWidth: 0,
    border: `1.5px solid ${locked ? (bad ? C.clay : C.green) : C.line}`, background: C.card, color: C.ink,
    fontFamily: "'Spline Sans', sans-serif", outline: "none" });
  const NumField = ({ label, val, set, bad, correctVal }) => (
    <div>
      <div className="mono" style={{ fontSize: 10.5, letterSpacing: 0.5, textTransform: "uppercase", color: C.muted, marginBottom: 5 }}>{label}</div>
      <input inputMode="numeric" value={val} disabled={locked} onChange={(e) => set(e.target.value)} style={inp(bad)} />
      {locked && bad && <div style={{ fontSize: 11.5, color: C.clay, marginTop: 3 }}>→ {correctVal}</div>}
    </div>
  );

  return (
    <div className="rise">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 16 }}>
          <Stat label="Score" value={score} color={C.pine} />
          <Stat label="Streak" value={`×${streak}`} color={C.amber} />
        </div>
        <span className="mono" style={{ fontSize: 12, color: C.muted }}>Done {completed} / {totalInPlay}</span>
      </div>
      <ProgressBar value={(completed / Math.max(totalInPlay, 1)) * 100} />

      <p style={{ fontSize: 14, color: C.muted, margin: "14px 0 12px", lineHeight: 1.5 }}>
        Read the hard copy and <strong style={{ color: C.ink }}>key the prescription in</strong> — type the sig (shorthand is fine), enter the quantity, work out the days supply, and set refills and DAW.
      </p>

      <div className="rx-card" style={{ padding: 16, marginBottom: 14, background: "rgba(31,74,63,0.04)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 10 }}>
          <div>
            <div className="display" style={{ fontSize: 17, fontWeight: 900 }}>Manual Queue Triage</div>
            <div className="mono" style={{ fontSize: 11, color: C.muted }}>Drag cards to reprioritize. Slot 1 is the active Rx.</div>
          </div>
          <span className="mono" style={{ fontSize: 11, color: C.amber }}>{queue.length} waiting</span>
        </div>

        <div style={{ display: "grid", gap: 8, marginBottom: 14 }}>
          {queue.map((rx, i) => (
            <div key={rx.id}
              draggable={!locked}
              onDragStart={() => setDragIndex(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => { moveQueueItem(dragIndex, i); setDragIndex(null); }}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
                padding: "10px 12px", borderRadius: 11,
                border: `1.5px solid ${i === 0 ? C.amber : C.line}`,
                background: i === 0 ? "rgba(192,120,30,0.12)" : C.card,
                cursor: locked ? "default" : "grab",
              }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span className="mono" style={{ fontSize: 10, color: i === 0 ? C.amber : C.muted }}>#{i + 1}</span>
                  {rx.waiter && <span className="mono" style={{ fontSize: 9.5, color: C.paper, background: C.clay, borderRadius: 20, padding: "2px 7px" }}>WAITER</span>}
                  {rx.manual && <span className="mono" style={{ fontSize: 9.5, color: C.paper, background: C.pine, borderRadius: 20, padding: "2px 7px" }}>CUSTOM</span>}
                  <strong style={{ fontSize: 13.5 }}>{rx.orig.patient}</strong>
                </div>
                <div style={{ fontSize: 12.5, color: C.muted, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {rx.orig.drug} {rx.orig.strength} · {rx.orig.sig}
                </div>
              </div>
              {i > 0 && !locked && (
                <button onClick={() => moveQueueItem(i, 0)}
                  style={btn("transparent", C.pine, { border: `1px solid ${C.line}`, padding: "7px 10px", fontSize: 12, borderRadius: 9 })}>
                  Rush
                </button>
              )}
            </div>
          ))}
        </div>

        <div style={{ borderTop: `1px solid ${C.line}`, paddingTop: 12 }}>
          <div className="mono" style={{ fontSize: 10.5, letterSpacing: 0.5, textTransform: "uppercase", color: C.muted, marginBottom: 8 }}>Insert custom Rx</div>
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr .7fr 1fr 1fr", gap: 8 }}>
            <input value={manual.patient} onChange={(e) => setManual((m) => ({ ...m, patient: e.target.value }))} placeholder="Patient"
              style={inp(false)} />
            <input value={manual.dob} onChange={(e) => setManual((m) => ({ ...m, dob: e.target.value }))} placeholder="DOB"
              style={inp(false)} />
            <input value={manual.drug} onChange={(e) => setManual((m) => ({ ...m, drug: e.target.value }))} placeholder="Drug"
              style={inp(false)} />
            <input value={manual.strength} onChange={(e) => setManual((m) => ({ ...m, strength: e.target.value }))} placeholder="Strength"
              style={inp(false)} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr .55fr .55fr .55fr .55fr", gap: 8, marginTop: 8 }}>
            <input value={manual.sig} onChange={(e) => setManual((m) => ({ ...m, sig: e.target.value }))} placeholder="Sig, e.g. 1 tab po bid"
              style={{ ...inp(false), fontFamily: "'Spline Sans Mono', monospace" }} />
            <input value={manual.qty} onChange={(e) => setManual((m) => ({ ...m, qty: e.target.value }))} placeholder="Qty"
              style={inp(false)} />
            <input value={manual.days} onChange={(e) => setManual((m) => ({ ...m, days: e.target.value }))} placeholder="Days"
              style={inp(false)} />
            <input value={manual.refills} onChange={(e) => setManual((m) => ({ ...m, refills: e.target.value }))} placeholder="Refills"
              style={inp(false)} />
            <input type="number" min="1" max={queue.length + 1} value={manual.position}
              onChange={(e) => setManual((m) => ({ ...m, position: e.target.value }))}
              style={inp(false)} />
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
            <select value={manual.daw} onChange={(e) => setManual((m) => ({ ...m, daw: e.target.value }))}
              style={{ ...inp(false), flex: "0 0 150px" }}>
              <option value="0">DAW 0</option>
              <option value="1">DAW 1</option>
              <option value="2">DAW 2</option>
            </select>
            <input value={manual.prescriber} onChange={(e) => setManual((m) => ({ ...m, prescriber: e.target.value }))} placeholder="Prescriber"
              style={{ ...inp(false), flex: 1 }} />
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: C.muted, whiteSpace: "nowrap" }}>
              <input type="checkbox" checked={manual.waiter} onChange={(e) => setManual((m) => ({ ...m, waiter: e.target.checked }))} />
              Waiter
            </label>
            <button onClick={insertManualRx} disabled={!manualReady || locked}
              style={btn(C.pine, C.paper, { padding: "10px 14px", fontSize: 13, borderRadius: 10, opacity: manualReady && !locked ? 1 : 0.45 })}>
              Insert
            </button>
          </div>
        </div>
      </div>

      {/* hard copy */}
      <div className="rx-card" style={{ padding: 0, overflow: "hidden", background: "#fffdf7", marginBottom: 14 }}>
        <div style={{ padding: "12px 16px 9px", textAlign: "center", borderBottom: "2px solid #2a2a33" }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#2a2a33" }}>{c.prescriber}</div>
          <div style={{ fontSize: 11.5, color: "#666" }}>{c.prescriberAddr}</div>
        </div>
        <div style={{ padding: "12px 16px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <div><div style={{ fontSize: 10.5, color: "#888" }}>Patient</div><div style={{ ...hand, fontSize: 19 }}>{c.orig.patient}</div><div style={{ ...hand, fontSize: 15 }}>{c.orig.dob}</div></div>
            <div style={{ textAlign: "right" }}><div style={{ fontSize: 10.5, color: "#888" }}>Date</div><div style={{ ...hand, fontSize: 19 }}>{c.orig.date}</div></div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{ fontFamily: "'Fraunces',serif", fontSize: 32, fontWeight: 900, color: "#2a2a33", lineHeight: 0.9 }}>℞</div>
            <div style={{ flex: 1, paddingTop: 4 }}>
              <div style={{ ...hand, fontSize: 22, marginBottom: 7 }}>{c.orig.drug} {c.orig.strength}</div>
              <div style={{ marginBottom: 4 }}><span style={{ fontSize: 12.5, color: "#666", fontWeight: 600 }}>Disp: </span><span style={{ ...hand, fontSize: 19 }}>{c.orig.disp}</span></div>
              <div style={{ marginBottom: 4 }}><span style={{ fontSize: 12.5, color: "#666", fontWeight: 600 }}>Sig: </span><span style={{ ...hand, fontSize: 19 }}>{c.orig.sig}</span></div>
              <div><span style={{ fontSize: 12.5, color: "#666", fontWeight: 600 }}>Refills: </span><span style={{ ...hand, fontSize: 19 }}>{c.orig.refills}</span></div>
            </div>
          </div>
          <div style={{ marginTop: 12, fontSize: 12.5, color: "#444" }}>
            <span>{c.orig.dawChecked ? "☑" : "☐"} Dispense As Written&nbsp;&nbsp;</span>
            <span>{c.orig.dawChecked ? "☐" : "☑"} Substitution Permissible</span>
          </div>
        </div>
      </div>

      {/* entry form */}
      <div className="rx-card" style={{ padding: 16 }}>
        <div className="display" style={{ fontSize: 16, fontWeight: 900, marginBottom: 4 }}>New Rx — Data Entry</div>
        <div className="mono" style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>{c.drug} {c.strength} <span style={{ color: C.green }}>· NDC selected</span></div>

        <div className="mono" style={{ fontSize: 10.5, letterSpacing: 0.5, textTransform: "uppercase", color: C.muted, marginBottom: 5 }}>Directions (sig)</div>
        <input value={dir} disabled={locked} onChange={(e) => setDir(e.target.value)}
          placeholder="e.g. 1 tab po bid"
          style={{ ...inp(checks && !checks.dir), fontFamily: "'Spline Sans Mono', monospace" }} />
        {/* live expander */}
        <div style={{ marginTop: 8, padding: "9px 12px", borderRadius: 10, background: "rgba(31,74,63,0.05)", border: `1px dashed ${C.line}`, minHeight: 38 }}>
          <span className="mono" style={{ fontSize: 9.5, letterSpacing: 1, textTransform: "uppercase", color: C.amber }}>System preview </span>
          <span style={{ fontSize: 13.5, color: expanded ? C.ink : C.muted }}>{expanded || "directions will expand here as you type…"}</span>
        </div>
        {locked && (
          <div style={{ fontSize: 12, marginTop: 4, color: checks.dir ? C.green : C.clay }}>
            {checks.dir ? "✓ directions captured" : `→ ${c.dirModel}`}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 14 }}>
          <NumField label="Quantity" val={qty} set={setQty} bad={checks && !checks.qty} correctVal={c.ans.qtyAccept[0]} />
          <NumField label="Days supply" val={days} set={setDays} bad={checks && !checks.days} correctVal={c.ans.days} />
          <NumField label="Refills" val={refl} set={setRefl} bad={checks && !checks.refl} correctVal={c.ans.refills} />
        </div>

        <div style={{ marginTop: 14 }}>
          <div className="mono" style={{ fontSize: 10.5, letterSpacing: 0.5, textTransform: "uppercase", color: C.muted, marginBottom: 6 }}>DAW code</div>
          <div style={{ display: "flex", gap: 8 }}>
            {[["0", "0 · generic OK"], ["1", "1 · brand (Rx)"], ["2", "2 · brand (pt)"]].map(([v, lbl]) => {
              const sel = daw === v;
              let bg = "transparent", bd = C.line, col = C.ink;
              if (sel && !locked) { bg = C.pine; bd = C.pine; col = C.paper; }
              if (locked) { if (v === c.ans.daw) { bg = "rgba(46,139,87,0.16)"; bd = C.green; } else if (sel) { bg = "rgba(178,58,36,0.12)"; bd = C.clay; } }
              return (
                <button key={v} disabled={locked} onClick={() => setDaw(v)}
                  style={{ flex: 1, padding: "9px 4px", borderRadius: 10, border: `1.5px solid ${bd}`, background: bg, color: col,
                    cursor: locked ? "default" : "pointer", fontWeight: 600, fontSize: 12.5, fontFamily: "'Spline Sans', sans-serif" }}>
                  {lbl}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {locked && (
        <div className="pop rx-card" style={{ padding: "14px 16px", marginTop: 12,
          background: allOK ? "rgba(46,139,87,0.10)" : "rgba(192,120,30,0.10)", border: `1px solid ${allOK ? C.green : C.amber}` }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6, color: allOK ? C.green : C.amber }}>
            {allOK ? "✓ Entered correctly — ready to verify" : "Close — check the flagged fields"}
          </div>
          <div style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.5 }}>{c.note}</div>
        </div>
      )}

      {!locked ? (
        <button onClick={submit} disabled={!canSubmit}
          style={btn(C.pine, C.paper, { width: "100%", marginTop: 14, opacity: canSubmit ? 1 : 0.4 })}>
          Submit entry
        </button>
      ) : (
        <button onClick={next} style={btn(C.pine, C.paper, { width: "100%", marginTop: 12 })}>
          {queue.length <= 1 ? "Finish set" : "Next prescription →"}
        </button>
      )}
    </div>
  );
}

/* ============================================================
   FILL CHECK  (Mode 12) — verify the technician's completed fill
   Compare the tech's stock, count, vial pills, and label against
   the order + reference. Tap the error or approve the fill.
   ============================================================ */
const FILLCHECK = [
  {
    level: 1,
    rx: { patient: "Roland Reid", drug: "verapamil", strength: "80 mg", qty: "60", sig: "1 tab po BID" },
    ref: { pill: { color: "#e7d7a3", shape: "round", imprint: "V 80" } },
    fill: {
      stockDrug: "verapamil", stockStrength: "80 mg", stockNdc: "00591-0461",
      count: "60", pill: { color: "#e7d7a3", shape: "round", imprint: "V 80" },
      labelPatient: "Roland Reid", labelDrug: "verapamil 80 mg", labelSig: "take 1 tablet by mouth twice daily",
    },
    errorField: null, note: "Stock matches the order, count is right, the vial pills match the reference imprint, and the label is correct. Approve and move on.",
  },
  {
    level: 1,
    rx: { patient: "Ethel Brooks", drug: "lisinopril", strength: "10 mg", qty: "30", sig: "1 tab po daily" },
    ref: { pill: { color: "#f3a6a6", shape: "round", imprint: "L 10" } },
    fill: {
      stockDrug: "lisinopril", stockStrength: "20 mg", stockNdc: "68180-0518",
      count: "30", pill: { color: "#f7c873", shape: "round", imprint: "L 20" },
      labelPatient: "Ethel Brooks", labelDrug: "lisinopril 10 mg", labelSig: "take 1 tablet by mouth once daily",
    },
    errorField: "stock", note: "The order is lisinopril 10 mg, but the tech pulled the 20 mg stock bottle (and the vial pills are the 20 mg tablet). Wrong strength — reject and refill with the 10 mg.",
  },
  {
    level: 2,
    rx: { patient: "Marcus Hale", drug: "amoxicillin", strength: "500 mg", qty: "30", sig: "1 cap po TID x10d" },
    ref: { pill: { color: "#e0907a", shape: "capsule", imprint: "AMOX 500" } },
    fill: {
      stockDrug: "amoxicillin", stockStrength: "500 mg", stockNdc: "00093-4155",
      count: "20", pill: { color: "#e0907a", shape: "capsule", imprint: "AMOX 500" },
      labelPatient: "Marcus Hale", labelDrug: "amoxicillin 500 mg", labelSig: "take 1 capsule by mouth three times daily for 10 days",
    },
    errorField: "count", note: "The order is for 30 capsules (1 cap TID × 10 days), but only 20 were counted into the vial. Short count — recount to 30.",
  },
  {
    level: 2,
    rx: { patient: "Tyrone Banks", drug: "atorvastatin", strength: "20 mg", qty: "90", sig: "1 tab po qHS" },
    ref: { pill: { color: "#ffffff", shape: "oval", imprint: "ATV 20" } },
    fill: {
      stockDrug: "atorvastatin", stockStrength: "20 mg", stockNdc: "00071-0155",
      count: "90", pill: { color: "#f7c873", shape: "round", imprint: "439" },
      labelPatient: "Tyrone Banks", labelDrug: "atorvastatin 20 mg", labelSig: "take 1 tablet by mouth at bedtime",
    },
    errorField: "pill", note: "The bottle and label say atorvastatin 20 mg (white oval, 'ATV 20'), but the tablets in the vial are round, yellow, imprinted '439' — they don't match the reference. Wrong product in the bottle — quarantine and investigate; do not dispense.",
  },
  {
    level: 3,
    rx: { patient: "Bianca Flores", drug: "sertraline", strength: "50 mg", qty: "30", sig: "1 tab po daily" },
    ref: { pill: { color: "#a6c8f3", shape: "oval", imprint: "S 50" } },
    fill: {
      stockDrug: "sertraline", stockStrength: "50 mg", stockNdc: "00781-5077",
      count: "30", pill: { color: "#a6c8f3", shape: "oval", imprint: "S 50" },
      labelPatient: "Brianna Flores", labelDrug: "sertraline 50 mg", labelSig: "take 1 tablet by mouth once daily",
    },
    errorField: "label", note: "The fill is correct, but the label reads 'Brianna Flores' — the order is for 'Bianca Flores.' Wrong name on the label; correct it before it goes in the bag (wrong-patient risk).",
  },
  {
    level: 3,
    rx: { patient: "Howard Kim", drug: "metoprolol tartrate", strength: "25 mg", qty: "60", sig: "1 tab po BID" },
    ref: { pill: { color: "#f3a6c8", shape: "round", imprint: "M 25" } },
    fill: {
      stockDrug: "metformin", stockStrength: "500 mg", stockNdc: "00093-7214",
      count: "60", pill: { color: "#ffffff", shape: "oval", imprint: "500" },
      labelPatient: "Howard Kim", labelDrug: "metoprolol tartrate 25 mg", labelSig: "take 1 tablet by mouth twice daily",
    },
    errorField: "stock", note: "Look-alike/sound-alike grab: the order is metoprolol, but the tech pulled metformin (and the vial pills are the metformin 500 tablet). Completely wrong drug — reject.",
  },
  {
    level: 2,
    rx: { patient: "Carl Whitman", drug: "amlodipine", strength: "5 mg", qty: "30", sig: "1 tab po daily" },
    ref: { pill: { color: "#ffffff", shape: "round", imprint: "A 5" } },
    fill: {
      stockDrug: "amlodipine", stockStrength: "5 mg", stockNdc: "00093-7164",
      count: "30", pill: { color: "#ffffff", shape: "round", imprint: "A 5" },
      labelPatient: "Carl Whitman", labelDrug: "amlodipine 5 mg", labelSig: "take 1 tablet by mouth once daily",
    },
    errorField: null, note: "Everything lines up — right stock, right count, vial pills match the reference, label correct. Approve.",
  },
  {
    level: 3,
    rx: { patient: "Grace Lindqvist", drug: "levothyroxine", strength: "100 mcg", qty: "90", sig: "1 tab po daily" },
    ref: { pill: { color: "#f3d56b", shape: "round", imprint: "GG 333" } },
    fill: {
      stockDrug: "levothyroxine", stockStrength: "100 mcg", stockNdc: "00781-5181",
      count: "90", pill: { color: "#f3d56b", shape: "round", imprint: "GG 333" },
      labelPatient: "Grace Lindqvist", labelDrug: "levothyroxine 100 mcg", labelSig: "take 1 tablet by mouth twice daily",
    },
    errorField: "label", note: "Stock, count, and pills are correct, but the label sig says 'twice daily' — the order is once daily. The label directions are wrong; fix before dispensing.",
  },
  {
    level: 4,
    rx: { patient: "Sofia Reyes", drug: "lamotrigine", strength: "25 mg", qty: "60", sig: "1 tab po BID" },
    ref: { pill: { color: "#ffffff", shape: "round", imprint: "LA 25" } },
    fill: {
      stockDrug: "lamotrigine", stockStrength: "100 mg", stockNdc: "00173-0642",
      count: "60", pill: { color: "#f7b0c2", shape: "round", imprint: "LA 100" },
      labelPatient: "Sofia Reyes", labelDrug: "lamotrigine 25 mg", labelSig: "take 1 tablet by mouth twice daily",
    },
    errorField: "stock", note: "Order is lamotrigine 25 mg; the tech pulled the 100 mg stock (pills are the pink 100 mg). A 4× overdose on a drug that must be titrated slowly — reject and refill with 25 mg.",
  },
  {
    level: 4,
    rx: { patient: "Walter Munoz", drug: "warfarin", strength: "5 mg", qty: "30", sig: "1 tab po daily" },
    ref: { pill: { color: "#f3a6c8", shape: "round", imprint: "WAR 5" } },
    fill: {
      stockDrug: "warfarin", stockStrength: "5 mg", stockNdc: "00056-0176",
      count: "30", pill: { color: "#f3a6c8", shape: "round", imprint: "WAR 5" },
      labelPatient: "Walter Munoz", labelDrug: "warfarin 5 mg", labelSig: "take 1 tablet by mouth once daily",
    },
    errorField: null, note: "Warfarin strengths are color-coded; the pink 5 mg pill matches the reference, count and label are right. Approve.",
  },
  {
    level: 2,
    rx: { patient: "Donna Pierce", drug: "metformin", strength: "500 mg", qty: "60", sig: "1 tab po BID" },
    ref: { pill: { color: "#ffffff", shape: "oval", imprint: "500" } },
    fill: {
      stockDrug: "metformin", stockStrength: "500 mg", stockNdc: "00093-7214",
      count: "90", pill: { color: "#ffffff", shape: "oval", imprint: "500" },
      labelPatient: "Donna Pierce", labelDrug: "metformin 500 mg", labelSig: "take 1 tablet by mouth twice daily",
    },
    errorField: "count", note: "The order is for 60 tablets, but 90 were counted. Over-count — pull 30 back to 60 (over-dispensing also breaks the days supply and billing).",
  },
  {
    level: 4,
    rx: { patient: "Nora Ellis", drug: "bupropion XL", strength: "150 mg", qty: "30", sig: "1 tab po daily" },
    ref: { pill: { color: "#ffffff", shape: "round", imprint: "WPI 3331" } },
    fill: {
      stockDrug: "bupropion SR", stockStrength: "150 mg", stockNdc: "59762-3332",
      count: "30", pill: { color: "#ffffff", shape: "round", imprint: "WPI 3332" },
      labelPatient: "Nora Ellis", labelDrug: "bupropion XL 150 mg", labelSig: "take 1 tablet by mouth once daily",
    },
    errorField: "stock", note: "Look-alike strength/form error: the order is bupropion XL 150 mg, but the tech pulled bupropion SR 150 mg. The white round tablet imprint is WPI 3332 instead of WPI 3331 - reject as the wrong stock.",
  },
  {
    level: 4,
    rx: { patient: "Caleb Morris", drug: "clonazepam", strength: "1 mg", qty: "30", sig: "1 tab po qHS prn anxiety" },
    ref: { pill: { color: "#a6c8f3", shape: "round", imprint: "1 R 34" } },
    fill: {
      stockDrug: "clonidine", stockStrength: "0.1 mg", stockNdc: "00591-0135",
      count: "30", pill: { color: "#f3d56b", shape: "round", imprint: "U 135" },
      labelPatient: "Caleb Morris", labelDrug: "clonazepam 1 mg", labelSig: "take 1 tablet by mouth at bedtime as needed for anxiety",
    },
    errorField: "stock", note: "Look-alike/sound-alike error: the order is clonazepam 1 mg, but the tech pulled clonidine 0.1 mg. The vial pill is round yellow U 135 instead of round blue 1 R 34 - reject as the wrong stock.",
  },
];

const FCFIELD = { stock: "stock bottle", count: "count", pill: "pills in the vial", label: "label" };

function Pill({ p, size }) {
  const s = size || 30;
  const isCap = p.shape === "capsule";
  const w = p.shape === "oval" ? s * 1.5 : isCap ? s * 1.8 : s;
  const h = isCap ? s * 0.62 : p.shape === "oval" ? s * 0.85 : s;
  const dark = p.color === "#ffffff" || p.color === "#f3d56b" || p.color === "#e7d7a3";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: w, height: h, background: p.color, borderRadius: isCap ? h / 2 : p.shape === "oval" ? "50%" : "50%",
      border: "1.5px solid rgba(0,0,0,0.22)", color: dark ? "#3a3a3a" : "rgba(255,255,255,0.95)",
      fontSize: 8, fontWeight: 700, fontFamily: "'Spline Sans Mono',monospace", letterSpacing: 0.2,
      boxShadow: "inset 0 -2px 3px rgba(0,0,0,0.12)", flexShrink: 0 }}>{p.imprint}</span>
  );
}

function VialScatter({ p }) {
  const seed = (p.imprint || "").split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const spots = Array.from({ length: 5 }, (_, i) => {
    const angle = ((seed * 17) + (i * 73)) % 360;
    const radius = 12 + ((seed + i * 11) % 18);
    return {
      x: 50 + Math.cos(angle * Math.PI / 180) * radius,
      y: 50 + Math.sin(angle * Math.PI / 180) * radius,
      rotate: ((seed + i * 41) % 70) - 35,
    };
  });

  return (
    <div style={{
      position: "relative", width: 92, height: 92, borderRadius: "50%", overflow: "hidden", flexShrink: 0,
      background: "radial-gradient(circle at 35% 28%, rgba(255,205,120,0.45), rgba(170,96,24,0.34) 48%, rgba(91,48,16,0.42))",
      border: "1px solid rgba(116,71,24,0.42)",
      boxShadow: "inset 0 10px 18px rgba(255,220,150,0.24), inset 0 -14px 22px rgba(68,35,12,0.35), 0 2px 6px rgba(20,20,20,0.08)",
    }}>
      <div style={{ position: "absolute", inset: 10, borderRadius: "50%", border: "1px solid rgba(255,230,175,0.32)" }} />
      {spots.map((spot, i) => (
        <div key={i} style={{
          position: "absolute", left: spot.x + "%", top: spot.y + "%",
          transform: "translate(-50%, -50%) rotate(" + spot.rotate + "deg)",
          filter: "drop-shadow(0 2px 2px rgba(57,33,12,0.22))",
        }}>
          <Pill p={p} size={26} />
        </div>
      ))}
    </div>
  );
}

/* ---------- Mode 12: Fill Check ---------- */
function FillCheck({ level, onFinish, onQuit }) {
  const [cases] = useState(() => shuffle(FILLCHECK.filter((c) => c.level <= level)).slice(0, 8));
  const [idx, setIdx] = useState(0);
  const [pick, setPick] = useState(undefined);
  const [locked, setLocked] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [correct, setCorrect] = useState(0);

  if (!cases.length) return <Empty onQuit={onQuit} />;
  const c = cases[idx];
  const f = c.fill;
  const right = pick === "__approve__" ? c.errorField === null : pick === c.errorField;

  function choose(key) {
    if (locked) return;
    setPick(key); setLocked(true);
    const ok = key === "__approve__" ? c.errorField === null : key === c.errorField;
    if (ok) { setScore((s) => s + 100 + streak * 25); const ns = streak + 1; setStreak(ns); setBest((b) => Math.max(b, ns)); setCorrect((x) => x + 1); }
    else setStreak(0);
  }
  function next() {
    if (idx + 1 >= cases.length) { onFinish({ mode: 1, score, correct, total: cases.length, bestStreak: best, outOfLives: false }); return; }
    setIdx(idx + 1); setPick(undefined); setLocked(false);
  }

  // tappable verification zone
  function Zone({ k, title, children }) {
    const isErr = c.errorField === k;
    const picked = pick === k;
    let bg = C.card, border = C.line;
    if (locked) { if (isErr) { bg = "rgba(192,120,30,0.16)"; border = C.amber; } else if (picked) { bg = "rgba(178,58,36,0.12)"; border = C.clay; } }
    return (
      <button disabled={locked} onClick={() => choose(k)} className="opt"
        style={{ textAlign: "left", width: "100%", background: bg, border: `1.5px solid ${border}`, borderRadius: 13,
          padding: "12px 14px", cursor: locked ? "default" : "pointer" }}>
        <div className="mono" style={{ fontSize: 9.5, letterSpacing: 1, textTransform: "uppercase", color: C.muted, marginBottom: 6 }}>{title}</div>
        {children}
      </button>
    );
  }

  return (
    <div className="rise">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 16 }}>
          <Stat label="Score" value={score} color={C.pine} />
          <Stat label="Streak" value={`×${streak}`} color={C.amber} />
        </div>
        <span className="mono" style={{ fontSize: 12, color: C.muted }}>Fill {idx + 1} / {cases.length}</span>
      </div>
      <ProgressBar value={(idx / cases.length) * 100} />

      <p style={{ fontSize: 14, color: C.muted, margin: "14px 0 12px", lineHeight: 1.5 }}>
        The tech finished this fill. <strong style={{ color: C.ink }}>Tap whatever's wrong</strong> — or approve if it's good to dispense.
      </p>

      {/* the order + reference */}
      <div className="rx-card" style={{ padding: 16, marginBottom: 12, background: "rgba(31,74,63,0.04)" }}>
        <div className="mono" style={{ fontSize: 9.5, letterSpacing: 1, textTransform: "uppercase", color: C.pine, marginBottom: 8 }}>The order (verified Rx)</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div style={{ fontSize: 14.5, lineHeight: 1.5 }}>
            <div style={{ fontWeight: 700 }}>{c.rx.drug} {c.rx.strength}</div>
            <div style={{ color: C.muted }}>{c.rx.patient} · Qty {c.rx.qty} · {c.rx.sig}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <Pill p={c.ref.pill} size={30} />
            <div className="mono" style={{ fontSize: 8.5, color: C.muted, marginTop: 4 }}>REFERENCE</div>
          </div>
        </div>
      </div>

      {/* the tech's fill — tappable zones */}
      <div className="mono" style={{ fontSize: 9.5, letterSpacing: 1, textTransform: "uppercase", color: C.amber, marginBottom: 8 }}>Technician's fill</div>
      <div style={{ display: "grid", gap: 10 }}>
        <Zone k="stock" title="Stock bottle pulled">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 26, height: 34, background: "#c8851f", borderRadius: "4px 4px 5px 5px", position: "relative", flexShrink: 0 }}>
              <div style={{ position: "absolute", top: -5, left: 6, width: 14, height: 6, background: "#9c6716", borderRadius: 2 }} />
              <div style={{ position: "absolute", bottom: 4, left: 3, right: 3, height: 16, background: "#f6efe0", borderRadius: 1 }} />
            </div>
            <div style={{ fontSize: 14.5 }}>
              <div style={{ fontWeight: 700 }}>{f.stockDrug} {f.stockStrength}</div>
              <div className="mono" style={{ fontSize: 11, color: C.muted }}>NDC {f.stockNdc}</div>
            </div>
          </div>
        </Zone>

        <div style={{ display: "flex", gap: 10 }}>
          <Zone k="count" title="Counted">
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span className="display" style={{ fontSize: 26, fontWeight: 900 }}>{f.count}</span>
              <span style={{ fontSize: 13, color: C.muted }}>in vial</span>
            </div>
          </Zone>
          <Zone k="pill" title="Pills in vial">
            <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
              <VialScatter p={f.pill} />
              <div style={{ minWidth: 0, lineHeight: 1.35 }}>
                <div style={{ fontWeight: 800, fontSize: 13.5, color: C.ink }}>Visual Inspection</div>
                <div className="mono" style={{ marginTop: 4, fontSize: 11, color: C.muted }}>
                  Shape: {f.pill.shape}
                </div>
                <div className="mono" style={{ marginTop: 2, fontSize: 11, color: C.muted }}>
                  Imprint: {f.pill.imprint}
                </div>
              </div>
            </div>
          </Zone>
        </div>

        <Zone k="label" title="Label applied">
          <div style={{ fontSize: 13.5, lineHeight: 1.5 }}>
            <div style={{ fontWeight: 700 }}>{f.labelPatient}</div>
            <div>{f.labelDrug}</div>
            <div style={{ color: C.muted }}>{f.labelSig}</div>
          </div>
        </Zone>
      </div>

      {!locked && (
        <button onClick={() => choose("__approve__")}
          style={btn(C.green, "#fff", { width: "100%", marginTop: 14, background: C.green })}>
          ✓ Looks good — Approve &amp; dispense
        </button>
      )}

      {locked && (
        <>
          <div className="pop" style={{ marginTop: 14, padding: "13px 15px", borderRadius: 13,
            background: right ? "rgba(46,139,87,0.10)" : "rgba(178,58,36,0.08)", border: `1px solid ${right ? C.green : C.clay}` }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, color: right ? C.green : C.clay }}>
              {right ? (c.errorField === null ? "✓ Correctly approved" : `✓ Caught it — ${FCFIELD[c.errorField]}`)
                : (c.errorField === null ? "✕ This fill was actually correct" : `✕ The problem was the ${FCFIELD[c.errorField]}`)}
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.5 }}>{c.note}</div>
          </div>
          <button onClick={next} style={btn(C.pine, C.paper, { width: "100%", marginTop: 12 })}>
            {idx + 1 >= cases.length ? "Finish set" : "Next fill →"}
          </button>
        </>
      )}
    </div>
  );
}

function generateQv1Error(drug, strength, qty, sig, seedIndex) {
  if (seedIndex % 5 >= 3) return null; // ~40% of scripts have a data-entry error
  const slot = seedIndex % 3;
  if (slot === 0) {
    const map = {
      "5 mg":"10 mg","10 mg":"20 mg","20 mg":"10 mg","25 mg":"50 mg","40 mg":"80 mg",
      "50 mg":"25 mg","80 mg":"40 mg","100 mg":"50 mg","200 mg":"400 mg","500 mg":"1000 mg",
      "0.5 mg":"1 mg","0.1 mg":"0.2 mg","25 mcg":"50 mcg","50 mcg":"100 mcg","100 mcg":"50 mcg",
    };
    const wrong = map[strength];
    if (wrong) return { field: "strength", correct: strength, entered: wrong, label: "Strength" };
  }
  if (slot === 1) {
    const qmap = { 14:28, 21:14, 28:14, 30:90, 60:30, 90:30, 100:30, 45:90, 180:90 };
    const n = parseInt(qty);
    const w = qmap[n];
    if (w !== undefined) return { field: "quantity", correct: String(qty), entered: String(w), label: "Quantity" };
  }
  if (slot === 2) {
    const pairs = [
      [/once daily/i,"twice daily"],[/twice daily/i,"three times daily"],
      [/three times daily/i,"twice daily"],[/every 6 hours/i,"every 8 hours"],
      [/every 8 hours/i,"every 6 hours"],[/every 12 hours/i,"every 6 hours"],
    ];
    for (const [re, replacement] of pairs) {
      if (re.test(sig)) {
        const wrong = sig.replace(re, replacement);
        if (wrong !== sig) return { field: "sig", correct: sig, entered: wrong, label: "Directions (Sig)" };
      }
    }
  }
  return null;
}

const CVS_PLANS = [
  { name: "Caremark / CVS Health",    bin: "004336", pcn: "ADV",    grp: "RX6682",   memberFmt: "CMK", tiers: { G: 0,  PB: 15, NB: 45,  SP: 100 } },
  { name: "SilverScript (Part D)",    bin: "020099", pcn: "S5790",  grp: "S5790001", memberFmt: "0SS", tiers: { G: 0,  PB: 7,  NB: 30,  SP: 75  } },
  { name: "Aetna CVS Health",         bin: "610191", pcn: "AETCVS", grp: "AETCVS01", memberFmt: "W",   tiers: { G: 10, PB: 25, NB: 55,  SP: 150 } },
  { name: "Blue Cross / Caremark",    bin: "004336", pcn: "BCBS",   grp: "BCBS6682", memberFmt: "XYZ", tiers: { G: 5,  PB: 20, NB: 50,  SP: 125 } },
  { name: "Virginia Medicaid",        bin: "610011", pcn: "VA",     grp: "VAMCAD01", memberFmt: "9VA", tiers: { G: 0,  PB: 0,  NB: 1,   SP: 3   } },
  { name: "Tricare / Express Scripts",bin: "610115", pcn: "MEDCO",  grp: "TRICARE",  memberFmt: "DOD", tiers: { G: 0,  PB: 0,  NB: 14,  SP: 42  } },
  { name: "UnitedHealth / OptumRx",   bin: "610011", pcn: "OPTM",   grp: "OPTUMRX",  memberFmt: "U",   tiers: { G: 10, PB: 30, NB: 60,  SP: 200 } },
  { name: "Humana / Walmart",         bin: "610281", pcn: "HUM",    grp: "HUM0001",  memberFmt: "H",   tiers: { G: 0,  PB: 5,  NB: 45,  SP: 100 } },
  { name: "Cash / No Insurance",      bin: null,     pcn: null,     grp: null,        memberFmt: null,  tiers: null },
];
const SCRIPT_TYPES = ["eRx", "eRx", "eRx", "FAX", "FAX", "PHONE", "DROP"];

const CS_SCHEDULE = {
  oxycodone:"CII", hydrocodone:"CII", fentanyl:"CII", morphine:"CII",
  hydromorphone:"CII", oxymorphone:"CII", methadone:"CII", codeine:"CII",
  methylphenidate:"CII", amphetamine:"CII",
  buprenorphine:"CIII", testosterone:"CIII",
  tramadol:"CIV", alprazolam:"CIV", diazepam:"CIV", lorazepam:"CIV",
  clonazepam:"CIV", temazepam:"CIV", zolpidem:"CIV",
  gabapentin:"CV",
};
function getCsSchedule(drug) {
  const d = (drug || "").toLowerCase();
  for (const [key, sched] of Object.entries(CS_SCHEDULE)) {
    if (d.includes(key)) return sched;
  }
  return null;
}

const DRUG_NDC = {
  lisinopril:"00093-1234-01", atorvastatin:"00093-7193-98",
  metformin:"00093-1044-05", amlodipine:"00228-2776-10",
  levothyroxine:"00527-1348-01", metoprolol:"00378-0051-01",
  sertraline:"00093-7153-10", omeprazole:"68084-0247-11",
  losartan:"00093-7365-10", albuterol:"00085-1132-01",
  amoxicillin:"00781-1228-10", azithromycin:"00093-7146-56",
  cephalexin:"00093-3145-28", prednisone:"00054-4742-25",
  warfarin:"00056-0170-70", apixaban:"59148-0020-10",
  hydrochlorothiazide:"00781-2013-10", gabapentin:"00228-2012-10",
  tramadol:"00406-0371-01", verapamil:"00074-3286-13",
  lamotrigine:"00093-0083-10", hydroxyzine:"00093-0529-10",
  clarithromycin:"00074-3368-50",
};
function getDrugNdc(drug) {
  const d = (drug || "").toLowerCase();
  for (const [key, ndc] of Object.entries(DRUG_NDC)) {
    if (d.includes(key)) return ndc;
  }
  const h = d.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return `${String(h % 99999).padStart(5,"0")}-${String((h*7)%9999).padStart(4,"0")}-${String((h*3)%99).padStart(2,"0")}`;
}

const ALLERGY_PROFILES = [
  "NKDA","PCN — RASH","SULFA — HIVES","CODEINE — NAUSEA/VOMITING",
  "NSAIDS — GI BLEED HX","NKDA","NKDA","LISINOPRIL — ANGIOEDEMA",
  "ERYTHROMYCIN — RASH","NKDA","PENICILLIN — ANAPHYLAXIS","NKDA",
];
function getPatientAllergies(patient) {
  const h = (patient || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return ALLERGY_PROFILES[h % ALLERGY_PROFILES.length];
}

function getMemberId(plan, seed) {
  if (!plan?.memberFmt) return "CASH";
  const h = Math.abs(seed) % 100000000;
  if (plan.memberFmt === "CMK") return `CMK${String(h).padStart(9,"0")}`;
  if (plan.memberFmt === "0SS") return `0SS${String(h).padStart(7,"0")}`;
  if (plan.memberFmt === "W")   return `W${String(h).padStart(9,"0")}`;
  if (plan.memberFmt === "XYZ") return `XYZ${String(h).padStart(8,"0")}`;
  if (plan.memberFmt === "9VA") return `9VA${String(h).padStart(8,"0")}`;
  if (plan.memberFmt === "DOD") return `DOD${String(h).padStart(10,"0")}`;
  if (plan.memberFmt === "U")   return `U${String(h).padStart(9,"0")}`;
  if (plan.memberFmt === "H")   return `H${String(h).padStart(8,"0")}`;
  return `${plan.memberFmt}${String(h).padStart(8,"0")}`;
}

function getDrugTier(drug) {
  const d = (drug || "").toLowerCase();
  if (d.includes("apixaban")||d.includes("eliquis")||d.includes("tirzepatide")||d.includes("semaglutide")||d.includes("ozempic")||d.includes("dupixent")) return "SP";
  if (d.includes("atorvastatin")||d.includes("metformin")||d.includes("lisinopril")||d.includes("metoprolol")||d.includes("amlodipine")||d.includes("sertraline")||d.includes("omeprazole")||d.includes("losartan")||d.includes("levothyroxine")) return "G";
  if (d.includes("jardiance")||d.includes("empagliflozin")||d.includes("xarelto")||d.includes("rivaroxaban")||d.includes("albuterol")) return "PB";
  return "NB";
}
function getPatientCopay(plan, drug) {
  if (!plan?.tiers) return null;
  return plan.tiers[getDrugTier(drug)];
}

function managerRxFromFillCase(c, i, level = 4) {
  const lanes = ["Drive-thru", "Counter", "Waiter", "Phone"];
  const noTimer = level <= 2;
  const baseByLevel = [0, 90000, 65000, 45000, 28000][level] ?? 45000;
  const spread = ((i * 11000) % 26000);
  const patienceMs = noTimer ? 99999999 : baseByLevel + spread;
  const rxNum = String(Math.floor(1000000 + ((i * 912347 + 5483921) % 8999999)));
  const qv1Error = generateQv1Error(c.rx.drug, c.rx.strength, c.rx.qty, c.rx.sig, i);
  const plan = CVS_PLANS[i % CVS_PLANS.length];
  const patientSeed = (c.rx.patient || "").split("").reduce((a, ch) => a + ch.charCodeAt(0), 0);
  const csSchedule = getCsSchedule(c.rx.drug);
  const copay = getPatientCopay(plan, c.rx.drug);
  const memberId = getMemberId(plan, patientSeed + i * 37);
  const minClinic = (i % 7 === 3);
  const srcLabel = minClinic ? "MinuteClinic eRx" : SCRIPT_TYPES[i % SCRIPT_TYPES.length];

  // Refill / adherence data
  const lastFillDays = csSchedule === "CII" ? null : [null, 38, 16, 82, 27, 5, 44, 62, 9, 31][(patientSeed + i) % 10];
  const refillsLeft = [0,0,1,2,3,5,5,11,11,11][(patientSeed + i * 3) % 10];
  const isFirstFill = lastFillDays === null && !csSchedule;
  const tooSoon = lastFillDays !== null && lastFillDays < 25;

  // PA status for specialty drugs
  const d = (c.rx.drug || "").toLowerCase();
  const needsPa = d.includes("semaglutide")||d.includes("tirzepatide")||d.includes("apixaban")||d.includes("empagliflozin")||d.includes("dupixent");
  const paOnFile = needsPa && (patientSeed % 3 !== 0);
  const paExpYear = 2026 + (patientSeed % 2);
  const paStatus = needsPa ? (paOnFile ? `PA ON FILE — Exp 12/31/${paExpYear}` : "PA REQUIRED") : null;

  // Written date and expiration
  const writtenDate = (() => {
    const d = new Date(); d.setDate(d.getDate() - ((patientSeed * 7 + i * 3) % 90));
    return d.toLocaleDateString("en-US", { month:"2-digit", day:"2-digit", year:"numeric" });
  })();
  const scriptExpDate = (() => {
    const base = new Date(writtenDate);
    const months = csSchedule === "CII" ? 0 : csSchedule ? 6 : 12;
    base.setMonth(base.getMonth() + (months || 12));
    return base.toLocaleDateString("en-US", { month:"2-digit", day:"2-digit", year:"numeric" });
  })();

  // Patient phone
  const areaCode = ["804", "757", "540", "703"][(patientSeed) % 4];
  const patientPhone = `(${areaCode}) ${String(555).padStart(3,"0")}-${String(patientSeed % 9000 + 1000)}`;

  // Generic sub opportunity (brand-name scripts where generic exists)
  const brandInName = c.rx.drug.includes("(") || ["lipitor","crestor","zocor","norvasc","prinivil","zestril","glucophage","toprol"].some(b => d.includes(b));
  const genericSub = brandInName ? { brand: c.rx.drug, saving: [15,25,35,50,75][(patientSeed * i) % 5] } : null;

  return {
    id: `manager-${i}-${c.rx.patient}-${c.rx.drug}`,
    patient: c.rx.patient,
    drug: c.rx.drug,
    strength: c.rx.strength,
    qty: c.rx.qty,
    sig: c.rx.sig,
    lane: lanes[i % lanes.length],
    patienceMs,
    noTimer,
    patienceStartedAt: Date.now(),
    deEscalated: false,
    fillCase: c,
    rxNum,
    insurancePlan: plan.name,
    plan,
    memberId,
    copay,
    scriptType: srcLabel,
    csSchedule,
    qv1Error,
    daw: csSchedule === "CII" ? "1" : "0",
    lastFillDays,
    refillsLeft,
    isFirstFill,
    tooSoon,
    paStatus,
    writtenDate,
    scriptExpDate,
    patientPhone,
    genericSub,
  };
}

function isSevereFillError(rx) {
  const fill = rx.fillCase?.fill;
  const note = (rx.fillCase?.note || "").toLowerCase();
  const ordered = (rx.fillCase?.rx?.drug || "").toLowerCase();
  const filled = (fill?.stockDrug || "").toLowerCase();
  return rx.fillCase?.errorField === "stock"
    && (filled.includes("clonidine") || ordered.includes("clonazepam") || note.includes("sound-alike"));
}

function useDriveThruBell(enabled) {
  const timerRef = useRef(null);
  const visualRef = useRef(null);
  const audioRef = useRef(null);
  const enabledRef = useRef(enabled);
  const [bellActive, setBellActive] = useState(false);
  const [bellCount, setBellCount] = useState(0);

  useEffect(() => { enabledRef.current = enabled; }, [enabled]);

  function getAudio() {
    if (typeof window === "undefined") return null;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    if (!audioRef.current) {
      const ctx = new AudioContext();
      const master = ctx.createGain();
      master.gain.value = 1;
      master.connect(ctx.destination);
      audioRef.current = { ctx, master };
    }
    return audioRef.current;
  }

  function playTone(audio, start, freq, length, loudness) {
    const osc = audio.ctx.createOscillator();
    const gain = audio.ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(loudness, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
    osc.connect(gain);
    gain.connect(audio.master);
    osc.start(start);
    osc.stop(start + length + 0.03);
  }

  function ring(pattern = "drive-thru") {
    if (!enabledRef.current && pattern !== "meltdown") return;
    setBellActive(true);
    setBellCount((n) => n + 1);
    window.clearTimeout(visualRef.current);
    visualRef.current = window.setTimeout(() => setBellActive(false), pattern === "meltdown" ? 6200 : 3200);

    const audio = getAudio();
    if (!audio) return;
    if (audio.ctx.state === "suspended") audio.ctx.resume().catch(() => {});
    const t = audio.ctx.currentTime + 0.02;
    audio.master.gain.cancelScheduledValues(t);
    audio.master.gain.setValueAtTime(1, t);
    const hits = pattern === "meltdown"
      ? [0, 0.13, 0.26, 0.52, 0.65, 0.78, 1.06, 1.19, 1.32]
      : [0, 0.18, 0.36, 0.82, 1.0];
    hits.forEach((offset, i) => {
      const freq = pattern === "meltdown" ? (i % 2 ? 880 : 1240) : (i % 2 ? 740 : 980);
      playTone(audio, t + offset, freq, pattern === "meltdown" ? 0.11 : 0.14, pattern === "meltdown" ? 0.24 : 0.16);
    });
  }

  function silence() {
    window.clearTimeout(timerRef.current);
    window.clearTimeout(visualRef.current);
    setBellActive(false);
    const audio = audioRef.current;
    if (audio) {
      const t = audio.ctx.currentTime;
      audio.master.gain.cancelScheduledValues(t);
      audio.master.gain.setTargetAtTime(0.0001, t, 0.015);
    }
  }

  useEffect(() => {
    if (!enabled) return undefined;
    let alive = true;
    const schedule = () => {
      const wait = 45000 + Math.floor(Math.random() * 45001);
      timerRef.current = window.setTimeout(() => {
        if (!alive) return;
        ring("drive-thru");
        schedule();
      }, wait);
    };
    schedule();
    return () => {
      alive = false;
      window.clearTimeout(timerRef.current);
    };
  }, [enabled]);

  useEffect(() => () => silence(), []);

  return { bellActive, bellCount, ring, silence };
}

const SAFE_AUDIT_BOTTLES = [
  {
    drug: "Oxycodone IR",
    strength: "5 mg",
    ndc: "00406-0512",
    expected: 120,
    actual: 118,
    pill: { color: "#ffffff", shape: "round", imprint: "K 18" },
  },
  {
    drug: "Amphetamine salts",
    strength: "20 mg",
    ndc: "0555-0768",
    expected: 90,
    actual: 90,
    pill: { color: "#f4a8a8", shape: "round", imprint: "AD 20" },
  },
  {
    drug: "Methylphenidate ER",
    strength: "36 mg",
    ndc: "50458-0586",
    expected: 60,
    actual: 61,
    pill: { color: "#b8d8f2", shape: "capsule", imprint: "ALZA 36" },
  },
  {
    drug: "Hydromorphone",
    strength: "2 mg",
    ndc: "00406-3243",
    expected: 100,
    actual: 97,
    pill: { color: "#f5f1df", shape: "round", imprint: "M 2" },
  },
];

function SafeAudit({ onBalanced, summary }) {
  const [entries, setEntries] = useState(() => SAFE_AUDIT_BOTTLES.map(() => ""));
  const [attempts, setAttempts] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  function parseVariance(value) {
    const trimmed = value.trim();
    if (!/^[+-]?\d+$/.test(trimmed)) return null;
    return Number(trimmed);
  }

  const variances = SAFE_AUDIT_BOTTLES.map((b) => b.actual - b.expected);
  const exact = entries.map((value, i) => parseVariance(value) === variances[i]);
  const balanced = exact.every(Boolean);

  function setEntry(i, value) {
    setEntries((list) => list.map((item, idx) => (idx === i ? value : item)));
  }

  function submitAudit() {
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    setSubmitted(true);
    if (balanced) onBalanced({ attempts: nextAttempts, varianceTotal: variances.reduce((sum, v) => sum + Math.abs(v), 0) });
  }

  function PhysicalCount({ bottle }) {
    const tens = Math.floor(bottle.actual / 10);
    const singles = bottle.actual % 10;
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, alignItems: "center", marginTop: 10 }}>
        {Array.from({ length: tens }).map((_, group) => (
          <div key={`g-${group}`} title="10-count group" style={{
            width: 30, height: 22, borderRadius: 5, border: "1px solid rgba(255,255,255,0.18)",
            background: "rgba(0,0,0,0.16)", display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 1.5, padding: 3,
          }}>
            {Array.from({ length: 10 }).map((__, dot) => (
              <span key={dot} style={{ width: 3.5, height: 3.5, borderRadius: "50%", background: bottle.pill.color, boxShadow: "0 1px 2px rgba(0,0,0,0.35)" }} />
            ))}
          </div>
        ))}
        {Array.from({ length: singles }).map((_, i) => (
          <Pill key={`s-${i}`} p={bottle.pill} size={14} />
        ))}
      </div>
    );
  }

  return (
    <div className="rise">
      <div style={{
        borderRadius: 18, padding: 18, color: "#f5f1df",
        background: "linear-gradient(145deg, #2d3330, #111816 58%, #343b38)",
        border: "3px solid rgba(255,255,255,0.18)",
        boxShadow: "inset 0 0 0 2px rgba(0,0,0,0.42), 0 22px 46px -24px rgba(0,0,0,0.65)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 14 }}>
          <div>
            <div className="pixel" style={{ fontSize: 10, color: C.amberSoft, marginBottom: 8 }}>CII SAFE AUDIT</div>
            <div className="display" style={{ fontSize: 29, fontWeight: 900, lineHeight: 1 }}>Daily Finisher</div>
          </div>
          <div className="mono" style={{ fontSize: 11, color: "#d7c9a9", textAlign: "right" }}>
            Cleared {summary?.completed || 0}<br />Accuracy {summary?.completed ? Math.round((summary.correct / summary.completed) * 100) : 0}%
          </div>
        </div>

        <div style={{ borderRadius: 14, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(0,0,0,0.22)", padding: 12, marginBottom: 14 }}>
          <div className="mono" style={{ fontSize: 10, color: C.amberSoft, marginBottom: 6 }}>VAULT DOOR</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 7 }}>
            {Array.from({ length: 24 }).map((_, i) => (
              <span key={i} style={{ height: 9, borderRadius: 20, background: i % 3 === 0 ? "#d8c28e" : "#6f7772", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.45)" }} />
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          {SAFE_AUDIT_BOTTLES.map((bottle, i) => {
            const wrong = submitted && !exact[i];
            return (
              <div key={bottle.drug} style={{
                borderRadius: 12, border: `1.5px solid ${wrong ? "#ff563f" : "rgba(255,255,255,0.18)"}`,
                background: wrong ? "rgba(178,58,36,0.18)" : "rgba(255,255,255,0.06)", padding: 12,
              }}>
                <div style={{ display: "grid", gridTemplateColumns: "52px 1fr auto", gap: 12, alignItems: "center" }}>
                  <div style={{ width: 46, height: 60, borderRadius: "7px 7px 9px 9px", background: "#a96019", position: "relative", boxShadow: "inset 0 -10px 18px rgba(0,0,0,0.22)" }}>
                    <div style={{ position: "absolute", top: -7, left: 12, width: 22, height: 8, borderRadius: "3px 3px 1px 1px", background: "#6f4214" }} />
                    <div style={{ position: "absolute", left: 6, right: 6, bottom: 8, minHeight: 25, borderRadius: 3, background: "#f6efe0", color: "#26332d", fontSize: 7.5, fontWeight: 800, display: "grid", placeItems: "center", textAlign: "center", padding: 2 }}>
                      CII
                    </div>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 900, fontSize: 14.5 }}>{bottle.drug} {bottle.strength}</div>
                    <div className="mono" style={{ color: "#d7c9a9", fontSize: 10.5, marginTop: 3 }}>NDC {bottle.ndc}</div>
                    <PhysicalCount bottle={bottle} />
                  </div>
                  <div style={{ minWidth: 95, textAlign: "right" }}>
                    <div className="mono" style={{ color: C.amberSoft, fontSize: 9, marginBottom: 4 }}>EXPECTED</div>
                    <div className="pixel" style={{ fontSize: 18, color: "#78f0a1", background: "#06130c", borderRadius: 6, padding: "8px 7px", boxShadow: "inset 0 0 8px rgba(120,240,161,0.18)" }}>{bottle.expected}</div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "center", marginTop: 11 }}>
                  <label className="mono" style={{ color: "#d7c9a9", fontSize: 10.5 }}>Variance input: physical minus expected</label>
                  <input
                    value={entries[i]}
                    onChange={(e) => setEntry(i, e.target.value)}
                    inputMode="numeric"
                    placeholder="+0"
                    style={{
                      width: 86, padding: "9px 10px", borderRadius: 8, border: `1px solid ${wrong ? "#ff563f" : "rgba(255,255,255,0.22)"}`,
                      background: "#07100c", color: "#f5f1df", fontFamily: "'Spline Sans Mono', monospace", fontSize: 14, textAlign: "center",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {submitted && !balanced && (
          <div className="pop" style={{ marginTop: 13, padding: 12, borderRadius: 10, background: "rgba(178,58,36,0.22)", border: "1px solid #ff563f", fontWeight: 800 }}>
            Audit variance still off. The safe stays open until every discrepancy balances.
          </div>
        )}

        <button onClick={submitAudit} style={btn(balanced ? C.green : C.amber, "#fff", { width: "100%", marginTop: 14, background: balanced ? C.green : C.amber })}>
          {balanced ? "Balance safe and close shift" : "Run safe audit"}
        </button>
      </div>
    </div>
  );
}

function ShiftReport({ report, hourlyRate, onContinue }) {
  const basePay = hourlyRate * 8;
  const totalBonuses = report.shiftBonuses || 0;
  const totalPenalties = report.shiftPenalties || 0;
  const penaltyCount = report.penaltyCount || 0;
  const netProfit = basePay + totalBonuses - totalPenalties;
  const rows = [
    { label: "Base Pay", value: basePay, note: `${money(hourlyRate)} x 8 hours`, color: C.pine },
    { label: "Total Bonuses", value: totalBonuses, note: "+$15 per clean verification", color: C.green },
    { label: "Total Penalties", value: -totalPenalties, note: `${penaltyCount} malpractice hit${penaltyCount === 1 ? "" : "s"}`, color: totalPenalties ? C.clay : C.muted },
    { label: "Net Profit", value: netProfit, note: "Deposited after continue", color: netProfit >= 0 ? C.green : C.clay },
  ];

  function continueReport() {
    onContinue({
      ...report,
      basePay,
      totalBonuses,
      totalPenalties,
      netProfit,
      penaltyCount,
      hourlyRate,
    });
  }

  return (
    <div className="rise">
      <div className="rx-card" style={{
        overflow: "hidden", borderRadius: 16, border: `2px solid ${netProfit >= 0 ? C.green : C.clay}`,
        boxShadow: `0 22px 48px -26px ${netProfit >= 0 ? C.green : C.clay}`,
      }}>
        <div style={{ padding: 18, background: "#111816", color: "#f5f1df", borderBottom: `1px solid ${C.line}` }}>
          <div className="pixel" style={{ fontSize: 10, color: C.amberSoft, marginBottom: 8 }}>DIGITAL SHIFT PAYSTUB</div>
          <div className="display" style={{ fontSize: 30, fontWeight: 900, lineHeight: 1 }}>Manager Shift Report</div>
          <div className="mono" style={{ color: "#d7c9a9", fontSize: 11, marginTop: 8 }}>
            Final checks {report.completed || 0} / Accuracy {report.completed ? Math.round((report.correct / report.completed) * 100) : 0}% / Safe audit tries {report.auditAttempts || 1}
          </div>
        </div>

        <div style={{ padding: 18, display: "grid", gap: 10 }}>
          {rows.map((row) => (
            <div key={row.label} style={{
              display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "center",
              padding: "12px 0", borderBottom: row.label === "Net Profit" ? "none" : `1px solid ${C.line}`,
            }}>
              <div>
                <div style={{ fontWeight: 900, fontSize: row.label === "Net Profit" ? 17 : 14.5 }}>{row.label}</div>
                <div className="mono" style={{ color: C.muted, fontSize: 10.5, marginTop: 3 }}>{row.note}</div>
              </div>
              <div className="display" style={{ fontSize: row.label === "Net Profit" ? 27 : 21, fontWeight: 900, color: row.color }}>
                {money(row.value)}
              </div>
            </div>
          ))}

          {totalPenalties > 0 && (
            <div className="pop" style={{ padding: 12, borderRadius: 12, background: "rgba(178,58,36,0.10)", border: `1px solid ${C.clay}` }}>
              <div style={{ fontWeight: 900, color: C.clay, marginBottom: 4 }}>Malpractice Settlement Posted</div>
              <div style={{ fontSize: 13.5, lineHeight: 1.45, color: C.ink }}>
                A severe look-alike/sound-alike approval hit the shift ledger. Career Mode will subtract this from your bank.
              </div>
            </div>
          )}

          <button onClick={continueReport} style={btn(netProfit >= 0 ? C.pine : C.clay, "#fff", { width: "100%", marginTop: 4, background: netProfit >= 0 ? C.pine : C.clay })}>
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Mode 13: ManagerShift ---------- */
function ManagerShift({ level, hourlyRate = 65, onShiftComplete, onFinish, onQuit }) {
  const [toVerifyData, setToVerifyData] = useState(() => shuffle(FILLCHECK.filter((c) => c.level <= level)).slice(0, 6).map((c, i) => managerRxFromFillCase(c, i, level)));
  const [inProduction, setInProduction] = useState([]);
  const [finalCheck, setFinalCheck] = useState([]);
  const [completed, setCompleted] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [meltdown, setMeltdown] = useState(null);
  const [auditOpen, setAuditOpen] = useState(false);
  const [pendingSummary, setPendingSummary] = useState(null);
  const [shiftReport, setShiftReport] = useState(null);
  const [shiftBonuses, setShiftBonuses] = useState(0);
  const [shiftPenalties, setShiftPenalties] = useState(0);
  const [penaltyCount, setPenaltyCount] = useState(0);
  const [malpracticeFlash, setMalpracticeFlash] = useState(null);
  const [chainTasks, setChainTasks] = useState(initialChainTasks);
  const [serviceScore, setServiceScore] = useState(84);
  const [chainXp, setChainXp] = useState(0);
  const [chainStreak, setChainStreak] = useState(0);
  const [chainToast, setChainToast] = useState(null);
  const [verifyModal, setVerifyModal] = useState(null);
  const timers = useRef({});
  const pendingSummaryRef = useRef(null);
  const bellPenaltyRef = useRef(0);
  const malpracticeTimerRef = useRef(null);
  const chainToastRef = useRef(null);
  const qv1CaughtRef = useRef(0);
  const bell = useDriveThruBell(!auditOpen);

  useEffect(() => () => {
    Object.values(timers.current).forEach(clearTimeout);
    window.clearTimeout(malpracticeTimerRef.current);
    window.clearTimeout(chainToastRef.current);
  }, []);
  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 350);
    return () => clearInterval(tick);
  }, []);

  const total = completed + toVerifyData.length + inProduction.length + finalCheck.length;
  const livePatients = [...toVerifyData, ...inProduction, ...finalCheck];
  const chainLoad = Object.values(chainTasks).reduce((sum, value) => sum + value, 0);
  const chainPressure = Math.min(100, Math.round((chainLoad / 28) * 100));
  const serviceColor = serviceScore >= 85 ? C.green : serviceScore >= 70 ? C.amber : C.clay;

  function patientLeftMs(rx) {
    return Math.max(0, rx.patienceMs - (now - rx.patienceStartedAt));
  }
  function flashChainToast(message) {
    setChainToast(message);
    window.clearTimeout(chainToastRef.current);
    chainToastRef.current = window.setTimeout(() => setChainToast(null), 1800);
  }

  function bumpQueuePatience(ms) {
    const bump = (queue) => queue.map((rx) => ({ ...rx, patienceMs: Math.min(rx.patienceMs + ms, 120000) }));
    setToVerifyData((q) => bump(q));
    setInProduction((q) => bump(q));
    setFinalCheck((q) => bump(q));
  }

  function addShiftXp(amount, scoreDelta, message) {
    setChainXp((xp) => xp + amount);
    setServiceScore((score) => Math.max(0, Math.min(100, score + scoreDelta)));
    if (amount > 0) setChainStreak((streak) => streak + 1);
    if (message) flashChainToast(message);
  }

  function handleChainTask(taskId) {
    const task = CHAIN_TASKS.find((item) => item.id === taskId);
    if (!task || auditOpen || meltdown) return;
    const count = chainTasks[taskId] || 0;
    if (count <= 0) {
      flashChainToast(`${task.label} is already clear.`);
      return;
    }
    setChainTasks((tasks) => ({ ...tasks, [taskId]: Math.max(0, tasks[taskId] - 1) }));
    bumpQueuePatience(task.reliefMs);
    addShiftXp(task.xp, task.score, `${task.action}: +${task.xp} XP`);
  }

  function clearProductionTimers() {
    Object.values(timers.current).forEach(clearTimeout);
    timers.current = {};
  }

  function buildManagerSummary(done = completed, right = correct, bonuses = shiftBonuses, penalties = shiftPenalties, penaltyHits = penaltyCount) {
    return {
      mode: 13,
      completed: done,
      correct: right,
      total: Math.max(done, total),
      rating: done ? Math.round((right / done) * 100) : 0,
      shiftBonuses: bonuses,
      shiftPenalties: penalties,
      penaltyCount: penaltyHits,
      serviceScore,
      chainXp,
      chainLoad,
      qv1ErrorsCaught: qv1CaughtRef.current,
    };
  }

  function startSafeAudit(done = completed, right = correct, bonuses = shiftBonuses, penalties = shiftPenalties, penaltyHits = penaltyCount) {
    const summary = buildManagerSummary(done, right, bonuses, penalties, penaltyHits);
    clearProductionTimers();
    pendingSummaryRef.current = summary;
    setPendingSummary(summary);
    setMeltdown(null);
    bell.silence();
    setAuditOpen(true);
  }

  function finishAfterAudit(audit) {
    const base = pendingSummaryRef.current || buildManagerSummary();
    setAuditOpen(false);
    setShiftReport({ ...base, auditBalanced: true, auditAttempts: audit.attempts, auditVarianceTotal: audit.varianceTotal });
  }

  function continueShiftReport(payload) {
    if (onShiftComplete) {
      onShiftComplete(payload);
      return;
    }
    if (onFinish) onFinish(payload);
  }

  function resetPressureQueue(queue) {
    const stamp = Date.now();
    return queue.map((rx) => ({
      ...rx,
      patienceStartedAt: stamp,
      patienceMs: Math.max(rx.patienceMs + 18000, 62000),
      deEscalated: true,
    }));
  }

  function wtfButton() {
    bell.silence();
    setMeltdown(null);
    setNow(Date.now());
    setToVerifyData((q) => resetPressureQueue(q));
    setInProduction((q) => resetPressureQueue(q));
    setFinalCheck((q) => resetPressureQueue(q));
  }

  useEffect(() => {
    if (auditOpen || meltdown) return;
    const angry = livePatients.find((rx) => patientLeftMs(rx) <= 0);
    if (!angry) return;
    setMeltdown({
      patient: angry.patient,
      drug: `${angry.drug} ${angry.strength}`,
      lane: angry.lane,
      at: Date.now(),
    });
    bell.ring("meltdown");
  }, [now, toVerifyData, inProduction, finalCheck, auditOpen, meltdown]);

  useEffect(() => {
    if (auditOpen || bell.bellCount <= bellPenaltyRef.current) return;
    bellPenaltyRef.current = bell.bellCount;
    const squeeze = (queue) => queue.map((rx) => ({
      ...rx,
      patienceMs: Math.max(10000, rx.patienceMs - 3500),
    }));
    setToVerifyData((q) => squeeze(q));
    setInProduction((q) => squeeze(q));
    setFinalCheck((q) => squeeze(q));
  }, [bell.bellCount, auditOpen]);

  useEffect(() => {
    if (auditOpen || shiftReport) return undefined;
    const interval = window.setInterval(() => {
      const task = CHAIN_TASKS[Math.floor(Math.random() * CHAIN_TASKS.length)];
      setChainTasks((tasks) => ({ ...tasks, [task.id]: Math.min(task.max, (tasks[task.id] || 0) + 1) }));
      setServiceScore((score) => Math.max(0, score - (chainLoad >= 14 ? 3 : 1)));
      setChainStreak(0);
    }, 9000);
    return () => window.clearInterval(interval);
  }, [auditOpen, shiftReport, chainLoad]);

  function approveData(rx, qv1Correct = true) {
    if (meltdown || auditOpen) return;
    const etaMs = 5000 + Math.floor(Math.random() * 7001);
    const ticket = { ...rx, etaMs, startedAt: Date.now(), readyAt: Date.now() + etaMs };
    setToVerifyData((q) => q.filter((item) => item.id !== rx.id));
    setInProduction((q) => [...q, ticket]);
    const caught = rx.qv1Error && qv1Correct;
    if (caught) qv1CaughtRef.current += 1;
    const xp  = caught ? 10 : qv1Correct ? 5 : 0;
    const svc = caught ?  3 : qv1Correct ? 1 : -6;
    addShiftXp(xp, svc, caught ? "Error caught! +10 XP" : qv1Correct ? "QV1 clean: +5 XP" : "QV1 miss — service hit");
    timers.current[rx.id] = setTimeout(() => {
      setInProduction((q) => q.filter((item) => item.id !== rx.id));
      setFinalCheck((q) => [...q, { ...ticket, finishedAt: Date.now() }]);
      delete timers.current[rx.id];
    }, etaMs);
  }

  function finalAction(rx, action) {
    if (meltdown || auditOpen) return;
    const shouldApprove = rx.fillCase.errorField === null;
    const ok = action === "approve" ? shouldApprove : !shouldApprove;
    const malpractice = action === "approve" && !shouldApprove && isSevereFillError(rx);
    const bonusGain = ok ? 15 : 0;
    const penaltyGain = malpractice ? 500 : 0;
    const nextCompleted = completed + 1;
    const nextCorrect = correct + (ok ? 1 : 0);
    const nextBonuses = shiftBonuses + bonusGain;
    const nextPenalties = shiftPenalties + penaltyGain;
    const nextPenaltyCount = penaltyCount + (malpractice ? 1 : 0);
    const remaining = toVerifyData.length + inProduction.length + finalCheck.length - 1;
    setFinalCheck((q) => q.filter((item) => item.id !== rx.id));
    setCompleted(nextCompleted);
    if (ok) setCorrect(nextCorrect);
    if (bonusGain) setShiftBonuses(nextBonuses);
    addShiftXp(ok ? 12 : 0, ok ? 3 : -8, ok ? "QV2 clean check: +12 XP" : "Verification miss: service score hit");
    if (malpractice) {
      setShiftPenalties(nextPenalties);
      setPenaltyCount(nextPenaltyCount);
      setServiceScore((score) => Math.max(0, score - 25));
      setChainStreak(0);
      setMalpracticeFlash({ patient: rx.patient, drug: `${rx.drug} ${rx.strength}`, penalty: penaltyGain });
      window.clearTimeout(malpracticeTimerRef.current);
      malpracticeTimerRef.current = window.setTimeout(() => setMalpracticeFlash(null), 2200);
    }
    if (remaining <= 0) startSafeAudit(nextCompleted, nextCorrect, nextBonuses, nextPenalties, nextPenaltyCount);
  }

  const PressureMeter = ({ rx }) => {
    const TM2 = { fontFamily: "'Spline Sans Mono',monospace" };
    if (rx.noTimer) {
      return (
        <div style={{ marginTop: 7, ...TM2, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 8 }}>
          <span style={{ color: "#4A8FA5" }}>{rx.lane?.toUpperCase()}{rx.deEscalated ? " ✓ RECOVERED" : ""}</span>
          <span style={{ color: "#3FB950", background: "rgba(63,185,80,0.08)", borderRadius: 4, padding: "2px 7px", fontWeight: 700 }}>✓ PRACTICE MODE</span>
        </div>
      );
    }
    const left = patientLeftMs(rx);
    const pct = Math.max(0, Math.min(100, (left / rx.patienceMs) * 100));
    const hot = pct <= 28;
    const color = pct <= 20 ? "#FF4444" : pct <= 45 ? "#FFB800" : "#3FB950";
    const promiseTime = (() => {
      const d = new Date(rx.patienceStartedAt + rx.patienceMs);
      return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    })();
    return (
      <div style={{ marginTop: 7 }}>
        <div style={{ ...TM2, display: "flex", justifyContent: "space-between", gap: 8, fontSize: 9, color: hot ? "#FF4444" : "#8A9AAA" }}>
          <span>{rx.lane?.toUpperCase()}{rx.deEscalated ? " ✓ RECOVERED" : ""}</span>
          <span style={{ color: left <= 0 ? "#FF4444" : hot ? "#FF4444" : "#8A9AAA" }}>
            {left <= 0 ? "PAST DUE" : `Promise ${promiseTime}`}
          </span>
        </div>
        <div style={{ height: 4, background: "#E8EDF1", borderRadius: 2, overflow: "hidden", marginTop: 4 }}>
          <div style={{ width: `${pct}%`, height: "100%", background: color, transition: "width .25s linear" }} />
        </div>
      </div>
    );
  };

  const TM = { fontFamily: "'Spline Sans Mono',monospace" };
  const Column = ({ title, count, color = "#3FB950", children }) => (
    <div style={{ minWidth: 0 }}>
      <div style={{ background: "#0B1F3A", borderRadius: "10px 10px 0 0", padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ ...TM, color: "#7EB8C9", fontSize: 9, letterSpacing: 1.5 }}>{title}</span>
        <span style={{ ...TM, color: count > 0 ? color : "#3A6070", fontSize: 13, fontWeight: 700, background: count > 0 ? `${color}22` : "transparent", border: count > 0 ? `1px solid ${color}44` : "none", borderRadius: 4, padding: "1px 6px" }}>{count}</span>
      </div>
      <div style={{ background: "#F2F5F7", borderRadius: "0 0 10px 10px", padding: 8, display: "grid", gap: 8 }}>{children}</div>
    </div>
  );

  const EmptyLane = ({ text }) => (
    <div style={{ padding: 14, borderRadius: 8, border: "1px dashed #C8D4DC", color: "#8A9AAA", fontSize: 12, textAlign: "center", background: "#FAFBFC", ...TM }}>{text}</div>
  );


  const ChainTaskButton = ({ task }) => {
    const count = chainTasks[task.id] || 0;
    const hot = count >= Math.max(4, task.max - 2);
    return (
      <button onClick={() => handleChainTask(task.id)} style={{ border: `1px solid ${hot ? "#FF444466" : "#D0D8E0"}`, background: hot ? "rgba(255,68,68,0.06)" : "#FFFFFF", color: "#1A2A35", borderRadius: 8, padding: "9px 11px", cursor: "pointer", textAlign: "left", minHeight: 70, display: "grid", gap: 4 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ ...TM, fontSize: 8, letterSpacing: 1.5, color: hot ? "#FF4444" : "#5A7080" }}>{task.label}</span>
          <span style={{ ...TM, fontSize: 11, fontWeight: 700, color: hot ? "#FF4444" : "#3FB950", background: hot ? "rgba(255,68,68,0.12)" : "rgba(63,185,80,0.1)", border: `1px solid ${hot ? "#FF444444" : "#3FB95044"}`, borderRadius: 4, padding: "1px 5px" }}>×{count}</span>
        </div>
        <span style={{ fontWeight: 700, fontSize: 13 }}>{task.action}</span>
        <span style={{ color: "#6A7A80", fontSize: 11, lineHeight: 1.3 }}>{task.note}</span>
      </button>
    );
  };
  function prescriberFor(drug, scriptType) {
    const d = (drug || "").toLowerCase();
    if ((scriptType || "").includes("MinuteClinic"))
      return { name: "NP M. Torres, FNP-C", spec: "CVS MinuteClinic", npi: "NPI 1982340712", phone: "(804) 555-0500", dea: null, clinic: "MinuteClinic #4821 · Richmond VA" };
    if (d.includes("oxycodone")||d.includes("hydrocodone")||d.includes("morphine")||d.includes("fentanyl")||d.includes("tramadol"))
      return { name: "Dr. R. Santos, MD", spec: "Pain Management", npi: "NPI 1832094571", phone: "(804) 555-0234", dea: "BS4823901", clinic: null };
    if (d.includes("alprazolam")||d.includes("lorazepam")||d.includes("clonazepam")||d.includes("diazepam"))
      return { name: "Dr. L. Webb, PMHNP", spec: "Psychiatry / Neurology", npi: "NPI 1376082451", phone: "(804) 555-0271", dea: "BW7412093", clinic: null };
    if (d.includes("methylphenidate")||d.includes("amphetamine"))
      return { name: "Dr. T. Park, MD", spec: "Pediatric Psychiatry", npi: "NPI 1594820371", phone: "(804) 555-0315", dea: "BP3920481", clinic: null };
    if (d.includes("metoprolol")||d.includes("verapamil")||d.includes("amlodipine")||d.includes("lisinopril")||d.includes("atorvastatin")||d.includes("warfarin")||d.includes("apixaban"))
      return { name: "Dr. J. Carver, MD", spec: "Cardiology", npi: "NPI 1609872340", phone: "(804) 555-0118", dea: null, clinic: null };
    if (d.includes("sertraline")||d.includes("lamotrigine"))
      return { name: "Dr. L. Webb, PMHNP", spec: "Psychiatry / Neurology", npi: "NPI 1376082451", phone: "(804) 555-0271", dea: null, clinic: null };
    if (d.includes("metformin")||d.includes("levothyroxine")||d.includes("semaglutide")||d.includes("tirzepatide")||d.includes("empagliflozin"))
      return { name: "Dr. A. Chen, MD", spec: "Endocrinology", npi: "NPI 1457823091", phone: "(804) 555-0399", dea: null, clinic: null };
    return { name: "Dr. P. Quinn, MD", spec: "Family Medicine", npi: "NPI 1023948576", phone: "(804) 555-0087", dea: null, clinic: null };
  }
  function patientDob(patient) {
    const h = (patient || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    return `${String((h % 12) + 1).padStart(2, "0")}/${String(((h * 7) % 28) + 1).padStart(2, "0")}/${1945 + (h % 50)}`;
  }
  function refillsFor(drug) {
    const d = (drug || "").toLowerCase();
    if (d.includes("amoxicillin") || d.includes("azithromycin") || d.includes("cephalexin") || d.includes("warfarin")) return 0;
    if (d.includes("sertraline") || d.includes("levothyroxine") || d.includes("metformin") || d.includes("lisinopril")) return 11;
    return 5;
  }
  const scriptWrittenDate = (() => { const d = new Date(); d.setDate(d.getDate() - 3); return d.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }); })();

  const ScriptModal = ({ vm, onClose }) => {
    const rx = vm.rx;
    const c = rx.fillCase;
    const f = c.fill;
    const ref = c.ref;
    const prescriber = prescriberFor(rx.drug, rx.scriptType);
    const dob = patientDob(rx.patient);
    const refills = refillsFor(rx.drug);

    const drugStrOk = `${f.stockDrug} ${f.stockStrength}`.toLowerCase() === `${rx.drug} ${rx.strength}`.toLowerCase();
    const countOk = String(f.count) === String(rx.qty);
    const pillOk = f.pill.imprint === ref.pill.imprint && f.pill.shape === ref.pill.shape;
    const lPatOk = f.labelPatient === rx.patient;
    const lSigOk = c.errorField !== "label" || !lPatOk;

    const CheckRow = ({ label, ok, expected, actual }) => (
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "7px 0", borderBottom: "1px solid #EEF1F4" }}>
        <div style={{ ...TM, flexShrink: 0, width: 18, height: 18, borderRadius: 4, background: ok ? "rgba(63,185,80,0.12)" : "rgba(255,184,0,0.15)", border: `1px solid ${ok ? "#3FB95055" : "#FFB80055"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: ok ? "#3FB950" : "#FFB800", marginTop: 1 }}>{ok ? "✓" : "⚠"}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ ...TM, fontSize: 8, color: "#5A7080", letterSpacing: 1, textTransform: "uppercase" }}>{label}</div>
          {ok
            ? <div style={{ ...TM, fontSize: 10, color: "#3FB950", marginTop: 2 }}>{expected}</div>
            : <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginTop: 3 }}>
                <div style={{ ...TM, fontSize: 10, color: "#0B1F3A" }}>Rx: <span style={{ fontWeight: 700 }}>{expected}</span></div>
                <div style={{ ...TM, fontSize: 10, color: "#FFB800", fontWeight: 700 }}>Filled: {actual}</div>
              </div>
          }
        </div>
      </div>
    );

    const ModalWrap = ({ children }) => (
      <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(7,21,35,0.94)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "12px 12px max(12px, env(safe-area-inset-bottom))", overflowY: "auto", overscrollBehavior: "contain", WebkitOverflowScrolling: "touch" }}>
        <div style={{ width: "min(500px,100%)", maxHeight: "calc(100dvh - 24px)", background: "#F2F5F7", borderRadius: 12, overflowY: "auto", WebkitOverflowScrolling: "touch", boxShadow: "0 24px 60px rgba(0,0,0,0.7)" }}>
          {children}
        </div>
      </div>
    );

    const ModalHeader = ({ title, sub }) => (
      <div style={{ background: "#CC0000", padding: "12px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ ...TM, color: "rgba(255,255,255,0.65)", fontSize: 8, letterSpacing: 2 }}>CVS RxConnect — {title}</div>
            <div style={{ ...TM, color: "#FFFFFF", fontSize: 13, fontWeight: 700, marginTop: 3 }}>{sub}</div>
            <div style={{ ...TM, color: "rgba(255,255,255,0.6)", fontSize: 9, marginTop: 2 }}>Rx#{rx.rxNum} · {rx.patient} · {rx.insurancePlan || "Cash"}</div>
          </div>
          <button onClick={onClose} style={{ ...TM, background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.25)", color: "#FFFFFF", borderRadius: 6, padding: "5px 10px", cursor: "pointer", fontSize: 10, letterSpacing: 1 }}>✕ CLOSE</button>
        </div>
        <div style={{ marginTop: 10 }}><PressureMeter rx={rx} /></div>
      </div>
    );

    if (vm.stage === "qv1") {
      const qv1Error = rx.qv1Error || null;
      const qv1Phase = vm.qv1Phase || "review";
      const holdField = vm.holdField || null;

      const sysStrength = qv1Error?.field === "strength" ? qv1Error.entered : rx.strength;
      const sysQty      = qv1Error?.field === "quantity" ? qv1Error.entered : String(rx.qty);
      const sysSig      = qv1Error?.field === "sig"      ? qv1Error.entered : rx.sig;

      const rxNdc = getDrugNdc(rx.drug);
      const calcDaysSupply = (() => {
        const qty = Number(rx.qty) || 0;
        const s = (rx.sig || "").toLowerCase();
        let freq = 1;
        if (s.includes("bid")||s.includes("twice")||s.includes("q12")||s.includes("2x")) freq = 2;
        else if (s.includes("tid")||s.includes("three")||s.includes("q8")||s.includes("3x")) freq = 3;
        else if (s.includes("qid")||s.includes("four")||s.includes("q6")||s.includes("4x")) freq = 4;
        if (s.includes("ml") && qty > 30) return String(Math.round(qty / (5 * Math.max(freq, 1))));
        return String(Math.round(qty / Math.max(freq, 1)));
      })();
      const compareRows = [
        { id: "ndc",      label: "NDC",             hc: rxNdc,                sys: rxNdc },
        { id: "drug",     label: "Drug",            hc: rx.drug,              sys: rx.drug },
        { id: "strength", label: "Strength",        hc: rx.strength,          sys: sysStrength },
        { id: "quantity", label: "Quantity",        hc: `#${rx.qty}`,         sys: `#${sysQty}` },
        { id: "days",     label: "Days Supply",     hc: calcDaysSupply,       sys: calcDaysSupply },
        { id: "sig",      label: "Directions (Sig)", hc: rx.sig,              sys: sysSig },
        { id: "daw",      label: "DAW",             hc: `DAW-${rx.daw||"0"}`, sys: `DAW-${rx.daw||"0"}` },
        { id: "refills",  label: "Refills",         hc: String(refills),      sys: String(refills) },
      ];

      const FIELD_LABELS = ["NDC","Drug","Strength","Quantity","Days Supply","Directions (Sig)","DAW","Refills"];
      const labelToField = { "NDC":"ndc","Drug":"drug","Strength":"strength","Quantity":"quantity","Days Supply":"days","Directions (Sig)":"sig","DAW":"daw","Refills":"refills" };

      const CompareTable = () => (
        <div style={{ borderRadius: 7, overflow: "hidden", border: "1px solid #D0D8E0" }}>
          <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 1fr", background: "#0B1F3A" }}>
            <div style={{ ...TM, fontSize: 7, color: "#4A8FA5", padding: "5px 8px", letterSpacing: 1 }}>FIELD</div>
            <div style={{ ...TM, fontSize: 7, color: "#3FB950", padding: "5px 8px", letterSpacing: 1 }}>HARD COPY</div>
            <div style={{ ...TM, fontSize: 7, color: "#7EB8C9", padding: "5px 8px", letterSpacing: 1, borderLeft: "1px solid rgba(255,255,255,0.1)" }}>SYSTEM ENTRY</div>
          </div>
          {compareRows.map(({ id, label, hc, sys }, idx) => (
            <div key={id} style={{ display: "grid", gridTemplateColumns: "80px 1fr 1fr", borderTop: "1px solid #EEF1F4" }}>
              <div style={{ ...TM, fontSize: 8, color: "#5A7080", padding: "7px 8px", background: "#F8FAFB" }}>{label}</div>
              <div style={{ ...TM, fontSize: id==="sig"?8.5:10, color: "#0B4030", padding: "7px 8px", background: "#F2FBF6", fontWeight: 600, lineHeight: 1.35, borderLeft: "1px solid #EEF1F4" }}>{hc}</div>
              <div style={{ ...TM, fontSize: id==="sig"?8.5:10, color: "#1A3060", padding: "7px 8px", background: "#F2F5FB", fontWeight: 600, lineHeight: 1.35, borderLeft: "1px solid #EEF1F4" }}>{sys}</div>
            </div>
          ))}
        </div>
      );

      if (qv1Phase === "review") return (
        <ModalWrap>
          <ModalHeader title="DATA VERIFICATION" sub="QV1 — COMPARE ENTRIES" />
          <div style={{ background: "#FFFFFF", margin: "12px 12px 0", borderRadius: 8, border: "1px solid #D0D8E0", padding: "10px 14px 12px" }}>
            {(() => {
              const allergy = getPatientAllergies(rx.patient);
              const allergyRed = !allergy.startsWith("NKDA");
              return (
                <div style={{ marginBottom: 10, paddingBottom: 10, borderBottom: "1px dashed #E0E8EF" }}>
                  {/* Patient + Prescriber */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 7 }}>
                    <div>
                      <div style={{ ...TM, fontSize: 7, color: "#4A8FA5", letterSpacing: 1, marginBottom: 2 }}>PATIENT</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#0B1F3A" }}>{rx.patient}</div>
                      <div style={{ ...TM, fontSize: 9, color: "#5A7080" }}>DOB: {dob}</div>
                      {rx.patientPhone && <div style={{ ...TM, fontSize: 9, color: "#5A7080" }}>{rx.patientPhone}</div>}
                    </div>
                    <div>
                      <div style={{ ...TM, fontSize: 7, color: "#4A8FA5", letterSpacing: 1, marginBottom: 2 }}>PRESCRIBER</div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#0B1F3A" }}>{prescriber.name}</div>
                      <div style={{ ...TM, fontSize: 9, color: "#5A7080" }}>{prescriber.spec}</div>
                      <div style={{ ...TM, fontSize: 8, color: "#5A7080" }}>{prescriber.npi}</div>
                      {prescriber.dea && <div style={{ ...TM, fontSize: 8, color: "#FF4444", fontWeight: 700, marginTop: 1 }}>DEA: {prescriber.dea}</div>}
                      {prescriber.clinic && <div style={{ ...TM, fontSize: 8, color: "#CC0000", marginTop: 1 }}>{prescriber.clinic}</div>}
                    </div>
                  </div>

                  {/* Allergies + Insurance */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 7 }}>
                    <div style={{ background: allergyRed ? "rgba(204,0,0,0.07)" : "rgba(63,185,80,0.06)", borderRadius: 6, padding: "5px 8px", border: `1px solid ${allergyRed ? "rgba(204,0,0,0.25)" : "rgba(63,185,80,0.2)"}` }}>
                      <div style={{ ...TM, fontSize: 6.5, color: allergyRed ? "#CC0000" : "#3FB950", letterSpacing: 1, marginBottom: 1 }}>ALLERGIES ON FILE</div>
                      <div style={{ ...TM, fontSize: 9, fontWeight: 700, color: allergyRed ? "#CC0000" : "#3FB950" }}>{allergy}</div>
                    </div>
                    {rx.plan?.bin ? (
                      <div style={{ background: "rgba(11,31,58,0.04)", borderRadius: 6, padding: "5px 8px", border: "1px solid rgba(11,31,58,0.1)" }}>
                        <div style={{ ...TM, fontSize: 6.5, color: "#4A8FA5", letterSpacing: 1, marginBottom: 1 }}>INSURANCE / NCPDP</div>
                        <div style={{ ...TM, fontSize: 8, fontWeight: 700, color: "#0B1F3A" }}>BIN {rx.plan.bin} · PCN {rx.plan.pcn}</div>
                        <div style={{ ...TM, fontSize: 7.5, color: "#5A7080" }}>GRP {rx.plan.grp} · ID {rx.memberId || "—"}</div>
                        {rx.copay != null && <div style={{ ...TM, fontSize: 8, color: "#3FB950", fontWeight: 700, marginTop: 1 }}>Co-pay: ${rx.copay}</div>}
                      </div>
                    ) : (
                      <div style={{ background: "rgba(0,0,0,0.04)", borderRadius: 6, padding: "5px 8px", border: "1px solid rgba(0,0,0,0.08)", display: "flex", alignItems: "center" }}>
                        <div style={{ ...TM, fontSize: 9, color: "#6A7A8A", fontWeight: 700 }}>CASH — No Insurance</div>
                      </div>
                    )}
                  </div>

                  {/* Refill history + written date */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 7 }}>
                    <div style={{ background: rx.tooSoon ? "rgba(255,68,68,0.07)" : "rgba(11,31,58,0.03)", borderRadius: 6, padding: "5px 8px", border: `1px solid ${rx.tooSoon ? "rgba(255,68,68,0.3)" : "rgba(0,0,0,0.08)"}` }}>
                      <div style={{ ...TM, fontSize: 6.5, color: rx.tooSoon ? "#FF4444" : "#4A8FA5", letterSpacing: 1, marginBottom: 1 }}>
                        {rx.tooSoon ? "⚠ REFILL TOO SOON" : "REFILL HISTORY"}
                      </div>
                      <div style={{ ...TM, fontSize: 8.5, fontWeight: 700, color: rx.tooSoon ? "#FF4444" : "#0B1F3A" }}>
                        {rx.isFirstFill ? "FIRST FILL — New patient" : rx.lastFillDays != null ? `Last filled: ${rx.lastFillDays} days ago` : "CII — No refill history"}
                      </div>
                      {rx.refillsLeft != null && <div style={{ ...TM, fontSize: 7.5, color: "#5A7080", marginTop: 1 }}>Refills remaining: {rx.refillsLeft}</div>}
                    </div>
                    <div style={{ background: "rgba(11,31,58,0.03)", borderRadius: 6, padding: "5px 8px", border: "1px solid rgba(0,0,0,0.08)" }}>
                      <div style={{ ...TM, fontSize: 6.5, color: "#4A8FA5", letterSpacing: 1, marginBottom: 1 }}>SCRIPT DATES</div>
                      <div style={{ ...TM, fontSize: 8, color: "#0B1F3A" }}>Written: {rx.writtenDate || scriptWrittenDate}</div>
                      <div style={{ ...TM, fontSize: 8, color: "#5A7080", marginTop: 1 }}>Expires: {rx.scriptExpDate || "—"}</div>
                    </div>
                  </div>

                  {/* CS warning */}
                  {rx.csSchedule && (
                    <div style={{ background: "rgba(255,68,68,0.08)", border: "1px solid rgba(255,68,68,0.35)", borderRadius: 6, padding: "6px 10px", display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                      <span style={{ ...TM, fontSize: 11, fontWeight: 900, color: "#FF4444" }}>{rx.csSchedule}</span>
                      <span style={{ ...TM, fontSize: 8, color: "#CC2222" }}>
                        {rx.csSchedule === "CII" ? "SCHEDULE II — Written Rx only. No verbal/fax. No refills. DEA log required." : "CONTROLLED — Verify prescriber DEA. Log required."}
                      </span>
                    </div>
                  )}

                  {/* PA status */}
                  {rx.paStatus && (
                    <div style={{ background: rx.paStatus.startsWith("PA ON FILE") ? "rgba(63,185,80,0.07)" : "rgba(255,184,0,0.1)", border: `1px solid ${rx.paStatus.startsWith("PA ON FILE") ? "rgba(63,185,80,0.25)" : "rgba(255,184,0,0.4)"}`, borderRadius: 6, padding: "5px 10px", marginBottom: 7 }}>
                      <div style={{ ...TM, fontSize: 6.5, color: rx.paStatus.startsWith("PA ON FILE") ? "#3FB950" : "#CC8800", letterSpacing: 1, marginBottom: 1 }}>PRIOR AUTHORIZATION</div>
                      <div style={{ ...TM, fontSize: 9, fontWeight: 700, color: rx.paStatus.startsWith("PA ON FILE") ? "#3FB950" : "#CC8800" }}>{rx.paStatus}</div>
                    </div>
                  )}

                  {/* Generic sub opportunity */}
                  {rx.genericSub && (
                    <div style={{ background: "rgba(126,184,201,0.1)", border: "1px solid rgba(126,184,201,0.3)", borderRadius: 6, padding: "5px 10px" }}>
                      <div style={{ ...TM, fontSize: 6.5, color: "#4A8FA5", letterSpacing: 1, marginBottom: 1 }}>GENERIC SUBSTITUTION AVAILABLE</div>
                      <div style={{ ...TM, fontSize: 8.5, color: "#0B1F3A" }}>Generic available — saves patient <span style={{ fontWeight: 700, color: "#3FB950" }}>${rx.genericSub.saving}</span>. DAW-0 allows substitution unless patient requests brand.</div>
                    </div>
                  )}
                </div>
              );
            })()}
            <div style={{ ...TM, fontSize: 8, color: "#CC0000", letterSpacing: 1.5, marginBottom: 8, fontWeight: 700 }}>
              COMPARE HARD COPY ↔ SYSTEM ENTRY — FIND ANY MISMATCH
            </div>
            <CompareTable />
          </div>
          <div style={{ padding: "10px 12px 16px", display: "grid", gap: 8 }}>
            <button onClick={() => { approveData(rx, !qv1Error); onClose(); }}
              style={{ ...TM, padding: "13px 0", background: "#0B1F3A", color: "#3FB950", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, letterSpacing: 1.5, cursor: "pointer" }}>
              ✓ APPROVE — ENTRIES MATCH
            </button>
            <button onClick={() => setVerifyModal(v => ({ ...v, qv1Phase: "holdPick", holdField: null }))}
              style={{ ...TM, padding: "11px 0", background: "rgba(204,0,0,0.06)", color: "#CC0000", border: "1px solid rgba(204,0,0,0.3)", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
              ⚠ HOLD — I FOUND A DISCREPANCY
            </button>
          </div>
        </ModalWrap>
      );

      if (qv1Phase === "holdPick") return (
        <ModalWrap>
          <ModalHeader title="DATA VERIFICATION" sub="QV1 — FLAG THE ERROR" />
          <div style={{ background: "#FFFFFF", margin: "12px 12px 0", borderRadius: 8, border: "1px solid #D0D8E0", padding: "14px" }}>
            <div style={{ ...TM, fontSize: 10, color: "#0B1F3A", marginBottom: 12, fontWeight: 600, lineHeight: 1.4 }}>
              Which field has a mismatch between the hard copy and the system entry?
            </div>
            {FIELD_LABELS.map((opt) => (
              <button key={opt} onClick={() => setVerifyModal(v => ({ ...v, holdField: opt }))}
                style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 12px", marginBottom: 6, background: holdField === opt ? "rgba(204,0,0,0.08)" : "#F8FAFB", border: `1.5px solid ${holdField === opt ? "#CC0000" : "#D0D8E0"}`, borderRadius: 7, cursor: "pointer", ...TM, fontSize: 11, color: holdField === opt ? "#CC0000" : "#1A2A35", fontWeight: holdField === opt ? 700 : 400 }}>
                {holdField === opt ? "▶  " : "    "}{opt}
              </button>
            ))}
          </div>
          <div style={{ padding: "10px 12px 16px", display: "grid", gap: 8 }}>
            <button onClick={() => holdField && setVerifyModal(v => ({ ...v, qv1Phase: "holdResult" }))}
              style={{ ...TM, padding: "13px 0", background: holdField ? "#CC0000" : "#C8D4DC", color: "#FFFFFF", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: holdField ? "pointer" : "not-allowed", letterSpacing: 1 }}>
              CONFIRM — {holdField ? holdField.toUpperCase() : "SELECT A FIELD"}
            </button>
            <button onClick={() => setVerifyModal(v => ({ ...v, qv1Phase: "review" }))}
              style={{ ...TM, padding: "10px 0", background: "transparent", color: "#4A8FA5", border: "1px solid #D0D8E0", borderRadius: 8, fontSize: 10, cursor: "pointer" }}>
              ← BACK — REVIEW TABLE AGAIN
            </button>
          </div>
        </ModalWrap>
      );

      // holdResult phase
      const pickedId = labelToField[holdField];
      const isCorrectCatch = !!(qv1Error && pickedId === qv1Error.field);
      const isFalseHold = !qv1Error;
      const isWrongField = !!(qv1Error && !isCorrectCatch);
      return (
        <ModalWrap>
          <ModalHeader title="DATA VERIFICATION" sub="QV1 — RESULT" />
          <div style={{ margin: "12px 12px 0", borderRadius: 8, overflow: "hidden", border: `1px solid ${isCorrectCatch ? "rgba(63,185,80,0.4)" : "rgba(255,68,68,0.35)"}` }}>
            <div style={{ background: isCorrectCatch ? "rgba(63,185,80,0.1)" : isFalseHold ? "rgba(255,68,68,0.08)" : "rgba(255,184,0,0.1)", padding: "14px 16px" }}>
              <div style={{ ...TM, fontSize: 15, fontWeight: 800, marginBottom: 8, color: isCorrectCatch ? "#3FB950" : isFalseHold ? "#FF4444" : "#FFB800" }}>
                {isCorrectCatch ? "✓ GOOD CATCH!" : isFalseHold ? "✗ FALSE HOLD" : "✗ WRONG FIELD"}
              </div>
              <div style={{ ...TM, fontSize: 10, lineHeight: 1.6, color: "#1A2A35" }}>
                {isCorrectCatch && (
                  <>You identified the <strong>{qv1Error.label}</strong> mismatch.<br />
                  Hard copy: <strong style={{ color: "#0B4030" }}>{qv1Error.correct}</strong> &nbsp;·&nbsp;
                  Entered: <strong style={{ color: "#CC0000" }}>{qv1Error.entered}</strong><br />
                  Script corrected and released to fill.</>
                )}
                {isFalseHold && (
                  <>All fields matched the hard copy — no discrepancy existed.<br />
                  Unnecessary holds slow the queue and patient wait time.</>
                )}
                {isWrongField && (
                  <><strong>{holdField}</strong> matched. The actual mismatch was <strong>{qv1Error.label}</strong>:<br />
                  Hard copy: <strong style={{ color: "#0B4030" }}>{qv1Error.correct}</strong> &nbsp;·&nbsp;
                  Entered: <strong style={{ color: "#CC0000" }}>{qv1Error.entered}</strong></>
                )}
              </div>
            </div>
          </div>
          <div style={{ padding: "10px 12px 16px" }}>
            <button onClick={() => { approveData(rx, isCorrectCatch); onClose(); }}
              style={{ ...TM, width: "100%", padding: "13px 0", background: isCorrectCatch ? "#0B4020" : "#0B1F3A", color: isCorrectCatch ? "#3FB950" : "#7EB8C9", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, letterSpacing: 1.5, cursor: "pointer" }}>
              {isCorrectCatch ? "✓ CORRECTED — RELEASE TO FILL" : "RELEASE TO FILL"}
            </button>
          </div>
        </ModalWrap>
      );
    }

    return (
      <ModalWrap>
        <ModalHeader title="FINAL VERIFICATION" sub="QV2 — RPh CHECK REQUIRED" />

        <div style={{ background: "#FFFFFF", margin: "12px 12px 0", borderRadius: 8, border: "1px solid #D0D8E0", overflow: "hidden" }}>
          <div style={{ background: "#0B2A3F", padding: "6px 12px" }}>
            <span style={{ ...TM, color: "#7EB8C9", fontSize: 9, letterSpacing: 1.5 }}>ORIGINAL PRESCRIPTION</span>
          </div>
          <div style={{ padding: "10px 14px" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0B1F3A" }}>{rx.patient}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#0B1F3A", marginTop: 4 }}>{rx.drug} <span style={{ fontWeight: 600, color: "#1A4060" }}>{rx.strength}</span></div>
            <div style={{ display: "flex", gap: 20, marginTop: 6 }}>
              <div><span style={{ ...TM, fontSize: 8, color: "#4A8FA5", display: "block", letterSpacing: 1 }}>DISPENSE</span><span style={{ ...TM, fontSize: 13, fontWeight: 700, color: "#0B1F3A" }}>#{rx.qty}</span></div>
              <div><span style={{ ...TM, fontSize: 8, color: "#4A8FA5", display: "block", letterSpacing: 1 }}>DIRECTIONS</span><span style={{ ...TM, fontSize: 10, color: "#1A2A35" }}>{rx.sig}</span></div>
            </div>
          </div>
        </div>

        <div style={{ background: "#FFFFFF", margin: "8px 12px 0", borderRadius: 8, border: "1px solid #D0D8E0", overflow: "hidden" }}>
          <div style={{ background: "#2A1F00", padding: "6px 12px" }}>
            <span style={{ ...TM, color: "#FFB800", fontSize: 9, letterSpacing: 1.5 }}>FILLED VIAL — INSPECT NOW</span>
          </div>
          <div style={{ padding: "12px 14px", display: "flex", gap: 14, alignItems: "flex-start" }}>
            <VialScatter p={f.pill} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#1A2A35" }}>{f.stockDrug} {f.stockStrength}</div>
              <div style={{ ...TM, fontSize: 9, color: "#5A7080", marginTop: 3 }}>NDC: {f.stockNdc}</div>
              <div style={{ marginTop: 8, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                <div style={{ background: "#F2F5F7", borderRadius: 6, padding: "5px 8px" }}>
                  <div style={{ ...TM, fontSize: 8, color: "#4A8FA5", letterSpacing: 1 }}>COUNT</div>
                  <div style={{ ...TM, fontSize: 15, fontWeight: 700, color: "#0B1F3A", marginTop: 2 }}>{f.count}</div>
                </div>
                <div style={{ background: "#F2F5F7", borderRadius: 6, padding: "5px 8px" }}>
                  <div style={{ ...TM, fontSize: 8, color: "#4A8FA5", letterSpacing: 1 }}>IMPRINT</div>
                  <div style={{ ...TM, fontSize: 12, fontWeight: 700, color: "#0B1F3A", marginTop: 2 }}>{f.pill.imprint}</div>
                  <div style={{ ...TM, fontSize: 9, color: "#5A7080" }}>{f.pill.shape}</div>
                </div>
              </div>
            </div>
          </div>
          <div style={{ margin: "0 14px 12px", padding: "8px 10px", background: "#FFFBE6", borderRadius: 6, border: "1px solid #FFE08A" }}>
            <div style={{ ...TM, fontSize: 8, color: "#7A5C00", letterSpacing: 1.5, marginBottom: 4 }}>DISPENSING LABEL</div>
            <div style={{ ...TM, fontSize: 11, fontWeight: 600, color: "#3A2800" }}>{f.labelPatient}</div>
            <div style={{ ...TM, fontSize: 11, color: "#3A2800", marginTop: 2 }}>{f.labelDrug}</div>
            <div style={{ ...TM, fontSize: 10, color: "#5A4400", marginTop: 2, lineHeight: 1.4 }}>{f.labelSig}</div>
          </div>
        </div>

        <div style={{ background: "#FFFFFF", margin: "8px 12px 0", borderRadius: 8, border: "1px solid #D0D8E0", overflow: "hidden" }}>
          <div style={{ background: "#F2F5F7", padding: "6px 12px", borderBottom: "1px solid #D0D8E0" }}>
            <span style={{ ...TM, fontSize: 9, color: "#5A7080", letterSpacing: 1.5 }}>VERIFICATION CHECKLIST</span>
          </div>
          <div style={{ padding: "4px 12px 8px" }}>
            <CheckRow label="Drug / Strength" ok={drugStrOk} expected={`${rx.drug} ${rx.strength}`} actual={`${f.stockDrug} ${f.stockStrength}`} />
            <CheckRow label="Quantity" ok={countOk} expected={`#${rx.qty}`} actual={`${f.count} counted`} />
            <CheckRow label="Pill Appearance" ok={pillOk} expected={`${ref.pill.imprint} · ${ref.pill.shape}`} actual={`${f.pill.imprint} · ${f.pill.shape}`} />
            <CheckRow label="Label — Patient" ok={lPatOk} expected={rx.patient} actual={f.labelPatient} />
            <CheckRow label="Label — Directions" ok={lSigOk} expected={rx.sig} actual={f.labelSig} />
          </div>
        </div>

        <div style={{ position: "sticky", bottom: 0, padding: "10px 12px max(16px, env(safe-area-inset-bottom))", display: "grid", gap: 8, background: "#F2F5F7", borderTop: "1px solid #D0D8E0", boxShadow: "0 -10px 24px rgba(7,21,35,0.08)" }}>
          <button onClick={() => { finalAction(rx, "approve"); onClose(); }} style={{ ...TM, padding: "13px 0", background: "#0B1F3A", color: "#3FB950", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, letterSpacing: 1.5, cursor: "pointer" }}>
            ✓ APPROVE — RELEASE TO PICKUP
          </button>
          <button onClick={() => { finalAction(rx, "reject"); onClose(); }} style={{ ...TM, padding: "13px 0", background: "rgba(255,68,68,0.06)", color: "#FF4444", border: "1px solid rgba(255,68,68,0.35)", borderRadius: 8, fontSize: 12, fontWeight: 700, letterSpacing: 1, cursor: "pointer" }}>
            ✕ REJECT — DO NOT DISPENSE
          </button>
        </div>
      </ModalWrap>
    );
  };

  if (shiftReport) return <ShiftReport report={shiftReport} hourlyRate={hourlyRate} onContinue={continueShiftReport} />;
  if (auditOpen) return <SafeAudit onBalanced={finishAfterAudit} summary={pendingSummary} />;

  const hottest = livePatients.reduce((winner, rx) => {
    if (!winner) return rx;
    return patientLeftMs(rx) < patientLeftMs(winner) ? rx : winner;
  }, null);

  return (
    <div>
      {verifyModal && <ScriptModal vm={verifyModal} onClose={() => setVerifyModal(null)} />}
      {/* ── CVS SHIFT HEADER ── */}
      <div style={{ background: "#CC0000", borderRadius: "10px 10px 0 0", padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ ...TM, color: "rgba(255,255,255,0.65)", fontSize: 8, letterSpacing: 2, marginBottom: 3 }}>CVS PHARMACY · RXCONNECT</div>
          <div style={{ ...TM, color: "#FFFFFF", fontSize: 13, fontWeight: 700 }}>SHIFT ACTIVE · QT / QV1 / QP / QV2</div>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          {[
            { k: "FILLED",  v: completed,                                                  c: "#FFFFFF" },
            { k: "ACCURACY", v: completed ? `${Math.round((correct/completed)*100)}%` : "—", c: "#FFE57A" },
            { k: "STAR",    v: `${serviceScore}%`,                                          c: serviceColor === C.green ? "#3FB950" : serviceColor === C.amber ? "#FFB800" : "#FF4444" },
            { k: "STREAK",  v: `×${chainStreak}`,                                           c: chainStreak >= 5 ? "#3FB950" : "rgba(255,255,255,0.7)" },
          ].map(({ k, v, c }) => (
            <div key={k} style={{ ...TM, textAlign: "center", background: "rgba(0,0,0,0.25)", borderRadius: 6, padding: "4px 8px" }}>
              <div style={{ color: c, fontSize: 13, fontWeight: 700, lineHeight: 1 }}>{v}</div>
              <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 7, letterSpacing: 1, marginTop: 2 }}>{k}</div>
            </div>
          ))}
          <button onClick={wtfButton} style={{ ...TM, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.3)", color: "#FFFFFF", borderRadius: 7, padding: "6px 11px", cursor: "pointer", fontSize: 10, fontWeight: 700 }}>
            MANAGER CALL
          </button>
          <button onClick={() => startSafeAudit()} style={{ ...TM, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "#FFFFFF", borderRadius: 7, padding: "6px 11px", cursor: "pointer", fontSize: 10 }}>
            CLOCK OUT
          </button>
        </div>
      </div>

      {/* ── RXCONNECT STATUS STRIP ── */}
      <div style={{ background: "#0F2A3F", padding: "8px 14px 10px", marginBottom: 12, borderTop: "1px solid rgba(204,0,0,0.3)", borderRadius: "0 0 10px 10px" }}>
        <div style={{ ...TM, color: "rgba(126,184,201,0.4)", fontSize: 6.5, letterSpacing: 2, marginBottom: 6 }}>RXCONNECT · LIVE QUEUE</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr) 2fr", gap: 7 }}>
          {[
            { k: "QT",  label: "To Type",   v: toVerifyData.length, hi: 4 },
            { k: "QV1", label: "Verify",    v: toVerifyData.length, hi: 4 },
            { k: "QP",  label: "Filling",   v: inProduction.length, hi: 3 },
            { k: "QV2", label: "Final Chk", v: finalCheck.length,   hi: 3 },
          ].map(({ k, label, v, hi }) => (
            <div key={k} style={{ background: "rgba(0,0,0,0.3)", borderRadius: 7, padding: "6px 4px", textAlign: "center" }}>
              <div style={{ ...TM, color: v >= hi ? "#FF4444" : v > 0 ? "#FFB800" : "#3FB950", fontSize: 17, fontWeight: 700, lineHeight: 1 }}>{v}</div>
              <div style={{ ...TM, color: v >= hi ? "#FF4444" : "#3A6070", fontSize: 7, letterSpacing: 1, marginTop: 2 }}>{k}</div>
              <div style={{ ...TM, color: "rgba(126,184,201,0.35)", fontSize: 6, marginTop: 1 }}>{label}</div>
            </div>
          ))}
          <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 7, padding: "6px 8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ ...TM, color: "#3A6070", fontSize: 7, letterSpacing: 1 }}>FLOOR PRESSURE</span>
              <span style={{ ...TM, color: chainPressure >= 70 ? "#FF4444" : chainPressure >= 45 ? "#FFB800" : "#3FB950", fontSize: 7 }}>{chainPressure}%</span>
            </div>
            <div style={{ height: 4, background: "rgba(0,0,0,0.4)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ width: `${chainPressure}%`, height: "100%", background: chainPressure >= 70 ? "#FF4444" : chainPressure >= 45 ? "#FFB800" : "#3FB950", transition: "width .25s ease" }} />
            </div>
          </div>
        </div>

        {/* Drive-thru + hottest + chain toast row */}
        <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
          <div className={bell.bellActive ? "alarm-pulse" : ""} style={{ flex: "1 1 130px", background: bell.bellActive ? "rgba(255,68,68,0.18)" : "rgba(0,0,0,0.25)", borderRadius: 7, padding: "6px 10px", border: bell.bellActive ? "1px solid rgba(255,68,68,0.5)" : "1px solid transparent" }}>
            <div style={{ ...TM, color: bell.bellActive ? "#FF4444" : "#3A6070", fontSize: 7, letterSpacing: 1.5 }}>DRIVE-THRU</div>
            <div style={{ ...TM, color: bell.bellActive ? "#FF4444" : "#3FB950", fontSize: 12, fontWeight: 700, marginTop: 2 }}>{bell.bellActive ? "▶ RINGING" : `${bell.bellCount} triggers`}</div>
          </div>
          <div style={{ flex: "1 1 130px", background: "rgba(0,0,0,0.25)", borderRadius: 7, padding: "6px 10px" }}>
            <div style={{ ...TM, color: "#3A6070", fontSize: 7, letterSpacing: 1.5 }}>HOTTEST PATIENT</div>
            <div style={{ ...TM, color: hottest && patientLeftMs(hottest) < 15000 ? "#FF4444" : "#E8F4F8", fontSize: 12, fontWeight: 700, marginTop: 2 }}>
              {hottest ? `${Math.ceil(patientLeftMs(hottest) / 1000)}s left` : "● CLEAR"}
            </div>
          </div>
          {chainToast && (
            <div className="pop" style={{ flex: "1 1 130px", background: "rgba(63,185,80,0.15)", border: "1px solid rgba(63,185,80,0.3)", borderRadius: 7, padding: "6px 10px", ...TM, color: "#3FB950", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center" }}>
              {chainToast}
            </div>
          )}
        </div>
      </div>

      <ProgressBar value={(completed / Math.max(total, 1)) * 100} />

      {/* ── CHAIN TASKS ── */}
      <div style={{ background: "#FFFFFF", borderRadius: 10, border: "1px solid #D0D8E0", padding: "10px 12px", margin: "10px 0" }}>
        <div style={{ ...TM, color: "#5A7080", fontSize: 8, letterSpacing: 1.5, marginBottom: 8 }}>SERVICE QUEUE — TAP TO CLEAR</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 7 }}>
          {CHAIN_TASKS.map((task) => <ChainTaskButton key={task.id} task={task} />)}
        </div>
      </div>

      {/* ── PATIENT COLUMNS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
        <Column title="QT / QV1 DATA" count={toVerifyData.length} color="#3FB950">
          {!toVerifyData.length && <EmptyLane text="No scripts in queue." />}
          {toVerifyData.map((rx) => (
            <div key={rx.id} style={{ background: "#FFFFFF", borderRadius: 8, overflow: "hidden", border: "1px solid #D0D8E0" }}>
              <div style={{ background: "#0B1F3A", padding: "5px 10px 5px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ ...TM, color: "#E8F4F8", fontSize: 10, fontWeight: 700 }}>{rx.patient}</span>
                <span style={{ ...TM, color: "#7EB8C9", fontSize: 8 }}>Rx#{rx.rxNum}</span>
              </div>
              <div style={{ background: "#F8F9FA", padding: "5px 10px", borderBottom: "1px solid #E8EDF1" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                  <span style={{ ...TM, fontSize: 8, color: "#5A7080" }}>{rx.insurancePlan || "Cash"}{rx.copay != null ? ` — $${rx.copay} co-pay` : ""}</span>
                  <span style={{ ...TM, fontSize: 7, color: rx.lane === "Drive-thru" ? "#FFB800" : rx.lane === "Waiter" ? "#FF4444" : "#3FB950", fontWeight: 700 }}>{rx.lane?.toUpperCase()}</span>
                </div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  <span style={{ ...TM, fontSize: 7, color: "#4A8FA5", background: "rgba(74,143,165,0.1)", borderRadius: 3, padding: "1px 5px" }}>{rx.scriptType || "eRx"}</span>
                  {rx.csSchedule && <span style={{ ...TM, fontSize: 7, fontWeight: 700, color: "#FF4444", background: "rgba(255,68,68,0.12)", borderRadius: 3, padding: "1px 5px" }}>{rx.csSchedule}</span>}
                  {rx.plan?.bin && <span style={{ ...TM, fontSize: 7, color: "#7A8A9A", background: "rgba(0,0,0,0.05)", borderRadius: 3, padding: "1px 5px" }}>BIN {rx.plan.bin}</span>}
                </div>
              </div>
              <div style={{ padding: "8px 10px 10px" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1A2A35" }}>{rx.drug}</div>
                <div style={{ ...TM, fontSize: 10, color: "#3A5060", marginTop: 1 }}>{rx.strength} · #{rx.qty}</div>
                <div style={{ ...TM, fontSize: 9, color: "#8A9AAA", marginTop: 2, lineHeight: 1.3 }}>{rx.sig}</div>
                <PressureMeter rx={rx} />
                <button onClick={() => setVerifyModal({ rx, stage: "qv1", qv1Phase: "review", holdField: null })} style={{ ...TM, width: "100%", marginTop: 9, padding: "9px 0", background: "#CC0000", color: "#FFFFFF", border: "none", borderRadius: 7, fontSize: 10, fontWeight: 700, letterSpacing: 1, cursor: "pointer" }}>
                  {rx.qv1Error ? "⚠ QV1 — REVIEW SCRIPT" : "QV1 — VERIFY ▶"}
                </button>
              </div>
            </div>
          ))}
        </Column>

        <Column title="QP PRODUCTION" count={inProduction.length} color="#FFB800">
          {!inProduction.length && <EmptyLane text="No fills running." />}
          {inProduction.map((rx) => {
            const remaining = Math.max(0, Math.ceil((rx.readyAt - now) / 1000));
            const pct = Math.min(100, Math.max(0, ((rx.etaMs - Math.max(0, rx.readyAt - now)) / rx.etaMs) * 100));
            return (
              <div key={rx.id} style={{ background: "#FFFFFF", borderRadius: 8, overflow: "hidden", border: "1px solid #D0D8E0" }}>
                <div style={{ background: "#2A1F00", padding: "6px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ ...TM, color: "#E8F4F8", fontSize: 10, fontWeight: 600 }}>{rx.patient}</span>
                  <span style={{ ...TM, color: "#FFB800", fontSize: 8, letterSpacing: 1 }}>FILLING</span>
                </div>
                <div style={{ padding: "8px 10px 10px" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1A2A35" }}>{rx.drug} {rx.strength}</div>
                  <div style={{ ...TM, color: "#FFB800", fontSize: 10, marginTop: 3 }}>FILL RUNNING — {remaining}s</div>
                  <div style={{ height: 4, background: "#E8EDF1", borderRadius: 2, overflow: "hidden", marginTop: 6 }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: "#FFB800", transition: "width .25s linear" }} />
                  </div>
                  <PressureMeter rx={rx} />
                </div>
              </div>
            );
          })}
        </Column>

        <Column title="QV2 FINAL CHECK" count={finalCheck.length} color="#7EB8C9">
          {!finalCheck.length && <EmptyLane text="No filled vials ready yet." />}
          {finalCheck.map((rx) => {
            const needsReject = rx.fillCase.errorField !== null;
            return (
              <div key={rx.id} style={{ background: "#FFFFFF", borderRadius: 8, overflow: "hidden", border: `1px solid ${needsReject ? "#FFB80066" : "#D0D8E0"}` }}>
                <div style={{ background: needsReject ? "#3A1A00" : "#0B1F3A", padding: "5px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ ...TM, color: "#E8F4F8", fontSize: 10, fontWeight: 700 }}>{rx.patient}</span>
                  <span style={{ ...TM, color: needsReject ? "#FFB800" : "#7EB8C9", fontSize: 8 }}>Rx#{rx.rxNum}</span>
                </div>
                <div style={{ background: "#F8F9FA", padding: "4px 10px", borderBottom: "1px solid #E8EDF1", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ ...TM, fontSize: 8, color: "#5A7080" }}>{rx.insurancePlan || "Cash"}</span>
                  <span style={{ ...TM, fontSize: 7, color: needsReject ? "#FFB800" : "#3FB950", fontWeight: 700 }}>{needsReject ? "⚠ FILL ERROR" : "READY FOR RPH"}</span>
                </div>
                <div style={{ padding: "8px 10px 10px" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1A2A35" }}>{rx.drug}</div>
                  <div style={{ ...TM, fontSize: 10, color: "#3A5060", marginTop: 1 }}>{rx.strength} · #{rx.qty}</div>
                  <PressureMeter rx={rx} />
                  <button onClick={() => setVerifyModal({ rx, stage: "qv2" })} style={{ ...TM, width: "100%", marginTop: 9, padding: "9px 0", background: needsReject ? "#FFB800" : "#CC0000", color: needsReject ? "#3A2800" : "#FFFFFF", border: "none", borderRadius: 7, fontSize: 10, fontWeight: 700, letterSpacing: 1, cursor: "pointer" }}>
                    {needsReject ? "⚠ QV2 — INSPECT FILL" : "QV2 — FINAL CHECK ▶"}
                  </button>
                </div>
              </div>
            );
          })}
        </Column>
      </div>

      <button onClick={onQuit} style={{ ...TM, background: "transparent", border: "1px solid #D0D8E0", color: "#8A9AAA", borderRadius: 8, width: "100%", marginTop: 12, padding: "9px 0", cursor: "pointer", fontSize: 11 }}>
        CLOCK OUT / HOME
      </button>

      {malpracticeFlash && (
        <div className="malpractice-flash" style={{
          position: "fixed", inset: 0, zIndex: 88, display: "grid", placeItems: "center", padding: 18,
          background: "rgba(178,20,20,0.88)", color: "#fff", textAlign: "center", pointerEvents: "none",
        }}>
          <div style={{
            width: "min(520px, 100%)", border: "4px solid #fff", borderRadius: 12, padding: 20,
            background: "rgba(40,0,0,0.72)", boxShadow: "0 0 46px rgba(255,255,255,0.38)",
          }}>
            <div className="pixel" style={{ fontSize: 10, color: "#ffe1d8", marginBottom: 10 }}>MALPRACTICE SETTLEMENT</div>
            <div className="display" style={{ fontSize: 42, fontWeight: 900, lineHeight: 1 }}>{money(-malpracticeFlash.penalty)}</div>
            <p style={{ margin: "12px auto 0", maxWidth: 380, lineHeight: 1.45 }}>
              Severe verification failure on {malpracticeFlash.patient}: {malpracticeFlash.drug}.
            </p>
          </div>
        </div>
      )}

      {meltdown && (
        <div className="alarm-pulse" style={{
          position: "fixed", inset: 0, zIndex: 90, display: "grid", placeItems: "center", padding: 18,
          background: "radial-gradient(circle at 50% 20%, rgba(255,77,48,0.98), rgba(128,0,0,0.96) 48%, rgba(38,0,0,0.98))",
          color: "#fff", textAlign: "center",
        }}>
          <div style={{
            width: "min(560px, 100%)", borderRadius: 14, padding: 22, border: "3px solid rgba(255,255,255,0.72)",
            background: "rgba(30,0,0,0.58)", boxShadow: "0 24px 60px rgba(0,0,0,0.42)",
          }}>
            <div className="pixel" style={{ fontSize: 12, color: "#ffe1d8", marginBottom: 12 }}>PATIENT MELTDOWN</div>
            <div className="display" style={{ fontSize: 40, fontWeight: 900, lineHeight: 1, marginBottom: 10 }}>SCREEN FROZEN</div>
            <p style={{ margin: "0 auto 18px", maxWidth: 430, lineHeight: 1.45, fontSize: 15.5 }}>
              {meltdown.patient} hit zero patience at {meltdown.lane} while waiting on {meltdown.drug}. Alarms stay live until the manager de-escalates.
            </p>
            <button onClick={wtfButton} style={btn("#fff", C.clay, { width: "100%", maxWidth: 330, fontSize: 17, fontWeight: 900 })}>
              WTF Button
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CareerMode({ level, onQuit }) {
  const [bankBalance, setBankBalance] = useState(1000);
  const [hourlyRate, setHourlyRate] = useState(65);
  const [dayCount, setDayCount] = useState(1);
  const [consecutiveCleanShifts, setConsecutiveCleanShifts] = useState(0);
  const [phase, setPhase] = useState("dashboard");
  const [lastShift, setLastShift] = useState(null);
  const [promotion, setPromotion] = useState(null);

  function processShift(payload) {
    const nextBank = bankBalance + payload.netProfit;
    const clean = payload.penaltyCount === 0;
    const nextClean = clean ? consecutiveCleanShifts + 1 : 0;
    const nextDay = dayCount + 1;

    setLastShift(payload);
    setBankBalance(nextBank);
    setDayCount(nextDay);

    if (nextBank < 0) {
      setConsecutiveCleanShifts(nextClean);
      setPhase("terminated");
      return;
    }

    if (clean && nextClean >= 3) {
      const nextRate = hourlyRate + 5;
      setHourlyRate(nextRate);
      setConsecutiveCleanShifts(0);
      setPromotion({ from: hourlyRate, to: nextRate, day: nextDay });
      setPhase("promotion");
      return;
    }

    setConsecutiveCleanShifts(nextClean);
    setPhase("dashboard");
  }

  const TM = { fontFamily: "'Spline Sans Mono',monospace" };

  const HeaderStat = ({ label, value, color }) => (
    <div style={{ minWidth: 100, padding: "8px 12px", borderRadius: 8, border: "1px solid #1E3A52", background: "rgba(255,255,255,0.06)" }}>
      <div style={{ ...TM, fontSize: 18, fontWeight: 700, color: color || "#E8F4F8", lineHeight: 1 }}>{value}</div>
      <div style={{ ...TM, fontSize: 9, color: "#4A8FA5", textTransform: "uppercase", letterSpacing: 1.2, marginTop: 4 }}>{label}</div>
    </div>
  );

  const careerHeader = (
    <div style={{ background: "#0B1F3A", borderRadius: 10, padding: "10px 14px", marginBottom: 14, position: "sticky", top: 8, zIndex: 40 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div>
          <div style={{ ...TM, fontSize: 9, color: "#4A8FA5", letterSpacing: 2, marginBottom: 4 }}>RXPRO — CAREER MODE</div>
          <div style={{ ...TM, fontSize: 16, fontWeight: 700, color: "#E8F4F8", lineHeight: 1 }}>Chain Pharmacy Career</div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <HeaderStat label="Bank" value={money(bankBalance)} color={bankBalance >= 0 ? "#3FB950" : "#FF4444"} />
          <HeaderStat label="Hourly" value={money(hourlyRate)} color="#7EB8C9" />
          <HeaderStat label="Day" value={dayCount} color="#E8F4F8" />
          <HeaderStat label="Clean" value={`${consecutiveCleanShifts}/3`} color={consecutiveCleanShifts >= 2 ? "#3FB950" : "#4A8FA5"} />
        </div>
      </div>
    </div>
  );

  if (phase === "shift") {
    return (
      <div className="rise">
        {careerHeader}
        <ManagerShift
          level={Math.max(level || 4, 4)}
          hourlyRate={hourlyRate}
          onShiftComplete={processShift}
          onQuit={() => setPhase("dashboard")}
        />
      </div>
    );
  }

  if (phase === "terminated") {
    return (
      <div className="rise">
        {careerHeader}
        <div className="malpractice-flash" style={{
          borderRadius: 16, padding: 24, textAlign: "center", color: "#fff",
          background: "radial-gradient(circle at 50% 20%, #f04435, #7a0505 58%, #220000)",
          border: "4px solid rgba(255,255,255,0.82)", boxShadow: "0 24px 60px -24px rgba(178,58,36,0.9)",
        }}>
          <div className="pixel" style={{ fontSize: 12, color: "#ffe1d8", marginBottom: 14 }}>TERMINATED</div>
          <div className="display" style={{ fontSize: 42, fontWeight: 900, lineHeight: 1 }}>Bankrupt</div>
          <p style={{ maxWidth: 430, margin: "16px auto 0", lineHeight: 1.5 }}>
            Your pharmacy career ledger dropped below zero after the last shift. The store has locked you out.
          </p>
          {lastShift && (
            <div className="mono" style={{ marginTop: 16, fontSize: 12, color: "#ffe1d8" }}>
              Last net: {money(lastShift.netProfit)} / Penalties: {money(lastShift.totalPenalties || 0)}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (phase === "promotion" && promotion) {
    return (
      <div className="rise">
        {careerHeader}
        <div className="pop" style={{
          borderRadius: 16, padding: 24, textAlign: "center", color: "#111816",
          background: "linear-gradient(135deg, #ffe08a, #f2b441 42%, #fff5cc)",
          border: "4px solid #fff", boxShadow: "0 26px 60px -24px rgba(192,120,30,0.95)",
        }}>
          <div className="pixel blink" style={{ fontSize: 12, color: "#B05C10", marginBottom: 14 }}>PROMOTION EARNED</div>
          <div className="display" style={{ fontSize: 40, fontWeight: 900, lineHeight: 1 }}>Hourly Rate Up</div>
          <p style={{ maxWidth: 450, margin: "16px auto 0", lineHeight: 1.5, fontWeight: 700 }}>
            Three clean shifts in a row. Corporate bumped you from {money(promotion.from)} to {money(promotion.to)} per hour.
          </p>
          <button onClick={() => setPhase("dashboard")} style={{ fontFamily: "'Spline Sans Mono',monospace", marginTop: 20, minWidth: 220, padding: "12px 20px", background: "#0B1F3A", color: "#3FB950", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, letterSpacing: 1.5, cursor: "pointer", textTransform: "uppercase" }}>
            ▶ CONTINUE CAREER
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rise">
      {careerHeader}
      <div style={{ background: "#FFFFFF", borderRadius: 10, border: "1px solid #D0D8E0", padding: 22, overflow: "hidden", position: "relative", boxShadow: "0 2px 10px rgba(0,20,40,0.07)" }}>
        <div style={{ ...TM, fontSize: 9, color: "#4A8FA5", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>
          DAY {dayCount} — RETAIL CHAIN CAREER
        </div>
        <div style={{ fontFamily: "'Spline Sans Mono',monospace", fontSize: 18, fontWeight: 700, color: "#0B1F3A", lineHeight: 1.15, marginBottom: 10 }}>
          Clock in. Clear the queues. Keep the store alive.
        </div>
        <p style={{ color: "#5A7080", lineHeight: 1.55, margin: "0 0 18px", maxWidth: 520, fontSize: 13.5 }}>
          QT/QV1/QP/QV2 queues, phones, pickup, drive-thru, counsel calls, waiters, metrics, and final-check consequences.
          Three clean shifts in a row earns an automatic raise.
        </p>

        {lastShift && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))", gap: 10, marginBottom: 18, padding: "12px 14px", background: "#0B1F3A", borderRadius: 8 }}>
            <HeaderStat label="Last net" value={money(lastShift.netProfit)} color={lastShift.netProfit >= 0 ? "#3FB950" : "#FF4444"} />
            <HeaderStat label="Bonuses" value={money(lastShift.totalBonuses || 0)} color="#3FB950" />
            <HeaderStat label="Penalties" value={money(lastShift.totalPenalties || 0)} color={lastShift.totalPenalties ? "#FF4444" : "#4A8FA5"} />
          </div>
        )}

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={() => setPhase("shift")} style={{ ...TM, flex: "1 1 220px", padding: "12px 20px", background: "#0B1F3A", color: "#3FB950", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, letterSpacing: 1.5, cursor: "pointer", textTransform: "uppercase" }}>
            ▶ CLOCK IN — START SHIFT
          </button>
          <button onClick={onQuit} style={{ ...TM, flex: "0 1 150px", padding: "12px 16px", background: "transparent", color: "#4A8FA5", border: "1px solid #D0D8E0", borderRadius: 8, fontSize: 11, cursor: "pointer", letterSpacing: 1 }}>
            EXIT CAREER
          </button>
        </div>
      </div>
    </div>
  );
}

function SplashScreen({ leaving }) {
  const [barW, setBarW] = useState(0);
  const [phase, setPhase] = useState(0); // 0=init, 1=loading, 2=ready
  const storeNum = useRef(Math.floor(Math.random() * 8000 + 1000)).current;
  const lines = [
    "Initializing RXPRO v4.2.1...",
    "Loading drug database (65,412 entries)...",
    "Connecting to PBM gateway...",
    "Loading store #" + storeNum + " configuration...",
    "Authentication successful. Welcome.",
  ];
  const [lineIdx, setLineIdx] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 200);
    const t2 = setTimeout(() => setPhase(2), 1100);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);
  useEffect(() => {
    if (phase !== 1) return;
    let w = 0;
    const iv = setInterval(() => {
      w += Math.random() * 14 + 6;
      if (w >= 100) { w = 100; clearInterval(iv); }
      setBarW(w);
    }, 80);
    return () => clearInterval(iv);
  }, [phase]);
  useEffect(() => {
    if (phase !== 1) return;
    const iv = setInterval(() => setLineIdx((i) => Math.min(i + 1, lines.length - 1)), 200);
    return () => clearInterval(iv);
  }, [phase]); // eslint-disable-line
  return (
    <div className={leaving ? 'splash-leave' : ''} style={{
      position: 'fixed', inset: 0, background: '#071523',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      zIndex: 999, fontFamily: "'Spline Sans Mono', monospace",
    }}>
      <div style={{ width: 'min(420px, 92vw)', textAlign: 'left' }}>
        {/* Logo bar */}
        <div style={{ borderBottom: '1px solid rgba(126,184,201,0.2)', paddingBottom: 18, marginBottom: 18 }}>
          <div style={{ color: '#7EB8C9', fontSize: 9, letterSpacing: 3, marginBottom: 8 }}>RXPRO PHARMACY MANAGEMENT SYSTEM</div>
          <div style={{ color: '#E8F4F8', fontSize: 28, fontWeight: 700, letterSpacing: 2, lineHeight: 1 }}>STORE #{storeNum}</div>
          <div style={{ color: '#4A8FA5', fontSize: 10, marginTop: 5, letterSpacing: 1 }}>RETAIL PHARMACY WORKSTATION</div>
        </div>
        {/* Boot log */}
        <div style={{ marginBottom: 18, minHeight: 100 }}>
          {lines.slice(0, lineIdx + 1).map((l, i) => (
            <div key={i} style={{ color: i === lineIdx ? '#E8F4F8' : '#3A6070', fontSize: 10, lineHeight: 1.8, letterSpacing: 0.5 }}>
              {i < lineIdx ? '✓ ' : '  '}{l}
            </div>
          ))}
        </div>
        {/* Progress bar */}
        <div style={{ height: 3, background: 'rgba(126,184,201,0.15)', borderRadius: 2, overflow: 'hidden', marginBottom: 12 }}>
          <div style={{ height: '100%', width: `${barW}%`, background: '#3FB950', transition: 'width .08s linear' }} />
        </div>
        <div style={{ color: '#3A6070', fontSize: 9, letterSpacing: 1 }}>
          {barW < 100 ? `LOADING... ${Math.round(barW)}%` : '● READY'}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("home"); // home | setup | play | result | afterhours | settings
  const [mode, setMode] = useState(null);
  const [skills, setSkills] = useState(SKILLS.map((s) => s.id));
  const [qtypes, setQtypes] = useState(QTYPES.map((q) => q.id));
  const [level, setLevel] = useState(2);
  const [result, setResult] = useState(null);
  const [showRef, setShowRef] = useState(false);
  const [best, setBest] = useState(0);
  const [save, setSave] = useState(() => loadSave());
  const [splash, setSplash] = useState(true);
  const [splashLeaving, setSplashLeaving] = useState(false);
  const [rankToast, setRankToast] = useState(null);
  const [achievementToast, setAchievementToast] = useState(null);
  const [achievementLeaving, setAchievementLeaving] = useState(false);
  const achievementQueueRef = useRef([]);
  const prevRankRef = useRef(null);

  function showNextAchievement() {
    const q = achievementQueueRef.current;
    if (!q.length) return;
    const next = q[0];
    setAchievementLeaving(false);
    setAchievementToast(next);
    setTimeout(() => {
      setAchievementLeaving(true);
      setTimeout(() => {
        achievementQueueRef.current = achievementQueueRef.current.slice(1);
        setAchievementToast(null);
        setAchievementLeaving(false);
        if (achievementQueueRef.current.length) showNextAchievement();
      }, 380);
    }, 3000);
  }

  function triggerAchievement(id, currentSave, currentSetSave) {
    const def = ACHIEVEMENTS.find(a => a.id === id);
    if (!def) return currentSave;
    if (currentSave.achievements?.some(a => a.id === id)) return currentSave;
    const next = earnAchievement(id, currentSave, currentSetSave);
    achievementQueueRef.current = [...achievementQueueRef.current, def];
    if (!achievementToast) showNextAchievement();
    return next;
  }

  useEffect(() => {
    const t1 = setTimeout(() => setSplashLeaving(true), 1400);
    const t2 = setTimeout(() => setSplash(false), 1860);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    const rank = getRank(save.lifetimeEarned);
    if (prevRankRef.current !== null && prevRankRef.current !== rank) {
      setRankToast(rank);
      const t = setTimeout(() => setRankToast(null), 3600);
      return () => clearTimeout(t);
    }
    prevRankRef.current = rank;
  }, [save.lifetimeEarned]);

  const startSetup = (m) => { setMode(m); setScreen("setup"); };
  const openReference = () => setScreen("reference");
  const begin = () => setScreen("play");
  const finish = (res) => {
    setResult(res); setScreen("result");
    const modeTag = mode === 8 ? 'law' : mode === 7 ? 'insurance' : mode === 3 ? 'counter' : mode === 2 ? 'fill' : 'general';
    let s = recordDrillResult({ correct: res.correct || 0, total: res.total || 0, modeTag, save, setSave });
    s = recordActivity(mode, s, setSave);

    const pct = res.total ? Math.round(((res.correct || 0) / res.total) * 100) : 0;
    const stars = pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 50 ? 1 : 0;
    const prevStars = s.stars?.[mode] || 0;
    if (stars > prevStars) s = recordStars(mode, stars, s, setSave);

    // Achievement checks
    const totalDrills = Object.keys(s.lastPlayed || {}).length;
    if (totalDrills >= 1 && !s.achievements?.some(a => a.id === "first_clock_in"))
      s = triggerAchievement("first_clock_in", s, setSave);
    if (stars === 3 && prevStars < 3)
      s = triggerAchievement("triple_star", s, setSave);
    if (pct === 100 && mode === 4)  s = triggerAchievement("drug_master",   s, setSave);
    if (pct >= 90  && mode === 7)   s = triggerAchievement("reject_ace",    s, setSave);
    if (pct === 100 && mode === 5)  s = triggerAchievement("dur_zero",      s, setSave);
    if (pct === 100 && mode === 3)  s = triggerAchievement("patient_champ", s, setSave);
    if (pct === 100 && mode === 12) s = triggerAchievement("perfect_qv2",   s, setSave);
    if ((res.qv1ErrorsCaught || 0) >= 1) s = triggerAchievement("eagle_eye",    s, setSave);
    if ((res.qv1ErrorsCaught || 0) >= 3) s = triggerAchievement("eagle_streak", s, setSave);
    if (res.bestStreak >= 10)       s = triggerAchievement("speed_demon",   s, setSave);
    if ((s.drills || 0) >= 25) s = triggerAchievement("the_grind", s, setSave);
    const playedModes = new Set(Object.keys(s.lastPlayed || {}).map(Number));
    if (MODES.every(m => playedModes.has(m.id))) s = triggerAchievement("all_stations", s, setSave);
    const prevRank = getRank((s.lifetimeEarned || 0) - (res.correct || 0) * 3);
    if (prevRank === "Intern" && getRank(s.lifetimeEarned) !== "Intern")
      s = triggerAchievement("promoted", s, setSave);
    if ((s.dailyStreak || 0) >= 7) s = triggerAchievement("week_warrior", s, setSave);
  };
  const home = () => { setScreen("home"); setMode(null); setResult(null); };

  return (
    <div style={{
      minHeight: "100vh", background: "#E8EDF1", color: C.ink,
      fontFamily: "'Spline Sans', sans-serif",
    }}>
      <style>{FONTS}{`
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; -webkit-user-select: none; user-select: none; }
        input, textarea, [contenteditable] { -webkit-user-select: text; user-select: text; }
        html { -webkit-text-size-adjust: 100%; text-size-adjust: 100%; }
        button, [role="button"] { touch-action: manipulation; }
        .rx-card { background:#FFFFFF; border:1px solid #D0D8E0;
          border-radius:12px; box-shadow: 0 2px 10px rgba(0,20,40,0.07); }
        .display { font-family:'Fraunces', serif; }
        .mono { font-family:'Spline Sans Mono', monospace; }
        .rise { animation: rise .5s cubic-bezier(.2,.7,.2,1) both; }
        @keyframes rise { from{opacity:0; transform:translateY(14px)} to{opacity:1; transform:none} }
        .pop { animation: pop .28s cubic-bezier(.2,.8,.2,1) both; }
        @keyframes pop { from{opacity:0; transform:scale(.96)} to{opacity:1; transform:scale(1)} }
        .achievement-slide { animation: aslide .45s cubic-bezier(.15,.8,.2,1) both; }
        @keyframes aslide { from{opacity:0;transform:translateY(80px) scale(.94)} to{opacity:1;transform:none} }
        .achievement-out { animation: aout .35s cubic-bezier(.4,0,1,1) both; }
        @keyframes aout { from{opacity:1;transform:none} to{opacity:0;transform:translateY(60px)} }
        .opt:hover:not(:disabled){ transform: translateY(-2px); }
        .opt { transition: transform .12s ease, border-color .12s ease, background .12s ease; }
        .lift { transition: transform .15s ease, box-shadow .15s ease; }
        .lift:hover { transform: translateY(-4px); box-shadow:0 18px 36px -20px rgba(31,74,63,0.6); }
        .pixel { font-family:'Press Start 2P', monospace; letter-spacing:0; line-height:1.45; }
        .scan { position:fixed; inset:0; pointer-events:none; z-index:60;
          background:repeating-linear-gradient(rgba(0,0,0,0.06) 0 1px, transparent 1px 3px); }
        .crtv { position:fixed; inset:0; pointer-events:none; z-index:59;
          background:radial-gradient(ellipse at center, transparent 58%, rgba(20,40,34,0.16)); }
        .blink { animation: blink 1.1s steps(2,start) infinite; }
        @keyframes blink { to { opacity:.3 } }
        .alarm-pulse { animation: alarmPulse .46s steps(2,start) infinite; }
        @keyframes alarmPulse { 50% { filter: brightness(1.28) saturate(1.2); transform: translateY(-1px); } }
        .malpractice-flash { animation: malpracticeFlash .18s steps(2,start) 12; }
        @keyframes malpracticeFlash { 50% { filter: invert(1) contrast(1.55) saturate(1.45); } }
        .hero-pulse { animation: heroPulse 3.5s ease-in-out infinite; }
        @keyframes heroPulse { 0%,100%{box-shadow:0 18px 40px -20px rgba(31,74,63,0.8)} 50%{box-shadow:0 26px 52px -10px rgba(192,120,30,0.5),0 0 0 5px rgba(192,120,30,0.13)} }
        .grade-ring { animation: gradeRing .5s cubic-bezier(.15,1,.3,1) both; }
        @keyframes gradeRing { from{opacity:0;transform:scale(0.4)} to{opacity:1;transform:scale(1)} }
        .grade-pop { animation: gradePop .7s .06s cubic-bezier(.1,1.55,.3,1) both; }
        @keyframes gradePop { from{opacity:0;transform:scale(0.1) rotate(-22deg)} to{opacity:1;transform:scale(1) rotate(0)} }
        .correct-flash { animation: correctFlash .55s ease; }
        @keyframes correctFlash { 0%,100%{background:${C.card}} 45%{background:rgba(46,139,87,0.22)} }
        .wrong-flash { animation: wrongFlash .55s ease; }
        @keyframes wrongFlash { 0%,100%{background:${C.card}} 45%{background:rgba(178,58,36,0.15)} }
        .streak-fire { display:inline-block; animation: streakFire .5s ease-in-out infinite alternate; }
        @keyframes streakFire { from{filter:brightness(1) saturate(1)} to{filter:brightness(1.3) saturate(1.9) drop-shadow(0 0 6px rgba(255,70,0,.8))} }
        .rank-toast { animation: rankToast .4s cubic-bezier(.2,.9,.2,1) both; }
        @keyframes rankToast { from{opacity:0;transform:translate(-50%,-26px) scale(.88)} to{opacity:1;transform:translate(-50%,0) scale(1)} }
        .splash-logo { animation: splashLogo .9s cubic-bezier(.1,1.4,.3,1) both; }
        @keyframes splashLogo { from{opacity:0;transform:scale(.3) rotate(-18deg)} to{opacity:1;transform:scale(1) rotate(0)} }
        .splash-sub { animation: splashSub .65s .3s ease both; }
        @keyframes splashSub { from{opacity:0;transform:translateY(9px)} to{opacity:1;transform:none} }
        .splash-leave { animation: splashLeave .45s ease forwards; }
        @keyframes splashLeave { to{opacity:0} }
        /* Mobile game layout */
        .rx-wrap { padding: 22px 18px 88px; }
        @supports (padding: env(safe-area-inset-bottom)) {
          .rx-wrap { padding-bottom: max(88px, calc(env(safe-area-inset-bottom) + 64px)); }
        }
        @media (max-width: 480px) {
          .rx-wrap { padding: 14px 13px 80px; }
          .rx-card { border-radius: 16px; }
          .opt { min-height: 52px; }
          .lift:hover { transform: none; box-shadow: none; }
          .lift:active { transform: scale(0.97); }
        }
        @media (max-width: 360px) {
          .rx-wrap { padding: 12px 11px 76px; }
        }
      `}</style>
      <div className="crtv" /><div className="scan" />
      {splash && <SplashScreen leaving={splashLeaving} />}
      {rankToast && (
        <div className="rank-toast" style={{
          position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)',
          background: C.amber, color: C.paper, borderRadius: 22, padding: '11px 24px',
          zIndex: 500, textAlign: 'center', boxShadow: `0 10px 28px rgba(192,120,30,0.55)`,
          pointerEvents: 'none', whiteSpace: 'nowrap',
        }}>
          <div className="pixel" style={{ fontSize: 7, marginBottom: 5, opacity: 0.85 }}>RANK UP</div>
          <div className="display" style={{ fontSize: 18, fontWeight: 900 }}>{rankToast}</div>
        </div>
      )}

      {achievementToast && (
        <div className={achievementLeaving ? "achievement-out" : "achievement-slide"} style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          zIndex: 600, width: 'min(360px, calc(100vw - 32px))', pointerEvents: 'none',
        }}>
          <div style={{
            background: "#0B1F3A", borderRadius: 14, overflow: 'hidden',
            boxShadow: '0 16px 48px rgba(0,0,0,0.6)', border: `2px solid ${RARITY_COLOR[achievementToast.rarity] || "#FFB800"}`,
          }}>
            <div style={{ background: "#CC0000", padding: "6px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "'Spline Sans Mono',monospace", color: "rgba(255,255,255,0.8)", fontSize: 8, letterSpacing: 2 }}>ACHIEVEMENT UNLOCKED</span>
              <span style={{ fontFamily: "'Spline Sans Mono',monospace", color: RARITY_COLOR[achievementToast.rarity], fontSize: 7, letterSpacing: 1, textTransform: "uppercase" }}>{achievementToast.rarity}</span>
            </div>
            <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ fontSize: 32, width: 48, height: 48, display: "grid", placeItems: "center", background: "rgba(255,255,255,0.06)", borderRadius: 10, flexShrink: 0, border: `1px solid ${RARITY_COLOR[achievementToast.rarity]}44` }}>
                {achievementToast.icon}
              </div>
              <div>
                <div style={{ fontFamily: "'Fraunces',serif", fontSize: 18, fontWeight: 900, color: "#FFFFFF", lineHeight: 1.1 }}>{achievementToast.title}</div>
                <div style={{ fontFamily: "'Spline Sans Mono',monospace", fontSize: 10, color: "rgba(255,255,255,0.6)", marginTop: 4, lineHeight: 1.4 }}>{achievementToast.desc}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!save.ageGateAccepted && <AgeGate save={save} setSave={setSave} />}

      <div className="rx-wrap" style={{ maxWidth: 760, margin: "0 auto" }}>
        <Header onHome={home} show={screen !== "home"} save={save} />

        {screen === "home" && (
          <Home onPick={startSetup} onReference={openReference} showRef={showRef} setShowRef={setShowRef}
            save={save} onAfterHours={() => setScreen("afterhours")} onSettings={() => setScreen("settings")} />
        )}
        {screen === "afterhours" && (
          <AfterHours save={save} setSave={setSave} narratorMode={save.settings.narrator} onHome={home} />
        )}
        {screen === "settings" && (
          <Settings save={save} setSave={setSave} onHome={home} />
        )}
        {screen === "reference" && <DrugReference onHome={home} />}
        {screen === "setup" && (
          <Setup
            mode={mode} skills={skills} setSkills={setSkills}
            qtypes={qtypes} setQtypes={setQtypes}
            level={level} setLevel={setLevel} onBegin={begin} onBack={home}
          />
        )}
        {screen === "play" && mode === 1 && (
          <SpeedMode skills={skills} level={level} onFinish={finish} onQuit={home} />
        )}
        {screen === "play" && mode === 2 && (
          <FillMode level={level} onFinish={finish} onQuit={home} />
        )}
        {screen === "play" && mode === 3 && (
          <CounterMode skills={skills} level={level} onFinish={finish} onQuit={home} />
        )}
        {screen === "play" && mode === 4 && (
          <DrugMastery level={level} types={qtypes} onFinish={finish} onQuit={home} />
        )}
        {screen === "play" && mode === 5 && (
          <VerifyMode level={level} onFinish={finish} onQuit={home} />
        )}
        {screen === "play" && mode === 6 && (
          <ScriptLab level={level} onFinish={finish} onQuit={home} />
        )}
        {screen === "play" && mode === 7 && (
          <InsuranceDesk level={level} onFinish={finish} onQuit={home} />
        )}
        {screen === "play" && mode === 8 && (
          <VirginiaLaw level={level} onFinish={finish} onQuit={home} />
        )}
        {screen === "play" && mode === 9 && (
          <TheShift level={level} onHome={home} best={best} setBest={setBest}
            onShiftEnd={(r) => recordShiftResult({ ...r, save, setSave })}
            narratorMode={save.settings.narrator}
            speedBonus={getStatLevel(save.stats.speed)}
            accuracyBonus={getStatLevel(save.stats.accuracy)}
          />
        )}
        {screen === "play" && mode === 10 && (
          <VerifyBench level={level} onFinish={finish} onQuit={home} />
        )}
        {screen === "play" && mode === 11 && (
          <IntakeBench level={level} onFinish={finish} onQuit={home} />
        )}
        {screen === "play" && mode === 12 && (
          <FillCheck level={level} onFinish={finish} onQuit={home} />
        )}
        {screen === "play" && mode === 13 && (
          <ManagerShift level={level} onFinish={finish} onQuit={home} />
        )}
        {screen === "play" && mode === 14 && (
          <CareerMode level={level} onQuit={home} />
        )}
        {screen === "result" && (
          <Result result={result} onAgain={() => setScreen("setup")} onHome={home} />
        )}
      </div>
    </div>
  );
}

/* ---------- Header ---------- */
function Header({ onHome, show, save }) {
  const rank = save ? getRank(save.lifetimeEarned) : null;
  return (
    <div style={{ background: "#0B1F3A", borderRadius: 10, marginBottom: 14, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={onHome}>
        <div style={{ width: 32, height: 32, borderRadius: 7, background: "#143520", border: "1px solid rgba(63,185,80,0.3)", color: "#3FB950", display: "grid", placeItems: "center", fontFamily: "'Fraunces',serif", fontSize: 16, fontWeight: 900 }}>℞</div>
        <div>
          <div style={{ fontFamily: "'Spline Sans Mono',monospace", fontSize: 12, fontWeight: 600, color: "#E8F4F8", lineHeight: 1 }}>RXPRO</div>
          <div style={{ fontFamily: "'Spline Sans Mono',monospace", fontSize: 7, color: "#4A8FA5", marginTop: 3, letterSpacing: 1 }}>PHARMACY SIM</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {save && (
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "'Spline Sans Mono',monospace", fontSize: 13, fontWeight: 700, color: "#3FB950", lineHeight: 1 }}>${save.currency}</div>
            <div style={{ fontFamily: "'Spline Sans Mono',monospace", fontSize: 7, color: "#4A8FA5", marginTop: 3, letterSpacing: 0.5 }}>{rank}</div>
          </div>
        )}
        {show && (
          <button onClick={onHome} style={{ fontFamily: "'Spline Sans Mono',monospace", background: "rgba(126,184,201,0.1)", border: "1px solid rgba(126,184,201,0.25)", color: "#7EB8C9", borderRadius: 7, padding: "7px 13px", cursor: "pointer", fontSize: 10 }}>
            ← HOME
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------- Home helpers ---------- */
const MODE_TIME_EST = { 1:5, 2:10, 3:10, 4:5, 5:10, 6:5, 7:10, 8:10, 9:20, 10:10, 11:10, 12:10, 13:20, 14:25 };
const DRILL_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12];

function getRecommended(save) {
  const lastPlayed = save?.lastPlayed || {};
  const stats = save?.stats || {};
  const lvl = (k) => Math.min(10, Math.floor((stats[k] || 0) / 40));
  const now = Date.now();
  const daysSince = (id) => {
    if (!lastPlayed[id]) return 999;
    return (now - new Date(lastPlayed[id]).getTime()) / 86400000;
  };
  const scored = DRILL_IDS.map((id) => {
    let score = daysSince(id);
    if (lvl('accuracy') < 3 && [5, 10, 12].includes(id)) score += 25;
    if (lvl('law') < 3 && [7, 8].includes(id)) score += 25;
    if (lvl('counseling') < 3 && [2, 3].includes(id)) score += 20;
    if (lvl('speed') < 3 && [1].includes(id)) score += 15;
    return { id, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 3).map((s) => s.id);
}

function wasPlayedToday(modeId, save) {
  const lp = save?.lastPlayed?.[modeId];
  if (!lp) return false;
  return new Date(lp).toDateString() === new Date().toDateString();
}

function daysSinceMode(modeId, save) {
  const lp = save?.lastPlayed?.[modeId];
  if (!lp) return -1;
  return Math.floor((Date.now() - new Date(lp).getTime()) / 86400000);
}

/* ---------- Home ---------- */
const RPH_NAMES = ["R. Martinez, PharmD", "J. Thompson, PharmD", "K. Williams, PharmD", "M. Nguyen, PharmD", "A. Patel, PharmD", "S. Johnson, PharmD"];
const STATION_DESCS = {
  QT: "Data Entry",
  QV1: "Pharmacist Review",
  QP: "Production / Fill",
  QV2: "Final Verify",
};
function Home({ onPick, onReference, showRef, setShowRef, save, onAfterHours, onSettings }) {
  const [showSched, setShowSched] = useState(false);
  const [showRef2, setShowRef2] = useState(false);
  const [liveClock, setLiveClock] = useState(() => new Date());
  const [termData] = useState(() => ({
    storeNum: Math.floor(Math.random() * 8000 + 1000),
    rph: RPH_NAMES[Math.floor(Math.random() * RPH_NAMES.length)],
    qt: Math.floor(Math.random() * 14 + 4),
    qv1: Math.floor(Math.random() * 7 + 1),
    qp: Math.floor(Math.random() * 6 + 1),
    qv2: Math.floor(Math.random() * 5 + 1),
    drivethru: Math.floor(Math.random() * 5),
    willcall: Math.floor(Math.random() * 18 + 8),
    phones: Math.random() > 0.55,
  }));
  useEffect(() => {
    const iv = setInterval(() => setLiveClock(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);

  const TM = { fontFamily: "'Spline Sans Mono',monospace" };
  const timeStr = liveClock.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  const dayStr = liveClock.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }).toUpperCase();
  const hour = liveClock.getHours();
  const greeting = hour < 12 ? "GOOD MORNING" : hour < 17 ? "GOOD AFTERNOON" : "GOOD EVENING";
  const qColor = (n, lo, hi) => n >= hi ? "#FF4444" : n >= lo ? "#FFB800" : "#3FB950";

  const recommended = getRecommended(save);
  const doneToday = recommended.filter((id) => wasPlayedToday(id, save)).length;
  const streak = save?.dailyStreak || 0;

  const ModeTile = ({ id }) => {
    const m = modeById(id);
    const done = wasPlayedToday(id, save);
    const days = daysSinceMode(id, save);
    const starCount = save?.stars?.[id] || 0;
    return (
      <button onClick={() => onPick(id)} style={{ textAlign: "center", background: done ? "rgba(63,185,80,0.07)" : "#FFFFFF", border: `1px solid ${done ? "rgba(63,185,80,0.3)" : "#D0D8E0"}`, borderRadius: 9, padding: "10px 4px 8px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, minHeight: 72 }}>
        <span style={{ fontSize: 18, fontFamily: "'Fraunces',serif", lineHeight: 1, color: done ? "#3FB950" : "inherit" }}>{done ? "✓" : m.icon}</span>
        <span style={{ ...TM, fontSize: 9, fontWeight: 600, color: done ? "#3FB950" : "#0B1F3A", lineHeight: 1.25, textAlign: "center" }}>{m.title}</span>
        {starCount > 0 ? (
          <div style={{ display: "flex", gap: 1 }}>
            {[1,2,3].map(i => (
              <span key={i} style={{ fontSize: 9, color: i <= starCount ? "#FFB800" : "#D0D8E0", lineHeight: 1 }}>★</span>
            ))}
          </div>
        ) : <div style={{ height: 11 }} />}
        <span style={{ ...TM, fontSize: 7, color: "#8A9AAA", background: "#F2F5F7", borderRadius: 3, padding: "1px 5px" }}>
          {days < 0 ? "new" : days === 0 ? "today" : `${days}d ago`} · ~{MODE_TIME_EST[id] || 10}m
        </span>
      </button>
    );
  };
  return (
    <div className="rise">
      {/* ── CVS HEADER ── */}
      <div style={{ borderRadius: "14px 14px 0 0", background: "#CC0000", padding: "10px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <div>
          <div style={{ ...TM, color: "rgba(255,255,255,0.65)", fontSize: 8, letterSpacing: 2.5, marginBottom: 3 }}>CVS PHARMACY · STORE #{termData.storeNum}</div>
          <div style={{ ...TM, color: "#FFFFFF", fontSize: 13, fontWeight: 700, letterSpacing: 0.5 }}>{greeting}, {termData.rph.split(",")[0]}</div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ ...TM, color: "#FFFFFF", fontSize: 13, fontWeight: 600, letterSpacing: 1 }}>{timeStr}</div>
          <div style={{ ...TM, color: "rgba(255,255,255,0.6)", fontSize: 9, letterSpacing: 1, marginTop: 1 }}>{dayStr}</div>
          {streak > 0 && <div style={{ ...TM, color: "#FFE57A", fontSize: 9, marginTop: 3 }}>🔥 {streak}-day streak</div>}
        </div>
      </div>

      {/* ── RXCONNECT QUEUE STATUS ── */}
      <div style={{ background: "#0F2A3F", padding: "8px 18px 12px", marginBottom: 14, borderTop: "1px solid rgba(204,0,0,0.3)", borderRadius: "0 0 14px 14px" }}>
        <div style={{ ...TM, color: "rgba(126,184,201,0.5)", fontSize: 7, letterSpacing: 2, marginBottom: 7 }}>RXCONNECT · QUEUE STATUS</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr) 1.4fr", gap: 6 }}>
          {[
            { k: "QT",  label: "To Type",    v: termData.qt,  lo: 8,  hi: 14 },
            { k: "QV1", label: "To Verify",  v: termData.qv1, lo: 4,  hi: 7  },
            { k: "QP",  label: "Filling",    v: termData.qp,  lo: 3,  hi: 5  },
            { k: "QV2", label: "Final Chk",  v: termData.qv2, lo: 3,  hi: 5  },
          ].map(({ k, label, v, lo, hi }) => {
            const col = qColor(v, lo, hi);
            return (
              <div key={k} style={{ background: "rgba(0,0,0,0.3)", borderRadius: 7, padding: "7px 4px 5px", textAlign: "center" }}>
                <div style={{ ...TM, color: col, fontSize: 19, fontWeight: 700, lineHeight: 1 }}>{v}</div>
                <div style={{ ...TM, color: col, fontSize: 8, letterSpacing: 1, marginTop: 1 }}>{k}</div>
                <div style={{ ...TM, color: "rgba(126,184,201,0.4)", fontSize: 6.5, marginTop: 2 }}>{label}</div>
              </div>
            );
          })}
          <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 7, padding: "5px 8px", display: "flex", flexDirection: "column", justifyContent: "space-around" }}>
            {[
              { label: "Drive-Thru", val: `${termData.drivethru} cars`, urgent: termData.drivethru >= 3 },
              { label: "Will-Call",  val: `${termData.willcall} bags`, urgent: termData.willcall >= 22 },
              { label: "Phones",     val: termData.phones ? "HOLDING" : "CLEAR", urgent: termData.phones, blink: termData.phones },
            ].map(({ label, val, urgent, blink }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ ...TM, color: "#3A6070", fontSize: 6.5 }}>{label}</span>
                <span className={blink ? "blink" : ""} style={{ ...TM, color: urgent ? "#FF4444" : "#3FB950", fontSize: 8.5, fontWeight: 600 }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BADGE CARD ── */}
      {save && save.shifts > 0 && (
        <div style={{ background: "#0B1F3A", borderRadius: 12, padding: "10px 14px", marginBottom: 14, display: "flex", alignItems: "center", gap: 12, border: "1px solid rgba(204,0,0,0.25)" }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: "#220000", border: "1px solid rgba(204,0,0,0.4)", color: "#CC0000", display: "grid", placeItems: "center", fontFamily: "'Fraunces',serif", fontSize: 18, fontWeight: 900, flexShrink: 0 }}>℞</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ ...TM, fontWeight: 700, fontSize: 11, color: "#E8F4F8" }}>{getRank(save.lifetimeEarned)}</div>
            <div style={{ ...TM, fontSize: 9, color: "#4A8FA5", marginTop: 2 }}>CVS Store #{termData.storeNum} · {save.shifts} shifts completed</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ ...TM, fontSize: 18, fontWeight: 700, color: "#3FB950", lineHeight: 1 }}>${save.currency}</div>
            <div style={{ ...TM, fontSize: 7, color: "#4A8FA5", letterSpacing: 1, marginTop: 2 }}>EARNED</div>
          </div>
        </div>
      )}

      {/* ── TODAY'S TRAINING ── */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ ...TM, color: "#4A8FA5", fontSize: 8, letterSpacing: 2.5 }}>▸ TODAY'S FOCUS</span>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            {[0,1,2].map((i) => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: 2, background: i < doneToday ? "#3FB950" : "rgba(255,255,255,0.12)" }} />
            ))}
            <span style={{ ...TM, color: doneToday === 3 ? "#3FB950" : "#4A8FA5", fontSize: 9, marginLeft: 4 }}>{doneToday}/3</span>
          </div>
        </div>

        {streak > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, padding: "6px 10px", background: "rgba(255,184,0,0.07)", borderRadius: 8, border: "1px solid rgba(255,184,0,0.18)" }}>
            <span style={{ fontSize: 13 }}>🔥</span>
            <span style={{ ...TM, color: "#FFB800", fontSize: 10, fontWeight: 700 }}>{streak}-day streak</span>
            <span style={{ ...TM, color: "#8A9AAA", fontSize: 9 }}>{doneToday === 3 ? "All drills done!" : `${3 - doneToday} drill${3 - doneToday !== 1 ? "s" : ""} left today`}</span>
          </div>
        )}

        {recommended.map((id) => {
          const m = modeById(id);
          const done = wasPlayedToday(id, save);
          const days = daysSinceMode(id, save);
          return (
            <button key={id} onClick={() => onPick(id)} style={{ width: "100%", textAlign: "left", background: done ? "rgba(63,185,80,0.06)" : "#FFFFFF", border: `1px solid ${done ? "rgba(63,185,80,0.3)" : "#D0D8E0"}`, borderRadius: 10, padding: "9px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, marginBottom: 7, boxShadow: done ? "none" : "0 1px 4px rgba(0,20,40,0.05)" }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: done ? "#143520" : "#F2F5F7", color: done ? "#3FB950" : "#0B1F3A", display: "grid", placeItems: "center", fontFamily: "'Fraunces',serif", fontSize: 17, flexShrink: 0 }}>
                {done ? "✓" : m.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ ...TM, fontSize: 11, fontWeight: 700, color: done ? "#3FB950" : "#0B1F3A" }}>{m.title}</div>
                <div style={{ ...TM, fontSize: 9, color: done ? "#3FB950" : "#5A7080", marginTop: 2 }}>
                  {done ? "✓ done today" : days < 0 ? "Never played — start here" : days === 0 ? "Played earlier today" : `Last played ${days}d ago`}
                </div>
              </div>
              <div style={{ ...TM, fontSize: 8, color: "#4A8FA5", background: "#F2F5F7", borderRadius: 4, padding: "3px 7px", flexShrink: 0 }}>~{MODE_TIME_EST[id] || 10}m</div>
            </button>
          );
        })}
      </div>

      {/* ── DAILY MISSIONS ── */}
      {(() => {
        const missions = getDailyMissions();
        const completed = missions.filter(dm => wasPlayedToday(dm.mode, save)).length;
        return (
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ ...TM, color: "#CC0000", fontSize: 8, letterSpacing: 2.5 }}>▸ DAILY MISSIONS</span>
              <span style={{ ...TM, fontSize: 9, color: completed === 3 ? "#3FB950" : "#FFB800" }}>
                {completed === 3 ? "✓ ALL COMPLETE" : `${completed}/3 done`}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {missions.map((dm) => {
                const m = modeById(dm.mode);
                const done = wasPlayedToday(dm.mode, save);
                return (
                  <button key={dm.id} onClick={() => onPick(dm.mode)}
                    style={{ width: "100%", textAlign: "left", background: done ? "rgba(63,185,80,0.05)" : "rgba(204,0,0,0.03)", border: `1px solid ${done ? "rgba(63,185,80,0.25)" : "rgba(204,0,0,0.15)"}`, borderRadius: 9, padding: "9px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: done ? "#143520" : "#1A0000", color: done ? "#3FB950" : "#CC0000", display: "grid", placeItems: "center", fontFamily: "'Fraunces',serif", fontSize: 14, flexShrink: 0 }}>
                      {done ? "✓" : m?.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ ...TM, fontSize: 10, fontWeight: 700, color: done ? "#3FB950" : "#CC0000", lineHeight: 1.2 }}>{dm.title}</div>
                      <div style={{ ...TM, fontSize: 8, color: done ? "#3FB950" : "#7A8A9A", marginTop: 2 }}>{dm.desc}</div>
                    </div>
                    <div style={{ ...TM, fontSize: 8, color: done ? "#3FB950" : "#CC0000", background: done ? "rgba(63,185,80,0.1)" : "rgba(204,0,0,0.08)", borderRadius: 4, padding: "3px 7px", flexShrink: 0, fontWeight: 700 }}>
                      {done ? "DONE" : `≥${dm.target}%`}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* ── ACHIEVEMENTS GALLERY ── */}
      {save?.achievements?.length > 0 && (() => {
        const earned = save.achievements.map(a => ACHIEVEMENTS.find(def => def.id === a.id)).filter(Boolean);
        return (
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ ...TM, color: "#4A8FA5", fontSize: 8, letterSpacing: 2.5 }}>▸ ACHIEVEMENTS</span>
              <span style={{ ...TM, fontSize: 9, color: "#4A8FA5" }}>{earned.length}/{ACHIEVEMENTS.length}</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {earned.map(a => (
                <div key={a.id} title={`${a.title}: ${a.desc}`}
                  style={{ background: "#0B1F3A", borderRadius: 8, padding: "5px 9px", display: "flex", alignItems: "center", gap: 5, border: `1px solid ${RARITY_COLOR[a.rarity]}44` }}>
                  <span style={{ fontSize: 14, lineHeight: 1 }}>{a.icon}</span>
                  <span style={{ ...TM, fontSize: 8, color: RARITY_COLOR[a.rarity], fontWeight: 700 }}>{a.title}</span>
                </div>
              ))}
              {Array.from({ length: ACHIEVEMENTS.length - earned.length }).map((_, i) => (
                <div key={`lock-${i}`} style={{ background: "rgba(0,0,0,0.12)", borderRadius: 8, padding: "5px 9px", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <span style={{ fontSize: 14, lineHeight: 1, filter: "grayscale(1) opacity(0.25)" }}>?</span>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* ── CLOCK IN HERO ── */}
      <button onClick={() => onPick(14)} className="lift"
        style={{ width: "100%", textAlign: "left", cursor: "pointer", border: "none", borderRadius: 12, padding: 0, marginBottom: 18, color: "#FFFFFF", overflow: "hidden", background: "#CC0000", boxShadow: "0 4px 20px -6px rgba(204,0,0,0.5)" }}>
        <div style={{ background: "rgba(0,0,0,0.2)", padding: "7px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <span style={{ ...TM, color: "rgba(255,255,255,0.7)", fontSize: 8, letterSpacing: 2 }}>CAREER MODE · CVS PHARMACIST</span>
          <span className="blink" style={{ ...TM, color: "#FFE57A", fontSize: 8, letterSpacing: 2 }}>● YOUR SHIFT STARTS NOW</span>
        </div>
        <div style={{ padding: "14px 16px 16px", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ background: "#FFFFFF", color: "#CC0000", borderRadius: 8, padding: "10px 14px", flexShrink: 0 }}>
            <span style={{ ...TM, fontSize: 13, fontWeight: 700, letterSpacing: 1 }}>▶ CLOCK IN</span>
          </div>
          <div>
            <div style={{ fontFamily: "'Fraunces',serif", fontSize: 18, fontWeight: 900, color: "#FFFFFF", lineHeight: 1.1 }}>Run the Full CVS Floor</div>
            <div style={{ ...TM, fontSize: 9, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>QT → QV1 → Fill → QV2 · Drive-thru · Phones · Will-call · ~25 min</div>
          </div>
        </div>
      </button>

      {/* ── ALL TRAINING STATIONS ── */}
      <div style={{ ...TM, color: "#4A8FA5", fontSize: 8, letterSpacing: 2.5, marginBottom: 10 }}>▸ ALL STATIONS</div>

      {[
        { label: "PHARMACIST STATION", sub: "QT · QV1 · DUR · QV2", ids: [11, 10, 5, 12] },
        { label: "TECH BENCH",          sub: "Fill · Label · Billing · Law", ids: [4, 6, 2, 7] },
        { label: "PATIENT WINDOW",      sub: "Counter · Counseling · Speed", ids: [3, 8, 1] },
        { label: "FULL SHIFT",          sub: "Floor · Queue · Career", ids: [9, 13] },
      ].map(({ label, sub, ids }) => (
        <div key={label} style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 7, marginBottom: 6, paddingLeft: 2 }}>
            <div style={{ ...TM, color: "#7EB8C9", fontSize: 7, letterSpacing: 2, fontWeight: 700 }}>{label}</div>
            <div style={{ ...TM, color: "#2A4A5A", fontSize: 6.5 }}>{sub}</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 7 }}>
            {ids.map((id) => <ModeTile key={id} id={id} />)}
          </div>
        </div>
      ))}

      {/* ── DRUG REFERENCE ── */}
      <button onClick={onReference} className="lift"
        style={{ width: "100%", marginTop: 4, padding: 0, borderRadius: 10, cursor: "pointer", background: "#0B1F3A", color: "#E8F4F8", border: "1px solid rgba(126,184,201,0.2)", overflow: "hidden", textAlign: "left" }}>
        <div style={{ padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ ...TM, color: "#7EB8C9", fontSize: 18, lineHeight: 1 }}>℞</span>
            <span>
              <span style={{ ...TM, fontSize: 11, fontWeight: 600, display: "block", color: "#E8F4F8" }}>Drug Reference Terminal</span>
              <span style={{ ...TM, fontSize: 8, color: "#4A8FA5", marginTop: 1, display: "block" }}>Top-dispensed drugs · interactions · counseling</span>
            </span>
          </span>
          <span style={{ color: "#7EB8C9", fontSize: 18 }}>›</span>
        </div>
      </button>

      {/* quick sig ref */}
      <button onClick={() => setShowRef2(!showRef2)}
        style={{ ...TM, background: "transparent", color: "#4A8FA5", border: "1px dashed rgba(74,143,165,0.3)", borderRadius: 8, width: "100%", marginTop: 10, padding: "8px", fontSize: 10, cursor: "pointer", letterSpacing: 1 }}>
        {showRef2 ? "▾" : "▸"} SIG CODE CHEAT SHEET
      </button>
      {showRef2 && (
        <div style={{ background: "#FFFFFF", border: "1px solid #D0D8E0", borderRadius: 8, padding: 14, marginTop: 6 }}>
          <div style={{ ...TM, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px", fontSize: 11.5 }}>
            {[["PO","by mouth"],["SL","sublingual"],["BID","twice daily"],["TID","3× daily"],
              ["QID","4× daily"],["PRN","as needed"],["HS","at bedtime"],["AC / PC","before / after meals"],
              ["q6h","every 6 hours"],["gtt","drop(s)"],["OD/OS/OU","R/L/both eyes"],
              ["AD/AS/AU","R/L/both ears"],["stat","immediately"],["tsp/tbsp","5 mL / 15 mL"]].map(([k,v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #EEF1F4", paddingBottom: 4 }}>
                <strong style={{ color: "#0B1F3A" }}>{k}</strong><span style={{ color: "#5A7080" }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <button onClick={() => setShowSched(!showSched)}
        style={btn("transparent", C.pine, { border: `1px dashed ${C.line}`, width: "100%", marginTop: 10, fontSize: 14 })}>
        {showSched ? "Hide" : "Show"} controlled-substance schedules
      </button>
      {showSched && (
        <div className="rx-card pop" style={{ padding: 18, marginTop: 12 }}>
          <div style={{ display: "grid", gap: 10, fontSize: 13.5, lineHeight: 1.5 }}>
            {[
              ["C-II", "High abuse potential. No refills — a new written/e-script each time. e.g. oxycodone, hydrocodone/APAP, morphine, fentanyl, methylphenidate, amphetamines.", C.clay],
              ["C-III", "Moderate dependence. Up to 5 refills within 6 months. e.g. codeine/APAP (Tylenol #3), buprenorphine/naloxone, testosterone.", C.amber],
              ["C-IV", "Lower potential. Up to 5 refills within 6 months. e.g. alprazolam, lorazepam, clonazepam, diazepam, zolpidem, tramadol, carisoprodol.", C.amber],
              ["C-V", "Lowest scheduled tier. e.g. pregabalin, some codeine cough preparations. (Gabapentin is C-V in some states only.)", C.pineSoft],
            ].map(([k, v, col]) => (
              <div key={k} style={{ display: "flex", gap: 12 }}>
                <span className="mono" style={{ minWidth: 44, fontWeight: 700, color: col }}>{k}</span>
                <span style={{ color: C.ink }}>{v}</span>
              </div>
            ))}
          </div>
          <p style={{ margin: "12px 0 0", fontSize: 12, color: C.muted, lineHeight: 1.5 }}>
            Refill rules and schedules can vary by state — always follow your state board and pharmacy policy.
          </p>
        </div>
      )}

      {/* After Hours */}
      <button onClick={onAfterHours} className="lift"
        style={{ width: "100%", marginTop: 12, padding: 0, borderRadius: 12, cursor: "pointer",
          background: "linear-gradient(135deg, #1A0830, #0D1A3A)", color: C.paper,
          border: "1px solid rgba(160,112,255,0.3)", overflow: "hidden", textAlign: "left" }}>
        <div style={{ background: "rgba(160,112,255,0.12)", padding: "8px 16px", borderBottom: "1px solid rgba(160,112,255,0.12)", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: "'Spline Sans Mono',monospace", color: "#A070FF", fontSize: 8, letterSpacing: 2 }}>OFF THE CLOCK</span>
        </div>
        <div style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 20 }}>★</span>
            <span>
              <span style={{ fontFamily: "'Spline Sans Mono',monospace", fontSize: 13, fontWeight: 600, display: "block" }}>After Hours</span>
              <span style={{ fontFamily: "'Spline Sans Mono',monospace", fontSize: 9, color: "#A070FF", marginTop: 2, display: "block" }}>Life sim · dating · RPG stats · spend your earnings</span>
            </span>
          </span>
          <span style={{ color: "#A070FF", fontSize: 18 }}>›</span>
        </div>
      </button>

      {/* Settings */}
      <button onClick={onSettings}
        style={btn("transparent", C.muted, { border: `1px dashed ${C.line}`, width: "100%", marginTop: 10, fontSize: 13 })}>
        ⚙ Settings &amp; save
      </button>

      <p style={{ marginTop: 22, fontSize: 12.5, color: C.muted, lineHeight: 1.5 }}>
        For training and study only — always follow your pharmacy's policies, current references,
        and your professional judgment in practice.
      </p>
    </div>
  );
}

/* ---------- Setup ---------- */
function Setup({ mode, skills, setSkills, qtypes, setQtypes, level, setLevel, onBegin, onBack }) {
  const m = MODES.find((x) => x.id === mode);
  const isMastery = mode === 4;
  const skillMatters = mode === 1 || mode === 3; // skills only for Rapid Refill & At the Counter
  const toggle = (id) =>
    setSkills((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const toggleQ = (id) =>
    setQtypes((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const blocked = (skillMatters && skills.length === 0) || (isMastery && qtypes.length === 0);

  return (
    <div className="rise">
      <div className="mono" style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: C.amber }}>{m.tag}</div>
      <h2 className="display" style={{ fontSize: 28, fontWeight: 900, margin: "4px 0 18px" }}>{m.title}</h2>

      {skillMatters && (
        <>
          <SectionLabel>Skill areas <span style={{ color: C.muted, fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>· tap to toggle</span></SectionLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 9, marginBottom: 22 }}>
            {SKILLS.map((s) => {
              const on = skills.includes(s.id);
              return (
                <button key={s.id} onClick={() => toggle(s.id)}
                  style={{
                    border: `1.5px solid ${on ? C.pine : C.line}`, background: on ? C.pine : "transparent",
                    color: on ? C.paper : C.ink, borderRadius: 30, padding: "9px 15px", cursor: "pointer",
                    fontWeight: 600, fontSize: 13.5, display: "flex", alignItems: "center", gap: 7,
                  }}>
                  <span style={{ opacity: on ? 1 : 0.5 }}>{s.icon}</span>{s.short}
                </button>
              );
            })}
          </div>
        </>
      )}
      {isMastery && (
        <>
          <SectionLabel>Question types <span style={{ color: C.muted, fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>· tap to toggle</span></SectionLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 9, marginBottom: 22 }}>
            {QTYPES.map((s) => {
              const on = qtypes.includes(s.id);
              return (
                <button key={s.id} onClick={() => toggleQ(s.id)}
                  style={{
                    border: `1.5px solid ${on ? C.pine : C.line}`, background: on ? C.pine : "transparent",
                    color: on ? C.paper : C.ink, borderRadius: 30, padding: "9px 15px", cursor: "pointer",
                    fontWeight: 600, fontSize: 13.5,
                  }}>
                  {s.label}
                </button>
              );
            })}
          </div>
        </>
      )}
      {(mode === 2 || mode === 5 || mode === 6 || mode === 7 || mode === 8 || mode === 9 || mode === 10 || mode === 11 || mode === 12 || mode === 13 || mode === 14) && (
        <div className="rx-card" style={{ padding: 14, marginBottom: 22, fontSize: 13.5, color: C.muted }}>
          {mode === 5
            ? "Each case bundles the full verification workflow — DUR review, the safety alert, and your decision. Just set your difficulty."
            : mode === 6
            ? "Each script walks you through building a complete, correct sig — type it or tap to build. Just set your difficulty."
            : mode === 7
            ? "Each claim presents a real rejection code to diagnose and resolve. Just set your difficulty."
            : mode === 8
            ? "Virginia Board of Pharmacy and Drug Control Act rules, drawn from the Virginia Administrative Code. Just set your difficulty."
            : mode === 9
            ? "Pick your difficulty and clock in. Patients will start lining up with tasks from every drill — keep the line moving against the clock."
            : mode === 10
            ? "Compare the typed entry to the original hard copy and tap any field that doesn't match (or verify if it's clean). Just set your difficulty."
            : mode === 11
            ? "Read the hard copy and key the prescription in yourself — sig, quantity, days supply, refills, and DAW. Just set your difficulty."
            : mode === 12
            ? "Check the technician's completed fill against the order — stock, count, the pills in the vial, and the label. Just set your difficulty."
            : mode === 13
            ? "Run the manager loop: approve data verification, wait for the auto-tech production timers, then inspect final fills with vial visuals."
            : mode === 14
            ? "Career Mode wraps the manager loop in money, penalties, promotions, and bankruptcy. Career shifts force PIC-level cases."
            : "Each prescription in this mode naturally covers several skills — sig translation, math, error-catching, and counseling — so there's nothing to toggle. Just set your difficulty."}
        </div>
      )}

      <SectionLabel>Difficulty</SectionLabel>
      <div style={{ display: "grid", gap: 9, marginBottom: 26 }}>
        {LEVELS.map((l) => {
          const on = level === l.n;
          return (
            <button key={l.n} onClick={() => setLevel(l.n)}
              style={{
                textAlign: "left", border: `1.5px solid ${on ? C.amber : C.line}`,
                background: on ? "rgba(192,120,30,0.10)" : C.card, borderRadius: 14,
                padding: "12px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14,
              }}>
              <div style={{
                minWidth: 34, height: 34, borderRadius: 9, background: on ? C.amber : C.paper2,
                color: on ? C.paper : C.muted, display: "grid", placeItems: "center",
                fontFamily: "'Fraunces',serif", fontWeight: 900, fontSize: 18,
              }}>{l.n}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15.5 }}>{l.name}</div>
                <div style={{ fontSize: 13, color: C.muted }}>{l.blurb}</div>
              </div>
            </button>
          );
        })}
      </div>
      <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 16 }}>
        {isMastery
          ? "Higher levels pull in less commonly dispensed drugs from the database."
          : "Higher levels include everything up to that tier, then layer in tougher cases."}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onBack} style={btn("transparent", C.pine, { border: `1px solid ${C.line}`, flex: "0 0 auto" })}>Back</button>
        <button onClick={onBegin}
          disabled={blocked}
          style={btn(C.pine, C.paper, { flex: 1, opacity: blocked ? 0.4 : 1 })}>
          {isMastery ? "Start set →" : mode === 9 || mode === 13 || mode === 14 ? "Clock in →" : "Start shift →"}
        </button>
      </div>
    </div>
  );
}
function SectionLabel({ children }) {
  return <div className="mono" style={{ fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", color: C.pine, marginBottom: 10 }}>{children}</div>;
}

/* ---------- shared option list ---------- */
function Options({ options, answer, selected, onSelect, locked }) {
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {options.map((opt, i) => {
        let bg = C.card, border = C.line, color = C.ink;
        if (locked) {
          if (i === answer) { bg = "rgba(46,139,87,0.14)"; border = C.green; }
          else if (i === selected) { bg = "rgba(178,58,36,0.12)"; border = C.clay; }
        }
        return (
          <button key={i} className="opt" disabled={locked} onClick={() => onSelect(i)}
            style={{
              textAlign: "left", background: bg, border: `1.5px solid ${border}`, color,
              borderRadius: 13, padding: "13px 15px", cursor: locked ? "default" : "pointer",
              fontSize: 15, lineHeight: 1.4, display: "flex", gap: 11, alignItems: "flex-start",
            }}>
            <span className="mono" style={{
              minWidth: 22, height: 22, borderRadius: 6, background: locked && i === answer ? C.green : locked && i === selected ? C.clay : C.paper2,
              color: locked && (i === answer || i === selected) ? "#fff" : C.muted,
              display: "grid", placeItems: "center", fontSize: 12, fontWeight: 600, marginTop: 1,
            }}>{String.fromCharCode(65 + i)}</span>
            <span>{opt}</span>
          </button>
        );
      })}
    </div>
  );
}
function Explain({ correct, text }) {
  return (
    <div className="pop" style={{
      marginTop: 14, padding: "13px 15px", borderRadius: 13,
      background: correct ? "rgba(46,139,87,0.10)" : "rgba(178,58,36,0.08)",
      border: `1px solid ${correct ? C.green : C.clay}`,
    }}>
      <div style={{ fontWeight: 700, color: correct ? C.green : C.clay, marginBottom: 4, fontSize: 14 }}>
        {correct ? "✓ Correct" : "✕ Not quite"}
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.5 }}>{text}</div>
    </div>
  );
}
function ProgressBar({ value }) {
  return (
    <div style={{ height: 6, background: C.paper2, borderRadius: 6, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${value}%`, background: C.amber, transition: "width .4s ease" }} />
    </div>
  );
}
function Stat({ label, value, color }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div className="display" style={{ fontSize: 22, fontWeight: 900, color: color || C.ink, lineHeight: 1 }}>{value}</div>
      <div className="mono" style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: C.muted, marginTop: 3 }}>{label}</div>
    </div>
  );
}
function HeaderStatLite({ label, value, color }) {
  return (
    <div style={{ padding: "8px 10px", borderRadius: 10, border: `1px solid ${C.line}`, background: C.paper, textAlign: "center" }}>
      <div className="display" style={{ fontSize: 19, fontWeight: 900, color: color || C.ink, lineHeight: 1 }}>{value}</div>
      <div className="mono" style={{ fontSize: 8.5, letterSpacing: 1, textTransform: "uppercase", color: C.muted, marginTop: 4 }}>{label}</div>
    </div>
  );
}

/* ============================================================
   MODE 1 — SPEED
   ============================================================ */
function SpeedMode({ skills, level, onFinish, onQuit }) {
  const [pool] = useState(() => {
    const filtered = QUIZ.filter((q) => skills.includes(q.skill) && q.level <= level);
    return shuffle(filtered).slice(0, 12);
  });
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [locked, setLocked] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [lives, setLives] = useState(3);
  const [correctCount, setCorrectCount] = useState(0);
  const [t, setT] = useState(timePerQ(level));
  const tickRef = useRef(null);

  const q = pool[idx];

  useEffect(() => {
    if (locked || !q) return;
    setT(timePerQ(level));
    tickRef.current = setInterval(() => {
      setT((v) => {
        if (v <= 1) { clearInterval(tickRef.current); handleAnswer(-1); return 0; }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(tickRef.current);
    // eslint-disable-next-line
  }, [idx]);

  function handleAnswer(i) {
    if (locked) return;
    clearInterval(tickRef.current);
    setSelected(i);
    setLocked(true);
    const right = i === q.answer;
    if (right) {
      const gained = 100 + t * 5 + streak * 20;
      setScore((s) => s + gained);
      const ns = streak + 1; setStreak(ns); setBest((b) => Math.max(b, ns));
      setCorrectCount((c) => c + 1);
    } else {
      setStreak(0);
      setLives((l) => l - 1);
    }
  }

  function next() {
    const outOfLives = lives <= 0;
    const last = idx + 1 >= pool.length;
    if (outOfLives || last) {
      onFinish({
        mode: 1, score, correct: correctCount, total: pool.length,
        bestStreak: best, outOfLives,
      });
      return;
    }
    setIdx((i) => i + 1); setSelected(null); setLocked(false);
  }

  if (!q) return <Empty onQuit={onQuit} />;

  return (
    <div className="rise">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <Stat label="Score" value={score} color={C.pine} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            {streak >= 3 && <span className="streak-fire" style={{ fontSize: 18, lineHeight: 1 }}>🔥</span>}
            <Stat label="Streak" value={`×${streak}`} color={streak >= 5 ? C.clay : C.amber} />
          </div>
        </div>
        <div style={{ fontSize: 18 }}>{"♥".repeat(Math.max(0, lives))}<span style={{ color: C.line }}>{"♡".repeat(3 - Math.max(0, lives))}</span></div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span className="mono" style={{ fontSize: 12, color: C.muted }}>Q{idx + 1} / {pool.length} · {SKILLS.find((s) => s.id === q.skill).short}</span>
        <span className="mono" style={{ fontSize: 13, fontWeight: 600, color: t <= 4 ? C.clay : C.pine }}>⏱ {t}s</span>
      </div>
      <div style={{ height: 6, background: C.paper2, borderRadius: 6, overflow: "hidden", marginBottom: 18 }}>
        <div style={{ height: "100%", width: `${(t / timePerQ(level)) * 100}%`, background: t <= 4 ? C.clay : C.amber, transition: "width 1s linear" }} />
      </div>

      <div className={`rx-card pop${locked ? (selected === q.answer ? ' correct-flash' : ' wrong-flash') : ''}`} key={idx} style={{ padding: 20, marginBottom: 16 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 16px", lineHeight: 1.35 }}>{q.q}</h3>
        <Options options={q.options} answer={q.answer} selected={selected} onSelect={handleAnswer} locked={locked} />
        {locked && <Explain correct={selected === q.answer} text={q.explain} />}
      </div>

      {locked && (
        <button onClick={next} style={btn(C.pine, C.paper, { width: "100%" })}>
          {lives <= 0 ? "See results" : idx + 1 >= pool.length ? "Finish shift" : "Next →"}
        </button>
      )}
    </div>
  );
}

/* ============================================================
   MODE 2 — FILL THE RX
   ============================================================ */
function getDurAlert(c) {
  const src = c.patient + " " + c.prescriber;
  if (/penicillin|PCN\b/i.test(src))                         return { code: "AG-01", msg: "ALLERGY ALERT — PCN-FAMILY DRUG",          bg: "#5A0A0A", accent: "#FF6B6B" };
  if (/lithium/i.test(src))                                   return { code: "DDI-03", msg: "DDI — LITHIUM TOXICITY RISK",              bg: "#3A1A00", accent: "#FF9A3C" };
  if (/warfarin/i.test(src))                                  return { code: "DDI-07", msg: "DDI — ANTICOAGULANT POTENTIATION",         bg: "#3A1A00", accent: "#FF9A3C" };
  if (/digoxin/i.test(src))                                   return { code: "NTI-02", msg: "DDI — NTI DRUG INTERACTION",               bg: "#3A1A00", accent: "#FF9A3C" };
  if (/sumatriptan|venlafaxine/i.test(src))                   return { code: "DDI-12", msg: "DDI — SEROTONIN SYNDROME RISK",            bg: "#3A1A00", accent: "#FF9A3C" };
  if (/st\.?\s*john|st john/i.test(src))                      return { code: "DDI-12", msg: "DDI — SEROTONIN SYNDROME RISK",            bg: "#3A1A00", accent: "#FF9A3C" };
  if (/spironolactone|potassium.*chloride|KCl\b/i.test(src)) return { code: "DDI-09", msg: "DDI — HYPERKALEMIA RISK",                  bg: "#3A1A00", accent: "#FF9A3C" };
  if (/Humulin|regular insulin/i.test(src))                  return { code: "HA-04", msg: "HIGH ALERT — INSULIN LASA RISK",            bg: "#3A0040", accent: "#E070FF" };
  return null;
}

function getDrugBadge(drug) {
  if (/tramadol/i.test(drug))                                           return { label: "C-IV",       color: "#FF8C42", bg: "#3A1800" };
  if (/oxycodone|hydrocodone|fentanyl|morphine|opioid/i.test(drug))    return { label: "C-II",       color: "#FF4444", bg: "#3A0000" };
  if (/phenytoin/i.test(drug))                                          return { label: "NTI",        color: "#FFD166", bg: "#2A2200" };
  if (/digoxin/i.test(drug))                                            return { label: "NTI",        color: "#FFD166", bg: "#2A2200" };
  if (/warfarin/i.test(drug))                                           return { label: "ANTICOAG",   color: "#FF9A3C", bg: "#2A1400" };
  if (/insulin/i.test(drug))                                            return { label: "HIGH ALERT", color: "#E070FF", bg: "#28003A" };
  if (/lithium/i.test(drug))                                            return { label: "NTI",        color: "#FFD166", bg: "#2A2200" };
  return null;
}

function FillMode({ level, onFinish, onQuit }) {
  const [cases] = useState(() => shuffle(RXCASES.filter((c) => c.level <= level)).slice(0, 5));
  const [ci, setCi] = useState(0);
  const [si, setSi] = useState(0);
  const [selected, setSelected] = useState(null);
  const [locked, setLocked] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [shift] = useState(() => SHIFT_CONTEXTS[Math.floor(Math.random() * SHIFT_CONTEXTS.length)]);
  const [rxNums] = useState(() => Array.from({ length: 20 }, () => Math.floor(1000000 + Math.random() * 8999999)));
  const [showNpc, setShowNpc] = useState(false);
  const [durDismissed, setDurDismissed] = useState(false);

  const c = cases[ci];
  if (!c) return <Empty onQuit={onQuit} />;
  const step = c.steps[si];
  const totalSteps = cases.reduce((n, x) => n + x.steps.length, 0);
  const doneSteps = cases.slice(0, ci).reduce((n, x) => n + x.steps.length, 0) + si;
  const queueNow = shift.queue - ci;
  const dur = getDurAlert(c);
  const badge = getDrugBadge(c.drug);
  const caseVerified = locked && si + 1 >= c.steps.length;

  function answer(i) {
    if (locked) return;
    setSelected(i); setLocked(true); setTotal((t) => t + 1);
    if (i === step.answer) setCorrect((x) => x + 1);
  }
  function next() {
    if (si + 1 < c.steps.length) { setSi(si + 1); setSelected(null); setLocked(false); return; }
    if (ci + 1 < cases.length) {
      setCi(ci + 1); setSi(0); setSelected(null); setLocked(false); setDurDismissed(false);
      if (shift.mood === "slammed" && Math.random() > 0.4) setShowNpc(true);
      return;
    }
    onFinish({ mode: 2, correct: correct, total: total, rxFilled: cases.length });
  }

  return (
    <div className="rise">
      {/* Shift status bar */}
      <div style={{
        background: "#0B1F3A", color: "#7EB8C9", borderRadius: 10,
        padding: "7px 13px", marginBottom: 10,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        fontFamily: "'Spline Sans Mono', monospace", fontSize: 10.5, gap: 8,
      }}>
        <span style={{ whiteSpace: "nowrap", opacity: 0.75 }}>● {shift.time}</span>
        <span style={{ flex: 1, textAlign: "center", opacity: 0.85, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{shift.banner}</span>
        <span style={{
          background: queueNow > 12 ? "#7A1A1A" : queueNow > 6 ? "#4A3A0A" : "#0A3A1A",
          color: "#fff", borderRadius: 5, padding: "2px 8px", fontWeight: 700,
          whiteSpace: "nowrap", fontSize: 11,
        }}>QUEUE: {queueNow}</span>
      </div>

      {/* Coworker NPC pop-in */}
      {showNpc && (
        <div className="pop" style={{
          background: C.card, border: `1.5px solid ${C.amber}`, borderRadius: 10,
          padding: "9px 13px", marginBottom: 10, display: "flex", alignItems: "flex-start", gap: 8,
        }}>
          <span style={{ fontSize: 18, lineHeight: 1 }}>👤</span>
          <div style={{ flex: 1, fontSize: 13, color: C.ink, lineHeight: 1.4 }}>
            <span style={{ fontWeight: 700, color: C.amber }}>Coworker: </span>{shift.npc}
          </div>
          <button onClick={() => setShowNpc(false)} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 16, padding: 0, lineHeight: 1 }}>×</button>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span className="mono" style={{ fontSize: 12, color: C.muted }}>Script {ci + 1} of {cases.length}</span>
        <span className="mono" style={{ fontSize: 12, color: C.pine, fontWeight: 600 }}>{correct}/{total} verified</span>
      </div>
      <ProgressBar value={(doneSteps / totalSteps) * 100} />

      {/* DUR Alert banner */}
      {dur && !durDismissed && (
        <div className="pop" style={{
          background: dur.bg, borderRadius: 10, marginTop: 14,
          padding: "9px 14px", display: "flex", alignItems: "center", gap: 10,
          border: `1.5px solid ${dur.accent}`,
        }}>
          <span style={{ fontSize: 16, lineHeight: 1 }}>⚠</span>
          <div style={{ flex: 1, fontFamily: "'Spline Sans Mono', monospace" }}>
            <span style={{ color: dur.accent, fontWeight: 700, fontSize: 11, letterSpacing: 0.8 }}>[{dur.code}] </span>
            <span style={{ color: "#FFE8C0", fontSize: 11, fontWeight: 600 }}>{dur.msg}</span>
            <div style={{ color: "rgba(255,232,192,0.6)", fontSize: 10, marginTop: 2 }}>Pharmacist review required before dispensing</div>
          </div>
          <button onClick={() => setDurDismissed(true)} style={{ background: "none", border: `1px solid ${dur.accent}`, color: dur.accent, cursor: "pointer", fontSize: 10, padding: "3px 8px", borderRadius: 5, fontFamily: "monospace" }}>ACK</button>
        </div>
      )}

      {/* Pharmacy terminal card */}
      <div style={{ borderRadius: 13, overflow: "hidden", marginTop: 10, border: `1.5px solid ${dur && !durDismissed ? dur.accent : "#0B1F3A"}`, boxShadow: "0 4px 18px rgba(11,31,58,0.15)", transition: "border-color .3s" }}>
        {/* Terminal header */}
        <div style={{
          background: "#0B1F3A", padding: "8px 14px",
          display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center",
          fontFamily: "'Spline Sans Mono', monospace", fontSize: 10.5,
        }}>
          <span style={{ color: "#7EB8C9", fontWeight: 700, letterSpacing: 0.5 }}>RxPRO DISPENSING</span>
          <div style={{ textAlign: "center", display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
            <span style={{ color: "rgba(126,184,201,0.55)" }}>STATION 1</span>
            {badge && (
              <span style={{ background: badge.bg, color: badge.color, fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 4, letterSpacing: 0.5, border: `1px solid ${badge.color}40` }}>{badge.label}</span>
            )}
          </div>
          <span style={{ color: "#7EB8C9", textAlign: "right", opacity: 0.75 }}>RX# {rxNums[ci]}</span>
        </div>
        {/* Label body */}
        <div style={{ background: "#FAFAF7", padding: "13px 16px", fontFamily: "'Spline Sans Mono', monospace" }}>
          <div style={{ display: "grid", gridTemplateColumns: "max-content 1fr", columnGap: 12, rowGap: 3, fontSize: 11.5 }}>
            <span style={{ color: "#5A6A6C", fontWeight: 700, letterSpacing: 0.4 }}>PATIENT</span>
            <span style={{ color: "#1A2A24", fontWeight: 500 }}>{c.patient}</span>
            <span style={{ color: "#5A6A6C", fontWeight: 700, letterSpacing: 0.4 }}>PRESCRIBER</span>
            <span style={{ color: "#1A2A24" }}>{c.prescriber}</span>
          </div>
          <div style={{ height: 1, background: "rgba(0,0,0,0.08)", margin: "10px 0" }} />
          <div style={{ display: "grid", gridTemplateColumns: "max-content 1fr", columnGap: 12, rowGap: 3, fontSize: 11.5 }}>
            <span style={{ color: "#5A6A6C", fontWeight: 700, letterSpacing: 0.4 }}>DRUG</span>
            <span style={{ color: "#1A2A24", fontWeight: 700, fontSize: 13 }}>{c.drug}</span>
            <span style={{ color: "#5A6A6C", fontWeight: 700, letterSpacing: 0.4 }}>SIG</span>
            <span style={{ color: "#1F4A3F", fontWeight: 700 }}>{c.sig}</span>
            <span style={{ color: "#5A6A6C", fontWeight: 700, letterSpacing: 0.4 }}>QTY</span>
            <span style={{ color: "#1A2A24" }}>{c.qty}&nbsp;&nbsp;
              <span style={{ color: "#5A6A6C" }}>REFILLS:</span>&nbsp;
              <span style={{ color: "#1A2A24" }}>{c.refills.replace("Refills: ", "")}</span>
            </span>
          </div>
        </div>
        {/* Footer status bar — live */}
        <div style={{
          background: caseVerified ? "#0a2e14" : "#0d2a1e", padding: "5px 14px",
          display: "flex", justifyContent: "space-between",
          fontFamily: "'Spline Sans Mono', monospace", fontSize: 10,
          color: caseVerified ? "#5AE87A" : "rgba(126,201,160,0.7)",
          transition: "background .4s, color .4s",
        }}>
          <span>{caseVerified ? "STATUS: VERIFIED ✓ — LABEL QUEUED FOR PRINT" : dur && !durDismissed ? "STATUS: DUR HOLD — REVIEW REQUIRED" : "STATUS: PENDING VERIFICATION"}</span>
          <span>STEP {si + 1}/{c.steps.length}</span>
        </div>
      </div>

      {/* Verification prompt */}
      <div className="rx-card pop" key={`${ci}-${si}`} style={{ padding: 20, marginTop: 12 }}>
        <div className="mono" style={{ fontSize: 10.5, letterSpacing: 1.2, textTransform: "uppercase", color: C.amber, marginBottom: 8 }}>
          ▸ Technician check — step {si + 1} of {c.steps.length}
        </div>
        <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 16px", lineHeight: 1.35 }}>{step.prompt}</h3>
        <Options options={step.options} answer={step.answer} selected={selected} onSelect={answer} locked={locked} />
        {locked && <Explain correct={selected === step.answer} text={step.explain} />}
      </div>

      {locked && (
        <button onClick={next} style={btn(C.pine, C.paper, { width: "100%", marginTop: 14 })}>
          {ci + 1 >= cases.length && si + 1 >= c.steps.length ? "Finish shift" :
            si + 1 >= c.steps.length ? "Next script →" : "Next step →"}
        </button>
      )}
    </div>
  );
}

/* ============================================================
   MODE 3 — AT THE COUNTER
   ============================================================ */
function CounterMode({ skills, level, onFinish, onQuit }) {
  const [pool] = useState(() => {
    const f = SCENARIOS.filter((s) => skills.includes(s.skill) && s.level <= level);
    return shuffle(f).slice(0, 8);
  });
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [locked, setLocked] = useState(false);
  const [rating, setRating] = useState(70);
  const [counts, setCounts] = useState({ best: 0, ok: 0, bad: 0 });
  const [shift] = useState(() => SHIFT_CONTEXTS[Math.floor(Math.random() * SHIFT_CONTEXTS.length)]);

  const sc = pool[idx];
  if (!sc) return <Empty onQuit={onQuit} />;

  function choose(i) {
    if (locked) return;
    setSelected(i); setLocked(true);
    const v = sc.choices[i].verdict;
    setCounts((c) => ({ ...c, [v]: c[v] + 1 }));
    setRating((r) => Math.max(0, Math.min(100, r + (v === "best" ? 10 : v === "ok" ? 3 : -16))));
  }
  function next() {
    if (idx + 1 >= pool.length) {
      onFinish({ mode: 3, rating, counts, total: pool.length });
      return;
    }
    setIdx(idx + 1); setSelected(null); setLocked(false);
  }

  const ratingColor = rating >= 80 ? C.green : rating >= 55 ? C.amber : C.clay;

  return (
    <div className="rise">
      {/* Shift status bar */}
      <div style={{
        background: "#0B1F3A", color: "#7EB8C9", borderRadius: 10,
        padding: "7px 13px", marginBottom: 10,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        fontFamily: "'Spline Sans Mono', monospace", fontSize: 10.5, gap: 8,
      }}>
        <span style={{ whiteSpace: "nowrap", opacity: 0.75 }}>● {shift.time}</span>
        <span style={{ flex: 1, textAlign: "center", opacity: 0.85, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{shift.banner}</span>
        <span style={{ color: "rgba(126,184,201,0.6)", whiteSpace: "nowrap" }}>COUNTER</span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span className="mono" style={{ fontSize: 12, color: C.muted }}>Patient {idx + 1} / {pool.length}</span>
        <span className="mono" style={{ fontSize: 12, color: ratingColor, fontWeight: 600 }}>Shift rating {rating}</span>
      </div>
      <div style={{ height: 6, background: C.paper2, borderRadius: 6, overflow: "hidden", marginBottom: 18 }}>
        <div style={{ height: "100%", width: `${rating}%`, background: ratingColor, transition: "width .4s ease" }} />
      </div>

      <div className="rx-card pop" key={idx} style={{ padding: 20, marginBottom: 16 }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: C.amber, marginBottom: 8 }}>{sc.who}</div>
        <p style={{ fontSize: 17, lineHeight: 1.5, margin: "0 0 18px", fontWeight: 500 }}>{sc.situation}</p>
        <div style={{ display: "grid", gap: 10 }}>
          {sc.choices.map((ch, i) => {
            let bg = C.card, border = C.line;
            if (locked) {
              const v = ch.verdict;
              if (v === "best") { bg = "rgba(46,139,87,0.14)"; border = C.green; }
              else if (v === "ok" && i === selected) { bg = "rgba(192,120,30,0.12)"; border = C.amber; }
              else if (v === "bad" && i === selected) { bg = "rgba(178,58,36,0.12)"; border = C.clay; }
            }
            return (
              <button key={i} className="opt" disabled={locked} onClick={() => choose(i)}
                style={{ textAlign: "left", background: bg, border: `1.5px solid ${border}`, color: C.ink,
                  borderRadius: 13, padding: "13px 15px", cursor: locked ? "default" : "pointer", fontSize: 15, lineHeight: 1.45 }}>
                {ch.text}
              </button>
            );
          })}
        </div>
        {locked && (
          <div className="pop" style={{ marginTop: 14, padding: "13px 15px", borderRadius: 13,
            background: "rgba(31,74,63,0.06)", border: `1px solid ${C.line}` }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4,
              color: sc.choices[selected].verdict === "best" ? C.green : sc.choices[selected].verdict === "ok" ? C.amber : C.clay }}>
              {sc.choices[selected].verdict === "best" ? "Best response" : sc.choices[selected].verdict === "ok" ? "Acceptable" : "Risky choice"}
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.5 }}>{sc.choices[selected].fb}</div>
          </div>
        )}
      </div>

      {locked && (
        <button onClick={next} style={btn(C.pine, C.paper, { width: "100%" })}>
          {idx + 1 >= pool.length ? "Finish shift" : "Next patient →"}
        </button>
      )}
    </div>
  );
}

/* ---------- Empty (no items for filter) ---------- */
function Empty({ onQuit }) {
  return (
    <div className="rx-card rise" style={{ padding: 26, textAlign: "center" }}>
      <p style={{ fontSize: 16 }}>No items match that combination yet. Try adding skill areas or raising the difficulty.</p>
      <button onClick={onQuit} style={btn(C.pine, C.paper, { marginTop: 12 })}>Back to home</button>
    </div>
  );
}

/* ============================================================
   RESULTS
   ============================================================ */
const CVS_COACHING = {
  1:  { tip: "Speed Drill: Focus on sig codes and drug interactions — those two categories make up ~60% of the questions.", focus: "Speed & Recall" },
  2:  { tip: "Count & Fill: Double-check the NDC number against the label before counting. One wrong bottle = a QV2 reject.", focus: "Accuracy" },
  3:  { tip: "Pickup Counter: Lead with empathy. 'Let me check on that for you' disarms most hostile patients before they escalate.", focus: "Patient Service" },
  4:  { tip: "Product Knowledge: Know the top 200 brand-generic pairs cold — your RxConnect queue will thank you.", focus: "Drug Knowledge" },
  5:  { tip: "DUR Screen: Never clear a major interaction without documenting the clinical rationale. Liability starts here.", focus: "Clinical Safety" },
  6:  { tip: "Build the Label: If the directions aren't clear to a non-medical person, rewrite them. Clarity prevents callbacks.", focus: "Label Accuracy" },
  7:  { tip: "Reject Codes: Refill-too-soon and PA required are your two most common rejects. Know the workaround for each cold.", focus: "Billing" },
  8:  { tip: "VA Board Rules: Schedule II rules trip up every pharmacist. Emergency dispensing limits and CII refill rules are tested every exam.", focus: "Law & Compliance" },
  9:  { tip: "Floor Shift: Triage ruthlessly — waiters before drive-thru, drive-thru before will-call. Don't let the phones stall QV1.", focus: "Workflow" },
  10: { tip: "QV1: The error is almost never the drug itself — check strength, quantity, and sig first. 80% of catches are there.", focus: "Verification" },
  11: { tip: "Type the Script: Days supply errors are the #1 reject. Always calculate: qty ÷ (doses × times per day).", focus: "Data Entry" },
  12: { tip: "QV2: Hold the bottle next to the label. NDC, strength, qty, and form — in that order, every time.", focus: "Final Check" },
  13: { tip: "Run the Queue: A QV1 backlog kills your promise time metric. Verify before you fill — not after.", focus: "Queue Management" },
  14: { tip: "Career Mode: Your daily metrics (fill accuracy, drive-thru wait, patient satisfaction) determine your performance tier.", focus: "Career" },
};

function Result({ result, onAgain, onHome }) {
  const TM = { fontFamily: "'Spline Sans Mono',monospace" };
  let pct = 0, grade = "—", tier = "", tierColor = "", tierBg = "", stats = [], storeNum = Math.floor(Math.random() * 8000 + 1000);
  let starCount = 0;

  const getPct = () => result.total ? Math.round((result.correct / result.total) * 100) : 0;

  if (result.mode === 1) {
    pct = getPct();
    grade = pct >= 90 ? "A" : pct >= 80 ? "B" : pct >= 70 ? "C" : pct >= 60 ? "D" : "F";
    stats = [{ label: "Score", value: result.score }, { label: "Accuracy", value: pct + "%" }, { label: "Best Streak", value: "×" + result.bestStreak }];
  } else if (result.mode === 2) {
    pct = getPct();
    grade = pct >= 90 ? "A" : pct >= 80 ? "B" : pct >= 70 ? "C" : pct >= 60 ? "D" : "F";
    stats = [{ label: "Rx Filled", value: result.rxFilled }, { label: "Steps Right", value: `${result.correct}/${result.total}` }, { label: "Accuracy", value: pct + "%" }];
  } else if (result.mode === 5) {
    pct = getPct();
    grade = pct >= 90 ? "A" : pct >= 80 ? "B" : pct >= 70 ? "C" : pct >= 60 ? "D" : "F";
    stats = [{ label: "Rx Reviewed", value: result.reviewed }, { label: "Correct Calls", value: `${result.correct}/${result.total}` }, { label: "Accuracy", value: pct + "%" }];
  } else if (result.mode === 6) {
    pct = getPct();
    grade = pct >= 90 ? "A" : pct >= 80 ? "B" : pct >= 70 ? "C" : pct >= 60 ? "D" : "F";
    stats = [{ label: "Scripts", value: result.scripts }, { label: "Clean Labels", value: `${result.correct}/${result.total}` }, { label: "Accuracy", value: pct + "%" }];
  } else if (result.mode === 7) {
    pct = getPct();
    grade = pct >= 90 ? "A" : pct >= 80 ? "B" : pct >= 70 ? "C" : pct >= 60 ? "D" : "F";
    stats = [{ label: "Claims Worked", value: result.resolved }, { label: "Correct Calls", value: `${result.correct}/${result.total}` }, { label: "Accuracy", value: pct + "%" }];
  } else if (result.mode === 13) {
    pct = result.completed ? Math.round((result.correct / result.completed) * 100) : 0;
    grade = pct >= 90 ? "A" : pct >= 80 ? "B" : pct >= 70 ? "C" : pct >= 60 ? "D" : "F";
    stats = [
      { label: "Final Checks", value: result.completed },
      { label: "Net", value: result.netProfit !== undefined ? money(result.netProfit) : `${result.correct}/${result.completed}` },
      { label: "Penalties", value: result.totalPenalties !== undefined ? money(result.totalPenalties) : result.auditAttempts || 1 },
    ];
  } else {
    const r = result.rating || 0;
    pct = r;
    grade = r >= 85 ? "A" : r >= 70 ? "B" : r >= 55 ? "C" : r >= 40 ? "D" : "F";
    stats = [{ label: "Shift Rating", value: r }, { label: "Best Calls", value: result.counts?.best ?? "—" }, { label: "Risky Calls", value: result.counts?.bad ?? "—" }];
  }

  starCount = pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 50 ? 1 : 0;

  if (pct >= 90)      { tier = "EXCEEDS EXPECTATIONS"; tierColor = "#3FB950"; tierBg = "rgba(63,185,80,0.1)"; }
  else if (pct >= 75) { tier = "MEETS EXPECTATIONS";   tierColor = "#7EB8C9"; tierBg = "rgba(126,184,201,0.1)"; }
  else if (pct >= 55) { tier = "NEEDS IMPROVEMENT";    tierColor = "#FFB800"; tierBg = "rgba(255,184,0,0.1)"; }
  else                { tier = "PERFORMANCE ACTION REQUIRED"; tierColor = "#FF4444"; tierBg = "rgba(255,68,68,0.1)"; }

  const gradeColor = grade === "A" ? "#3FB950" : grade === "B" ? "#7EB8C9" : grade === "C" ? "#FFB800" : "#FF4444";
  const coaching = CVS_COACHING[result.mode] || { tip: "Practice makes permanent. Run it again.", focus: "General" };
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

  return (
    <div className="rise" style={{ paddingTop: 0 }}>
      {/* CVS Performance Review Header */}
      <div style={{ background: "#CC0000", borderRadius: "14px 14px 0 0", padding: "10px 16px 12px", marginBottom: 0 }}>
        <div style={{ ...TM, color: "rgba(255,255,255,0.65)", fontSize: 7, letterSpacing: 2.5, marginBottom: 4 }}>CVS PHARMACY · PERFORMANCE REVIEW · STORE #{storeNum}</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div style={{ ...TM, color: "#FFFFFF", fontSize: 12, fontWeight: 700 }}>{modeById(result.mode)?.title || "Training Session"}</div>
          <div style={{ ...TM, color: "rgba(255,255,255,0.7)", fontSize: 8 }}>{dateStr} {timeStr}</div>
        </div>
      </div>

      {/* Grade + Stars + Tier */}
      <div style={{ background: "#0B1F3A", padding: "18px 16px 14px", marginBottom: 0, display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 72, height: 72, borderRadius: 14, background: "rgba(0,0,0,0.35)", border: `3px solid ${gradeColor}`, display: "grid", placeItems: "center", flexShrink: 0, boxShadow: `0 8px 24px -8px ${gradeColor}88` }}>
          <span style={{ fontFamily: "'Fraunces',serif", fontSize: 44, fontWeight: 900, color: gradeColor, lineHeight: 1 }}>{grade}</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 3, marginBottom: 6 }}>
            {[1,2,3].map(i => (
              <span key={i} style={{ fontSize: 22, color: i <= starCount ? "#FFB800" : "rgba(255,255,255,0.15)", lineHeight: 1 }}>★</span>
            ))}
          </div>
          <div style={{ ...TM, fontSize: 9, fontWeight: 700, color: tierColor, letterSpacing: 1.5, background: tierBg, borderRadius: 5, padding: "4px 8px", display: "inline-block" }}>
            {tier}
          </div>
          <div style={{ ...TM, fontSize: 9, color: "#4A8FA5", marginTop: 5 }}>
            {coaching.focus} · {pct}% accuracy
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ background: "#0F2A3F", padding: "10px 16px", borderTop: "1px solid rgba(0,0,0,0.3)", marginBottom: 0, display: "flex", justifyContent: "space-around" }}>
        {stats.map((s) => (
          <div key={s.label} style={{ textAlign: "center" }}>
            <div style={{ ...TM, fontSize: 18, fontWeight: 700, color: gradeColor, lineHeight: 1 }}>{s.value}</div>
            <div style={{ ...TM, fontSize: 7, color: "#4A8FA5", letterSpacing: 1, marginTop: 3 }}>{s.label.toUpperCase()}</div>
          </div>
        ))}
      </div>

      {/* Coaching tip */}
      <div style={{ background: "#FFFFFF", borderRadius: "0 0 14px 14px", padding: "12px 16px 14px", marginBottom: 16, borderTop: "1px solid #E8EDF1" }}>
        <div style={{ ...TM, color: "#CC0000", fontSize: 7, letterSpacing: 2, marginBottom: 6 }}>▸ COACHING NOTE</div>
        <p style={{ ...TM, fontSize: 11, color: "#1A2A3A", lineHeight: 1.6, margin: 0 }}>{coaching.tip}</p>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onHome} style={{ flex: 1, padding: "13px 0", borderRadius: 10, border: "1px solid #D0D8E0", background: "#FFFFFF", color: "#0B1F3A", cursor: "pointer", fontFamily: "'Spline Sans Mono',monospace", fontSize: 12, fontWeight: 600 }}>
          Home
        </button>
        <button onClick={onAgain} style={{ flex: 1, padding: "13px 0", borderRadius: 10, border: "none", background: "#CC0000", color: "#FFFFFF", cursor: "pointer", fontFamily: "'Spline Sans Mono',monospace", fontSize: 12, fontWeight: 700, letterSpacing: 0.5 }}>
          Run It Back →
        </button>
      </div>
    </div>
  );
}
