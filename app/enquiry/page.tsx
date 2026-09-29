"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { LangProvider, useI18n } from "../../lib/i18n";
import { PRODUCT_COLORS } from "../../lib/sales";
import SiteNav from "../components/SiteNav";
import SiteFooter from "../components/SiteFooter";
import "./enquiry.css";

function EnquiryForm() {
  const { lang } = useI18n();
  const de = lang === "de";
  const [color, setColor] = useState(PRODUCT_COLORS[0].slug);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorCode, setErrorCode] = useState("");
  const submitting = useRef(false);

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("color");
    if (PRODUCT_COLORS.some((item) => item.slug === requested)) setColor(requested!);
  }, []);

  async function sendEnquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    const data = new FormData(event.currentTarget);
    setStatus("sending");
    setErrorCode("");
    try {
      const response = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(data.get("name") ?? "").trim(),
          email: String(data.get("email") ?? "").trim(),
          message: String(data.get("message") ?? "").trim(),
          website: String(data.get("website") ?? ""),
          color, lang,
        }),
        signal: AbortSignal.timeout(20000),
      });
      const result = await response.json();
      if (!response.ok || result.ok !== true) {
        setErrorCode(result.error ?? "send_failed");
        setStatus("error");
        return;
      }
      setStatus("sent");
    } catch {
      setErrorCode("unconfirmed");
      setStatus("error");
    } finally {
      submitting.current = false;
    }
  }

  return (
    <div data-theme="chromatic">
      <SiteNav />
      <main className="enquiry" data-nav-theme="light">
        <div className="enquiry__intro">
          <a href="/colors">← {de ? "Alle Farben" : "Explore colors"}</a>
          <p className="enquiry__eyebrow">{de ? "Deine Farbe. Bald erhältlich." : "Your color. Coming soon."}</p>
          <h1>{de ? "Bleiben wir in Kontakt." : "Let’s stay in touch."}</h1>
          <p>{de ? "Der Online-Verkauf ist noch nicht geöffnet. Sag uns, welche Farbe dir gefällt — wir informieren dich, sobald du bestellen kannst." : "Online sales aren’t open yet. Tell us which color you love and we’ll let you know when you can order."}</p>
          <p className="enquiry__note">{de ? "Unverbindliche Anfrage · Keine Bestellung · Keine Zahlung" : "No commitment · No order · No payment"}</p>
        </div>
        {status === "sent" ? <section className="enquiry__form" role="status">
          <h2>{de ? "Vielen Dank für dein Interesse!" : "Thanks for your interest!"}</h2>
          <p>{de ? "Deine Anfrage wurde versendet. Wir melden uns per E-Mail, sobald der Verkauf startet." : "Your enquiry has been sent. We’ll email you when sales open."}</p>
          <a href="/colors">{de ? "Farben entdecken" : "Explore colors"} →</a>
        </section> : <form className="enquiry__form" onSubmit={sendEnquiry} aria-busy={status === "sending"}>
          <fieldset disabled={status === "sending"} className="enquiry__fields">
          <div className="enquiry__trap" aria-hidden="true">
            <label htmlFor="enquiry-website">Website</label>
            <input id="enquiry-website" name="website" tabIndex={-1} autoComplete="off" />
          </div>
          <label htmlFor="enquiry-color">{de ? "Deine Farbe" : "Your color"}</label>
          <select id="enquiry-color" name="color" value={color} onChange={(event) => setColor(event.target.value)}>
            {PRODUCT_COLORS.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
          </select>
          <label htmlFor="enquiry-name">{de ? "Name (optional)" : "Name (optional)"}</label>
          <input id="enquiry-name" name="name" autoComplete="name" maxLength={100} />
          <label htmlFor="enquiry-email">{de ? "E-Mail" : "Email"}</label>
          <input id="enquiry-email" name="email" type="email" autoComplete="email" required maxLength={254} />
          <label htmlFor="enquiry-message">{de ? "Nachricht (optional)" : "Message (optional)"}</label>
          <textarea id="enquiry-message" name="message" rows={3} maxLength={600} />
          <p className="enquiry__help">{de ? "Wir verwenden deine Angaben, um deine Anfrage zu beantworten und dich über den Verkaufsstart zu informieren." : "We’ll use your details to respond to your enquiry and let you know when sales open."}</p>
          <button className="enquiry__submit" type="submit">{status === "sending" ? (de ? "Wird gesendet …" : "Sending …") : (de ? "Anfrage senden" : "Send enquiry")} ↗</button>
          </fieldset>
          {status === "error" && <p role="alert">{errorCode === "rate_limited"
            ? (de ? "Zu viele Anfragen. Bitte warte eine Minute und versuche es erneut." : "Too many requests. Please wait a minute and try again.")
            : errorCode === "unconfirmed"
              ? (de ? "Die Bestätigung konnte nicht geladen werden. Deine Anfrage wurde möglicherweise bereits versendet. Bitte warte kurz, bevor du es erneut versuchst." : "We couldn’t load the confirmation. Your enquiry may already have been sent. Please wait before trying again.")
              : (de ? "Die Anfrage konnte gerade nicht versendet werden. Deine Eingaben bleiben erhalten. Bitte versuche es später erneut oder kontaktiere support@coilo.de." : "We couldn’t send your enquiry right now. Your details are still here. Please try again later or contact support@coilo.de.")}</p>}
          <a className="enquiry__privacy" href={`https://shop.coilo.de${de ? "/de" : ""}/policies/privacy-policy`} target="_blank" rel="noopener noreferrer">{de ? "Datenschutzerklärung" : "Privacy policy"}</a>
        </form>}
      </main>
      <SiteFooter theme="light" />
    </div>
  );
}

export default function EnquiryPage() {
  return <LangProvider><EnquiryForm /></LangProvider>;
}
