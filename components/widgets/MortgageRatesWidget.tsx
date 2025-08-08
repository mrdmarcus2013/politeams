"use client";

import { useFRED } from "@hooks/useFRED";

export default function MortgageRatesWidget() {
  const { value, error } = useFRED("MORTGAGE30US");

  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="text-lg font-bold">🏠 30-Year Mortgage Rate</h3>
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <p>{value ? `${value}%` : "Loading…"}</p>
      )}
    </div>
  );
}
