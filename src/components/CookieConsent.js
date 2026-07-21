import React, { useState, useEffect, useRef } from "react";
import { Button, Modal } from "react-bootstrap";

const CookieConsent = () => {
  const [showModal, setShowModal] = useState(false);
  const [showCookieConsent, setShowCookieConsent] = useState(false);
  const messageReceivedRef = useRef(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");

    const handleMessage = (event) => {
      if (event.data?.type === "HIDE_COOKIES_BANNER") {
        messageReceivedRef.current = true;
      }
    };

    window.addEventListener("message", handleMessage);

    if (!consent) {
      setTimeout(() => {
        if (!messageReceivedRef.current) {
          setShowCookieConsent(true);
        }
      }, 1200);
    }

    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setShowCookieConsent(false);
    console.log("Cookie accettati!");
  };

  const handleEssentialOnly = () => {
    localStorage.setItem("cookie-consent", "essential-only");
    setShowCookieConsent(false);
    console.log("Solo cookie essenziali accettati.");
  };

  const handleShowPrivacy = () => {
    setShowModal(true);
  };

  const handleClosePrivacy = () => {
    setShowModal(false);
  };

  return (
    <>
      {showCookieConsent && (
        <Modal
          show={showCookieConsent}
          backdrop="static"
          keyboard={false}
          centered
        >
          <Modal.Header>
            <Modal.Title>Preferenze Cookie</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Questo sito utilizza cookie per migliorare l'esperienza utente.
            Puoi scegliere di accettare tutti i cookie o solo quelli essenziali.
            <br />
            <br />
            <button
              type="button"
              onClick={handleShowPrivacy}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                color: "#f1d600",
                textDecoration: "underline",
                cursor: "pointer"
              }}
            >
              Leggi la nostra Informativa sulla Privacy
            </button>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleEssentialOnly}>
              Solo Essenziali
            </Button>
            <Button variant="warning" onClick={handleAcceptAll}>
              Accetta Tutti
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      <Modal
        show={showModal}
        onHide={handleClosePrivacy}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Informativa sulla Privacy</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h3>1. Titolare del Trattamento</h3>
          <p>
            <strong>Nome:</strong> Giampiero Barbaro<br />
            <strong>Email:</strong> giampiero12345678@hotmail.it<br />
          </p>

          <h3>2. Tipi di Dati Raccolti</h3>
          <ul>
            <li>Dati di navigazione (indirizzo IP, tipo di browser, pagine visitate)</li>
            <li>Dati forniti volontariamente (es. contatto via email o form)</li>
            <li>Cookie tecnici e, previo consenso, cookie analitici</li>
          </ul>

          <h3>3. Finalità del Trattamento</h3>
          <ul>
            <li>Consentire il funzionamento tecnico del sito</li>
            <li>Rispondere a richieste da parte degli utenti</li>
            <li>Analisi statistica del traffico (solo previo consenso)</li>
          </ul>

          <h3>4. Cookie</h3>
          <p>
            Questo sito utilizza cookie tecnici essenziali. I cookie di terze
            parti (es. Google Analytics) sono utilizzati solo se l’utente fornisce
            il consenso.
          </p>

          <h3>5. Modalità del Trattamento</h3>
          <p>
            I dati sono trattati con strumenti elettronici nel rispetto delle misure
            di sicurezza previste dalla normativa.
          </p>

          <h3>6. Conservazione dei Dati</h3>
          <p>
            I dati saranno conservati per il tempo necessario a soddisfare le
            finalità indicate, o fino a eventuale richiesta di cancellazione.
          </p>

          <h3>7. Diritti dell’Interessato</h3>
          <ul>
            <li>Diritto di accesso ai dati</li>
            <li>Diritto di rettifica o cancellazione</li>
            <li>Diritto di limitazione o opposizione al trattamento</li>
            <li>Diritto alla portabilità dei dati</li>
            <li>Diritto di revoca del consenso</li>
          </ul>

          <h3>8. Modifiche all’Informativa</h3>
          <p>
            L’informativa può essere aggiornata in qualsiasi momento. Si consiglia
            di consultarla periodicamente.
          </p>

          <p>Ultimo aggiornamento: 9 maggio 2025</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClosePrivacy}>
            Chiudi
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CookieConsent;