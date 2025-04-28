import React from 'react';

export default function Navbar({ landingCount, alienCount, onActivateCreate, onRequestClearAll }) {
  return (
    <div className="navbar" style={{
      height: '50px',
      backgroundColor: 'black',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 10px',
      fontFamily: 'sans-serif',
      fontSize: '16px',
      zIndex: 1000
    }}>
      
      {/* כפתור CREATE LANDING בצד שמאל */}
      <button
        onClick={onActivateCreate}
        style={{
          background: '#2c2c2c',
          color: '#b266ff',
          border: '1px solid #b266ff',
          padding: '6px 12px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
          letterSpacing: '1px',
          boxShadow: '0 0 8px #b266ff',
          transition: '0.3s'
        }}
      >
        Landing ⚡
      </button>

      {/* קאונטר ממורכז */}
      <div style={{ flex: 1, textAlign: 'center' }}>
        🚙 {landingCount} | 🧍 {alienCount}
      </div>

      {/* כפתור DELETE ALL בצד ימין */}
      <button
        onClick={onRequestClearAll}
        className="nav-button"
        style={{
          background: 'red',
          color: 'white',
          border: 'none',
          padding: '6px 12px',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '14px'
        }}
      >
        Delete All 🗑️
      </button>

      {/* רספונסיביות */}
      <style>
        {`
          @media (max-width: 600px) {
            .navbar {
              font-size: 14px;
              padding: 0 5px;
              height: 45px;
            }
            .nav-button {
              font-size: 12px;
              padding: 4px 8px;
            }
          }
        `}
      </style>

    </div>
  );
}
