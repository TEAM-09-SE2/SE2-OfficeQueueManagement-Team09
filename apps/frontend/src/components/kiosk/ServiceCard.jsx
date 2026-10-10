function ServiceCard({ service, meta, onSelect }) {
  return (
    <button
      type="button"
      className="service-card"
      onClick={() => onSelect(service)}
    >
      <span
        className="service-card__icon"
        style={{ background: meta.color }}
        aria-hidden="true"
      >
        {meta.icon}
      </span>
      <span className="service-card__name">{service.name}</span>
      <span className="service-card__description">{meta.description}</span>
      <span className="service-card__time">
        Service time: {service.processing_time} mins
      </span>
    </button>
  );
}

export default ServiceCard;
