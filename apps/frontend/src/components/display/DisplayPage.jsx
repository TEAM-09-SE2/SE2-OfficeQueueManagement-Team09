import { useEffect, useRef, useState } from "react";
import Logo from "../Logo";
import { enableSound, isSoundEnabled, playChime } from "./chime";
import CounterCard from "./CounterCard";
import { useCurrentCalls } from "./useCurrentCalls";
import "./DisplayPage.css";

const HIGHLIGHT_MS = 8000;

function DisplayPage() {
  const { calls: counters, offline } = useCurrentCalls();

  const [calledIds, setCalledIds] = useState([]);
  const [soundOn, setSoundOn] = useState(false);
  const previousCodes = useRef(null);

  // The audio is already allowed on some setups (e.g. a browser in kiosk mode).
  useEffect(() => {
    setSoundOn(isSoundEnabled());
  }, []);

  // A counter whose ticket code changed has just called a customer:
  // highlight its card for a while and play the chime.
  useEffect(() => {
    if (counters.length === 0) {
      // Nothing loaded yet.
      return;
    }
    const previous = previousCodes.current;
    previousCodes.current = new Map(
      counters.map((counter) => [counter.id_counter, counter.ticket_code]),
    );
    if (previous === null) {
      // First load: these tickets were called before the board was opened.
      return;
    }

    const newlyCalled = counters
      .filter(
        (counter) =>
          counter.ticket_code !== null &&
          previous.get(counter.id_counter) !== counter.ticket_code,
      )
      .map((counter) => counter.id_counter);
    if (newlyCalled.length === 0) {
      return;
    }

    playChime();
    setCalledIds((ids) => [...new Set([...ids, ...newlyCalled])]);
    setTimeout(() => {
      setCalledIds((ids) => ids.filter((id) => !newlyCalled.includes(id)));
    }, HIGHLIGHT_MS);
  }, [counters]);

  async function handleEnableSound() {
    const enabled = await enableSound();
    setSoundOn(enabled);
    if (enabled) {
      playChime();
    }
  }

  return (
    <main className="display">
      <header className="display__header">
        <Logo />
        {!soundOn && (
          <button
            type="button"
            className="display__sound"
            onClick={handleEnableSound}
          >
            Enable sound
          </button>
        )}
        <h1 className="display__title">Now serving</h1>
      </header>

      <section className="display__grid">
        {counters.map((counter) => (
          <CounterCard
            key={counter.id_counter}
            counter={counter}
            justCalled={calledIds.includes(counter.id_counter)}
          />
        ))}
      </section>
      {offline && (
        <p className="display__offline" role="status">
          Connection lost. Retrying…
        </p>
      )}
    </main>
  );
}

export default DisplayPage;
