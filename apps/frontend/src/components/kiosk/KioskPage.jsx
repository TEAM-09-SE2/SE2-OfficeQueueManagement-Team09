import { useCallback, useEffect, useState } from "react";
import { getServices } from "../../api/services";
import { createTicket } from "../../api/tickets";
import Logo from "../Logo";
import ServiceCard from "./ServiceCard";
import TicketConfirmation from "./TicketConfirmation";
import { getServiceMeta } from "../../pages/kiosk/serviceMeta";
import "./KioskPage.css";

function KioskPage() {
  const [services, setServices] = useState([]);
  // loading | ready | error
  const [loadStatus, setLoadStatus] = useState("loading");
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [selection, setSelection] = useState(null);
  const [issuing, setIssuing] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setLoadStatus("loading");
    getServices(controller.signal)
      .then((allServices) => {
        // A service that no counter handles cannot issue tickets: hide it.
        setServices(allServices.filter((s) => s.counter_list.length > 0));
        setLoadStatus("ready");
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setLoadStatus("error");
        }
      });
    return () => controller.abort();
  }, [loadAttempt]);

  async function handleSelect(service) {
    setIssuing(true);
    setMessage("");
    try {
      const ticket = await createTicket(service.id);
      setSelection({ ticket, serviceName: service.name });
    } catch (err) {
      setMessage(err.message);
    } finally {
      setIssuing(false);
    }
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

          {loadStatus === "loading" && (
            <p className="kiosk__message">Loading services…</p>
          )}
          {loadStatus === "error" && (
            <>
              <p className="kiosk__message" role="alert">
                Services are not available right now.
              </p>
              <button
                type="button"
                className="kiosk__retry"
                onClick={() => setLoadAttempt((attempt) => attempt + 1)}
              >
                Try again
              </button>
            </>
          )}
          {message && (
            <p className="kiosk__message" role="alert">
              {message}
            </p>
          )}

          <div className="kiosk__services">
            {services.map((service, index) => (
              <ServiceCard
                key={service.id}
                service={service}
                meta={getServiceMeta(service, index)}
                disabled={issuing}
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
