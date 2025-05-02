export async function fetchSnapshot() {
    const res = await fetch('/api/snapshot');
    return res.json();
  }

  