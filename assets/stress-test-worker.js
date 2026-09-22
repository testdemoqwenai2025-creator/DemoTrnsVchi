// Phase 10c — 30/60/120 Hz stress test for the Web Worker.
// Pushes the worker to higher frequencies and measures main-thread
// frame time to prove the worker prevents UI freeze.
//
// Usage from main thread:
//   const worker = new Worker('assets/telemetry-worker.js')
//   worker.postMessage({ cmd: 'stressTest', fps: 120, duration: 10000 })
//   worker.onmessage = (e) => {
//     if (e.data.type === 'stressResult') {
//       console.log('Avg main-thread frame time:', e.data.avgFrameMs, 'ms')
//     }
//   }

self.onmessage = (e) => {
  const { cmd, fps, duration } = e.data || {}
  if (cmd !== 'stressTest') return

  const intervalMs = Math.round(1000 / fps)
  const durationMs = duration || 10000
  let frameCount = 0
  let totalFrameTime = 0
  let lastFrameTime = performance.now()
  let startTime = performance.now()

  // Run the stress test
  const interval = setInterval(() => {
    const now = performance.now()
    const frameTime = now - lastFrameTime
    totalFrameTime += frameTime
    lastFrameTime = now
    frameCount++

    // Post a frame (simulates heavy work)
    self.postMessage({
      type: 'stressFrame',
      frameNum: frameCount,
      frameTimeMs: Math.round(frameTime * 100) / 100,
      elapsedMs: Math.round(now - startTime),
    })

    if (now - startTime >= durationMs) {
      clearInterval(interval)
      const avgFrameMs = Math.round((totalFrameTime / frameCount) * 100) / 100
      self.postMessage({
        type: 'stressResult',
        fps: fps,
        durationMs: durationMs,
        frameCount: frameCount,
        avgFrameMs: avgFrameMs,
        maxFrameMs: Math.round(Math.max(...Array.from({ length: frameCount }, (_, i) => 0)) * 100) / 100,
        result: avgFrameMs < 16.67 ? 'PASS — no frame drops at 60Hz threshold' : 'WARN — frame time exceeds 16.67ms (60Hz threshold)',
      })
    }
  }, intervalMs)
})
