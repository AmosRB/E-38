import React from 'react';

export default function Navbar({ landingCount, alienCount, onActivateCreate, onRequestClearAll }) {
  return (
    <div className="navbar">
      {/* כפתור TAKE OFF */}
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
        transition: '0.3s',
        width: '100%',
        marginBottom: '5px'
      }}>
        TAKE OFF
      </button>

      {/* ספירות עם כדור הארץ */}
      <div className="nav-status" style={{ display: 'flex', alignItems: 'center', fontSize: '16px', justifyContent: 'center', width: '100%', margin: '5px 0' }}>
        <span style={{ marginRight: '10px' }}>🛸 {landingCount}</span>
        <span className="earth" style={{
          display: 'inline-block',
          animation: 'spin 4s linear infinite',
          margin: '0 10px'
        }}>
          🌍
        </span>
        <span>👽 {alienCount}</span>
      </div>

      {/* כפתור LANDING */}
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
        transition: '0.3s',
        width: '100%'
      }}>
        ⚡ LANDING
      </button>

      {/* אנימציה לסיבוב כדור הארץ */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
