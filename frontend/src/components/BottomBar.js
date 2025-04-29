// ✅ BottomBar.js מתוקן - חלון צף בתחתית עם עיצוב מקורי

import React from 'react';

export default function BottomBar({ onJump, onCallback, fighters, takilas }) {
  return (

    <div className="bottombar" style={{ width: '100%' }}>

      {/* RECALL כפתור */}
      <button onClick={onCallback} style={{
        background: '#2c2c2c',
        color: '#00ccff',
        border: '1px solid #00ccff',
        padding: '6px 12px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'bold',
        letterSpacing: '1px',
        boxShadow: '0 0 8px #00ccff',
        transition: '0.3s'
      }}>
        RECALL
      </button>

      {/* קאונטר טקסט עם כדור הארץ מסתובב */}
      <div style={{ display: 'flex', alignItems: 'center', fontSize: '16px' }}>
        <span style={{ marginRight: '10px' }}>🧍 {fighters.length}</span>
        <span style={{
          display: 'inline-block',
          animation: 'spin 4s linear infinite',
          margin: '0 10px'
        }}>
          🌍
        </span>
        <span>🚙 {takilas.length}</span>
      </div>

      {/* JUMP כפתור */}
      <button onClick={onJump} style={{
        background: '#2c2c2c',
        color: '#00ff00',
        border: '1px solid #00ff00',
        padding: '6px 12px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'bold',
        letterSpacing: '1px',
        boxShadow: '0 0 8px #00ff00',
        transition: '0.3s'
      }}>
        JUMP ⚡
      </button>

      {/* אנימציה לסיבוב כדור הארץ */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>

    </div>
  );
}
