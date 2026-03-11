import { useEffect, useRef } from 'react'

import char1 from '../assets/characters/character_1.png'
import char2 from '../assets/characters/character_2.png'
import char3 from '../assets/characters/character_3.png'
import char4 from '../assets/characters/character_4.png'
import char5 from '../assets/characters/character_5.png'

const CHARACTERS = [
  { src: char5, name: 'Alpha' },
  { src: char3, name: 'Beta' },
  { src: char2, name: 'Gamma' },
  { src: char1, name: 'Delta' },
  { src: char4, name: 'Echo' },
]

const GREETINGS = ['gm!', 'hey!', 'sup?', 'wagmi', 'lfg!', ':)', 'yo!', 'hi!', 'based', 'nice']
const WAVE_MESSAGES = ['👋', 'hello!', 'hey there!', 'gm!', '✌️']

const STATES = { IDLE: 'idle', WALKING: 'walking', WAVING: 'waving', GREETING: 'greeting' }

const CHAR_WIDTH = 56
const STAGE_PADDING = 40

function randomBetween(min, max) {
  return Math.random() * (max - min) + min
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function createCharacterState(index, stageWidth) {
  const spacing = (stageWidth - STAGE_PADDING * 2) / CHARACTERS.length
  return {
    x: STAGE_PADDING + spacing * index + spacing / 2,
    targetX: null,
    facing: Math.random() > 0.5 ? 1 : -1,
    state: STATES.IDLE,
    stateTimer: randomBetween(1500, 4000),
    bobPhase: Math.random() * Math.PI * 2,
    bubble: null,
    bubbleTimer: 0,
    greetPartner: null,
    walkSpeed: randomBetween(0.4, 0.8),
    stepPhase: 0,
  }
}

export default function Characters() {
  const stageRef = useRef(null)
  // One ref per character wrapper div, one per bubble div, one per sprite div, one per shadow div
  const wrapperRefs = useRef([])
  const bubbleRefs = useRef([])
  const spriteRefs = useRef([])
  const shadowRefs = useRef([])
  const charsRef = useRef([])
  const animRef = useRef(null)
  const stageWidthRef = useRef(800)

  useEffect(() => {
    const stageEl = stageRef.current
    if (!stageEl) return

    stageWidthRef.current = stageEl.offsetWidth
    charsRef.current = CHARACTERS.map((_, i) =>
      createCharacterState(i, stageWidthRef.current)
    )

    const handleResize = () => {
      const oldWidth = stageWidthRef.current
      const newWidth = stageEl.offsetWidth
      if (oldWidth === newWidth) return
      const scale = newWidth / oldWidth
      stageWidthRef.current = newWidth
      charsRef.current.forEach(c => {
        c.x *= scale
        if (c.targetX != null) c.targetX *= scale
        c.x = Math.max(STAGE_PADDING, Math.min(newWidth - STAGE_PADDING, c.x))
      })
    }

    window.addEventListener('resize', handleResize)

    // --- Simulation + DOM update loop ---
    let lastTime = performance.now()

    function tick(now) {
      const dt = Math.min(now - lastTime, 50)
      lastTime = now

      const chars = charsRef.current
      const stageW = stageWidthRef.current

      if (chars.length === 0) {
        animRef.current = requestAnimationFrame(tick)
        return
      }

      // Update simulation
      chars.forEach((c, i) => {
        c.bobPhase += dt * 0.003
        c.stepPhase += dt * 0.015

        // Bubble timer
        if (c.bubble) {
          c.bubbleTimer -= dt
          if (c.bubbleTimer <= 0) {
            c.bubble = null
          }
        }

        c.stateTimer -= dt

        switch (c.state) {
          case STATES.IDLE: {
            if (c.stateTimer <= 0) {
              const roll = Math.random()
              if (roll < 0.55) {
                c.state = STATES.WALKING
                c.targetX = randomBetween(STAGE_PADDING + 20, stageW - STAGE_PADDING - 20)
                c.facing = c.targetX > c.x ? 1 : -1
                c.stateTimer = 15000
              } else if (roll < 0.78) {
                c.state = STATES.WAVING
                c.stateTimer = randomBetween(1800, 3000)
                c.bubble = pickRandom(WAVE_MESSAGES)
                c.bubbleTimer = c.stateTimer - 200
              } else {
                let nearest = null
                let nearestDist = Infinity
                chars.forEach((other, j) => {
                  if (j === i || other.state === STATES.GREETING) return
                  const dist = Math.abs(other.x - c.x)
                  if (dist < nearestDist) {
                    nearestDist = dist
                    nearest = j
                  }
                })
                if (nearest !== null && nearestDist < 200) {
                  const other = chars[nearest]
                  c.state = STATES.WALKING
                  c.greetPartner = nearest
                  const offsetDir = c.x < other.x ? -1 : 1
                  c.targetX = other.x + offsetDir * (CHAR_WIDTH + 8)
                  c.facing = c.x < other.x ? 1 : -1
                  c.stateTimer = 10000
                } else {
                  c.stateTimer = randomBetween(1500, 3500)
                }
              }
            }
            break
          }

          case STATES.WALKING: {
            if (c.targetX == null) {
              c.state = STATES.IDLE
              c.stateTimer = randomBetween(2000, 4000)
              break
            }

            const dist = c.targetX - c.x
            const absDist = Math.abs(dist)

            if (absDist < 3) {
              c.x = c.targetX
              c.targetX = null

              if (c.greetPartner != null) {
                const partner = chars[c.greetPartner]
                if (partner && partner.state !== STATES.GREETING) {
                  c.state = STATES.GREETING
                  c.stateTimer = randomBetween(2000, 3200)
                  c.facing = c.x < partner.x ? 1 : -1
                  c.bubble = pickRandom(GREETINGS)
                  c.bubbleTimer = c.stateTimer - 400

                  partner.state = STATES.GREETING
                  partner.stateTimer = c.stateTimer
                  partner.facing = partner.x < c.x ? 1 : -1
                  const partnerTimer = c.stateTimer
                  setTimeout(() => {
                    if (partner.state === STATES.GREETING) {
                      partner.bubble = pickRandom(GREETINGS)
                      partner.bubbleTimer = partnerTimer - 800
                    }
                  }, 500)
                } else {
                  c.state = STATES.IDLE
                  c.stateTimer = randomBetween(1500, 3000)
                }
                c.greetPartner = null
              } else {
                c.state = STATES.IDLE
                c.stateTimer = randomBetween(2000, 5000)
              }
            } else {
              const dir = dist > 0 ? 1 : -1
              c.facing = dir
              const speed = c.walkSpeed * (dt / 16)
              c.x += dir * Math.min(speed, absDist)
              c.x = Math.max(STAGE_PADDING, Math.min(stageW - STAGE_PADDING, c.x))
            }

            if (c.stateTimer <= 0) {
              c.state = STATES.IDLE
              c.targetX = null
              c.greetPartner = null
              c.stateTimer = randomBetween(1500, 3000)
            }
            break
          }

          case STATES.WAVING: {
            if (c.stateTimer <= 0) {
              c.state = STATES.IDLE
              c.stateTimer = randomBetween(3000, 6000)
            }
            break
          }

          case STATES.GREETING: {
            if (c.stateTimer <= 0) {
              c.state = STATES.IDLE
              c.stateTimer = randomBetween(3000, 6000)
            }
            break
          }
        }
      })

      // --- Direct DOM updates (no React re-render) ---
      chars.forEach((c, i) => {
        const wrapper = wrapperRefs.current[i]
        const bubbleEl = bubbleRefs.current[i]
        const spriteEl = spriteRefs.current[i]
        const shadowEl = shadowRefs.current[i]
        if (!wrapper) return

        // Position
        wrapper.style.left = `${c.x}px`

        // Bob calculations
        const idleBob = Math.sin(c.bobPhase) * 3
        const walkBob = c.state === STATES.WALKING ? Math.abs(Math.sin(c.stepPhase)) * 5 : 0
        const waveBounce = c.state === STATES.WAVING ? Math.sin(c.bobPhase * 3) * 4 : 0
        const greetBounce = c.state === STATES.GREETING ? Math.sin(c.bobPhase * 4) * 3 : 0
        const bobY = idleBob + walkBob + waveBounce + greetBounce

        const tilt = c.state === STATES.WALKING ? Math.sin(c.stepPhase) * 3 * c.facing : 0
        const waveRock = c.state === STATES.WAVING ? Math.sin(c.bobPhase * 5) * 6 : 0
        const greetRock = c.state === STATES.GREETING ? Math.sin(c.bobPhase * 4) * 4 : 0

        // Sprite transform
        if (spriteEl) {
          spriteEl.style.transform = `translateY(${-bobY}px) scaleX(${c.facing}) rotate(${tilt + waveRock + greetRock}deg)`
        }

        // Shadow
        if (shadowEl) {
          shadowEl.style.transform = `scaleX(${1 - Math.abs(bobY) * 0.015})`
          shadowEl.style.opacity = `${0.4 + Math.abs(bobY) * 0.02}`
        }

        // Bubble
        if (bubbleEl) {
          if (c.bubble) {
            if (bubbleEl.style.display === 'none' || bubbleEl.dataset.text !== c.bubble) {
              bubbleEl.dataset.text = c.bubble
              bubbleEl.querySelector('.bubble-text').textContent = c.bubble
              bubbleEl.style.display = ''
              // Re-trigger animation
              bubbleEl.classList.remove('animate-bubble-in')
              void bubbleEl.offsetWidth // force reflow
              bubbleEl.classList.add('animate-bubble-in')
            }
          } else {
            bubbleEl.style.display = 'none'
            bubbleEl.dataset.text = ''
          }
        }
      })

      animRef.current = requestAnimationFrame(tick)
    }

    animRef.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [])

  return (
    <section className="-mt-[7rem] md:-mt-20 pb-4 md:pb-6 px-6 relative z-10 pointer-events-none">
      <div className="max-w-[var(--container)] mx-auto">
        <div
          ref={stageRef}
          className="relative h-24 md:h-40 lg:h-44"
          style={{ minHeight: 96 }}
        >
          {CHARACTERS.map((char, i) => (
            <div
              key={i}
              ref={el => (wrapperRefs.current[i] = el)}
              className="absolute bottom-0 flex flex-col items-center"
              style={{
                transform: 'translateX(-50%)',
                willChange: 'left',
              }}
            >
              {/* Speech bubble */}
              <div
                ref={el => (bubbleRefs.current[i] = el)}
                className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap
                           px-2.5 py-1 rounded-lg text-[11px] font-semibold
                           bg-white text-[var(--color-heading)] shadow-sm border border-[var(--color-border)]"
                style={{ display: 'none', fontFamily: 'var(--font-body)' }}
                data-text=""
              >
                <span className="bubble-text"></span>
                <div
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2
                             bg-white border-r border-b border-[var(--color-border)]
                             rotate-45"
                />
              </div>

              {/* Character sprite */}
              <div
                ref={el => (spriteRefs.current[i] = el)}
                style={{ imageRendering: 'pixelated' }}
              >
                <img
                  src={char.src}
                  alt={char.name}
                  className="h-16 md:h-28 lg:h-32 w-auto select-none pointer-events-none"
                  draggable={false}
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>

              {/* Shadow */}
              <div
                ref={el => (shadowRefs.current[i] = el)}
                className="mt-0.5 rounded-full bg-black/8"
                style={{ width: 36, height: 6 }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
