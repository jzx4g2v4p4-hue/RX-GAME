import React, { useState, useEffect, useRef } from "react";
import { loadSave, recordShiftResult, recordDrillResult, getRank, getStatLevel } from './afterhours/save.js';
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
    title: "Rapid Refill",
    tag: "Speed Round",
    desc: "Beat the clock. Multiple-choice across every skill area with a combo multiplier and three lives.",
    icon: "⏱",
  },
  {
    id: 2,
    title: "Fill the Rx",
    tag: "Simulation",
    desc: "Work real prescriptions step by step — decode the sig, run the math, catch the problem, counsel the patient.",
    icon: "℞",
  },
  {
    id: 3,
    title: "At the Counter",
    tag: "Role-Play",
    desc: "Live patient scenarios with branching choices. Balance safety, the law, and good service.",
    icon: "☺",
  },
  {
    id: 4,
    title: "Drug Mastery",
    tag: "Top Drugs",
    desc: "Brand ↔ generic, drug class, indication, counseling, and controlled-substance schedules — drawn from a database of the most commonly dispensed medications.",
    icon: "✚",
  },
  {
    id: 5,
    title: "Rx Verification",
    tag: "DUR Bench",
    desc: "The real workflow: read the script against the patient's allergies, meds, and conditions, catch the safety alert, then make the call — verify, clarify, or reject.",
    icon: "⊕",
  },
  {
    id: 6,
    title: "Script Lab",
    tag: "Sig Builder",
    desc: "Turn the prescriber's intent into a clean, unambiguous patient label — build the sig piece by piece and learn what belongs on the directions.",
    icon: "✎",
  },
  {
    id: 7,
    title: "Insurance Desk",
    tag: "Claim Rejections",
    desc: "Work real third-party rejections by NCPDP code — refill too soon, prior auth, non-formulary, quantity limits, DUR, eligibility — and choose the right fix.",
    icon: "▤",
  },
  {
    id: 8,
    title: "Virginia Law",
    tag: "VA Board of Pharmacy",
    desc: "Virginia-specific rules: Schedule VI, controlled-substance refill and expiration limits, emergency dispensing, and the pharmacist statewide protocols you can act under.",
    icon: "§",
  },
  {
    id: 9,
    title: "The Shift",
    tag: "Live Sim",
    desc: "Work the counter against the clock. Patients line up with real tasks — keep the line moving, earn tips, and don't let your reputation tank.",
    icon: "▶",
  },
  {
    id: 10,
    title: "Verify Bench",
    tag: "Data Verification",
    desc: "The real verification screen: compare the typed entry against the original hard copy and tap whatever doesn't match — wrong strength, miskeyed sig, bad quantity, DAW mismatch.",
    icon: "✓",
  },
  {
    id: 11,
    title: "Data Entry",
    tag: "Key it in",
    desc: "Be the one entering the script. Read the doctor's hard copy and type it into the system — translate the sig (with live expansion), enter quantity, work out the days supply, set refills and DAW.",
    icon: "⌨",
  },
  {
    id: 12,
    title: "Fill Check",
    tag: "Check the tech",
    desc: "Final product verification: the tech filled it — confirm they pulled the right stock, counted right, the pills in the vial match the reference, and the label's correct. Approve or reject.",
    icon: "⊙",
  },
  {
    id: 13,
    title: "ManagerShift",
    tag: "Queue Control",
    desc: "Run the bench from a dashboard: verify data, watch production timers, handle drive-thru escalations, and finish with a CII safe audit.",
    icon: "M",
  },
  {
    id: 14,
    title: "Career Mode",
    tag: "Real Consequences",
    desc: "Run full manager shifts across multiple days. Earn bonuses, eat penalties, chase promotions, and stay solvent.",
    icon: "$",
  },
];

const MODE_GROUPS = [
  {
    id: "career",
    title: "Full Shift",
    tag: "POV Simulator",
    lead: 14,
    modes: [14, 13, 9],
    desc: "Career, manager dashboard, pressure events, final checks, and the safe audit in one shift path.",
  },
  {
    id: "verification",
    title: "Verification Bench",
    tag: "Pharmacist Work",
    lead: 10,
    modes: [11, 10, 5, 12],
    desc: "Data entry, data verification, DUR review, and finished-product inspection.",
  },
  {
    id: "workflow",
    title: "Workflow Training",
    tag: "Stations",
    lead: 2,
    modes: [2, 6, 7, 8],
    desc: "Prescription entry practice, sig building, insurance rejections, and law cases.",
  },
  {
    id: "knowledge",
    title: "Knowledge Drills",
    tag: "Practice",
    lead: 1,
    modes: [1, 4, 3],
    desc: "Fast recall, drug mastery, OTC judgment, counseling, and counter conversations.",
  },
];

