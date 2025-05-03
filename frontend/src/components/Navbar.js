import React from 'react';

export default function Navbar({ landingCount, alienCount, onActivateCreate, onRequestClearAll }) {
  return (
    <div className="navbar" style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px',
      position: 'fixed',
      top: '0',
      width: '100%',
      background: '#1e1e1e',
      zIndex: 1000
    }}>
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
        marginRight: '10px'
      }}>
        TAKE OFF
      </button>

      <div className="nav-status" style={{
        display: 'flex',
        alignItems: 'center',
        fontSize: '16px',
        justifyContent: 'center'
      }}>
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
        marginLeft: '10px'
      }}>
        ⚡ LANDING
      </button>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
