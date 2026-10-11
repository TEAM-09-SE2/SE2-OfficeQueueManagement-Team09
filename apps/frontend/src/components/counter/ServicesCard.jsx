import { getServiceMeta } from "../../pages/kiosk/serviceMeta";

// The services the counter handles (styled like the Figma side cards), with
// the same icons and colours as the kiosk.
function ServicesCard({ services }) {
  return (
    <section className="services-card" aria-labelledby="services-card-label">
      <span className="services-card__icon" aria-hidden="true">
        🗂️
      </span>
      <h2 id="services-card-label" className="services-card__label">
        Services at this counter
      </h2>
      <p className="services-card__value">
        {services.length}
        <span className="services-card__unit">
          {services.length === 1 ? "service" : "services"}
        </span>
      </p>

      {services.length === 0 ? (
        <p className="services-card__empty">This counter does not handle any service.</p>
      ) : (
        <ul className="services-card__list">
          {services.map((service, index) => {
            const meta = getServiceMeta(service, index);
            return (
              <li key={service.id} className="services-card__item">
                <span
                  className="services-card__item-icon"
                  style={{ background: meta.color }}
                  aria-hidden="true"
                >
                  {meta.icon}
                </span>
                <span className="services-card__name">{service.name}</span>
                <span className="services-card__time">{service.processing_time} min</span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default ServicesCard;
