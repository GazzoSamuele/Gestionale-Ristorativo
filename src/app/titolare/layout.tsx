import NavPrincipale from "./_components/NavPrincipale";
import styles from "./style-layout.module.scss";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "../../../src/lib/auth";
import Tesserino from "@/components/tesserino";

export default async function TitolareLayout({ children }: { children: React.ReactNode }) {

  const sessione = await auth.api.getSession({ 
    headers: await headers() 
  })

  if (!sessione){
    redirect("/login")
  }

  if (sessione.user.ruolo !== "SUPER_ADMIN"){
    redirect("/operatore")
  }
  
  return (
    <div className={styles.area}>
      <Tesserino
        nome={sessione.user.name}
        ruolo={sessione.user.ruolo}
        puoUscire={true}
      />

      <main className={styles.contenuto}>{children}</main>

      <NavPrincipale />

    </div>
  );
}
