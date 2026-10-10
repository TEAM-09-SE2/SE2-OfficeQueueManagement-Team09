import { useCallback, useState } from "react";
import Logo from "../Logo";
import ServiceCard from "./ServiceCard";
import TicketConfirmation from "./TicketConfirmation";
import { getServiceMeta } from "../../pages/kiosk/serviceMeta";
import { services } from "../../pages/services";
import "./KioskPage.css";

function KioskPage() {
  const [selection, setSelection] = useState(null);

  function handleSelect(service) {
    // TODO: replace with POST /api/tickets { id_service: service.id }
    // and use the ticket returned by the API.
    const ticket = { code: "A000", id_service: service.id, status: "WAITING" };
    setSelection({ ticket, serviceName: service.name });
  }

  const handleDone = useCallback(() => setSelection(null), []);

  return (
    <main className="kiosk">
      <Logo />

      {selection ? (
        <TicketConfirmation
          ticket={selection.ticket}
          serviceName={selection.serviceName}
          onDone={handleDone}
        />
      ) : (
        <>
          <h1 className="kiosk__title">Welcome to Our Office</h1>
          <p className="kiosk__subtitle">
            Select a service below to take your ticket and join the queue.
          </p>

          <div className="kiosk__services">
            {services.map((service, index) => (
              <ServiceCard
                key={service.id}
                service={service}
                meta={getServiceMeta(service, index)}
                onSelect={handleSelect}
              />
            ))}
          </div>
        </>
      )}
    </main>
  );
}

export default KioskPage;
