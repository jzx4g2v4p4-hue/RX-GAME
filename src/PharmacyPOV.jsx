import React, { useEffect, useRef, useState } from "react";
import "./PharmacyPOV.css";

const STATIONS = [
  ["patient", "Window"],
  ["terminal", "Terminal"],
  ["shelf", "Shelf"],
  ["tray", "Tray"],
  ["labeler", "Labeler"],
  ["bag", "Bagging"],
];

const STOCK = [
  ["Atorvastatin", "20 mg", "#efb55e"],
  ["Lisinopril", "10 mg", "#69bdd4"],
  ["Metformin", "500 mg", "#98cf76"],
  ["Amoxicillin", "500 mg", "#f28f75"],
  ["Sertraline", "50 mg", "#bf9fe0"],
  ["Amlodipine", "5 mg", "#f3d875"],
];

const PATIENTS = [
  { name: "Maya Bennett", dob: "04/12/1981", allergy: "Penicillin", drug: "Atorvastatin", strength: "20 mg", qty: 30, doctor: "Dr. Shah", sig: "Take one tablet by mouth every evening." },
  { name: "Jordan Lee", dob: "09/03/1974", allergy: "None", drug: "Lisinopril", strength: "10 mg", qty: 30, doctor: "Dr. Kim", sig: "Take one tablet by mouth daily." },
  { name: "Alina Price", dob: "12/20/1990", allergy: "Sulfa", drug: "Metformin", strength: "500 mg", qty: 60, doctor: "Dr. Ortiz", sig: "Take one tablet by mouth twice daily with meals." },
  { name: "Evan Brooks", dob: "07/18/2016", allergy: "None", drug: "Amoxicillin", strength: "500 mg", qty: 21, doctor: "Dr. Ray", sig: "Take one capsule by mouth three times daily for seven days." },
  { name: "Priya Nair", dob: "02/25/1988", allergy: "Latex", drug: "Sertraline", strength: "50 mg", qty: 30, doctor: "Dr. Moore", sig: "Take one tablet by mouth each morning." },
  { name: "Caleb Morgan", dob: "11/10/1962", allergy: "None", drug: "Amlodipine", strength: "5 mg", qty: 30, doctor: "Dr. Vega", sig: "Take one tablet by mouth daily." },
];

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function freshGame() {
  return {
    running: false,
    ended: false,
    focus: "patient",
    queue: shuffle(PATIENTS).map((p) => ({ ...p, patience: 100 })),
    patient: null,
    stock: null,
    count: 0,
    dob: false,
    allergy: false,
    label: false,
    scan: false,
    bag: false,
    score: 0,
    errors: 0,
    done: 0,
    time: 180,
    msg: "Clock in when you are ready.",
    tone: "",
  };
}

function copy(g) {
  return {
    ...g,
    patient: g.patient ? { ...g.patient } : null,
    stock: g.stock ? { ...g.stock } : null,
    queue: g.queue.map((p) => ({ ...p })),
  };
}

function rxName(g) {
  return g.patient ? `${g.patient.drug} ${g.patient.strength}` : "No prescription loaded";
}

function stationName(id) {
  return STATIONS.find(([key]) => key === id)?.[1] || "Counter";
}

