import { useEffect, useState } from "react";

export function useFRED(seriesId: string) {
  const [value, setValue] = useState<string>("Loading…");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/fred?series_id=${seriesId}`);
        const data = await res.json();

        if (data?.value) {
          setValue(data.value);
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
  }, [seriesId]);

  return { value, error };
}
