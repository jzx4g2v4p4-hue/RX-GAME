const fs = require("fs");

const file = "src/RxReady.jsx";
let code = fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
let changed = false;

if (!code.includes('drug: "bupropion XL"')) {
  const marker = "\n];\n\nconst FCFIELD";
  const cases = `
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
  },`;

  if (!code.includes(marker)) throw new Error("Could not find FILLCHECK insertion marker.");
  code = code.replace(marker, cases + marker);
  changed = true;
}

if (!code.includes("function VialScatter")) {
  const pillEnd = `function Pill({ p, size }) {
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
`;

  const scatter = `
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
`;

  if (!code.includes(pillEnd)) throw new Error("Could not find Pill component insertion marker.");
  code = code.replace(pillEnd, pillEnd + scatter);
  changed = true;
}

if (!code.includes("Visual Inspection")) {
  const oldZone = `          <Zone k="pill" title="Pills in vial">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Pill p={f.pill} size={28} />
              <span className="mono" style={{ fontSize: 11, color: C.muted }}>{f.pill.shape}, {f.pill.imprint}</span>
            </div>
          </Zone>`;

  const newZone = `          <Zone k="pill" title="Pills in vial">
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
          </Zone>`;

  if (!code.includes(oldZone)) throw new Error("Could not find Pills in vial zone.");
  code = code.replace(oldZone, newZone);
  changed = true;
}

if (changed) fs.writeFileSync(file, code, "utf8");
console.log(changed ? "Applied RxReady update." : "RxReady update was already present.");