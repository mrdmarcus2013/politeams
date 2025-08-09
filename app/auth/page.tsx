"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthPage() {
  // The component that *uses* useSearchParams must be inside Suspense
  return (
    <Suspense fallback={<div className="min-h-screen grid place-items-center text-white">Loading…</div>}>
      <AuthInner />
    </Suspense>
  );
}

function AuthInner() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const params = useSearchParams();
  const error = params.get("error");

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (!res?.error) {
      router.push("/dashboard");
    } else {
      console.error(res.error);
      alert("Invalid email or password");
    }
  };

  const handleGoogleLogin = () => {
    signIn("google");
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-black text-center p-6">
      {/* POLITeams Title */}
      <div className="mb-10">
        <h1 className="relative text-5xl md:text-7xl font-extrabold tracking-wide text-pink-500">
          POLIT
          <span className="relative inline-block">
            <span className="relative text-pink-500 z-0">ICS</span>
            {/* eams overlay */}
            <span
              className="absolute text-cyan-400 font-handwriting z-30 inset-0 flex items-center justify-center"
              style={{ transform: "rotate(-5deg) translate(28%, -18%)", fontSize: "inherit" }}
            >
              eams
            </span>
          </span>
        </h1>
        <p className="uppercase text-lg md:text-2xl text-cyan-400 font-semibold mt-4">
          Tell us what you really think
        </p>
      </div>

      {/* Error */}
      {error && <p className="text-red-500 mb-4">Error: {error}</p>}

      {/* Form */}
      <form
        onSubmit={handleCredentialsLogin}
        className="flex flex-col gap-4 w-full max-w-sm bg-gray-900/80 p-6 rounded-lg shadow-[0_0_20px_rgba(236,72,153,0.5)]"
      >
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-3 rounded bg-black border border-pink-500/50 text-white focus:outline-none focus:border-pink-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-3 rounded bg-black border border-pink-500/50 text-white focus:outline-none focus:border-pink-500"
        />
        <button
          type="submit"
          className="w-full px-6 py-3 border-2 border-pink-500 text-pink-500 text-lg font-bold uppercase rounded hover:bg-pink-500 hover:text-black transition-all shadow-[0_0_15px_rgba(236,72,153,0.8)]"
        >
          Sign In
        </button>
      </form>

      {/* Divider */}
      <div className="my-6 text-gray-400">— or —</div>

      {/* Google Sign In */}
      <button
        onClick={handleGoogleLogin}
        className="w-full max-w-sm px-6 py-3 border-2 border-cyan-400 text-cyan-400 text-lg font-bold uppercase rounded hover:bg-cyan-400 hover:text-black transition-all shadow-[0_0_15px_rgba(34,211,238,0.8)]"
      >
        Sign In with Google
      </button>
    </main>
  );
}
