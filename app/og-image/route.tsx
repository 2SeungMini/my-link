import { ImageResponse } from "next/og";

export const runtime = "edge";

const size = {
  width: 1200,
  height: 630,
};

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f7f8f8",
          color: "#111827",
          padding: 64,
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                width: 56,
                height: 56,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#2448e8",
                color: "white",
                fontSize: 30,
                fontWeight: 900,
              }}
            >
              M
            </div>
            <div style={{ display: "flex", fontSize: 36, fontWeight: 900 }}>
              MyLink
            </div>
          </div>
          <div
            style={{
              display: "flex",
              color: "#1557ff",
              fontSize: 28,
              fontWeight: 900,
            }}
          >
            Link Dashboard
          </div>
        </div>

        <div style={{ display: "flex", gap: 48, alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", width: 650 }}>
            <div
              style={{
                display: "flex",
                color: "#1557ff",
                fontSize: 28,
                fontWeight: 900,
                marginBottom: 18,
              }}
            >
              Development in One Link
            </div>
            <div style={{ display: "flex", fontSize: 72, fontWeight: 900, lineHeight: 1.05 }}>
              Share every link.
            </div>
            <div style={{ display: "flex", fontSize: 72, fontWeight: 900, lineHeight: 1.05 }}>
              Track every click.
            </div>
            <div
              style={{
                display: "flex",
                color: "#4b5563",
                fontSize: 30,
                fontWeight: 700,
                lineHeight: 1.35,
                marginTop: 28,
              }}
            >
              Manage profile links, public URLs, and click analytics in a clean
              developer-focused page.
            </div>
          </div>

          <div
            style={{
              width: 360,
              display: "flex",
              flexDirection: "column",
              background: "white",
              border: "2px solid #dcdfe4",
              boxShadow: "0 24px 54px rgba(15,23,42,0.14)",
              padding: 26,
              gap: 18,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div
                style={{
                  width: 62,
                  height: 62,
                  borderRadius: 31,
                  background: "#ff914d",
                }}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", fontSize: 28, fontWeight: 900 }}>
                  Your Name
                </div>
                <div
                  style={{
                    display: "flex",
                    color: "#6b7280",
                    fontSize: 20,
                    fontWeight: 800,
                  }}
                >
                  @your-url
                </div>
              </div>
            </div>
            {["GitHub", "Blog", "Portfolio"].map((label, index) => (
              <div
                key={label}
                style={{
                  height: 64,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "#fbfbfc",
                  border: "2px solid #e5e7eb",
                  padding: "0 18px",
                  fontSize: 22,
                  fontWeight: 900,
                }}
              >
                <span>{label}</span>
                <span style={{ color: "#1557ff", fontSize: 18 }}>
                  {12 - index * 4} clicks
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 16 }}>
          {["Link management", "Click analytics", "Personal URL"].map((label) => (
            <div
              key={label}
              style={{
                display: "flex",
                background: "white",
                border: "2px solid #dcdfe4",
                padding: "16px 22px",
                fontSize: 24,
                fontWeight: 900,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
