import type { Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "Privacy | Gestionale Ristorativo",
  robots: { index: false },
};

export default function PrivacyPage() {
  return (
    <main className={styles.schermata}>
      <article className={styles.contenuto}>
        <Link className={styles.indietro} href="/login">
          ← Torna al gestionale
        </Link>
        <h1 className={styles.titolo}>Informativa privacy</h1>
        <p className={styles.aggiornato}>Ultimo aggiornamento: 3 ottobre 2026</p>

        <p className={styles.riquadro}>
          Gestionale Ristorativo è un <strong>progetto dimostrativo personale</strong>, pubblicato
          come parte del mio portfolio. È una <strong>demo pubblica</strong>: si entra con account
          di prova condivisi e tutti i dati (tavoli, prenotazioni, clienti, ordini, personale) sono{" "}
          <strong>inventati e visibili a tutti i visitatori</strong>. Non inserire dati personali
          reali. Non ha scopi commerciali, non mostra pubblicità e non usa strumenti di statistica o
          di profilazione.
        </p>

        <h2>Titolare del trattamento</h2>
        <p>
          Samuele Gazzo — email:{" "}
          <a href="mailto:samuelegazzo69@gmail.com">samuelegazzo69@gmail.com</a>
        </p>

        <h2>Quali dati vengono trattati</h2>
        <ul>
          <li>
            <strong>Dati tecnici di navigazione</strong>: indirizzo IP, tipo di browser, data e ora
            delle richieste, registrati automaticamente nei log del servizio di hosting.
          </li>
          <li>
            <strong>Dati di accesso</strong>: quando entri con un account di prova, la sessione
            salvata nel database registra anche l&apos;indirizzo IP e il tipo di browser, come
            misura di sicurezza. La sessione dura al massimo 30 giorni.
          </li>
          <li>
            <strong>Dati che inserisci nella demo</strong>: ordini, prenotazioni, schede clienti,
            note. Sono condivisi con tutti i visitatori: usa solo dati di fantasia.
          </li>
        </ul>

        <h2>Cookie</h2>
        <p>
          Dopo il login il sito usa <strong>un solo cookie tecnico</strong>, quello della sessione,
          necessario per restare connesso. Non ci sono cookie di statistica, di profilazione o di
          terze parti, quindi non serve alcun consenso. Puoi cancellarlo uscendo dall&apos;account
          o dalle impostazioni del browser.
        </p>

        <h2>Perché vengono trattati</h2>
        <p>
          Per far funzionare la demo e garantirne la sicurezza (legittimo interesse, art. 6.1.f
          GDPR).
        </p>

        <h2>Chi tratta i dati per conto del titolare</h2>
        <ul>
          <li>
            <strong>Vercel Inc.</strong> — hosting del sito (server a Francoforte).
          </li>
          <li>
            <strong>Neon</strong> — database PostgreSQL (server a Francoforte).
          </li>
        </ul>
        <p>
          Questi fornitori hanno sede negli Stati Uniti: eventuali trasferimenti avvengono con le
          garanzie previste dal GDPR (EU-US Data Privacy Framework o clausole contrattuali
          standard). I caratteri tipografici sono ospitati sul sito stesso: aprendo il gestionale
          il tuo browser non contatta Google.
        </p>

        <h2>Per quanto tempo</h2>
        <p>
          Il database della demo viene riportato periodicamente allo stato iniziale: in quel
          momento i dati inseriti dai visitatori vengono cancellati. Le sessioni scadono dopo 30
          giorni. I log tecnici vengono conservati per i tempi previsti dal servizio di hosting.
        </p>

        <h2>I tuoi diritti</h2>
        <p>
          Puoi chiedere in qualsiasi momento di accedere ai tuoi dati, correggerli, cancellarli,
          limitarne il trattamento, opporti o riceverli in un formato leggibile (artt. 15-22 GDPR),
          scrivendo all&apos;email del titolare. Hai anche il diritto di presentare reclamo al{" "}
          <a href="https://www.garanteprivacy.it" rel="noopener">
            Garante per la protezione dei dati personali
          </a>
          .
        </p>
      </article>
    </main>
  );
}
