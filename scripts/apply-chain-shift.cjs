const fs = require('fs');

const file = 'src/RxReady.jsx';
let src = fs.readFileSync(file, 'utf8');
let changed = false;

function mark() {
  changed = true;
}

function replaceOnce(search, replacement, label) {
  if (src.includes(replacement)) return;
  if (!src.includes(search)) throw new Error(`Missing patch target: ${label}`);
  src = src.replace(search, replacement);
  mark();
}

function replaceIfFound(search, replacement) {
  if (src.includes(search)) {
    src = src.replace(search, replacement);
    mark();
  }
}

function insertAfter(marker, insertion, guard, label) {
  if (src.includes(guard)) return;
  const index = src.indexOf(marker);
  if (index === -1) throw new Error(`Missing insert marker: ${label}`);
  src = src.slice(0, index + marker.length) + insertion + src.slice(index + marker.length);
  mark();
}

function insertBefore(marker, insertion, guard, label) {
  if (src.includes(guard)) return;
  const index = src.indexOf(marker);
  if (index === -1) throw new Error(`Missing insert marker: ${label}`);
  src = src.slice(0, index) + insertion + src.slice(index);
  mark();
}

const chainTasksBlock = [
  '',
  'const CHAIN_TASKS = [',
  '  {',
  '    id: "phones",',
  '    label: "Phones",',
  '    action: "Answer phone",',
  '    start: 2,',
  '    max: 7,',
  '    xp: 8,',
  '    score: 3,',
  '    reliefMs: 1400,',
  '    note: "Doctor line, refill status, transfer request.",',
  '  },',
  '  {',
  '    id: "pickup",',
  '    label: "Pickup",',
  '    action: "Clear pickup",',
  '    start: 3,',
  '    max: 8,',
  '    xp: 7,',
  '    score: 3,',
  '    reliefMs: 1100,',
  '    note: "Line at register wants ready prescriptions.",',
  '  },',
  '  {',
  '    id: "driveThru",',
  '    label: "Drive-thru",',
  '    action: "Run lane",',
  '    start: 2,',
  '    max: 6,',
  '    xp: 9,',
  '    score: 4,',
  '    reliefMs: 1800,',
  '    note: "Car at the window, insurance card in hand.",',
  '  },',
  '  {',
  '    id: "counsel",',
  '    label: "Counsel",',
  '    action: "Counsel",',
  '    start: 1,',
  '    max: 5,',
  '    xp: 10,',
  '    score: 5,',
  '    reliefMs: 1300,',
  '    note: "New therapy consult waiting for pharmacist.",',
  '  },',
  '  {',
  '    id: "waiters",',
  '    label: "Waiters",',
  '    action: "Prioritize waiter",',
  '    start: 2,',
  '    max: 7,',
  '    xp: 9,',
  '    score: 4,',
  '    reliefMs: 2200,',
  '    note: "Patient is waiting in-store for the fill.",',
  '  },',
  '];',
  '',
  'const initialChainTasks = () => Object.fromEntries(CHAIN_TASKS.map((task) => [task.id, task.start]));',
  ''
].join('\n');

insertAfter(
  'const modeById = (id) => MODES.find((m) => m.id === id);\n',
  chainTasksBlock,
  'const CHAIN_TASKS = [',
  'chain task definitions'
);

replaceIfFound(
  'desc: "Career, manager dashboard, pressure events, final checks, and the safe audit in one shift path.",',
  'desc: "CVS-style chain shift: queues, phones, pickup, drive-thru, waiters, metrics, final checks, and safe audit.",'
);
replaceIfFound(
  'desc: "Data entry, data verification, DUR review, and finished-product inspection.",',
  'desc: "Focused practice for QT/QV1/QV2: data entry, data verification, DUR review, and final product inspection.",'
);

insertAfter(
  '  const [malpracticeFlash, setMalpracticeFlash] = useState(null);\n',
  [
    '  const [chainTasks, setChainTasks] = useState(initialChainTasks);',
    '  const [serviceScore, setServiceScore] = useState(84);',
    '  const [chainXp, setChainXp] = useState(0);',
    '  const [chainStreak, setChainStreak] = useState(0);',
    '  const [chainToast, setChainToast] = useState(null);',
    ''
  ].join('\n'),
  'const [chainTasks, setChainTasks] = useState(initialChainTasks);',
  'chain manager state'
);

insertAfter(
  '  const malpracticeTimerRef = useRef(null);\n',
  '  const chainToastRef = useRef(null);\n',
  'const chainToastRef = useRef(null);',
  'chain toast ref'
);

