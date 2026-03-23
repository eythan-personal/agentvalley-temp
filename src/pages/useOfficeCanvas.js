import { useEffect, useRef } from 'react'
import { AGENTS } from './navExperimentData'
import char1 from '../assets/characters/character_1.webp'
import char2 from '../assets/characters/character_2.webp'
import char3 from '../assets/characters/character_3.webp'
import char4 from '../assets/characters/character_4.webp'
import char5 from '../assets/characters/character_5.webp'

const AGENT_CHARS = {
  Scout: char1,
  Forge: char2,
  Relay: char3,
  Cipher: char4,
  Beacon: char5,
}

export default function useOfficeCanvas(canvasRef, agentsRef, officeMode, officeTransition) {
  useEffect(() => {
    if (!officeMode || officeTransition !== 'active') return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const cw = window.innerWidth
    const ch = window.innerHeight - 60
    canvas.width = cw * dpr
    canvas.height = ch * dpr
    canvas.style.width = cw + 'px'
    canvas.style.height = ch + 'px'
    ctx.scale(dpr, dpr)
    ctx.imageSmoothingEnabled = false

    const GRID = 10
    const TW = Math.floor((cw * 0.9) / GRID)
    const TH = Math.floor(TW * 0.42)
    const ox = cw / 2
    const oy = ch - GRID * TH + TH * 2

    const toIso = (gx, gy) => ({
      x: (gx - gy) * (TW / 2) + ox,
      y: (gx + gy) * (TH / 2) + oy,
    })

    // Load character images
    const charImgs = {}
    const loadPromises = AGENTS.map(name => new Promise(resolve => {
      const img = new Image()
      img.src = AGENT_CHARS[name]
      img.onload = () => { charImgs[name] = img; resolve() }
    }))

    // Spawn positions spread across the board
    const spawnSpots = [
      { gx: 2, gy: 4 }, { gx: 5, gy: 2 }, { gx: 7, gy: 5 }, { gx: 4, gy: 7 }, { gx: 6, gy: 3 },
    ]

    if (!agentsRef.current) {
      const shuffled = [...AGENTS].sort(() => Math.random() - 0.5)
      agentsRef.current = shuffled.map((name, i) => ({
        name, gx: spawnSpots[i].gx, gy: spawnSpots[i].gy,
        tx: spawnSpots[i].gx, ty: spawnSpots[i].gy,
        timer: Math.random() * 200 + 100,
        spawned: false, spawnDelay: i * 25, spawnTick: 0, spawnScale: 0, spawnOffsetY: -60,
      }))
    }

    let animId

    Promise.all(loadPromises).then(() => {
      function update() {
        const agents = agentsRef.current
        if (!agents) return
        agents.forEach(a => {
          if (!a.spawned) {
            a.spawnTick++
            if (a.spawnTick > a.spawnDelay) {
              a.spawned = true
              a.spawnScale = 0
            }
            return
          }
          if (a.spawnScale < 1) a.spawnScale = Math.min(a.spawnScale + 0.06, 1)
          if (a.spawnOffsetY < 0) a.spawnOffsetY = Math.min(a.spawnOffsetY + 4, 0)
          a.timer--
          if (a.timer <= 0) {
            a.tx = 3 + Math.floor(Math.random() * (GRID - 5))
            a.ty = 3 + Math.floor(Math.random() * (GRID - 5))
            a.timer = Math.random() * 250 + 100
          }
          const speed = 0.02
          if (Math.abs(a.tx - a.gx) > 0.05) a.gx += Math.sign(a.tx - a.gx) * speed
          else a.gx = a.tx
          if (Math.abs(a.ty - a.gy) > 0.05) a.gy += Math.sign(a.ty - a.gy) * speed
          else a.gy = a.ty
        })
      }

      function draw() {
        ctx.clearRect(0, 0, cw, ch)
        for (let gy = 0; gy < GRID; gy++) {
          for (let gx = 0; gx < GRID; gx++) {
            const { x, y } = toIso(gx, gy)
            ctx.beginPath()
            ctx.moveTo(x, y); ctx.lineTo(x + TW / 2, y + TH / 2); ctx.lineTo(x, y + TH); ctx.lineTo(x - TW / 2, y + TH / 2)
            ctx.closePath()
            ctx.fillStyle = (gx + gy) % 2 === 0 ? '#F0EDE8' : '#E8E5E0'
            ctx.fill()
            ctx.strokeStyle = '#DDD8D2'
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
        const agents = [...(agentsRef.current || [])].sort((a, b) => (a.gx + a.gy) - (b.gx + b.gy))
        agents.forEach(a => {
          if (!a.spawned) return
          const { x, y } = toIso(a.gx, a.gy)
          const img = charImgs[a.name]
          if (!img) return
          const s = Math.min(a.spawnScale, 1)
          const oy2 = a.spawnOffsetY || 0
          const charH = TW * 0.45
          const charW = (img.width / img.height) * charH
          const dy = y + oy2
          ctx.globalAlpha = s
          // Blur effect during spawn via shadow trick
          if (s < 1) {
            ctx.filter = `blur(${Math.round((1 - s) * 6)}px)`
          }
          ctx.fillStyle = 'rgba(0,0,0,0.06)'
          ctx.beginPath()
          ctx.ellipse(x, dy + charH * 0.15, TW * 0.15 * s, TH * 0.15 * s, 0, 0, Math.PI * 2)
          ctx.fill()
          ctx.drawImage(img, x - charW / 2, dy - charH + charH * 0.15, charW, charH)
          ctx.filter = 'none'
          if (s >= 0.5) {
            const fontSize = Math.max(8, TW * 0.06)
            ctx.font = `600 ${fontSize}px sans-serif`
            ctx.textAlign = 'center'
            const textW = ctx.measureText(a.name).width
            const padX = 6, padY = 3
            const bgX = x - textW / 2 - padX
            const bgY = dy - charH - fontSize - padY - 2
            const bgW = textW + padX * 2
            const bgH = fontSize + padY * 2
            const r = 4
            // Rounded rect background
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-surface').trim() || '#fff'
            ctx.beginPath()
            ctx.moveTo(bgX + r, bgY)
            ctx.lineTo(bgX + bgW - r, bgY)
            ctx.quadraticCurveTo(bgX + bgW, bgY, bgX + bgW, bgY + r)
            ctx.lineTo(bgX + bgW, bgY + bgH - r)
            ctx.quadraticCurveTo(bgX + bgW, bgY + bgH, bgX + bgW - r, bgY + bgH)
            ctx.lineTo(bgX + r, bgY + bgH)
            ctx.quadraticCurveTo(bgX, bgY + bgH, bgX, bgY + bgH - r)
            ctx.lineTo(bgX, bgY + r)
            ctx.quadraticCurveTo(bgX, bgY, bgX + r, bgY)
            ctx.closePath()
            ctx.fill()
            // Border
            ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-border').trim() || '#E8E8E8'
            ctx.lineWidth = 1
            ctx.stroke()
            // Shadow (subtle)
            ctx.shadowColor = 'rgba(0,0,0,0.06)'
            ctx.shadowBlur = 4
            ctx.shadowOffsetY = 2
            ctx.fill()
            ctx.shadowColor = 'transparent'
            ctx.shadowBlur = 0
            ctx.shadowOffsetY = 0
            // Text
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-heading').trim() || '#171717'
            ctx.fillText(a.name, x, bgY + padY + fontSize - 1)
          }
          ctx.globalAlpha = 1
        })
      }

      function loop() { update(); draw(); animId = requestAnimationFrame(loop) }
      loop()
    })

    return () => { if (animId) cancelAnimationFrame(animId) }
  }, [officeMode, officeTransition])
}
