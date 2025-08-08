"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [nameAvailable, setNameAvailable] = useState<boolean | null>(null);
  const [checkingName, setCheckingName] = useState(false);

  // 🔍 Check username availability with debounce
  useEffect(() => {
    const delay = setTimeout(() => {
      if (!name || name.length < 3) {
        setNameAvailable(null);
        return;
      }

      setCheckingName(true);
      fetch("/api/onboarding/username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, checkOnly: true }),
      })
        .then((res) => {
          setNameAvailable(res.ok);
        })
        .catch(() => setNameAvailable(null))
        .finally(() => setCheckingName(false));
    }, 500);

    return () => clearTimeout(delay);
  }, [name]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nameAvailable) {
      setError("Username is already taken or invalid.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/onboarding/username", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.user.email,
        password: data.user.password,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.replace("/onboarding");
      }
    } else {
      setError(data.error || "Something went wrong.");
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-black text-center p-6">
      {/* Title */}
      <div className="mb-10">
        <h1 className="relative text-5xl md:text-7xl font-extrabold tracking-wide text-pink-500">
          POLIT
          <span className="relative inline-block">
            <span className="relative text-pink-500 z-0">ICS</span>
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
        <p className="uppercase text-lg md:text-2xl text-cyan-400 font-semibold mt-4">
          Create your account
        </p>
      </div>

      {/* Error Message */}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Signup Form */}
      <form
        onSubmit={handleSignup}
        className="flex flex-col gap-4 w-full max-w-sm bg-gray-900/80 p-6 rounded-lg shadow-[0_0_20px_rgba(236,72,153,0.5)]"
      >
        {/* Username Field */}
        <div className="relative">
          <input
            type="text"
            placeholder="User Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={`p-3 rounded bg-black border ${
              nameAvailable === false
                ? "border-red-500"
                : nameAvailable === true
                ? "border-green-500"
                : "border-pink-500/50"
            } text-white focus:outline-none`}
          />
          {checkingName && (
            <p className="text-xs text-gray-400 mt-1">Checking availability...</p>
          )}
          {name && nameAvailable === false && (
            <p className="text-xs text-red-400 mt-1">Username is taken.</p>
          )}
          {name && nameAvailable === true && (
            <p className="text-xs text-green-400 mt-1">Username is available!</p>
          )}
        </div>

        {/* Email Field */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="p-3 rounded bg-black border border-pink-500/50 text-white focus:outline-none focus:border-pink-500"
        />

        {/* Password Field */}
        <input
          type="password"
          placeholder="Password (min 6 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="p-3 rounded bg-black border border-pink-500/50 text-white focus:outline-none focus:border-pink-500"
        />

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || checkingName || nameAvailable === false}
          className="w-full px-6 py-3 border-2 border-pink-500 text-pink-500 text-lg font-bold uppercase rounded hover:bg-pink-500 hover:text-black transition-all shadow-[0_0_15px_rgba(236,72,153,0.8)] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? "Creating..." : "Sign Up"}
        </button>
      </form>
    </main>
  );
}
