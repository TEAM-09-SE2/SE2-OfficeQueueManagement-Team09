import { useEffect, useState } from "react";
import { getCurrentCalls } from "../../api/counters";

const REFRESH_INTERVAL_MS = 3000;

// Returns the ticket each counter is serving, reloaded every few seconds
// because nobody touches the board. While the backend cannot be reached,
// `offline` is true and the last calls received stay on screen.
export function useCurrentCalls() {
  const [calls, setCalls] = useState([]);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function refresh() {
      try {
        const rows = await getCurrentCalls(controller.signal);
        setCalls(rows);
        setOffline(false);
      } catch (err) {
        if (err.name !== "AbortError") {
          setOffline(true);
        }
      }
    }

    refresh();
    const timer = setInterval(refresh, REFRESH_INTERVAL_MS);
    return () => {
      controller.abort();
      clearInterval(timer);
    };
  }, []);

  return { calls, offline };
}
