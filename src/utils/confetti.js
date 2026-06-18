export function fireConfetti(duration = 3000) {
  const canvas = document.createElement('canvas')
  canvas.style.position = 'fixed'
  canvas.style.top = '0'
  canvas.style.left = '0'
  canvas.style.width = '100vw'
  canvas.style.height = '100vh'
  canvas.style.pointerEvents = 'none'
  canvas.style.zIndex = '9999'
  document.body.appendChild(canvas)

  const ctx = canvas.getContext('2d')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  const pieces = []
  const colors = ['#ffffff', '#e5e5e5', '#a3a3a3', '#fbbf24', '#34d399', '#60a5fa', '#f472b6', '#a78bfa']
  const pieceCount = 120

  for (let i = 0; i < pieceCount; i++) {
    pieces.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      w: Math.random() * 8 + 4,
      h: Math.random() * 6 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      vy: Math.random() * 3 + 2,
      vx: (Math.random() - 0.5) * 2,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 10,
      opacity: 1,
    })
  }

  const start = performance.now()

  function animate(now) {
    const elapsed = now - start
    if (elapsed > duration) {
      canvas.remove()
      return
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const fadeStart = duration * 0.7
    const globalAlpha = elapsed > fadeStart ? 1 - (elapsed - fadeStart) / (duration - fadeStart) : 1

    for (const p of pieces) {
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.05
      p.rotation += p.rotSpeed

      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate((p.rotation * Math.PI) / 180)
      ctx.globalAlpha = globalAlpha * p.opacity
      ctx.fillStyle = p.color
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
      ctx.restore()
    }

    requestAnimationFrame(animate)
  }

  requestAnimationFrame(animate)
}
