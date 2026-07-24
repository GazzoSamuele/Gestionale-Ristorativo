-- CreateEnum
CREATE TYPE "UnitaMisura" AS ENUM ('KG', 'L', 'PZ');

-- CreateTable
CREATE TABLE "Presenza" (
    "id" TEXT NOT NULL,
    "utenteId" TEXT NOT NULL,
    "arrivoAlle" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Presenza_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prodotto" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "quantita" DECIMAL(10,2) NOT NULL,
    "limiteMinimo" DECIMAL(10,2) NOT NULL,
    "unita" "UnitaMisura" NOT NULL,
    "fornitore" TEXT,
    "immagine" TEXT,

    CONSTRAINT "Prodotto_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Presenza" ADD CONSTRAINT "Presenza_utenteId_fkey" FOREIGN KEY ("utenteId") REFERENCES "Utente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
