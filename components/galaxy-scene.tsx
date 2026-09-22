"use client"

import { useEffect, useMemo, useRef } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Html } from "@react-three/drei"
import * as THREE from "three"

const CENTER = new THREE.Vector3(0, 0.4, 0)
const NEAR_POS = new THREE.Vector3(0, 0.5, 3.9)
const FAR_TARGET = new THREE.Vector3(0, 0, 0)

function createGlowTexture() {
  if (typeof document === "undefined") return null
  const size = 128
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")
  if (!ctx) return null
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, "rgba(255,247,214,1)")
  g.addColorStop(0.25, "rgba(255,206,80,0.85)")
  g.addColorStop(0.6, "rgba(255,160,40,0.25)")
  g.addColorStop(1, "rgba(255,160,40,0)")
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

function Galaxy() {
  const pointsRef = useRef<THREE.Points>(null)

  const { positions, colors } = useMemo(() => {
    const count = 12000
    const branches = 5
    const radius = 9
    const spin = 1.1
    const randomnessPower = 2.6

    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)

    const colorInside = new THREE.Color("#fff4c2")
    const colorMid = new THREE.Color("#ffca3a")
    const colorOutside = new THREE.Color("#f0806c")

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const r = Math.pow(Math.random(), 0.7) * radius
      const branchAngle = ((i % branches) / branches) * Math.PI * 2
      const spinAngle = r * spin

      const randomX =
        Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * 0.5 * r
      const randomY =
        Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * 0.35 * r
      const randomZ =
        Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * 0.5 * r

      positions[i3] = Math.cos(branchAngle + spinAngle) * r + randomX
      positions[i3 + 1] = randomY
      positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * r + randomZ

      const mixed = colorInside.clone()
      if (r / radius < 0.5) {
        mixed.lerp(colorMid, (r / radius) * 2)
      } else {
        mixed.copy(colorMid).lerp(colorOutside, (r / radius - 0.5) * 2)
      }

      colors[i3] = mixed.r
      colors[i3 + 1] = mixed.g
      colors[i3 + 2] = mixed.b
    }

    return { positions, colors }
  }, [])

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.05
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={positions.length / 3} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} count={colors.length / 3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexColors
        transparent
      />
    </points>
  )
}

function HeartField() {
  const { positions, colors } = useMemo(() => {
    const count = 6000
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const cIn = new THREE.Color("#fff6cf")
    const cOut = new THREE.Color("#ffb02e")

    for (let i = 0; i < count; i++) {
      const t = Math.random() * Math.PI * 2
      const edge = Math.pow(Math.random(), 0.6)
      let x = 16 * Math.pow(Math.sin(t), 3)
      let y =
        13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)
      x /= 16
      y /= 16
      const scale = 1.6
      const f = 0.32 + edge * 0.68
      const jitter = 0.04
      positions[i * 3] = x * scale * f + (Math.random() - 0.5) * jitter
      positions[i * 3 + 1] = y * scale * f + (Math.random() - 0.5) * jitter
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.3

      const col = cIn.clone().lerp(cOut, f)
      colors[i * 3] = col.r
      colors[i * 3 + 1] = col.g
      colors[i * 3 + 2] = col.b
    }
    return { positions, colors }
  }, [])

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={positions.length / 3} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} count={colors.length / 3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexColors
        transparent
      />
    </points>
  )
}

