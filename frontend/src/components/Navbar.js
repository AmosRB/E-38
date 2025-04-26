import React from 'react';

export default function Navbar({ onActivateCreate, clearAll, landingCount, alienCount }) {
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
      <div style={{ fontWeight: 'bold', fontSize: '18px' }}>
        Invasion Monitor
      </div>

      <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
        <div>🛸 {landingCount} | 👽 {alienCount}</div>

        <button
          onClick={onActivateCreate}
          className="nav-button"
          style={{
            background: 'white',
            color: 'black',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Create Landing ⚡
        </button>

        <button
          onClick={async () => {
            if (window.confirm('Are you sure you want to delete ALL landings and aliens?')) {
              try {
                await fetch('https://e-38.onrender.com/api/invasion', { method: 'DELETE' });
                clearAll();
                console.log('🧹 Deleted locally and remotely.');
              } catch (err) {
                console.error('❌ Failed to delete invasion data:', err.message);
              }
            }
          }}
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
      </div>

      {/* רספונסיביות ישירות בדף */}
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
