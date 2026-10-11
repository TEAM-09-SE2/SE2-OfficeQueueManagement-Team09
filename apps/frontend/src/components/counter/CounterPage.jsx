import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import Logo from "../Logo";
import { callNextCustomer } from "../../api/counters";
import ServicesCard from "./ServicesCard";
import ServingCard from "./ServingCard";
import { useCounter } from "./useCounter";
import "./CounterPage.css";

// Officer's dashboard of one counter (Next customer story, Figma "Counter
// Dashboard"). Only what the stories need and the API provides is shown.
function CounterPage() {
  const { id } = useParams();
  const counter = useCounter(id);
  const [calling, setCalling] = useState(false);
  // Shown in the card: { type: "info" | "error", text }
  const [message, setMessage] = useState(null);
  // Read aloud by screen readers when the officer calls the next customer.
  const [announcement, setAnnouncement] = useState("");
  const counterLabel = String(id).padStart(2, "0");

  async function handleCallNext() {
    setCalling(true);
    setMessage(null);
    try {
      const ticket = await callNextCustomer(id);
      if (ticket) {
        counter.updateCurrent(ticket);
        setAnnouncement(`Now serving ticket ${ticket.code}, ${ticket.service_name}.`);
      } else {
        // The previous customer, if any, has been marked as served.
        counter.updateCurrent(null);
        setMessage({ type: "info", text: "No customers are waiting for your services." });
        setAnnouncement("No customers are waiting.");
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setCalling(false);
    }
  }

  const serviceTime = counter.current
    ? counter.services.find((service) => service.name === counter.current.service_name)
        ?.processing_time
    : undefined;

  return (
    <div className="counter">
      <aside className="counter__sidebar">
        <Logo />

        <div className="counter__profile">
          <span className="counter__avatar" aria-hidden="true">
            {counterLabel}
          </span>
          <div>
            <p className="counter__profile-name">Counter {id}</p>
            <Link className="counter__change" to="/counter">
              Change counter
            </Link>
          </div>
        </div>

      </aside>

      <div className="counter__content">
        <header className="counter__topbar">
          <h1 className="counter__topbar-title">Counter Dashboard</h1>
          <p className="counter__topbar-subtitle">Counter {counterLabel}</p>
        </header>

        <main className="counter__main">
          <div className="counter__welcome">
            <h2 className="counter__welcome-title">Welcome to Counter {id}</h2>
            <p className="counter__welcome-text">Call the next customer when you are ready.</p>
          </div>

          {counter.status === "loading" && <p className="counter__notice">Loading the counter…</p>}

          {counter.status === "not-found" && (
            <div className="counter__notice counter__notice--error" role="alert">
              <p>Counter {id} does not exist.</p>
              <Link to="/counter">Choose another counter</Link>
            </div>
          )}

          {counter.status === "error" && (
            <div className="counter__notice counter__notice--error" role="alert">
              <p>{counter.error}</p>
              <button type="button" className="counter__retry" onClick={counter.reload}>
                Try again
              </button>
            </div>
          )}

          {counter.status === "ready" && (
            <div className="counter__grid">
              <ServingCard
                ticket={counter.current}
                serviceTime={serviceTime}
                message={message}
                calling={calling}
                onCallNext={handleCallNext}
              />
              <ServicesCard services={counter.services} />
            </div>
          )}

          <p className="visually-hidden" aria-live="polite">
            {announcement}
          </p>
        </main>
      </div>
    </div>
  );
}

export default CounterPage;
