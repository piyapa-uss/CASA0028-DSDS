export default function EndingSection() {
  return (
    <section
      id="ending"
      style={{
        position: "relative",
        minHeight: "100vh",
        background: "#8E8A83", // warm grey
        color: "#F3F1EB",
        overflow: "hidden",
      }}
    >
      {/* Background contour */}
      <img
        src="/bg_white.png"
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

      {/* Optional: subtle fade so text area calm */}
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
        <div style={{ maxWidth: 680 }}>
          <p
            style={{
              fontSize: 18,
              lineHeight: 1.8,
              color: "rgba(243,241,235,0.92)",
              margin: 0,
            }}
          >
            Conflict persists across space and time. Its contours continue to shift.
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