function GoldenDust() {
  const ref = useRef<THREE.Points>(null)
  const glow = useMemo(() => createGlowTexture(), [])

  const count = 400
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 6
      arr[i * 3 + 1] = (Math.random() - 0.5) * 5
      arr[i * 3 + 2] = (Math.random() - 0.5) * 3
    }
    return arr
  }, [count])

  // Per-particle fall speed and gentle horizontal drift so the dust never
  // resets as one visible band.
  const speeds = useMemo(() => {
    const arr = new Float32Array(count)
    for (let i = 0; i < count; i++) arr[i] = 0.18 + Math.random() * 0.35
    return arr
  }, [count])

  useFrame((_, delta) => {
    const pts = ref.current
    if (!pts) return
    const pos = pts.geometry.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < pos.count; i++) {
      let y = pos.getY(i) - delta * speeds[i]
      if (y < -2.6) {
        // Respawn above the top with fresh x/z so the wrap is invisible.
        y = 2.6 + Math.random() * 0.6
        pos.setX(i, (Math.random() - 0.5) * 6)
        pos.setZ(i, (Math.random() - 0.5) * 3)
      }
      pos.setY(i, y)
    }
    pos.needsUpdate = true
  })

  return (
    <points ref={ref} position={[0, 0.3, 0]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={positions.length / 3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.14}
        sizeAttenuation
        map={glow ?? undefined}
        color="#ffdd7a"
        transparent
        opacity={0.8}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

function CoreBloom() {
  const glow = useMemo(() => createGlowTexture(), [])
  const ref = useRef<THREE.Sprite>(null)

  useFrame(({ clock }) => {
    if (ref.current) {
      const s = 3 + Math.sin(clock.elapsedTime * 1.5) * 0.2
      ref.current.scale.set(s, s, s)
    }
  })

  if (!glow) return null
  return (
    <sprite ref={ref} position={[0, 0.35, -0.1]}>
      <spriteMaterial
        map={glow}
        color="#ffcf5a"
        transparent
        opacity={0.9}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </sprite>
  )
}

type FlowerVariant = "girasol" | "margarita" | "tulipan" | "cinco" | "estrella" | "pompon"

function FlowerIcon({ variant, size = 26 }: { variant: FlowerVariant; size?: number }) {
  const glow = "drop-shadow(0 0 5px rgba(255,200,80,0.9))"
  const common = { width: size, height: size, viewBox: "0 0 100 100", style: { filter: glow } } as const

  if (variant === "girasol") {
    return (
      <svg {...common} aria-hidden="true">
        {Array.from({ length: 16 }).map((_, i) => (
          <ellipse
            key={i}
            cx="50"
            cy="24"
            rx="5"
            ry="17"
            fill="#ffd21a"
            transform={`rotate(${i * 22.5} 50 50)`}
          />
        ))}
        <circle cx="50" cy="50" r="15" fill="#8a5a12" />
        <circle cx="50" cy="50" r="9" fill="#5f3d0a" />
      </svg>
    )
  }
  if (variant === "margarita") {
    return (
      <svg {...common} aria-hidden="true">
        {Array.from({ length: 9 }).map((_, i) => (
          <ellipse
            key={i}
            cx="50"
            cy="22"
            rx="8"
            ry="19"
            fill="#fff1a6"
            transform={`rotate(${i * 40} 50 50)`}
          />
        ))}
        <circle cx="50" cy="50" r="14" fill="#ffb300" />
      </svg>
    )
  }
  if (variant === "tulipan") {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M50 88 C50 55 50 40 50 30" stroke="#4caf50" strokeWidth="5" fill="none" />
        <path d="M50 78 C34 70 30 58 34 56 C40 62 46 64 50 64 Z" fill="#5fbf62" />
        <path d="M50 78 C66 70 70 58 66 56 C60 62 54 64 50 64 Z" fill="#4caf50" />
        <path d="M30 38 C30 20 44 12 50 30 C56 12 70 20 70 38 C70 52 60 58 50 58 C40 58 30 52 30 38 Z" fill="#ffcf1f" />
        <path d="M50 30 C52 40 52 50 50 58 C48 50 48 40 50 30 Z" fill="#f5a800" />
      </svg>
    )
  }
  if (variant === "cinco") {
    return (
      <svg {...common} aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <ellipse
            key={i}
            cx="50"
            cy="26"
            rx="12"
            ry="20"
            fill="#ffd554"
            transform={`rotate(${i * 72} 50 50)`}
          />
        ))}
        <circle cx="50" cy="50" r="11" fill="#ff9d00" />
      </svg>
    )
  }
  if (variant === "estrella") {
    return (
      <svg {...common} aria-hidden="true">
        {Array.from({ length: 6 }).map((_, i) => (
          <path
            key={i}
            d="M50 50 L44 16 Q50 6 56 16 Z"
            fill="#ffde59"
            transform={`rotate(${i * 60} 50 50)`}
          />
        ))}
        <circle cx="50" cy="50" r="10" fill="#e08a00" />
      </svg>
    )
  }
  // pompon (marigold, double layer)
  return (
    <svg {...common} aria-hidden="true">
      {Array.from({ length: 12 }).map((_, i) => (
        <ellipse
          key={`o${i}`}
          cx="50"
          cy="26"
          rx="7"
          ry="16"
          fill="#ffc61a"
          transform={`rotate(${i * 30} 50 50)`}
        />
      ))}
      {Array.from({ length: 12 }).map((_, i) => (
        <ellipse
          key={`i${i}`}
          cx="50"
          cy="34"
          rx="5"
          ry="11"
          fill="#ffe27a"
          transform={`rotate(${i * 30 + 15} 50 50)`}
        />
      ))}
      <circle cx="50" cy="50" r="7" fill="#e69100" />
    </svg>
  )
}

