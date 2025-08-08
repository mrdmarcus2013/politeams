"use client";

import { useFRED } from "@hooks/useFRED";

export default function UnemploymentWidget() {
  const { value, error } = useFRED("UNRATE");

  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="text-lg font-bold">📉 US Unemployment Rate</h3>
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <p>{value ? `${value}%` : "Loading…"}</p>
      )}
    </div>
  );
}
