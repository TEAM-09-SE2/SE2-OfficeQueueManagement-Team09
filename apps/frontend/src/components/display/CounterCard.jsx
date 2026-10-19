function CounterCard({ counter, justCalled }) {
  const isFree = counter.ticket_code === null;

  let className = "call-card";
  if (isFree) {
    className += " call-card--free";
  } else if (justCalled) {
    className += " call-card--called";
  }

  return (
    <article className={className}>
      {justCalled && !isFree && (
        <p className="call-card__badge">Now calling</p>
      )}
      <p className="call-card__counter">Counter {counter.id_counter}</p>
      <p className="call-card__code">{isFree ? "—" : counter.ticket_code}</p>
      <p className="call-card__service">
        {isFree ? "Free" : counter.service_name}
      </p>
    </article>
  );
}

export default CounterCard;