const PHRASES: {
  text: string
  pos: [number, number, number]
  delay: number
  flower: FlowerVariant
}[] = [
  { text: "Te amo", pos: [-2.3, -0.5, 0.2], delay: 0.9, flower: "girasol" },
  { text: "Nina", pos: [2.0, -0.9, 0.1], delay: 1.05, flower: "margarita" },
  { text: "Hermosa", pos: [-2.2, 0.9, 0.1], delay: 1.2, flower: "tulipan" },
  { text: "Eres mia", pos: [2.3, 0.7, 0.2], delay: 1.35, flower: "cinco" },
  { text: "Amor", pos: [0, -1.8, 0.1], delay: 1.5, flower: "estrella" },
]

function FloatingPhrases() {
  return (
    <group position={[0, 0.35, 0]}>
      <Html position={[0, 1.15, 0]} center distanceFactor={8} zIndexRange={[11, 0]}>
        <div
          className="flex select-none flex-col items-center whitespace-nowrap text-center font-serif"
          style={{ animation: "fraseAparecer 1.1s ease 0.2s both" }}
        >
          <span style={{ animation: "florFlota 4s ease-in-out infinite" }}>
            <FlowerIcon variant="girasol" size={34} />
          </span>
          <span
            className="block text-amber-200"
            style={{
              fontSize: "34px",
              fontWeight: 700,
              letterSpacing: "1px",
              textShadow: "0 0 18px rgba(255,200,90,0.95), 0 0 34px rgba(255,170,50,0.6), 0 2px 8px rgba(0,0,0,0.7)",
            }}
          >
            Camila Jazmín
          </span>
        </div>
      </Html>
      {PHRASES.map((p) => (
        <Html key={p.text} position={p.pos} center distanceFactor={8} zIndexRange={[10, 0]}>
          <span
            className="flex select-none items-center gap-1.5 whitespace-nowrap font-serif text-amber-100"
            style={{
              fontSize: "18px",
              textShadow: "0 0 12px rgba(255,190,70,0.8), 0 2px 6px rgba(0,0,0,0.6)",
              animation: `fraseAparecer 0.9s ease ${p.delay}s both`,
            }}
          >
            <span
              className="inline-flex"
              style={{ animation: `florFlota 4s ease-in-out ${p.delay}s infinite` }}
            >
              <FlowerIcon variant={p.flower} />
            </span>
            {p.text}
          </span>
        </Html>
      ))}
    </group>
  )
}

