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

/* ---- Simple pixel portrait placeholder --------------------------------
   SWAP POINT: replace the colored rectangle with an <img> tag pointing
   to src/assets/portraits/<id>.png for each character.
   -------------------------------------------------------------------- */
function Portrait({ li, size = 88 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 14, overflow: 'hidden',
      background: li.portraitBg, border: `2px solid ${li.portraitAccent}`,
      flexShrink: 0, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', position: 'relative',
    }}>
      {/* SWAP: <img src={`/src/assets/portraits/${li.id}.png`} alt={li.name}
             style={{width:'100%',height:'100%',objectFit:'cover'}} /> */}
      <svg width={size} height={size} viewBox="0 0 44 44" style={{ shapeRendering: 'crispEdges' }}>
        {/* Background wash */}
        <rect width={44} height={44} fill={li.portraitBg} />
        {/* Body */}
        <rect x={12} y={28} width={20} height={16} fill={li.portraitAccent} opacity={0.7} />
        {/* Head */}
        <rect x={15} y={14} width={14} height={14} fill="#f2e2c8" />
        {/* Hair band — top 3 rows */}
        <rect x={14} y={12} width={16} height={4} fill={li.portraitAccent} />
        {/* Eyes */}
        <rect x={18} y={19} width={2} height={2} fill={C.ink} />
        <rect x={24} y={19} width={2} height={2} fill={C.ink} />
        {/* Mouth */}
        <rect x={20} y={24} width={4} height={1} fill={C.ink} opacity={0.5} />
        {/* Neck */}
        <rect x={20} y={28} width={4} height={3} fill="#f2e2c8" />
        {/* Stage-glow accent dot */}
        <circle cx={38} cy={6} r={4} fill={li.portraitAccent} />
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