insertAfter(
  '    window.clearTimeout(malpracticeTimerRef.current);\n',
  '    window.clearTimeout(chainToastRef.current);\n',
  'window.clearTimeout(chainToastRef.current);',
  'chain toast cleanup'
);

insertAfter(
  '  const livePatients = [...toVerifyData, ...inProduction, ...finalCheck];\n',
  [
    '  const chainLoad = Object.values(chainTasks).reduce((sum, value) => sum + value, 0);',
    '  const chainPressure = Math.min(100, Math.round((chainLoad / 28) * 100));',
    '  const serviceColor = serviceScore >= 85 ? C.green : serviceScore >= 70 ? C.amber : C.clay;',
    ''
  ].join('\n'),
  'const chainPressure = Math.min(100',
  'chain pressure derived values'
);

insertAfter(
  [
    '  function patientLeftMs(rx) {',
    '    return Math.max(0, rx.patienceMs - (now - rx.patienceStartedAt));',
    '  }',
    ''
  ].join('\n'),
  [
    '  function flashChainToast(message) {',
    '    setChainToast(message);',
    '    window.clearTimeout(chainToastRef.current);',
    '    chainToastRef.current = window.setTimeout(() => setChainToast(null), 1800);',
    '  }',
    '',
    '  function bumpQueuePatience(ms) {',
    '    const bump = (queue) => queue.map((rx) => ({ ...rx, patienceMs: Math.min(rx.patienceMs + ms, 120000) }));',
    '    setToVerifyData((q) => bump(q));',
    '    setInProduction((q) => bump(q));',
    '    setFinalCheck((q) => bump(q));',
    '  }',
    '',
    '  function addShiftXp(amount, scoreDelta, message) {',
    '    setChainXp((xp) => xp + amount);',
    '    setServiceScore((score) => Math.max(0, Math.min(100, score + scoreDelta)));',
    '    if (amount > 0) setChainStreak((streak) => streak + 1);',
    '    if (message) flashChainToast(message);',
    '  }',
    '',
    '  function handleChainTask(taskId) {',
    '    const task = CHAIN_TASKS.find((item) => item.id === taskId);',
    '    if (!task || auditOpen || meltdown) return;',
    '    const count = chainTasks[taskId] || 0;',
    '    if (count <= 0) {',
    '      flashChainToast(`${task.label} is already clear.`);',
    '      return;',
    '    }',
    '    setChainTasks((tasks) => ({ ...tasks, [taskId]: Math.max(0, tasks[taskId] - 1) }));',
    '    bumpQueuePatience(task.reliefMs);',
    '    addShiftXp(task.xp, task.score, `${task.action}: +${task.xp} XP`);',
    '  }',
    ''
  ].join('\n'),
  'function handleChainTask(taskId)',
  'chain task handlers'
);

replaceOnce(
  '      penaltyCount: penaltyHits,\n    };',
  [
    '      penaltyCount: penaltyHits,',
    '      serviceScore,',
    '      chainXp,',
    '      chainLoad,',
    '    };'
  ].join('\n'),
  'manager summary chain stats'
);

insertBefore(
  '  function approveData(rx) {\n',
  [
    '  useEffect(() => {',
    '    if (auditOpen || shiftReport) return undefined;',
    '    const interval = window.setInterval(() => {',
    '      const task = CHAIN_TASKS[Math.floor(Math.random() * CHAIN_TASKS.length)];',
    '      setChainTasks((tasks) => ({ ...tasks, [task.id]: Math.min(task.max, (tasks[task.id] || 0) + 1) }));',
    '      setServiceScore((score) => Math.max(0, score - (chainLoad >= 14 ? 3 : 1)));',
    '      setChainStreak(0);',
    '    }, 9000);',
    '    return () => window.clearInterval(interval);',
    '  }, [auditOpen, shiftReport, chainLoad]);',
    '',
    ''
  ].join('\n'),
  'CHAIN_TASKS[Math.floor(Math.random() * CHAIN_TASKS.length)]',
  'random chain pressure effect'
);

insertAfter(
  '    setInProduction((q) => [...q, ticket]);\n',
  '    addShiftXp(5, 1, "QV1 verified: +5 XP");\n',
  'QV1 verified: +5 XP',
  'QV1 XP reward'
);

insertAfter(
  '    if (bonusGain) setShiftBonuses(nextBonuses);\n',
  '    addShiftXp(ok ? 12 : 0, ok ? 3 : -8, ok ? "QV2 clean check: +12 XP" : "Verification miss: service score hit");\n',
  'QV2 clean check: +12 XP',
  'QV2 XP reward'
);

