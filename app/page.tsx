"use client"

import { useRef, useState } from "react"
import { GalaxyScene } from "@/components/galaxy-scene"

export default function Page() {
  const [abierto, setAbierto] = useState(false)
  const [approaching, setApproaching] = useState(false)
  const [arrived, setArrived] = useState(false)
  const [verCarta, setVerCarta] = useState(false)
  const [silenciado, setSilenciado] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  function abrirSorpresa() {
    setAbierto(true)
    const audio = audioRef.current
    if (audio) {
      audio.volume = 0.55
      audio.play().catch(() => {})
    }
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([100, 50, 100])
    }
  }

  function alternarSonido() {
    const audio = audioRef.current
    if (!audio) return
    const nuevoSilenciado = !silenciado
    audio.muted = nuevoSilenciado
    if (!nuevoSilenciado && audio.paused) {
      audio.play().catch(() => {})
    }
    setSilenciado(nuevoSilenciado)
  }

  function acercarme() {
    setApproaching(true)
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([60, 40, 120])
    }
  }

  return (
    <main className="relative h-[100dvh] w-full overflow-hidden bg-[#0a0612] text-amber-50">
      {/* Música de fondo */}
      <audio ref={audioRef} src="/musica.mp3" loop preload="auto" />

      {/* Control de sonido */}
      {abierto && (
        <button
          onClick={alternarSonido}
          aria-label={silenciado ? "Activar música" : "Silenciar música"}
          className="absolute right-5 top-5 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-amber-200/30 bg-black/30 text-amber-100 backdrop-blur-md transition active:scale-90"
        >
          {silenciado ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M11 5 6 9H2v6h4l5 4z" />
              <line x1="22" y1="9" x2="16" y2="15" />
              <line x1="16" y1="9" x2="22" y2="15" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M11 5 6 9H2v6h4l5 4z" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
          )}
        </button>
      )}

      {/* Galaxia 3D interactiva */}
      <div className="absolute inset-0">
        <GalaxyScene
          approach={approaching}
          arrived={arrived}
          onArrived={() => setArrived(true)}
        />
      </div>

      {/* Vista lejana: explorar y acercarse */}
      {abierto && !approaching && (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-8 z-20 px-6 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-200/70">
              21 de septiembre
            </p>
            <h1 className="mt-2 text-balance font-serif text-3xl text-amber-100 drop-shadow-[0_2px_12px_rgba(255,200,80,0.35)]">
              Nuestra galaxia
            </h1>
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-6 z-20 flex flex-col items-center gap-4 px-6 text-center">
            <p className="text-sm tracking-wide text-amber-100/80">
              Movela con el dedo para explorar
            </p>
            <button
              onClick={acercarme}
              className="pointer-events-auto rounded-full bg-gradient-to-br from-amber-300 to-amber-500 px-8 py-3.5 text-base font-bold text-[#3a2600] shadow-[0_10px_30px_rgba(255,180,40,0.4)] transition active:scale-95"
            >
              Acercarme a las flores
            </button>
          </div>
        </>
      )}

      {/* Al llegar: leer la carta */}
      {arrived && !verCarta && (
        <div className="pointer-events-none absolute inset-x-0 bottom-7 z-20 flex flex-col items-center gap-4 px-6 text-center">
          <p className="text-sm tracking-wide text-amber-100/80">
            Girala con el dedo... hecha para vos
          </p>
          <button
            onClick={() => setVerCarta(true)}
            className="pointer-events-auto rounded-full border border-amber-300/50 bg-amber-400/15 px-7 py-3 text-base font-semibold text-amber-100 backdrop-blur-md transition active:scale-95"
          >
            Leer mi carta
          </button>
        </div>
      )}

      {/* Pantalla de inicio */}
      {!abierto && (
        <section className="absolute inset-0 z-30 flex items-center justify-center bg-gradient-to-b from-[#0a0612]/70 via-[#0a0612]/60 to-[#0a0612]/85 px-6 text-center backdrop-blur-[2px]">
          <div className="max-w-sm">
            <div className="mb-4 text-6xl">🌌</div>
            <h1 className="text-balance font-serif text-3xl leading-tight text-amber-100">
              Una galaxia para vos...
            </h1>
            <p className="mx-auto mt-4 text-pretty text-base leading-relaxed text-amber-100/80">
              Toca para entrar y muévelo con el dedo.
            </p>
            <button
              onClick={abrirSorpresa}
              className="mt-8 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 px-8 py-4 text-lg font-bold text-[#3a2600] shadow-[0_10px_30px_rgba(255,180,40,0.35)] transition active:scale-95"
            >
              Entrar a la galaxia
            </button>
          </div>
        </section>
      )}

      {/* Carta */}
      {verCarta && (
        <section className="absolute inset-0 z-40 flex items-center justify-center overflow-y-auto bg-[#0a0612]/70 px-5 py-10 backdrop-blur-md">
          <div className="my-auto w-full max-w-md rounded-3xl border border-amber-200/20 bg-gradient-to-b from-white/12 to-white/5 p-7 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
            <div className="text-center text-4xl">💛</div>
            <h2 className="mt-3 text-center font-serif text-2xl text-amber-100">
              Para vos amor.
            </h2>
            <div className="mt-5 space-y-4 text-pretty text-base leading-relaxed text-amber-50/90">
              <p>
                Dicen que hay millones de estrellas allá afuera, pero ninguna
                brillan tanto como vos.
              </p>
              <p>
                Gracias por cada momento, por cada sonrisa y por todos esos
                pequeños detalles que hacen que lo normal sea diferente y
                agradable.
              </p>
              <p>
                Disculpa que no sea un regalo físico con flores pero prefiero
                darte esas flores cuando estemos cerca y no que alguien que no
                sea yo te las de.
              </p>
            </div>
            <p className="mt-6 text-center font-serif text-lg italic text-amber-200/90">
              Te Amo 💛
            </p>
            <button
              onClick={() => setVerCarta(false)}
              className="mt-7 w-full rounded-full border border-amber-300/40 bg-amber-400/10 px-6 py-3 font-semibold text-amber-100 transition active:scale-95"
            >
              Volver a la galaxia
            </button>
          </div>
        </section>
      )}
    </main>
  )
}