const HEART_PHOTOS = [
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG-20260816-WA0048-1U4Qk1ghlIEsuTyJmDPfmU5m18oYSU.jpg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG-20260920-WA0057-DD1cVmMHUUQsC9wk6aVIGaPVf2akRZ.jpg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG-20260920-WA0054-qExaLwzf12HMjQx01nzfgmQbrctsRP.jpg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG-20260920-WA0024-EHlo6YCoAttj8bkjhS2hF1p9DLftgV.jpg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG-20260920-WA0055-vVIisNOK82Scpe5FtobFATtMW5psZB.jpg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_20260817_103206_126-vDNRgksd8nqodpa7X8vJeWNvF8GIM0.webp",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG-20260920-WA0045-G4zDiRnp8hFYgWIktPLE4ZLe6Hih0H.jpg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG-20260920-WA0033-iI0LwEpPVQiE4p2deevhdy8fZPMZHC.jpg",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG-20260920-WA0056%281%29-jGtZG48xlw62vBMzQYFg98gHdjOtGA.jpg",
]

// A photo frame that lives inside the heart. Each picture assembles from
// golden-drifting particles, holds crisp for a moment, then dissolves back
// into particles that float away — one photo after another, in a loop.
function HeartPhotoParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const COLS = 38
    const CELL = 5
    const PAD = 16
    const ASPECT = 1 // square canvas, clipped to a circle
    const ROWS = Math.round(COLS * ASPECT)
    const PW = COLS * CELL
    const PH = ROWS * CELL
    const W = PW + PAD * 2
    const H = PH + PAD * 2
    // Bias the vertical crop toward the top so faces (usually in the upper
    // half of a portrait selfie) stay inside the frame instead of getting cut.
    const FOCUS_Y = 0.28
    // Circle geometry in canvas + grid space.
    const CXc = W / 2
    const CYc = H / 2
    const RAD = PW / 2
    const cxCell = COLS / 2
    const cyCell = ROWS / 2
    const radCell = COLS / 2
    canvas.width = W
    canvas.height = H

    type Particle = {
      tx: number
      ty: number
      ox: number
      oy: number
      vx: number
      vy: number
      r: number
      g: number
      b: number
    }

    const off = document.createElement("canvas")
    off.width = COLS
    off.height = ROWS
    const offCtx = off.getContext("2d", { willReadFrequently: true })

    let particles: Particle[] = []
    let currentImg: HTMLImageElement | null = null
    let index = 0
    let cancelled = false
    let raf = 0

    const FORM = 1000
    const HOLD = 3000
    const DISSOLVE = 1300
    let phase: "form" | "hold" | "dissolve" = "form"
    let phaseStart = performance.now()

    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
    const easeIn = (t: number) => t * t * t

    function drawCover(img: HTMLImageElement) {
      const ia = img.width / img.height
      const da = PW / PH
      let sx = 0
      let sy = 0
      let sw = img.width
      let sh = img.height
      if (ia > da) {
        sw = img.height * da
        sx = (img.width - sw) / 2
      } else {
        sh = img.width / da
        sy = (img.height - sh) * FOCUS_Y
      }
      ctx!.drawImage(img, sx, sy, sw, sh, PAD, PAD, PW, PH)
    }

    function buildParticles(img: HTMLImageElement) {
      if (!offCtx) return
      const ia = img.width / img.height
      const da = COLS / ROWS
      let sx = 0
      let sy = 0
      let sw = img.width
      let sh = img.height
      if (ia > da) {
        sw = img.height * da
        sx = (img.width - sw) / 2
      } else {
        sh = img.width / da
        sy = (img.height - sh) * FOCUS_Y
      }
      offCtx.clearRect(0, 0, COLS, ROWS)
      offCtx.drawImage(img, sx, sy, sw, sh, 0, 0, COLS, ROWS)
      let data: Uint8ClampedArray
      try {
        data = offCtx.getImageData(0, 0, COLS, ROWS).data
      } catch {
        particles = []
        return
      }
      const next: Particle[] = []
      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          const i = (y * COLS + x) * 4
          if (data[i + 3] < 12) continue
          // keep only cells inside the circle
          const dxC = x + 0.5 - cxCell
          const dyC = y + 0.5 - cyCell
          if (Math.sqrt(dxC * dxC + dyC * dyC) > radCell) continue
          const tx = PAD + x * CELL + CELL / 2
          const ty = PAD + y * CELL + CELL / 2
          const ang = Math.random() * Math.PI * 2
          const dist = 40 + Math.random() * 130
          next.push({
            tx,
            ty,
            ox: tx + Math.cos(ang) * dist,
            oy: ty + Math.sin(ang) * dist,
            vx: (Math.random() - 0.5) * 90,
            vy: -60 - Math.random() * 120,
            r: data[i],
            g: data[i + 1],
            b: data[i + 2],
          })
        }
      }
      particles = next
    }

    function loadImage(src: string) {
      return new Promise<HTMLImageElement>((res, rej) => {
        const im = new Image()
        im.crossOrigin = "anonymous"
        im.onload = () => res(im)
        im.onerror = rej
        im.src = src
      })
    }

    function frame() {
      ctx!.save()
      ctx!.globalAlpha = 0.55
      ctx!.strokeStyle = "rgba(255,205,110,0.9)"
      ctx!.lineWidth = 2
      ctx!.beginPath()
      ctx!.arc(CXc, CYc, RAD + 5, 0, Math.PI * 2)
      ctx!.stroke()
      ctx!.restore()
    }

    function drawParticles(alphaFn: (p: Particle) => number, xy: (p: Particle) => [number, number]) {
      for (const p of particles) {
        const [x, y] = xy(p)
        ctx!.globalAlpha = alphaFn(p)
        ctx!.fillStyle = `rgb(${p.r},${p.g},${p.b})`
        ctx!.beginPath()
        ctx!.arc(x, y, CELL * 0.64, 0, Math.PI * 2)
        ctx!.fill()
      }
      ctx!.globalAlpha = 1
    }

    function loop() {
      if (cancelled) return
      const now = performance.now()
      const elapsed = now - phaseStart
      ctx!.clearRect(0, 0, W, H)

      const hasParticles = particles.length > 0

      if (phase === "form") {
        const p = Math.min(elapsed / FORM, 1)
        const e = easeOut(p)
        if (hasParticles) {
          drawParticles(
            () => e,
            (pt) => [pt.ox + (pt.tx - pt.ox) * e, pt.oy + (pt.ty - pt.oy) * e],
          )
        } else if (currentImg) {
          ctx!.globalAlpha = e
          drawCover(currentImg)
          ctx!.globalAlpha = 1
        }
        if (p >= 1) {
          phase = "hold"
          phaseStart = now
        }
      } else if (phase === "hold") {
        if (currentImg) {
          ctx!.save()
          ctx!.beginPath()
          ctx!.arc(CXc, CYc, RAD, 0, Math.PI * 2)
          ctx!.clip()
          drawCover(currentImg)
          ctx!.restore()
        }
        if (elapsed >= HOLD) {
          phase = "dissolve"
          phaseStart = now
        }
      } else {
        const p = Math.min(elapsed / DISSOLVE, 1)
        const e = easeIn(p)
        if (hasParticles) {
          drawParticles(
            () => Math.max(0, 1 - e),
            (pt) => [pt.tx + pt.vx * e, pt.ty + pt.vy * e - 30 * e * e],
          )
        } else if (currentImg) {
          ctx!.globalAlpha = Math.max(0, 1 - e)
          drawCover(currentImg)
          ctx!.globalAlpha = 1
        }
        if (p >= 1) {
          void advance()
        }
      }

      frame()
      raf = requestAnimationFrame(loop)
    }

    async function advance() {
      index = (index + 1) % HEART_PHOTOS.length
      try {
        const img = await loadImage(HEART_PHOTOS[index])
        if (cancelled) return
        currentImg = img
        buildParticles(img)
      } catch {
        // keep previous image if this one fails to load
      }
      phase = "form"
      phaseStart = performance.now()
    }

    async function start() {
      try {
        const img = await loadImage(HEART_PHOTOS[0])
        if (cancelled) return
        currentImg = img
        buildParticles(img)
      } catch {
        return
      }
      phase = "form"
      phaseStart = performance.now()
      loop()
    }

    void start()

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="block"
      style={{
        width: 150,
        height: "auto",
        filter: "drop-shadow(0 0 16px rgba(255,190,80,0.5))",
      }}
    />
  )
}

