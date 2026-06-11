import React, { useState } from 'react';
import { LOVE_INTERESTS, STAGE_LABELS, STAGE_COLORS } from './data.js';
import { spendCurrency, updateRelationship, bumpDateCount } from './save.js';
import { getQuip, NARRATOR_NAME } from './narrator.js';

/* Palette — matches the parent app */
const C = {
  paper: '#F2E9D6', paper2: '#ECE1C9', card: '#FBF6EA',
  ink: '#22302A', pine: '#1F4A3F', pineSoft: '#2C6353',
  amber: '#C0781E', amberSoft: '#E2A552', clay: '#B23A24',
  green: '#2E8B57', muted: '#6E7C70', line: 'rgba(31,74,63,0.16)',
};

const btn = (bg, color, extra = {}) => ({
  background: bg, color, border: 'none', borderRadius: 14,
  padding: '12px 20px', fontFamily: "'Spline Sans', sans-serif",
  fontWeight: 600, fontSize: 15, cursor: 'pointer',
  letterSpacing: '0.2px', ...extra,
});

/* ---- SVG bust portraits — one per character id ---- */
function Portrait({ li, size = 88 }) {
  const scale = size / 80;

  function renderJada() {
    /* Jada Westbrook — ER Nurse. Deep brown skin, natural puffy hair,
       dark teal scrubs. Sardonic raised-eyebrow expression. */
    return (
      <>
        <defs>
          <radialGradient id="jada-bg" cx="50%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#3A5C4E" />
            <stop offset="100%" stopColor="#1C3028" />
          </radialGradient>
        </defs>
        {/* Background */}
        <rect width={80} height={80} fill="url(#jada-bg)" />
        {/* Shoulders / scrubs */}
        <path d="M8 80 Q8 60 20 57 Q40 54 60 57 Q72 60 72 80 Z" fill="#234D44" />
        {/* Neck */}
        <rect x={34} y={50} width={12} height={10} rx={3} fill="#8B5E3C" />
        {/* Face oval */}
        <ellipse cx={40} cy={36} rx={16} ry={19} fill="#8B5E3C" />
        {/* Natural puffy hair — wide rounded crown */}
        <ellipse cx={40} cy={22} rx={20} ry={16} fill="#1A0A02" />
        {/* Hair volume sides */}
        <ellipse cx={24} cy={30} rx={8} ry={12} fill="#1A0A02" />
        <ellipse cx={56} cy={30} rx={8} ry={12} fill="#1A0A02" />
        {/* Ear left */}
        <ellipse cx={24} cy={38} rx={3} ry={4} fill="#7A5030" />
        {/* Ear right */}
        <ellipse cx={56} cy={38} rx={3} ry={4} fill="#7A5030" />
        {/* Left brow — raised slightly (sardonic) */}
        <path d="M29 28 Q33 25 37 27" stroke="#0D0503" strokeWidth={1.8} fill="none" strokeLinecap="round" />
        {/* Right brow — more raised */}
        <path d="M43 26 Q47 23 51 26" stroke="#0D0503" strokeWidth={1.8} fill="none" strokeLinecap="round" />
        {/* Left eye */}
        <ellipse cx={33} cy={33} rx={3.5} ry={2.8} fill="#1A0808" />
        <ellipse cx={33} cy={33} rx={2} ry={1.8} fill="#3B1A0A" />
        <circle cx={34.2} cy={32.2} r={0.7} fill="white" opacity={0.85} />
        {/* Right eye — slightly narrower, sardonic */}
        <ellipse cx={47} cy={32.5} rx={3.2} ry={2.4} fill="#1A0808" />
        <ellipse cx={47} cy={32.5} rx={1.8} ry={1.5} fill="#3B1A0A" />
        <circle cx={48.1} cy={31.8} r={0.7} fill="white" opacity={0.85} />
        {/* Nose suggestion */}
        <path d="M38 37 Q40 40 42 37" stroke="#6A4020" strokeWidth={1} fill="none" strokeLinecap="round" />
        {/* Mouth — slight asymmetric smirk */}
        <path d="M33 44 Q38 47 45 43" stroke="#5A2A10" strokeWidth={1.6} fill="none" strokeLinecap="round" />
        {/* Accent dot */}
        <circle cx={72} cy={8} r={4} fill="#E2A552" opacity={0.9} />
      </>
    );
  }

  function renderSimone() {
    /* Simone Okafor — Palliative NP. Medium warm brown skin, locs/braids,
       amber earrings, plum professional attire. Calm, warm expression. */
    return (
      <>
        <defs>
          <radialGradient id="simone-bg" cx="50%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#3D2458" />
            <stop offset="100%" stopColor="#1E0E2C" />
          </radialGradient>
        </defs>
        {/* Background */}
        <rect width={80} height={80} fill="url(#simone-bg)" />
        {/* Shoulders / plum attire */}
        <path d="M8 80 Q8 60 20 57 Q40 54 60 57 Q72 60 72 80 Z" fill="#3A2252" />
        {/* Neck */}
        <rect x={34} y={50} width={12} height={10} rx={3} fill="#7B4828" />
        {/* Face oval */}
        <ellipse cx={40} cy={36} rx={15} ry={18} fill="#7B4828" />
        {/* Locs / braids — rope-like strands falling down sides */}
        <rect x={22} y={14} width={36} height={14} rx={7} fill="#2A1A08" />
        {/* Individual loc strands */}
        <rect x={23} y={24} width={4} height={22} rx={2} fill="#2A1A08" />
        <rect x={29} y={22} width={4} height={20} rx={2} fill="#2A1A08" />
        <rect x={53} y={24} width={4} height={22} rx={2} fill="#2A1A08" />
        <rect x={47} y={22} width={4} height={20} rx={2} fill="#2A1A08" />
        {/* Top hair mass */}
        <ellipse cx={40} cy={18} rx={18} ry={10} fill="#2A1A08" />
        {/* Left amber earring */}
        <circle cx={25} cy={40} r={2.5} fill="#C0781E" />
        <circle cx={25} cy={40} r={1.2} fill="#E2A552" />
        {/* Right amber earring */}
        <circle cx={55} cy={40} r={2.5} fill="#C0781E" />
        <circle cx={55} cy={40} r={1.2} fill="#E2A552" />
        {/* Brows — gentle, even */}
        <path d="M29 28 Q33 26 37 28" stroke="#180C04" strokeWidth={1.6} fill="none" strokeLinecap="round" />
        <path d="M43 28 Q47 26 51 28" stroke="#180C04" strokeWidth={1.6} fill="none" strokeLinecap="round" />
        {/* Left eye — open, warm */}
        <ellipse cx={33} cy={33} rx={3.5} ry={3} fill="#18080A" />
        <ellipse cx={33} cy={33} rx={2} ry={2} fill="#3C1C10" />
        <circle cx={34.2} cy={32} r={0.8} fill="white" opacity={0.9} />
        {/* Right eye */}
        <ellipse cx={47} cy={33} rx={3.5} ry={3} fill="#18080A" />
        <ellipse cx={47} cy={33} rx={2} ry={2} fill="#3C1C10" />
        <circle cx={48.2} cy={32} r={0.8} fill="white" opacity={0.9} />
        {/* Nose */}
        <path d="M38 37.5 Q40 40.5 42 37.5" stroke="#5A3018" strokeWidth={1} fill="none" strokeLinecap="round" />
        {/* Mouth — soft, calm smile */}
        <path d="M33 44 Q40 48 47 44" stroke="#4A2010" strokeWidth={1.6} fill="none" strokeLinecap="round" />
        {/* Accent dot */}
        <circle cx={72} cy={8} r={4} fill="#C0781E" opacity={0.9} />
      </>
    );
  }

  function renderPriya() {
    /* Priya Mehta — IM Resident. Warm tan South Asian skin, long straight
       dark hair with side strands, dark navy/white coat. Sharp, tired, determined. */
    return (
      <>
        <defs>
          <radialGradient id="priya-bg" cx="50%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#5C3A6E" />
            <stop offset="100%" stopColor="#2E1A3A" />
          </radialGradient>
        </defs>
        {/* Background */}
        <rect width={80} height={80} fill="url(#priya-bg)" />
        {/* White coat suggestion over navy */}
        <path d="M8 80 Q8 58 18 55 Q40 51 62 55 Q72 58 72 80 Z" fill="#2A3A5C" />
        <path d="M8 80 Q8 60 16 57 L22 55 L22 80 Z" fill="#E8E0D0" opacity={0.9} />
        <path d="M72 80 Q72 60 64 57 L58 55 L58 80 Z" fill="#E8E0D0" opacity={0.9} />
        {/* Neck */}
        <rect x={34} y={50} width={12} height={10} rx={3} fill="#C4895A" />
        {/* Face oval */}
        <ellipse cx={40} cy={35} rx={15} ry={18} fill="#C4895A" />
        {/* Long straight hair — main mass at back */}
        <rect x={22} y={8} width={36} height={50} rx={4} fill="#0A0806" />
        {/* Hair top */}
        <ellipse cx={40} cy={14} rx={17} ry={9} fill="#0A0806" />
        {/* Side strands in front */}
        <path d="M25 20 Q22 32 24 50" stroke="#0A0806" strokeWidth={4} fill="none" strokeLinecap="round" />
        <path d="M55 20 Q58 32 56 50" stroke="#0A0806" strokeWidth={4} fill="none" strokeLinecap="round" />
        {/* Brows — sharp, slight furrow */}
        <path d="M28 27 Q32 24.5 37 26.5" stroke="#06040A" strokeWidth={2} fill="none" strokeLinecap="round" />
        <path d="M43 26 Q48 24 52 26.5" stroke="#06040A" strokeWidth={2} fill="none" strokeLinecap="round" />
        {/* Slight inner brow tension crease */}
        <line x1={38} y1={26} x2={39} y2={28} stroke="#06040A" strokeWidth={0.8} opacity={0.6} />
        {/* Left eye — slightly narrowed, tired but sharp */}
        <ellipse cx={32.5} cy={32} rx={3.5} ry={2.5} fill="#100808" />
        <ellipse cx={32.5} cy={32} rx={2} ry={1.6} fill="#2C1410" />
        <circle cx={33.5} cy={31.3} r={0.7} fill="white" opacity={0.85} />
        {/* Right eye */}
        <ellipse cx={47.5} cy={32} rx={3.5} ry={2.5} fill="#100808" />
        <ellipse cx={47.5} cy={32} rx={2} ry={1.6} fill="#2C1410" />
        <circle cx={48.5} cy={31.3} r={0.7} fill="white" opacity={0.85} />
        {/* Under-eye shadow (tired) */}
        <path d="M29 34.5 Q32.5 35.5 36 34.5" stroke="#A06A3A" strokeWidth={0.8} fill="none" opacity={0.5} />
        <path d="M44 34.5 Q47.5 35.5 51 34.5" stroke="#A06A3A" strokeWidth={0.8} fill="none" opacity={0.5} />
        {/* Nose */}
        <path d="M37.5 37 Q40 40 42.5 37" stroke="#9A6030" strokeWidth={1} fill="none" strokeLinecap="round" />
        {/* Mouth — pressed, determined */}
        <path d="M33 43.5 Q40 46 47 43.5" stroke="#8A3C18" strokeWidth={1.5} fill="none" strokeLinecap="round" />
        {/* Accent dot */}
        <circle cx={72} cy={8} r={4} fill="#C0781E" opacity={0.9} />
      </>
    );
  }

  function renderLin() {
    /* Lin Nakamura — Clinical Pharmacist. East Asian lighter skin, neat dark
       hair pulled back, navy clinical wear. Precise, half-smile expression. */
    return (
      <>
        <defs>
          <radialGradient id="lin-bg" cx="50%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#243C5C" />
            <stop offset="100%" stopColor="#0E1E30" />
          </radialGradient>
        </defs>
        {/* Background */}
        <rect width={80} height={80} fill="url(#lin-bg)" />
        {/* Navy clinical wear */}
        <path d="M8 80 Q8 60 20 57 Q40 54 60 57 Q72 60 72 80 Z" fill="#1E3A5A" />
        {/* Neck */}
        <rect x={34} y={50} width={12} height={10} rx={3} fill="#D4A882" />
        {/* Face oval — slightly more angular */}
        <ellipse cx={40} cy={35} rx={15} ry={18} fill="#D4A882" />
        {/* Hair pulled back — smooth flat top, small bun suggestion */}
        <ellipse cx={40} cy={15} rx={17} ry={10} fill="#0A0806" />
        {/* Bun at back-top */}
        <ellipse cx={40} cy={10} rx={7} ry={5} fill="#0A0806" />
        {/* Hair wraps sides smoothly down to ears */}
        <path d="M23 15 Q21 24 23 35" stroke="#0A0806" strokeWidth={5} fill="none" strokeLinecap="round" />
        <path d="M57 15 Q59 24 57 35" stroke="#0A0806" strokeWidth={5} fill="none" strokeLinecap="round" />
        {/* Small stray strand for personality */}
        <path d="M35 14 Q34 18 35 22" stroke="#0A0806" strokeWidth={1.2} fill="none" strokeLinecap="round" />
        {/* Brows — clean, even, precise */}
        <path d="M28.5 26 Q33 24.5 37 26" stroke="#08060A" strokeWidth={1.8} fill="none" strokeLinecap="round" />
        <path d="M43 26 Q47 24.5 51.5 26" stroke="#08060A" strokeWidth={1.8} fill="none" strokeLinecap="round" />
        {/* Left eye — almond shape, attentive */}
        <path d="M29 32 Q33 29 37 32 Q33 35 29 32 Z" fill="#140C0A" />
        <ellipse cx={33} cy={32} rx={1.8} ry={1.8} fill="#2A1808" />
        <circle cx={33.9} cy={31.2} r={0.7} fill="white" opacity={0.9} />
        {/* Right eye */}
        <path d="M43 32 Q47 29 51 32 Q47 35 43 32 Z" fill="#140C0A" />
        <ellipse cx={47} cy={32} rx={1.8} ry={1.8} fill="#2A1808" />
        <circle cx={47.9} cy={31.2} r={0.7} fill="white" opacity={0.9} />
        {/* Nose — subtle */}
        <path d="M38 36.5 Q40 39.5 42 36.5" stroke="#B88860" strokeWidth={0.9} fill="none" strokeLinecap="round" />
        {/* Mouth — slight knowing half-smile, right corner up */}
        <path d="M33 43 Q38 45.5 43 43" stroke="#9A6040" strokeWidth={1.5} fill="none" strokeLinecap="round" />
        <path d="M43 43 Q46 42 47 41.5" stroke="#9A6040" strokeWidth={1.2} fill="none" strokeLinecap="round" />
        {/* Accent dot */}
        <circle cx={72} cy={8} r={4} fill="#7EB8C9" opacity={0.9} />
      </>
    );
  }

  function renderFallback() {
    return (
      <>
        <rect width={80} height={80} fill={li.portraitBg} />
        <circle cx={40} cy={40} r={24} fill={li.portraitAccent} opacity={0.6} />
        <circle cx={40} cy={33} r={12} fill={li.portraitAccent} opacity={0.4} />
      </>
    );
  }

  function renderInner() {
    switch (li.id) {
      case 'jada':   return renderJada();
      case 'simone': return renderSimone();
      case 'priya':  return renderPriya();
      case 'lin':    return renderLin();
      default:       return renderFallback();
    }
  }

  return (
    <div style={{
      width: size, height: size, borderRadius: 14, overflow: 'hidden',
      background: li.portraitBg, border: `2px solid ${li.portraitAccent}`,
      flexShrink: 0,
    }}>
      <svg width={size} height={size} viewBox="0 0 80 80">
        {renderInner()}
      </svg>
    </div>
  );
}

