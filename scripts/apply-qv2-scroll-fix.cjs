const fs = require('fs');

const file = 'src/RxReady.jsx';
let src = fs.readFileSync(file, 'utf8');
let changed = false;

function replaceOnce(search, replacement, label) {
  if (src.includes(replacement)) return;
  if (!src.includes(search)) throw new Error(`Missing patch target: ${label}`);
  src = src.replace(search, replacement);
  changed = true;
}

replaceOnce(
  '      <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(7,21,35,0.94)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "12px", overflowY: "auto" }}>\n        <div style={{ width: "min(500px,100%)", background: "#F2F5F7", borderRadius: 12, overflow: "hidden", boxShadow: "0 24px 60px rgba(0,0,0,0.7)" }}>',
  '      <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(7,21,35,0.94)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "12px 12px max(12px, env(safe-area-inset-bottom))", overflowY: "auto", overscrollBehavior: "contain", WebkitOverflowScrolling: "touch" }}>\n        <div style={{ width: "min(500px,100%)", maxHeight: "calc(100dvh - 24px)", background: "#F2F5F7", borderRadius: 12, overflowY: "auto", WebkitOverflowScrolling: "touch", boxShadow: "0 24px 60px rgba(0,0,0,0.7)" }}>',
  'modal touch scrolling'
);

replaceOnce(
  '        <div style={{ padding: "10px 12px 16px", display: "grid", gap: 8 }}>\n          <button onClick={() => { finalAction(rx, "approve"); onClose(); }}',
  '        <div style={{ position: "sticky", bottom: 0, padding: "10px 12px max(16px, env(safe-area-inset-bottom))", display: "grid", gap: 8, background: "#F2F5F7", borderTop: "1px solid #D0D8E0", boxShadow: "0 -10px 24px rgba(7,21,35,0.08)" }}>\n          <button onClick={() => { finalAction(rx, "approve"); onClose(); }}',
  'sticky QV2 action controls'
);

if (changed) fs.writeFileSync(file, src);
console.log(changed ? 'Applied QV2 scroll fix.' : 'QV2 scroll fix already present.');
