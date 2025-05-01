import React from 'react';

export default function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)', // ✅ רקע שחור כהה
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2000
    }}>
      <div style={{
        backgroundColor: '#000', // ✅ חלון שחור
        color: '#fff',
        padding: '20px',
        borderRadius: '10px',
        textAlign: 'center',
        width: '320px'
      }}>
        <p style={{ fontSize: '18px', marginBottom: '20px' }}>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          <button
            onClick={onConfirm}
            style={{
              backgroundColor: '#8B0000', // ✅ אדום כהה
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            RECALL
          </button>
          <button
            onClick={onCancel}
            style={{
              backgroundColor: '#1E90FF', // ✅ כחול (דודג'בלו)
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            STAY ALIVE
          </button>
        </div>
      </div>
    </div>
  );
}
