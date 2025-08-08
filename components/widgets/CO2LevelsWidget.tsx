"use client";

import { useEffect, useState } from "react";

export default function CO2LevelsWidget() {
  const [value, setValue] = useState<string>("Loading…");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/co2");
        const data = await res.json();

        if (data?.value) {
          setValue(`${data.value} ppm`);
        } else {
          setError(data?.error || "No data");
          setValue("");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch");
        setValue("");
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="text-lg font-bold">🌍 CO₂ Levels</h3>
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <p>{value}</p>
      )}
    </div>
  );
}