/* ---- Affection meter ---------------------------------------------- */
function AffectionBar({ current, stage }) {
  const thresholds = [0, 35, 90, 180, 300];
  const next = thresholds[stage + 1] || 300;
  const prev = thresholds[stage] || 0;
  const pct = Math.min(100, ((current - prev) / (next - prev)) * 100);
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 11, fontFamily: "'Spline Sans Mono',monospace", letterSpacing: 1,
          textTransform: 'uppercase', color: STAGE_COLORS[stage] }}>{STAGE_LABELS[stage]}</span>
        {stage < 3 && (
          <span style={{ fontSize: 11, fontFamily: "'Spline Sans Mono',monospace", color: C.muted }}>
            → {STAGE_LABELS[stage + 1]} at {next}
          </span>
        )}
      </div>
      <div style={{ height: 6, background: C.paper2, borderRadius: 6, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: STAGE_COLORS[stage], transition: 'width .4s ease',
        }} />
      </div>
    </div>
  );
}

/* ---- Single love-interest card on the hub screen ------------------ */
function LICard({ li, rel, onDate }) {
  const stage = rel?.stage || 0;
  const affection = rel?.affection || 0;
  const dateCount = rel?.dateCount || 0;
  return (
    <div className="rx-card lift" style={{ padding: 18, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      <Portrait li={li} size={72} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 9, flexWrap: 'wrap' }}>
          <span className="display" style={{ fontSize: 17, fontWeight: 900 }}>{li.name}</span>
          <span style={{ fontSize: 12, fontFamily: "'Spline Sans Mono',monospace",
            color: C.muted }}>{li.age} · {li.occupation}</span>
        </div>
        {dateCount === 0
          ? <p style={{ margin: '6px 0 10px', fontSize: 13, color: C.muted, lineHeight: 1.5, fontStyle: 'italic' }}>
              {li.intro}
            </p>
          : <AffectionBar current={affection} stage={stage} />
        }
        {dateCount > 0 && (
          <div style={{ margin: '6px 0 10px', fontSize: 12, fontFamily: "'Spline Sans Mono',monospace",
            color: C.muted }}>{dateCount} date{dateCount !== 1 ? 's' : ''}</div>
        )}
        <button onClick={onDate} style={btn(C.pine, C.paper, { padding: '8px 16px', fontSize: 13 })}>
          {dateCount === 0 ? 'Introduce yourself →' : 'Ask out →'}
        </button>
      </div>
    </div>
  );
}

