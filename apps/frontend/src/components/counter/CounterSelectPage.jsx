import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../Logo";
import "./CounterPage.css";

// The officer types the number of their counter. Each workstation can also
// bookmark its own page, e.g. /counter/3.
function CounterSelectPage() {
  const [number, setNumber] = useState("");
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();
    navigate(`/counter/${number}`);
  }

  return (
    <main className="counter-select">
      <Logo />
      <form className="counter-select__card" onSubmit={handleSubmit}>
        <h1 className="counter-select__title">Counter Dashboard</h1>
        <label className="counter-select__label" htmlFor="counter-number">
          Your counter number
        </label>
        <input
          id="counter-number"
          className="counter-select__input"
          type="number"
          inputMode="numeric"
          min="1"
          step="1"
          required
          value={number}
          onChange={(event) => setNumber(event.target.value)}
        />
        <button type="submit" className="counter-select__open">
          Open counter
        </button>
      </form>
    </main>
  );
}

export default CounterSelectPage;