function HeartPhotos3D() {
  return (
    <Html
      position={[0, 0.15, 0.3]}
      center
      distanceFactor={5}
      zIndexRange={[8, 0]}
      style={{ pointerEvents: "none" }}
    >
      <HeartPhotoParticles />
    </Html>
  )
}

function BackgroundStars() {
  const ref = useRef<THREE.Points>(null)

  const positions = useMemo(() => {
    const count = 1500
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const r = 30 + Math.random() * 25
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      arr[i3] = r * Math.sin(phi) * Math.cos(theta)
      arr[i3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      arr[i3 + 2] = r * Math.cos(phi)
    }
    return arr
  }, [])

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.01
    }
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={positions.length / 3} />
      </bufferGeometry>
      <pointsMaterial size={0.08} sizeAttenuation color="#fff7e0" transparent opacity={0.7} depthWrite={false} />
    </points>
  )
}

function CameraRig({
  approach,
  arrived,
  onArrived,
}: {
  approach: boolean
  arrived: boolean
  onArrived: () => void
}) {
  const { camera } = useThree() as { camera: THREE.PerspectiveCamera }
  const controlsRef = useRef<any>(null)
  const arrivedRef = useRef(false)

  // When we land, hand control back to OrbitControls focused on the heart.
  useEffect(() => {
    if (arrived && controlsRef.current) {
      controlsRef.current.target.copy(CENTER)
      controlsRef.current.update()
    }
  }, [arrived])

  useFrame((_, delta) => {
    if (!approach || arrivedRef.current) return
    const t = 1 - Math.exp(-delta * 1.8)
    camera.position.lerp(NEAR_POS, t)
    camera.lookAt(CENTER)
    if (camera.position.distanceTo(NEAR_POS) < 0.15) {
      arrivedRef.current = true
      onArrived()
    }
  })

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enabled={!approach || arrived}
      enablePan={false}
      enableZoom
      minDistance={arrived ? 2.2 : 5}
      maxDistance={arrived ? 8 : 20}
      target={arrived ? CENTER : FAR_TARGET}
      rotateSpeed={0.6}
      zoomSpeed={0.7}
      enableDamping
      dampingFactor={0.08}
    />
  )
}

export function GalaxyScene({
  approach,
  arrived,
  onArrived,
}: {
  approach: boolean
  arrived: boolean
  onArrived: () => void
}) {
  return (
    <Canvas camera={{ position: [0, 5, 11], fov: 60 }} dpr={[1, 2]} gl={{ antialias: true }}>
      <color attach="background" args={["#0a0612"]} />
      <fog attach="fog" args={["#0a0612", 16, 42]} />
      <BackgroundStars />
      <Galaxy />
      {approach && (
        <group position={CENTER.toArray()}>
          <CoreBloom />
          <HeartField />
          <GoldenDust />
          {arrived && <HeartPhotos3D />}
          {arrived && <FloatingPhrases />}
        </group>
      )}
      <CameraRig approach={approach} arrived={arrived} onArrived={onArrived} />
    </Canvas>
  )
}
