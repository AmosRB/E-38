// ✅ Navbar.js תקין - עיצוב מלא, כפתורים נכונים, כדור הארץ מסתובב

import React from 'react';

export default function Navbar({ landingCount, alienCount, onActivateCreate, onRequestClearAll }) {
  return (
    <div className="navbar" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5em 1em', background: 'black', color: 'white', alignItems: 'center' }}>

      {/* צד שמאל - DELETE ALL */}
      <div>
        <button onClick={onRequestClearAll} style={{
          background: '#2c2c2c',
          color: '#ff0033',
          border: '1px solid #ff0033',
          padding: '6px 12px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: 'bold',
          letterSpacing: '1px',
          boxShadow: '0 0 8px #ff0033',
          transition: '0.3s'
        }}>
          ❌ DEL. ALL
        </button>
      </div>

      {/* טקסט מרכזי - ספירות עם כדור הארץ מסתובב */}
      <div style={{ display: 'flex', alignItems: 'center', fontSize: '20px' }}>
        <span style={{ marginRight: '10px' }}>🛸 {landingCount}</span>
        <span style={{
          display: 'inline-block',
          animation: 'spin 4s linear infinite',
          margin: '0 10px'
        }}>
          🌍
        </span>
        <span>👽 {alienCount}</span>
      </div>

      {/* צד ימין - CREATE LANDING */}
      <div>
        <button onClick={onActivateCreate} style={{
          background: '#2c2c2c',
          color: '#cc66ff',
          border: '1px solid #cc66ff',
          padding: '6px 12px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: 'bold',
          letterSpacing: '1px',
          boxShadow: '0 0 8px #cc66ff',
          transition: '0.3s'
        }}>
          ⚡ LANDING
        </button>
      </div>

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
