import { useEffect } from "react";

const RESET_DELAY_MS = 5000;

function TicketConfirmation({ ticket, serviceName, onDone }) {
  // The kiosk is used by one person after another: go back automatically.
  useEffect(() => {
    const timer = setTimeout(onDone, RESET_DELAY_MS);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <section className="ticket">
      <p className="ticket__label">Your ticket number</p>
      <p className="ticket__code">{ticket.code}</p>
      <p className="ticket__service">{serviceName}</p>
    </section>
  );
}

export default TicketConfirmation;
