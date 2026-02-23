import { useEffect, useRef, useState } from "react"
import { withBase } from "../utils/paths"

export default function EndingSection() {
  const sectionRef = useRef(null)
  const [showMain, setShowMain] = useState(false)

  // Reveal main line when the ending section is in view (scroll-based, not time-based)
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    // If user prefers reduced motion, show immediately
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (prefersReduced) {
      setShowMain(true)
      return
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShowMain(true)
          io.disconnect()
        }
      },
      {
        // Trigger a bit later so user has time to "arrive" at the section
        threshold: 0.35,
        rootMargin: "0px 0px -10% 0px",
      }
    )

    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <section
      id="ending"
      ref={sectionRef}
      style={{
        position: "relative",
        minHeight: "100vh",
        background: "#8E8A83", // warm grey
        color: "#F3F1EB",
        overflow: "hidden",
      }}
    >
      {/* Inline animation (single-file) */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Background contour */}
      <img
        src={withBase("bg_white.png")}
        alt=""
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center bottom",
          opacity: 0.65,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Subtle fade so text area calm */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, rgba(142,138,131,0.95) 0%, rgba(142,138,131,0.90) 55%, rgba(142,138,131,0.70) 100%)",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "0 24px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 980 }}>
          {/* MAIN line (bigger, above, scroll-reveal) */}
          <p
            style={{
              margin: 0,
              marginBottom: 14,
              fontSize: 22, // bigger than before
              lineHeight: 1.75,
              letterSpacing: "0.01em",
              color: "rgba(243,241,235,0.94)",
              opacity: showMain ? 1 : 0,
              transform: showMain ? "translateY(0)" : "translateY(18px)",
              animation: showMain ? "fadeUp 1.1s ease forwards" : "none",
            }}
          >
            Conflict persists across space and time. Its contours continue to shift.
          </p>

          {/* Conclusion (no animation, wider/full-frame feel) */}
          <p
            style={{
              margin: 0,
              fontSize: 14,
              lineHeight: 1.9,
              color: "rgba(243,241,235,0.82)",
              maxWidth: 920, // “full frame” within your 6xl container vibe
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Across regions, the balance between state-based, non-state, and one-sided violence shifts—revealing
            distinct trajectories rather than a single global pattern.
          </p>
        </div>
      </div>

      {/* Source – fixed bottom left */}
      <div
        style={{
          position: "absolute",
          bottom: 28,
          left: 32,
          fontSize: 12,
          color: "rgba(243,241,235,0.92)",
          letterSpacing: "0.02em",
          zIndex: 2,
        }}
      >
        Source: UCDP Georeferenced Event Dataset (GED), 2000–2024.
      </div>
    </section>
  )
}