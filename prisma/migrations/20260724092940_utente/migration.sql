-- CreateEnum
CREATE TYPE "RuoloUtente" AS ENUM ('OPERATORE', 'ADMIN', 'SUPER_ADMIN');

-- AlterTable
ALTER TABLE "Ordine" ADD COLUMN     "creatoDaId" TEXT;

-- CreateTable
CREATE TABLE "Utente" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ruolo" "RuoloUtente" NOT NULL DEFAULT 'OPERATORE',

    CONSTRAINT "Utente_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Ordine" ADD CONSTRAINT "Ordine_creatoDaId_fkey" FOREIGN KEY ("creatoDaId") REFERENCES "Utente"("id") ON DELETE SET NULL ON UPDATE CASCADE;