/* ---- Date picker -------------------------------------------------- */
function DatePicker({ li, save, onSelectDate, onCancel }) {
  const rel = save.relationships[li.id] || {};
  const stage = rel.stage || 0;
  const available = li.dates.filter(d => d.minStage <= stage);
  return (
    <div className="rise">
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
        <Portrait li={li} size={60} />
        <div>
          <div className="display" style={{ fontSize: 20, fontWeight: 900 }}>{li.name}</div>
          <div style={{ fontSize: 13, color: C.muted }}>{li.occupation}</div>
        </div>
      </div>

      <div style={{ fontFamily: "'Spline Sans Mono',monospace", fontSize: 11, letterSpacing: 1,
        textTransform: 'uppercase', color: C.pine, marginBottom: 12 }}>Choose a date</div>

      <div style={{ display: 'grid', gap: 10 }}>
        {available.map(d => (
          <button key={d.id} className="rx-card lift" onClick={() => onSelectDate(d)}
            style={{ textAlign: 'left', padding: '14px 18px', cursor: 'pointer',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{d.label}</div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{d.scene.split('.')[0]}.</div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              {d.cost > 0
                ? <span className="display" style={{ fontSize: 15, fontWeight: 900, color: C.amber }}>${d.cost}</span>
                : <span style={{ fontSize: 13, color: C.green }}>Free</span>}
            </div>
          </button>
        ))}
      </div>

      <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 12,
        background: 'rgba(31,74,63,0.06)', border: `1px solid ${C.line}` }}>
        <span className="display" style={{ fontSize: 22, fontWeight: 900, color: C.pine }}>${save.currency}</span>
        <span style={{ fontSize: 13, color: C.muted, marginLeft: 6 }}>available</span>
      </div>

      <button onClick={onCancel}
        style={btn('transparent', C.pine, { border: `1px solid ${C.line}`, width: '100%', marginTop: 12 })}>
        ← Back
      </button>
    </div>
  );
}

