import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};

export const contentType = "image/png";

/** Gather tab icon - black circle with signature "+" */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#000000",
          borderRadius: "50%",
          color: "#FF60AA",
          fontSize: 22,
          fontWeight: 700,
          lineHeight: 1,
        }}
      >
        +
      </div>
    ),
    { ...size }
  );
}
