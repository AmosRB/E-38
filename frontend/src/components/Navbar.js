import React from 'react';

export default function Navbar({ onActivateCreate, clearAll, landingCount, alienCount }) {
  return (
    <div style={{
      height: "50px",
      backgroundColor: "black",
      color: "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 20px",
      fontFamily: "sans-serif"
    }}>
      <div style={{ fontWeight: "bold", fontSize: "18px" }}>
        E-38 Invasion Monitor
      </div>
      <div>
        🛸 {landingCount}  | 👽 {alienCount} 
      </div>
      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={onActivateCreate}
          style={{
            background: "white",
            color: "black",
            border: "none",
            padding: "8px 12px",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          Create Landing ⚡
        </button>

        <button
          onClick={async () => {
            if (window.confirm("Are you sure you want to delete ALL landings and aliens?")) {
              try {
                await fetch("https://e-38.onrender.com/api/invasion", { method: 'DELETE' });
                clearAll();
                console.log("🧹 Deleted locally and remotely.");
              } catch (err) {
                console.error("❌ Failed to delete invasion data:", err.message);
              }
            }
          }}
          style={{
            background: "red",
            color: "white",
            border: "none",
            padding: "8px 12px",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          Delete All 🗑️
        </button>
      </div>
    </div>
  );
} // ✅ counts now from props only