/* ---- Date sequence (dialogue loop) -------------------------------- */
function DateScene({ li, date, save, setSave, narratorMode, onFinish }) {
  const [dIdx, setDIdx] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [locked, setLocked] = useState(false);
  const [totalGain, setTotalGain] = useState(0);
  const [phase, setPhase] = useState('dialogue'); // dialogue | fadeToBlack | morningAfter
  const [narratorQuip, setNarratorQuip] = useState('');

  const dialogue = date.dialogues[dIdx];

  function choose(opt) {
    if (locked) return;
    setChosen(opt);
    setLocked(true);
    setTotalGain(g => g + opt.gain);
    const quip = getQuip(opt.gain >= 14 ? 'correct' : 'wrong', narratorMode);
    setNarratorQuip(quip);
  }

  function nextDialogue() {
    if (dIdx + 1 < date.dialogues.length) {
      setDIdx(d => d + 1);
      setChosen(null);
      setLocked(false);
      setNarratorQuip('');
    } else {
      // All dialogues done — check for fade-to-black
      const rel = save.relationships[li.id] || {};
      const newAffection = (rel.affection || 0) + totalGain + (chosen?.gain || 0);
      if (date.fadeToBlack && newAffection >= date.fadeToBlack.minAffectionForScene) {
        setPhase('fadeToBlack');
      } else {
        finishDate(totalGain + (chosen?.gain || 0));
      }
    }
  }

  function finishDate(gain) {
    // Deduct cost (already checked before entering)
    updateRelationship(li.id, gain, save, setSave);
    bumpDateCount(li.id, save, setSave);
    const good = gain >= date.dialogues.length * 12;
    onFinish({ gain, good });
  }

  /* Fade-to-black screen */
  if (phase === 'fadeToBlack') {
    return (
      <div className="rise" style={{ textAlign: 'center', padding: '32px 20px' }}>
        <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, maxWidth: 420, margin: '0 auto 28px',
          fontStyle: 'italic' }}>
          {date.fadeToBlack.text}
        </div>
        <div className="pixel" style={{ fontSize: 18, color: C.amber, letterSpacing: 8, margin: '0 0 28px' }}>
          {date.fadeToBlack.cut}
        </div>
        <div className="rx-card" style={{ padding: '18px 20px', maxWidth: 420, margin: '0 auto 24px',
          textAlign: 'left', fontStyle: 'italic', lineHeight: 1.6, color: C.ink }}>
          {date.fadeToBlack.morning}
        </div>
        <button onClick={() => finishDate(totalGain + (chosen?.gain || 0))}
          style={btn(C.pine, C.paper, { padding: '12px 28px' })}>
          Continue →
        </button>
      </div>
    );
  }

  return (
    <div className="rise">
      {/* Scene header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
        <Portrait li={li} size={52} />
        <div>
          <div className="display" style={{ fontSize: 17, fontWeight: 900 }}>{li.name}</div>
          <div style={{ fontSize: 12, color: C.muted }}>{date.label}</div>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={{ fontFamily: "'Spline Sans Mono',monospace", fontSize: 10, color: C.muted,
            letterSpacing: 1, textTransform: 'uppercase' }}>Scene</div>
          <div style={{ fontFamily: "'Spline Sans Mono',monospace", fontSize: 13, color: C.pine,
            fontWeight: 600 }}>{dIdx + 1}/{date.dialogues.length}</div>
        </div>
      </div>

      {/* Scene description */}
      {dIdx === 0 && (
        <div style={{ fontStyle: 'italic', fontSize: 13.5, color: C.muted, lineHeight: 1.6,
          marginBottom: 14, padding: '10px 14px', borderRadius: 12,
          background: 'rgba(31,74,63,0.05)', border: `1px dashed ${C.line}` }}>
          {date.scene}
        </div>
      )}

      {/* Dialogue prompt */}
      <div className="rx-card pop" key={dIdx} style={{ padding: '18px 20px', marginBottom: 12 }}>
        <p style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, lineHeight: 1.5, color: C.ink }}>
          {dialogue.prompt}
        </p>
        <div style={{ display: 'grid', gap: 9 }}>
          {dialogue.options.map((opt, i) => {
            let bg = C.card, border = C.line, color = C.ink;
            if (locked && chosen === opt) { bg = 'rgba(192,120,30,0.14)'; border = C.amber; }
            return (
              <button key={i} disabled={locked} onClick={() => choose(opt)}
                style={{ textAlign: 'left', background: bg, border: `1.5px solid ${border}`,
                  color, borderRadius: 12, padding: '12px 15px',
                  cursor: locked ? 'default' : 'pointer', fontSize: 14.5, lineHeight: 1.4,
                  transition: 'background .12s, border-color .12s',
                  fontFamily: "'Spline Sans', sans-serif" }}>
                {opt.text}
              </button>
            );
          })}
        </div>

        {/* Narrator quip after choice */}
        {locked && narratorQuip && (
          <div className="pop" style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10,
            background: 'rgba(192,120,30,0.08)', border: `1px solid ${C.amberSoft}`,
            fontSize: 13, color: C.ink, fontStyle: 'italic' }}>
            <span style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 8, color: C.amber,
              marginRight: 8 }}>ZIPPO</span>
            {narratorQuip}
          </div>
        )}
      </div>

      {locked && (
        <button onClick={nextDialogue} style={btn(C.pine, C.paper, { width: '100%' })}>
          {dIdx + 1 >= date.dialogues.length ? 'End of night →' : 'Continue →'}
        </button>
      )}
    </div>
  );
}

