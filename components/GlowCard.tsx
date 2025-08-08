"use client";
import React from "react";

interface GlowCardProps {
    title: string;
    borderColor: string;
    titleColor: string;
    children: React.ReactNode;
}

export default function GlowCard({
    title,
    borderColor,
    titleColor,
    children,
}: GlowCardProps) {
    return (
        <div
            className="p-4 rounded-lg border-2 mb-6"
            style={{
                borderColor,
                boxShadow: `0 0 15px ${borderColor}`,
                backgroundColor: "#0a0a0a",
            }}
        >
            <h3 className="text-xl font-bold mb-4" style={{ color: titleColor }}>
                {title}
            </h3>
            <div className="text-gray-200">{children}</div>
        </div>
    );
}
