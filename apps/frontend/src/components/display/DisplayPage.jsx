import { currentCalls } from "../../pages/currentCalls";
import Logo from "../Logo";
import CounterCard from "./CounterCard";
import "./DisplayPage.css";

function DisplayPage() {
  // TODO: load the calls from GET /api/counters/current and refresh them
  // every few seconds, since nobody touches the board.
  const counters = currentCalls;

  return (
    <main className="display">
      <header className="display__header">
        <Logo />
        <h1 className="display__title">Now serving</h1>
      </header>

      <section className="display__grid">
        {counters.map((counter) => (
          <CounterCard key={counter.id_counter} counter={counter} />
        ))}
      </section>
    </main>
  );
}

export default DisplayPage;
