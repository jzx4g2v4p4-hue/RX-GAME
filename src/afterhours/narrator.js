/* ============================================================
   RxReady — Narrator: "Zippo"
   Ex-pharmacist turned ethereal fourth-wall commentator.
   Pro mode = encouraging / clean. Merc mode = salty / R-rated.
   No slurs. No bigotry. Profanity fine in Merc mode.
   ============================================================ */

export const NARRATOR_NAME = 'Zippo';

/* Zippo's pixel grid — white coat, glasses, wild hair */
export const ZIPPO_GRID = [
  [null,null,null,'h','h','h','h',null,null,null],
  [null,null,'h','h','h','h','h','h',null,null],
  [null,'g','s','s','s','s','s','s','g',null],
  [null,null,'s','e',null,'e','s',null,null,null],
  [null,null,'s','s','s','s','s',null,null,null],
  [null,null,'s','m','m','s',null,null,null,null],
  [null,null,'s','s',null,null,null,null,null,null],
  [null,'w','w','w','w','w','w','w',null,null],
  ['w','w',null,'w','w',null,'w','w',null,null],
  ['w','w',null,'w','w',null,'w','w',null,null],
];
export const ZIPPO_COLORS = {
  h: '#c0781e', s: '#f2e9d6', e: '#23311f',
  m: 'rgba(120,70,50,0.6)', w: '#eeeeee', g: '#5a8aaa',
};

const PRO = {
  correct: [
    "Correct. That's how it's done.",
    "Right call — patient safety is in good hands.",
    "Solid instinct. Keep that streak moving.",
    "Exactly right. Building the right habits.",
    "On the money. Well done.",
  ],
  wrong: [
    "Not quite — read the explanation carefully.",
    "Worth reviewing. That one can come up again.",
    "Not this time. The explanation below matters.",
    "Close, but patient safety lives in the details.",
  ],
  combo: (n) => `${n}× combo — you're in a flow state right now.`,
  walkout: [
    "Patient left the line — stay focused, keep moving.",
    "Walkout. Refocus and serve the next one.",
  ],
  shiftGood: [
    "Solid shift. You kept the line moving and the patients safe.",
    "Strong work behind the counter. That's a reliable pharmacist.",
  ],
  shiftBad: [
    "Rough shift. Rest up and come back stronger.",
    "Mistakes happen. Learn from them and reset.",
  ],
  dateGood: ["A good evening. Effort and honesty go a long way."],
  dateBad:  ["Not your best night. These things take time."],
};

const MERC = {
  correct: [
    "Oh look at you. Actually knowing things. In a pharmacy. Rare.",
    "Boom. One less incident report today. Celebrate.",
    "Correct! I'm mildly impressed. Don't tell anyone.",
    "Right answer. Your malpractice premium stays flat. For now.",
    "You absolute miracle of clinical competence. Nice.",
    "That's right! The patient lives to complain about their copay another day.",
  ],
  wrong: [
    "Yikes. That patient is in your thoughts now, huh.",
    "Wrong! But hey — this is why we have safeguards. Multiple safeguards. Layers.",
    "Nope. That's the kind of miss that ends up in a continuing-ed case study.",
    "Bold choice. Wrong choice. Courageous, though.",
    "Your confidence was inspiring. Your answer, less so.",
    "Oh buddy. That was a miss. A scenic, educational miss.",
  ],
  combo: (n) => `${n}× COMBO. The LINE is TREMBLING. You absolute machine.`,
  walkout: [
    "They left for Walgreens! WALGREENS. I hope you're happy.",
    "And they're gone. Self-diagnosing on WebMD as we speak. You did that.",
    "Walkout. Hope they enjoy the 47-minute wait at the other place.",
    "Gone! Into the wild. Godspeed, unserved patient.",
  ],
  shiftGood: [
    "Not bad. Nothing made the news. That is the bar and you cleared it.",
    "You kept people alive and got tipped. Peak pharmacist energy.",
    "Clean shift. A few near-misses but nothing catastrophic. That's the job.",
  ],
  shiftBad: [
    "That was a disaster. A beautiful, instructive, completely recoverable disaster.",
    "Rough doesn't cover it. But you showed up, which is more than half the staff does.",
    "Well. That happened. The good news is you can't be fired from a simulation.",
  ],
  dateGood: [
    "That went well! I'm emotionally invested in your love life now. This is fine.",
    "Nice work out there. You're almost a functional human person.",
  ],
  dateBad: [
    "Oof. That was painful. For them, I mean. Well — for everyone.",
    "Yikes. That's not a vibe, that's a medical incident.",
  ],
};

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

export function getQuip(event, mode = 'pro', ctx = {}) {
  const bank = mode === 'merc' ? MERC : PRO;
  switch (event) {
    case 'correct':  return pick(bank.correct);
    case 'wrong':    return pick(bank.wrong);
    case 'combo':    return bank.combo(ctx.combo || 2);
    case 'walkout':  return pick(bank.walkout);
    case 'shiftEnd': return pick(ctx.good ? bank.shiftGood : bank.shiftBad);
    case 'dateEnd':  return pick(ctx.good ? bank.dateGood : bank.dateBad);
    default:         return '';
  }
}
