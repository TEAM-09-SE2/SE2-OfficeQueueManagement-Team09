import { useEffect, useState } from "react";
import { currentCalls, simulateCall } from "../../pages/currentCalls";

const FAKE_CALL_INTERVAL_MS = 10000;

// Returns the ticket each counter is serving, kept up to date.
// TODO: when GET /api/counters/current is available, load the calls from it
// every few seconds instead of simulating them. The page does not change.
export function useCurrentCalls() {
  const [state, setState] = useState({ calls: currentCalls, step: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      setState(({ calls, step }) => ({
        calls: simulateCall(calls, step + 1),
        step: step + 1,
      }));
    }, FAKE_CALL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  return state.calls;
}
