import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function leggiSessione() {
  return auth.api.getSession({ headers: await headers() });
}

export async function eTitolare() {
  const sessione = await leggiSessione();
  return sessione?.user.ruolo === "SUPER_ADMIN";
}
