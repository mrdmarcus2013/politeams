"use client";
import React from "react";
import { useTeamColors } from "./TeamWrapper";

interface PollCardProps {
  title: string;
  variant?: "primary" | "secondary" | "default";
  /** Optional override for border + glow color (e.g., winner team color) */
  glowColor?: string;
  /** Optional override for the title text color */
  titleColor?: string;
  children: React.ReactNode;
}

export default function PollCard({
  title,
  variant = "primary",
  glowColor,
  titleColor,
  children,
}: PollCardProps) {
  const { primary, secondary } = useTeamColors();

  const defaultBorderColor = variant === "secondary" ? secondary : primary;
  const borderColor = glowColor || defaultBorderColor;
  const headerColor =
    titleColor || (variant === "secondary" ? primary : secondary);

  return (
    <div
      className="p-4 rounded-lg border-2 mb-6"
      style={{
        borderColor,
        boxShadow: `0 0 15px ${borderColor}`,
        backgroundColor: "#0a0a0a",
      }}
    >
      <h3 className="text-xl font-bold mb-4" style={{ color: headerColor }}>
        {title}
      </h3>
      <div className="text-gray-200">{children}</div>
    </div>
  );
}
