import { useEffect, useState } from "react";

function pad(n) {
  return String(n).padStart(2, "0");
}

// Time passed since `since` (an ISO time), e.g. "08:42", updated every second.
// Returns null when `since` is not known.
export function useElapsedTime(since) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!since) {
      return undefined;
    }
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [since]);

  if (!since) {
    return null;
  }
  // The computer's clock may be a little behind the server's.
  const seconds = Math.max(0, Math.floor((now - Date.parse(since)) / 1000));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds % 60)}`
    : `${pad(minutes)}:${pad(seconds % 60)}`;
}