insertAfter(
  '      setPenaltyCount(nextPenaltyCount);\n',
  '      setServiceScore((score) => Math.max(0, score - 25));\n      setChainStreak(0);\n',
  'setServiceScore((score) => Math.max(0, score - 25));',
  'malpractice service penalty'
);

const chainButtonBlock = [
  '',
  '  const ChainTaskButton = ({ task }) => {',
  '    const count = chainTasks[task.id] || 0;',
  '    const hot = count >= Math.max(4, task.max - 2);',
  '    return (',
  '      <button',
  '        onClick={() => handleChainTask(task.id)}',
  '        style={{',
  '          border: `1px solid ${hot ? C.clay : C.line}`,',
  '          background: hot ? "rgba(178,58,36,0.10)" : C.card,',
  '          color: C.ink,',
  '          borderRadius: 12,',
  '          padding: 11,',
  '          cursor: "pointer",',
  '          textAlign: "left",',
  '          minHeight: 78,',
  '          display: "grid",',
  '          gap: 5,',
  '        }}',
  '      >',
  '        <span className="mono" style={{ fontSize: 9.5, letterSpacing: 1, textTransform: "uppercase", color: hot ? C.clay : C.amber }}>',
  '          {task.label} x{count}',
  '        </span>',
  '        <span style={{ fontWeight: 900, fontSize: 14.5 }}>{task.action}</span>',
  '        <span style={{ color: C.muted, fontSize: 11.5, lineHeight: 1.35 }}>{task.note}</span>',
  '      </button>',
  '    );',
  '  };',
  ''
].join('\n');

insertBefore(
  '  if (shiftReport) return <ShiftReport report={shiftReport} hourlyRate={hourlyRate} onContinue={continueShiftReport} />;\n',
  chainButtonBlock,
  'const ChainTaskButton = ({ task })',
  'chain task button component'
);

const managerIntro = [
  '      <div className="rx-card" style={{ padding: 14, margin: "14px 0", borderRadius: 14, background: "#fffaf0" }}>',
  '        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 12 }}>',
  '          <div>',
  '            <div className="mono" style={{ fontSize: 10, color: C.amber, letterSpacing: 1, textTransform: "uppercase", marginBottom: 5 }}>',
  '              Retail chain wallboard',
  '            </div>',
  '            <div className="display" style={{ fontSize: 24, fontWeight: 900, lineHeight: 1 }}>',
  '              QT / QV1 / QP / QV2',
  '            </div>',
  '            <div style={{ color: C.muted, fontSize: 13, lineHeight: 1.45, marginTop: 5 }}>',
  '              Clear service fires while protecting final-check accuracy.',
  '            </div>',
  '          </div>',
  '          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(72px, 1fr))", gap: 8, minWidth: 250 }}>',
  '            <HeaderStatLite label="Service" value={`${serviceScore}%`} color={serviceColor} />',
  '            <HeaderStatLite label="XP" value={chainXp} color={C.amber} />',
  '            <HeaderStatLite label="Streak" value={`x${chainStreak}`} color={chainStreak >= 5 ? C.green : C.pine} />',
  '          </div>',
  '        </div>',
  '',
  '        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 8, marginBottom: 11 }}>',
  '          {[',
  '            ["QT", toVerifyData.length, "intake/data"],',
  '            ["QV1", toVerifyData.length, "pharmacist data check"],',
  '            ["QP", inProduction.length, "tech production"],',
  '            ["QV2", finalCheck.length, "final product check"],',
  '          ].map(([label, value, sub]) => (',
  '            <div key={label} style={{ border: `1px solid ${C.line}`, borderRadius: 10, padding: "9px 10px", background: C.paper }}>',
  '              <div className="display" style={{ fontSize: 21, fontWeight: 900, color: C.pine, lineHeight: 1 }}>{label}</div>',
  '              <div className="mono" style={{ color: C.amber, fontSize: 11, marginTop: 4 }}>{value} waiting</div>',
  '              <div style={{ color: C.muted, fontSize: 11, marginTop: 4, lineHeight: 1.25 }}>{sub}</div>',
  '            </div>',
  '          ))}',
  '        </div>',
  '',
  '        <div style={{ height: 8, background: C.paper2, borderRadius: 20, overflow: "hidden", marginBottom: 11 }}>',
  '          <div style={{ width: `${chainPressure}%`, height: "100%", background: chainPressure >= 70 ? C.clay : chainPressure >= 45 ? C.amber : C.green, transition: "width .25s ease" }} />',
  '        </div>',
  '',
  '        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(142px, 1fr))", gap: 8 }}>',
  '          {CHAIN_TASKS.map((task) => <ChainTaskButton key={task.id} task={task} />)}',
  '        </div>',
  '        {chainToast && (',
  '          <div className="pop" style={{ marginTop: 10, padding: 10, borderRadius: 10, background: "rgba(46,139,87,0.12)", border: `1px solid ${C.green}`, color: C.pine, fontWeight: 800, fontSize: 13 }}>',
  '            {chainToast}',
  '          </div>',
  '        )}',
  '      </div>',
  '',
  '      <p style={{ fontSize: 14, color: C.muted, margin: "14px 0 16px", lineHeight: 1.5 }}>',
  '        Big-chain shift loop: verify QT/QV1, keep QP moving, clear QV2 final checks, and keep phones, pickup, drive-thru, counseling, and waiters under control.',
  '      </p>'
].join('\n');

