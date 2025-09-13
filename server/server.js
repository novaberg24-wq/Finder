// server/server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { nanoid } = require("nanoid");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(bodyParser.json());

const devices = {}; // memory store for demo

// Register device
app.post("/api/register-device", (req, res) => {
  const { label } = req.body || {};
  const deviceId = nanoid(10);
  const token = nanoid(24);
  devices[deviceId] = { token, label: label || "Unnamed", lastLoc: null };
  res.json({ deviceId, token });
});

// Receive location
app.post("/api/location", (req, res) => {
  const devId = req.header("x-device-id");
  const token = req.header("x-device-token");
  if (!devId || !token || !(devices[devId] && devices[devId].token === token)) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { lat, lng, accuracy, ts } = req.body;
  devices[devId].lastLoc = { lat, lng, accuracy, ts: ts || Date.now() };
  io.to(`device-${devId}`).emit("location", {
    deviceId: devId,
    loc: devices[devId].lastLoc,
    label: devices[devId].label,
  });
  res.json({ ok: true });
});

app.get("/api/devices", (req, res) => {
  res.json(devices);
});

io.on("connection", (socket) => {
  socket.on("watch", ({ deviceId }) => {
    if (!devices[deviceId]) return;
    socket.join(`device-${deviceId}`);
    if (devices[deviceId].lastLoc) {
      socket.emit("location", {
        deviceId,
        loc: devices[deviceId].lastLoc,
        label: devices[deviceId].label,
      });
    }
  });
});

server.listen(3001, () =>
  console.log("Backend running at http://localhost:3001")
);
