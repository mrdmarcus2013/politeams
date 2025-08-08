"use client";

import { useFRED } from "@hooks/useFRED";

export default function NationalDebtWidget() {
  const { value, error } = useFRED("GFDEBTN");

  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="text-lg font-bold">💰 US National Debt</h3>
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <p>
          {value
            ? `$${Number(value).toLocaleString()} Billion`
            : "Loading…"}
        </p>
      )}
    </div>
  );
}