replaceOnce(
  [
    '      <p style={{ fontSize: 14, color: C.muted, margin: "14px 0 16px", lineHeight: 1.5 }}>',
    '        Manager dashboard: approve clean data entry, watch production, clear final product verification, and keep the waiting room from boiling over.',
    '      </p>'
  ].join('\n'),
  managerIntro,
  'manager chain wallboard'
);

replaceIfFound('<Column title="To Verify Data" count={toVerifyData.length}>', '<Column title="QT / QV1 Data" count={toVerifyData.length}>');
replaceIfFound('                Approve data', '                Verify QV1');
replaceIfFound('<Column title="In Production" count={inProduction.length}>', '<Column title="QP Production" count={inProduction.length}>');
replaceIfFound('Tech filling: {remaining}s', 'QP fill running: {remaining}s');
replaceIfFound('<Column title="Final Check" count={finalCheck.length}>', '<Column title="QV2 Final Check" count={finalCheck.length}>');

replaceIfFound('PIC Track', 'Chain Pharmacy Shift');
replaceIfFound('Day {dayCount} / Manager Career', 'Day {dayCount} / Retail Chain Career');
replaceIfFound('Run the shift. Keep the job.', 'Clock in. Clear the queues. Keep the store alive.');
replaceIfFound(
  'Each shift pays eight hours, rewards clean final checks, and punishes severe verification failures with malpractice settlements.\n          Three clean shifts in a row earns an automatic raise.',
  'Work a CVS-style retail pharmacy shift without official branding: QT/QV1/QP/QV2 queues, phones, pickup, drive-thru, counsel calls, waiters, metrics, and final-check consequences.\n          Three clean shifts in a row earns an automatic raise.'
);
replaceIfFound('STORY MODE', 'SHIFT SIM');
replaceIfFound('CAREER MODE', 'RETAIL CHAIN CAREER');
replaceIfFound('PRESS START', 'CLOCK IN');
replaceIfFound('{shift.desc}', 'Run the whole retail pharmacy loop: QT/QV1/QP/QV2 queues, phones, pickup, drive-thru, waiters, counseling, metrics, and final-check pressure.');

insertAfter(
  [
    'function Stat({ label, value, color }) {',
    '  return (',
    '    <div style={{ textAlign: "center" }}>',
    '      <div className="display" style={{ fontSize: 22, fontWeight: 900, color: color || C.ink, lineHeight: 1 }}>{value}</div>',
    '      <div className="mono" style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: C.muted, marginTop: 3 }}>{label}</div>',
    '    </div>',
    '  );',
    '}',
    ''
  ].join('\n'),
  [
    'function HeaderStatLite({ label, value, color }) {',
    '  return (',
    '    <div style={{ padding: "8px 10px", borderRadius: 10, border: `1px solid ${C.line}`, background: C.paper, textAlign: "center" }}>',
    '      <div className="display" style={{ fontSize: 19, fontWeight: 900, color: color || C.ink, lineHeight: 1 }}>{value}</div>',
    '      <div className="mono" style={{ fontSize: 8.5, letterSpacing: 1, textTransform: "uppercase", color: C.muted, marginTop: 4 }}>{label}</div>',
    '    </div>',
    '  );',
    '}',
    ''
  ].join('\n'),
  'function HeaderStatLite({ label, value, color })',
  'HeaderStatLite'
);

if (changed) fs.writeFileSync(file, src);
console.log(changed ? 'Applied retail chain pharmacy shift patch.' : 'Retail chain patch already present.');