function clock(seconds) {
  const min = Math.floor(seconds / 60).toString().padStart(2, "0");
  const sec = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${min}:${sec}`;
}

function resetOrder(g) {
  g.stock = null;
  g.count = 0;
  g.dob = false;
  g.allergy = false;
  g.label = false;
  g.scan = false;
  g.bag = false;
}

function correctStock(g) {
  return g.patient && g.stock && g.stock.drug === g.patient.drug && g.stock.strength === g.patient.strength;
}

export default function PharmacyPOV() {
  const [game, setGame] = useState(freshGame);
  const canvasRef = useRef(null);
  const live = useRef(game);

  useEffect(() => {
    live.current = game;
  }, [game]);

  const mutate = (fn) => setGame((old) => {
    const next = copy(old);
    fn(next);
    return next;
  });

  const say = (g, msg, tone = "") => {
    g.msg = msg;
    g.tone = tone;
  };

  const good = (g, msg, points = 12) => {
    g.score += points;
    if (g.patient) g.patient.patience = Math.min(100, g.patient.patience + 2);
    say(g, msg, "good");
  };

  const bad = (g, msg) => {
    g.errors += 1;
    g.score = Math.max(0, g.score - 18);
    if (g.patient) g.patient.patience = Math.max(0, g.patient.patience - 10);
    say(g, msg, "bad");
  };

  const start = () => {
    const next = freshGame();
    next.running = true;
    next.patient = next.queue.shift();
    next.msg = `${next.patient.name} steps up to the pickup window.`;
    setGame(next);
  };

  const nextPatient = (g) => {
    g.done += 1;
    g.score += Math.max(25, Math.round(g.patient.patience)) + 60;
    if (!g.queue.length) {
      g.running = false;
      g.ended = true;
      say(g, "Counter cleared. Every waiting patient is handled.", "good");
      return;
    }
    g.patient = g.queue.shift();
    g.focus = "patient";
    resetOrder(g);
    say(g, `${g.patient.name} is ready at the window.`);
  };

  useEffect(() => {
    const id = setInterval(() => {
      setGame((old) => {
        if (!old.running || !old.patient) return old;
        const next = copy(old);
        next.time = Math.max(0, next.time - 0.25);
        next.patient.patience = Math.max(0, next.patient.patience - 1.05);
        if (next.patient.patience <= 0) {
          bad(next, `${next.patient.name} left the line.`);
          if (next.queue.length) {
            next.patient = next.queue.shift();
            next.focus = "patient";
            resetOrder(next);
          } else {
            next.running = false;
            next.ended = true;
          }
        }
        if (next.time <= 0) {
          next.running = false;
          next.ended = true;
          say(next, "Shift complete.");
        }
        return next;
      });
    }, 250);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const scale = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(rect.width * scale));
      canvas.height = Math.max(1, Math.floor(rect.height * scale));
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
    };
    const frame = () => {
      const rect = canvas.getBoundingClientRect();
      draw(ctx, rect.width, rect.height, live.current, performance.now() / 1000);
      requestAnimationFrame(frame);
    };
    resize();
    window.addEventListener("resize", resize);
    requestAnimationFrame(frame);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const focus = (id) => mutate((g) => {
    if (!g.running) return;
    g.focus = id;
    say(g, `${stationName(id)} in view.`);
  });

  const chooseStock = (item) => mutate((g) => {
    g.focus = "shelf";
    g.stock = { drug: item[0], strength: item[1], color: item[2] };
    if (correctStock(g)) good(g, `${g.stock.drug} ${g.stock.strength} pulled from stock.`, 15);
    else bad(g, `${g.stock.drug} ${g.stock.strength} does not match this prescription.`);
  });

  const countBy = (n) => mutate((g) => {
    if (!correctStock(g)) return bad(g, "Pull the matching stock bottle before counting.");
    g.focus = "tray";
    g.count = Math.max(0, Math.min(120, g.count + n));
    say(g, `${g.count} tablets on the tray.`);
  });

  const askDob = () => mutate((g) => {
    g.focus = "patient";
    if (g.dob) return say(g, "DOB is already verified.");
    g.dob = true;
    good(g, `DOB verified: ${g.patient.dob}.`, 15);
  });

  const allergy = () => mutate((g) => {
    g.focus = "terminal";
    if (g.allergy) return say(g, "Allergy check is already done.");
    g.allergy = true;
    good(g, g.patient.allergy === "None" ? "No allergy conflicts found." : `${g.patient.allergy} allergy noted on profile.`, 18);
  });

  const printLabel = () => mutate((g) => {
    g.focus = "labeler";
    if (!g.dob) return bad(g, "Verify the patient before printing.");
    if (!g.allergy) return bad(g, "Check the profile before printing.");
    if (!correctStock(g)) return bad(g, "The stock bottle on the counter does not match.");
    if (g.count !== g.patient.qty) return bad(g, `Count is ${g.count}. The prescription needs ${g.patient.qty}.`);
    if (g.label) return say(g, "Label is already printed.");
    g.label = true;
    good(g, "Label printed and matched to the vial.", 28);
  });

  const scan = () => mutate((g) => {
    g.focus = "bag";
    if (!g.label) return bad(g, "Print the label before scanning.");
    if (g.scan) return say(g, "Barcode is already scanned.");
    g.scan = true;
    good(g, "Barcode scan accepted.", 22);
  });

  const bag = () => mutate((g) => {
    g.focus = "bag";
    if (!g.scan) return bad(g, "Scan the finished vial before bagging.");
    if (g.bag) return say(g, "This order is already bagged.");
    g.bag = true;
    good(g, `${g.patient.name}'s order is ready.`, 30);
  });

  const handoff = () => mutate((g) => {
    g.focus = "patient";
    if (!g.bag) return bad(g, "Finish and bag the order before handoff.");
    nextPatient(g);
  });

  const disabled = !game.running || !game.patient;
  const patience = game.patient?.patience ?? 100;
  const patienceClass = patience > 55 ? "" : patience > 25 ? "warn" : "bad";

  return (
    <main className="pov">
      <section className="scene" aria-label="Pharmacy counter point of view">
        <canvas ref={canvasRef} />
        <div className="hud">
          <Meter label="Shift" value={clock(game.time)} />
          <Meter label="Score" value={game.score} />
          <Meter label="Errors" value={game.errors} />
        </div>
        <div className="focus">{stationName(game.focus)}</div>
        {!game.running && !game.ended && <Modal title="RX Counter POV" text="Step behind the counter. Verify, fill, scan, bag, and hand off each prescription before the line loses patience." button="Start Shift" onClick={start} />}
        {game.ended && <Modal title={game.queue.length ? "Shift Complete" : "Counter Cleared"} text={`${game.done} prescriptions completed, ${game.errors} errors, final score ${game.score}.`} button="New Shift" onClick={start} />}
      </section>

      <aside className="bench" aria-label="Pharmacy workbench">
        <section className="card patient">
          <span className="eyebrow">Pickup Window</span>
          <h2>{game.patient?.name || "Waiting for patient"}</h2>
          <dl><div><dt>DOB</dt><dd>{game.dob ? game.patient?.dob : "Unverified"}</dd></div><div><dt>Allergy</dt><dd>{game.allergy ? game.patient?.allergy : "Profile locked"}</dd></div></dl>
          <div className="patience"><span className={patienceClass} style={{ width: `${patience}%` }} /></div>
        </section>

        <section className="card ticket">
          <span className="eyebrow">Active RX</span>
          <h3>{rxName(game)}</h3>
          <p>{game.patient?.sig || "No prescription loaded."}</p>
          <div className="chips"><span>Qty {game.patient?.qty || "--"}</span><span>{game.patient?.doctor || "Provider --"}</span></div>
        </section>

        <section className="stations">{STATIONS.map(([id, label]) => <button key={id} className={game.focus === id ? "active" : ""} disabled={!game.running} onClick={() => focus(id)}>{label}</button>)}</section>

        <section className="card count"><div><span className="eyebrow">Counting Tray</span><strong>{game.count} tablet{game.count === 1 ? "" : "s"}</strong></div><div>{[-1, 1, 5, 10].map((n) => <button key={n} disabled={disabled} onClick={() => countBy(n)}>{n > 0 ? `+${n}` : n}</button>)}</div></section>

        <section className="actions">
          {game.focus === "shelf" ? STOCK.map((item) => <button key={item[0]} disabled={disabled} style={{ borderColor: item[2] }} onClick={() => chooseStock(item)}>{item[0]} {item[1]}</button>) : <>
            <Action done={game.dob} disabled={disabled} onClick={askDob}>Ask DOB</Action>
            <Action done={game.allergy} disabled={disabled} onClick={allergy}>Check Allergy</Action>
            <Action done={correctStock(game)} disabled={disabled} onClick={() => focus("shelf")}>Pull Stock</Action>
            <Action disabled={disabled} onClick={() => mutate((g) => { g.focus = "tray"; g.count = 0; say(g, "The counting tray is clear."); })}>Clear Tray</Action>
            <Action done={game.label} disabled={disabled} onClick={printLabel}>Print Label</Action>
            <Action done={game.scan} disabled={disabled} onClick={scan}>Scan Barcode</Action>
            <Action done={game.bag} disabled={disabled} onClick={bag}>Bag Order</Action>
            <Action warn={game.bag} disabled={disabled} onClick={handoff}>Hand Off</Action>
          </>}
        </section>

        <section className={`card log ${game.tone}`}><p>{game.msg}</p></section>
      </aside>
    </main>
  );
}

