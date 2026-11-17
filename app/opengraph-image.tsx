import { ImageResponse } from "next/og";

export const alt = "StaffBase — Система учёта сотрудников компании";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 64,
          background: "#0c2b3e",
          padding: "72px 80px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            width: 220,
            height: 220,
            borderRadius: 40,
            background: "#113a52",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            gap: 14,
            paddingBottom: 44,
            border: "4px solid #1d5679",
          }}
        >
          <div style={{ width: 28, height: 52, background: "#c9a13b", borderRadius: 6 }} />
          <div style={{ width: 28, height: 96, background: "#e8e6e1", borderRadius: 6 }} />
          <div style={{ width: 28, height: 34, background: "#c9a13b", opacity: 0.85, borderRadius: 6 }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ color: "#c9a13b", fontSize: 30, letterSpacing: 4, textTransform: "uppercase" }}>ТОО «DeWorld StaffBase»</div>
          <div style={{ color: "#ffffff", fontSize: 88, fontWeight: 700, marginTop: 16, lineHeight: 1.05 }}>StaffBase</div>
          <div style={{ color: "#e8e6e1", fontSize: 30, marginTop: 18, maxWidth: 640, lineHeight: 1.25, fontFamily: "system-ui, sans-serif" }}>
            Карточки сотрудников, отделы, отпуска и отчётность — без бумажных журналов.
          </div>
        </div>
      </div>
    ),
    size
  );
}
