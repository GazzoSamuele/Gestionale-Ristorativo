import NavPrincipale from "./_components/NavPrincipale";
import SottoSchede from "./_components/SottoSchedeNavbar";
import { headers } from "next/headers";
import styles from "./style-layout.module.scss";
import { auth } from "../../../src/lib/auth";
import Tesserino from "@/components/tesserino";

export const dynamic = "force-dynamic";

export default async function OperatoreLayout({ children }: { children: React.ReactNode }) {

  const sessione = await auth.api.getSession({ 
      headers: await headers() 
    })

  return (
    <div className={styles.area}>
      <Tesserino nome={sessione?.user.name ?? null} ruolo={sessione?.user.ruolo ?? null} />

      <main className={styles.contenuto}>{children}</main>

      <SottoSchede />
      <NavPrincipale />

    </div>
  );
}
