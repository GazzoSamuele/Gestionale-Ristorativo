import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "../../../src/lib/auth";

export default async function LoginLayout({ children }: { children: React.ReactNode }) {

  const sessione = await auth.api.getSession({ 
    headers: await headers() 
  })

  if (sessione) {                                   
    if (sessione.user.ruolo === "SUPER_ADMIN") {     
        redirect("/titolare");
    } else {
        redirect("/operatore");
    }
    }
  
    return <>{children}</>;
}