function Meter({ label, value }) {
  return <div className="meter"><span>{label}</span><strong>{value}</strong></div>;
}

function Modal({ title, text, button, onClick }) {
  return <div className="modal"><h1>{title}</h1><p>{text}</p><button className="primary" onClick={onClick}>{button}</button></div>;
}

function Action({ children, done, warn, disabled, onClick }) {
  return <button className={`${done ? "done" : ""} ${warn ? "warn" : ""}`.trim()} disabled={disabled} onClick={onClick}>{children}</button>;
}

function draw(ctx, w, h, g, t) {
  ctx.clearRect(0, 0, w, h);
  const wall = ctx.createLinearGradient(0, 0, 0, h);
  wall.addColorStop(0, "#384044"); wall.addColorStop(0.58, "#252b2f"); wall.addColorStop(1, "#15181d");
  ctx.fillStyle = wall; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#1a1d22"; ctx.fillRect(0, h * 0.58, w, h * 0.42);

  const shift = g.focus === "shelf" ? 1 : g.focus === "bag" || g.focus === "labeler" ? -1 : 0;
  shelf(ctx, w * 0.07 - shift * 50, h * 0.13, w * 0.32, h * 0.45);
  terminal(ctx, w * 0.55 + shift * 40, h * 0.2, w * 0.25, h * 0.22, g);
  customer(ctx, w * 0.5 - shift * 18, h * 0.27 + Math.sin(t * 1.4) * 2, w, h, g);

  const counter = ctx.createLinearGradient(0, h * 0.61, 0, h);
  counter.addColorStop(0, "#40413b"); counter.addColorStop(1, "#1b1d1f");
  ctx.fillStyle = counter; ctx.beginPath(); ctx.moveTo(w * 0.09, h * 0.61); ctx.lineTo(w * 0.91, h * 0.61); ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath(); ctx.fill();

  tray(ctx, w * 0.32 - shift * 18, h * 0.67, w * 0.28, h * 0.17, g.count);
  vial(ctx, w * 0.17 - shift * 36, h * 0.68, w * 0.055, h * 0.16, g.stock);
  labeler(ctx, w * 0.66 + shift * 24, h * 0.67, w * 0.12, h * 0.1, g.label);
  bag(ctx, w * 0.8 + shift * 28, h * 0.67, w * 0.12, h * 0.16, g.bag);
  hands(ctx, w, h);
  if (g.focus === "bag") { ctx.strokeStyle = "rgba(238,116,108,.55)"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(w * 0.72, h * 0.67); ctx.lineTo(w * 0.88, h * 0.76); ctx.stroke(); }
  if (!g.running) { ctx.fillStyle = "rgba(0,0,0,.22)"; ctx.fillRect(0, 0, w, h); }
}

