function CounterCard({ counter }) {
  const isFree = counter.ticket_code === null;

  return (
    <article className={isFree ? "call-card call-card--free" : "call-card"}>
      <p className="call-card__counter">Counter {counter.id_counter}</p>
      <p className="call-card__code">{isFree ? "—" : counter.ticket_code}</p>
      <p className="call-card__service">
        {isFree ? "Free" : counter.service_name}
      </p>
    </article>
  );
}

export default CounterCard;
