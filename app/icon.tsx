import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 20,
          background: "#1b4332",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fef08a",
          borderRadius: "6px",
          border: "2px dashed #fef08a",
        }}
      >
        ✏️
      </div>
    ),
    { ...size }
  );
}
