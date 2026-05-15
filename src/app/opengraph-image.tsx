import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "על אוטומט — אוטומציות, בוטים ו-AI לעסקים";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const heebo = await fetch(
    "https://fonts.gstatic.com/s/heebo/v26/NGSpv5_NC0k9P9H2zQFoqf8e4janYA.woff2"
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#2e1e45",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Heebo, sans-serif",
        }}
      >
        <div style={{ color: "#7a59a5", fontSize: 26, marginBottom: 20 }}>
          al-automat.co.il
        </div>
        <div
          style={{
            color: "white",
            fontSize: 96,
            fontWeight: 700,
            lineHeight: 1.1,
          }}
        >
          על אוטומט
        </div>
        <div
          style={{
            color: "#c4b0e0",
            fontSize: 38,
            marginTop: 20,
          }}
        >
          אוטומציות, בוטים ו-AI לעסקים
        </div>
        <div
          style={{
            display: "flex",
            gap: 14,
            marginTop: 52,
          }}
        >
          {["אוטומציות", "בוטים", "CRM", "תהליכי AI", "Claude Code"].map(
            (tag) => (
              <div
                key={tag}
                style={{
                  background: "rgba(122, 89, 165, 0.25)",
                  border: "1px solid #7a59a5",
                  borderRadius: 8,
                  padding: "8px 22px",
                  color: "#c4b0e0",
                  fontSize: 22,
                }}
              >
                {tag}
              </div>
            )
          )}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Heebo", data: heebo, style: "normal", weight: 700 },
      ],
    }
  );
}
