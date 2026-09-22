import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  user: {
    modelName: "utente",
    fields: { name: "nome" },
    additionalFields: {
      ruolo: {
        type: ["OPERATORE", "ADMIN", "SUPER_ADMIN"],
        required: false,
        input: false,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24
  },
  emailAndPassword: { enabled: true },
});
