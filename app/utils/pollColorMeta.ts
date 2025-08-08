// app/utils/pollColorMeta.ts

export const pollColorMeta: Record<
  string,
  {
    text: string;
    border: string;
    background: string;
    contentBackground: string;
    contentText: string;
  }
> = {
  pinkCyan: {
    text: "#ec4899", // pink-500
    border: "#22d3ee", // cyan-400
    background: "#0a0a0a", // black bg
    contentBackground: "#111827", // slate-900
    contentText: "#f9fafb", // gray-50
  },
  cyanPink: {
    text: "#22d3ee", // cyan-400
    border: "#ec4899", // pink-500
    background: "#0a0a0a",
    contentBackground: "#0f172a", // slate-950
    contentText: "#f0fdfa", // cyan-50
  },
  orangePurple: {
    text: "#f97316", // orange-500
    border: "#9333ea", // purple-600
    background: "#0a0a0a",
    contentBackground: "#1c1917", // stone-900
    contentText: "#fefce8", // yellow-50
  },
  purpleOrange: {
    text: "#9333ea", // purple-600
    border: "#f97316", // orange-500
    background: "#0a0a0a",
    contentBackground: "#18181b", // zinc-900
    contentText: "#faf5ff", // purple-50
  },
  limeBlue: {
    text: "#84cc16", // lime-500
    border: "#3b82f6", // blue-500
    background: "#0a0a0a",
    contentBackground: "#0f172a", // slate-950
    contentText: "#f0fdf4", // green-50
  },
  blueLime: {
    text: "#3b82f6",
    border: "#84cc16",
    background: "#0a0a0a",
    contentBackground: "#1e3a8a", // blue-900
    contentText: "#f0f9ff", // blue-50
  },
  redYellow: {
    text: "#ef4444",
    border: "#facc15",
    background: "#0a0a0a",
    contentBackground: "#7f1d1d", // red-900
    contentText: "#fef2f2", // red-50
  },
  yellowRed: {
    text: "#facc15",
    border: "#ef4444",
    background: "#0a0a0a",
    contentBackground: "#422006", // amber-900
    contentText: "#fffbeb", // amber-50
  },
  tealPink: {
    text: "#14b8a6",
    border: "#ec4899",
    background: "#0a0a0a",
    contentBackground: "#042f2e", // teal-950
    contentText: "#f0fdfa", // teal-50
  },
  default: {
    text: "#22d3ee",
    border: "#ec4899",
    background: "#0a0a0a",
    contentBackground: "#111827", // slate-900
    contentText: "#f9fafb", // gray-50
  },
};