const modeById = (id) => MODES.find((m) => m.id === id);

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

  const c = cases[ci];
  if (!c) return <Empty onQuit={onQuit} />;
  const step = c.steps[si];
  const totalSteps = cases.reduce((n, x) => n + x.steps.length, 0);
  const doneSteps = cases.slice(0, ci).reduce((n, x) => n + x.steps.length, 0) + si;

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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span className="mono" style={{ fontSize: 12, color: C.muted }}>Claim {ci + 1} of {cases.length}</span>
        <span className="mono" style={{ fontSize: 12, color: C.pine, fontWeight: 600 }}>{correct}/{total} correct</span>
      </div>
      <ProgressBar value={(doneSteps / totalSteps) * 100} />

      {/* claim ticket */}
      <div className="rx-card" style={{ padding: 0, marginTop: 16, overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", fontFamily: "'Spline Sans Mono', monospace", fontSize: 13, lineHeight: 1.6 }}>
          <div style={{ color: C.muted }}>{c.claim.patient}</div>
          <div style={{ fontSize: 15.5, fontWeight: 600, color: C.ink }}>{c.claim.drug}</div>
          <div style={{ color: C.muted }}>Plan: {c.claim.plan}</div>
          <div style={{ color: C.muted }}>{c.claim.info}</div>
        </div>
        <div style={{ background: "rgba(178,58,36,0.10)", borderTop: `1px solid ${C.clay}`, color: C.clay,
          padding: "10px 18px", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 16 }}>⛔</span>
          <span className="mono" style={{ fontSize: 13, fontWeight: 600 }}>REJECTED · Code {c.code} — {c.reject}</span>
        </div>
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
  const clockColor = clock <= 20 ? C.clay : C.pine;
  const repColor = rep >= 60 ? C.green : rep >= 30 ? C.amber : C.clay;
  const mm = Math.floor(clock / 60), ss = String(clock % 60).padStart(2, "0");

  return (
    <div className="rise">
      {/* top HUD */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div>
            <div className="display" style={{ fontSize: 22, fontWeight: 900, color: C.green, lineHeight: 1, position: "relative" }}>
              ${cash}
              {gain > 0 && <span className="pop" style={{ position: "absolute", left: "100%", top: -2, marginLeft: 6, fontSize: 13, color: C.green, whiteSpace: "nowrap" }}>+${gain}</span>}
            </div>
            <div className="mono" style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: C.muted }}>Tips</div>
          </div>
          {combo > 1 && <div className="pop" key={combo} style={{ fontFamily: "'Fraunces',serif", fontWeight: 900, fontSize: 18, color: C.amber }}>×{combo} combo</div>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => setMuted((m) => !m)} title="sound"
            style={{ background: "transparent", border: `1px solid ${C.line}`, borderRadius: 9, padding: "5px 9px", cursor: "pointer", fontSize: 14, color: C.muted }}>
            {muted ? "🔇" : "🔊"}
          </button>
          <div style={{ textAlign: "right" }}>
            <div className="mono" style={{ fontSize: 20, fontWeight: 600, color: clockColor, lineHeight: 1 }}>{mm}:{ss}</div>
            <div className="mono" style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: C.muted }}>Shift</div>
          </div>
        </div>
      </div>

      {/* reputation bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <span className="mono" style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: C.muted }}>Rep</span>
        <div style={{ flex: 1, height: 8, background: C.paper2, borderRadius: 6, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${rep}%`, background: repColor, transition: "width .4s ease, background .4s ease" }} />
        </div>
        <span className="mono" style={{ fontSize: 11, fontWeight: 600, color: repColor }}>{rep}</span>
      </div>

      {/* the line */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 14, minHeight: 66 }}>
        <span className="mono" style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: C.muted, marginRight: 2, paddingBottom: 18 }}>Line</span>
        {queue.length === 0 && <span style={{ fontSize: 13, color: C.muted, fontStyle: "italic", paddingBottom: 18 }}>quiet for a moment…</span>}
        {queue.map((p, i) => {
          const pc = p.patience > 60 ? C.green : p.patience > 30 ? C.amber : C.clay;
          const px = i === 0 ? 3.6 : 2.7;
          const sw = Math.round(12 * px);
          return (
            <div key={p.id} className="pop" style={{ textAlign: "center", opacity: i === 0 ? 1 : 0.8 }}>
              <div style={{ height: 11, fontSize: 10, color: C.amber, lineHeight: 1 }}>{i === 0 ? "▾" : ""}</div>
              <div style={{ height: Math.round(14 * px), display: "flex", alignItems: "flex-end", justifyContent: "center",
                filter: i === 0 ? "drop-shadow(0 2px 0 rgba(192,120,30,0.45))" : "none" }}>
                <PixelSprite grid={p.look.grid} colors={p.look.colors} px={px} />
              </div>
              <div style={{ width: sw, height: 3, borderRadius: 3, background: C.paper2, margin: "4px auto 0", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${Math.max(0, p.patience)}%`, background: pc, transition: "width 1s linear" }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* the window */}
      {active ? (
        <div className="rx-card pop" key={active.id} style={{ padding: 20,
          border: `1px solid ${feedback ? (feedback.correct ? C.green : C.clay) : C.line}`,
          background: feedback ? (feedback.correct ? "rgba(46,139,87,0.06)" : "rgba(178,58,36,0.05)") : C.card,
          transition: "background .2s, border-color .2s" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ display: "block" }}><PixelSprite grid={active.look.grid} colors={active.look.colors} px={3} /></span>
              <span style={{ fontWeight: 700, fontSize: 15 }}>{active.name}</span>
            </span>
            <span className="mono" style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: tagColor(active.task.tag), border: `1px solid ${tagColor(active.task.tag)}`, borderRadius: 20, padding: "3px 9px" }}>{active.task.tag}</span>
          </div>
          <h3 style={{ fontSize: 16.5, fontWeight: 700, margin: "0 0 14px", lineHeight: 1.35 }}>{active.task.q}</h3>
          <div style={{ display: "grid", gap: 8 }}>
            {active.task.options.map((opt, i) => {
              let bg = C.card, border = C.line, color = C.ink;
              if (feedback) {
                if (i === feedback.answer) { bg = "rgba(46,139,87,0.16)"; border = C.green; }
                else if (i === feedback.sel) { bg = "rgba(178,58,36,0.12)"; border = C.clay; }
              }
              return (
                <button key={i} className="opt" disabled={!!feedback} onClick={() => answer(i)}
                  style={{ textAlign: "left", background: bg, border: `1.5px solid ${border}`, color, borderRadius: 12,
                    padding: "11px 14px", cursor: feedback ? "default" : "pointer", fontSize: 14.5, lineHeight: 1.4 }}>
                  {opt}
                </button>
              );
            })}
          </div>
          {feedback && (
            <div className="pop" style={{ marginTop: 12, fontSize: 13.5, lineHeight: 1.5, color: feedback.correct ? C.green : C.ink }}>
              <strong style={{ color: feedback.correct ? C.green : C.clay }}>{feedback.correct ? "✓ " : "✕ "}</strong>{active.task.explain}
            </div>
          )}
        </div>
      ) : (
        <div className="rx-card" style={{ padding: 28, textAlign: "center", color: C.muted, fontStyle: "italic" }}>
          Counter's clear — next patient walking up…
        </div>
      )}

      {/* Zippo narrator corner */}
      {narratorQuip && (
        <div className="pop" style={{ display: "flex", alignItems: "flex-start", gap: 10, marginTop: 10,
          padding: "10px 14px", borderRadius: 12, background: "rgba(31,74,63,0.07)",
          border: `1px dashed ${C.line}` }}>
          <svg width={30} height={22} viewBox="0 0 10 11" style={{ shapeRendering: "crispEdges", flexShrink: 0, marginTop: 2 }}>
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

      <button onClick={endShift} style={btn("transparent", C.muted, { border: `1px solid ${C.line}`, width: "100%", marginTop: 14, fontSize: 13 })}>
        End shift early
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
  const [pick, setPick] = useState(undefined); // field key, or '__verify__'
  const [locked, setLocked] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [overrideCode, setOverrideCode] = useState("");
  const [overrideError, setOverrideError] = useState("");

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
    setOverrideOpen(false);
    setOverrideError("");
    choose("__verify__");
  }

  // a tappable entry field
  function F({ k, value }) {
    const isErr = c.errorField === k;
    const picked = pick === k;
    let bg = "transparent", border = "transparent", color = C.ink;
    if (!locked) border = "rgba(31,74,63,0.18)";
    if (locked) {
      if (isErr) { bg = "rgba(192,120,30,0.18)"; border = C.amber; }
      else if (picked) { bg = "rgba(178,58,36,0.14)"; border = C.clay; }
    }
    return (
      <button disabled={locked} onClick={() => choose(k)} className="opt"
        style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: 7, padding: "2px 7px",
          cursor: locked ? "default" : "pointer", fontSize: 14, color, fontWeight: 500, textAlign: "left", lineHeight: 1.35 }}>
        {value}
      </button>
    );
  }
  const Row = ({ label, children }) => (
    <div style={{ display: "flex", gap: 8, alignItems: "baseline", marginBottom: 5 }}>
      <span style={{ minWidth: 96, fontSize: 12.5, color: C.muted, fontWeight: 600 }}>{label}</span>
      <span>{children}</span>
    </div>
  );
  const Card = ({ title, children }) => (
    <div className="rx-card" style={{ padding: 16, flex: "1 1 200px", minWidth: 0 }}>
      <div className="display" style={{ fontSize: 16, fontWeight: 900, marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );

  return (
    <div className="rise">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 16 }}>
          <Stat label="Score" value={score} color={C.pine} />
          <Stat label="Streak" value={`×${streak}`} color={C.amber} />
        </div>
        <span className="mono" style={{ fontSize: 12, color: C.muted }}>Rx {idx + 1} / {cases.length}</span>
      </div>
      <ProgressBar value={(idx / cases.length) * 100} />

      <p style={{ fontSize: 14, color: C.muted, margin: "14px 0 12px", lineHeight: 1.5 }}>
        Compare the entry to the original. <strong style={{ color: C.ink }}>Tap the field that doesn't match</strong> — or verify if it's clean.
      </p>

      {overrideRequired && (
        <div className="rx-card pop" style={{ padding: 15, marginBottom: 12, border: `2px solid ${C.clay}`, background: "rgba(178,58,36,0.08)" }}>
          <div className="mono" style={{ fontSize: 10.5, letterSpacing: 1, textTransform: "uppercase", color: C.clay, marginBottom: 6 }}>DUR Lock</div>
          <div style={{ fontWeight: 900, fontSize: 15.5, color: C.ink }}>{c.durOverride.title}</div>
          <div style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.45, marginTop: 4 }}>{c.durOverride.profile}</div>
          <div style={{ fontSize: 13.5, color: C.ink, lineHeight: 1.45, marginTop: 4 }}>{c.durOverride.detail}</div>
        </div>
      )}

      {/* entry cards */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        <Card title="Patient">
          <Row label="Name"><F k="patient" value={c.patient} /></Row>
          <Row label="DOB"><F k="dob" value={c.dob} /></Row>
          <Row label="Age / Sex"><span style={{ fontSize: 14 }}>{c.age} · {c.sex}</span></Row>
        </Card>
        <Card title="Prescriber">
          <Row label="Name"><F k="prescriber" value={c.prescriber} /></Row>
          <div style={{ fontSize: 12.5, color: C.muted, marginTop: 4 }}>{c.prescriberAddr}</div>
        </Card>
        <Card title="Product">
          <Row label="Brand"><F k="brand" value={c.brand} /></Row>
          <Row label="Generic"><F k="drug" value={c.generic} /></Row>
          <Row label="Strength"><F k="strength" value={c.strength} /></Row>
          <Row label="Mfr"><span style={{ fontSize: 13, color: C.muted }}>{c.manufacturer}</span></Row>
        </Card>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 10 }}>
        <Card title="Details">
          <Row label="Written"><span style={{ fontSize: 14 }}>{c.writtenDate}</span></Row>
          <Row label="Quantity"><F k="qty" value={c.qty} /></Row>
          <Row label="Refills"><F k="refills" value={c.refills} /></Row>
          <Row label="Days supply"><F k="daysSupply" value={c.daysSupply} /></Row>
          <Row label="DAW code"><F k="daw" value={c.dawCode} /></Row>
          <div style={{ marginTop: 8 }}>
            <span style={{ fontSize: 12.5, color: C.muted, fontWeight: 600 }}>Directions</span>
            <div style={{ marginTop: 4 }}><F k="directions" value={c.directions} /></div>
          </div>
        </Card>

        {/* original hard copy */}
        <div className="rx-card" style={{ flex: "1 1 240px", minWidth: 0, padding: 0, overflow: "hidden", background: "#fffdf7" }}>
          <div style={{ padding: "14px 16px 10px", textAlign: "center", borderBottom: "2px solid #2a2a33" }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#2a2a33" }}>{c.prescriber}</div>
            <div style={{ fontSize: 11.5, color: "#666" }}>{c.prescriberAddr}</div>
          </div>
          <div style={{ padding: "12px 16px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <div><div style={{ fontSize: 10.5, color: "#888" }}>Patient</div><div style={hand}>{c.orig.patient}</div><div style={{ ...hand, fontSize: 16 }}>{c.orig.dob}</div></div>
              <div style={{ textAlign: "right" }}><div style={{ fontSize: 10.5, color: "#888" }}>Date</div><div style={hand}>{c.orig.date}</div></div>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div style={{ fontFamily: "'Fraunces',serif", fontSize: 34, fontWeight: 900, color: "#2a2a33", lineHeight: 0.9 }}>℞</div>
              <div style={{ flex: 1, paddingTop: 4 }}>
                <div style={{ ...hand, fontSize: 22, marginBottom: 8 }}>{c.orig.drug} {c.orig.strength}</div>
                <div style={{ marginBottom: 5 }}><span style={{ fontSize: 12.5, color: "#666", fontWeight: 600 }}>Disp: </span><span style={hand}>{c.orig.disp}</span></div>
                <div style={{ marginBottom: 5 }}><span style={{ fontSize: 12.5, color: "#666", fontWeight: 600 }}>Sig: </span><span style={hand}>{c.orig.sig}</span></div>
                <div><span style={{ fontSize: 12.5, color: "#666", fontWeight: 600 }}>Refills: </span><span style={hand}>{c.orig.refills}</span></div>
              </div>
            </div>
            <div style={{ marginTop: 14, fontSize: 12.5, color: "#444" }}>
              <div>{c.orig.dawChecked ? "☑" : "☐"} Dispense As Written</div>
              <div>{c.orig.dawChecked ? "☐" : "☑"} Generic Substitution Permissible</div>
            </div>
            <div style={{ marginTop: 12, borderTop: "1px solid #ccc", paddingTop: 6, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: 10.5, color: "#888" }}>Signature</span>
              <span style={{ ...hand, fontSize: 20 }}>{c.prescriber.replace(", MD", "")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* verify button */}
      {!locked && !overrideRequired && (
        <button onClick={() => choose("__verify__")}
          style={btn(C.green, "#fff", { width: "100%", marginTop: 14, background: C.green })}>
          ✓ Everything matches — Verify &amp; fill
        </button>
      )}

      {!locked && overrideRequired && (
        <>
          <button disabled
            style={btn(C.paper2, C.muted, { width: "100%", marginTop: 14, border: `1px solid ${C.line}`, cursor: "not-allowed" })}>
            Standard approve disabled - DUR intervention required
          </button>
          <button onClick={() => { setOverrideOpen(true); setOverrideCode(""); setOverrideError(""); }}
            style={btn(C.clay, "#fff", { width: "100%", marginTop: 10, background: C.clay })}>
            Manager Override
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

function managerRxFromFillCase(c, i) {
  const lanes = ["Drive-thru", "Counter", "Waiter", "Phone"];
  const patienceMs = 32000 + ((i * 11000) % 26000);
  return {
    id: `manager-${i}-${c.rx.patient}-${c.rx.drug}`,
    patient: c.rx.patient,
    drug: c.rx.drug,
    strength: c.rx.strength,
    qty: c.rx.qty,
    sig: c.rx.sig,
    lane: lanes[i % lanes.length],
    patienceMs,
    patienceStartedAt: Date.now(),
    deEscalated: false,
    fillCase: c,
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
  const [toVerifyData, setToVerifyData] = useState(() => shuffle(FILLCHECK.filter((c) => c.level <= level)).slice(0, 6).map(managerRxFromFillCase));
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
  const timers = useRef({});
  const pendingSummaryRef = useRef(null);
  const bellPenaltyRef = useRef(0);
  const malpracticeTimerRef = useRef(null);
  const bell = useDriveThruBell(!auditOpen);

  useEffect(() => () => {
    Object.values(timers.current).forEach(clearTimeout);
    window.clearTimeout(malpracticeTimerRef.current);
  }, []);
  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 350);
    return () => clearInterval(tick);
  }, []);

  const total = completed + toVerifyData.length + inProduction.length + finalCheck.length;
  const livePatients = [...toVerifyData, ...inProduction, ...finalCheck];

  function patientLeftMs(rx) {
    return Math.max(0, rx.patienceMs - (now - rx.patienceStartedAt));
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

  function approveData(rx) {
    if (meltdown || auditOpen) return;
    const etaMs = 5000 + Math.floor(Math.random() * 7001);
    const ticket = { ...rx, etaMs, startedAt: Date.now(), readyAt: Date.now() + etaMs };
    setToVerifyData((q) => q.filter((item) => item.id !== rx.id));
    setInProduction((q) => [...q, ticket]);
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
    if (malpractice) {
      setShiftPenalties(nextPenalties);
      setPenaltyCount(nextPenaltyCount);
      setMalpracticeFlash({ patient: rx.patient, drug: `${rx.drug} ${rx.strength}`, penalty: penaltyGain });
      window.clearTimeout(malpracticeTimerRef.current);
      malpracticeTimerRef.current = window.setTimeout(() => setMalpracticeFlash(null), 2200);
    }
    if (remaining <= 0) startSafeAudit(nextCompleted, nextCorrect, nextBonuses, nextPenalties, nextPenaltyCount);
  }

  const PressureMeter = ({ rx }) => {
    const left = patientLeftMs(rx);
    const pct = Math.max(0, Math.min(100, (left / rx.patienceMs) * 100));
    const hot = pct <= 28;
    const color = pct <= 20 ? C.clay : pct <= 45 ? C.amber : C.green;
    return (
      <div style={{ marginTop: 9 }}>
        <div className="mono" style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 9.5, color: hot ? C.clay : C.muted }}>
          <span>{rx.lane}{rx.deEscalated ? " / recovered" : ""}</span>
          <span>{left > 0 ? `${Math.ceil(left / 1000)}s patience` : "ZERO"}</span>
        </div>
        <div style={{ height: 6, background: C.paper2, borderRadius: 20, overflow: "hidden", marginTop: 5 }}>
          <div style={{ width: `${pct}%`, height: "100%", background: color, transition: "width .25s linear" }} />
        </div>
      </div>
    );
  };

  const Column = ({ title, count, children }) => (
    <div style={{ minWidth: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div className="display" style={{ fontSize: 18, fontWeight: 900 }}>{title}</div>
        <span className="mono" style={{ fontSize: 11, color: C.amber }}>{count}</span>
      </div>
      <div style={{ display: "grid", gap: 10 }}>{children}</div>
    </div>
  );

  const EmptyLane = ({ text }) => (
    <div style={{ padding: 14, borderRadius: 12, border: `1px dashed ${C.line}`, color: C.muted, fontSize: 13.5, textAlign: "center" }}>{text}</div>
  );

  if (shiftReport) return <ShiftReport report={shiftReport} hourlyRate={hourlyRate} onContinue={continueShiftReport} />;
  if (auditOpen) return <SafeAudit onBalanced={finishAfterAudit} summary={pendingSummary} />;

  const hottest = livePatients.reduce((winner, rx) => {
    if (!winner) return rx;
    return patientLeftMs(rx) < patientLeftMs(winner) ? rx : winner;
  }, null);

  return (
    <div className="rise">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 16 }}>
          <Stat label="Cleared" value={completed} color={C.pine} />
          <Stat label="Accuracy" value={completed ? `${Math.round((correct / completed) * 100)}%` : "-"} color={C.amber} />
          <Stat label="Bonuses" value={money(shiftBonuses)} color={C.green} />
          <Stat label="Penalties" value={money(shiftPenalties)} color={shiftPenalties ? C.clay : C.muted} />
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <button onClick={wtfButton} style={btn(C.clay, "#fff", { padding: "9px 13px", fontSize: 13, borderRadius: 10, background: C.clay })}>
            WTF Button
          </button>
          <button onClick={() => startSafeAudit()} style={btn("transparent", C.pine, { border: `1px solid ${C.line}`, padding: "9px 13px", fontSize: 13 })}>
            End shift / audit
          </button>
        </div>
      </div>
      <ProgressBar value={(completed / Math.max(total, 1)) * 100} />

      <p style={{ fontSize: 14, color: C.muted, margin: "14px 0 16px", lineHeight: 1.5 }}>
        Manager dashboard: approve clean data entry, watch production, clear final product verification, and keep the waiting room from boiling over.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 10, marginBottom: 14 }}>
        <div className={bell.bellActive ? "alarm-pulse" : ""} style={{
          padding: 12, borderRadius: 12, border: `1px solid ${bell.bellActive ? C.clay : C.line}`,
          background: bell.bellActive ? "rgba(178,58,36,0.12)" : C.card,
        }}>
          <div className="mono" style={{ fontSize: 9.5, letterSpacing: 1, color: bell.bellActive ? C.clay : C.muted, textTransform: "uppercase" }}>
            Drive-thru bell
          </div>
          <div className="display" style={{ fontSize: 20, fontWeight: 900, marginTop: 3 }}>
            {bell.bellActive ? "RINGING" : `${bell.bellCount} triggers`}
          </div>
        </div>
        <div style={{ padding: 12, borderRadius: 12, border: `1px solid ${C.line}`, background: C.card }}>
          <div className="mono" style={{ fontSize: 9.5, letterSpacing: 1, color: C.muted, textTransform: "uppercase" }}>
            Hottest patient
          </div>
          <div className="display" style={{ fontSize: 20, fontWeight: 900, marginTop: 3 }}>
            {hottest ? `${Math.ceil(patientLeftMs(hottest) / 1000)}s` : "Clear"}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        <Column title="To Verify Data" count={toVerifyData.length}>
          {!toVerifyData.length && <EmptyLane text="No data-entry scripts waiting." />}
          {toVerifyData.map((rx) => (
            <div key={rx.id} className="rx-card" style={{ padding: 14 }}>
              <div style={{ fontWeight: 800, fontSize: 14.5 }}>{rx.patient}</div>
              <div style={{ color: C.muted, fontSize: 13.5, marginTop: 3 }}>{rx.drug} {rx.strength}</div>
              <div className="mono" style={{ color: C.muted, fontSize: 11, marginTop: 5 }}>Qty {rx.qty} · {rx.sig}</div>
              <PressureMeter rx={rx} />
              <button onClick={() => approveData(rx)}
                style={btn(C.green, "#fff", { width: "100%", marginTop: 10, padding: "9px 12px", fontSize: 13, borderRadius: 10, background: C.green })}>
                Approve data
              </button>
            </div>
          ))}
        </Column>

        <Column title="In Production" count={inProduction.length}>
          {!inProduction.length && <EmptyLane text="No tech fills running." />}
          {inProduction.map((rx) => {
            const remaining = Math.max(0, Math.ceil((rx.readyAt - now) / 1000));
            const pct = Math.min(100, Math.max(0, ((rx.etaMs - Math.max(0, rx.readyAt - now)) / rx.etaMs) * 100));
            return (
              <div key={rx.id} className="rx-card" style={{ padding: 14 }}>
                <div style={{ fontWeight: 800, fontSize: 14.5 }}>{rx.patient}</div>
                <div style={{ color: C.muted, fontSize: 13.5, marginTop: 3 }}>{rx.drug} {rx.strength}</div>
                <div className="mono" style={{ color: C.amber, fontSize: 11, marginTop: 5 }}>Tech filling: {remaining}s</div>
                <div style={{ height: 7, background: C.paper2, borderRadius: 20, overflow: "hidden", marginTop: 9 }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: C.amber, transition: "width .25s linear" }} />
                </div>
                <PressureMeter rx={rx} />
              </div>
            );
          })}
        </Column>

        <Column title="Final Check" count={finalCheck.length}>
          {!finalCheck.length && <EmptyLane text="No filled vials ready yet." />}
          {finalCheck.map((rx) => {
            const f = rx.fillCase.fill;
            const needsReject = rx.fillCase.errorField !== null;
            return (
              <div key={rx.id} className="rx-card" style={{ padding: 14 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <VialScatter p={f.pill} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 14.5 }}>{rx.patient}</div>
                    <div style={{ color: C.muted, fontSize: 13.2 }}>{rx.drug} {rx.strength}</div>
                    <div className="mono" style={{ color: C.muted, fontSize: 11, marginTop: 5 }}>Shape: {f.pill.shape}</div>
                    <div className="mono" style={{ color: C.muted, fontSize: 11 }}>Imprint: {f.pill.imprint}</div>
                  </div>
                </div>
                <div style={{ marginTop: 10, padding: 10, borderRadius: 10, background: "rgba(31,74,63,0.05)", fontSize: 12.5, color: C.muted }}>
                  Stock: {f.stockDrug} {f.stockStrength} · Count {f.count}
                </div>
                <div className="mono" style={{ color: needsReject ? C.amber : C.muted, fontSize: 10.5, marginTop: 7 }}>Review stock, count, vial pills, and label before clearing.</div>
                <PressureMeter rx={rx} />
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <button onClick={() => finalAction(rx, "reject")}
                    style={btn("transparent", C.clay, { border: `1px solid ${C.clay}`, flex: 1, padding: "9px 8px", fontSize: 12.5, borderRadius: 10 })}>
                    Reject
                  </button>
                  <button onClick={() => finalAction(rx, "approve")}
                    style={btn(C.green, "#fff", { flex: 1, padding: "9px 8px", fontSize: 12.5, borderRadius: 10, background: C.green })}>
                    Approve
                  </button>
                </div>
              </div>
            );
          })}
        </Column>
      </div>

      <button onClick={onQuit} style={btn("transparent", C.muted, { border: `1px solid ${C.line}`, width: "100%", marginTop: 14, fontSize: 13 })}>
        Quit to home
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

  const HeaderStat = ({ label, value, color }) => (
    <div style={{ minWidth: 112, padding: "10px 12px", borderRadius: 12, border: `1px solid ${C.line}`, background: "rgba(255,255,255,0.46)" }}>
      <div className="display" style={{ fontSize: 20, fontWeight: 900, color: color || C.ink, lineHeight: 1 }}>{value}</div>
      <div className="mono" style={{ fontSize: 9.5, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginTop: 4 }}>{label}</div>
    </div>
  );

  const careerHeader = (
    <div className="rx-card" style={{ padding: 14, marginBottom: 14, position: "sticky", top: 8, zIndex: 40 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div>
          <div className="pixel" style={{ fontSize: 10, color: C.amber, marginBottom: 6 }}>CAREER MODE</div>
          <div className="display" style={{ fontSize: 25, fontWeight: 900, lineHeight: 1 }}>PIC Track</div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <HeaderStat label="Bank" value={money(bankBalance)} color={bankBalance >= 0 ? C.green : C.clay} />
          <HeaderStat label="Hourly" value={money(hourlyRate)} color={C.pine} />
          <HeaderStat label="Day" value={dayCount} color={C.amber} />
          <HeaderStat label="Clean" value={`${consecutiveCleanShifts}/3`} color={consecutiveCleanShifts >= 2 ? C.green : C.muted} />
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
          <div className="pixel blink" style={{ fontSize: 12, color: C.clay, marginBottom: 14 }}>PROMOTION EARNED</div>
          <div className="display" style={{ fontSize: 40, fontWeight: 900, lineHeight: 1 }}>Hourly Rate Up</div>
          <p style={{ maxWidth: 450, margin: "16px auto 0", lineHeight: 1.5, fontWeight: 700 }}>
            Three clean shifts in a row. Corporate bumped you from {money(promotion.from)} to {money(promotion.to)} per hour.
          </p>
          <button onClick={() => setPhase("dashboard")} style={btn(C.pine, "#fff", { marginTop: 20, minWidth: 220 })}>
            Continue career
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rise">
      {careerHeader}
      <div className="rx-card" style={{ padding: 22, overflow: "hidden", position: "relative" }}>
        <div style={{ position: "absolute", right: -28, top: -24, fontSize: 126, opacity: 0.06, fontFamily: "'Fraunces',serif" }}>$</div>
        <div className="mono" style={{ fontSize: 10, letterSpacing: 1, color: C.amber, textTransform: "uppercase", marginBottom: 10 }}>
          Day {dayCount} / Manager Career
        </div>
        <div className="display" style={{ fontSize: 31, fontWeight: 900, lineHeight: 1.05, marginBottom: 10 }}>
          Run the shift. Keep the job.
        </div>
        <p style={{ color: C.muted, lineHeight: 1.55, margin: "0 0 18px", maxWidth: 520 }}>
          Each shift pays eight hours, rewards clean final checks, and punishes severe verification failures with malpractice settlements.
          Three clean shifts in a row earns an automatic raise.
        </p>

        {lastShift && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))", gap: 10, marginBottom: 18 }}>
            <HeaderStat label="Last net" value={money(lastShift.netProfit)} color={lastShift.netProfit >= 0 ? C.green : C.clay} />
            <HeaderStat label="Bonuses" value={money(lastShift.totalBonuses || 0)} color={C.green} />
            <HeaderStat label="Penalties" value={money(lastShift.totalPenalties || 0)} color={lastShift.totalPenalties ? C.clay : C.muted} />
          </div>
        )}

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={() => setPhase("shift")} style={btn(C.pine, "#fff", { flex: "1 1 220px", background: C.pine })}>
            Start Shift
          </button>
          <button onClick={onQuit} style={btn("transparent", C.pine, { border: `1px solid ${C.line}`, flex: "0 1 150px" })}>
            Exit career
          </button>
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

  const startSetup = (m) => { setMode(m); setScreen("setup"); };
  const openReference = () => setScreen("reference");
  const begin = () => setScreen("play");
  const finish = (res) => {
    setResult(res); setScreen("result");
    const modeTag = mode === 8 ? 'law' : mode === 7 ? 'insurance' : mode === 3 ? 'counter' : mode === 2 ? 'fill' : 'general';
    recordDrillResult({ correct: res.correct || 0, total: res.total || 0, modeTag, save, setSave });
  };
  const home = () => { setScreen("home"); setMode(null); setResult(null); };

  return (
    <div style={{
      minHeight: "100vh", background: C.paper, color: C.ink,
      fontFamily: "'Spline Sans', sans-serif",
      backgroundImage:
        `radial-gradient(circle at 12% 18%, rgba(192,120,30,0.08), transparent 38%),
         radial-gradient(circle at 88% 82%, rgba(31,74,63,0.10), transparent 42%)`,
    }}>
      <style>{FONTS}{`
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        .rx-card { background:${C.card}; border:1px solid ${C.line};
          border-radius:20px; box-shadow: 0 10px 30px -18px rgba(31,74,63,0.45); }
        .display { font-family:'Fraunces', serif; }
        .mono { font-family:'Spline Sans Mono', monospace; }
        .rise { animation: rise .5s cubic-bezier(.2,.7,.2,1) both; }
        @keyframes rise { from{opacity:0; transform:translateY(14px)} to{opacity:1; transform:none} }
        .pop { animation: pop .28s cubic-bezier(.2,.8,.2,1) both; }
        @keyframes pop { from{opacity:0; transform:scale(.96)} to{opacity:1; transform:scale(1)} }
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
      `}</style>
      <div className="crtv" /><div className="scan" />

      {!save.ageGateAccepted && <AgeGate save={save} setSave={setSave} />}

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "26px 18px 80px" }}>
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
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={onHome}>
        <div style={{
          width: 44, height: 44, borderRadius: 12, background: C.pine,
          color: C.paper, display: "grid", placeItems: "center",
          fontFamily: "'Fraunces',serif", fontSize: 24, fontWeight: 900,
          boxShadow: "0 8px 18px -10px rgba(31,74,63,0.8)",
        }}>℞</div>
        <div>
          <div className="pixel" style={{ fontSize: 14, color: C.pine, lineHeight: 1 }}>RxReady</div>
          <div className="pixel" style={{ fontSize: 7, color: C.amber, marginTop: 5 }}>PHARMACY ARCADE</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {save && (
          <div style={{ textAlign: "right" }}>
            <div className="display" style={{ fontSize: 16, fontWeight: 900, color: C.green, lineHeight: 1 }}>${save.currency}</div>
            <div className="mono" style={{ fontSize: 9, letterSpacing: 1, textTransform: "uppercase", color: C.muted }}>{rank}</div>
          </div>
        )}
        {show && (
          <button onClick={onHome} style={btn("transparent", C.pine, { border: `1px solid ${C.line}`, padding: "9px 16px", fontSize: 14 })}>
            ← Home
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------- Home ---------- */
function Home({ onPick, onReference, showRef, setShowRef, save, onAfterHours, onSettings }) {
  const [showSched, setShowSched] = useState(false);
  return (
    <div className="rise">
      <div style={{ textAlign: "center", margin: "6px 0 18px" }}>
        <h1 className="pixel" style={{ fontSize: 26, color: C.pine, margin: "0 0 12px", lineHeight: 1.5, textShadow: `3px 3px 0 ${C.amberSoft}` }}>RxReady</h1>
        <div className="pixel blink" style={{ fontSize: 9, color: C.amber }}>★ INSERT COIN · WORK THE COUNTER ★</div>
      </div>

      {/* HERO — The Shift = PLAY */}
      {(() => {
        const shift = modeById(14);
        return (
          <button onClick={() => onPick(14)} className="lift"
            style={{ width: "100%", textAlign: "left", cursor: "pointer", border: `2px solid ${C.amber}`, borderRadius: 18,
              padding: 22, marginBottom: 22, color: C.paper, position: "relative", overflow: "hidden",
              background: `linear-gradient(135deg, ${C.pine}, ${C.pineSoft})`,
              boxShadow: "0 18px 40px -20px rgba(31,74,63,0.8)" }}>
            <div style={{ position: "absolute", right: -20, top: -20, fontSize: 150, opacity: 0.08, fontFamily: "'Fraunces',serif" }}>℞</div>
            <div className="pixel" style={{ fontSize: 8, color: C.amberSoft, marginBottom: 12 }}>▶ STORY MODE</div>
            <div className="pixel" style={{ fontSize: 20, lineHeight: 1.4, marginBottom: 12 }}>CAREER MODE</div>
            <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.5, opacity: 0.9, maxWidth: 460 }}>{shift.desc}</p>
            <div className="pixel blink" style={{ display: "inline-block", marginTop: 16, background: C.amber, color: C.paper, borderRadius: 6, padding: "10px 16px", fontSize: 11 }}>
              ▶ PRESS START
            </div>
          </button>
        );
      })()}

      <div className="pixel" style={{ fontSize: 10, color: C.pine, marginBottom: 14 }}>▸ STAGE SELECT</div>
      <div style={{ display: "grid", gap: 14, marginBottom: 14 }}>
        {MODE_GROUPS.map((group, gi) => (
          <div key={group.id} className="rx-card lift" style={{ padding: 18, background: C.card }}>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 14 }}>
              <button onClick={() => onPick(group.lead)}
                style={{
                  border: "none", cursor: "pointer", minWidth: 58, height: 58, borderRadius: 14,
                  background: gi === 0 ? C.amber : C.pine, color: C.paper, display: "grid", placeItems: "center",
                  fontSize: 25, fontFamily: "'Fraunces',serif", fontWeight: 900,
                }}>
                {String(gi + 1).padStart(2, "0")}
              </button>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <span className="display" style={{ fontSize: 22, fontWeight: 900 }}>{group.title}</span>
                  <span className="mono" style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: C.amber, border: "1px solid " + C.amberSoft, borderRadius: 20, padding: "3px 9px" }}>{group.tag}</span>
                </div>
                <p style={{ margin: "6px 0 0", color: C.muted, fontSize: 14.5, lineHeight: 1.5 }}>{group.desc}</p>
              </div>
            </div>

            <div style={{ display: "grid", gap: 9 }}>
              {group.modes.map((id) => {
                const m = modeById(id);
                return (
                  <button key={id} onClick={() => onPick(id)}
                    style={{
                      border: "1px solid " + (id === group.lead ? C.amberSoft : C.line),
                      background: id === group.lead ? "rgba(192,120,30,0.10)" : C.paper,
                      color: C.ink, borderRadius: 12, padding: "11px 12px", cursor: "pointer",
                      display: "grid", gridTemplateColumns: "34px 1fr auto", gap: 10, alignItems: "center", textAlign: "left",
                    }}>
                    <span style={{
                      width: 34, height: 34, borderRadius: 10, background: id === group.lead ? C.amber : C.paper2,
                      color: id === group.lead ? C.paper : C.pine, display: "grid", placeItems: "center",
                      fontFamily: "'Fraunces',serif", fontWeight: 900, fontSize: 17,
                    }}>{m.icon}</span>
                    <span style={{ minWidth: 0 }}>
                      <span style={{ display: "block", fontWeight: 800, fontSize: 15.5 }}>{m.title}</span>
                      <span style={{ display: "block", color: C.muted, fontSize: 12.5, lineHeight: 1.35 }}>{m.tag}</span>
                    </span>
                    <span style={{ color: C.amber, fontSize: 20, lineHeight: 1 }}>&gt;</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "none" }}>
        {MODES.filter((m) => m.id !== 9).map((m, i) => (
          <button key={m.id} className="rx-card lift" onClick={() => onPick(m.id)}
            style={{ textAlign: "left", padding: 20, cursor: "pointer", display: "flex", gap: 16, alignItems: "flex-start", background: C.card }}>
            <div style={{ position: "relative", minWidth: 52, height: 52 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14, background: C.pine, color: C.paper,
                display: "grid", placeItems: "center", fontSize: 26, fontFamily: "'Fraunces',serif",
              }}>{m.icon}</div>
              <div className="pixel" style={{ position: "absolute", top: -6, left: -6, fontSize: 7, background: C.amber, color: C.paper, borderRadius: 4, padding: "2px 4px" }}>{String(i + 1).padStart(2, "0")}</div>
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span className="display" style={{ fontSize: 21, fontWeight: 900 }}>{m.title}</span>
                <span className="mono" style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: C.amber, border: `1px solid ${C.amberSoft}`, borderRadius: 20, padding: "3px 9px" }}>{m.tag}</span>
              </div>
              <p style={{ margin: "6px 0 0", color: C.muted, fontSize: 14.5, lineHeight: 1.5 }}>{m.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* drug reference */}
      <button onClick={onReference} className="lift"
        style={{ width: "100%", marginTop: 14, padding: "16px 18px", borderRadius: 16, cursor: "pointer",
          background: C.pine, color: C.paper, border: "none", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 22, fontFamily: "'Fraunces',serif" }}>🔍︎</span>
          <span style={{ textAlign: "left" }}>
            <span className="display" style={{ fontSize: 18, fontWeight: 900, display: "block" }}>Drug Reference</span>
            <span style={{ fontSize: 13, opacity: 0.85 }}>Look up any of the top dispensed drugs</span>
          </span>
        </span>
        <span style={{ fontSize: 20 }}>›</span>
      </button>

      {/* quick reference */}
      <button onClick={() => setShowRef(!showRef)}
        style={btn("transparent", C.pine, { border: `1px dashed ${C.line}`, width: "100%", marginTop: 18, fontSize: 14 })}>
        {showRef ? "Hide" : "Show"} quick sig-code cheat sheet
      </button>
      {showRef && (
        <div className="rx-card pop" style={{ padding: 18, marginTop: 12 }}>
          <div className="mono" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 18px", fontSize: 13.5 }}>
            {[["PO", "by mouth"], ["SL", "sublingual"], ["BID", "twice daily"], ["TID", "3× daily"],
              ["QID", "4× daily"], ["PRN", "as needed"], ["HS", "at bedtime"], ["AC / PC", "before / after meals"],
              ["q6h", "every 6 hours"], ["gtt", "drop(s)"], ["OD / OS / OU", "right / left / both eyes"],
              ["AD / AS / AU", "right / left / both ears"], ["stat", "immediately"], ["tsp / tbsp", "5 mL / 15 mL"]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${C.line}`, paddingBottom: 4 }}>
                <strong style={{ color: C.pine }}>{k}</strong><span style={{ color: C.muted }}>{v}</span>
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
        style={{ width: "100%", marginTop: 14, padding: "16px 18px", borderRadius: 16, cursor: "pointer",
          background: `linear-gradient(135deg, #3A1A4A, #1F2A5A)`, color: C.paper,
          border: `1px solid rgba(192,120,30,0.4)`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 22 }}>★</span>
          <span style={{ textAlign: "left" }}>
            <span className="pixel" style={{ fontSize: 10, display: "block", marginBottom: 4 }}>AFTER HOURS</span>
            <span style={{ fontSize: 13, opacity: 0.85 }}>Life sim · dating · RPG stats · spend your shift earnings</span>
          </span>
        </span>
        <span style={{ fontSize: 20, color: C.amber }}>›</span>
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
          <Stat label="Streak" value={`×${streak}`} color={C.amber} />
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

      <div className="rx-card pop" key={idx} style={{ padding: 20, marginBottom: 16 }}>
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
function FillMode({ level, onFinish, onQuit }) {
  const [cases] = useState(() => shuffle(RXCASES.filter((c) => c.level <= level)).slice(0, 5));
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

  function answer(i) {
    if (locked) return;
    setSelected(i); setLocked(true); setTotal((t) => t + 1);
    if (i === step.answer) setCorrect((x) => x + 1);
  }
  function next() {
    if (si + 1 < c.steps.length) { setSi(si + 1); setSelected(null); setLocked(false); return; }
    if (ci + 1 < cases.length) { setCi(ci + 1); setSi(0); setSelected(null); setLocked(false); return; }
    onFinish({ mode: 2, correct: correct, total: total, rxFilled: cases.length });
  }

  return (
    <div className="rise">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span className="mono" style={{ fontSize: 12, color: C.muted }}>Prescription {ci + 1} of {cases.length}</span>
        <span className="mono" style={{ fontSize: 12, color: C.pine, fontWeight: 600 }}>{correct}/{total} verified</span>
      </div>
      <ProgressBar value={(doneSteps / totalSteps) * 100} />

      {/* Rx label */}
      <div className="rx-card" style={{ padding: 0, marginTop: 16, overflow: "hidden" }}>
        <div style={{ background: C.pine, color: C.paper, padding: "10px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="display" style={{ fontWeight: 900, fontSize: 20 }}>℞ Prescription</span>
          <span className="mono" style={{ fontSize: 11, opacity: 0.8 }}>{c.refills}</span>
        </div>
        <div style={{ padding: "16px 18px", fontFamily: "'Spline Sans Mono', monospace", fontSize: 13.5, lineHeight: 1.7 }}>
          <div style={{ color: C.muted }}>{c.patient}</div>
          <div style={{ color: C.muted, marginBottom: 8 }}>{c.prescriber}</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: C.ink }}>{c.drug}</div>
          <div style={{ color: C.pineSoft, fontWeight: 600 }}>Sig: {c.sig}</div>
          <div style={{ color: C.muted }}>Disp: {c.qty}</div>
        </div>
      </div>

      {/* step */}
      <div className="rx-card pop" key={`${ci}-${si}`} style={{ padding: 20, marginTop: 14 }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: C.amber, marginBottom: 8 }}>
          Step {si + 1} of {c.steps.length}
        </div>
        <h3 style={{ fontSize: 17.5, fontWeight: 700, margin: "0 0 16px", lineHeight: 1.35 }}>{step.prompt}</h3>
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
function Result({ result, onAgain, onHome }) {
  let grade = "—", line = "", color = C.pine, stats = [];

  if (result.mode === 1) {
    const pct = result.total ? Math.round((result.correct / result.total) * 100) : 0;
    grade = pct >= 90 ? "A" : pct >= 80 ? "B" : pct >= 70 ? "C" : pct >= 60 ? "D" : "F";
    color = pct >= 80 ? C.green : pct >= 60 ? C.amber : C.clay;
    line = result.outOfLives
      ? "You ran out of lives — review the misses and run it back."
      : pct >= 80 ? "Sharp recall under pressure. You're bench-ready on these." : "Solid start — speed comes with reps.";
    stats = [
      { label: "Score", value: result.score },
      { label: "Accuracy", value: pct + "%" },
      { label: "Best streak", value: "×" + result.bestStreak },
    ];
  } else if (result.mode === 2) {
    const pct = result.total ? Math.round((result.correct / result.total) * 100) : 0;
    grade = pct >= 90 ? "A" : pct >= 80 ? "B" : pct >= 70 ? "C" : pct >= 60 ? "D" : "F";
    color = pct >= 80 ? C.green : pct >= 60 ? C.amber : C.clay;
    line = pct >= 80 ? "Clean fills — sig, math, and safety checks all on point." : "Re-run the cases; the calculations get faster every time.";
    stats = [
      { label: "Rx filled", value: result.rxFilled },
      { label: "Steps right", value: `${result.correct}/${result.total}` },
      { label: "Accuracy", value: pct + "%" },
    ];
  } else if (result.mode === 5) {
    const pct = result.total ? Math.round((result.correct / result.total) * 100) : 0;
    grade = pct >= 90 ? "A" : pct >= 80 ? "B" : pct >= 70 ? "C" : pct >= 60 ? "D" : "F";
    color = pct >= 80 ? C.green : pct >= 60 ? C.amber : C.clay;
    line = pct >= 80
      ? "Strong verification instincts — you caught the alerts and made the right calls."
      : "Review the misses — the safest pharmacist catches the alert before it reaches the patient.";
    stats = [
      { label: "Rx reviewed", value: result.reviewed },
      { label: "Correct calls", value: `${result.correct}/${result.total}` },
      { label: "Accuracy", value: pct + "%" },
    ];
  } else if (result.mode === 6) {
    const pct = result.total ? Math.round((result.correct / result.total) * 100) : 0;
    grade = pct >= 90 ? "A" : pct >= 80 ? "B" : pct >= 70 ? "C" : pct >= 60 ? "D" : "F";
    color = pct >= 80 ? C.green : pct >= 60 ? C.amber : C.clay;
    line = pct >= 80
      ? "Clear, complete directions — that's a label a patient can actually follow."
      : "Review the misses — every element of the sig has to be right for the directions to be safe.";
    stats = [
      { label: "Scripts", value: result.scripts },
      { label: "Clean", value: `${result.correct}/${result.total}` },
      { label: "Accuracy", value: pct + "%" },
    ];
  } else if (result.mode === 7) {
    const pct = result.total ? Math.round((result.correct / result.total) * 100) : 0;
    grade = pct >= 90 ? "A" : pct >= 80 ? "B" : pct >= 70 ? "C" : pct >= 60 ? "D" : "F";
    color = pct >= 80 ? C.green : pct >= 60 ? C.amber : C.clay;
    line = pct >= 80
      ? "You read the codes and got the patient's meds moving — that's the front-counter win."
      : "Review the misses — knowing what each reject code means turns a frustrated patient into a solved problem.";
    stats = [
      { label: "Claims worked", value: result.resolved },
      { label: "Correct calls", value: `${result.correct}/${result.total}` },
      { label: "Accuracy", value: pct + "%" },
    ];
  } else if (result.mode === 13) {
    const pct = result.completed ? Math.round((result.correct / result.completed) * 100) : 0;
    grade = pct >= 90 ? "A" : pct >= 80 ? "B" : pct >= 70 ? "C" : pct >= 60 ? "D" : "F";
    color = pct >= 80 ? C.green : pct >= 60 ? C.amber : C.clay;
    line = pct >= 80
      ? "Manager loop handled: data verified, production moved, final checks cleared, and the CII safe balanced."
      : "Run the manager loop again and slow down at final check.";
    stats = [
      { label: "Final checks", value: result.completed },
      { label: "Net", value: result.netProfit !== undefined ? money(result.netProfit) : `${result.correct}/${result.completed}` },
      { label: "Penalties", value: result.totalPenalties !== undefined ? money(result.totalPenalties) : result.auditAttempts || 1 },
    ];
  } else {
    const r = result.rating;
    grade = r >= 85 ? "A" : r >= 70 ? "B" : r >= 55 ? "C" : r >= 40 ? "D" : "F";
    color = r >= 70 ? C.green : r >= 45 ? C.amber : C.clay;
    line = r >= 80 ? "Safe, lawful, and patient-centered. That's the job." : "Watch the risky picks — safety and the law come before speed.";
    stats = [
      { label: "Shift rating", value: r },
      { label: "Best calls", value: result.counts.best },
      { label: "Risky calls", value: result.counts.bad },
    ];
  }

  return (
    <div className="rise" style={{ textAlign: "center", paddingTop: 8 }}>
      <div className="pop" style={{
        width: 110, height: 110, borderRadius: "50%", margin: "0 auto 16px",
        background: C.card, border: `3px solid ${color}`, display: "grid", placeItems: "center",
        boxShadow: `0 16px 40px -20px ${color}`,
      }}>
        <span className="display" style={{ fontSize: 52, fontWeight: 900, color }}>{grade}</span>
      </div>
      <h2 className="display" style={{ fontSize: 26, fontWeight: 900, margin: "0 0 6px" }}>Shift complete</h2>
      <p style={{ color: C.muted, fontSize: 15.5, maxWidth: 460, margin: "0 auto 22px", lineHeight: 1.5 }}>{line}</p>

      <div className="rx-card" style={{ padding: 20, display: "flex", justifyContent: "space-around", marginBottom: 22 }}>
        {stats.map((s) => <Stat key={s.label} {...s} color={color} />)}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onHome} style={btn("transparent", C.pine, { border: `1px solid ${C.line}`, flex: 1 })}>Home</button>
        <button onClick={onAgain} style={btn(C.pine, C.paper, { flex: 1 })}>Play again →</button>
      </div>
    </div>
  );
}
