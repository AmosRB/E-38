import React from 'react';

export default function BottomBar({ onJump, onCallback, fighters, takilas }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '50px',
      backgroundColor: 'black',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      fontFamily: 'sans-serif',
      fontSize: '16px',
      zIndex: 1000,
      padding: '0 10px'
    }}>
      
      {/* כפתור JUMP מוקטן */}
      <button
        onClick={onJump}
        style={{
          background: '#2c2c2c',
          color: '#00ff00',
          border: '1px solid #00ff00',
          padding: '6px 12px', // ✅ הקטנתי
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px', // ✅ גם הקטנתי
          fontWeight: 'bold',
          letterSpacing: '1px',
          boxShadow: '0 0 8px #00ff00',
          transition: '0.3s'
        }}
      >
        JUMP ⚡
      </button>

      {/* קאונטר עם האייקונים הנכונים */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        🚙 {takilas.length} | 🧍 {fighters.length}
      </div>

      {/* כפתור CALLBACK רגיל */}
      <button
        onClick={onCallback}
        style={{
          background: 'blue',
          color: 'white',
          border: 'none',
          padding: '6px 12px',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '14px'
        }}
      >
        CALLBACK 🔙
      </button>
    </div>
  );
}
