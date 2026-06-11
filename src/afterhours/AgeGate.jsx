import React from 'react';
import { acceptAgeGate } from './save.js';

const C = {
  paper: '#F2E9D6', card: '#FBF6EA', ink: '#22302A',
  pine: '#1F4A3F', amber: '#C0781E', muted: '#6E7C70',
  line: 'rgba(31,74,63,0.16)',
};

export default function AgeGate({ save, setSave }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: C.pine,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px 20px',
      fontFamily: "'Spline Sans', sans-serif",
    }}>
      <div style={{ maxWidth: 420, textAlign: 'center' }}>
        <div className="pixel" style={{
          fontSize: 24, color: C.amber, marginBottom: 18, lineHeight: 1.4,
          fontFamily: "'Press Start 2P', monospace",
        }}>
          RxReady
        </div>
        <div className="pixel" style={{
          fontSize: 9, color: C.paper, marginBottom: 28, letterSpacing: 2,
          fontFamily: "'Press Start 2P', monospace",
        }}>
          18+ CONTENT ADVISORY
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.08)', borderRadius: 16,
          padding: '22px 24px', marginBottom: 28, textAlign: 'left',
        }}>
          <p style={{ color: C.paper, fontSize: 15, lineHeight: 1.7, margin: '0 0 14px' }}>
            RxReady contains <strong style={{ color: C.amber }}>adult themes</strong>: mature humor,
            romantic content (non-explicit), strong language in optional Merc narrator mode,
            and realistic depictions of drug misuse and addiction as pharmacy context.
          </p>
          <p style={{ color: C.paper, fontSize: 15, lineHeight: 1.7, margin: 0 }}>
            All romantic content involves adults (25+). Nothing explicit.
            <br />
            <em style={{ color: C.muted, fontSize: 13 }}>Arcade training content is suitable for all ages.</em>
          </p>
        </div>

        <button
          onClick={() => acceptAgeGate(save, setSave)}
          style={{
            width: '100%', padding: '16px', borderRadius: 14, border: 'none',
            background: C.amber, color: C.paper,
            fontFamily: "'Press Start 2P', monospace", fontSize: 11,
            cursor: 'pointer', letterSpacing: 1, marginBottom: 14,
          }}>
          I AM 18+ · ENTER
        </button>

        <p style={{ color: C.muted, fontSize: 12, lineHeight: 1.5, margin: 0 }}>
          For training and study only — always follow your pharmacy's policies,
          current references, and professional judgment in practice.
        </p>
      </div>
    </div>
  );
}
