import { useElapsedTime } from "./useElapsedTime";

// Time in the office time zone, e.g. "14:22".
function formatTime(isoTime) {
  return new Date(isoTime).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Rome",
  });
}

// The ticket the counter is serving (Figma "Currently serving" card), with
// the button that calls the next customer.
function ServingCard({ ticket, serviceTime, message, calling, onCallNext }) {
  const serving = ticket !== null;
  const elapsed = useElapsedTime(serving ? ticket.served_at : null);

  let badgeClassName = "serving-card__badge";
  if (!serving) {
    badgeClassName += " serving-card__badge--idle";
  }

  let codeClassName = "serving-card__code";
  if (!serving) {
    codeClassName += " serving-card__code--empty";
  }

  let infoClassName = "serving-card__info";
  if (message?.type === "error") {
    infoClassName += " serving-card__info--error";
  }

  // Calling the next customer also marks the current one as served (Notify
  // customer served story), so the officer is told before pressing.
  let info = "Press Next ticket to call the next customer.";
  if (message) {
    info = message.text;
  } else if (serving) {
    info = `Next ticket marks ${ticket.code} as served and calls the next customer.`;
  }

  return (
    <section className="serving-card" aria-label="Currently serving">
      <div className="serving-card__ticket">
        <p className={badgeClassName}>{serving ? "Currently serving" : "No customer"}</p>
        <p className="serving-card__label">Ticket number</p>
        <p className={codeClassName}>{serving ? ticket.code : "—"}</p>
      </div>

      <div className="serving-card__details">
        <p className="serving-card__details-title">Service details</p>
        {serving ? (
          <>
            <p className="serving-card__service">{ticket.service_name}</p>
            {serviceTime !== undefined && (
              <p className="serving-card__meta">Service time: {serviceTime} min</p>
            )}
            {ticket.served_at && (
              <p className="serving-card__meta">Called at {formatTime(ticket.served_at)}</p>
            )}
            {elapsed && (
              <p className="serving-card__timer">
                <span aria-hidden="true">⏱ </span>
                <span className="visually-hidden">Serving for </span>
                {elapsed}
              </p>
            )}
          </>
        ) : (
          <p className="serving-card__meta">Nobody is at the counter.</p>
        )}
      </div>

      <p className={infoClassName} role={message?.type === "error" ? "alert" : undefined}>
        {info}
      </p>

      <button
        type="button"
        className="serving-card__next"
        onClick={onCallNext}
        disabled={calling}
        aria-busy={calling}
      >
        <span>{calling ? "Calling…" : "Next ticket"}</span>
        <span className="serving-card__arrow" aria-hidden="true">
          →
        </span>
      </button>
    </section>
  );
}

export default ServingCard;
