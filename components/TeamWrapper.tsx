"use client";
import React, { createContext, useContext, useEffect } from "react";
import { teamMeta } from "../app/utils/teamMeta";

interface TeamColors {
  primary: string;
  secondary: string;
  alternate: string;
}

const TeamColorsContext = createContext<TeamColors>({
  primary: "#ec4899",     // default pink
  secondary: "#22d3ee",   // default cyan
  alternate: "#1e293b",   // default dark blue-gray for hover fallback
});

export function useTeamColors() {
  return useContext(TeamColorsContext);
}

interface TeamWrapperProps {
  teamSlug: string;
  children: React.ReactNode;
}

export default function TeamWrapper({ teamSlug, children }: TeamWrapperProps) {
  const teamInfo = teamMeta[teamSlug];
  const primary = teamInfo?.colors.primary || "#ec4899";
  const secondary = teamInfo?.colors.secondary || "#22d3ee";
  const alternate = teamInfo?.colors.alternate || "#1e293b"; // ✅ include this

  useEffect(() => {
    document.body.style.backgroundColor = "#0a0a0a";
    document.body.style.color = "#ffffff";

    document.documentElement.style.setProperty("--team-primary", primary);
    document.documentElement.style.setProperty("--team-secondary", secondary);

    return () => {
      document.body.style.backgroundColor = "";
      document.body.style.color = "";
      document.documentElement.style.removeProperty("--team-primary");
      document.documentElement.style.removeProperty("--team-secondary");
    };
  }, [primary, secondary]);

  return (
    <TeamColorsContext.Provider value={{ primary, secondary, alternate }}>
      {children}
    </TeamColorsContext.Provider>
  );
}
