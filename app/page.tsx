"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";

export default function LandingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session) {
      router.replace("/dashboard");
    }
  }, [status, session, router]);

  if (status === "loading") {
    return <p className="p-4 text-center">Loading...</p>;
  }

  // Base arrays for each column
  const baseLogosCol1 = [
    "/team-logos/krakentsp.png",
    "/team-logos/blazerstsp.png",
    "/team-logos/guardianstsp.png",
    "/team-logos/freeriderstsp.png",
  ];

  const baseLogosCol2 = [
    "/team-logos/marauderstsp.png",
    "/team-logos/cyborgstsp.png",
    "/team-logos/bulwarktsp.png",
    "/team-logos/navigatorstsp.png",
  ];

  // Repeat each list 5×
  const logosCol1 = Array.from({ length: 10 }, () => baseLogosCol1).flat();
  const logosCol2 = Array.from({ length: 10 }, () => baseLogosCol2).flat();

  return (
    <main className="flex flex-col items-center justify-between min-h-screen text-center bg-black">
      {/* Top Section: Title */}
      <div className="relative z-10 flex flex-col items-center gap-4 pt-16 pb-8 bg-black w-full">
        <h1 className="relative text-5xl md:text-7xl font-extrabold tracking-wide text-pink-500">
          POLIT
          <span className="relative inline-block">
            <span className="relative text-pink-500 z-0">ICS</span>
            {/* eams overlay */}
            <span
              className="absolute text-cyan-400 font-handwriting z-30 inset-0 flex items-center justify-center"
              style={{
                transform: "rotate(-5deg) translate(28%, -18%)",
                fontSize: "inherit",
              }}
            >
              eams
            </span>
          </span>
        </h1>
        <p className="uppercase text-lg md:text-2xl text-cyan-400 font-semibold">
          Tell us what you really think
        </p>
      </div>

      {/* Middle Section: Scrolling Columns */}
      <div className="relative w-full flex-1 flex justify-center items-center gap-6 bg-black">
        {/* Column 1 */}
        <div className="overflow-hidden h-[408px] w-[120px] relative">
          <div className="animate-scroll-up-slow flex flex-col gap-6">
            {[...logosCol1, ...logosCol1].map((logo, idx) => (
              <img
                key={`col1-${idx}`}
                src={logo}
                alt={`Left team logo ${idx}`}
                className="w-full h-[120px] object-contain"
              />
            ))}
          </div>
        </div>

        {/* Column 2 */}
        <div className="overflow-hidden h-[408px] w-[120px] relative">
          <div className="animate-scroll-down-slow flex flex-col gap-6">
            {[...logosCol2, ...logosCol2].map((logo, idx) => (
              <img
                key={`col2-${idx}`}
                src={logo}
                alt={`Right team logo ${idx}`}
                className="w-full h-[120px] object-contain"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section: Buttons */}
      <div className="relative z-10 flex flex-col sm:flex-row gap-6 pb-16 bg-black w-full justify-center items-center">
        <button
          onClick={() => router.push("/auth/signup")}
          className="w-[200px] px-8 py-3 border-2 border-pink-500 text-pink-500 text-lg font-bold uppercase rounded hover:bg-pink-500 hover:text-black transition-all shadow-[0_0_15px_rgba(236,72,153,0.8)]"
        >
          Sign Up
        </button>
        <button
          onClick={() => signIn()}
          className="w-[200px] px-8 py-3 border-2 border-cyan-400 text-cyan-400 text-lg font-bold uppercase rounded hover:bg-cyan-400 hover:text-black transition-all shadow-[0_0_15px_rgba(34,211,238,0.8)]"
        >
          Sign In
        </button>
      </div>
    </main>
  );
}
