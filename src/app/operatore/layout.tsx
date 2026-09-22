import NavPrincipale from "./_components/NavPrincipale";
import SottoSchede from "./_components/SottoSchedeNavbar";
import { headers } from "next/headers";
import styles from "./style-layout.module.scss";
import { auth } from "../../../src/lib/auth";
import Tesserino from "@/components/tesserino";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function OperatoreLayout({ children }: { children: React.ReactNode }) {

  const sessione = await auth.api.getSession({ 
      headers: await headers() 
    })

    if (!sessione){
      redirect("/login")
    }

  return (
    <div className={styles.area}>
      <Tesserino
        nome={sessione.user.name}
        ruolo={sessione.user.ruolo ?? null}
        puoUscire={sessione.user.ruolo !== "OPERATORE"}
      />

      <main className={styles.contenuto}>{children}</main>

      <SottoSchede />
      <NavPrincipale />

    </div>
  );
}
