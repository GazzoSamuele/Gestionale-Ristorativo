-- CreateTable
CREATE TABLE "Segnalazione" (
    "id" TEXT NOT NULL,
    "testo" TEXT NOT NULL,
    "utenteId" TEXT NOT NULL,
    "creatoIl" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "letta" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Segnalazione_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Segnalazione" ADD CONSTRAINT "Segnalazione_utenteId_fkey" FOREIGN KEY ("utenteId") REFERENCES "Utente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
