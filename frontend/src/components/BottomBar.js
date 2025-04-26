import React from 'react';

export default function BottomBar({ onJump, onCallback, fighterCount, jumpCount }) {
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
      <button
        onClick={onJump}
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
        JUMP 🚀
      </button>

      <div>Fighters: {fighterCount}</div>
      <div>Jumps: {jumpCount}</div>

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