/* ---- Date result screen ------------------------------------------ */
function DateResult({ li, result, onHome }) {
  return (
    <div className="rise" style={{ textAlign: 'center', padding: '16px 0' }}>
      <Portrait li={li} size={80} />
      <div style={{ height: 16 }} />
      <h2 className="display" style={{ fontSize: 22, fontWeight: 900, margin: '0 0 8px' }}>
        {result.good ? 'Good night' : 'Rough night'}
      </h2>
      <p style={{ color: C.muted, fontSize: 14.5, margin: '0 auto 20px', lineHeight: 1.5, maxWidth: 380 }}>
        {result.good
          ? 'There\'s something building here. You can feel it.'
          : 'Not every night lands. Sometimes it\'s the timing.'}
      </p>
      <div className="rx-card" style={{ padding: '14px 20px', marginBottom: 18, display: 'inline-block' }}>
        <span style={{ fontFamily: "'Spline Sans Mono',monospace", fontSize: 11, letterSpacing: 1,
          textTransform: 'uppercase', color: C.muted }}>Affection gained </span>
        <span className="display" style={{ fontSize: 20, fontWeight: 900, color: C.amber }}>
          +{result.gain}
        </span>
      </div>
      <div style={{ height: 8 }} />
      <button onClick={onHome} style={btn(C.pine, C.paper, { padding: '12px 28px' })}>
        Back to After Hours
      </button>
    </div>
  );
}

