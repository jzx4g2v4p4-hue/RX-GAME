const fs = require('fs');

const file = 'src/RxReady.jsx';
let src = fs.readFileSync(file, 'utf8');

const groupBlock = `

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
`;

if (!src.includes('const MODE_GROUPS = [')) {
  const anchor = '];\n\n/* ============================================================\n   QUIZ BANK';
  if (!src.includes(anchor)) throw new Error('Could not find MODES closing anchor');
  src = src.replace(anchor, `];${groupBlock}\n/* ============================================================\n   QUIZ BANK`);
}

src = src.replace('const shift = MODES.find((m) => m.id === 9);', 'const shift = modeById(14);');
src = src.replace('onClick={() => onPick(9)} className="lift"', 'onClick={() => onPick(14)} className="lift"');
src = src.replace('>THE SHIFT</div>', '>CAREER MODE</div>');

if (!src.includes('{MODE_GROUPS.map((group, gi) => (')) {
  const oldStart = '      <div style={{ display: "grid", gap: 14 }}>\n        {MODES.filter((m) => m.id !== 9).map((m, i) => (';
  const newStart = String.raw`      <div style={{ display: "grid", gap: 14, marginBottom: 14 }}>
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
        {MODES.filter((m) => m.id !== 9).map((m, i) => (`;
  if (!src.includes(oldStart)) throw new Error('Could not find flat mode list start');
  src = src.replace(oldStart, newStart);
}

fs.writeFileSync(file, src);
