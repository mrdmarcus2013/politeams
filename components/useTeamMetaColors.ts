// components/useTeamMetaColors.ts
import { teamMeta } from "@/app/utils/teamMeta";

export function useTeamMetaColors(slug?: string | null) {
    const meta = slug ? teamMeta[slug as keyof typeof teamMeta] : undefined;
    const bg = meta?.colors.primary ?? "#111827";      // dark fallback
    const text = meta?.colors.textColor ?? "#FFFFFF";  // light text fallback
    return { bg, text };
}
