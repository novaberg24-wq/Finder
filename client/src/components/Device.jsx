import { useState } from "react";

export default function DevicePage() {
  const [deviceId, setDeviceId] = useState("");
  const [token, setToken] = useState("");
  const [watchId, setWatchId] = useState(null);
  const [log, setLog] = useState([]);

  function addLog(msg) {
    setLog((l) => [...l, msg]);
  }

  async function register() {
    const res = await fetch("http://localhost:3001/api/register-device", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: "React Device" }),
    });
    const data = await res.json();
    setDeviceId(data.deviceId);
    setToken(data.token);
    addLog("Registered: " + data.deviceId);
  }

  async function sendLocation(lat, lng, accuracy) {
    await fetch("http://localhost:3001/api/location", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-device-id": deviceId,
        "x-device-token": token,
      },
      body: JSON.stringify({ lat, lng, accuracy, ts: Date.now() }),
    });
  }

  function startSharing() {
    if (!navigator.geolocation) return alert("Geolocation not supported");
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        addLog(`loc: ${latitude}, ${longitude} (acc ${accuracy})`);
        sendLocation(latitude, longitude, accuracy);
      },
      (err) => addLog("geo error: " + err.message),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
    );
    setWatchId(id);
  }

  function stopSharing() {
    if (watchId) navigator.geolocation.clearWatch(watchId);
    setWatchId(null);
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Device Page</h2>
      <button onClick={register}>Register</button>
      {deviceId && (
        <>
          <p><b>ID:</b> {deviceId}</p>
          <p><b>Token:</b> {token}</p>
          <button onClick={startSharing} disabled={!!watchId}>Start</button>
          <button onClick={stopSharing} disabled={!watchId}>Stop</button>
        </>
      )}
      <pre>{log.join("\n")}</pre>
    </div>
  );
}
