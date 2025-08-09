// components/HeaderBar.tsx
"use client";

import Image from "next/image";
import { useSession } from "next-auth/react";
import { teamMeta } from "@/app/utils/teamMeta";

export default function HeaderBar() {
    const { data } = useSession();
    const user = data?.user;
    const teamSlug = user?.teamSlug ?? undefined;
    const meta = teamSlug ? teamMeta[teamSlug as keyof typeof teamMeta] : undefined;

    const primary = meta?.colors.primary ?? "#EC4899";   // pink fallback
    const text = meta?.colors.textColor ?? "#FFFFFF";

    return (
        <header className="sticky top-0 z-40 bg-black border-b border-gray-800">
            <div className="mx-auto w-full max-w-3xl px-4 py-3 flex items-center gap-3">
                {/* Team logo */}
                {meta?.logo && (
                    <div className="shrink-0">
                        {/* Using next/image for crisp render; adjust sizes as needed */}
                        <Image
                            src={meta.logo}
                            alt={meta.nickname}
                            width={40}
                            height={40}
                            className="object-contain"
                            priority
                        />
                    </div>
                )}

                {/* Title */}
                <div className="flex-1">
                    <h1 className="relative text-3xl md:text-4xl font-extrabold tracking-wide text-pink-500 leading-tight">
                        POLIT
                        <span className="relative inline-block">
                            <span className="relative text-pink-500 z-0">ICS</span>
                            <span
                                className="absolute text-cyan-400 font-handwriting z-30 inset-0 flex items-center justify-center"
                                style={{ transform: "rotate(-5deg) translate(28%, -18%)" }}
                            >
                                eams
                            </span>
                        </span>
                    </h1>

                    {/* User name, rank title, description (multi-line) */}
                    <div className="mt-1 text-[13px] leading-snug" style={{ color: text }}>
                        <div className="italic text-gray-300">{user?.name ?? "user name"}</div>
                        <div className="italic" style={{ color: primary }}>
                            {user?.rank?.title ?? "rank name"}
                        </div>
                        {user?.rank?.description && (
                            <div className="italic text-yellow-300/90">
                                {user.rank.description}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* subtle divider glow */}
            <div
                className="h-[2px] w-full"
                style={{ background: `linear-gradient(90deg, transparent, ${primary}, transparent)` }}
            />
        </header>
    );
}
