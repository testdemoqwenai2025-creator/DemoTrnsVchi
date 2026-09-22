// F8 — Web Worker for offloading real-time telemetry simulation
// from the main browser thread.
//
// Per the user's architectural requirement: "Telemetry updates operating
// at high frequencies (exceeding 30Hz) must be offloaded from the main
// browser rendering thread onto dedicated background Web Workers."
//
// This worker owns the simulation state and ticks at the configured
// frequency. The main thread receives frames via postMessage and only
// does DOM updates — no simulation logic on the main thread.
//
// Usage from main thread:
//   const worker = new Worker('assets/telemetry-worker.js')
//   worker.postMessage({ cmd: 'start', fps: 30 })
//   worker.onmessage = (e) => { /* e.data is a frame */ }

let objects = []
let peers = []
let watchdogs = []
let intervalId = null
let frameNum = 0

function initState() {
  objects = [
    { id: 'obj_01', class: 'vehicle', pos: [-20, 0], vel: [5, 0], conf: 0.85 },
    { id: 'obj_02', class: 'pedestrian', pos: [-10, -3], vel: [1, -1], conf: 0.62 },
    { id: 'obj_03', class: 'cyclist', pos: [5, 4], vel: [-2, 1], conf: 0.78 },
    { id: 'obj_04', class: 'debris', pos: [15, -2], vel: [0.5, 0], conf: 0.45 },
    { id: 'obj_05', class: 'vehicle', pos: [20, 2], vel: [-3, 0], conf: 0.91 },
    { id: 'obj_06', class: 'pedestrian', pos: [-5, 3], vel: [0.8, -0.5], conf: 0.55 },
    { id: 'obj_07', class: 'cyclist', pos: [10, -4], vel: [-1, 2], conf: 0.68 },
    { id: 'obj_08', class: 'vehicle', pos: [-15, 5], vel: [3, -1], conf: 0.74 },
  ]
  peers = Array.from({ length: 6 }, (_, i) => {
    const angle = (i / 6) * Math.PI * 2
    return {
      id: 'peer_' + String(i + 1).padStart(2, '0'),
      x: Math.cos(angle) * 20,
      y: Math.sin(angle) * 14,
      vx: Math.cos(angle + 0.5) * 5,
      vy: Math.sin(angle + 0.5) * 5,
      rssi: -50 - i * 5,
    }
  })
  watchdogs = [
    { name: 'perception_heartbeat', periodMs: 100, lastKickAgoMs: 30 },
    { name: 'planner_heartbeat', periodMs: 50, lastKickAgoMs: 12 },
    { name: 'control_loop', periodMs: 20, lastKickAgoMs: 5 },
    { name: 'comms_heartbeat', periodMs: 1000, lastKickAgoMs: 600, expires: true },
    { name: 'safety_supervisor', periodMs: 200, lastKickAgoMs: 80 },
  ]
}

function tick() {
  frameNum++
  const TICK = 0.2 // seconds

  // Drift objects
  for (const o of objects) {
    o.pos[0] += o.vel[0] * TICK
    o.pos[1] += o.vel[1] * TICK
    o.conf = Math.min(0.99, Math.max(0.4, o.conf + (Math.random() - 0.5) * 0.04))
    if (o.pos[0] > 25) o.pos[0] = -25
    if (o.pos[0] < -25) o.pos[0] = 25
    if (Math.abs(o.pos[1]) > 8) o.pos[1] = -o.pos[1]
  }

  // Drift peers
  for (const p of peers) {
    p.x += p.vx * TICK
    p.y += p.vy * TICK
    p.rssi = -45 - Math.abs(Math.round(Math.sin(frameNum / 15 + p.id.charCodeAt(5)) * 20))
    if (Math.abs(p.x) > 40) { p.vx = -p.vx; p.x = Math.sign(p.x) * 40 }
    if (Math.abs(p.y) > 25) { p.vy = -p.vy; p.y = Math.sign(p.y) * 25 }
  }

  // Advance watchdogs
  for (const w of watchdogs) {
    w.lastKickAgoMs += 200
    if (!w.expires && w.lastKickAgoMs > w.periodMs * 0.8) {
      w.lastKickAgoMs = Math.random() * w.periodMs * 0.3
    }
    if (w.expires && w.lastKickAgoMs > w.periodMs * 2 && Math.random() < 0.3) {
      w.lastKickAgoMs = Math.random() * w.periodMs * 0.5
    }
  }

  // Post frame back to main thread
  self.postMessage({
    type: 'frame',
    frameNum,
    ts: Date.now(),
    perception: { objects: objects.map(o => ({ ...o, pos: [...o.pos], vel: [...o.vel] })) },
    v2x: { peers: peers.map(p => ({ ...p })) },
    safety: {
      watchdogs: watchdogs.map(w => ({
        name: w.name,
        periodMs: w.periodMs,
        lastKickAgoMs: w.lastKickAgoMs,
        status: w.lastKickAgoMs > w.periodMs ? 'expired' : 'healthy',
      })),
    },
  })
}

self.onmessage = (e) => {
  const { cmd, fps } = e.data || {}
  if (cmd === 'start') {
    if (intervalId) clearInterval(intervalId)
    initState()
    frameNum = 0
    const intervalMs = fps ? Math.round(1000 / fps) : 200
    intervalId = setInterval(tick, intervalMs)
    self.postMessage({ type: 'started', fps: fps || 5, intervalMs })
  } else if (cmd === 'stop') {
    if (intervalId) { clearInterval(intervalId); intervalId = null }
    self.postMessage({ type: 'stopped' })
  } else if (cmd === 'setFps') {
    if (intervalId) {
      clearInterval(intervalId)
      const intervalMs = fps ? Math.round(1000 / fps) : 200
      intervalId = setInterval(tick, intervalMs)
      self.postMessage({ type: 'fpsChanged', fps: fps || 5, intervalMs })
    }
  }
}
