import { useCallback, useEffect, useRef, useState } from "react";
import { getCounterServices, getCurrentTicket } from "../../api/counters";

// Loads the services of a counter and the ticket it is serving.
// status is "loading", "ready", "not-found" (unknown or invalid counter) or
// "error" (e.g. the backend is not reachable; reload() tries again).
export function useCounter(counterId) {
  const [state, setState] = useState({ status: "loading", services: [], error: null });
  const [current, setCurrent] = useState(null);
  const [attempt, setAttempt] = useState(0);
  // Once the officer has called a ticket, the page knows better than the
  // initial request, which may still be on its way.
  const currentKnown = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: "loading", services: [], error: null });
    setCurrent(null);
    currentKnown.current = false;

    getCounterServices(counterId, controller.signal)
      .then((services) => setState({ status: "ready", services, error: null }))
      .catch((err) => {
        if (err.name === "AbortError") {
          return;
        }
        const notFound = err.status === 404 || err.status === 400;
        setState({ status: notFound ? "not-found" : "error", services: [], error: err.message });
      });

    // GET /api/counters/current comes with the Call customer story: until it
    // is available the page just doesn't know the current ticket.
    getCurrentTicket(counterId, controller.signal)
      .then((ticket) => {
        if (!currentKnown.current) {
          setCurrent(ticket);
        }
      })
      .catch(() => {});

    return () => controller.abort();
  }, [counterId, attempt]);

  const updateCurrent = useCallback((ticket) => {
    currentKnown.current = true;
    setCurrent(ticket);
  }, []);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);

  return { ...state, current, updateCurrent, reload };
}
