// ✅ Navbar.js מתוקן - כפתור DELETE ALL בשמאל, מחובר, ו-Create בימין

import React from 'react';
import './Navbar.css';

export default function Navbar({ landingCount, alienCount, onActivateCreate, onRequestClearAll }) {
  return (
    <div className="navbar" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5em 1em', background: 'black', color: 'white', alignItems: 'center' }}>

      {/* צד שמאל - DELETE ALL */}
      <div>
        <button onClick={onRequestClearAll} style={{ background: 'red', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' }}>
          ❌ DELETE ALL
        </button>
      </div>

      {/* טקסט מרכזי */}
      <div>
        <span style={{ marginRight: '10px' }}>🛸 {landingCount} Landings</span>
        <span>👽 {alienCount} Aliens</span>
      </div>

      {/* צד ימין - Create Landing */}
      <div>
        <button onClick={onActivateCreate} style={{ background: 'limegreen', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' }}>
          ⚡ CREATE LANDING
        </button>
      </div>

    </div>
  );
}