/* ---- Stats panel -------------------------------------------------- */
function StatsPanel({ save }) {
  const { stats } = save;
  const getStatLevel = (xp) => Math.min(10, Math.floor(xp / 40));
  const statDefs = [
    { key: 'speed', label: 'Speed', desc: 'Reduces patient impatience in The Shift', color: C.amber },
    { key: 'accuracy', label: 'Accuracy', desc: 'Boosts tips per correct answer', color: C.green },
    { key: 'counseling', label: 'Counseling', desc: 'Leveled by At the Counter + Fill the Rx', color: C.pine },
    { key: 'law', label: 'Law', desc: 'Leveled by Virginia Law + Insurance Desk', color: C.clay },
  ];
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {statDefs.map(({ key, label, desc, color }) => {
        const lvl = getStatLevel(stats[key] || 0);
        const pct = ((stats[key] || 0) % 40) / 40 * 100;
        return (
          <div key={key} className="rx-card" style={{ padding: '12px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{label}</span>
                <span style={{ fontSize: 12, color: C.muted, marginLeft: 8 }}>{desc}</span>
              </div>
              <span className="display" style={{ fontSize: 16, fontWeight: 900, color }}>
                Lv.{lvl}
              </span>
            </div>
            <div style={{ height: 5, background: C.paper2, borderRadius: 5, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: color, transition: 'width .4s' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---- Main AfterHours component ------------------------------------ */
export default function AfterHours({ save, setSave, narratorMode, onHome }) {
  const [view, setView] = useState('hub'); // hub | pick | date | result
  const [selectedLI, setSelectedLI] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dateResult, setDateResult] = useState(null);
  const [cantAfford, setCantAfford] = useState(false);
  const [showStats, setShowStats] = useState(false);

  function startDatePick(li) {
    setSelectedLI(li);
    setCantAfford(false);
    setView('pick');
  }

  function selectDate(date) {
    if (date.cost > save.currency) { setCantAfford(true); return; }
    // Spend currency before entering
    const ok = spendCurrency(date.cost, save, setSave);
    if (!ok) { setCantAfford(true); return; }
    setSelectedDate(date);
    setCantAfford(false);
    setView('date');
  }

  function onDateFinish(result) {
    setDateResult(result);
    setView('result');
  }

  if (view === 'pick' && selectedLI) {
    return (
      <div style={{ animation: 'rise .5s cubic-bezier(.2,.7,.2,1) both' }}>
        {cantAfford && (
          <div style={{ marginBottom: 12, padding: '10px 14px', borderRadius: 12,
            background: 'rgba(178,58,36,0.1)', border: `1px solid ${C.clay}`,
            fontSize: 13, color: C.clay }}>
            Not enough RxBucks — work a shift to earn more.
          </div>
        )}
        <DatePicker li={selectedLI} save={save}
          onSelectDate={selectDate} onCancel={() => setView('hub')} />
      </div>
    );
  }

  if (view === 'date' && selectedLI && selectedDate) {
    return (
      <DateScene li={selectedLI} date={selectedDate} save={save} setSave={setSave}
        narratorMode={narratorMode} onFinish={onDateFinish} />
    );
  }

  if (view === 'result' && selectedLI && dateResult) {
    return <DateResult li={selectedLI} result={dateResult} onHome={() => setView('hub')} />;
  }

  /* Hub screen */
  return (
    <div className="rise">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <div>
          <h2 className="pixel" style={{ fontSize: 14, color: C.pine, margin: 0, lineHeight: 1.4 }}>
            AFTER HOURS
          </h2>
          <div className="pixel" style={{ fontSize: 7, color: C.amber, marginTop: 4 }}>
            ★ LIFE SIM · DATING SIM
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="display" style={{ fontSize: 22, fontWeight: 900, color: C.green }}>
            ${save.currency}
          </div>
          <div style={{ fontFamily: "'Spline Sans Mono',monospace", fontSize: 10, color: C.muted,
            letterSpacing: 1, textTransform: 'uppercase' }}>RxBucks</div>
        </div>
      </div>

      <p style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.5, margin: '0 0 18px' }}>
        Spend your shift earnings on dates. Build relationships off the clock.
      </p>

      {/* Love interests */}
      <div style={{ display: 'grid', gap: 14 }}>
        {LOVE_INTERESTS.map(li => (
          <LICard key={li.id} li={li}
            rel={save.relationships[li.id]}
            onDate={() => startDatePick(li)} />
        ))}
      </div>

      {/* RPG Stats toggle */}
      <button onClick={() => setShowStats(s => !s)}
        style={btn('transparent', C.pine, {
          border: `1px dashed ${C.line}`, width: '100%', marginTop: 18, fontSize: 14,
        })}>
        {showStats ? 'Hide' : 'View'} RPG Stats
      </button>
      {showStats && (
        <div className="pop" style={{ marginTop: 12 }}>
          <StatsPanel save={save} />
        </div>
      )}

      <button onClick={onHome}
        style={btn('transparent', C.pine, {
          border: `1px solid ${C.line}`, width: '100%', marginTop: 12, fontSize: 14,
        })}>
        ← Back to Arcade
      </button>
    </div>
  );
}
