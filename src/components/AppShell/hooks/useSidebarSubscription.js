import { useEffect, useState } from "react";
import { getMySubscription } from "../../../api/subscription.api.js";

export default function useSidebarSubscription({ enabled, pathname, userId }) {
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    if (!enabled || !userId) {
      setSubscription(null);
      return undefined;
    }

    let active = true;

    const loadSubscription = async () => {
      try {
        const data = await getMySubscription();
        if (active) setSubscription(data);
      } catch {
        if (active) setSubscription(null);
      }
    };

    void loadSubscription();
    window.addEventListener("subscription:refresh", loadSubscription);

    return () => {
      active = false;
      window.removeEventListener("subscription:refresh", loadSubscription);
    };
  }, [enabled, pathname, userId]);

  return subscription;
}
