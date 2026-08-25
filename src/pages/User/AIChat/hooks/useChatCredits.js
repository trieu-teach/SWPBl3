import { useCallback, useEffect, useRef, useState } from "react";
import { getMySubscription } from "../../../../api/subscription.api.js";
import { normalizeChatCredits } from "../chatCredits.js";

export default function useChatCredits() {
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const generationRef = useRef(0);

  const refresh = useCallback(async () => {
    const generation = ++generationRef.current;
    setLoading(true);
    setError("");

    try {
      const subscription = await getMySubscription();
      if (generation !== generationRef.current) return false;
      setCredits((current) => normalizeChatCredits(subscription, current));
      return true;
    } catch (requestError) {
      if (generation !== generationRef.current) return false;
      setError(requestError?.message || "Không thể tải AI Credits.");
      return false;
    } finally {
      if (generation === generationRef.current) setLoading(false);
    }
  }, []);

  const applyUsage = useCallback((usage) => {
    if (!usage || typeof usage !== "object") return false;
    setCredits((current) => normalizeChatCredits(usage, current));
    setError("");
    setLoading(false);
    return true;
  }, []);

  useEffect(() => {
    void refresh();
    return () => {
      generationRef.current += 1;
    };
  }, [refresh]);

  return { credits, loading, error, refresh, applyUsage };
}
