import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function ViewerPage() {
  const [deviceId, setDeviceId] = useState("");
  const [address, setAddress] = useState("");
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const socketRef = useRef(null);

  // Initialize map once
  useEffect(() => {
    mapRef.current = L.map("map").setView([20, 0], 2);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(mapRef.current);

    return () => {
      mapRef.current.remove();
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  async function fetchAddress(lat, lng) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        {
          headers: {
            "User-Agent": "LiveLocationDemo/1.0 (your-email@example.com)",
          },
        }
      );
      const data = await res.json();
      if (data && data.display_name) {
        setAddress(data.display_name);
        if (markerRef.current) {
          markerRef.current.bindPopup(data.display_name).openPopup();
        }
      } else {
        setAddress("Address not found");
      }
    } catch (err) {
      setAddress("Error fetching address");
    }
  }

  function watchDevice() {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    const socket = io("http://localhost:3001");
    socketRef.current = socket;

    socket.emit("watch", { deviceId });
    socket.on("location", ({ loc }) => {
      const { lat, lng } = loc;

      // place/update marker
      if (!markerRef.current) {
        markerRef.current = L.marker([lat, lng]).addTo(mapRef.current);
        mapRef.current.setView([lat, lng], 15);
      } else {
        markerRef.current.setLatLng([lat, lng]);
      }

      // fetch human-readable address
      fetchAddress(lat, lng);
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div
        style={{
          padding: "8px",
          background: "#f0f0f0",
          display: "flex",
          alignItems: "center",
        }}
      >
        <h2 style={{ marginRight: "16px" }}>Viewer Page</h2>
        <input
          placeholder="Device ID"
          value={deviceId}
          onChange={(e) => setDeviceId(e.target.value)}
          style={{ marginRight: "8px", padding: "4px 8px" }}
        />
        <button onClick={watchDevice}>Watch</button>
      </div>

      {/* Address display */}
      {address && (
        <div style={{ padding: "8px", background: "#fff", borderBottom: "1px solid #ccc" }}>
          <b>Address:</b> {address}
        </div>
      )}

      <div id="map" style={{ flex: 1 }}></div>
    </div>
  );
}
