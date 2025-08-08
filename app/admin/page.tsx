"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // 🔹 Redirect users who aren't admins or not logged in
  useEffect(() => {
    // Only run redirect logic when session is done loading
    if (status !== "loading") {
      // If user is not logged in OR not an admin, send them back to dashboard
      if (!session?.user || session.user.role !== "ADMIN") {
        router.replace("/dashboard");
      }
    }
  }, [session, status, router]);

  // 🔹 Show loading message while session is being validated
  if (status === "loading") {
    return <p className="p-4">Loading...</p>;
  }

  // 🔹 If user isn't an admin (redirect is in progress), don't render anything
  if (!session?.user || session.user.role !== "ADMIN") {
    return null;
  }

  // 🔹 Render the Admin Dashboard UI
  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 p-6">
      {/* Page Header */}
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p className="text-gray-600">Welcome, {session.user.email}</p>

      {/* Navigation Links */}
      <div className="flex flex-col gap-4 mt-6">
        {/* Manage Polls */}
        <a
          href="/admin/polls"
          className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600"
        >
          Manage Polls
        </a>

        {/* View Onboarding Answers */}
        <a
          href="/admin/onboarding"
          className="bg-green-500 text-white px-6 py-3 rounded hover:bg-green-600"
        >
          View Onboarding Answers
        </a>
      
      <div className="w-full flex justify-center mt-6">
        <button
            onClick={() => router.push("/dashboard")}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
        >
            ⬅ Back
        </button>
        </div>


      </div>
    </main>
  );
}
