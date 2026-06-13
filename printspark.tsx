import { useState } from "react";

const SYSTEM = `You are PrintSpark, a creative 3D printing idea generator. When given a problem, hobby, or interest, generate exactly 3 creative 3D printable object ideas.

Respond ONLY with a valid JSON array — no markdown, no backticks, no extra text. Use this exact structure:
[
  {
    "name": "Object Name",
    "emoji": "one relevant emoji",
    "useCase": "One or two sentences on why it's useful or fun.",
    "difficulty": "Beginner",
    "printTime": "2–3 hours",
    "filament": "PLA"
  }
]
difficulty must be exactly one of: Beginner, Intermediate, Advanced.`;

const diffColor = d => d === "Beginner" ? "#00ffcc" : d === "Intermediate" ? "#ff9d00" : "#ff4d6d";

export default function PrintSpark() {
  const [input, setInput] = useState("");
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [last, setLast] = useState("");
  const [visible, setVisible] = useState([]);

  const generate = async (prompt) => {
    setLoading(true); setError(""); setIdeas([]); setVisible([]);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6", max_tokens: 1000,
          system: SYSTEM,
          messages: [{ role: "user", content: `Generate 3D print ideas for: ${prompt}` }]
        })
      });
      const data = await res.json();
      const txt = data.content?.[0]?.text || "";
      const parsed = JSON.parse(txt.replace(/```json|```/g, "").trim());
      setIdeas(parsed);
      parsed.forEach((_, i) => setTimeout(() => setVisible(v => [...v, i]), i * 150));
    } catch {
      setError("Something went wrong. Please try again!");
    } finally { setLoading(false); }
  };

  const submit = () => { if (!input.trim()) return; setLast(input); generate(input); };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #060b20 0%, #0c1540 45%, #160832 100%)",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif",
      padding: "40px 20px", position: "relative", overflow: "hidden"
    }}>

      {/* Blueprint grid */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        backgroundImage: `linear-gradient(rgba(0,200,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(0,200,255,0.035) 1px, transparent 1px)`,
        backgroundSize: "44px 44px"
      }} />

      {/* Ambient orbs */}
      <div style={{ position: "fixed", top: -120, left: -120, width: 420, height: 420, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,200,255,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: -120, right: -80, width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle, rgba(110,0,255,0.09) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", top: "40%", right: -60, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,100,0,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 48, position: "relative" }}>
        <div style={{
          display: "inline-block", padding: "5px 16px", marginBottom: 18,
          background: "rgba(0,200,255,0.08)", border: "1px solid rgba(0,200,255,0.25)",
          borderRadius: 20, color: "#00c8ff", fontSize: 11, letterSpacing: "3px", textTransform: "uppercase"
        }}>✦ Powered by Claude AI ✦</div>

        <h1 style={{ fontSize: "clamp(40px,7vw,68px)", fontWeight: 700, color: "#fff", margin: "0 0 10px", letterSpacing: "-1.5px", lineHeight: 1 }}>
          Print<span style={{ color: "#00c8ff", textShadow: "0 0 30px rgba(0,200,255,0.5)" }}>Spark</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 15, margin: 0, fontWeight: 400, letterSpacing: "0.2px" }}>
          Describe a hobby or problem → Get 3 creative 3D print ideas
        </p>

        {/* Decorative line */}
        <div style={{ width: 60, height: 1, background: "linear-gradient(90deg, transparent, rgba(0,200,255,0.5), transparent)", margin: "20px auto 0" }} />
      </div>

      {/* Input area */}
      <div style={{ maxWidth: 680, margin: "0 auto 48px", position: "relative" }}>
        <div style={{
          display: "flex", gap: 10, alignItems: "center",
          background: "rgba(255,255,255,0.03)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(0,200,255,0.18)",
          borderRadius: 16, padding: "8px 8px 8px 20px",
          boxShadow: "0 0 40px rgba(0,200,255,0.04), inset 0 1px 0 rgba(255,255,255,0.04)"
        }}>
          <span style={{ fontSize: 18, opacity: 0.5 }}>🖨️</span>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submit()}
            placeholder="e.g. I love plants, cables are messy, I play chess..."
            style={{
              flex: 1, background: "transparent", border: "none", outline: "none",
              color: "#fff", fontSize: 15, fontFamily: "inherit", minWidth: 0
            }}
          />
          <button onClick={submit} disabled={loading || !input.trim()} style={{
            padding: "12px 22px", flexShrink: 0,
            background: loading || !input.trim()
              ? "rgba(0,200,255,0.1)"
              : "linear-gradient(135deg, #00b4d8, #0066cc)",
            border: "1px solid rgba(0,200,255,0.3)",
            borderRadius: 10, color: "#fff", fontWeight: 600, fontSize: 14,
            cursor: loading || !input.trim() ? "not-allowed" : "pointer",
            opacity: !input.trim() ? 0.45 : 1, transition: "all 0.2s",
            letterSpacing: "0.3px", whiteSpace: "nowrap"
          }}>
            {loading ? "Generating…" : "⚡ Spark It"}
          </button>
        </div>
      </div>

      {/* Loader */}
      {loading && (
        <div style={{ textAlign: "center", color: "rgba(255,255,255,0.4)", marginBottom: 40 }}>
          <div style={{
            width: 36, height: 36, margin: "0 auto 14px",
            border: "2px solid rgba(0,200,255,0.1)",
            borderTop: "2px solid #00c8ff", borderRadius: "50%",
            animation: "spin 0.9s linear infinite"
          }} />
          <span style={{ fontSize: 14, letterSpacing: "1px" }}>Scanning the maker's universe…</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          maxWidth: 680, margin: "0 auto 32px", padding: 16,
          background: "rgba(255,77,109,0.08)", border: "1px solid rgba(255,77,109,0.25)",
          borderRadius: 12, color: "#ff4d6d", textAlign: "center", fontSize: 14
        }}>{error}</div>
      )}

      {/* Cards */}
      {ideas.length > 0 && (
        <>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))",
            gap: 22, maxWidth: 980, margin: "0 auto 36px"
          }}>
            {ideas.map((idea, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.035)",
                backdropFilter: "blur(28px)",
                border: "1px solid rgba(0,200,255,0.13)",
                borderRadius: 22, padding: "28px 26px",
                position: "relative", overflow: "hidden",
                boxShadow: "0 8px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.05)",
                opacity: visible.includes(i) ? 1 : 0,
                transform: visible.includes(i) ? "translateY(0)" : "translateY(20px)",
                transition: "opacity 0.4s ease, transform 0.4s ease"
              }}>
                {/* Top shimmer line */}
                <div style={{
                  position: "absolute", top: 0, left: "15%", right: "15%", height: 1,
                  background: "linear-gradient(90deg, transparent, rgba(0,200,255,0.55), transparent)"
                }} />

                {/* Blueprint corner marks */}
                <div style={{ position: "absolute", top: 12, left: 12, width: 10, height: 10, borderTop: "1px solid rgba(0,200,255,0.25)", borderLeft: "1px solid rgba(0,200,255,0.25)" }} />
                <div style={{ position: "absolute", top: 12, right: 40, width: 10, height: 10, borderTop: "1px solid rgba(0,200,255,0.25)", borderRight: "1px solid rgba(0,200,255,0.25)" }} />

                {/* Card number */}
                <div style={{
                  position: "absolute", top: 18, right: 18,
                  width: 26, height: 26, borderRadius: "50%",
                  border: "1px solid rgba(0,200,255,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "rgba(0,200,255,0.55)", fontSize: 11, fontWeight: 700
                }}>{i + 1}</div>

                <div style={{ fontSize: 38, marginBottom: 16, lineHeight: 1 }}>{idea.emoji}</div>

                <h3 style={{ color: "#fff", fontSize: 19, fontWeight: 700, margin: "0 0 10px", letterSpacing: "-0.3px" }}>
                  {idea.name}
                </h3>

                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13.5, lineHeight: 1.65, margin: "0 0 24px" }}>
                  {idea.useCase}
                </p>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {/* Difficulty */}
                  <span style={{
                    padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                    background: `${diffColor(idea.difficulty)}12`,
                    border: `1px solid ${diffColor(idea.difficulty)}35`,
                    color: diffColor(idea.difficulty)
                  }}>{idea.difficulty}</span>

                  {/* Print time */}
                  <span style={{
                    padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                    background: "rgba(255,157,0,0.09)", border: "1px solid rgba(255,157,0,0.28)", color: "#ff9d00"
                  }}>🕒 {idea.printTime}</span>

                  {/* Filament */}
                  <span style={{
                    padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.55)"
                  }}>🎨 {idea.filament}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div style={{ textAlign: "center", display: "flex", gap: 12, justifyContent: "center" }}>
            <button onClick={() => generate(last)} style={{
              padding: "11px 26px",
              background: "rgba(0,200,255,0.07)", border: "1px solid rgba(0,200,255,0.25)",
              borderRadius: 12, color: "#00c8ff", fontSize: 14, fontWeight: 600, cursor: "pointer"
            }}>↺ Regenerate</button>
            <button onClick={() => { setInput(""); setIdeas([]); setLast(""); }} style={{
              padding: "11px 26px",
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12, color: "rgba(255,255,255,0.5)", fontSize: 14, fontWeight: 600, cursor: "pointer"
            }}>✦ New Idea</button>
          </div>
        </>
      )}

      {/* Empty state */}
      {!loading && ideas.length === 0 && !error && (
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <div style={{ fontSize: 56, marginBottom: 16, opacity: 0.4 }}>🖨️</div>
          <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 14 }}>Your 3D print ideas will appear here</p>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(255,255,255,0.22); }
        button:hover:not(:disabled) { opacity: 0.85 !important; }
      `}</style>
    </div>
  );
}