function box(ctx, x, y, w, h, color) { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); }
function text(ctx, s, x, y, size, color = "#f5f2e8", align = "left") { ctx.fillStyle = color; ctx.font = `800 ${size}px Inter, Segoe UI, Arial`; ctx.textAlign = align; ctx.textBaseline = "middle"; ctx.fillText(s, x, y); }
function shelf(ctx, x, y, w, h) { box(ctx, x, y, w, h, "#2d353a"); text(ctx, "Stock", x + w / 2, y + 24, 18, "#f5f2e8", "center"); for (let r = 0; r < 3; r++) for (let i = 0; i < 6; i++) { const c = STOCK[(r * 2 + i) % STOCK.length][2]; box(ctx, x + 34 + i * ((w - 70) / 6), y + 52 + r * (h / 3) + (i % 2) * 5, 28, 54, c); } }
function terminal(ctx, x, y, w, h, g) { box(ctx, x, y, w, h, "#111417"); box(ctx, x + 12, y + 12, w - 24, h - 24, "#1b3a40"); text(ctx, g.patient?.name || "Queue", x + 26, y + 38, 18, "#dffaff"); if (g.patient) { text(ctx, rxName(g), x + 26, y + 70, 15); text(ctx, `Qty ${g.patient.qty}`, x + 26, y + 99, 15, "#d3f0d5"); text(ctx, g.allergy ? `Allergy: ${g.patient.allergy}` : "Profile locked", x + 26, y + 128, 14, "#f0c76a"); } }
function customer(ctx, x, y, w, h, g) { if (!g.patient) return; const p = g.patient.patience / 100; box(ctx, x - w * .08, y + h * .045, w * .16, h * .23, p > .55 ? "#5fc1d6" : p > .25 ? "#e0a555" : "#d8756d"); ctx.fillStyle = "#d49a73"; ctx.beginPath(); ctx.arc(x, y, h * .055, 0, Math.PI * 2); ctx.fill(); text(ctx, "Pickup", x, y + h * .272, 15, "#dffaff", "center"); }
function tray(ctx, x, y, w, h, n) { box(ctx, x, y, w, h, "#d9d0bb"); box(ctx, x + w * .12, y + 18, w * .76, h - 36, "#f1eadb"); text(ctx, String(n), x + w / 2, y + h - 24, 26, "#2a2d2f", "center"); for (let i = 0; i < Math.min(n, 42); i++) { ctx.fillStyle = "#fff6d6"; ctx.beginPath(); ctx.ellipse(x + w * .18 + (i % 7) * (w * .64 / 7) + 8, y + 36 + Math.floor(i / 7) * ((h - 58) / 6) + 6, 8, 5, 0, 0, Math.PI * 2); ctx.fill(); } }
function vial(ctx, x, y, w, h, s) { box(ctx, x, y, w, h, s?.color || "#9a744b"); box(ctx, x - 3, y - 14, w + 6, 20, "#f7f1d2"); box(ctx, x + w * .14, y + h * .32, w * .72, h * .33, "#fff8e8"); if (s) text(ctx, s.drug.slice(0, 4).toUpperCase(), x + w / 2, y + h * .49, 12, "#202224", "center"); }
function labeler(ctx, x, y, w, h, printed) { box(ctx, x, y, w, h, "#161a1e"); box(ctx, x + 14, y + 15, w - 28, h - 30, printed ? "#eff4e8" : "#2a3035"); text(ctx, "Label", x + w / 2, y + h + 22, 15, "#f5f2e8", "center"); }
function bag(ctx, x, y, w, h, filled) { box(ctx, x, y, w, h, filled ? "#efddaa" : "#877f6f"); text(ctx, "Bag", x + w / 2, y + h / 2, 16, "#2b2922", "center"); }
function hands(ctx, w, h) { ctx.fillStyle = "#d49a73"; ctx.beginPath(); ctx.ellipse(w * .28, h * .94, w * .09, h * .06, -.25, 0, Math.PI * 2); ctx.ellipse(w * .72, h * .94, w * .09, h * .06, .25, 0, Math.PI * 2); ctx.fill(); }
