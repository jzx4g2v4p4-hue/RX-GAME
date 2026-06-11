/* ============================================================
   RxReady — After Hours save system
   Persists currency, rank, RPG stats, relationships, settings
   ============================================================ */

const KEY = 'rxready_save_v1';

const DEFAULT = {
  currency: 0,
  lifetimeEarned: 0,
  stats: { speed: 0, accuracy: 0, counseling: 0, law: 0 },
  shifts: 0,
  relationships: {
    jada:  { affection: 0, stage: 0, dateCount: 0 },
    simone: { affection: 0, stage: 0, dateCount: 0 },
    priya: { affection: 0, stage: 0, dateCount: 0 },
    lin:   { affection: 0, stage: 0, dateCount: 0 },
  },
  settings: { narrator: 'pro', sound: true },
  ageGateAccepted: false,
};

/* Rank ladder — threshold is lifetimeEarned */
export const RANKS = [
  [0,     'Intern'],
  [300,   'Extern'],
  [1000,  'New Grad'],
  [3000,  'Staff Pharmacist'],
  [7000,  'Senior PharmD'],
  [15000, 'Pharmacist-in-Charge'],
  [30000, 'Legend'],
];

/* Affection thresholds for relationship stage 0-3 */
const STAGE_THRESHOLDS = [0, 35, 90, 180];

export function loadSave() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return JSON.parse(JSON.stringify(DEFAULT));
    const p = JSON.parse(raw);
    return {
      ...DEFAULT, ...p,
      stats: { ...DEFAULT.stats, ...(p.stats || {}) },
      settings: { ...DEFAULT.settings, ...(p.settings || {}) },
      relationships: {
        jada:  { ...DEFAULT.relationships.jada,  ...(p.relationships?.jada  || {}) },
        simone: { ...DEFAULT.relationships.simone, ...(p.relationships?.simone || {}) },
        priya: { ...DEFAULT.relationships.priya, ...(p.relationships?.priya || {}) },
        lin:   { ...DEFAULT.relationships.lin,   ...(p.relationships?.lin   || {}) },
      },
    };
  } catch { return JSON.parse(JSON.stringify(DEFAULT)); }
}

function write(data) {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {}
}

export function getRank(lifetime) {
  let name = RANKS[0][1];
  RANKS.forEach(([t, n]) => { if (lifetime >= t) name = n; });
  return name;
}

/* XP → display level 0-10 */
export function getStatLevel(xp) { return Math.min(10, Math.floor(xp / 40)); }

/* ---- After a Shift ends ---- */
export function recordShiftResult({ cash, served, errors, maxCombo, save, setSave }) {
  const total = served + errors;
  const accGain = total > 0 ? Math.round((served / total) * 6) : 0;
  const speedGain = Math.min(20, (maxCombo || 0) * 2);
  const next = {
    ...save,
    currency: save.currency + cash,
    lifetimeEarned: save.lifetimeEarned + cash,
    shifts: (save.shifts || 0) + 1,
    stats: {
      ...save.stats,
      accuracy: save.stats.accuracy + accGain,
      speed: save.stats.speed + speedGain,
    },
  };
  write(next); setSave(next); return next;
}

/* ---- After any drill ends ---- */
export function recordDrillResult({ correct, total, modeTag, save, setSave }) {
  if (!total) return save;
  const earn = correct * 3;
  const accGain = Math.round((correct / total) * 4);
  const lawGain = (modeTag === 'law' || modeTag === 'insurance') ? correct * 2 : 0;
  const counselGain = (modeTag === 'counsel' || modeTag === 'fill' || modeTag === 'counter') ? correct * 2 : 0;
  const next = {
    ...save,
    currency: save.currency + earn,
    lifetimeEarned: save.lifetimeEarned + earn,
    stats: {
      ...save.stats,
      accuracy: save.stats.accuracy + accGain,
      law: save.stats.law + lawGain,
      counseling: save.stats.counseling + counselGain,
    },
  };
  write(next); setSave(next); return next;
}

export function spendCurrency(amount, save, setSave) {
  if (save.currency < amount) return false;
  const next = { ...save, currency: save.currency - amount };
  write(next); setSave(next); return true;
}

export function updateRelationship(id, delta, save, setSave) {
  const cur = { ...save.relationships[id] };
  cur.affection = Math.max(0, (cur.affection || 0) + delta);
  let stage = 0;
  STAGE_THRESHOLDS.forEach((t, i) => { if (cur.affection >= t) stage = i; });
  cur.stage = stage;
  const next = { ...save, relationships: { ...save.relationships, [id]: cur } };
  write(next); setSave(next); return next;
}

export function bumpDateCount(id, save, setSave) {
  const cur = { ...save.relationships[id], dateCount: (save.relationships[id].dateCount || 0) + 1 };
  const next = { ...save, relationships: { ...save.relationships, [id]: cur } };
  write(next); setSave(next); return next;
}

export function updateSettings(changes, save, setSave) {
  const next = { ...save, settings: { ...save.settings, ...changes } };
  write(next); setSave(next); return next;
}

export function acceptAgeGate(save, setSave) {
  const next = { ...save, ageGateAccepted: true };
  write(next); setSave(next); return next;
}

export function resetSave(setSave) {
  const fresh = JSON.parse(JSON.stringify(DEFAULT));
  write(fresh); setSave(fresh); return fresh;
}
