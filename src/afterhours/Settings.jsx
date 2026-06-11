import React from 'react';
import { updateSettings, resetSave } from './save.js';
import { NARRATOR_NAME } from './narrator.js';

const C = {
  paper: '#F2E9D6', paper2: '#ECE1C9', card: '#FBF6EA',
  ink: '#22302A', pine: '#1F4A3F', amber: '#C0781E',
  amberSoft: '#E2A552', clay: '#B23A24', green: '#2E8B57',
  muted: '#6E7C70', line: 'rgba(31,74,63,0.16)',
};

const btn = (bg, color, extra = {}) => ({
  background: bg, color, border: 'none', borderRadius: 14,
  padding: '12px 20px', fontFamily: "'Spline Sans', sans-serif",
  fontWeight: 600, fontSize: 15, cursor: 'pointer', ...extra,
});

function Toggle({ on, onToggle, label, desc }) {
  return (
    <button onClick={onToggle} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      width: '100%', textAlign: 'left', background: 'transparent',
      border: `1px solid ${C.line}`, borderRadius: 14, padding: '14px 16px',
      cursor: 'pointer', fontFamily: "'Spline Sans', sans-serif",
    }}>
      <div>
        <div style={{ fontWeight: 700, fontSize: 15, color: C.ink }}>{label}</div>
        <div style={{ fontSize: 13, color: C.muted, marginTop: 3 }}>{desc}</div>
      </div>
      <div style={{
        width: 44, height: 24, borderRadius: 12,
        background: on ? C.pine : C.paper2,
        position: 'relative', transition: 'background .2s', flexShrink: 0,
      }}>
        <div style={{
          position: 'absolute', top: 3, left: on ? 23 : 3,
          width: 18, height: 18, borderRadius: '50%',
          background: on ? C.paper : C.muted, transition: 'left .2s',
        }} />
      </div>
    </button>
  );
}

export default function Settings({ save, setSave, onHome }) {
  const [confirming, setConfirming] = React.useState(false);

  const narrator = save.settings.narrator;
  const sound = save.settings.sound;

  return (
    <div className="rise" style={{ fontFamily: "'Spline Sans', sans-serif" }}>
      <h2 className="display" style={{ fontSize: 26, fontWeight: 900, margin: '0 0 4px' }}>Settings</h2>
      <p style={{ color: C.muted, fontSize: 14, margin: '0 0 24px' }}>
        These settings are saved in your browser.
      </p>

      <div style={{ display: 'grid', gap: 12, marginBottom: 28 }}>
        {/* Narrator mode */}
        <div className="rx-card" style={{ padding: 18 }}>
          <div style={{ fontFamily: "'Spline Sans Mono',monospace", fontSize: 11, letterSpacing: 1,
            textTransform: 'uppercase', color: C.amber, marginBottom: 12 }}>
            {NARRATOR_NAME} — Narrator Mode
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {[['pro', 'Pro', 'Encouraging, clean, professional'], ['merc', 'Merc', 'Salty, profanity, dark humor (18+)']].map(([val, label, desc]) => (
              <button key={val}
                onClick={() => updateSettings({ narrator: val }, save, setSave)}
                style={{
                  flex: 1, padding: '12px 10px', borderRadius: 12, cursor: 'pointer',
                  border: `1.5px solid ${narrator === val ? C.amber : C.line}`,
                  background: narrator === val ? 'rgba(192,120,30,0.1)' : C.card,
                  textAlign: 'left', fontFamily: "'Spline Sans', sans-serif",
                }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: C.ink }}>{label}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 3, lineHeight: 1.4 }}>{desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Sound */}
        <Toggle
          on={sound}
          onToggle={() => updateSettings({ sound: !sound }, save, setSave)}
          label="Sound effects"
          desc="8-bit beeps in The Shift"
        />
      </div>

      {/* Save info */}
      <div className="rx-card" style={{ padding: '14px 16px', marginBottom: 24 }}>
        <div style={{ fontFamily: "'Spline Sans Mono',monospace", fontSize: 11, letterSpacing: 1,
          textTransform: 'uppercase', color: C.muted, marginBottom: 8 }}>Current save</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 14 }}>
          <span style={{ color: C.muted }}>RxBucks</span>
          <span style={{ fontWeight: 700, color: C.ink }}>${save.currency}</span>
          <span style={{ color: C.muted }}>Lifetime earned</span>
          <span style={{ fontWeight: 700, color: C.ink }}>${save.lifetimeEarned}</span>
          <span style={{ color: C.muted }}>Shifts worked</span>
          <span style={{ fontWeight: 700, color: C.ink }}>{save.shifts}</span>
        </div>
      </div>

      {/* Reset */}
      {!confirming ? (
        <button onClick={() => setConfirming(true)}
          style={btn('transparent', C.clay, { border: `1px solid ${C.clay}`, width: '100%', marginBottom: 10 })}>
          Reset all save data
        </button>
      ) : (
        <div style={{ padding: '16px', borderRadius: 14, border: `1px solid ${C.clay}`,
          background: 'rgba(178,58,36,0.08)', marginBottom: 10 }}>
          <p style={{ margin: '0 0 12px', fontSize: 14, color: C.ink, lineHeight: 1.5 }}>
            This permanently deletes all progress — currency, stats, and relationships. Are you sure?
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setConfirming(false)}
              style={btn('transparent', C.pine, { border: `1px solid ${C.line}`, flex: 1 })}>
              Cancel
            </button>
            <button onClick={() => { resetSave(setSave); setConfirming(false); }}
              style={btn(C.clay, C.paper, { flex: 1 })}>
              Yes, reset
            </button>
          </div>
        </div>
      )}

      <button onClick={onHome}
        style={btn('transparent', C.pine, { border: `1px solid ${C.line}`, width: '100%' })}>
        ← Home
      </button>
    </div>
  );
}
