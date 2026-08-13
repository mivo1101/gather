"use client";

import { useEffect, useState } from "react";

export function SettingsSaveFeedback({
  message,
  tone = "success",
}: {
  message: string;
  tone?: "success" | "error";
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (tone === "error") return;
    const timer = window.setTimeout(() => setVisible(false), 10_000);
    return () => window.clearTimeout(timer);
  }, [tone]);

  if (!visible) return null;

  return (
    <p
      className={`text-xs font-semibold ${
        tone === "error" ? "text-red-600" : "text-signature"
      }`}
      role={tone === "error" ? "alert" : "status"}
    >
      {message}
    </p>
  );
}
