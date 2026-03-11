import { useEffect, useRef, useState, useCallback } from 'react'

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

// States: idle, walking, waving (at viewer), greeting (another character)
const STATES = { IDLE: 'idle', WALKING: 'walking', WAVING: 'waving', GREETING: 'greeting' }

const CHAR_WIDTH = 56 // approximate px width of a character at rendered size
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
    facing: Math.random() > 0.5 ? 1 : -1, // 1 = right, -1 = left
    state: STATES.IDLE,
    stateTimer: randomBetween(1500, 4000),
    bobPhase: Math.random() * Math.PI * 2,
    bubble: null,
    bubbleTimer: 0,
    greetPartner: null,
    walkSpeed: randomBetween(0.4, 0.8), // px per frame (~60fps)
    stepPhase: 0,
  }
}

export default function Characters() {
  const stageRef = useRef(null)
  const charsRef = useRef([])
  const animRef = useRef(null)
  const [renderTick, setRenderTick] = useState(0)
  const stageWidthRef = useRef(800)

  // Initialize character states
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
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Main simulation loop
  useEffect(() => {
    let lastTime = performance.now()

    function tick(now) {
      const dt = Math.min(now - lastTime, 50) // cap delta to avoid jumps
      lastTime = now

      const chars = charsRef.current
      const stageW = stageWidthRef.current
      if (chars.length === 0) {
        animRef.current = requestAnimationFrame(tick)
        return
      }

      chars.forEach((c, i) => {
        // Update bob phase (continuous gentle float)
        c.bobPhase += dt * 0.003
        c.stepPhase += dt * 0.015

        // Bubble timer
        if (c.bubble) {
          c.bubbleTimer -= dt
          if (c.bubbleTimer <= 0) {
            c.bubble = null
          }
        }

        // State timer
        c.stateTimer -= dt

        switch (c.state) {
          case STATES.IDLE: {
            if (c.stateTimer <= 0) {
              // Decide next action
              const roll = Math.random()
              if (roll < 0.55) {
                // Walk somewhere
                c.state = STATES.WALKING
                c.targetX = randomBetween(STAGE_PADDING + 20, stageW - STAGE_PADDING - 20)
                c.facing = c.targetX > c.x ? 1 : -1
                c.stateTimer = 15000 // max walk time safety
              } else if (roll < 0.78) {
                // Wave at viewer
                c.state = STATES.WAVING
                c.stateTimer = randomBetween(1800, 3000)
                c.bubble = pickRandom(WAVE_MESSAGES)
                c.bubbleTimer = c.stateTimer - 200
              } else {
                // Try to greet nearest character
                let nearest = null
                let nearestDist = Infinity
                chars.forEach((other, j) => {
                  if (j === i) return
                  if (other.state === STATES.GREETING) return
                  const dist = Math.abs(other.x - c.x)
                  if (dist < nearestDist) {
                    nearestDist = dist
                    nearest = j
                  }
                })
                if (nearest !== null && nearestDist < 200) {
                  // Walk toward them to greet
                  const other = chars[nearest]
                  c.state = STATES.WALKING
                  c.greetPartner = nearest
                  const offsetDir = c.x < other.x ? -1 : 1
                  c.targetX = other.x + offsetDir * (CHAR_WIDTH + 8)
                  c.facing = c.x < other.x ? 1 : -1
                  c.stateTimer = 10000
                } else {
                  // Just idle longer
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
              // Arrived
              c.x = c.targetX
              c.targetX = null

              if (c.greetPartner != null) {
                // Initiate greeting
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
                  // Partner responds with slight delay via bubble
                  setTimeout(() => {
                    if (partner.state === STATES.GREETING) {
                      partner.bubble = pickRandom(GREETINGS)
                      partner.bubbleTimer = c.stateTimer - 800
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
              // Move toward target
              const dir = dist > 0 ? 1 : -1
              c.facing = dir
              const speed = c.walkSpeed * (dt / 16) // normalize to ~60fps
              c.x += dir * Math.min(speed, absDist)
              // Clamp to stage
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

      setRenderTick(t => t + 1)
      animRef.current = requestAnimationFrame(tick)
    }

    animRef.current = requestAnimationFrame(tick)
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [])

  const chars = charsRef.current

  return (
    <section className="-mt-12 md:-mt-20 pb-4 md:pb-6 px-6 relative z-10">
      <div className="max-w-[var(--container)] mx-auto">
        <div
          ref={stageRef}
          className="relative h-32 md:h-40 lg:h-44"
          style={{ minHeight: 128 }}
        >
          {CHARACTERS.map((char, i) => {
            const c = chars[i]
            if (!c) return null

            // Bob amount differs by state
            const idleBob = Math.sin(c.bobPhase) * 3
            const walkBob = c.state === STATES.WALKING
              ? Math.abs(Math.sin(c.stepPhase)) * 5
              : 0
            const waveBounce = c.state === STATES.WAVING
              ? Math.sin(c.bobPhase * 3) * 4
              : 0
            const greetBounce = c.state === STATES.GREETING
              ? Math.sin(c.bobPhase * 4) * 3
              : 0

            const bobY = idleBob + walkBob + waveBounce + greetBounce

            // Walk tilt
            const tilt = c.state === STATES.WALKING
              ? Math.sin(c.stepPhase) * 3 * c.facing
              : 0

            // Wave rock
            const waveRock = c.state === STATES.WAVING
              ? Math.sin(c.bobPhase * 5) * 6
              : 0

            const greetRock = c.state === STATES.GREETING
              ? Math.sin(c.bobPhase * 4) * 4
              : 0

            return (
              <div
                key={i}
                className="absolute bottom-0 flex flex-col items-center"
                style={{
                  left: c.x,
                  transform: `translateX(-50%)`,
                  transition: 'none',
                  willChange: 'left',
                }}
              >
                {/* Speech bubble */}
                {c.bubble && (
                  <div
                    className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap
                               px-2.5 py-1 rounded-lg text-[11px] font-semibold
                               bg-white text-[var(--color-heading)] shadow-sm border border-[var(--color-border)]
                               animate-bubble-in"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {c.bubble}
                    {/* Bubble tail */}
                    <div
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2
                                 bg-white border-r border-b border-[var(--color-border)]
                                 rotate-45"
                    />
                  </div>
                )}

                {/* Character */}
                <div
                  style={{
                    transform: `translateY(${-bobY}px) scaleX(${c.facing}) rotate(${tilt + waveRock + greetRock}deg)`,
                    imageRendering: 'pixelated',
                    transition: 'transform 0.05s steps(2)',
                  }}
                >
                  <img
                    src={char.src}
                    alt={char.name}
                    className="h-20 md:h-28 lg:h-32 w-auto select-none pointer-events-none"
                    draggable={false}
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>

                {/* Shadow */}
                <div
                  className="mt-0.5 rounded-full bg-black/8"
                  style={{
                    width: 36,
                    height: 6,
                    transform: `scaleX(${1 - Math.abs(bobY) * 0.015})`,
                    opacity: 0.4 + Math.abs(bobY) * 0.02,
                  }}
                />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
