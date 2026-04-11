import { useNavigate } from 'react-router-dom'

export default function Datenschutz() {
  const navigate = useNavigate()

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #162535 0%, #1B3045 50%, #1E3A56 100%)',
      padding: '40px 24px', display: 'flex', justifyContent: 'center',
    }}>
      <div style={{ maxWidth: 720, width: '100%' }}>
        <button className="btn btn-ghost" style={{ marginBottom: 24 }} onClick={() => navigate(-1)}>
          ← Zurück
        </button>

        <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
          Datenschutzerklärung
        </div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 32 }}>
          Stand: April 2026 · Letzschwamm Schwimmschule Luxemburg
        </div>

        {[
          {
            title: '1. Verantwortlicher',
            content: 'Verantwortlich für die Verarbeitung Ihrer personenbezogenen Daten ist die Letzschwamm Schwimmschule Luxemburg (nachfolgend „wir" oder „uns"). Kontakt per E-Mail über das Schulbüro.',
          },
          {
            title: '2. Welche Daten wir erheben',
            content: 'Wir erheben folgende Daten zur Durchführung des Schwimmunterrichts:\n• Name und Vorname des Kindes / Teilnehmers\n• Geburtsdatum\n• E-Mail-Adresse der Eltern / des Erziehungsberechtigten\n• Zahlungsdaten (werden ausschließlich über Stripe verarbeitet)\n• Fortschrittsdaten des Schwimmunterrichts (erfüllte Kriterien)',
          },
          {
            title: '3. Zweck der Verarbeitung',
            content: 'Ihre Daten werden ausschließlich für folgende Zwecke verwendet:\n• Verwaltung der Schwimmkurse und Teilnehmer\n• Abwicklung der Zahlungen\n• Kommunikation mit Eltern über den Lernfortschritt\n• Ausstellung des digitalen Schwimmabzeichens',
          },
          {
            title: '4. Cookies',
            content: 'Wir verwenden ausschließlich technisch notwendige Cookies für den Betrieb der Anwendung (Anmeldesession). Es werden keine Tracking- oder Werbe-Cookies eingesetzt.',
          },
          {
            title: '5. Weitergabe an Dritte',
            content: 'Zahlungen werden über Stripe Inc. abgewickelt. Stripe ist PCI-DSS-zertifiziert. Weitere Daten werden nicht an Dritte weitergegeben, außer wenn dies gesetzlich vorgeschrieben ist.',
          },
          {
            title: '6. Speicherdauer',
            content: 'Ihre Daten werden so lange gespeichert, wie Ihr Kind an unseren Kursen teilnimmt, zuzüglich der gesetzlich vorgeschriebenen Aufbewahrungsfristen.',
          },
          {
            title: '7. Ihre Rechte',
            content: 'Sie haben das Recht auf:\n• Auskunft über Ihre gespeicherten Daten (Art. 15 DSGVO)\n• Berichtigung unrichtiger Daten (Art. 16 DSGVO)\n• Löschung Ihrer Daten (Art. 17 DSGVO)\n• Datenübertragbarkeit (Art. 20 DSGVO)\n\nBitte kontaktieren Sie uns per E-Mail für entsprechende Anfragen.',
          },
          {
            title: '8. Impressum',
            content: 'Letzschwamm Schwimmschule Luxemburg\nRegistriert in Luxemburg\nFLNS-anerkannte Schwimmschule\n\nFür Anfragen und Beschwerden wenden Sie sich bitte an uns per E-Mail.',
          },
        ].map(({ title, content }) => (
          <div key={title} style={{
            background: 'rgba(255,255,255,.06)', border: '1px solid rgba(144,220,240,.15)',
            borderRadius: 14, padding: 24, marginBottom: 16,
          }}>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700, marginBottom: 10, color: 'var(--aqua)' }}>
              {title}
            </div>
            <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
              {content}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
