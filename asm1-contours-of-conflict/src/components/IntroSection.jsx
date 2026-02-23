import { useEffect, useRef } from "react"
import { withBase } from "../utils/paths"

export default function IntroSection() {
  const sectionRef = useRef(null)

  // Optional: smooth scroll when clicking arrow (nice touch, still minimal)
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const onKey = (e) => {
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault()
        window.scrollBy({ top: window.innerHeight * 0.9, behavior: "smooth" })
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <section
      id="intro"
      ref={sectionRef}
      style={{
        position: "relative",
        minHeight: "100vh",
        background: "#8E8A83", // warm grey (calm)
        color: "#F3F1EB", // off-white
        overflow: "hidden",
      }}
    >
      {/* Background contour image (lower half) */}
      <img
        src={withBase("bg_white.png")}
        alt=""
        aria-hidden="true"
        style={{
            position: "absolute",
            inset: 0,                 // shorthand แทน left/right/bottom
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center bottom",
            opacity: 0.35,
            pointerEvents: "none",
            zIndex: 1,
        }}
        />

      {/* Title + Subtitle */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: 980,
          padding: "180px 24px 96px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(44px, 7vw, 84px)",
            lineHeight: 1.02,
            letterSpacing: "-0.01em",
            margin: 0,
            fontWeight: 750,
          }}
        >
          Contours of Conflict
        </h1>

        <p
          style={{
            marginTop: 18,
            maxWidth: 720,
            fontSize: "clamp(16px, 2.0vw, 18px)",
            lineHeight: 1.5,
            opacity: 0.78,
          }}
        >
          Conflict leaves patterns across space and time.
          <br />
          We trace their contours.
        </p>
      </div>

      {/* Microline bottom center */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 28,
          textAlign: "center",
          fontSize: 12,
          letterSpacing: "0.02em",
          opacity: 0.75,
          zIndex: 2,
          pointerEvents: "none",
        }}
      >
        An interactive atlas of global conflict, 2000–2024.
      </div>

      {/* Minimal arrow (triangle only) */}
      <button
        type="button"
        onClick={() =>
          window.scrollBy({ top: window.innerHeight * 0.9, behavior: "smooth" })
        }
        style={{
          position: "absolute",
          left: "50%",
          bottom: 72,
          transform: "translateX(-50%)",
          zIndex: 3,
          opacity: 0.85,
          background: "transparent",
          border: "none",
          padding: 8,
          cursor: "pointer",
        }}
        aria-label="Scroll down"
      >
        <span
          style={{
            display: "inline-block",
            animation: "coc-bob 2.2s ease-in-out infinite",
          }}
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
            <path
              d="M7 10l5 5 5-5"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      {/* Keyframes */}
      <style>{`
        @keyframes coc-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(4px); }
        }

        @keyframes coc-drift {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-10px); }
        }
      `}</style>
    </section>
  )
}