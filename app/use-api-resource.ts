"use client";

import { useCallback, useEffect, useState } from "react";
import { api, getApiError } from "./api-client";

export function useApiResource<T>(url: string, initial: T) {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get<T>(url);
      setData(response.data);
    } catch (requestError) {
      setError(getApiError(requestError, "Unable to load this data."));
    } finally {
      setLoading(false);
    }
  }, [url]);
  useEffect(() => {
    const timer = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);
  return { data, setData, loading, error, refresh };
}
